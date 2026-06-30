'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, ArrowUpRight, X } from 'lucide-react';
import { api, type Article, type Investor, type Job, type Launch, type SearchResults, type Startup } from '@/lib/api';
import SourceBadge from './SourceBadge';
import GeoBadge from './GeoBadge';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close search results dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search input
  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchRes = await api.globalSearch(query);
        setResults(searchRes);
        setIsOpen(true);
      } catch (err) {
        console.error('Error during global search:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const hasResults = results && Object.values(results).some((arr) => Array.isArray(arr) && arr.length > 0);

  return (
    <div className="relative w-full max-w-2xl mx-auto z-50" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 h-5 w-5" />
        <input
          type="text"
          placeholder="Search global startups, jobs, investors, launches, news..."
          value={query}
          onChange={(e) => {
            const nextQuery = e.target.value;
            setQuery(nextQuery);
            setIsOpen(true);
            if (nextQuery.trim().length < 2) {
              setResults(null);
              setIsLoading(false);
            }
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-12 pr-10 py-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-50 focus:bg-white dark:focus:bg-zinc-950 transition-all font-sans"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults(null);
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Floating Results Popover */}
      {isOpen && (isLoading || hasResults) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-850 rounded-xl shadow-xl max-h-[480px] overflow-y-auto z-50 p-2 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-6 text-zinc-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-xs font-mono">Searching the ecosystem...</span>
            </div>
          )}

          {!isLoading && results && (
            <div className="space-y-4 division-y division-zinc-100 dark:division-zinc-900">
              {/* Startups */}
              {results.startups && results.startups.length > 0 && (
                <div className="p-2">
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono mb-2 px-1">Startups</h4>
                  <div className="grid gap-1">
                    {results.startups.slice(0, 3).map((s: Startup) => (
                      <a
                        key={s.id || s.name}
                        href={s.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 group transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                            {s.name}
                            <GeoBadge geo={s.geography} />
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">{s.oneLiner}</p>
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition-all" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Launches */}
              {results.launches && results.launches.length > 0 && (
                <div className="p-2 border-t border-zinc-100 dark:border-zinc-900/60">
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono mb-2 px-1">Launches</h4>
                  <div className="grid gap-1">
                    {results.launches.slice(0, 3).map((l: Launch) => (
                      <a
                        key={l.id}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 group transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            {l.title}
                            <span className="text-[10px] text-zinc-400 font-mono">▲ {l.upvotes}</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">{l.tagline}</p>
                        </div>
                        <SourceBadge source={l.source} url={l.sourceUrl} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Jobs */}
              {results.jobs && results.jobs.length > 0 && (
                <div className="p-2 border-t border-zinc-100 dark:border-zinc-900/60">
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono mb-2 px-1">Jobs</h4>
                  <div className="grid gap-1">
                    {results.jobs.slice(0, 3).map((j: Job) => (
                      <a
                        key={j.id}
                        href={j.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 group transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            {j.title} <span className="text-zinc-400 dark:text-zinc-500 font-normal">at {j.company}</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                            {j.location} {j.remote && '• Remote'}
                            <GeoBadge geo={j.geography} />
                          </p>
                        </div>
                        <SourceBadge source={j.source} url={j.sourceUrl} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* News */}
              {results.news && results.news.length > 0 && (
                <div className="p-2 border-t border-zinc-100 dark:border-zinc-900/60">
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono mb-2 px-1">News</h4>
                  <div className="grid gap-1">
                    {results.news.slice(0, 3).map((n: Article) => (
                      <a
                        key={n.id}
                        href={n.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 group transition-colors"
                      >
                        <div className="max-w-[80%]">
                          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {n.title}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <GeoBadge geo={n.geography} />
                            <span className="text-[10px] text-zinc-400 font-mono">{new Date(n.publishedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <SourceBadge source={n.source} url={n.sourceUrl} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Investors */}
              {results.investors && results.investors.length > 0 && (
                <div className="p-2 border-t border-zinc-100 dark:border-zinc-900/60">
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono mb-2 px-1">Investors</h4>
                  <div className="grid gap-1">
                    {results.investors.slice(0, 3).map((inv: Investor) => (
                      <a
                        key={inv.name}
                        href={inv.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 group transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                            {inv.name} <span className="text-zinc-400 dark:text-zinc-500 font-normal">({inv.firm})</span>
                            <GeoBadge geo={inv.geography} />
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">{inv.thesis}</p>
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition-all" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
