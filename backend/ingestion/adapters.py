import json
import os
from datetime import datetime, timezone
from urllib.parse import urlparse

from backend.db import db
from backend.ingestion.types import NormalizedSignal, SourceAdapter
from backend.services.entity_resolver import extract_domain

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))


def _read_json_data(filename: str):
    path = os.path.join(ROOT_DIR, "data", filename)
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def _as_datetime(value):
    return value if isinstance(value, datetime) else datetime.now(timezone.utc)


def _url_domain(value: str | None) -> str | None:
    if not value:
        return None
    return extract_domain(value)


def _launch_name(title: str) -> str:
    name = title.replace("Show HN:", "").replace("Launch HN:", "").strip()
    for separator in [" - ", " – ", " — ", ": "]:
        if separator in name:
            return name.split(separator, 1)[0].strip()
    return name


class StartupDirectoryAdapter(SourceAdapter):
    source_key = "startup-directory"
    source_name = "Startup Directory"
    trust_tier = "strong"
    source_type = "manual"

    async def fetch(self):
        data = _read_json_data("startups.json")
        records = []
        for startup in data.get("startups", []):
            website = startup.get("website")
            founder_names = startup.get("founders") or startup.get("founderNames") or []
            if isinstance(founder_names, str):
                founder_names = [name.strip() for name in founder_names.split(",") if name.strip()]
            records.append(NormalizedSignal(
                source_key=self.source_key,
                external_id=startup.get("id") or startup.get("name") or website,
                company_name_raw=startup.get("name"),
                company_domain=_url_domain(website),
                founder_names=founder_names,
                signal_type="STARTUP_PROFILE",
                title=f"{startup.get('name', 'Startup')} added to Stackd startup directory",
                url=startup.get("sourceUrl") or website or f"stackd://startups/{startup.get('id', 'unknown')}",
                published_at=datetime.now(timezone.utc),
                summary=startup.get("oneLiner"),
                raw_payload=startup,
            ))
        return records


class ProductHuntAdapter(SourceAdapter):
    source_key = "product-hunt"
    source_name = "Product Hunt"
    trust_tier = "strong"
    source_type = "api"
    base_url = "https://www.producthunt.com"

    async def fetch(self):
        launches = await db.launch.find_many(where={"source": "ph"}, take=500)
        return [
            NormalizedSignal(
                source_key=self.source_key,
                external_id=launch.id,
                company_name_raw=_launch_name(launch.title),
                company_domain=_url_domain(launch.url),
                signal_type="PRODUCT_LAUNCH",
                title=launch.title,
                url=launch.url,
                published_at=_as_datetime(launch.launchedAt),
                summary=launch.tagline,
                raw_payload={
                    "source": launch.source,
                    "sourceUrl": launch.sourceUrl,
                    "upvotes": launch.upvotes,
                },
            )
            for launch in launches
        ]


class HackerNewsAdapter(SourceAdapter):
    source_key = "hacker-news"
    source_name = "Hacker News"
    trust_tier = "medium"
    source_type = "api"
    base_url = "https://news.ycombinator.com"

    async def fetch(self):
        launches = await db.launch.find_many(where={"source": "hn"}, take=500)
        articles = await db.article.find_many(where={"source": "hn"}, take=500)
        records = [
            NormalizedSignal(
                source_key=self.source_key,
                external_id=f"launch:{launch.id}",
                company_name_raw=_launch_name(launch.title),
                company_domain=_url_domain(launch.url),
                signal_type="PRODUCT_LAUNCH",
                title=launch.title,
                url=launch.url,
                published_at=_as_datetime(launch.launchedAt),
                summary=launch.tagline,
                raw_payload={"sourceUrl": launch.sourceUrl, "upvotes": launch.upvotes},
            )
            for launch in launches
        ]
        records.extend(
            NormalizedSignal(
                source_key=self.source_key,
                external_id=f"article:{article.id}",
                company_name_raw=None,
                company_domain=_url_domain(article.url),
                signal_type="ECOSYSTEM_MENTION",
                title=article.title,
                url=article.url,
                published_at=_as_datetime(article.publishedAt),
                summary=article.summary,
                raw_payload={"sourceUrl": article.sourceUrl, "tags": article.tags},
            )
            for article in articles
        )
        return records


