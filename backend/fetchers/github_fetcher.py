import os
import logging
import asyncio
from datetime import datetime, timezone, timedelta
import httpx
from backend.db import db

logger = logging.getLogger("github_fetcher")
logging.basicConfig(level=logging.INFO)

TOPICS = ["startup", "saas", "open-source"]

async def fetch_github_repos(topic: str, date_since: str, token: str = None):
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "StackdAggregator/1.0.0"
    }
    if token:
        headers["Authorization"] = f"token {token}"
        
    url = "https://api.github.com/search/repositories"
    # Query: created in last 30 days, has specific topic, sort by stars
    q = f"topic:{topic} created:>{date_since}"
    params = {
        "q": q,
        "sort": "stars",
        "order": "desc",
        "per_page": 20
    }
    
    logger.info(f"Querying GitHub search for '{q}'...")
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=headers, params=params)
        
        # If rate limited, log and return empty
        if response.status_code == 403:
            logger.warning("GitHub API rate limit exceeded or access forbidden. Check token.")
            return []
            
        response.raise_for_status()
        return response.json().get("items", [])

async def scrape_github():
    if not db.is_connected():
        await db.connect()
        
    token = os.environ.get("GITHUB_TOKEN")
    
    # Calculate date 30 days ago
    date_since = (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%d")
    
    count = 0
    all_repos = {}
    
    for topic in TOPICS:
        try:
            items = await fetch_github_repos(topic, date_since, token)
            for item in items:
                repo_url = item.get("html_url")
                if repo_url:
                    all_repos[repo_url] = item
            # Avoid hitting GitHub API rate limits rapidly
            await asyncio.sleep(2)
        except Exception as e:
            logger.error(f"Error fetching repos for topic {topic}: {e}")
            
    for repo_url, item in all_repos.items():
        name = item.get("name")
        description = item.get("description") or ""
        stars = item.get("stargazers_count") or 0
        language = item.get("language") or "TypeScript"
        topics = item.get("topics") or []
        owner = item.get("owner", {}).get("login") or "unknown"
        
        if not name or not repo_url:
            continue
            
        try:
            await db.githubrepo.upsert(
                where={"url": repo_url},
                data={
                    "create": {
                        "name": name,
                        "description": description[:300],
                        "url": repo_url,
                        "stars": stars,
                        "language": language,
                        "topics": topics,
                        "owner": owner
                    },
                    "update": {
                        "name": name,
                        "description": description[:300],
                        "stars": stars,
                        "language": language,
                        "topics": topics,
                        "owner": owner,
                        "fetchedAt": datetime.now(timezone.utc)
                    }
                }
            )
            count += 1
        except Exception as e:
            # Handle SQLite list array error
            try:
                await db.githubrepo.upsert(
                    where={"url": repo_url},
                    data={
                        "create": {
                            "name": name,
                            "description": description[:300],
                            "url": repo_url,
                            "stars": stars,
                            "language": language,
                            "topics": ",".join(topics),
                            "owner": owner
                        },
                        "update": {
                            "name": name,
                            "description": description[:300],
                            "stars": stars,
                            "language": language,
                            "topics": ",".join(topics),
                            "owner": owner,
                            "fetchedAt": datetime.now(timezone.utc)
                        }
                    }
                )
                count += 1
            except Exception as ex:
                logger.error(f"Failed to save GitHub repo {repo_url}: {ex}")
                
    logger.info(f"Successfully processed {count} GitHub repositories.")

if __name__ == "__main__":
    async def main():
        await db.connect()
        try:
            await scrape_github()
        finally:
            await db.disconnect()
    asyncio.run(main())
