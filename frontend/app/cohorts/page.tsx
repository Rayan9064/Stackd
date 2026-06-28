import React from 'react';
import { api } from '@/lib/api';
import CohortCard from '@/components/CohortCard';
import { Plus } from 'lucide-react';

// Revalidate this page every hour (ISR)
export const revalidate = 3600;

export default async function CohortsPage() {
  // Fetch cohorts from backend API
  const cohortsRes = await api.getCohorts();
  const cohorts = cohortsRes?.data || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Accelerator Cohort Tracker
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Active programs and upcoming deadlines for Indian and global accelerators.
          </p>
        </div>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-1.5 bg-white dark:bg-zinc-950 font-semibold"
        >
          <Plus size={14} /> Add Accelerator
        </a>
      </div>

      {/* Cohorts Grid */}
      {cohorts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No active accelerator cohorts tracked at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cohorts.map((cohort, index) => (
            <CohortCard key={index} cohort={cohort} />
          ))}
        </div>
      )}

      {/* Submit PR notice */}
      <div className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-850 rounded-lg p-5 text-center max-w-xl mx-auto mt-12 space-y-2">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
          Missing a program?
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Stackd cohorts are community-maintained. If you know of an active accelerator program, submit a Pull Request to add it to the directory.
        </p>
        <div className="pt-2">
          <a
            href="https://github.com"
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
