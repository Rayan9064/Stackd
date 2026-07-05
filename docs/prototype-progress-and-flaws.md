# Stackd Prototype Progress And Flaws

## Snapshot

Stackd is an open source startup ecosystem intelligence prototype. It currently has a deployed frontend, backend, database, scheduled ingestion, source-run logging, curated startup profiles, and a first trust-first ingestion layer.

The product direction is correct, but the current implementation is not yet a reliable automated startup intelligence engine. The biggest unresolved flaw is data collection quality: Stackd can display source-backed profile data, but it does not yet collect rich startup, founder, social, funding, and ownership data automatically at scale.

Current deployment:

- Frontend: Next.js on Vercel
- Backend: FastAPI on Render
- Database: Neon PostgreSQL
- ORM: Prisma Python
- Scheduler: APScheduler on Render

## Current Product Shape

### Public UI

Current public tabs:

- News
- Funding
- Launches
- Cohorts
- Jobs
- Investors
- Startups
- Founders

Important change:

- The old public Companies section was removed from navigation because it exposed weak inferred graph records as if they were reliable company profiles.
- `/companies` and `/companies/{slug}` now redirect to `/startups`.
- Company graph concepts remain backend/internal for matching and evidence, but they are no longer a public product surface.
- The Startups section is now the primary public profile surface.
- The Founders tab exists, but it is intentionally marked "Coming soon" because real founder profile data is not yet being collected.

### Startup Profiles

The Startups page now displays curated startup profiles and links to detail pages:

- `/startups`
- `/startups/{id}`

Startup detail pages can show:

- Official website
- Social links
- Funding rounds
- Investors in a funding round
- Profile source links
- Ownership/shareholder donut visualization when sourced percentages exist
- Safe empty state when ownership data is unavailable

Current startup detail data comes from a temporary enrichment file:

- `data/startup_enrichment.json`

This file is source-backed and manually curated, but it is not a scalable collection system.

## Current Backend/API Progress

Implemented API areas:

- `GET /api/news`
- `GET /api/funding`
- `GET /api/launches`
- `GET /api/jobs`
- `GET /api/github`
- `GET /api/startups`
- `GET /api/startups/{id}`
- `GET /api/cohorts`
- `GET /api/investors`
- `GET /api/search`
- `GET /api/founders`
- `GET /api/founders/{slug}`
- `POST /api/admin/refresh`
- `POST /api/admin/backfill-signals`
- `GET /api/admin/source-runs`
- `GET /api/admin/unresolved-signals`
- `GET /api/admin/source-health`

The backend now supports:

- Source run logging
- Unresolved signal queue
- Trust-tiered source adapters
- Strong/medium/weak source policy
- Multi-source signal attribution
- Founder data models
- Company-domain matching model
- Automatic guarded refresh on backend startup

## Current Data Sources

### Curated Local Sources

These are currently the most reliable data surfaces:

- `data/startups.json`
  - Curated known startup profiles
  - Fields: name, website, sector, stage, geography, location, one-liner, total raised

- `data/startup_enrichment.json`
  - Temporary source-backed enrichment pack
  - Fields: social links, profile sources, funding rounds, investors, ownership slices when public percentages exist
  - This is currently manual and not scalable

- `data/investors.json`
  - Static investor directory

- `data/cohorts.json`
  - Static accelerator/cohort directory

### Automated/Adapter Sources

Current ingestion adapters:

- Startup Directory
  - Strong source
  - Creates curated startup/company graph records from local JSON

- Product Hunt
  - Strong source
  - Fetches product launches
  - Can create product/company graph records
  - Does not yet extract rich makers/founders/social/funding data

- Hacker News
  - Medium source
  - Fetches Show HN/product launch style signals
  - Should not create public startup profiles by itself

- GitHub
  - Medium source
  - Fetches trending/relevant repositories
  - Currently mostly unresolved unless matched safely
  - Should not create companies/startups by owner name alone

- Jobs feed
  - Weak source
  - Hiring signals only
  - Should attach only to existing matched startups

- News/RSS
  - Weak source
  - General ecosystem/funding signals
  - Current extraction is shallow
  - Should attach only when matched to known companies/domains

- Reddit
  - Weak source
  - Not currently meaningful
  - Should never create startup/company profiles directly

Skipped sources:

- YC Directory
  - Skipped because stable structured access was not confirmed

- Startup India/DPIIT
  - Skipped because stable public dataset/API was not configured

## What Works

