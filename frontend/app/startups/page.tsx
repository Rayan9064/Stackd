import React from 'react';
import { api } from '@/lib/api';
import StartupCard from '@/components/StartupCard';
import StartupsClient from './StartupsClient';
import { Activity, Database, Plus, RadioTower } from 'lucide-react';

// Always render with current backend data.
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    sector?: string;
    stage?: string;
    geography?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function StartupsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1;
  const sector = resolvedParams.sector || '';
  const stage = resolvedParams.stage || '';
  const geography = resolvedParams.geography || '';
  const search = resolvedParams.search || '';
  const limit = 12;

  // Fetch startups from backend API
  const startupsRes = await api.getStartups({
    page,
    limit,
    sector,
    stage,
    geography,
    search
  });

  const startups = startupsRes?.data || [];
  const totalItems = startupsRes?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);
  const totalSignals = startups.reduce((sum, startup) => sum + (startup.signalCount || 0), 0);
  const pageSources = new Set(startups.flatMap((startup) => (startup.sources || []).map((source) => source.name)));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-zinc-100 pb-6 dark:border-zinc-900">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <RadioTower size={14} />
              Source-backed startup layer
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Startup Directory
            </h1>
            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Curated startup profiles, enriched with trusted source evidence only when Stackd can safely match it.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="mb-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <Database size={13} />
                  Profiles
                </div>
                <div className="font-mono text-lg font-semibold text-zinc-950 dark:text-zinc-50">{totalItems}</div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="mb-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <Activity size={13} />
                  Page Signals
                </div>
                <div className="font-mono text-lg font-semibold text-zinc-950 dark:text-zinc-50">{totalSignals}</div>
              </div>
              <div className="col-span-2 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 sm:col-span-1">
                <div className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">Page Sources</div>
                <div className="font-mono text-lg font-semibold text-zinc-950 dark:text-zinc-50">{pageSources.size}</div>
              </div>
            </div>

            <a
              href="https://github.com/Rayan9064/Stackd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-1.5 bg-white dark:bg-zinc-950 font-semibold"
            >
              <Plus size={14} /> Submit Profile
            </a>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (Client component) */}
      <StartupsClient currentPage={page} totalPages={totalPages} />

      {/* Startups Grid */}
      {startups.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No startups match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.map((startup) => (
            <StartupCard key={startup.id} startup={startup} />
          ))}
        </div>
      )}

      {/* Submit PR notice */}
      <div className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-850 rounded-lg p-5 text-center max-w-xl mx-auto mt-12 space-y-2">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
          Want your startup listed?
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Submit a Pull Request to add your startup to the directory. Follow the schema in the repo and link back to your official website.
        </p>
        <div className="pt-2">
          <a
            href="https://github.com/Rayan9064/Stackd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline inline-flex items-center gap-0.5"
          >
            Submit a PR on GitHub →
          </a>
        </div>
      </div>
    </div>
  );
}
