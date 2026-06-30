from fastapi import APIRouter, Query
from typing import Optional
from backend.db import db, ensure_db_connected

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.get("")
async def get_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    role: Optional[str] = Query(None),
    remote: Optional[bool] = Query(None),
    geography: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    await ensure_db_connected()
        
    where = {}
    
    if role:
        roles = [r.strip().lower() for r in role.split(",") if r.strip()]
        if len(roles) == 1:
            where["role"] = roles[0]
        else:
            where["role"] = {"in": roles}
            
    if remote is not None:
        where["remote"] = remote
        
    if geography:
        geographies = [g.strip().upper() for g in geography.split(",") if g.strip()]
        if len(geographies) == 1:
            where["geography"] = geographies[0]
        else:
            where["geography"] = {"in": geographies}
            
    if location:
        where["location"] = {"contains": location.strip()}
        
    if stage:
        stages = [s.strip().lower() for s in stage.split(",") if s.strip()]
        if len(stages) == 1:
            where["stage"] = stages[0]
        else:
            where["stage"] = {"in": stages}
            
    if search:
        search_lower = search.strip()
        where["OR"] = [
            {"title": {"contains": search_lower}},
            {"company": {"contains": search_lower}}
        ]
        
    offset = (page - 1) * limit
    
    total = await db.job.count(where=where)
    jobs = await db.job.find_many(
        where=where,
        order={"postedAt": "desc"},
        skip=offset,
        take=limit
    )
    
    data = []
    for job in jobs:
        data.append({
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "remote": job.remote,
            "equity": job.equity,
            "url": job.url,
            "sourceUrl": job.sourceUrl or job.url, # Original job post URL
            "source": job.source,
            "postedAt": job.postedAt,
            "role": job.role,
            "stage": job.stage,
            "geography": job.geography or "Global"
        })
        
    return {
        "data": data,
        "total": total,
        "page": page,
        "limit": limit,
        "hasMore": offset + len(data) < total
    }
