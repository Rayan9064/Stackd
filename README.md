# Stackd - Open Source Global Startup Ecosystem Intelligence

> One place for everything happening in the global startup ecosystem: funding rounds, accelerator cohorts, investor profiles, startup jobs, product launches, GitHub projects, and startup news. Stackd aggregates public feeds and APIs, and every item links back to its original source.

**Stackd is an aggregator. It does not claim ownership of syndicated content.**

## What Makes Stackd Different

- Global by default: Americas, Europe, SEA, India, LATAM, Africa, and Global.
- Works without paid APIs: RSS feeds, Hacker News, GitHub public search, local JSON directories, and SQLite are enough for a demo.
- Cross-entity search across startups, investors, news, jobs, cohorts, launches, and repositories.
- Community data in `data/cohorts.json`, `data/investors.json`, and `data/startups.json`.
- No accounts: the only user data stored is digest subscriber email.
- Free-tier friendly scheduler: ingestion jobs run every 24 hours, and demos can use manual refresh.

## Stack

- Frontend: Next.js App Router, React, Tailwind CSS, Base UI/shadcn-style components.
- Backend: Python FastAPI, APScheduler, Prisma Client Python.
- Database: SQLite for local development, Neon/PostgreSQL for production.
- Hosting: Vercel for frontend, Render for backend, Neon for Postgres.
- Email: Resend for digest delivery.

## Live Deployment

- Frontend: `https://stackd-startups.vercel.app`
- Backend: `https://stackd-backend-4cb7.onrender.com`

Render free instances can sleep. The first request after inactivity may be slow.

## Quick Start

### 1. Backend

```powershell
git clone https://github.com/Rayan9064/Stackd.git
cd Stackd
copy .env.example .env

python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt

python backend\setup_db.py
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

The backend runs at `http://127.0.0.1:8000`.

Check it:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

Populate data immediately:

```powershell
Invoke-RestMethod -Method Post http://127.0.0.1:8000/api/admin/refresh
```

### 2. Frontend

Open a second terminal:

```powershell
cd Stackd\frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

For local development:

```env
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
```

## Environment Variables

### Backend

Set these on Render for the backend service:

```env
PYTHON_VERSION="3.11.9"
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
CORS_ORIGINS="https://stackd-startups.vercel.app,http://localhost:3000,http://127.0.0.1:3000"
RESEND_API_KEY=""
RESEND_FROM_EMAIL="digest@example.com"
PH_API_KEY=""
REDDIT_CLIENT_ID=""
REDDIT_CLIENT_SECRET=""
GITHUB_TOKEN=""
```

Notes:

- Local development can use `DATABASE_URL="file:./dev.db"`.
- Use Neon’s pooled Postgres connection string in production.
- `RESEND_API_KEY` is only required for sending digest emails.
- Product Hunt, Reddit, and GitHub tokens are optional. Missing optional keys should not crash the app.
- `GITHUB_TOKEN` is recommended for higher GitHub API rate limits.
- If Prisma has trouble with Neon, use `sslmode=require` and omit `channel_binding=require`.

### Frontend

Set this on Vercel for the frontend project:

```env
NEXT_PUBLIC_API_URL="https://stackd-backend-4cb7.onrender.com"
```

Do not put backend secrets in Vercel.

## Deployment

### Backend on Render

Create a Render Web Service from the repository:

- Runtime: Python 3
- Branch: `main`
- Root Directory: `backend`
- Build Command:

```bash
pip install -r requirements.txt && python setup_db.py
```

- Start Command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

`setup_db.py` handles Prisma schema setup, `prisma db push`, client generation, and copies the Prisma query engine binary into the app directory for Render runtime.

After deploy:

```powershell
Invoke-RestMethod https://stackd-backend-4cb7.onrender.com/health
Invoke-RestMethod -Method Post https://stackd-backend-4cb7.onrender.com/api/admin/refresh
```

### Frontend on Vercel

Import the repository into Vercel:

- Framework: Next.js
- Root Directory: `frontend`
- Environment Variable: `NEXT_PUBLIC_API_URL`

After changing `NEXT_PUBLIC_API_URL`, redeploy the frontend. The API-backed pages are rendered dynamically and fetch backend data with `cache: no-store`.

## API

All list responses include:

```json
{ "data": [], "total": 0, "page": 1, "limit": 50, "hasMore": false }
```

Important routes:

- `GET /health`
- `GET /api/news`
- `GET /api/launches`
- `GET /api/jobs`
- `GET /api/funding`
- `GET /api/startups`
- `GET /api/cohorts`
- `GET /api/investors`
- `GET /api/github`
- `GET /api/search?q=ai`
- `POST /api/digest/subscribe`
- `POST /api/admin/refresh`

## Fetch Schedule

- News RSS: every 24 hours.
- Indie Hackers RSS: every 24 hours.
- Hacker News: every 24 hours.
- Reddit: every 24 hours, skipped unless credentials are present.
- Product Hunt: every 24 hours, skipped unless `PH_API_KEY` is present.
- GitHub: every 24 hours, works without a token but benefits from `GITHUB_TOKEN`.
- Jobs: every 24 hours.
- Weekly digest: Sunday 09:00 UTC.

On Render free tier, APScheduler only runs while the backend service is awake. Use `POST /api/admin/refresh` after deploys or before demos.

## Adding Data

Community-maintained JSON files live in `data/`.

- Add accelerators to `data/cohorts.json`.
- Add investors to `data/investors.json`.
- Add startup profiles to `data/startups.json`.

Always include a `sourceUrl`.

## Verification

Useful checks before shipping:

```powershell
python -m pytest backend\tests -q
cd frontend
npm run lint
npm run build
```

Then run:

```powershell
Invoke-RestMethod -Method Post http://127.0.0.1:8000/api/admin/refresh
Invoke-RestMethod http://127.0.0.1:8000/api/news
Invoke-RestMethod http://127.0.0.1:8000/api/search?q=ai
```

For production:

```powershell
Invoke-RestMethod https://stackd-backend-4cb7.onrender.com/health
Invoke-RestMethod https://stackd-backend-4cb7.onrender.com/api/news
```

## License

MIT
