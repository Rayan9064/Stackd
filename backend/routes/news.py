from fastapi import APIRouter, Query
from typing import Optional
from backend.db import db, ensure_db_connected

router = APIRouter(prefix="/api/news", tags=["news"])

@router.get("")
async def get_news(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    source: Optional[str] = Query(None),
    geography: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    await ensure_db_connected()
        
    where = {}
    
    if source:
        # Support comma-separated sources (e.g. source=inc42,yourstory)
        sources = [s.strip().lower() for s in source.split(",") if s.strip()]
        if len(sources) == 1:
            where["source"] = sources[0]
        else:
            where["source"] = {"in": sources}
            
    if geography:
        geographies = [g.strip().upper() for g in geography.split(",") if g.strip()]
        # Capitalize and clean inputs (e.g. SEA, EU, US, INDIA, GLOBAL)
        # Note: map inputs like "Americas" or "US" to database representations
        if len(geographies) == 1:
            where["geography"] = geographies[0]
        else:
            where["geography"] = {"in": geographies}
            
    if search:
        search_lower = search.strip()
        where["OR"] = [
            {"title": {"contains": search_lower}},
            {"summary": {"contains": search_lower}}
        ]
        
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
        # SQLite tags might be stored as comma-separated string, parse if needed
        tags = art.tags
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
            
        data.append({
            "id": art.id,
            "title": art.title,
            "url": art.url,
            "sourceUrl": art.sourceUrl or art.url,  # link back to original content
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