- The app is deployed and usable.
- News, funding, launches, jobs, GitHub, cohorts, investors, startups, and founders routes exist.
- Startup profiles are now the main public profile surface.
- Weak inferred company records no longer pollute the public UI.
- Startup cards link to internal profile pages.
- Startup profile pages can show source-backed funding/social/ownership data.
- Source-run observability exists.
- Unresolved signals are preserved instead of being forced into company records.
- Backend refresh can run automatically on deploy/startup with cooldown:
  - `AUTO_REFRESH_ON_STARTUP=true`
  - `AUTO_REFRESH_COOLDOWN_HOURS=12`
- Frontend build passes.
- Backend tests pass.

## Main Flaws

### 1. Data Collection Is Still Not Robust

This is the biggest current flaw.

The product goal is to become a startup ecosystem intelligence platform, but Stackd does not yet have a scalable, reliable source collection layer for rich startup profiles.

Currently, the best startup profile data is manually curated through:

- `data/startups.json`
- `data/startup_enrichment.json`

This means the current product can display rich profiles only when we manually add them.

Missing automated collection:

- Official social handles
- Founder names
- Founder social profiles
- Funding round history
- Investor participation
- Ownership/shareholder data
- Official company press releases
- Public filings
- Product launch history
- Hiring signals tied to the right company
- News/funding articles tied to the right domain

### 2. `data/startup_enrichment.json` Is A Temporary Bootstrap, Not A Product Solution

The enrichment file is useful because it prevents garbage data from entering the UI.

But it is still a temporary manual dataset.

Problems:

- It does not scale beyond a small number of known startups.
- It requires manual source research.
- It does not prove automated collection capability.
- It can become stale.
- It does not solve founder discovery.
- It does not solve small startup discovery.
- It does not provide a repeatable ingestion workflow.

The file should be treated as a seed/canonical test fixture, not the final architecture.

### 3. Founder Profiles Are Not Real Yet

The database and endpoints exist:

- `GET /api/founders`
- `GET /api/founders/{slug}`

But there are currently no meaningful founder records because the pipeline does not ingest founder names from reliable sources.

The Founders UI is therefore correctly marked "Coming soon".

Founder data should only come from:

- Curated startup profiles with source links
- Product Hunt makers if API access provides stable maker data
- Official company/team pages when legally and structurally safe to scrape
- Public structured datasets
- Filings or investor/startup directories with explicit founder fields

Founder data should not be inferred from random article text, HN comments, Reddit posts, or GitHub owners.

### 4. Product Hunt Integration Is Still Too Shallow

Product Hunt is one of the best available sources, but current usage is limited.

Current Product Hunt usage:

- Fetch product launches
- Store launch records
- Create/attach graph signals

Missing:

- Makers/founders
- Product website/domain quality
- Product categories/topics
- Launch comments as weak context only
- Company social links
- Product logo/assets
- Related maker profiles

Product Hunt should become the first serious automated enrichment source.

### 5. Official Website Enrichment Does Not Exist Yet

For known startups, the most trustworthy next source is the company's own website.

Missing website enrichment:

- Extract official social links from homepage/footer
- Extract careers URL
- Extract blog/newsroom URL
- Extract press URL
- Extract team/founder page if linked
- Extract canonical domain metadata
- Extract logo
- Store crawl timestamp and source evidence

This should be implemented with strict rules:

- Only crawl the official website domain from curated startup profiles.
- Do not broad-crawl arbitrary web pages.
- Respect robots and request limits.
- Store exact source URL for every extracted field.
- Queue ambiguous fields for review.

### 6. Ownership/Shareholder Data Is Mostly Unavailable

The ownership donut UI exists, but it should only render when public percentages are available.

This is correct, but means most startups will show "ownership pending".

Reliable ownership data is hard for private startups.

Potential sources:

- Public company filings
- Annual reports
- SEC filings for public or filing entities
- Regulatory disclosures
- Official investor/company announcements with explicit percentages

For most private startups, investor participation can be shown, but shareholder percentages should remain unavailable unless sourced.

### 7. Entity Matching Is Better But Still Limited

The trust-first resolver is much safer than the earlier version, but it is still rule-based.

Remaining issues:

- Domain matching is basic.
- Alias matching is basic.
- There is no human review UI for unresolved signals.
- There is no merge/split workflow.
- There is no explanation for why a signal matched a startup.
- Product names and company names can still differ.
- GitHub repositories can still be hard to connect reliably.

### 8. Source Health Exists, But Data QA Workflow Does Not

Current observability:

- Source runs
- Source health
- Unresolved signals

Missing admin workflow:

