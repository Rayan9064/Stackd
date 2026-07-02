import React from 'react';
import { api } from '@/lib/api';
import InvestorCard from '@/components/InvestorCard';
import InvestorsClient from './InvestorsClient';
import { Plus } from 'lucide-react';

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

export default async function InvestorsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1;
  const sector = resolvedParams.sector || '';
  const stage = resolvedParams.stage || '';
  const geography = resolvedParams.geography || '';
  const search = resolvedParams.search || '';
  const limit = 12;

  // Fetch investors from backend API
  const investorsRes = await api.getInvestors({
    page,
    limit,
    sector,
    stage,
    geography,
    search
  });

  const investors = investorsRes?.data || [];
  const totalItems = investorsRes?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-6 font-heading">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
            Global Investor Directory
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            A community-maintained index of active VCs and angels investing in global ecosystems.
          </p>
        </div>

        <a
          href="https://github.com/Rayan9064/Stackd"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-1.5 bg-white dark:bg-zinc-950 font-semibold"
        >
          <Plus size={14} /> Add Investor Profile
        </a>
      </div>

      {/* Filter and Search Bar (Client component) */}
      <InvestorsClient currentPage={page} totalPages={totalPages} />

      {/* Investors Grid */}
      {investors.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No VCs or angels match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investors.map((investor, index) => (
            <InvestorCard key={index} investor={investor} />
          ))}
        </div>
      )}

      {/* Submit PR notice */}
      <div className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-850 rounded-lg p-5 text-center max-w-xl mx-auto mt-12 space-y-2">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
          Are you an investor?
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Help us keep this list up to date. If you represent an active fund or invest as an angel, submit a Pull Request to add or modify your profile.
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
