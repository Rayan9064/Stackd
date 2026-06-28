# Stackd — The Open Source Indian Startup Ecosystem Hub

> One place for everything happening in the Indian startup ecosystem. Funding news, accelerator cohorts, investor profiles, startup jobs, and new product launches — all aggregated from public sources, always linking back to the original.

**We are an aggregator, not a replacement.** Every piece of content links to its original source.

---

## Features
- 📰 **Ecosystem News**: Curated news feeds from Inc42, YourStory, and TechCrunch India.
- 🎓 **Cohort Tracker**: Upcoming deadlines, geographies, and investment details for major accelerators.
- 💼 **Jobs Feed**: Latest startup job openings (never stores application data; always links to source).
- 💰 **Investor Directory**: Curated profiles of active venture capital funds and angels investing in India.
- 🚀 **Product Launches**: Recency-sorted releases aggregated from Product Hunt and Hacker News.
- 📧 **Weekly Digest**: Automatically compiled email roundup sent to subscribers every Sunday morning.

---

## Tech Stack
- **Frontend**: Next.js 14/15 (App Router, Tailwind CSS, TypeScript, shadcn/ui components)
- **Backend**: Python 3.11+ (FastAPI, APScheduler, Resend SDK)
- **Database**: PostgreSQL (Production) + SQLite local fallback (Development) using Prisma ORM

---

## Repository Structure
```
/stackd
├── frontend/                    # Next.js Application
│   ├── app/                     # Page views (news, cohorts, jobs, investors, launches, startups)
│   ├── components/              # Core UI cards, Feed components, Newsletter subscriptions
│   └── lib/                     # API client utilities, helper modules
├── backend/                     # FastAPI Application
│   ├── main.py                  # App initialization and lifecycles
│   ├── db.py                    # Prisma DB client exporter
│   ├── scheduler.py             # Scheduled scrapers and email dispatching
│   ├── setup_db.py              # Automatic database setup helper
│   ├── routes/                  # API router definitions
│   └── scrapers/                # Parser engines (RSS, HN, Product Hunt, Reddit, YC Jobs)
├── data/                        # JSON database directories (Community Maintained)
│   ├── cohorts.json             # Accelerator lists
│   ├── investors.json           # Investor lists
│   └── startups.json            # Startup profiles
├── vercel.json                  # Vercel deploy configuration
├── railway.json                 # Railway backend deploy configuration
└── Procfile                     # Railway startup commands
```

---

## Local Setup

### Prerequisite Checklist
Make sure you have the following installed:
- Node.js (v18+)
- Python (3.11+)
- Git

### 1. Database & Backend Configuration

1. Clone the repository and navigate into it:
   ```bash
   git clone https://github.com/your-username/stackd.git
   cd stackd
   ```

2. Copy the template env file:
   ```bash
   cp .env.example .env
   ```
   *Note: For local development, `DATABASE_URL` defaults to `file:./dev.db` (SQLite).*

3. Initialize the Python virtual environment and activate it:
   - **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

4. Install the required backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

5. Setup the local database:
   ```bash
   python backend/setup_db.py
   ```
   *This automatically rewrites the Prisma schema database provider to SQLite, pushes the schema, and generates the Python client.*

6. Start the FastAPI development server:
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```
   *The backend will be available at `http://localhost:8000`. You can inspect the interactive OpenAPI spec at `/docs`.*

---

### 2. Frontend Configuration

1. Open a new terminal window and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install the frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:3000`.*

---

## Scraper Run Schedule
The backend scheduler executes the scrapers periodically using APScheduler. Scraper intervals are configured as follows:
- **News Scraper** (`scrape_rss`): Runs every 2 hours (Inc42, YourStory, TechCrunch India).
- **HN Launch Scraper** (`scrape_hn`): Runs every 6 hours (Hacker News Algolia API).
- **Product Hunt Scraper** (`scrape_ph`): Runs every 24 hours (GraphQL API, requires `PH_API_KEY`).
- **Reddit Scraper** (`scrape_reddit`): Runs every 6 hours (Reddit API, requires client credentials).
- **Jobs Scraper** (`scrape_jobs`): Runs every 12 hours (YC job board parser).
- **Email Digest** (`send_weekly_digest`): Sends every Sunday at 9:00 AM IST (3:30 AM UTC, requires `RESEND_API_KEY`).

---

## Contributing

We welcome your contributions! To learn more about coding practices, adding data sources, or updating directory entries, please read our [CONTRIBUTING.md](CONTRIBUTING.md) guide.

### Core Guidelines:
1. **Always Attribute**: We are an aggregator. Never hide the source logo/text, and always link back to original URLs.
2. **Support Dark Mode**: Ensure any new components are fully responsive and support dark theme options using Tailwind `dark:` styles.
3. **Write Tests**: Keep the test suite passing by running `python -m pytest backend/tests/` before pushing code.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.