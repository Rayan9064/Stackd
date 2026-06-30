'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FilterBar from '@/components/FilterBar';
import { Button } from '@/components/ui/button';

interface FundingClientProps {
  currentPage: number;
  totalPages: number;
}

export default function FundingClient({ currentPage, totalPages }: FundingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get('search') || '';
  const currentStage = searchParams.get('stage') || '';
  const currentGeography = searchParams.get('geography') || '';

  const updateUrl = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    
    // Always reset page to 1 when changing search/filters
    if (!('page' in newParams)) {
      params.delete('page');
    }
    
    router.push(`/funding?${params.toString()}`);
  };

  const handleSearch = (val: string) => {
    updateUrl({ search: val });
  };

  const handleStage = (val: string) => {
    updateUrl({ stage: val });
  };

  const handleGeography = (val: string) => {
    updateUrl({ geography: val });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/funding?${params.toString()}`);
  };

  const filters = [
    {
      name: 'Round',
      placeholder: 'Select Round',
      value: currentStage,
      onChange: handleStage,
      options: [
        { label: 'Pre-Seed', value: 'pre-seed' },
        { label: 'Seed', value: 'seed' },
        { label: 'Series A', value: 'series a' },
        { label: 'Series B', value: 'series b' },
        { label: 'Growth', value: 'growth' }
      ]
    },
    {
      name: 'Geography',
      placeholder: 'Select Region',
      value: currentGeography,
      onChange: handleGeography,
      options: [
        { label: 'Americas / US', value: 'US' },
        { label: 'Europe', value: 'EU' },
        { label: 'Southeast Asia', value: 'SEA' },
        { label: 'India', value: 'INDIA' },
        { label: 'Latin America', value: 'LATAM' },
        { label: 'Africa', value: 'AFRICA' },
        { label: 'Global', value: 'GLOBAL' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <FilterBar
        searchVal={currentSearch}
        onSearchChange={handleSearch}
        searchPlaceholder="Search funding news (e.g. company, VC)..."
        filters={filters}
      />
      
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="cursor-pointer"
          >
            Previous
          </Button>
          <span className="text-xs text-zinc-500 font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
