from fastapi import APIRouter, Query
from typing import Optional
from backend.db import db

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.get("")
async def get_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    role: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    if not db.is_connected():
        await db.connect()
        
    where = {}
    
    if role:
        roles = [r.strip().lower() for r in role.split(",") if r.strip()]
        if len(roles) == 1:
            where["role"] = roles[0]
        else:
            where["role"] = {"in": roles}
            
    if location:
        # Simple case-insensitive contains match for location, e.g. "bangalore" in "Bangalore, India"
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
            "equity": job.equity,
            "salaryRange": job.salaryRange,
            "url": job.url,
            "sourceUrl": job.url, # Original job post URL
            "source": job.source,
            "postedAt": job.postedAt,
            "role": job.role,
            "stage": job.stage
        })
        
    return {
        "data": data,
        "total": total,
        "page": page,
        "limit": limit
    }
