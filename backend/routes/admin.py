import logging
from datetime import datetime, timezone

from fastapi import APIRouter

from backend.db import db
from backend.fetchers.github_fetcher import scrape_github
from backend.fetchers.hn_fetcher import scrape_hn
from backend.fetchers.indiehackers_fetcher import scrape_indiehackers
from backend.fetchers.jobs_fetcher import scrape_jobs
from backend.fetchers.news_fetcher import scrape_rss
from backend.fetchers.ph_fetcher import scrape_ph
from backend.fetchers.reddit_fetcher import scrape_reddit

router = APIRouter(prefix="/api/admin", tags=["admin"])
logger = logging.getLogger("admin")


async def _counts():
    return {
        "articles": await db.article.count(),
        "launches": await db.launch.count(),
        "jobs": await db.job.count(),
        "githubRepos": await db.githubrepo.count(),
        "digestSubscribers": await db.digestsubscriber.count(),
    }


@router.post("/refresh")
async def refresh_all_sources():
    if not db.is_connected():
        await db.connect()

    refresh_started_at = datetime.now(timezone.utc)
    before = await _counts()
    jobs = [
        ("news", scrape_rss),
        ("indiehackers", scrape_indiehackers),
        ("hackernews", scrape_hn),
        ("producthunt", scrape_ph),
        ("reddit", scrape_reddit),
        ("jobs", scrape_jobs),
        ("github", scrape_github),
    ]

    results = []
    for name, fetcher in jobs:
        started_at = datetime.now(timezone.utc)
        try:
            await fetcher()
            results.append({
                "source": name,
                "status": "ok",
                "startedAt": started_at,
                "finishedAt": datetime.now(timezone.utc),
            })
        except Exception as exc:
            logger.exception("Manual refresh failed for %s", name)
            results.append({
                "source": name,
                "status": "error",
                "error": str(exc),
                "startedAt": started_at,
                "finishedAt": datetime.now(timezone.utc),
            })

    after = await _counts()
    inserted = {key: after[key] - before.get(key, 0) for key in after}

    return {
        "status": "completed",
        "startedAt": refresh_started_at,
        "finishedAt": datetime.now(timezone.utc),
        "before": before,
        "after": after,
        "inserted": inserted,
        "results": results,
    }
