import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Article } from '@/lib/api';
import SourceBadge from './SourceBadge';
import { formatDate } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col justify-between h-full hover:border-zinc-400 dark:hover:border-zinc-650 transition-colors">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50 hover:underline">
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
              {article.title}
            </a>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 pb-3 flex-grow">
        <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-3 leading-relaxed">
          {article.summary}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-2 h-12">
        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
          {formatDate(article.publishedAt)}
        </span>
        <div className="flex items-center gap-2">
          <SourceBadge source={article.source} url={article.url} />
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 inline-flex items-center gap-0.5 hover:underline"
          >
            Read <ArrowUpRight size={12} />
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
