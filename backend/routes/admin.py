import logging
from datetime import datetime, timezone

from fastapi import APIRouter

from backend.db import db, ensure_db_connected
from backend.fetchers.github_fetcher import scrape_github
from backend.fetchers.hn_fetcher import scrape_hn
from backend.fetchers.indiehackers_fetcher import scrape_indiehackers
from backend.fetchers.jobs_fetcher import scrape_jobs
from backend.fetchers.news_fetcher import scrape_rss
from backend.fetchers.ph_fetcher import scrape_ph
from backend.fetchers.reddit_fetcher import scrape_reddit
from backend.ingestion.runner import run_all_adapters
from backend.scripts.backfill_signals import run as run_signal_backfill

router = APIRouter(prefix="/api/admin", tags=["admin"])
logger = logging.getLogger("admin")


async def _counts():
    return {
        "articles": await db.article.count(),
        "launches": await db.launch.count(),
        "jobs": await db.job.count(),
        "githubRepos": await db.githubrepo.count(),
        "digestSubscribers": await db.digestsubscriber.count(),
        "companies": await db.company.count(),
        "signals": await db.signal.count(),
        "sources": await db.source.count(),
        "sourceRuns": await db.sourcerun.count(),
        "unresolvedSignals": await db.unresolvedsignal.count(),
        "founders": await db.founder.count(),
    }


@router.post("/refresh")
async def refresh_all_sources():
    await ensure_db_connected()

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

    adapter_results = await run_all_adapters()
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
        "adapterResults": adapter_results,
    }


@router.post("/backfill-signals")
async def backfill_signals():
    await ensure_db_connected()
    before = await _counts()
    results = await run_signal_backfill()
    after = await _counts()
    inserted = {key: after[key] - before.get(key, 0) for key in after}
    return {
        "status": "completed",
        "results": results,
        "before": before,
        "after": after,
        "inserted": inserted,
    }


@router.get("/source-runs")
async def source_runs(limit: int = 50):
    await ensure_db_connected()
    runs = await db.sourcerun.find_many(order={"startedAt": "desc"}, take=min(limit, 100))
    return {
        "data": [
            {
                "id": run.id,
                "sourceKey": run.sourceKey,
                "status": run.status,
                "startedAt": run.startedAt,
                "finishedAt": run.finishedAt,
                "itemsFetched": run.itemsFetched,
                "itemsInserted": run.itemsInserted,
                "itemsDeduped": run.itemsDeduped,
                "itemsUnresolved": run.itemsUnresolved,
                "errorMessage": run.errorMessage,
            }
            for run in runs
        ],
        "total": len(runs),
    }


@router.get("/unresolved-signals")
async def unresolved_signals(limit: int = 100):
    await ensure_db_connected()
    records = await db.unresolvedsignal.find_many(order={"createdAt": "desc"}, take=min(limit, 200))
    return {
        "data": [
            {
                "id": record.id,
                "sourceKey": record.sourceKey,
                "externalId": record.externalId,
                "reason": record.reason,
                "companyNameRaw": record.companyNameRaw,
                "companyDomain": record.companyDomain,
                "signalType": record.signalType,
                "title": record.title,
                "url": record.url,
                "publishedAt": record.publishedAt,
                "createdAt": record.createdAt,
            }
            for record in records
        ],
        "total": len(records),
    }


@router.get("/source-health")
async def source_health():
    await ensure_db_connected()
    sources = await db.source.find_many(order={"slug": "asc"}, take=100)
    data = []
    for source in sources:
        latest_run = await db.sourcerun.find_first(
            where={"sourceKey": source.slug},
            order={"startedAt": "desc"},
        )
        unresolved_count = await db.unresolvedsignal.count(where={"sourceKey": source.slug})
        data.append({
            "sourceKey": source.slug,
            "name": source.name,
            "type": source.type,
            "reliability": source.reliability,
            "latestRun": {
                "status": latest_run.status,
                "startedAt": latest_run.startedAt,
                "finishedAt": latest_run.finishedAt,
                "itemsFetched": latest_run.itemsFetched,
                "itemsInserted": latest_run.itemsInserted,
                "itemsDeduped": latest_run.itemsDeduped,
                "itemsUnresolved": latest_run.itemsUnresolved,
                "errorMessage": latest_run.errorMessage,
            } if latest_run else None,
            "unresolvedCount": unresolved_count,
        })
    return {"data": data, "total": len(data)}
