import json
from datetime import datetime, timedelta, timezone
from typing import Any

from backend.db import db, ensure_db_connected
from backend.ingestion.adapters import ADAPTERS
from backend.ingestion.types import NormalizedSignal, SourceAdapter
from backend.services.entity_resolver import (
    extract_domain,
    is_probable_company_name,
    normalize_name,
    slugify,
)

TRUST_RELIABILITY = {
    "strong": 0.85,
    "medium": 0.7,
    "weak": 0.55,
}


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def normalize_domain(value: str | None) -> str | None:
    return extract_domain(value)


def serialize(value: Any) -> str:
    return json.dumps(value or {}, default=str)


async def get_or_create_source(adapter: SourceAdapter):
    source = await db.source.find_unique(where={"slug": adapter.source_key})
    data = {
        "name": adapter.source_name,
        "slug": adapter.source_key,
        "type": adapter.source_type,
        "baseUrl": adapter.base_url,
        "reliability": TRUST_RELIABILITY.get(adapter.trust_tier, 0.65),
    }
    if source:
        return await db.source.update(where={"id": source.id}, data=data)
    return await db.source.create(data=data)


def validate_record(record: NormalizedSignal) -> str | None:
    if not record.source_key:
        return "missing_source_key"
    if not record.external_id:
        return "missing_external_id"
    if not record.signal_type:
        return "missing_signal_type"
    if not record.title:
        return "missing_title"
    if not record.url:
        return "missing_url"
    if not record.published_at:
        return "missing_published_at"
    return None


async def create_or_update_domain(company_id: str, domain: str | None, is_primary: bool = False) -> None:
    normalized = normalize_domain(domain)
    if not normalized:
        return
    existing = await db.companydomain.find_unique(where={"domain": normalized})
    if existing:
        return
    await db.companydomain.create(data={
        "companyId": company_id,
        "domain": normalized,
        "isPrimary": is_primary,
    })


async def find_company_by_domain(domain: str | None):
    normalized = normalize_domain(domain)
    if not normalized:
        return None

    company_domain = await db.companydomain.find_unique(where={"domain": normalized})
    if company_domain:
        return await db.company.find_unique(where={"id": company_domain.companyId})

    alias = await db.companyalias.find_unique(where={"domain": normalized})
    if alias:
        return await db.company.find_unique(where={"id": alias.companyId})

    companies = await db.company.find_many(take=1000)
    for company in companies:
        if normalize_domain(company.website) == normalized:
            await create_or_update_domain(company.id, normalized, True)
            return company
    return None


async def find_company_by_name(name: str | None):
    if not name:
        return None
    normalized = normalize_name(name)
    if not normalized:
        return None

    alias = await db.companyalias.find_unique(where={"normalizedAlias": normalized})
    if alias:
        return await db.company.find_unique(where={"id": alias.companyId})

    slug = slugify(name)
    company = await db.company.find_unique(where={"slug": slug})
    if company:
        return company

    companies = await db.company.find_many(take=1000)
    for existing in companies:
        if normalize_name(existing.name) == normalized:
            return existing
    return None


async def create_alias(company_id: str, alias: str | None, domain: str | None = None) -> None:
    if not alias:
        return
    normalized_alias = normalize_name(alias)
    if not normalized_alias:
        return
    existing = await db.companyalias.find_unique(where={"normalizedAlias": normalized_alias})
    if existing:
        return
    data = {
        "companyId": company_id,
        "alias": alias.strip(),
        "normalizedAlias": normalized_alias,
    }
    normalized_domain = normalize_domain(domain)
    if normalized_domain and not await db.companyalias.find_unique(where={"domain": normalized_domain}):
        data["domain"] = normalized_domain
    await db.companyalias.create(data=data)


async def create_company(record: NormalizedSignal, adapter: SourceAdapter):
    clean_name = (record.company_name_raw or "").strip()
    if not is_probable_company_name(clean_name, record.company_domain):
        return None

    domain = normalize_domain(record.company_domain)
    website = f"https://{domain}" if domain else None
    confidence = 0.86 if adapter.trust_tier == "strong" else 0.78

    company = await db.company.create(data={
        "name": clean_name,
        "slug": await unique_company_slug(clean_name),
        "website": website,
        "description": record.summary,
        "confidenceScore": confidence,
    })
    await create_alias(company.id, clean_name, domain)
    await create_or_update_domain(company.id, domain, True)
    return company


