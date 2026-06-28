import React from 'react';
import { api } from '@/lib/api';
import TrendingFeed from '@/components/TrendingFeed';
import DigestSignup from '@/components/DigestSignup';

// Revalidate this page every hour (ISR)
export const revalidate = 3600;

export default async function HomePage() {
  // Fetch latest 5 items in parallel from the backend
  const [newsRes, launchesRes, jobsRes] = await Promise.all([
    api.getNews({ limit: 5 }),
    api.getLaunches({ limit: 5 }),
    api.getJobs({ limit: 5 })
  ]);

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="space-y-2 max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">
          Indian Startup Ecosystem Aggregator
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed">
          Aggregating accelerator cohorts, funding news, jobs, and launches in one minimal interface. 
          Everything links back to the original source.
        </p>
      </div>

      {/* Email Digest Signup Form */}
      <DigestSignup />

      {/* Combined Feeds */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
            What happened this week
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            The trending summary of the Indian startup ecosystem. Updated in real-time.
          </p>
        </div>
        <TrendingFeed
          news={newsRes?.data || []}
          launches={launchesRes?.data || []}
          jobs={jobsRes?.data || []}
        />
      </div>
    </div>
  );
}
