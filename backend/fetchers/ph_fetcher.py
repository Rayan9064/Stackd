import os
import logging
import asyncio
from datetime import datetime, timezone
import httpx
from backend.db import db

logger = logging.getLogger("ph_fetcher")
logging.basicConfig(level=logging.INFO)

GRAPHQL_URL = "https://api.producthunt.com/v2/api/graphql"

QUERY = """
query GetTopPosts {
  posts(first: 20, order: VOTES) {
    edges {
      node {
        name
        tagline
        url
        votesCount
        createdAt
      }
    }
  }
}
"""

async def scrape_ph():
    api_key = os.environ.get("PH_API_KEY")
    if not api_key:
        logger.info("PH_API_KEY environment variable is not set. Skipping Product Hunt fetcher.")
        return []
        
    if not db.is_connected():
        await db.connect()
        
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    logger.info("Fetching top posts from Product Hunt GraphQL API...")
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                GRAPHQL_URL,
                json={"query": QUERY},
                headers=headers
            )
            response.raise_for_status()
            res_data = response.json()
            
            if "errors" in res_data:
                logger.error(f"GraphQL errors returned from Product Hunt: {res_data['errors']}")
                return []
                
            edges = res_data.get("data", {}).get("posts", {}).get("edges", [])
            
            count = 0
            for edge in edges:
                node = edge.get("node", {})
                name = node.get("name")
                tagline = node.get("tagline") or ""
                url = node.get("url")
                votes_count = node.get("votesCount") or 0
                created_at_str = node.get("createdAt")
                
                if not name or not url:
                    continue
                    
                if created_at_str:
                    try:
                        launched_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
                    except Exception:
                        launched_at = datetime.now(timezone.utc)
                else:
                    launched_at = datetime.now(timezone.utc)
                    
                try:
                    await db.launch.upsert(
                        where={"url": url},
                        data={
                            "create": {
                                "title": name,
                                "tagline": tagline,
                                "url": url,
                                "sourceUrl": url,
                                "source": "ph",
                                "upvotes": votes_count,
                                "launchedAt": launched_at,
                            },
                            "update": {
                                "title": name,
                                "tagline": tagline,
                                "upvotes": votes_count,
                                "launchedAt": launched_at,
                            }
                        }
                    )
                    count += 1
                except Exception as e:
                    logger.error(f"Failed to save Product Hunt launch {url}: {e}")
                    
            logger.info(f"Successfully fetched {count} launches from Product Hunt")
    except Exception as e:
        logger.error(f"Error fetching Product Hunt launches: {e}")

if __name__ == "__main__":
    async def main():
        await db.connect()
        try:
            await scrape_ph()
        finally:
            await db.disconnect()
            
    asyncio.run(main())