async def unique_company_slug(name: str) -> str:
    base = slugify(name)
    slug = base
    counter = 2
    while await db.company.find_unique(where={"slug": slug}):
        slug = f"{base}-{counter}"
        counter += 1
    return slug


async def resolve_company(record: NormalizedSignal, adapter: SourceAdapter):
    domain = normalize_domain(record.company_domain)
    company = await find_company_by_domain(domain)
    if company:
        await create_alias(company.id, record.company_name_raw, domain)
        await create_or_update_domain(company.id, domain, not company.website)
        return company, None

    company = await find_company_by_name(record.company_name_raw)
    if company:
        if adapter.trust_tier == "weak" and not domain:
            return None, "weak_source_name_only_match"
        await create_alias(company.id, record.company_name_raw, domain)
        await create_or_update_domain(company.id, domain, False)
        return company, None

    can_create = adapter.trust_tier == "strong" or (adapter.trust_tier == "medium" and bool(domain))
    if not can_create:
        return None, "source_not_allowed_to_create_company"

    company = await create_company(record, adapter)
    if not company:
        return None, "invalid_company_name"
    return company, None


async def create_unresolved(record: NormalizedSignal, source, reason: str) -> None:
    await db.unresolvedsignal.upsert(
        where={
            "sourceKey_externalId": {
                "sourceKey": record.source_key,
                "externalId": record.external_id,
            }
        },
        data={
            "create": {
                "sourceId": source.id if source else None,
                "sourceKey": record.source_key,
                "externalId": record.external_id,
                "reason": reason,
                "companyNameRaw": record.company_name_raw,
                "companyDomain": normalize_domain(record.company_domain),
                "signalType": record.signal_type,
                "title": record.title,
                "url": record.url,
                "publishedAt": record.published_at,
                "rawPayload": serialize(record.raw_payload),
            },
            "update": {
                "reason": reason,
                "companyNameRaw": record.company_name_raw,
                "companyDomain": normalize_domain(record.company_domain),
                "signalType": record.signal_type,
                "title": record.title,
                "url": record.url,
                "publishedAt": record.published_at,
                "rawPayload": serialize(record.raw_payload),
            },
        },
    )


async def find_duplicate_signal(company_id: str, record: NormalizedSignal):
    existing = await db.signal.find_unique(where={"url": record.url})
    if existing:
        return existing

    started = record.published_at - timedelta(days=7)
    finished = record.published_at + timedelta(days=7)
    candidates = await db.signal.find_many(
        where={
            "companyId": company_id,
            "type": record.signal_type,
            "occurredAt": {"gte": started, "lte": finished},
        },
        take=20,
    )
    title_key = normalize_name(record.title)
    for candidate in candidates:
        if normalize_name(candidate.title) == title_key:
            return candidate
        if normalize_domain(candidate.url) and normalize_domain(candidate.url) == normalize_domain(record.url):
            return candidate
    return None


async def create_or_attach_signal(company, source, record: NormalizedSignal):
    existing_source = await db.signalsource.find_unique(
        where={
            "sourceKey_externalId": {
                "sourceKey": record.source_key,
                "externalId": record.external_id,
            }
        }
    )
    if existing_source:
        return None, True

    signal = await find_duplicate_signal(company.id, record)
    if not signal:
        signal = await db.signal.create(data={
            "companyId": company.id,
            "sourceId": source.id,
            "type": record.signal_type,
            "title": record.title,
            "url": record.url,
            "summary": record.summary,
            "occurredAt": record.published_at,
            "metadata": serialize(record.raw_payload),
            "externalType": record.signal_type.lower(),
            "externalId": record.external_id,
        })

    await db.signalsource.create(data={
        "signalId": signal.id,
        "sourceId": source.id,
        "sourceKey": record.source_key,
        "externalId": record.external_id,
        "url": record.url,
        "rawPayload": serialize(record.raw_payload),
    })
    return signal, False


