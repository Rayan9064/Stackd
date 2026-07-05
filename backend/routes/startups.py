import os
import json
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List

from backend.db import db, ensure_db_connected
from backend.routes.companies import founder_links, signal_stats
from backend.services.entity_resolver import extract_domain, normalize_name

router = APIRouter(tags=["startups-cohorts-investors"])

# Helper to read JSON data files
def read_json_data(filename: str):
    path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', filename)
    if not os.path.exists(path):
        path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', filename)
    if not os.path.exists(path):
        return None
        
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def read_startup_enrichment():
    data = read_json_data("startup_enrichment.json") or {}
    return data.get("startups", {})


def empty_graph_metadata():
    return {
        "graphSlug": None,
        "signalCount": 0,
        "sourceCount": 0,
        "sources": [],
        "founders": [],
        "domains": [],
    }


async def find_company_for_startup(startup: dict):
    domain = extract_domain(startup.get("website"))
    if domain:
        company_domain = await db.companydomain.find_unique(where={"domain": domain})
        if company_domain:
            return await db.company.find_unique(where={"id": company_domain.companyId})

        alias = await db.companyalias.find_unique(where={"domain": domain})
        if alias:
            return await db.company.find_unique(where={"id": alias.companyId})

        company = await db.company.find_first(where={"website": {"contains": domain}})
        if company:
            return company

    normalized_name = normalize_name(startup.get("name", ""))
    if normalized_name:
        alias = await db.companyalias.find_unique(where={"normalizedAlias": normalized_name})
        if alias:
            return await db.company.find_unique(where={"id": alias.companyId})

    slug = startup.get("id")
    if slug:
        return await db.company.find_unique(where={"slug": slug})
    return None


async def startup_graph_metadata(startup: dict):
    company = await find_company_for_startup(startup)
    if not company:
        return empty_graph_metadata()

    signal_count, sources = await signal_stats(company.id)
    domains = await db.companydomain.find_many(where={"companyId": company.id})
    return {
        "graphSlug": company.slug,
        "signalCount": signal_count,
        "sourceCount": len(sources),
        "sources": sources,
        "founders": await founder_links(company.id),
        "domains": [
            {
                "domain": domain.domain,
                "isPrimary": domain.isPrimary,
            }
            for domain in domains
        ],
    }


async def safe_startup_graph_metadata(startup: dict):
    try:
        await ensure_db_connected()
        return await startup_graph_metadata(startup)
    except Exception:
        return empty_graph_metadata()


def default_enrichment(startup: dict):
    return {
        "socialLinks": {},
        "profileSources": [
            {
                "label": "Official website",
                "type": "official",
                "url": startup.get("website"),
            }
        ] if startup.get("website") else [],
        "fundingRounds": [],
        "ownership": {
            "status": "unavailable",
            "note": "No source-backed ownership percentages have been added yet.",
            "asOf": None,
            "shareholders": [],
        },
    }


def merge_startup_enrichment(startup: dict, enrichment_map: dict):
    enrichment = enrichment_map.get(startup.get("id"), {})
    base = default_enrichment(startup)
    merged = {
        **base,
        **enrichment,
    }
    if not merged.get("profileSources"):
        merged["profileSources"] = base["profileSources"]
    if not merged.get("ownership"):
        merged["ownership"] = base["ownership"]
    return {
        **startup,
        **merged,
    }

