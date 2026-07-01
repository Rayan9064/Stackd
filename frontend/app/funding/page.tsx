import React from 'react';
import { api } from '@/lib/api';
import FundingCard from '@/components/FundingCard';
import FundingClient from './FundingClient';

// Always render with current backend data.
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    stage?: string;
    geography?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function FundingPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1;
  const stage = resolvedParams.stage || '';
  const geography = resolvedParams.geography || '';
  const search = resolvedParams.search || '';
  const limit = 12;

  // Fetch funding articles from the backend API
  const fundingRes = await api.getFunding({
    page,
    limit,
    stage,
    geography,
    search
  });

  const rounds = fundingRes?.data || [];
  const totalItems = fundingRes?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
          Ecosystem Funding Rounds
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Aggregated recent investment updates, seed rounds, and venture capital raises worldwide.
        </p>
      </div>

      {/* Filter and Search Bar (Client component) */}
      <FundingClient currentPage={page} totalPages={totalPages} />

      {/* Funding Grid */}
      {rounds.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No funding rounds match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rounds.map((round) => (
            <FundingCard key={round.id} article={round} />
          ))}
        </div>
      )}
    </div>
  );
}
