import logging
import asyncio
from datetime import datetime, timezone
import httpx
from backend.db import db

logger = logging.getLogger("hn_scraper")
logging.basicConfig(level=logging.INFO)

API_URL = "https://hn.algolia.com/api/v1/search"

async def fetch_hn_stories(query: str):
    logger.info(f"Fetching HN stories for query: {query}")
    params = {
        "query": query,
        "tags": "story",
        "hitsPerPage": 30
    }
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        return data.get("hits", [])

async def scrape_hn():
    if not db.is_connected():
        await db.connect()
        
    queries = ["startup india", "Show HN"]
    all_hits = []
    
    for q in queries:
        try:
            hits = await fetch_hn_stories(q)
            all_hits.extend(hits)
        except Exception as e:
            logger.error(f"Error fetching HN stories for query '{q}': {e}")
            
    count = 0
    for hit in all_hits:
        title = hit.get("title")
        object_id = hit.get("objectID")
        
        if not title or not object_id:
            continue
            
        # Build HN discussion URL as the canonical source
        hn_url = f"https://news.ycombinator.com/item?id={object_id}"
        upvotes = hit.get("points") or 0
        
        # Determine launched_at from created_at_i or created_at
        created_at_i = hit.get("created_at_i")
        if created_at_i:
            launched_at = datetime.fromtimestamp(created_at_i, tz=timezone.utc)
        else:
            launched_at = datetime.now(timezone.utc)
            
        # Short description (can just be a summary or snippet if available)
        story_text = hit.get("story_text") or ""
        # Clean HTML from story_text if present
        description = re_clean_html(story_text) if story_text else "Hacker News launch discussion."
        
        try:
            await db.launch.upsert(
                where={"url": hn_url},
                data={
                    "create": {
                        "title": title,
                        "description": description[:200],
                        "url": hn_url,
                        "source": "hn",
                        "upvotes": upvotes,
                        "launchedAt": launched_at,
                    },
                    "update": {
                        "title": title,
                        "description": description[:200],
                        "upvotes": upvotes,
                        "launchedAt": launched_at,
                    }
                }
            )
            count += 1
        except Exception as e:
            logger.error(f"Failed to save HN launch {hn_url} to DB: {e}")
            
    logger.info(f"Successfully scraped {count} launches from Hacker News")

def re_clean_html(raw_html):
    if not raw_html:
        return ""
    import re
    import html
    clean_text = re.sub(r'<[^>]*>', '', raw_html)
    clean_text = html.unescape(clean_text)
    return re.sub(r'\s+', ' ', clean_text).strip()

if __name__ == "__main__":
    async def main():
        await db.connect()
        try:
            await scrape_hn()
        finally:
            await db.disconnect()
            
    asyncio.run(main())
