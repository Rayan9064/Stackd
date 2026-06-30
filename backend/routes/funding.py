from fastapi import APIRouter, Query
from typing import Optional
from backend.db import db, ensure_db_connected

router = APIRouter(prefix="/api/funding", tags=["funding"])

@router.get("")
async def get_funding_rounds(
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
    geography: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    await ensure_db_connected()
        
    where = {}
    
    # Funding keywords to filter articles
    funding_keywords = ["raise", "raises", "raised", "funding", "round", "invest", "investment", "seed", "series", "capital", "fundraise", "fundraising"]
    
    # Filter for funding articles
    or_filters = [
        {"title": {"contains": kw}} for kw in funding_keywords
    ]
    
    # Add search query if provided
    if search:
        search_lower = search.strip().lower()
        # Intersect with search filter by ensuring the title or summary contains it
        where["AND"] = [
            {"OR": or_filters},
            {"OR": [
                {"title": {"contains": search_lower}},
                {"summary": {"contains": search_lower}}
            ]}
        ]
    else:
        where["OR"] = or_filters
        
    if geography:
        geographies = [g.strip().upper() for g in geography.split(",") if g.strip()]
        if len(geographies) == 1:
            where["geography"] = geographies[0]
        else:
            where["geography"] = {"in": geographies}
            
    if stage:
        stage_clean = stage.strip().lower().replace("-", " ")
        # Add filter to search the title for the stage keyword (e.g. "seed", "series a")
        if "AND" in where:
            where["AND"].append({"title": {"contains": stage_clean}})
        else:
            # We must wrap existing conditions or use AND
            existing_or = where.pop("OR", None)
            where["AND"] = []
            if existing_or:
                where["AND"].append({"OR": existing_or})
            where["AND"].append({"title": {"contains": stage_clean}})
            
    offset = (page - 1) * limit
    
    total = await db.article.count(where=where)
    articles = await db.article.find_many(
        where=where,
        order={"publishedAt": "desc"},
        skip=offset,
        take=limit
    )
    
    data = []
    for art in articles:
        tags = art.tags
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
            
        data.append({
            "id": art.id,
            "title": art.title,
            "url": art.url,
            "sourceUrl": art.sourceUrl or art.url,
            "summary": art.summary,
            "source": art.source,
            "geography": art.geography or "Global",
            "publishedAt": art.publishedAt,
            "tags": tags,
            "createdAt": art.createdAt
        })
        
    return {
        "data": data,
        "total": total,
        "page": page,
        "limit": limit,
        "hasMore": offset + len(data) < total
    }
