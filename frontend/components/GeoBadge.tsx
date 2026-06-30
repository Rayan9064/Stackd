import React from 'react';

interface GeoBadgeProps {
  geo?: string | null;
}

export default function GeoBadge({ geo }: GeoBadgeProps) {
  const cleanGeo = (geo || 'Global').trim().toUpperCase();

  const styles: Record<string, string> = {
    US: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/30',
    EU: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30',
    SEA: 'bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400 border-teal-200/50 dark:border-teal-800/30',
    INDIA: 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/30',
    LATAM: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/30',
    AFRICA: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30',
    GLOBAL: 'bg-zinc-50 text-zinc-700 dark:bg-zinc-950/30 dark:text-zinc-400 border-zinc-200/50 dark:border-zinc-800/30'
  };

  const defaultStyle = 'bg-zinc-50 text-zinc-700 dark:bg-zinc-950/30 dark:text-zinc-400 border-zinc-200/50 dark:border-zinc-800/30';
  const matchedStyle = styles[cleanGeo] || defaultStyle;

  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border font-mono tracking-wider ${matchedStyle}`}>
      {cleanGeo === 'INDIA' ? 'INDIA' : cleanGeo}
    </span>
  );
}
