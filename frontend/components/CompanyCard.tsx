import Link from 'next/link';
import { Activity, ArrowUpRight, Building2, MapPin, RadioTower } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Company } from '@/lib/api';

interface CompanyCardProps {
  company: Company;
}

function formatConfidence(score: number) {
  return `${Math.round(score * 100)}%`;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const location = company.location || company.geography || company.country || 'Global';
  const description = company.description || 'Signals collected from launches, repositories, jobs, and ecosystem sources.';

  return (
    <Card className="group flex h-full flex-col justify-between rounded-lg border border-zinc-200 bg-white transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-650">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-zinc-500 dark:text-zinc-400">
              <Building2 size={14} />
              <span className="truncate">{company.sector || 'Unclassified'}</span>
            </div>
            <CardTitle className="text-base font-bold leading-snug text-zinc-950 dark:text-zinc-50">
              <Link href={`/companies/${company.slug}`} className="inline-flex items-center gap-1 hover:underline">
                {company.name}
                <ArrowUpRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </CardTitle>
          </div>
          <Badge variant="outline" className="shrink-0 border-zinc-200 bg-zinc-50 text-[10px] font-mono text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            {company.signalCount || 0} signals
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-4 p-4 pt-1">
        <p className="line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md border border-zinc-100 bg-zinc-50 p-2 dark:border-zinc-850 dark:bg-zinc-900/60">
            <div className="mb-1 flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
              <Activity size={12} />
              Confidence
            </div>
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">{formatConfidence(company.confidenceScore)}</div>
          </div>
          <div className="rounded-md border border-zinc-100 bg-zinc-50 p-2 dark:border-zinc-850 dark:bg-zinc-900/60">
            <div className="mb-1 flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
              <MapPin size={12} />
              Region
            </div>
            <div className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{location}</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex min-h-12 items-center justify-between gap-2 border-t border-zinc-100 p-4 pt-2 dark:border-zinc-900">
        <Badge variant="secondary" className="border border-zinc-200 bg-zinc-100 text-[10px] font-normal text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          {company.stage || 'Tracked'}
        </Badge>
        <Link
          href={`/companies/${company.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:underline dark:text-zinc-300 dark:hover:text-zinc-50"
        >
          <RadioTower size={13} />
          View signals
        </Link>
      </CardFooter>
    </Card>
  );
}
