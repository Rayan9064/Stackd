from fastapi import APIRouter, HTTPException, Query

from backend.db import db, ensure_db_connected

router = APIRouter(prefix="/api/companies", tags=["companies"])


def company_to_dict(company, signal_count: int = 0):
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
        "createdAt": company.createdAt,
        "updatedAt": company.updatedAt,
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

    offset = (page - 1) * limit
    total = await db.company.count(where=where)
    companies = await db.company.find_many(
        where=where,
        order={"updatedAt": "desc"},
        skip=offset,
        take=limit,
    )

    data = []
    for company in companies:
        signal_count = await db.signal.count(where={"companyId": company.id})
        data.append(company_to_dict(company, signal_count))

    return {
        "data": data,
        "total": total,
        "page": page,
        "limit": limit,
        "hasMore": offset + len(data) < total,
    }


@router.get("/{slug}")
async def get_company(slug: str):
    await ensure_db_connected()
    company = await db.company.find_unique(where={"slug": slug})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    aliases = await db.companyalias.find_many(where={"companyId": company.id})
    signals = await db.signal.find_many(
        where={"companyId": company.id},
        order={"occurredAt": "desc"},
        take=50,
    )

    return {
        **company_to_dict(company, len(signals)),
        "aliases": [
            {
                "alias": alias.alias,
                "domain": alias.domain,
            }
            for alias in aliases
        ],
        "signals": [
            {
                "id": signal.id,
                "type": signal.type,
                "title": signal.title,
                "url": signal.url,
                "summary": signal.summary,
                "occurredAt": signal.occurredAt,
                "metadata": signal.metadata,
                "externalType": signal.externalType,
                "externalId": signal.externalId,
            }
            for signal in signals
        ],
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
        "data": [
            {
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
            }
            for signal in signals
        ],
        "total": len(signals),
    }
