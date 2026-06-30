import React from 'react';
import SourceBadge from './SourceBadge';
import GeoBadge from './GeoBadge';
import { Calendar } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  url: string;
  sourceUrl: string;
  summary?: string | null;
  source: string;
  geography?: string | null;
  publishedAt: string;
  tags?: string[];
}

interface FundingCardProps {
  article: Article;
}

export default function FundingCard({ article }: FundingCardProps) {
  const publishedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-750 transition-all rounded-xl p-5 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <GeoBadge geo={article.geography} />
          {article.tags && article.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[9px] font-mono bg-zinc-150/40 dark:bg-zinc-900/60 text-zinc-650 dark:text-zinc-450 px-1 rounded uppercase">
              {tag}
            </span>
          ))}
        </div>
        <SourceBadge source={article.source} url={article.sourceUrl} />
      </div>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group flex-grow"
      >
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-650 dark:group-hover:text-zinc-300 leading-snug transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.summary && (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
            {article.summary}
          </p>
        )}
      </a>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900/60 text-[10px] text-zinc-400 font-mono">
        <Calendar size={12} />
        <span>{publishedDate}</span>
      </div>
    </div>
  );
}
