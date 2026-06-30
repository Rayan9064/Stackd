import os
import logging
import asyncio
from datetime import datetime, timezone
import httpx
from backend.db import db

logger = logging.getLogger("reddit_fetcher")
logging.basicConfig(level=logging.INFO)

SUBREDDITS = ["startups", "entrepreneur", "SideProject", "venturecapital", "IndieHackers"]

async def get_reddit_token(client_id: str, client_secret: str) -> str:
    url = "https://www.reddit.com/api/v1/access_token"
    auth = httpx.BasicAuth(client_id, client_secret)
    data = {"grant_type": "client_credentials"}
    headers = {"User-Agent": "StackdAggregator/1.0.0"}
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(url, auth=auth, data=data, headers=headers)
        response.raise_for_status()
        return response.json().get("access_token")

async def fetch_subreddit_posts(subreddit: str, token: str = None):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
    
    if token:
        url = f"https://oauth.reddit.com/r/{subreddit}/top"
        headers["Authorization"] = f"bearer {token}"
        params = {"t": "week", "limit": 10}
    else:
        url = f"https://www.reddit.com/r/{subreddit}/top.json"
        params = {"t": "week", "limit": 10}
        
    logger.info(f"Fetching posts from r/{subreddit}...")
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        return data.get("data", {}).get("children", [])

async def scrape_reddit():
    if not db.is_connected():
        await db.connect()
        
    client_id = os.environ.get("REDDIT_CLIENT_ID")
    client_secret = os.environ.get("REDDIT_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        logger.info("REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET is not set. Skipping Reddit fetcher.")
        return []

    token = None
    try:
        token = await get_reddit_token(client_id, client_secret)
        logger.info("Reddit OAuth token obtained successfully.")
    except Exception as e:
        logger.warning(f"Failed to obtain Reddit token: {e}. Skipping Reddit fetcher.")
        return []
            
    count = 0
    for sub in SUBREDDITS:
        try:
            posts = await fetch_subreddit_posts(sub, token)
            for post in posts:
                data = post.get("data", {})
                title = data.get("title")
                permalink = data.get("permalink")
                
                if not title or not permalink:
                    continue
                    
                post_url = f"https://www.reddit.com{permalink}"
                external_url = data.get("url") or post_url
                selftext = data.get("selftext") or ""
                summary = selftext[:300] if selftext else f"Reddit discussion in r/{sub}."
                created_utc = data.get("created_utc")
                published_at = datetime.fromtimestamp(created_utc, tz=timezone.utc) if created_utc else datetime.now(timezone.utc)
                
                tags_list = ["reddit", sub]
                
                try:
                    await db.article.upsert(
                        where={"url": post_url},
                        data={
                            "create": {
                                "title": title,
                                "url": post_url,
                                "summary": summary,
                                "source": f"reddit/r/{sub}",
                                "sourceUrl": post_url,
                                "geography": "Global",
                                "tags": tags_list,
                                "publishedAt": published_at
                            },
                            "update": {
                                "title": title,
                                "summary": summary,
                                "tags": tags_list,
                                "publishedAt": published_at
                            }
                        }
                    )
                    count += 1
                except Exception as e:
                    # SQLite fallback for tags list
                    try:
                        await db.article.upsert(
                            where={"url": post_url},
                            data={
                                "create": {
                                    "title": title,
                                    "url": post_url,
                                    "summary": summary,
                                    "source": f"reddit/r/{sub}",
                                    "sourceUrl": post_url,
                                    "geography": "Global",
                                    "tags": ",".join(tags_list),
                                    "publishedAt": published_at
                                },
                                "update": {
                                    "title": title,
                                    "summary": summary,
                                    "tags": ",".join(tags_list),
                                    "publishedAt": published_at
                                }
                            }
                        )
                        count += 1
                    except Exception as ex:
                        logger.error(f"Failed to save Reddit post {post_url}: {ex}")
        except Exception as e:
            logger.error(f"Error scraping r/{sub}: {e}")
            
    logger.info(f"Successfully processed {count} Reddit posts.")

if __name__ == "__main__":
    async def main():
        await db.connect()
        try:
            await scrape_reddit()
        finally:
            await db.disconnect()
    asyncio.run(main())
