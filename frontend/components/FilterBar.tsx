'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SlidersHorizontal, Search } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroup {
  name: string;
  placeholder: string;
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
}

interface FilterBarProps {
  searchVal: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filters?: FilterGroup[];
}

export default function FilterBar({
  searchVal,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = []
}: FilterBarProps) {
  const activeFilterCount = filters.filter((filter) => filter.value).length;
  const hasFilters = filters.length > 0;
  const [filtersOpen, setFiltersOpen] = useState(activeFilterCount > 0);

  useEffect(() => {
    if (activeFilterCount > 0) {
      setFiltersOpen(true);
    }
  }, [activeFilterCount]);

  return (
    <div className="space-y-3 pb-5 border-b border-zinc-100 dark:border-zinc-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {searchPlaceholder ? (
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchVal}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm h-10 w-full focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-50"
            />
          </div>
        ) : (
          <div />
        )}

        {hasFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen((open) => !open)}
            className="h-10 justify-center gap-2 sm:w-auto"
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 text-[10px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-950">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}
      </div>

      {hasFilters && filtersOpen && (
        <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-850 dark:bg-zinc-950 sm:flex-row sm:flex-wrap sm:items-center">
          {filters.map((filter, index) => (
            <div key={index} className="w-full sm:w-44">
              <Select value={filter.value || 'all'} onValueChange={(val: string | null) => filter.onChange(val === null || val === 'all' ? '' : val)}>
                <SelectTrigger className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm h-10 w-full">
                  <SelectValue placeholder={filter.placeholder} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850">
                  <SelectItem value="all" className="hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm cursor-pointer">
                    All {filter.name}
                  </SelectItem>
                  {filter.options.map((opt, optIndex) => (
                    <SelectItem
                      key={optIndex}
                      value={opt.value}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm cursor-pointer"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
