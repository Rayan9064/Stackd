import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface SourceBadgeProps {
  source: string;
  url: string;
  className?: string;
}

export default function SourceBadge({ source, url, className = '' }: SourceBadgeProps) {
  const getDisplayName = (src: string) => {
    const srcLower = src.toLowerCase();
    if (srcLower.startsWith('reddit/r/')) {
      return srcLower.replace('reddit/', '');
    }
    
    switch (srcLower) {
      case 'inc42':
        return 'Inc42';
      case 'yourstory':
        return 'YourStory';
      case 'techcrunch':
        return 'TechCrunch';
      case 'venturebeat':
        return 'VentureBeat';
      case 'sifted':
        return 'Sifted (Europe)';
      case 'techinasia':
        return 'Tech in Asia';
      case 'e27':
        return 'e27';
      case 'thenextweb':
        return 'TNW';
      case 'maddyness':
        return 'Maddyness';
      case 'indiehackers':
        return 'Indie Hackers';
      case 'github':
        return 'GitHub';
      case 'hn':
      case 'hackernews':
        return 'Hacker News';
      case 'ph':
      case 'producthunt':
        return 'Product Hunt';
      case 'reddit':
        return 'Reddit';
      case 'ycombinator':
        return 'YC Jobs';
      default:
        return src;
    }
  };

  const getSourceStyles = (src: string) => {
    const srcLower = src.toLowerCase();
    if (srcLower.startsWith('reddit/')) {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
    }
    
    switch (srcLower) {
      case 'inc42':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50';
      case 'yourstory':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50';
      case 'techcrunch':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50';
      case 'venturebeat':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50';
      case 'sifted':
        return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/50';
      case 'techinasia':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/50';
      case 'e27':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/50';
      case 'thenextweb':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50';
      case 'maddyness':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50';
      case 'indiehackers':
        return 'bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800';
      case 'github':
        return 'bg-zinc-800 text-zinc-100 border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800';
      case 'hn':
      case 'hackernews':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50';
      case 'ph':
      case 'producthunt':
        return 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-900/50';
      case 'reddit':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
      case 'ycombinator':
        return 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800';
    }
  };

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-w-0 items-center hover:opacity-85 transition-opacity ${className}`}
      title={getDisplayName(source)}
    >
      <Badge
        variant="outline"
        className={`font-mono text-[10px] tracking-wide py-0 px-2 rounded font-semibold border inline-flex max-w-36 items-center gap-1 cursor-pointer truncate transition-colors ${getSourceStyles(source)}`}
      >
        <span className="truncate">{getDisplayName(source)}</span>
        <ExternalLink size={10} className="opacity-70" />
      </Badge>
    </Link>
  );
}