class GitHubAdapter(SourceAdapter):
    source_key = "github"
    source_name = "GitHub"
    trust_tier = "medium"
    source_type = "api"
    base_url = "https://github.com"

    async def fetch(self):
        repos = await db.githubrepo.find_many(take=500)
        return [
            NormalizedSignal(
                source_key=self.source_key,
                external_id=repo.id,
                company_name_raw=repo.owner,
                company_domain=None,
                signal_type="GITHUB_TREND",
                title=repo.name,
                url=repo.url,
                published_at=_as_datetime(repo.fetchedAt),
                summary=repo.description,
                raw_payload={
                    "stars": repo.stars,
                    "language": repo.language,
                    "topics": repo.topics,
                    "owner": repo.owner,
                },
            )
            for repo in repos
        ]


class JobsAdapter(SourceAdapter):
    source_key = "jobs-feed"
    source_name = "Jobs Feed"
    trust_tier = "weak"
    source_type = "api"

    async def fetch(self):
        jobs = await db.job.find_many(take=500)
        return [
            NormalizedSignal(
                source_key=self.source_key,
                external_id=job.id,
                company_name_raw=job.company,
                company_domain=None,
                signal_type="JOB_POSTING",
                title=job.title,
                url=job.url,
                published_at=_as_datetime(job.postedAt),
                summary=f"{job.company} is hiring for {job.title}",
                raw_payload={
                    "location": job.location,
                    "remote": job.remote,
                    "role": job.role,
                    "stage": job.stage,
                    "source": job.source,
                },
            )
            for job in jobs
        ]


class NewsFundingAdapter(SourceAdapter):
    source_key = "news-feed"
    source_name = "News Feed"
    trust_tier = "weak"
    source_type = "rss"

    async def fetch(self):
        articles = await db.article.find_many(take=500)
        records = []
        funding_keywords = ["raise", "raises", "raised", "funding", "round", "seed", "series", "capital"]
        for article in articles:
            title_lower = article.title.lower()
            is_funding = any(keyword in title_lower for keyword in funding_keywords)
            company_name = None
            if is_funding:
                company_name = article.title.split(" raises ")[0].split(" raised ")[0].split(" secures ")[0].strip()
                if len(company_name) > 80:
                    company_name = None
            records.append(NormalizedSignal(
                source_key=self.source_key,
                external_id=article.id,
                company_name_raw=company_name,
                company_domain=_url_domain(article.url),
                signal_type="FUNDING_ROUND" if is_funding else "ECOSYSTEM_MENTION",
                title=article.title,
                url=article.url,
                published_at=_as_datetime(article.publishedAt),
                summary=article.summary,
                raw_payload={
                    "source": article.source,
                    "sourceUrl": article.sourceUrl,
                    "tags": article.tags,
                    "geography": article.geography,
                },
            ))
        return records


class RedditAdapter(SourceAdapter):
    source_key = "reddit"
    source_name = "Reddit"
    trust_tier = "weak"
    source_type = "api"
    base_url = "https://www.reddit.com"

    async def fetch(self):
        articles = await db.article.find_many(take=500)
        records = []
        for article in articles:
            if not article.source.startswith("reddit/"):
                continue
            records.append(NormalizedSignal(
                source_key=self.source_key,
                external_id=article.id,
                company_name_raw=None,
                company_domain=_url_domain(article.url),
                signal_type="COMMUNITY_DISCUSSION",
                title=article.title,
                url=article.url,
                published_at=_as_datetime(article.publishedAt),
                summary=article.summary,
                raw_payload={
                    "source": article.source,
                    "sourceUrl": article.sourceUrl,
                    "tags": article.tags,
                },
            ))
        return records


class SkippedStructuredSourceAdapter(SourceAdapter):
    trust_tier = "strong"
    source_type = "structured"

    def __init__(self, source_key: str, source_name: str, reason: str, base_url: str | None = None):
        self.source_key = source_key
        self.source_name = source_name
        self.base_url = base_url
        self.reason = reason

    async def fetch(self):
        raise RuntimeError(f"SKIP:{self.reason}")


ADAPTERS = [
    StartupDirectoryAdapter(),
    ProductHuntAdapter(),
    HackerNewsAdapter(),
    GitHubAdapter(),
    JobsAdapter(),
    NewsFundingAdapter(),
    RedditAdapter(),
    SkippedStructuredSourceAdapter(
        "yc-directory",
        "YC Directory",
        "Stable structured YC access was not confirmed; skipping instead of scraping brittle pages.",
        "https://www.ycombinator.com/companies",
    ),
    SkippedStructuredSourceAdapter(
        "startup-india",
        "Startup India/DPIIT",
        "Stable public dataset/API was not configured; skipping until a reliable source URL is selected.",
        "https://www.startupindia.gov.in",
    ),
]
