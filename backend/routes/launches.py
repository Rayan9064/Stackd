from fastapi import APIRouter, Query
from typing import Optional
from backend.db import db

router = APIRouter(prefix="/api/launches", tags=["launches"])

@router.get("")
async def get_launches(
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
    source: Optional[str] = Query(None)
):
    if not db.is_connected():
        await db.connect()
        
    where = {}
    if source:
        sources = [s.strip().lower() for s in source.split(",") if s.strip()]
        if len(sources) == 1:
            where["source"] = sources[0]
        else:
            where["source"] = {"in": sources}
            
    offset = (page - 1) * limit
    
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
            "description": lnch.description,
            "url": lnch.url,
            "sourceUrl": lnch.url, # Always link to original source
            "source": lnch.source,
            "upvotes": lnch.upvotes,
            "launchedAt": lnch.launchedAt
        })
        
    return {
        "data": data,
        "total": total,
        "page": page,
        "limit": limit
    }
