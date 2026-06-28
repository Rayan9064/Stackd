import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Launch } from '@/lib/api';
import SourceBadge from './SourceBadge';
import { formatDate } from '@/lib/utils';
import { ArrowUp, ArrowUpRight } from 'lucide-react';

interface LaunchCardProps {
  launch: Launch;
}

export default function LaunchCard({ launch }: LaunchCardProps) {
  return (
    <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col justify-between h-full hover:border-zinc-400 dark:hover:border-zinc-650 transition-colors">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
            {launch.title}
          </CardTitle>
          {/* Upvote badge */}
          <Badge
            variant="outline"
            className="flex items-center gap-1 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shrink-0"
          >
            <ArrowUp size={12} className="text-zinc-400" />
            {launch.upvotes}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-1 pb-3 flex-grow">
        <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 leading-relaxed">
          {launch.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-2 h-12">
        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
          {formatDate(launch.launchedAt)}
        </span>
        <div className="flex items-center gap-2">
          <SourceBadge source={launch.source} url={launch.url} />
          <a
            href={launch.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-900 dark:text-zinc-100 font-semibold hover:underline inline-flex items-center gap-0.5"
          >
            {launch.source === 'ph' ? 'Product Hunt' : 'Hacker News'} <ArrowUpRight size={12} />
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
