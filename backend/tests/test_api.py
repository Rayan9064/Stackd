from fastapi.testclient import TestClient
from backend.main import app

def test_all_endpoints_sequentially():
    # Use TestClient as a context manager to run startup/shutdown lifespans once
    with TestClient(app) as client:
        # 1. Health check
        res_health = client.get("/health")
        assert res_health.status_code == 200
        assert res_health.json()["status"] == "ok"
        
        # 2. News API
        res_news = client.get("/api/news?limit=5")
        assert res_news.status_code == 200
        assert "data" in res_news.json()
        assert "total" in res_news.json()
        
        # 3. Launches API
        res_launches = client.get("/api/launches?limit=5")
        assert res_launches.status_code == 200
        assert "data" in res_launches.json()
        assert "total" in res_launches.json()
        
        # 4. Jobs API
        res_jobs = client.get("/api/jobs?limit=5")
        assert res_jobs.status_code == 200
        assert "data" in res_jobs.json()
        assert "total" in res_jobs.json()
        
        # 5. Startups API
        res_startups = client.get("/api/startups?limit=5")
        assert res_startups.status_code == 200
        assert "data" in res_startups.json()
        assert "total" in res_startups.json()
        
        # 6. Cohorts API
        res_cohorts = client.get("/api/cohorts")
        assert res_cohorts.status_code == 200
        assert "data" in res_cohorts.json()
        assert len(res_cohorts.json()["data"]) > 0
        
        # 7. Investors API
        res_investors = client.get("/api/investors?limit=5")
        assert res_investors.status_code == 200
        assert "data" in res_investors.json()
        assert "total" in res_investors.json()
        
        # 8. Subscription API
        res_sub = client.post("/api/digest/subscribe", json={"email": "test_subscriber@example.com"})
        assert res_sub.status_code == 200
        msg = res_sub.json()["message"].lower()
        assert "subscribed" in msg or "already" in msg or "success" in msg or "updated" in msg
