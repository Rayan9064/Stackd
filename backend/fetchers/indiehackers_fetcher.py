import re
import html
import logging
import asyncio
from datetime import datetime, timezone
import time
import feedparser
from backend.db import db

logger = logging.getLogger("indiehackers_fetcher")
logging.basicConfig(level=logging.INFO)

FEED_URL = "https://www.indiehackers.com/feed.xml"

def clean_html(raw_html):
    if not raw_html:
        return ""
    clean_text = re.sub(r'<[^>]*>', '', raw_html)
    clean_text = html.unescape(clean_text)
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    return clean_text[:300]

def parse_published_date(entry):
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        try:
            return datetime.fromtimestamp(time.mktime(entry.published_parsed), tz=timezone.utc)
        except Exception:
            pass
    return datetime.now(timezone.utc)

async def scrape_indiehackers():
    if not db.is_connected():
        await db.connect()
        
    logger.info(f"Scraping Indie Hackers RSS from {FEED_URL}...")
    try:
        feed = await asyncio.to_thread(feedparser.parse, FEED_URL)
        
        if feed.bozo and not feed.entries:
            logger.warning(f"Feedparser flagged potential issues parsing Indie Hackers: {feed.bozo_exception}")
            
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
            
            tags = ["indiehackers", "bootstrap", "sideproject"]
            
            try:
                await db.article.upsert(
                    where={"url": link},
                    data={
                        "create": {
                            "title": title,
                            "url": link,
                            "summary": summary,
                            "source": "indiehackers",
                            "sourceUrl": link,
                            "geography": "Global",
                            "tags": tags,
                            "publishedAt": published_at,
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
                # SQLite fallback
                try:
                    await db.article.upsert(
                        where={"url": link},
                        data={
                            "create": {
                                "title": title,
                                "url": link,
                                "summary": summary,
                                "source": "indiehackers",
                                "sourceUrl": link,
                                "geography": "Global",
                                "tags": ",".join(tags),
                                "publishedAt": published_at,
                            },
                            "update": {
                                "title": title,
                                "summary": summary,
                                "publishedAt": published_at,
                                "tags": ",".join(tags),
                            }
                        }
                    )
                    count += 1
                except Exception as ex:
                    logger.error(f"Failed to save Indie Hackers article {link}: {ex}")
                    
        logger.info(f"Successfully scraped {count} articles from Indie Hackers")
    except Exception as e:
        logger.error(f"Error scraping Indie Hackers feed: {e}")

if __name__ == "__main__":
    async def main():
        await db.connect()
        try:
            await scrape_indiehackers()
        finally:
            await db.disconnect()
    asyncio.run(main())
