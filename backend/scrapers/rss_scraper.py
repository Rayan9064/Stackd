import re
import html
import logging
import asyncio
from datetime import datetime, timezone
import time
import feedparser
from backend.db import db

logger = logging.getLogger("rss_scraper")
logging.basicConfig(level=logging.INFO)

FEEDS = {
    "inc42": "https://inc42.com/feed/",
    "yourstory": "https://yourstory.com/feed",
    "techcrunch": "https://techcrunch.com/tag/india/feed/"
}

def clean_html(raw_html):
    if not raw_html:
        return ""
    # Strip HTML tags
    clean_text = re.sub(r'<[^>]*>', '', raw_html)
    # Decode HTML entities like &amp; &lt; etc.
    clean_text = html.unescape(clean_text)
    # Normalize whitespaces
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    return clean_text[:300]

def parse_published_date(entry):
    # Try to parse publication date using published_parsed struct
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        try:
            return datetime.fromtimestamp(time.mktime(entry.published_parsed), tz=timezone.utc)
        except Exception:
            pass
    return datetime.now(timezone.utc)

async def scrape_feed(source: str, url: str):
    logger.info(f"Starting scrape for feed: {source} ({url})")
    try:
        # Run feedparser.parse in a separate thread since it is CPU/IO blocking
        feed = await asyncio.to_thread(feedparser.parse, url)
        
        if feed.bozo and not feed.entries:
            logger.warning(f"Feedparser flagged potential issues parsing {source}: {feed.bozo_exception}")
            
        count = 0
        for entry in feed.entries:
            title = getattr(entry, "title", "").strip()
            link = getattr(entry, "link", "").strip()
            
            if not title or not link:
                continue
                
            summary_content = getattr(entry, "summary", "")
            if not summary_content and hasattr(entry, "description"):
                summary_content = entry.description
            if not summary_content and hasattr(entry, "content"):
                summary_content = entry.content[0].value if entry.content else ""
                
            summary = clean_html(summary_content)
            published_at = parse_published_date(entry)
            
            # Extract tags if any
            tags = []
            if hasattr(entry, "tags"):
                tags = [t.term for t in entry.tags if hasattr(t, "term") and t.term]
            
            try:
                # Store or update the article
                await db.article.upsert(
                    where={"url": link},
                    data={
                        "create": {
                            "title": title,
                            "url": link,
                            "summary": summary,
                            "source": source,
                            "publishedAt": published_at,
                            "tags": tags,
                        },
                        "update": {
                            "title": title,
                            "summary": summary,
                            "publishedAt": published_at,
                            "tags": tags,
                        }
                    }
                )
                count += 1
            except Exception as e:
                logger.error(f"Failed to save article {link} to DB: {e}")
                
        logger.info(f"Successfully scraped {count} articles from {source}")
    except Exception as e:
        logger.error(f"Error scraping feed {source}: {e}")

async def scrape_rss():
    if not db.is_connected():
        await db.connect()
    
    tasks = [scrape_feed(source, url) for source, url in FEEDS.items()]
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    # Test script locally
    async def main():
        await db.connect()
        try:
            await scrape_rss()
        finally:
            await db.disconnect()
            
    asyncio.run(main())