@router.get("/api/startups")
async def get_startups(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    sector: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    geography: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    data_dict = read_json_data("startups.json")
    startups = data_dict.get("startups", []) if data_dict else []
    enrichment_map = read_startup_enrichment()
    
    filtered = startups
    if sector:
        sect_lower = sector.lower().strip()
        filtered = [s for s in filtered if sect_lower in s.get("sector", "").lower()]
        
    if stage:
        stage_lower = stage.lower().strip()
        filtered = [s for s in filtered if stage_lower in s.get("stage", "").lower()]
        
    if geography:
        geo_lower = geography.lower().strip()
        filtered = [s for s in filtered if geo_lower in s.get("geography", "").lower()]
        
    if search:
        q = search.lower().strip()
        filtered = [
            s for s in filtered
            if q in s.get("name", "").lower() or q in s.get("sector", "").lower() or q in s.get("oneLiner", "").lower()
        ]
        
    offset = (page - 1) * limit
    paginated = filtered[offset : offset + limit]
    
    data = []
    for s in paginated:
        enriched = merge_startup_enrichment(s, enrichment_map)
        graph_metadata = await safe_startup_graph_metadata(s)
        data.append({
            **enriched,
            "sourceUrl": s.get("website"),
            **graph_metadata,
        })
        
    return {
        "data": data,
        "total": len(filtered),
        "page": page,
        "limit": limit,
        "hasMore": offset + len(data) < len(filtered)
    }


@router.get("/api/startups/{startup_id}")
async def get_startup(startup_id: str):
    data_dict = read_json_data("startups.json")
    startups = data_dict.get("startups", []) if data_dict else []
    startup = next((item for item in startups if item.get("id") == startup_id), None)
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")

    enrichment_map = read_startup_enrichment()
    enriched = merge_startup_enrichment(startup, enrichment_map)
    graph_metadata = await safe_startup_graph_metadata(startup)
    return {
        **enriched,
        "sourceUrl": startup.get("website"),
        **graph_metadata,
    }

@router.get("/api/cohorts")
async def get_cohorts(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    geography: Optional[str] = Query(None),
    open: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    data_dict = read_json_data("cohorts.json")
    cohorts = data_dict.get("cohorts", []) if data_dict else []
    
    filtered = cohorts
    
    if geography:
        geo_lower = geography.lower().strip()
        filtered = [c for c in filtered if geo_lower in c.get("geography", "").lower()]
        
    if open is not None:
        is_open = open.lower() == "true"
        filtered = [c for c in filtered if c.get("open") == is_open]
        
    if search:
        q = search.lower().strip()
        filtered = [
            c for c in filtered
            if q in c.get("name", "").lower() or any(q in s.lower() for s in c.get("sectors", []))
        ]
        
    # Sort by deadline ascending
    def get_deadline_key(c):
        d = c.get("deadline", "")
        return d if d else "9999-12-31"
        
    sorted_cohorts = sorted(filtered, key=get_deadline_key)
    
    offset = (page - 1) * limit
    paginated = sorted_cohorts[offset : offset + limit]
    
    data = []
    for c in paginated:
        data.append({
            **c,
            "sourceUrl": c.get("sourceUrl") or c.get("applyUrl")
        })
        
    return {
        "data": data,
        "total": len(sorted_cohorts),
        "page": page,
        "limit": limit,
        "hasMore": offset + len(data) < len(sorted_cohorts)
    }

@router.get("/api/investors")
async def get_investors(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    sector: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    geography: Optional[str] = Query(None),
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
            if any(stage_lower in stg.lower() for stg in inv.get("stage", [])) or any(stage_lower in stg.lower() for stg in inv.get("stages", []))
        ]
        
    if geography:
        geo_lower = geography.lower().strip()
        filtered = [
            inv for inv in filtered
            if geo_lower in inv.get("geography", "").lower()
        ]
        
    if search:
        q = search.lower().strip()
        filtered = [
            inv for inv in filtered
            if q in inv.get("name", "").lower() or q in inv.get("firm", "").lower() or q in inv.get("thesis", "").lower()
        ]
        
    offset = (page - 1) * limit
    paginated = filtered[offset : offset + limit]
    
    data = []
    for inv in paginated:
        data.append({
            **inv,
            "sourceUrl": inv.get("sourceUrl") or inv.get("website")
        })
        
    return {
        "data": data,
        "total": len(filtered),
        "page": page,
        "limit": limit,
        "hasMore": offset + len(data) < len(filtered)
    }
