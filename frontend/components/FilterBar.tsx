'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

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
  return (
    <div className="flex flex-col md:flex-row gap-3 w-full items-stretch md:items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-900">
      {/* Search Input */}
      {searchPlaceholder && (
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchVal}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm h-10 w-full focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-50"
          />
        </div>
      )}

      {/* Select Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {filters.map((filter, index) => (
            <div key={index} className="w-full sm:w-40">
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