- Review unresolved signals
- Accept/reject suggested matches
- Merge duplicate companies
- Approve new startup profiles
- Approve founder profiles
- Inspect field-level evidence
- Mark a source as bad/stale
- Backfill only selected sources

### 9. AI Is Not The Immediate Bottleneck

AI summaries would improve the product, but they should not be the next core priority until data quality improves.

Current issue:

- The product lacks reliable structured data.
- AI on weak data will produce weak intelligence.

Recommended sequencing:

1. Build trustworthy startup enrichment collection.
2. Add review/QA for extracted fields.
3. Then add Gemini/LLM summaries on top of verified evidence.

### 10. Startup Coverage Is Narrow

Current curated startups are mostly globally known companies.

This is useful for testing, but not enough for the real product.

The product needs a path to add smaller startups through:

- Official domain submission
- Product Hunt launches
- Accelerator cohorts
- Startup directories
- Startup India/DPIIT if reliable access is found
- YC directory if reliable access is found
- Manual PRs with source requirements

## Current Architecture Reality

The current architecture has two layers:

### Layer 1: Curated Profile Layer

Files:

- `data/startups.json`
- `data/startup_enrichment.json`

Purpose:

- Display reliable startup profile pages.
- Avoid showing weak inferred entities.
- Provide a controlled benchmark for future automated enrichment.

Status:

- Useful but manual.
- Not scalable.

### Layer 2: Signal Graph Layer

Tables/models:

- `Company`
- `CompanyDomain`
- `CompanyAlias`
- `Source`
- `SourceRun`
- `Signal`
- `SignalSource`
- `UnresolvedSignal`
- `Founder`
- `FounderAlias`
- `CompanyFounder`

Purpose:

- Collect external signals.
- Match signals to known entities.
- Preserve unresolved records.
- Provide evidence for future intelligence.

Status:

- Safer than before.
- Still not enough to create trustworthy public startup profiles automatically.

## Recommended Next Step

The next step should not be Gemini yet.

The next step should be an official-domain enrichment crawler for curated startups.

### Goal

Given a curated startup with an official website, collect source-backed fields:

- Official LinkedIn URL
- Official X/Twitter URL
- Official GitHub URL
- Blog/newsroom URL
- Careers URL
- Press/media URL
- Logo URL
- Team/founder page URL if clearly linked

### Rules

- Crawl only the official domain.
- Limit to homepage plus a small allowlist of internal pages.
- Do not infer founders from generic text.
- Do not create new startups from crawl results.
- Every extracted field must store:
  - value
  - source URL
  - extractedAt
  - confidence
  - extraction method
- Ambiguous fields go to a review queue.

### Backend Output

Create a structured model/table or JSON-backed interim format:

```json
{
  "startupId": "stripe",
  "field": "socialLinks.linkedin",
  "value": "https://www.linkedin.com/company/stripe",
  "sourceUrl": "https://stripe.com",
  "confidence": 0.95,
  "extractedAt": "2026-07-05T00:00:00Z"
}
```

### Why This Comes First

This creates a repeatable collection primitive.

If it works for Stripe/OpenAI/Notion/Revolut, it can work for smaller startups that provide a valid official domain.

## Recommended Next Step After That

Build a Product Hunt enrichment adapter:

- Fetch launches.
- Extract product website.
- Extract makers if available.
- Store maker profile URLs.
- Link maker/founder candidates to startup profile only when source-backed.
- Store launch topics/categories.
- Attach launch signal to curated startup by domain.
- Send unmatched launches to unresolved queue.

## Success Criteria For Next Development Stage

The next stage should be considered successful only if:

- At least 8 of 12 curated startups have automated official social links.
- At least 4 of 12 have source-backed funding round links.
- Founder endpoint returns real data only for profiles with source-backed founder fields.
- Weak sources do not create public startup profiles.
- Unresolved queue grows instead of polluting public UI.
- Startup detail pages show field-level source links.
- Manual JSON enrichment becomes optional fallback, not the primary mechanism.

## Current Product Assessment

Stackd is now safer and more honest than before. Removing the public Companies section was the right move because weak graph entities were damaging trust.

However, the current product is still not satisfying as an intelligence platform because the rich profile data is not collected automatically. The source-backed JSON enrichment file is a useful stopgap, but it proves presentation quality more than ingestion capability.

The next serious milestone is automated, source-backed enrichment from official domains and Product Hunt, with reviewable extracted fields. Until that exists, Stackd remains a curated aggregator with an early signal graph, not a robust intelligence engine.
