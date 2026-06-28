'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FilterBar from '@/components/FilterBar';
import { Button } from '@/components/ui/button';

interface JobsClientProps {
  currentPage: number;
  totalPages: number;
}

export default function JobsClient({ currentPage, totalPages }: JobsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get('search') || '';
  const currentRole = searchParams.get('role') || '';
  const currentLocation = searchParams.get('location') || '';
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
    
    router.push(`/jobs?${params.toString()}`);
  };

  const handleSearch = (val: string) => {
    updateUrl({ search: val });
  };

  const handleRole = (val: string) => {
    updateUrl({ role: val });
  };

  const handleLocation = (val: string) => {
    updateUrl({ location: val });
  };

  const handleStage = (val: string) => {
    updateUrl({ stage: val });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/jobs?${params.toString()}`);
  };

  const filters = [
    {
      name: 'Role',
      placeholder: 'Select Role',
      value: currentRole,
      onChange: handleRole,
      options: [
        { label: 'Engineering', value: 'engineering' },
        { label: 'Product', value: 'product' },
        { label: 'Design', value: 'design' },
        { label: 'Marketing', value: 'marketing' }
      ]
    },
    {
      name: 'Location',
      placeholder: 'Select Location',
      value: currentLocation,
      onChange: handleLocation,
      options: [
        { label: 'Bangalore', value: 'bangalore' },
        { label: 'Mumbai', value: 'mumbai' },
        { label: 'New Delhi', value: 'delhi' },
        { label: 'Remote', value: 'remote' }
      ]
    },
    {
      name: 'Stage',
      placeholder: 'Select Stage',
      value: currentStage,
      onChange: handleStage,
      options: [
        { label: 'Seed', value: 'seed' },
        { label: 'Series A', value: 'series-a' },
        { label: 'Series B', value: 'series-b' },
        { label: 'Growth', value: 'growth' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <FilterBar
        searchVal={currentSearch}
        onSearchChange={handleSearch}
        searchPlaceholder="Search jobs or companies..."
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
