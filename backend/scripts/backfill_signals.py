import asyncio
import json
import os
from datetime import datetime, timezone

from backend.db import db, ensure_db_connected
from backend.services.entity_resolver import create_signal, resolve_company, seed_sources


ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))


def read_json_data(filename: str):
    path = os.path.join(ROOT_DIR, "data", filename)
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def parse_datetime(value):
    if isinstance(value, datetime):
        return value
    return datetime.now(timezone.utc)


def extract_launch_name(title: str) -> str:
    name = title.replace("Show HN:", "").replace("Launch HN:", "").strip()
    for separator in [" - ", " – ", " — ", ": "]:
        if separator in name:
            return name.split(separator, 1)[0].strip()
    return name


async def source_names_for_signals(signals):
    names = set()
    for signal in signals:
        if not signal.sourceId:
            continue
        source = await db.source.find_unique(where={"id": signal.sourceId})
        if source:
            names.add(source.name)
    return names


async def prune_low_evidence_companies():
    trusted_creation_sources = {"Startup Directory", "Product Hunt"}
    companies = await db.company.find_many(take=1000)
    pruned = 0

    for company in companies:
        signals = await db.signal.find_many(where={"companyId": company.id})
        source_names = await source_names_for_signals(signals)
        has_trusted_source = bool(source_names & trusted_creation_sources)
        source_count = len(source_names)

        should_prune = (
            not company.website
            and not has_trusted_source
            and (source_count < 2 or len(signals) < 2)
            and company.confidenceScore < 0.8
        )

        if should_prune:
            await db.company.delete(where={"id": company.id})
            pruned += 1

    return pruned


async def backfill_startup_directory():
    data = read_json_data("startups.json")
    count = 0
    for startup in data.get("startups", []):
        company = await resolve_company(
            name=startup.get("name", ""),
            website=startup.get("website"),
            description=startup.get("oneLiner"),
            sector=startup.get("sector"),
            stage=startup.get("stage"),
            geography=startup.get("geography"),
            location=startup.get("location"),
            confidence_score=0.95,
        )
        if not company:
            continue
        await create_signal(
            company=company,
            source_name="Startup Directory",
            signal_type="STARTUP_PROFILE",
            title=f"{company.name} added to Stackd startup directory",
            url=startup.get("sourceUrl") or startup.get("website") or f"stackd://startups/{company.slug}",
            summary=startup.get("oneLiner"),
            metadata=startup,
            external_type="startup",
            external_id=startup.get("id"),
        )
        count += 1
    return count


async def backfill_jobs():
    jobs = await db.job.find_many(take=500)
    count = 0
    for job in jobs:
        company = await resolve_company(
            name=job.company,
            geography=job.geography,
            stage=job.stage,
            confidence_score=0.7,
            allow_create=False,
        )
        if not company:
            continue
        await create_signal(
            company=company,
            source_name="Jobs Feed",
            signal_type="JOB_POSTING",
            title=job.title,
            url=job.url,
            summary=f"{job.company} is hiring for {job.title}",
            occurred_at=parse_datetime(job.postedAt),
            metadata={
                "location": job.location,
                "remote": job.remote,
                "role": job.role,
                "stage": job.stage,
                "source": job.source,
            },
            external_type="job",
            external_id=job.id,
        )
        count += 1
    return count


async def backfill_launches():
    launches = await db.launch.find_many(take=500)
    count = 0
    for launch in launches:
        name = extract_launch_name(launch.title)
        company = await resolve_company(
            name=name,
            description=launch.tagline,
            confidence_score=0.82 if launch.source == "ph" else 0.72,
            allow_create=launch.source == "ph",
        )
        if not company:
            continue
        await create_signal(
            company=company,
            source_name="Hacker News" if launch.source == "hn" else "Product Hunt",
            signal_type="PRODUCT_LAUNCH",
            title=launch.title,
            url=launch.url,
            summary=launch.tagline,
            occurred_at=parse_datetime(launch.launchedAt),
            metadata={
                "upvotes": launch.upvotes,
                "source": launch.source,
                "sourceUrl": launch.sourceUrl,
            },
            external_type="launch",
            external_id=launch.id,
        )
        count += 1
    return count


async def backfill_github_repos():
    repos = await db.githubrepo.find_many(take=500)
    count = 0
    for repo in repos:
        company = await resolve_company(
            name=repo.owner,
            description=repo.description,
            confidence_score=0.55,
            allow_create=False,
        )
        if not company:
            continue
        await create_signal(
            company=company,
            source_name="GitHub",
            signal_type="GITHUB_TREND",
            title=repo.name,
            url=repo.url,
            summary=repo.description,
            occurred_at=parse_datetime(repo.fetchedAt),
            metadata={
                "stars": repo.stars,
                "language": repo.language,
                "topics": repo.topics,
                "owner": repo.owner,
            },
            external_type="github_repo",
            external_id=repo.id,
        )
        count += 1
    return count


async def backfill_funding_articles():
    keywords = ["raise", "raises", "raised", "funding", "round", "seed", "series", "capital"]
    articles = await db.article.find_many(take=500)
    count = 0
    for article in articles:
        title_lower = article.title.lower()
        if not any(keyword in title_lower for keyword in keywords):
            continue
        company_name = article.title.split(" raises ")[0].split(" raised ")[0].split(" secures ")[0].strip()
        if len(company_name) > 80:
            continue
        company = await resolve_company(
            name=company_name,
            description=article.summary,
            geography=article.geography,
            confidence_score=0.5,
            allow_create=False,
        )
        if not company:
            continue
        await create_signal(
            company=company,
            source_name="Funding Feed",
            signal_type="FUNDING_ROUND",
            title=article.title,
            url=article.url,
            summary=article.summary,
            occurred_at=parse_datetime(article.publishedAt),
            metadata={
                "source": article.source,
                "sourceUrl": article.sourceUrl,
                "tags": article.tags,
                "geography": article.geography,
            },
            external_type="article",
            external_id=article.id,
        )
        count += 1
    return count


async def run():
    await ensure_db_connected()
    await seed_sources()
    results = {
        "startupProfiles": await backfill_startup_directory(),
        "jobs": await backfill_jobs(),
        "launches": await backfill_launches(),
        "githubRepos": await backfill_github_repos(),
        "fundingArticles": await backfill_funding_articles(),
    }
    results["prunedLowEvidenceCompanies"] = await prune_low_evidence_companies()
    return results


async def run_cli():
    results = await run()
    await db.disconnect()
    return results


if __name__ == "__main__":
    print(asyncio.run(run_cli()))
