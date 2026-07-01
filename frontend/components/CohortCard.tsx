import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cohort } from '@/lib/api';
import SourceBadge from './SourceBadge';
import GeoBadge from './GeoBadge';
import { getDaysRemaining } from '@/lib/utils';
import { Calendar, DollarSign, Percent } from 'lucide-react';

interface CohortCardProps {
  cohort: Cohort;
}

export default function CohortCard({ cohort }: CohortCardProps) {
  const daysRemaining = getDaysRemaining(cohort.deadline);
  
  const getDeadlineBadge = () => {
    if (daysRemaining < 0) {
      return (
        <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 border border-zinc-200 text-xs">
          Closed
        </Badge>
      );
    }
    
    if (daysRemaining === 0) {
      return (
        <Badge variant="destructive" className="bg-red-600 hover:bg-red-600 text-white text-xs border-none font-bold animate-pulse">
          Closes Today
        </Badge>
      );
    }
    
    if (daysRemaining < 14) {
      return (
        <Badge variant="destructive" className="bg-red-50 text-red-600 border border-red-200 text-xs dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50 font-semibold">
          Closes in {daysRemaining} days
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-zinc-50 text-zinc-600 border border-zinc-200 text-xs dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800">
        Closes in {daysRemaining} days
      </Badge>
    );
  };

  return (
    <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col justify-between h-full hover:border-zinc-400 dark:hover:border-zinc-650 transition-colors">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 hover:underline">
              <a href={cohort.applyUrl} target="_blank" rel="noopener noreferrer">
                {cohort.name}
              </a>
            </CardTitle>
            <div className="flex items-center gap-1.5 mt-1">
              <GeoBadge geo={cohort.geography} />
            </div>
          </div>
          {getDeadlineBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 pb-3 flex-grow space-y-3">
        {/* Cohort Details */}
        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <DollarSign size={13} className="text-zinc-400" />
            <span className="truncate">{cohort.investment || 'Stipend'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Percent size={13} className="text-zinc-400" />
            <span className="truncate">{cohort.equity || '0%'} Equity</span>
          </div>
        </div>
        
        {/* Sectors Tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          {cohort.sectors && cohort.sectors.map((sector, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 text-[10px] py-0 px-1.5 font-normal"
            >
              {sector}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex min-h-12 items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
          <Calendar size={12} />
          <span>Deadline: {new Date(cohort.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <SourceBadge source="Accelerator" url={cohort.sourceUrl || cohort.applyUrl} />
      </CardFooter>
    </Card>
  );
}
