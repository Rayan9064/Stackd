import React from 'react';
import { api } from '@/lib/api';
import LaunchCard from '@/components/LaunchCard';
import LaunchesClient from './LaunchesClient';

// Revalidate this page every hour (ISR)
export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{
    source?: string;
    page?: string;
  }>;
}

export default async function LaunchesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1;
  const source = resolvedParams.source || '';
  const limit = 12;

  // Fetch launches from backend API
  const launchesRes = await api.getLaunches({
    page,
    limit,
    source
  });

  const launches = launchesRes?.data || [];
  const totalItems = launchesRes?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          New Product Launches
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Trending startup launches, Show HNs, and Product Hunt posts sorted by recency.
        </p>
      </div>

      {/* Filter and Search Bar (Client component) */}
      <LaunchesClient currentPage={page} totalPages={totalPages} />

      {/* Launches Grid */}
      {launches.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No product launches match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {launches.map((launch) => (
            <LaunchCard key={launch.id} launch={launch} />
          ))}
        </div>
      )}
    </div>
  );
}
