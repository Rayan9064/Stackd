import React from 'react';
import { api } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import NewsClient from './NewsClient';

// Always render with current backend data.
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    source?: string;
    geography?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function NewsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1;
  const source = resolvedParams.source || '';
  const geography = resolvedParams.geography || '';
  const search = resolvedParams.search || '';
  const limit = 12;

  // Fetch articles from backend API
  const newsRes = await api.getNews({
    page,
    limit,
    source,
    geography,
    search
  });

  const articles = newsRes?.data || [];
  const totalItems = newsRes?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
          Startup News Aggregator
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Aggregating latest funding news and global ecosystem updates from trusted publications.
        </p>
      </div>

      {/* Filter and Search Bar (Client component) */}
      <NewsClient currentPage={page} totalPages={totalPages} />

      {/* News Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No articles match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
