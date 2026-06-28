# Contributing to Stackd

Thank you for your interest in contributing to Stackd! As an open-source Indian startup ecosystem hub, we rely on community-maintained data and scrapers to keep this platform accurate, clean, and comprehensive.

## Code of Conduct
We are built to help the Indian startup ecosystem. Be supportive, respect the work of others, and help us maintain data integrity. We do not claim ownership of aggregated content — we always attribute and link back to original sources.

## How to Contribute

### 1. Adding or Updating Investors / Cohorts / Startups
The directory files are located under `/data`:
- `data/investors.json` (Investor directory)
- `data/cohorts.json` (Accelerator cohorts and deadlines)
- `data/startups.json` (Startup profiles)

To add or update an entry:
1. Fork this repository.
2. Edit the corresponding JSON file.
   - For an investor, follow the schema: `name`, `firm`, `thesis`, `sectors[]`, `chequeMin`, `chequeMax`, `currency`, `xHandle`, `linkedinUrl`, `website`, `location`, `stage[]`.
   - For a cohort, follow the schema: `name`, `deadline` (YYYY-MM-DD), `investmentAmount`, `geography`, `sectors[]`, `applyUrl`.
   - For a startup, follow the schema: `id`, `name`, `sector`, `stage`, `location`, `oneLiner`, `fundingTotal`, `website`.
3. Submit a Pull Request. Your change will be live upon merge.

### 2. Adding a Data Source / Scraper
Our scrapers are located in `backend/scrapers/`. To add a new RSS feed, REST API, or web scraper:
1. Create a new scraper python file under `backend/scrapers/`.
2. Implement your scraping logic. Ensure it handles failures gracefully (log error, do not crash the scheduler).
3. Connect it to the database using the shared client `from backend.db import db`.
4. Import your scraper in `backend/scheduler.py` and schedule it with an appropriate interval.
5. Create a Pull Request with details about the new source.

### 3. Reporting Issues or Requesting Features
- Open an issue on GitHub.
- Clearly describe the bug or feature request.
- For incorrect data/profiles, submitting a PR to update the JSON file is preferred and much faster!

## Local Development Setup
Please see the [README.md](README.md) for full instructions on setting up the backend and frontend locally.
