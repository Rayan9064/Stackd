import os
import json
from fastapi import APIRouter, Query
from typing import Optional, List

router = APIRouter(tags=["startups-cohorts-investors"])

# Helper to read JSON data files
def read_json_data(filename: str):
    # Path relative to workspace root (parent of backend)
    path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', filename)
    if not os.path.exists(path):
        # Fallback if run inside backend directory
        path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', filename)
    if not os.path.exists(path):
        # Fallback to local copy
        return None
        
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

@router.get("/api/startups")
async def get_startups(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    sector: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    data_dict = read_json_data("startups.json")
    startups = data_dict.get("startups", []) if data_dict else []
    
    # Filter
    filtered = startups
    if sector:
        sect_lower = sector.lower().strip()
        filtered = [s for s in filtered if sect_lower in s.get("sector", "").lower()]
        
    if stage:
        stage_lower = stage.lower().strip()
        filtered = [s for s in filtered if stage_lower in s.get("stage", "").lower()]
        
    if search:
        q = search.lower().strip()
        filtered = [
            s for s in filtered
            if q in s.get("name", "").lower() or q in s.get("sector", "").lower() or q in s.get("oneLiner", "").lower()
        ]
        
    # Paginate
    offset = (page - 1) * limit
    paginated = filtered[offset : offset + limit]
    
    # Map to return sourceUrl (website) for each startup profile
    data = []
    for s in paginated:
        data.append({
            **s,
            "sourceUrl": s.get("website")
        })
        
    return {
        "data": data,
        "total": len(filtered),
        "page": page,
        "limit": limit
    }

@router.get("/api/cohorts")
async def get_cohorts():
    data_dict = read_json_data("cohorts.json")
    cohorts = data_dict.get("cohorts", []) if data_dict else []
    
    # Sort by deadline ascending
    # Parse deadlines formatted as YYYY-MM-DD
    def get_deadline_key(c):
        d = c.get("deadline", "")
        return d if d else "9999-12-31"
        
    sorted_cohorts = sorted(cohorts, key=get_deadline_key)
    
    # Map sourceUrl (applyUrl)
    data = []
    for c in sorted_cohorts:
        data.append({
            **c,
            "sourceUrl": c.get("applyUrl")
        })
        
    return {
        "data": data,
        "total": len(sorted_cohorts),
        "page": 1,
        "limit": len(sorted_cohorts)
    }

@router.get("/api/investors")
async def get_investors(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    sector: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    data_dict = read_json_data("investors.json")
    investors = data_dict.get("investors", []) if data_dict else []
    
    filtered = investors
    
    if sector:
        sect_lower = sector.lower().strip()
        filtered = [
            inv for inv in filtered
            if any(sect_lower in s.lower() for s in inv.get("sectors", []))
        ]
        
    if stage:
        stage_lower = stage.lower().strip()
        filtered = [
            inv for inv in filtered
            if any(stage_lower in stg.lower() for stg in inv.get("stage", []))
        ]
        
    if search:
        q = search.lower().strip()
        filtered = [
            inv for inv in filtered
            if q in inv.get("name", "").lower() or q in inv.get("firm", "").lower() or q in inv.get("thesis", "").lower()
        ]
        
    offset = (page - 1) * limit
    paginated = filtered[offset : offset + limit]
    
    # Map sourceUrl (website)
    data = []
    for inv in paginated:
        data.append({
            **inv,
            "sourceUrl": inv.get("website")
        })
        
    return {
        "data": data,
        "total": len(filtered),
        "page": page,
        "limit": limit
    }
