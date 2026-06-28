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
  // Normalize source name for display
  const getDisplayName = (src: string) => {
    switch (src.toLowerCase()) {
      case 'inc42':
        return 'Inc42';
      case 'yourstory':
        return 'YourStory';
      case 'techcrunch':
        return 'TechCrunch India';
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
    switch (src.toLowerCase()) {
      case 'inc42':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50';
      case 'yourstory':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50';
      case 'techcrunch':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50';
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
      className={`inline-flex items-center hover:opacity-85 transition-opacity ${className}`}
    >
      <Badge
        variant="outline"
        className={`font-mono text-[10px] tracking-wide py-0 px-2 rounded font-semibold border inline-flex items-center gap-1 cursor-pointer transition-colors ${getSourceStyles(source)}`}
      >
        {getDisplayName(source)}
        <ExternalLink size={10} className="opacity-70" />
      </Badge>
    </Link>
  );
}
