import React from 'react';
import { api } from '@/lib/api';
import JobCard from '@/components/JobCard';
import JobsClient from './JobsClient';

// Revalidate this page every hour (ISR)
export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{
    role?: string;
    location?: string;
    stage?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1;
  const role = resolvedParams.role || '';
  const location = resolvedParams.location || '';
  const stage = resolvedParams.stage || '';
  const search = resolvedParams.search || '';
  const limit = 12;

  // Fetch jobs from backend API
  const jobsRes = await api.getJobs({
    page,
    limit,
    role,
    location,
    stage,
    search
  });

  const jobs = jobsRes?.data || [];
  const totalItems = jobsRes?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Startup Jobs Board
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Aggregated startup career opportunities in India. Always linking back to the original listing.
        </p>
      </div>

      {/* Filter and Search Bar (Client component) */}
      <JobsClient currentPage={page} totalPages={totalPages} />

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No jobs match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
