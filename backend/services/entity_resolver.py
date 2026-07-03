import json
import re
from datetime import datetime, timezone
from typing import Any, Optional
from urllib.parse import urlparse

from backend.db import db, ensure_db_connected


SOURCE_SEEDS = [
    {"name": "Startup Directory", "slug": "startup-directory", "type": "manual", "baseUrl": None, "reliability": 0.85},
    {"name": "Funding Feed", "slug": "funding-feed", "type": "derived", "baseUrl": None, "reliability": 0.7},
    {"name": "Product Hunt", "slug": "product-hunt", "type": "api", "baseUrl": "https://www.producthunt.com", "reliability": 0.8},
    {"name": "Hacker News", "slug": "hacker-news", "type": "api", "baseUrl": "https://news.ycombinator.com", "reliability": 0.75},
    {"name": "GitHub", "slug": "github", "type": "api", "baseUrl": "https://github.com", "reliability": 0.75},
    {"name": "Jobs Feed", "slug": "jobs-feed", "type": "api", "baseUrl": None, "reliability": 0.7},
    {"name": "News Feed", "slug": "news-feed", "type": "rss", "baseUrl": None, "reliability": 0.65},
]


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "company"


def normalize_name(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"\b(inc|inc\.|llc|ltd|limited|pvt|private|technologies|technology|labs|ai)\b", "", value)
    return re.sub(r"[^a-z0-9]+", "", value)


def extract_domain(url: Optional[str]) -> Optional[str]:
    if not url:
        return None
    parsed = urlparse(url if "://" in url else f"https://{url}")
    domain = parsed.netloc.lower().replace("www.", "")
    return domain or None


async def seed_sources() -> None:
    await ensure_db_connected()
    for source in SOURCE_SEEDS:
        existing = await db.source.find_unique(where={"slug": source["slug"]})
        if existing:
            continue
        await db.source.create(data=source)


async def get_source(source_name: str, source_type: str = "derived", base_url: Optional[str] = None):
    await ensure_db_connected()
    slug = slugify(source_name)
    source = await db.source.find_unique(where={"slug": slug})
    if source:
        return source
    return await db.source.create(data={
        "name": source_name,
        "slug": slug,
        "type": source_type,
        "baseUrl": base_url,
        "reliability": 0.65,
    })


async def _unique_company_slug(name: str) -> str:
    base = slugify(name)
    slug = base
    counter = 2
    while await db.company.find_unique(where={"slug": slug}):
        slug = f"{base}-{counter}"
        counter += 1
    return slug


async def _create_alias(company_id: str, alias: str, domain: Optional[str] = None) -> None:
    normalized_alias = normalize_name(alias)
    if not normalized_alias:
        return
    existing = await db.companyalias.find_unique(where={"normalizedAlias": normalized_alias})
    if existing:
        return
    data = {
        "companyId": company_id,
        "alias": alias,
        "normalizedAlias": normalized_alias,
    }
    if domain:
        domain_existing = await db.companyalias.find_unique(where={"domain": domain})
        if not domain_existing:
            data["domain"] = domain
    await db.companyalias.create(data=data)


async def resolve_company(
    name: str,
    website: Optional[str] = None,
    description: Optional[str] = None,
    sector: Optional[str] = None,
    stage: Optional[str] = None,
    geography: Optional[str] = None,
    location: Optional[str] = None,
    confidence_score: float = 0.75,
):
    await ensure_db_connected()
    clean_name = name.strip()
    if not clean_name:
        raise ValueError("Company name is required")

    domain = extract_domain(website)
    normalized_alias = normalize_name(clean_name)

    if website:
        company = await db.company.find_unique(where={"website": website})
        if company:
            await _create_alias(company.id, clean_name, domain)
            return company

    if domain:
        alias = await db.companyalias.find_unique(where={"domain": domain})
        if alias:
            return await db.company.find_unique(where={"id": alias.companyId})

    alias = await db.companyalias.find_unique(where={"normalizedAlias": normalized_alias})
    if alias:
        return await db.company.find_unique(where={"id": alias.companyId})

    slug = slugify(clean_name)
    company = await db.company.find_unique(where={"slug": slug})
    if company:
        await _create_alias(company.id, clean_name, domain)
        return company

    company = await db.company.create(data={
        "name": clean_name,
        "slug": await _unique_company_slug(clean_name),
        "website": website,
        "description": description,
        "sector": sector,
        "stage": stage,
        "geography": geography,
        "location": location,
        "confidenceScore": confidence_score,
    })
    await _create_alias(company.id, clean_name, domain)
    return company


async def create_signal(
    company,
    source_name: str,
    signal_type: str,
    title: str,
    url: str,
    summary: Optional[str] = None,
    occurred_at: Optional[datetime] = None,
    metadata: Optional[dict[str, Any]] = None,
    external_type: Optional[str] = None,
    external_id: Optional[str] = None,
):
    await ensure_db_connected()
    existing = await db.signal.find_unique(where={"url": url})
    if existing:
        return existing

    source = await get_source(source_name)
    return await db.signal.create(data={
        "companyId": company.id,
        "sourceId": source.id,
        "type": signal_type,
        "title": title,
        "url": url,
        "summary": summary,
        "occurredAt": occurred_at or now_utc(),
        "metadata": json.dumps(metadata or {}),
        "externalType": external_type,
        "externalId": external_id,
    })
