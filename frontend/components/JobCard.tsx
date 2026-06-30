import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/lib/api';
import SourceBadge from './SourceBadge';
import GeoBadge from './GeoBadge';
import { formatDate } from '@/lib/utils';
import { MapPin, DollarSign, ArrowUpRight, Wifi } from 'lucide-react';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col justify-between h-full hover:border-zinc-400 dark:hover:border-zinc-650 transition-colors">
      <CardHeader className="p-4 pb-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-mono tracking-tight uppercase">
              {job.company}
            </span>
            <div className="flex items-center gap-1.5">
              <GeoBadge geo={job.geography} />
              {job.stage && (
                <Badge variant="outline" className="bg-zinc-50 text-zinc-500 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 text-[10px] py-0 px-1.5 font-normal capitalize">
                  {job.stage}
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {job.title}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-1 pb-3 flex-grow space-y-3">
        <div className="flex flex-col gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-zinc-400" />
            <span>{job.location || 'Global'}</span>
          </div>
          {job.remote && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Wifi size={13} />
              <span>Remote Available</span>
            </div>
          )}
          {job.equity && (
            <div className="flex items-center gap-1.5 font-mono text-zinc-600 dark:text-zinc-300">
              <DollarSign size={13} className="text-zinc-400" />
              <span>
                Competitive Pay • {job.equity} Equity
              </span>
            </div>
          )}
        </div>
        
        <div className="pt-1">
          <Badge
            variant="secondary"
            className="bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 text-[10px] font-normal capitalize"
          >
            {job.role || 'General'}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-2 h-12">
        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
          {formatDate(job.postedAt)}
        </span>
        <div className="flex items-center gap-2">
          <SourceBadge source={job.source} url={job.sourceUrl || job.url} />
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-900 font-semibold dark:text-zinc-100 hover:underline inline-flex items-center gap-0.5"
          >
            Apply <ArrowUpRight size={12} />
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
