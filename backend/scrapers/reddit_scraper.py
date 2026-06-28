import os
import logging
import asyncio
from datetime import datetime, timezone
import httpx
from backend.db import db

logger = logging.getLogger("reddit_scraper")
logging.basicConfig(level=logging.INFO)

SUBREDDITS = ["IndiaStartups", "startups", "india"]
STARTUP_KEYWORDS = ["startup", "funding", "accelerator", "founder", "incubator", "vc", "angel", "seed round"]

async def get_reddit_token(client_id: str, client_secret: str) -> str:
    url = "https://www.reddit.com/api/v1/access_token"
    auth = httpx.BasicAuth(client_id, client_secret)
    headers = {"User-Agent": "python:stackd.aggregator:v1.0.0 (by /u/stackd_aggregator)"}
    data = {"grant_type": "client_credentials"}
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(url, auth=auth, data=data, headers=headers)
        response.raise_for_status()
        token_data = response.json()
        return token_data.get("access_token")

async def fetch_subreddit_posts(token: str, subreddit: str):
    url = f"https://oauth.reddit.com/r/{subreddit}/top"
    headers = {
        "Authorization": f"Bearer {token}",
        "User-Agent": "python:stackd.aggregator:v1.0.0 (by /u/stackd_aggregator)"
    }
    params = {"t": "week", "limit": 20}
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        return data.get("data", {}).get("children", [])

async def scrape_reddit():
    client_id = os.environ.get("REDDIT_CLIENT_ID")
    client_secret = os.environ.get("REDDIT_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        logger.info("REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET not set. Skipping Reddit scraper.")
        return []
        
    if not db.is_connected():
        await db.connect()
        
    try:
        token = await get_reddit_token(client_id, client_secret)
        if not token:
            logger.error("Failed to obtain Reddit OAuth access token.")
            return []
    except Exception as e:
        logger.error(f"Reddit auth failed: {e}")
        return []
        
    count = 0
    for sub in SUBREDDITS:
        try:
            posts = await fetch_subreddit_posts(token, sub)
            for post in posts:
                data = post.get("data", {})
                title = data.get("title")
                permalink = data.get("permalink")
                score = data.get("score") or 0
                created_utc = data.get("created_utc")
                selftext = data.get("selftext") or ""
                url = data.get("url") or f"https://www.reddit.com{permalink}"
                
                if not title or not permalink:
                    continue
                    
                # If scraping r/india, filter for startup related posts
                if sub == "india":
                    title_lower = title.lower()
                    selftext_lower = selftext.lower()
                    if not any(kw in title_lower or kw in selftext_lower for kw in STARTUP_KEYWORDS):
                        continue
                        
                published_at = datetime.fromtimestamp(created_utc, tz=timezone.utc) if created_utc else datetime.now(timezone.utc)
                reddit_url = f"https://www.reddit.com{permalink}"
                summary = selftext[:300] if selftext else f"Reddit discussion in r/{sub}."
                
                try:
                    await db.article.upsert(
                        where={"url": reddit_url},
                        data={
                            "create": {
                                "title": title,
                                "url": reddit_url,
                                "summary": summary,
                                "source": "reddit",
                                "publishedAt": published_at,
                                "tags": [sub.lower(), "reddit"],
                            },
                            "update": {
                                "title": title,
                                "summary": summary,
                                "publishedAt": published_at,
                            }
                        }
                    )
                    count += 1
                except Exception as e:
                    logger.error(f"Failed to save Reddit post {reddit_url} to DB: {e}")
                    
        except Exception as e:
            logger.error(f"Error scraping r/{sub}: {e}")
            
    logger.info(f"Successfully scraped {count} articles/posts from Reddit")

if __name__ == "__main__":
    async def main():
        await db.connect()
        try:
            await scrape_reddit()
        finally:
            await db.disconnect()
            
    asyncio.run(main())
