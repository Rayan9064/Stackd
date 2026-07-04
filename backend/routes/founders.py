from fastapi import APIRouter, HTTPException, Query

from backend.db import db, ensure_db_connected

router = APIRouter(prefix="/api/founders", tags=["founders"])


async def founder_to_dict(founder):
    links = await db.companyfounder.find_many(where={"founderId": founder.id})
    companies = []
    for link in links:
        company = await db.company.find_unique(where={"id": link.companyId})
        if company:
            companies.append({
                "id": company.id,
                "name": company.name,
                "slug": company.slug,
                "role": link.role,
                "title": link.title,
                "sourceUrl": link.sourceUrl,
            })
    return {
        "id": founder.id,
        "name": founder.name,
        "slug": founder.slug,
        "headline": founder.headline,
        "geography": founder.geography,
        "linkedinUrl": founder.linkedinUrl,
        "xUrl": founder.xUrl,
        "website": founder.website,
        "confidenceScore": founder.confidenceScore,
        "companies": companies,
        "createdAt": founder.createdAt,
        "updatedAt": founder.updatedAt,
    }


@router.get("")
async def get_founders(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: str | None = Query(None),
):
    await ensure_db_connected()
    where = {}
    if search:
        q = search.strip()
        where["OR"] = [
            {"name": {"contains": q}},
            {"headline": {"contains": q}},
            {"geography": {"contains": q}},
        ]

    offset = (page - 1) * limit
    total = await db.founder.count(where=where)
    founders = await db.founder.find_many(
        where=where,
        order={"updatedAt": "desc"},
        skip=offset,
        take=limit,
    )
    return {
        "data": [await founder_to_dict(founder) for founder in founders],
        "total": total,
        "page": page,
        "limit": limit,
        "hasMore": offset + len(founders) < total,
    }


@router.get("/{slug}")
async def get_founder(slug: str):
    await ensure_db_connected()
    founder = await db.founder.find_unique(where={"slug": slug})
    if not founder:
        raise HTTPException(status_code=404, detail="Founder not found")
    aliases = await db.founderalias.find_many(where={"founderId": founder.id})
    return {
        **await founder_to_dict(founder),
        "aliases": [
            {
                "alias": alias.alias,
                "normalizedAlias": alias.normalizedAlias,
            }
            for alias in aliases
        ],
    }
