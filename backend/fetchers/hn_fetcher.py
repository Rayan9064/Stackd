import re
import html
import logging
import asyncio
from datetime import datetime, timezone
import httpx
from backend.db import db

logger = logging.getLogger("hn_fetcher")
logging.basicConfig(level=logging.INFO)

API_URL = "https://hn.algolia.com/api/v1/search"

def clean_html(raw_html):
    if not raw_html:
        return ""
    clean_text = re.sub(r'<[^>]*>', '', raw_html)
    clean_text = html.unescape(clean_text)
    return re.sub(r'\s+', ' ', clean_text).strip()

async def fetch_hn_search(query: str, tags: str = "story", hits_per_page: int = 30):
    params = {
        "query": query,
        "tags": tags,
        "hitsPerPage": hits_per_page
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(API_URL, params=params)
        response.raise_for_status()
        return response.json().get("hits", [])

async def fetch_hn_comments(story_id: str, limit: int = 100):
    params = {
        "tags": f"comment,story_{story_id}",
        "hitsPerPage": limit
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(API_URL, params=params)
        response.raise_for_status()
        return response.json().get("hits", [])

async def scrape_hn():
    if not db.is_connected():
        await db.connect()

    # 1. Fetch Show HN Launches
    logger.info("Fetching Show HN launches...")
    show_hn_hits = []
    try:
        show_hn_hits = await fetch_hn_search("Show HN", tags="story", hits_per_page=30)
    except Exception as e:
        logger.error(f"Error fetching Show HN: {e}")

    launch_count = 0
    for hit in show_hn_hits:
        title = hit.get("title")
        object_id = hit.get("objectID")
        if not title or not object_id:
            continue

        hn_url = f"https://news.ycombinator.com/item?id={object_id}"
        target_url = hit.get("url") or hn_url
        upvotes = hit.get("points") or 0
        
        created_at_i = hit.get("created_at_i")
        launched_at = datetime.fromtimestamp(created_at_i, tz=timezone.utc) if created_at_i else datetime.now(timezone.utc)
        
        story_text = hit.get("story_text") or ""
        tagline = clean_html(story_text)[:150] if story_text else "Show HN launch thread."

        try:
            await db.launch.upsert(
                where={"url": target_url},
                data={
                    "create": {
                        "title": title,
                        "tagline": tagline,
                        "url": target_url,
                        "sourceUrl": hn_url,
                        "source": "hn",
                        "upvotes": upvotes,
                        "launchedAt": launched_at,
                    },
                    "update": {
                        "title": title,
                        "tagline": tagline,
                        "upvotes": upvotes,
                        "launchedAt": launched_at,
                    }
                }
            )
            launch_count += 1
        except Exception as e:
            logger.error(f"Failed to save HN launch {target_url}: {e}")

    logger.info(f"Processed {launch_count} HN launches.")

    # 2. Fetch "startup" Articles
    logger.info("Fetching HN startup discussions...")
    startup_hits = []
    try:
        startup_hits = await fetch_hn_search("startup", tags="story", hits_per_page=30)
    except Exception as e:
        logger.error(f"Error fetching startup stories: {e}")

    article_count = 0
    for hit in startup_hits:
        title = hit.get("title")
        object_id = hit.get("objectID")
        if not title or not object_id:
            continue

        hn_url = f"https://news.ycombinator.com/item?id={object_id}"
        target_url = hit.get("url") or hn_url
        
        created_at_i = hit.get("created_at_i")
        published_at = datetime.fromtimestamp(created_at_i, tz=timezone.utc) if created_at_i else datetime.now(timezone.utc)
        
        story_text = clean_html(hit.get("story_text") or "")
        summary = story_text[:300] if story_text else f"Hacker News discussion regarding {title}."

        # Handle tags and topics depending on SQLite fallback
        tags_list = ["startup", "hn"]
        
        try:
            # Check if database is SQLite to serialized string vs Postgres array
            # A simple type check on prisma client
            await db.article.upsert(
                where={"url": target_url},
                data={
                    "create": {
                        "title": title,
                        "url": target_url,
                        "summary": summary,
                        "source": "hn",
                        "sourceUrl": hn_url,
                        "geography": "Global",
                        "tags": tags_list,
                        "publishedAt": published_at,
                    },
                    "update": {
                        "title": title,
                        "summary": summary,
                        "tags": tags_list,
                        "publishedAt": published_at,
                    }
                }
            )
            article_count += 1
        except Exception as e:
            # Handle SQLite list array error by converting list to string
            try:
                await db.article.upsert(
                    where={"url": target_url},
                    data={
                        "create": {
                            "title": title,
                            "url": target_url,
                            "summary": summary,
                            "source": "hn",
                            "sourceUrl": hn_url,
                            "geography": "Global",
                            "tags": ",".join(tags_list),
                            "publishedAt": published_at,
                        },
                        "update": {
                            "title": title,
                            "summary": summary,
                            "tags": ",".join(tags_list),
                            "publishedAt": published_at,
                        }
                    }
                )
                article_count += 1
            except Exception as ex:
                logger.error(f"Failed to save HN article {target_url}: {ex}")

    logger.info(f"Processed {article_count} HN articles.")

    # 3. Fetch "Ask HN Who is hiring" comments -> Jobs
    logger.info("Fetching Ask HN: Who is hiring monthly thread...")
    try:
        hiring_threads = await fetch_hn_search("Ask HN: Who is hiring", tags="story", hits_per_page=5)
        if hiring_threads:
            # Get latest thread
            latest_thread = hiring_threads[0]
            thread_id = latest_thread.get("objectID")
            thread_title = latest_thread.get("title", "")
            
            logger.info(f"Targeting hiring thread: '{thread_title}' (ID: {thread_id})")
            comments = await fetch_hn_comments(thread_id, limit=50)
            
            job_count = 0
            for comment in comments:
                comment_text = comment.get("comment_text")
                comment_id = comment.get("objectID")
                if not comment_text or not comment_id:
                    continue
                
                clean_text = clean_html(comment_text)
                if not clean_text:
                    continue
                
                lines = [l.strip() for l in clean_text.split(".") if l.strip()]
                first_line = lines[0] if lines else clean_text[:100]
                
                # Parse first line to extract Company & Role
                # Pattern: "Company | Role | Location" or "Company is looking for..."
                company = "HN Startup"
                role_title = "Software Engineer"
                
                parts = [p.strip() for p in first_line.split("|") if p.strip()]
                if len(parts) >= 2:
                    company = parts[0]
                    role_title = parts[1]
                else:
                    # Fallback regex search
                    match = re.match(r"^([^:]+)\s+is\s+hiring\s+a\s+([^,]+)", first_line, re.IGNORECASE)
                    if match:
                        company = match.group(1).strip()
                        role_title = match.group(2).strip()
                    else:
                        company = first_line[:30]
                        role_title = "Startup Contributor"
                
                # Remote check
                text_lower = clean_text.lower()
                is_remote = "remote" in text_lower or "telecommute" in text_lower
                
                # Stage
                stage = "growth"
                if "seed" in text_lower:
                    stage = "seed"
                elif "series a" in text_lower or "series-a" in text_lower:
                    stage = "series-a"
                elif "early stage" in text_lower:
                    stage = "early-stage"
                
                # Role Category
                role_category = "engineering"
                if "design" in text_lower or "ui" in text_lower or "ux" in text_lower:
                    role_category = "design"
                elif "product manager" in text_lower or "pm" in text_lower:
                    role_category = "product"
                elif "marketing" in text_lower or "sales" in text_lower:
                    role_category = "marketing"
                
                comment_url = f"https://news.ycombinator.com/item?id={comment_id}"
                created_at_i = comment.get("created_at_i")
                posted_at = datetime.fromtimestamp(created_at_i, tz=timezone.utc) if created_at_i else datetime.now(timezone.utc)
                
                # Infer Location
                location = "Remote" if is_remote else "Global"
                if len(parts) >= 3:
                    location = parts[2]
                
                try:
                    await db.job.upsert(
                        where={"url": comment_url},
                        data={
                            "create": {
                                "title": role_title[:100],
                                "company": company[:100],
                                "location": location[:150],
                                "remote": is_remote,
                                "url": comment_url,
                                "sourceUrl": comment_url,
                                "source": "hn",
                                "role": role_category,
                                "stage": stage,
                                "geography": "Global",
                                "postedAt": posted_at
                            },
                            "update": {
                                "title": role_title[:100],
                                "company": company[:100],
                                "location": location[:150],
                                "remote": is_remote,
                                "role": role_category,
                                "stage": stage,
                                "postedAt": posted_at
                            }
                        }
                    )
                    job_count += 1
                except Exception as e:
                    logger.error(f"Failed to save HN job comment {comment_url}: {e}")
                    
            logger.info(f"Processed {job_count} jobs from HN hiring thread.")
    except Exception as e:
        logger.error(f"Error parsing Ask HN hiring thread comments: {e}")

if __name__ == "__main__":
    async def main():
        await db.connect()
        try:
            await scrape_hn()
        finally:
            await db.disconnect()
    asyncio.run(main())
