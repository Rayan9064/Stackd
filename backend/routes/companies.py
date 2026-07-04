from fastapi import APIRouter, HTTPException, Query

from backend.db import db, ensure_db_connected

router = APIRouter(prefix="/api/companies", tags=["companies"])


TRUSTED_COMPANY_SOURCES = {"Startup Directory", "Product Hunt"}


async def signal_stats(company_id: str):
    signals = await db.signal.find_many(where={"companyId": company_id})
    source_ids = set()
    for signal in signals:
        if signal.sourceId:
            source_ids.add(signal.sourceId)
        signal_sources = await db.signalsource.find_many(where={"signalId": signal.id})
        source_ids.update(signal_source.sourceId for signal_source in signal_sources if signal_source.sourceId)
    source_ids = sorted(source_ids)
    sources = []
    for source_id in source_ids:
        source = await db.source.find_unique(where={"id": source_id})
        if source:
            sources.append({
                "id": source.id,
                "name": source.name,
                "slug": source.slug,
                "type": source.type,
            })
    return len(signals), sources


async def founder_links(company_id: str):
    links = await db.companyfounder.find_many(where={"companyId": company_id})
    founders = []
    for link in links:
        founder = await db.founder.find_unique(where={"id": link.founderId})
        if founder:
            founders.append({
                "id": founder.id,
                "name": founder.name,
                "slug": founder.slug,
                "headline": founder.headline,
                "geography": founder.geography,
                "linkedinUrl": founder.linkedinUrl,
                "xUrl": founder.xUrl,
                "website": founder.website,
                "role": link.role,
                "title": link.title,
                "sourceUrl": link.sourceUrl,
            })
    return founders


def is_publishable_company(company, signal_count: int, sources: list[dict]) -> bool:
    source_names = {source["name"] for source in sources}
    return (
        bool(company.website)
        or bool(source_names & TRUSTED_COMPANY_SOURCES)
        or len(source_names) >= 2
        or (signal_count >= 2 and company.confidenceScore >= 0.8)
    )


async def company_to_dict(company, signal_count: int = 0, sources: list[dict] | None = None):
    sources = sources or []
    domains = await db.companydomain.find_many(where={"companyId": company.id})
    return {
        "id": company.id,
        "name": company.name,
        "slug": company.slug,
        "website": company.website,
        "description": company.description,
        "sector": company.sector,
        "stage": company.stage,
        "geography": company.geography,
        "location": company.location,
        "country": company.country,
        "logoUrl": company.logoUrl,
        "confidenceScore": company.confidenceScore,
        "signalCount": signal_count,
        "sourceCount": len(sources),
        "sources": sources,
        "domains": [
            {
                "domain": domain.domain,
                "isPrimary": domain.isPrimary,
            }
            for domain in domains
        ],
        "founders": await founder_links(company.id),
        "createdAt": company.createdAt,
        "updatedAt": company.updatedAt,
    }


async def signal_to_dict(signal):
    source = None
    if signal.sourceId:
        source_record = await db.source.find_unique(where={"id": signal.sourceId})
        if source_record:
            source = {
                "id": source_record.id,
                "name": source_record.name,
                "slug": source_record.slug,
                "type": source_record.type,
            }
    signal_sources = await db.signalsource.find_many(where={"signalId": signal.id})
    sources = []
    for signal_source in signal_sources:
        if signal_source.sourceId:
            source_record = await db.source.find_unique(where={"id": signal_source.sourceId})
            if source_record:
                sources.append({
                    "id": source_record.id,
                    "name": source_record.name,
                    "slug": source_record.slug,
                    "type": source_record.type,
                    "externalId": signal_source.externalId,
                    "url": signal_source.url,
                })
    return {
        "id": signal.id,
        "companyId": signal.companyId,
        "type": signal.type,
        "title": signal.title,
        "url": signal.url,
        "summary": signal.summary,
        "occurredAt": signal.occurredAt,
        "metadata": signal.metadata,
        "externalType": signal.externalType,
        "externalId": signal.externalId,
        "sourceId": signal.sourceId,
        "source": source,
        "sources": sources,
    }


@router.get("")
async def get_companies(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    sector: str | None = Query(None),
    geography: str | None = Query(None),
    search: str | None = Query(None),
):
    await ensure_db_connected()
    where = {}
    if sector:
        where["sector"] = {"contains": sector.strip()}
    if geography:
        where["geography"] = {"contains": geography.strip()}
    if search:
        q = search.strip()
        where["OR"] = [
            {"name": {"contains": q}},
            {"description": {"contains": q}},
            {"sector": {"contains": q}},
        ]

    companies = await db.company.find_many(
        where=where,
        order={"updatedAt": "desc"},
        take=1000,
    )

    publishable = []
    for company in companies:
        signal_count, sources = await signal_stats(company.id)
        if is_publishable_company(company, signal_count, sources):
            publishable.append(await company_to_dict(company, signal_count, sources))

    offset = (page - 1) * limit
    data = publishable[offset:offset + limit]

    return {
        "data": data,
        "total": len(publishable),
        "page": page,
        "limit": limit,
        "hasMore": offset + len(data) < len(publishable),
    }


@router.get("/{slug}")
async def get_company(slug: str):
    await ensure_db_connected()
    company = await db.company.find_unique(where={"slug": slug})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    aliases = await db.companyalias.find_many(where={"companyId": company.id})
    signal_count, sources = await signal_stats(company.id)
    signals = await db.signal.find_many(
        where={"companyId": company.id},
        order={"occurredAt": "desc"},
        take=50,
    )

    company_data = await company_to_dict(company, signal_count, sources)
    return {
        **company_data,
        "aliases": [
            {
                "alias": alias.alias,
                "domain": alias.domain,
            }
            for alias in aliases
        ],
        "signals": [await signal_to_dict(signal) for signal in signals],
    }


@router.get("/{slug}/signals")
async def get_company_signals(
    slug: str,
    signal_type: str | None = Query(None, alias="type"),
    limit: int = Query(50, ge=1, le=100),
):
    await ensure_db_connected()
    company = await db.company.find_unique(where={"slug": slug})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    where = {"companyId": company.id}
    if signal_type:
        where["type"] = signal_type

    signals = await db.signal.find_many(
        where=where,
        order={"occurredAt": "desc"},
        take=limit,
    )
    return {
        "data": [await signal_to_dict(signal) for signal in signals],
        "total": len(signals),
    }