async def unique_founder_slug(name: str) -> str:
    base = slugify(name)
    slug = base
    counter = 2
    while await db.founder.find_unique(where={"slug": slug}):
        slug = f"{base}-{counter}"
        counter += 1
    return slug


async def get_or_create_founder(name: str, company, record: NormalizedSignal, adapter: SourceAdapter):
    clean_name = name.strip()
    normalized = normalize_name(clean_name)
    if not clean_name or not normalized:
        return None

    alias = await db.founderalias.find_unique(where={"normalizedAlias": normalized})
    if alias:
        founder = await db.founder.find_unique(where={"id": alias.founderId})
    else:
        if adapter.trust_tier != "strong" and not record.company_domain:
            return None
        founder = await db.founder.create(data={
            "name": clean_name,
            "slug": await unique_founder_slug(clean_name),
            "headline": f"Founder at {company.name}",
            "confidenceScore": 0.85 if adapter.trust_tier == "strong" else 0.7,
        })
        await db.founderalias.create(data={
            "founderId": founder.id,
            "alias": clean_name,
            "normalizedAlias": normalized,
        })

    existing_link = await db.companyfounder.find_unique(
        where={
            "companyId_founderId": {
                "companyId": company.id,
                "founderId": founder.id,
            }
        }
    )
    if not existing_link:
        await db.companyfounder.create(data={
            "companyId": company.id,
            "founderId": founder.id,
            "role": "founder",
            "title": "Founder",
            "sourceKey": record.source_key,
            "sourceUrl": record.url,
        })
    return founder


async def run_adapter(adapter: SourceAdapter):
    await ensure_db_connected()
    source = await get_or_create_source(adapter)
    started_at = now_utc()
    source_run = await db.sourcerun.create(data={
        "sourceId": source.id,
        "sourceKey": adapter.source_key,
        "status": "running",
        "startedAt": started_at,
    })

    stats = {
        "source": adapter.source_key,
        "status": "ok",
        "itemsFetched": 0,
        "itemsInserted": 0,
        "itemsDeduped": 0,
        "itemsUnresolved": 0,
        "errorMessage": None,
    }

    try:
        records = await adapter.fetch()
    except RuntimeError as exc:
        message = str(exc)
        if message.startswith("SKIP:"):
            stats["status"] = "skipped"
            stats["errorMessage"] = message.replace("SKIP:", "", 1)
        else:
            stats["status"] = "error"
            stats["errorMessage"] = message
        await db.sourcerun.update(where={"id": source_run.id}, data={
            "status": stats["status"],
            "finishedAt": now_utc(),
            "errorMessage": stats["errorMessage"],
        })
        return stats
    except Exception as exc:
        stats["status"] = "error"
        stats["errorMessage"] = str(exc)
        await db.sourcerun.update(where={"id": source_run.id}, data={
            "status": "error",
            "finishedAt": now_utc(),
            "errorMessage": str(exc),
        })
        return stats

    stats["itemsFetched"] = len(records)
    for record in records:
        validation_error = validate_record(record)
        if validation_error:
            await create_unresolved(record, source, validation_error)
            stats["itemsUnresolved"] += 1
            continue

        company, reason = await resolve_company(record, adapter)
        if not company:
            await create_unresolved(record, source, reason or "no_company_match")
            stats["itemsUnresolved"] += 1
            continue

        _, deduped = await create_or_attach_signal(company, source, record)
        if deduped:
            stats["itemsDeduped"] += 1
        else:
            stats["itemsInserted"] += 1

        for founder_name in record.founder_names:
            await get_or_create_founder(founder_name, company, record, adapter)

    await db.sourcerun.update(where={"id": source_run.id}, data={
        "status": stats["status"],
        "finishedAt": now_utc(),
        "itemsFetched": stats["itemsFetched"],
        "itemsInserted": stats["itemsInserted"],
        "itemsDeduped": stats["itemsDeduped"],
        "itemsUnresolved": stats["itemsUnresolved"],
        "errorMessage": stats["errorMessage"],
    })
    return stats


async def run_all_adapters(adapters=None):
    results = []
    for adapter in adapters or ADAPTERS:
        results.append(await run_adapter(adapter))
    return results
