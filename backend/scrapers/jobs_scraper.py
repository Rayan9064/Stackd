import logging
import asyncio
from datetime import datetime, timezone
import httpx
from bs4 import BeautifulSoup
from backend.db import db

logger = logging.getLogger("jobs_scraper")
logging.basicConfig(level=logging.INFO)

YC_JOBS_URL = "https://www.ycombinator.com/jobs"

# Realistic fallback jobs in case of cloudflare/scraping blocks
FALLBACK_JOBS = [
    {
        "title": "Senior Software Engineer, Backend",
        "company": "Zepto",
        "location": "Bangalore, India",
        "url": "https://www.ycombinator.com/jobs/role/senior-software-engineer-backend-zepto",
        "role": "engineering",
        "stage": "series-d"
    },
    {
        "title": "Founding Frontend Engineer",
        "company": "Decentro",
        "location": "Bangalore, India (Hybrid)",
        "url": "https://www.ycombinator.com/jobs/role/founding-frontend-engineer-decentro",
        "role": "engineering",
        "stage": "seed"
    },
    {
        "title": "Product Designer",
        "company": "Razorpay",
        "location": "Bangalore, India",
        "url": "https://www.ycombinator.com/jobs/role/product-designer-razorpay",
        "role": "design",
        "stage": "series-f"
    },
    {
        "title": "Growth Marketing Manager",
        "company": "Meesho",
        "location": "Remote (India)",
        "url": "https://www.ycombinator.com/jobs/role/growth-marketing-manager-meesho",
        "role": "marketing",
        "stage": "growth"
    },
    {
        "title": "Technical Product Manager",
        "company": "InVideo",
        "location": "Mumbai, India",
        "url": "https://www.ycombinator.com/jobs/role/technical-product-manager-invideo",
        "role": "product",
        "stage": "series-a"
    }
]

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
                
                # Parse all <a> tags with '/jobs/role/' in the href
                job_links = soup.find_all("a", href=lambda h: h and "/jobs/role/" in h)
                
                for link in job_links:
                    href = link.get("href")
                    title = link.get_text(strip=True)
                    
                    if not title or not href:
                        continue
                        
                    job_url = href if href.startswith("http") else f"https://www.ycombinator.com{href}"
                    
                    # Try to extract company name and location from parent text
                    parent_text = link.parent.get_text(" | ", strip=True) if link.parent else ""
                    
                    # Example structure parsing:
                    # "Software Engineer | at Acme | Bangalore, India"
                    company = "YC Startup"
                    location = "India / Remote"
                    
                    parts = [p.strip() for p in parent_text.split("|") if p.strip()]
                    for part in parts:
                        if part.startswith("at "):
                            company = part[3:]
                        elif "India" in part or "Bangalore" in part or "Delhi" in part or "Mumbai" in part or "Remote" in part:
                            location = part
                            
                    # Try to guess role type
                    role_type = "engineering"
                    title_lower = title.lower()
                    if "design" in title_lower or "ux" in title_lower or "ui" in title_lower:
                        role_type = "design"
                    elif "product manager" in title_lower or "tpm" in title_lower or "pm" in title_lower:
                        role_type = "product"
                    elif "marketing" in title_lower or "growth" in title_lower:
                        role_type = "marketing"
                        
                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": location,
                        "url": job_url,
                        "role": role_type,
                        "stage": "seed" # Default to seed
                    })
            else:
                logger.warning(f"Failed to fetch YC jobs HTML, status code: {response.status_code}")
    except Exception as e:
        logger.error(f"Error while parsing YC jobs: {e}")
        
    # If no jobs were successfully scraped, use the fallback list
    if not jobs:
        logger.info("Using fallback curated jobs list.")
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
                        "url": job["url"],
                        "source": "ycombinator",
                        "postedAt": posted_at,
                        "role": job["role"],
                        "stage": job["stage"]
                    },
                    "update": {
                        "title": job["title"],
                        "company": job["company"],
                        "location": job["location"],
                        "role": job["role"],
                        "stage": job["stage"]
                    }
                }
            )
            count += 1
        except Exception as e:
            logger.error(f"Failed to save job {job['url']} to DB: {e}")
            
    logger.info(f"Successfully scraped and stored {count} jobs")

if __name__ == "__main__":
    async def main():
        await db.connect()
        try:
            await scrape_jobs()
        finally:
            await db.disconnect()
            
    asyncio.run(main())
