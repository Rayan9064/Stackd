'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FilterBar from '@/components/FilterBar';
import { Button } from '@/components/ui/button';

interface NewsClientProps {
  currentPage: number;
  totalPages: number;
}

export default function NewsClient({ currentPage, totalPages }: NewsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get('search') || '';
  const currentSource = searchParams.get('source') || '';

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
    
    router.push(`/news?${params.toString()}`);
  };

  const handleSearch = (val: string) => {
    updateUrl({ search: val });
  };

  const handleSource = (val: string) => {
    updateUrl({ source: val });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/news?${params.toString()}`);
  };

  const filters = [
    {
      name: 'Source',
      placeholder: 'Select Source',
      value: currentSource,
      onChange: handleSource,
      options: [
        { label: 'Inc42', value: 'inc42' },
        { label: 'YourStory', value: 'yourstory' },
        { label: 'TechCrunch India', value: 'techcrunch' },
        { label: 'Reddit', value: 'reddit' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <FilterBar
        searchVal={currentSearch}
        onSearchChange={handleSearch}
        searchPlaceholder="Search startup news..."
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
