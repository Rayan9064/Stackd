# Stackd - Open Source Global Startup Ecosystem Intelligence

> One place for everything in the global startup ecosystem. Funding rounds, accelerator cohorts, investor profiles, startup jobs, and product launches, aggregated from public APIs and feeds worldwide with every item linking back to its original source.

**We are an aggregator. We claim ownership of nothing. Every item links to its source.**

## What Makes Stackd Different

- Global by default: Americas, Europe, SEA, India, LATAM, Africa, and Global.
- Works with zero API keys: Hacker News, RSS feeds, local JSON directories, and SQLite are enough for a demo.
- Cross-entity search: one query across startups, investors, news, jobs, cohorts, and launches.
- Community data: `data/cohorts.json`, `data/investors.json`, and `data/startups.json` are open for PRs.
- No accounts: the only user data stored is digest subscriber email.

## Stack

- Frontend: Next.js App Router, Tailwind CSS, shadcn-style components.
- Backend: Python FastAPI, APScheduler, Prisma Client Python.
- Database: SQLite for local development, PostgreSQL for production.
- Email: Resend for digest delivery.

## Quick Start

### 1. Backend

```powershell
git clone https://github.com/your-username/stackd.git
cd stackd
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

Populate local data immediately:

```powershell
Invoke-RestMethod -Method Post http://127.0.0.1:8000/api/admin/refresh
```

### 2. Frontend

Open a second terminal:

```powershell
cd stackd\frontend
npm install
npm run dev
```

The frontend runs at `http://127.0.0.1:3000` or `http://localhost:3000`.

For local development, `NEXT_PUBLIC_API_URL` should be:

```env
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
```

## Environment Variables

Backend:

```env
DATABASE_URL="file:./dev.db"
RESEND_API_KEY=""
RESEND_FROM_EMAIL="digest@example.com"
PH_API_KEY=""
REDDIT_CLIENT_ID=""
REDDIT_CLIENT_SECRET=""
GITHUB_TOKEN=""
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://your-vercel-domain.vercel.app"
```

Frontend:

```env
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
```

Production notes:

- `DATABASE_URL` should be your Railway PostgreSQL connection string.
- `NEXT_PUBLIC_API_URL` should be your deployed Railway backend URL.
- `RESEND_API_KEY` is only required for sending digest emails.
- Product Hunt, Reddit, and GitHub tokens are optional. Missing optional keys must not crash the app.

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

- News RSS: every 2 hours.
- Indie Hackers RSS: every 2 hours.
- Hacker News: every 6 hours.
- Reddit: every 6 hours, skipped unless credentials are present.
- Product Hunt: every 24 hours, skipped unless `PH_API_KEY` is present.
- GitHub: every 24 hours, works without a token but benefits from `GITHUB_TOKEN`.
- Jobs: every 12 hours.
- Weekly digest: Sunday 09:00 UTC.

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

## License

MIT
