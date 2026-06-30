import re
import html
import logging
import asyncio
from datetime import datetime, timezone
import time
import feedparser
from backend.db import db

logger = logging.getLogger("news_fetcher")
logging.basicConfig(level=logging.INFO)

FEEDS = {
    "techcrunch": {
        "url": "https://techcrunch.com/feed/",
        "geography": "US"
    },
    "venturebeat": {
        "url": "https://venturebeat.com/feed/",
        "geography": "US"
    },
    "sifted": {
        "url": "https://sifted.eu/feed",
        "geography": "EU"
    },
    "techinasia": {
        "url": "https://feeds2.feedburner.com/PennOlson",
        "geography": "SEA"
    },
    "e27": {
        "url": "https://e27.co/feed/",
        "geography": "SEA"
    },
    "thenextweb": {
        "url": "https://thenextweb.com/feed/",
        "geography": "EU"
    },
    "maddyness": {
        "url": "https://www.maddyness.com/feed/",
        "geography": "EU"
    }
}

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

async def scrape_feed(source: str, config: dict):
    url = config["url"]
    geography = config["geography"]
    logger.info(f"Starting scrape for feed: {source} ({url})")
    
    try:
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
            
            tags = []
            if hasattr(entry, "tags"):
                tags = [t.term for t in entry.tags if hasattr(t, "term") and t.term]
            if not tags:
                tags = ["news", source]
            
            try:
                await db.article.upsert(
                    where={"url": link},
                    data={
                        "create": {
                            "title": title,
                            "url": link,
                            "summary": summary,
                            "source": source,
                            "sourceUrl": link,
                            "geography": geography,
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
                                "source": source,
                                "sourceUrl": link,
                                "geography": geography,
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
                    logger.error(f"Failed to save article {link}: {ex}")
                    
        logger.info(f"Successfully scraped {count} articles from {source}")
    except Exception as e:
        logger.error(f"Error scraping feed {source}: {e}")

async def scrape_rss():
    if not db.is_connected():
        await db.connect()
    
    tasks = [scrape_feed(source, config) for source, config in FEEDS.items()]
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    async def main():
        await db.connect()
        try:
            await scrape_rss()
        finally:
            await db.disconnect()
    asyncio.run(main())
