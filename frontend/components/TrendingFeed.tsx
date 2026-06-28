import React from 'react';
import { Article, Launch, Job } from '@/lib/api';
import ArticleCard from './ArticleCard';
import LaunchCard from './LaunchCard';
import JobCard from './JobCard';
import Link from 'next/link';
import { Newspaper, Rocket, Briefcase, ArrowRight } from 'lucide-react';

interface TrendingFeedProps {
  news: Article[];
  launches: Launch[];
  jobs: Job[];
}

export default function TrendingFeed({ news, launches, jobs }: TrendingFeedProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 1. News Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Newspaper size={18} className="text-zinc-400" />
            Ecosystem News
          </h2>
          <Link
            href="/news"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 inline-flex items-center gap-1 hover:underline"
          >
            All news <ArrowRight size={12} />
          </Link>
        </div>
        
        {news.length === 0 ? (
          <p className="text-sm text-zinc-400 py-4">No recent news available.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {news.slice(0, 5).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>

      {/* 2. Launches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Rocket size={18} className="text-zinc-400" />
            Product Launches
          </h2>
          <Link
            href="/launches"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 inline-flex items-center gap-1 hover:underline"
          >
            All launches <ArrowRight size={12} />
          </Link>
        </div>

        {launches.length === 0 ? (
          <p className="text-sm text-zinc-400 py-4">No recent product launches.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {launches.slice(0, 5).map((launch) => (
              <LaunchCard key={launch.id} launch={launch} />
            ))}
          </div>
        )}
      </div>

      {/* 3. Jobs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Briefcase size={18} className="text-zinc-400" />
            Startup Jobs
          </h2>
          <Link
            href="/jobs"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 inline-flex items-center gap-1 hover:underline"
          >
            All jobs <ArrowRight size={12} />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <p className="text-sm text-zinc-400 py-4">No recent job listings.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.slice(0, 5).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
