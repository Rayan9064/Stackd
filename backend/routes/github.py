from fastapi import APIRouter, Query
from typing import Optional
from backend.db import db, ensure_db_connected

router = APIRouter(prefix="/api/github", tags=["github"])

@router.get("")
async def get_github_repos(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    language: Optional[str] = Query(None)
):
    await ensure_db_connected()
        
    where = {}
    if language:
        # Case insensitive language search
        where["language"] = {"equals": language.strip(), "mode": "insensitive"}
        
    offset = (page - 1) * limit
    
    total = await db.githubrepo.count(where=where)
    repos = await db.githubrepo.find_many(
        where=where,
        order={"stars": "desc"},
        skip=offset,
        take=limit
    )
    
    data = []
    for r in repos:
        topics = r.topics
        if isinstance(topics, str):
            topics = [t.strip() for t in topics.split(",") if t.strip()] if topics else []
            
        data.append({
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "url": r.url,
            "sourceUrl": r.url,
            "stars": r.stars,
            "language": r.language,
            "topics": topics,
            "owner": r.owner,
            "fetchedAt": r.fetchedAt
        })
        
    return {
        "data": data,
        "total": total,
        "page": page,
        "limit": limit,
        "hasMore": offset + len(data) < total
    }
