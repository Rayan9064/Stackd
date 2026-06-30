from fastapi import APIRouter, Query
from typing import Optional
from backend.db import db, ensure_db_connected

router = APIRouter(prefix="/api/launches", tags=["launches"])

@router.get("")
async def get_launches(
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
    source: Optional[str] = Query(None)
):
    await ensure_db_connected()
        
    offset = (page - 1) * limit
    
    if source == "github":
        total = await db.githubrepo.count()
        repos = await db.githubrepo.find_many(
            order={"stars": "desc"},
            skip=offset,
            take=limit
        )
        data = []
        for r in repos:
            data.append({
                "id": r.id,
                "title": r.name,
                "tagline": r.description,
                "description": r.description, # fallback for older frontend components
                "url": r.url,
                "sourceUrl": r.url,
                "source": "github",
                "upvotes": r.stars,
                "launchedAt": r.fetchedAt
            })
        return {
            "data": data,
            "total": total,
            "page": page,
            "limit": limit,
            "hasMore": offset + len(data) < total
        }
        
    where = {}
    if source:
        sources = [s.strip().lower() for s in source.split(",") if s.strip()]
        # Filter out github if mixed in standard launches table
        sources = [s for s in sources if s != "github"]
        if len(sources) == 1:
            where["source"] = sources[0]
        elif len(sources) > 1:
            where["source"] = {"in": sources}
            
    total = await db.launch.count(where=where)
    launches = await db.launch.find_many(
        where=where,
        order={"launchedAt": "desc"},
        skip=offset,
        take=limit
    )
    
    data = []
    for lnch in launches:
        data.append({
            "id": lnch.id,
            "title": lnch.title,
            "tagline": lnch.tagline,
            "description": lnch.tagline, # fallback
            "url": lnch.url,
            "sourceUrl": lnch.sourceUrl or lnch.url,
            "source": lnch.source,
            "upvotes": lnch.upvotes,
            "launchedAt": lnch.launchedAt
        })
        
    return {
        "data": data,
        "total": total,
        "page": page,
        "limit": limit,
        "hasMore": offset + len(data) < total
    }
