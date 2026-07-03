'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import FilterBar from '@/components/FilterBar';
import { Button } from '@/components/ui/button';

interface CompaniesClientProps {
  currentPage: number;
  totalPages: number;
}

export default function CompaniesClient({ currentPage, totalPages }: CompaniesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get('search') || '';
  const currentSector = searchParams.get('sector') || '';
  const currentGeography = searchParams.get('geography') || '';

  const updateUrl = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    if (!('page' in newParams)) {
      params.delete('page');
    }

    router.push(`/companies?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/companies?${params.toString()}`);
  };

  const filters = [
    {
      name: 'Sector',
      placeholder: 'Select Sector',
      value: currentSector,
      onChange: (value: string) => updateUrl({ sector: value }),
      options: [
        { label: 'AI', value: 'ai' },
        { label: 'SaaS', value: 'saas' },
        { label: 'Fintech', value: 'fintech' },
        { label: 'Developer Tools', value: 'developer' },
        { label: 'E-Commerce', value: 'commerce' },
        { label: 'Clean Tech', value: 'clean' },
      ],
    },
    {
      name: 'Region',
      placeholder: 'Select Region',
      value: currentGeography,
      onChange: (value: string) => updateUrl({ geography: value }),
      options: [
        { label: 'United States', value: 'US' },
        { label: 'Europe', value: 'EU' },
        { label: 'India', value: 'India' },
        { label: 'Africa', value: 'Africa' },
        { label: 'Latin America', value: 'LATAM' },
        { label: 'Global', value: 'Global' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <FilterBar
        searchVal={currentSearch}
        onSearchChange={(value) => updateUrl({ search: value })}
        searchPlaceholder="Search companies, sectors, or descriptions..."
        filters={filters}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="cursor-pointer"
          >
            Previous
          </Button>
          <span className="text-xs font-mono text-zinc-500">
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
