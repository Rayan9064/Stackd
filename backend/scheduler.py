import os
import logging
from datetime import datetime, timedelta, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import resend
from jinja2 import Template
from backend.db import db

# Import fetchers
from backend.fetchers.news_fetcher import scrape_rss
from backend.fetchers.hn_fetcher import scrape_hn
from backend.fetchers.ph_fetcher import scrape_ph
from backend.fetchers.reddit_fetcher import scrape_reddit
from backend.fetchers.jobs_fetcher import scrape_jobs
from backend.fetchers.github_fetcher import scrape_github
from backend.fetchers.indiehackers_fetcher import scrape_indiehackers

logger = logging.getLogger("scheduler")
logging.basicConfig(level=logging.INFO)

scheduler = AsyncIOScheduler()

# Email template for the weekly digest
EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Stackd Global Startup Digest</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; background-color: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; margin-top: 20px; }
    .header { border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #111827; text-decoration: none; }
    .subtitle { color: #4b5563; font-size: 14px; margin-top: 4px; }
    .section-title { font-size: 18px; font-weight: 600; color: #111827; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px; margin-top: 24px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
    .item { margin-bottom: 16px; }
    .item-title { font-size: 16px; font-weight: 500; margin: 0; }
    .item-link { color: #111827; text-decoration: none; border-bottom: 1px solid #d1d5db; }
    .item-link:hover { border-bottom-color: #111827; }
    .item-meta { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .item-summary { font-size: 14px; color: #374151; margin-top: 4px; margin-bottom: 0; }
    .source-badge { display: inline-block; background-color: #f3f4f6; color: #374151; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; margin-right: 6px; }
    .footer { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 4px; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; }
    .unsubscribe-link { color: #9ca3af; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://stackd.global" class="logo">Stackd</a>
      <div class="subtitle">Your weekly roundup of the global startup ecosystem. Aggregated from public sources.</div>
    </div>

    {% if articles %}
    <div class="section-title">Startup News</div>
    {% for article in articles %}
    <div class="item">
      <h3 class="item-title">
        <a href="{{ article.url }}" class="item-link">{{ article.title }}</a>
      </h3>
      <div class="item-meta">
        <span class="source-badge">{{ article.source }}</span>
        {{ article.publishedAt.strftime('%b %d, %Y') }}
      </div>
      <p class="item-summary">{{ article.summary }}</p>
    </div>
    {% endfor %}
    {% endif %}

    {% if launches %}
    <div class="section-title">New Product Launches</div>
    {% for launch in launches %}
    <div class="item">
      <h3 class="item-title">
        <a href="{{ launch.url }}" class="item-link">{{ launch.title }}</a>
      </h3>
      <div class="item-meta">
        <span class="source-badge">{{ launch.source }}</span>
        ▲ {{ launch.upvotes }} upvotes
      </div>
      <p class="item-summary">{{ launch.description }}</p>
    </div>
    {% endfor %}
    {% endif %}

    {% if jobs %}
    <div class="section-title">Recent Startup Jobs</div>
    {% for job in jobs %}
    <div class="item">
      <h3 class="item-title">
        <a href="{{ job.url }}" class="item-link">{{ job.title }} at {{ job.company }}</a>
      </h3>
      <div class="item-meta">
        <span class="source-badge">{{ job.source }}</span>
        📍 {{ job.location }} {% if job.salaryRange %}• 💰 {{ job.salaryRange }}{% endif %}
      </div>
    </div>
    {% endfor %}
    {% endif %}

    <div class="footer">
      <p>You are receiving this because you subscribed to the Stackd weekly digest.</p>
      <p><a href="https://stackd.global/unsubscribe" class="unsubscribe-link">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
"""

async def send_weekly_digest():
    logger.info("Starting weekly digest compile and dispatch...")
    
    if not db.is_connected():
        await db.connect()
        
    resend_api_key = os.environ.get("RESEND_API_KEY")
    from_email = os.environ.get("RESEND_FROM_EMAIL", "digest@example.com")
    
    # 1. Fetch subscribers
    subscribers = await db.digestsubscriber.find_many(where={"active": True})
    if not subscribers:
        logger.info("No active subscribers found. Skipping digest email.")
        return
        
    # 2. Fetch content from the last 7 days
    one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    
    articles = await db.article.find_many(
        where={
            "publishedAt": {"gte": one_week_ago}
        },
        order={"publishedAt": "desc"},
        take=5
    )
    
    launches = await db.launch.find_many(
        where={
            "launchedAt": {"gte": one_week_ago}
        },
        order={"upvotes": "desc"},
        take=5
    )
    
    jobs = await db.job.find_many(
        where={
            "postedAt": {"gte": one_week_ago}
        },
        order={"postedAt": "desc"},
        take=5
    )
    
    # Render template
    template = Template(EMAIL_TEMPLATE)
    html_content = template.render(
        articles=articles,
        launches=launches,
        jobs=jobs
    )
    
    if not resend_api_key:
        logger.warning("RESEND_API_KEY is not set. Saving digest HTML output to local folder for debugging...")
        debug_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'debug')
        os.makedirs(debug_dir, exist_ok=True)
        debug_file = os.path.join(debug_dir, f"digest_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html")
        with open(debug_file, "w", encoding="utf-8") as f:
            f.write(html_content)
        logger.info(f"Saved local debug digest at {debug_file}")
        return

    resend.api_key = resend_api_key
    
    # 3. Send to each subscriber
    success_count = 0
    for sub in subscribers:
        try:
            resend.Emails.send({
                "from": f"Stackd <{from_email}>",
                "to": sub.email,
                "subject": "Weekly Startup Ecosystem Digest — Stackd",
                "html": html_content
            })
            success_count += 1
        except Exception as e:
            logger.error(f"Error sending email to {sub.email}: {e}")
            
    logger.info(f"Successfully sent weekly digest to {success_count}/{len(subscribers)} subscribers")

def setup_scheduler():
    # Schedule fetchers
    scheduler.add_job(scrape_rss, 'interval', hours=2, id='scrape_rss', replace_existing=True)
    scheduler.add_job(scrape_indiehackers, 'interval', hours=2, id='scrape_indiehackers', replace_existing=True)
    scheduler.add_job(scrape_hn, 'interval', hours=6, id='scrape_hn', replace_existing=True)
    scheduler.add_job(scrape_ph, 'interval', hours=24, id='scrape_ph', replace_existing=True)
    scheduler.add_job(scrape_reddit, 'interval', hours=6, id='scrape_reddit', replace_existing=True)
    scheduler.add_job(scrape_jobs, 'interval', hours=12, id='scrape_jobs', replace_existing=True)
    scheduler.add_job(scrape_github, 'interval', hours=24, id='scrape_github', replace_existing=True)
    
    # Schedule weekly digest (Sunday 9:00 AM UTC)
    scheduler.add_job(
        send_weekly_digest,
        CronTrigger(day_of_week='sun', hour=9, minute=0, timezone=timezone.utc),
        id='send_weekly_digest',
        replace_existing=True
    )
    
    logger.info("APScheduler jobs configured successfully")
