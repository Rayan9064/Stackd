'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FilterBar from '@/components/FilterBar';
import { Button } from '@/components/ui/button';

interface InvestorsClientProps {
  currentPage: number;
  totalPages: number;
}

export default function InvestorsClient({ currentPage, totalPages }: InvestorsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get('search') || '';
  const currentSector = searchParams.get('sector') || '';
  const currentStage = searchParams.get('stage') || '';

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
    
    router.push(`/investors?${params.toString()}`);
  };

  const handleSearch = (val: string) => {
    updateUrl({ search: val });
  };

  const handleSector = (val: string) => {
    updateUrl({ sector: val });
  };

  const handleStage = (val: string) => {
    updateUrl({ stage: val });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/investors?${params.toString()}`);
  };

  const filters = [
    {
      name: 'Sector',
      placeholder: 'Select Sector',
      value: currentSector,
      onChange: handleSector,
      options: [
        { label: 'SaaS', value: 'saas' },
        { label: 'Fintech', value: 'fintech' },
        { label: 'Consumer', value: 'consumer' },
        { label: 'Deeptech', value: 'deeptech' },
        { label: 'D2C', value: 'd2c' },
        { label: 'Web3', value: 'web3' },
        { label: 'Climate Tech', value: 'climate' }
      ]
    },
    {
      name: 'Stage',
      placeholder: 'Select Stage',
      value: currentStage,
      onChange: handleStage,
      options: [
        { label: 'Pre-Seed', value: 'pre-seed' },
        { label: 'Seed', value: 'seed' },
        { label: 'Series A', value: 'series a' },
        { label: 'Series B', value: 'series b' },
        { label: 'Growth', value: 'growth' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <FilterBar
        searchVal={currentSearch}
        onSearchChange={handleSearch}
        searchPlaceholder="Search investors or VC firms..."
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
