'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FilterBar from '@/components/FilterBar';

export default function CohortsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get('search') || '';
  const currentGeography = searchParams.get('geography') || '';
  const currentOpen = searchParams.get('open') || '';

  const updateUrl = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    
    router.push(`/cohorts?${params.toString()}`);
  };

  const handleSearch = (val: string) => {
    updateUrl({ search: val });
  };

  const handleGeography = (val: string) => {
    updateUrl({ geography: val });
  };

  const handleOpen = (val: string) => {
    updateUrl({ open: val });
  };

  const filters = [
    {
      name: 'Status',
      placeholder: 'Select Status',
      value: currentOpen,
      onChange: handleOpen,
      options: [
        { label: 'Applications Open', value: 'true' },
        { label: 'Applications Closed', value: 'false' }
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
    <FilterBar
      searchVal={currentSearch}
      onSearchChange={handleSearch}
      searchPlaceholder="Search accelerators..."
      filters={filters}
    />
  );
}
