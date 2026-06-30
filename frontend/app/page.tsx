import React from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import TrendingFeed from '@/components/TrendingFeed';
import DigestSignup from '@/components/DigestSignup';
import SearchBar from '@/components/SearchBar';

interface HomePageProps {
  searchParams: Promise<{
    geo?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const selectedGeo = resolvedParams.geo || 'all';

  // Map tab keys to DB geography filter values
  const geoMap: Record<string, string | undefined> = {
    all: undefined,
    americas: 'US,LATAM',
    europe: 'EU',
    asiapacific: 'SEA,INDIA',
    africa: 'AFRICA',
    global: 'GLOBAL',
  };

  const geography = geoMap[selectedGeo];

  // Fetch latest 5 items in parallel from the backend
  const [newsRes, launchesRes, jobsRes] = await Promise.all([
    api.getNews({ limit: 5, geography }),
    api.getLaunches({ limit: 5 }), // Launches are global (PH/HN/GitHub)
    api.getJobs({ limit: 5, geography }),
  ]);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'americas', label: 'Americas' },
    { key: 'europe', label: 'Europe' },
    { key: 'asiapacific', label: 'Asia Pacific' },
    { key: 'africa', label: 'Africa' },
    { key: 'global', label: 'Global' },
  ];

  return (
    <div className="space-y-10 py-4">
      {/* Hero section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto py-6">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-zinc-900 dark:text-zinc-50 font-heading">
          Stackd
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed max-w-2xl mx-auto">
          Everything happening in the global startup ecosystem, in one place. 
          Aggregated from public APIs worldwide, with original attribution for all data points.
        </p>
        
        {/* Global Search Bar */}
        <div className="pt-4 max-w-xl mx-auto">
          <SearchBar />
        </div>
      </div>

      {/* Email Digest Signup Form (Above the fold) */}
      <div className="max-w-2xl mx-auto">
        <DigestSignup />
      </div>

      {/* Geography Tabs */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2 gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
              Ecosystem Signals
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Live trending feed of mixed news, launches, and jobs.
            </p>
          </div>
          
          {/* Tabs UI */}
          <div className="flex flex-wrap gap-1 bg-zinc-100 dark:bg-zinc-900/60 p-1 rounded-lg self-start sm:self-center">
            {tabs.map((tab) => {
              const isActive = selectedGeo === tab.key;
              return (
                <Link
                  key={tab.key}
                  href={`/?geo=${tab.key}`}
                  scroll={false}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    isActive
                      ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* mixed trending feed */}
        <TrendingFeed
          news={newsRes?.data || []}
          launches={launchesRes?.data || []}
          jobs={jobsRes?.data || []}
        />
      </div>
    </div>
  );
}
