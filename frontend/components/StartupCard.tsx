import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Startup } from '@/lib/api';
import SourceBadge from './SourceBadge';
import GeoBadge from './GeoBadge';
import { MapPin, RadioTower, UserRound } from 'lucide-react';

interface StartupCardProps {
  startup: Startup;
}

export default function StartupCard({ startup }: StartupCardProps) {
  const sourceCount = startup.sourceCount || startup.sources?.length || 0;
  const signalCount = startup.signalCount || 0;
  const sources = startup.sources || [];
  const founders = startup.founders || [];
  const hasEvidence = sourceCount > 0 || signalCount > 0 || founders.length > 0;

  return (
    <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col justify-between h-full hover:border-zinc-400 dark:hover:border-zinc-650 transition-colors">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <GeoBadge geo={startup.geography} />
            </div>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-1 hover:underline">
              <a href={startup.website} target="_blank" rel="noopener noreferrer">
                {startup.name}
              </a>
            </CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              <MapPin size={11} className="text-zinc-400" />
              <span>{startup.location}</span>
            </div>
          </div>
          <Badge variant="outline" className="bg-zinc-50 text-zinc-500 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 text-[10px] py-0 px-1.5 font-mono capitalize">
            {startup.stage}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-1 pb-3 flex-grow space-y-3">
        <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 leading-relaxed">
          {startup.oneLiner}
        </p>

        <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-850">
            Total Raised: {startup.fundingTotal}
          </span>
        </div>

        {hasEvidence && (
          <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-850 dark:bg-zinc-900/40">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1">
                <RadioTower size={12} />
                {signalCount} {signalCount === 1 ? 'signal' : 'signals'}
              </span>
              <span>{sourceCount} {sourceCount === 1 ? 'source' : 'sources'}</span>
            </div>
            {sources.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {sources.slice(0, 3).map((source) => (
                  <Badge
                    key={source.id}
                    variant="outline"
                    className="border-zinc-200 bg-white text-[10px] font-normal text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
                  >
                    {source.name}
                  </Badge>
                ))}
              </div>
            )}
            {founders.length > 0 && (
              <div className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                <UserRound size={12} className="mt-0.5 shrink-0 text-zinc-400" />
                <span className="line-clamp-2">
                  {founders.slice(0, 3).map((founder) => founder.name).join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-2 border-t border-zinc-100 dark:border-zinc-900 flex min-h-12 items-center justify-between gap-2">
        <Badge
          variant="secondary"
          className="bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 text-[10px] font-normal"
        >
          {startup.sector}
        </Badge>
        <SourceBadge source="Startup Profile" url={startup.sourceUrl || startup.website} />
      </CardFooter>
    </Card>
  );
}
