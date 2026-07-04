import os
import json
from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any
from backend.db import db, ensure_db_connected
from backend.routes.companies import company_to_dict, is_publishable_company, signal_stats

router = APIRouter(prefix="/api/search", tags=["search"])

def read_json_data(filename: str):
    path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', filename)
    if not os.path.exists(path):
        path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', filename)
    if not os.path.exists(path):
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

@router.get("")
async def global_search(
    q: str = Query("", min_length=0),
    types: Optional[str] = Query(None)
):
    await ensure_db_connected()
        
    query_str = q.strip().lower()
    
    # Parse requested types
    requested_types = []
    if types:
        requested_types = [t.strip().lower() for t in types.split(",") if t.strip()]
    else:
        requested_types = ["companies", "startups", "news", "jobs", "investors", "cohorts", "launches"]
        
    results: Dict[str, Any] = {}

    if "companies" in requested_types:
        where = {}
        if query_str:
            where["OR"] = [
                {"name": {"contains": query_str}},
                {"description": {"contains": query_str}},
                {"sector": {"contains": query_str}},
            ]
        companies = await db.company.find_many(
            where=where,
            order={"updatedAt": "desc"},
            take=100,
        )
        company_results = []
        for company in companies:
            signal_count, sources = await signal_stats(company.id)
            if is_publishable_company(company, signal_count, sources):
                company_results.append(await company_to_dict(company, signal_count, sources))
            if len(company_results) >= 20:
                break
        results["companies"] = company_results
    
    # 1. Search News (Articles)
    if "news" in requested_types:
        where = {}
        if query_str:
            where["OR"] = [
                {"title": {"contains": query_str}},
                {"summary": {"contains": query_str}}
            ]
        articles = await db.article.find_many(
            where=where,
            order={"publishedAt": "desc"},
            take=20
        )
        results["news"] = [
            {
                "id": art.id,
                "title": art.title,
                "url": art.url,
                "sourceUrl": art.sourceUrl or art.url,
                "summary": art.summary,
                "source": art.source,
                "geography": art.geography or "Global",
                "publishedAt": art.publishedAt
            }
            for art in articles
        ]
        
    # 2. Search Jobs
    if "jobs" in requested_types:
        where = {}
        if query_str:
            where["OR"] = [
                {"title": {"contains": query_str}},
                {"company": {"contains": query_str}},
                {"location": {"contains": query_str}}
            ]
        jobs = await db.job.find_many(
            where=where,
            order={"postedAt": "desc"},
            take=20
        )
        results["jobs"] = [
            {
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "remote": job.remote,
                "url": job.url,
                "sourceUrl": job.sourceUrl or job.url,
                "source": job.source,
                "postedAt": job.postedAt,
                "role": job.role,
                "stage": job.stage,
                "geography": job.geography or "Global"
            }
            for job in jobs
        ]
        
    # 3. Search Launches (Show HNs + Product Hunts)
    if "launches" in requested_types:
        where = {}
        if query_str:
            where["OR"] = [
                {"title": {"contains": query_str}},
                {"tagline": {"contains": query_str}}
            ]
        launches = await db.launch.find_many(
            where=where,
            order={"launchedAt": "desc"},
            take=20
        )
        results["launches"] = [
            {
                "id": l.id,
                "title": l.title,
                "tagline": l.tagline,
                "description": l.tagline,
                "url": l.url,
                "sourceUrl": l.sourceUrl or l.url,
                "source": l.source,
                "upvotes": l.upvotes,
                "launchedAt": l.launchedAt
            }
            for l in launches
        ]
        
    # 4. Search JSON Startups
    if "startups" in requested_types:
        data_dict = read_json_data("startups.json")
        startups = data_dict.get("startups", []) if data_dict else []
        if query_str:
            startups = [
                s for s in startups
                if query_str in s.get("name", "").lower() or query_str in s.get("sector", "").lower() or query_str in s.get("oneLiner", "").lower()
            ]
        results["startups"] = [
            {
                **s,
                "sourceUrl": s.get("website")
            }
            for s in startups[:20]
        ]
        
    # 5. Search JSON Investors
    if "investors" in requested_types:
        data_dict = read_json_data("investors.json")
        investors = data_dict.get("investors", []) if data_dict else []
        if query_str:
            investors = [
                inv for inv in investors
                if query_str in inv.get("name", "").lower() or query_str in inv.get("firm", "").lower() or query_str in inv.get("thesis", "").lower()
            ]
        results["investors"] = [
            {
                **inv,
                "sourceUrl": inv.get("website")
            }
            for inv in investors[:20]
        ]
        
    # 6. Search JSON Cohorts
    if "cohorts" in requested_types:
        data_dict = read_json_data("cohorts.json")
        cohorts = data_dict.get("cohorts", []) if data_dict else []
        if query_str:
            cohorts = [
                c for c in cohorts
                if query_str in c.get("name", "").lower() or any(query_str in s.lower() for s in c.get("sectors", []))
            ]
        results["cohorts"] = [
            {
                **c,
                "sourceUrl": c.get("applyUrl")
            }
            for c in cohorts[:20]
        ]
        
    return results
