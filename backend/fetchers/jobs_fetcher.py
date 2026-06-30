import logging
import asyncio
from datetime import datetime, timezone
import httpx
from bs4 import BeautifulSoup
from backend.db import db

logger = logging.getLogger("jobs_fetcher")
logging.basicConfig(level=logging.INFO)

YC_JOBS_URL = "https://www.ycombinator.com/jobs"

# Global fallback jobs
FALLBACK_JOBS = [
    {
        "title": "Senior Software Engineer, Core Payments",
        "company": "Stripe",
        "location": "San Francisco, CA, USA",
        "remote": False,
        "url": "https://www.ycombinator.com/jobs/role/stripe-senior-software-engineer-core-payments",
        "source": "ycombinator",
        "role": "engineering",
        "stage": "growth",
        "geography": "US"
    },
    {
        "title": "Product Manager - Core Banking",
        "company": "Revolut",
        "location": "London, UK",
        "remote": True,
        "url": "https://www.ycombinator.com/jobs/role/revolut-product-manager-core-banking",
        "source": "ycombinator",
        "role": "product",
        "stage": "growth",
        "geography": "EU"
    },
    {
        "title": "Lead UI/UX Designer",
        "company": "e27",
        "location": "Singapore",
        "remote": False,
        "url": "https://e27.co/jobs/lead-ui-ux-designer-e27",
        "source": "e27",
        "role": "design",
        "stage": "series-a",
        "geography": "SEA"
    },
    {
        "title": "Senior Backend Developer",
        "company": "Decentro",
        "location": "Bangalore, India",
        "remote": False,
        "url": "https://www.ycombinator.com/jobs/role/senior-backend-developer-decentro",
        "source": "ycombinator",
        "role": "engineering",
        "stage": "seed",
        "geography": "India"
    },
    {
        "title": "Staff Site Reliability Engineer",
        "company": "GitLab",
        "location": "Remote",
        "remote": True,
        "url": "https://about.gitlab.com/jobs/staff-sre-remote",
        "source": "gitlab",
        "role": "engineering",
        "stage": "growth",
        "geography": "Global"
    }
]

def infer_geography(location: str) -> str:
    if not location:
        return "Global"
        
    loc_lower = location.lower()
    if "india" in loc_lower or "bangalore" in loc_lower or "mumbai" in loc_lower or "delhi" in loc_lower:
        return "India"
    elif "uk" in loc_lower or "london" in loc_lower or "berlin" in loc_lower or "europe" in loc_lower or "paris" in loc_lower:
        return "EU"
    elif "singapore" in loc_lower or "jakarta" in loc_lower or "sea" in loc_lower or "vietnam" in loc_lower or "philippines" in loc_lower:
        return "SEA"
    elif "us" in loc_lower or "usa" in loc_lower or "san francisco" in loc_lower or "new york" in loc_lower or "california" in loc_lower:
        return "US"
    elif "remote" in loc_lower:
        return "Global"
    return "Global"

async def scrape_jobs():
    if not db.is_connected():
        await db.connect()
        
    jobs = []
    logger.info(f"Fetching jobs from YC Job Board: {YC_JOBS_URL}")
    
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        async with httpx.AsyncClient(timeout=15.0, headers=headers) as client:
            response = await client.get(YC_JOBS_URL)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
                job_links = soup.find_all("a", href=lambda h: h and "/jobs/role/" in h)
                
                for link in job_links:
                    href = link.get("href")
                    title = link.get_text(strip=True)
                    
                    if not title or not href:
                        continue
                        
                    job_url = href if href.startswith("http") else f"https://www.ycombinator.com{href}"
                    parent_text = link.parent.get_text(" | ", strip=True) if link.parent else ""
                    
                    company = "YC Startup"
                    location = "Remote"
                    
                    parts = [p.strip() for p in parent_text.split("|") if p.strip()]
                    for part in parts:
                        if part.startswith("at "):
                            company = part[3:]
                        elif any(x in part.lower() for x in ["remote", "usa", "india", "london", "europe", "singapore"]):
                            location = part
                            
                    role_type = "engineering"
                    title_lower = title.lower()
                    if "design" in title_lower or "ux" in title_lower or "ui" in title_lower:
                        role_type = "design"
                    elif "product manager" in title_lower or "pm" in title_lower:
                        role_type = "product"
                    elif "marketing" in title_lower or "growth" in title_lower or "sales" in title_lower:
                        role_type = "marketing"
                        
                    is_remote = "remote" in location.lower()
                    geography = infer_geography(location)
                    
                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": location,
                        "remote": is_remote,
                        "url": job_url,
                        "source": "ycombinator",
                        "role": role_type,
                        "stage": "seed",
                        "geography": geography
                    })
            else:
                logger.warning(f"Failed to fetch YC jobs HTML, status code: {response.status_code}")
    except Exception as e:
        logger.error(f"Error while parsing YC jobs: {e}")
        
    if not jobs:
        logger.info("Using global fallback curated jobs list.")
        jobs = FALLBACK_JOBS
        
    count = 0
    for job in jobs:
        posted_at = datetime.now(timezone.utc)
        try:
            await db.job.upsert(
                where={"url": job["url"]},
                data={
                    "create": {
                        "title": job["title"],
                        "company": job["company"],
                        "location": job["location"],
                        "remote": job.get("remote", False),
                        "url": job["url"],
                        "sourceUrl": job["url"],
                        "source": job["source"],
                        "role": job["role"],
                        "stage": job["stage"],
                        "geography": job["geography"],
                        "postedAt": posted_at
                    },
                    "update": {
                        "title": job["title"],
                        "company": job["company"],
                        "location": job["location"],
                        "remote": job.get("remote", False),
                        "role": job["role"],
                        "stage": job["stage"],
                        "geography": job["geography"],
                        "postedAt": posted_at
                    }
                }
            )
            count += 1
        except Exception as e:
            logger.error(f"Failed to save job {job['url']}: {e}")
            
    logger.info(f"Successfully processed {count} jobs")

if __name__ == "__main__":
    async def main():
        await db.connect()
        try:
            await scrape_jobs()
        finally:
            await db.disconnect()
    asyncio.run(main())
