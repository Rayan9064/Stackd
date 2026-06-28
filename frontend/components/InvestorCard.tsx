import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Investor } from '@/lib/api';
import SourceBadge from './SourceBadge';
import { Twitter, Linkedin, Globe, MapPin, ArrowUpRight } from 'lucide-react';

interface InvestorCardProps {
  investor: Investor;
}

export default function InvestorCard({ investor }: InvestorCardProps) {
  const formatCheque = (val: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : '₹';
    if (val >= 1000000) {
      const formatted = val / 1000000;
      return `${symbol}${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${symbol}${val / 1000}K`;
    }
    return `${symbol}${val}`;
  };

  const chequeRange = 
    investor.chequeMin === investor.chequeMax
      ? formatCheque(investor.chequeMin, investor.currency)
      : `${formatCheque(investor.chequeMin, investor.currency)} – ${formatCheque(investor.chequeMax, investor.currency)}`;

  return (
    <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col justify-between h-full hover:border-zinc-400 dark:hover:border-zinc-650 transition-colors">
      <CardHeader className="p-4 pb-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-mono tracking-tight uppercase">
            {investor.firm}
          </span>
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {investor.name}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-1 pb-3 flex-grow space-y-3">
        {/* Thesis */}
        <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-3 leading-relaxed">
          {investor.thesis}
        </p>
        
        {/* Cheque details & Location */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-900 pt-3">
          <div>
            <span className="text-[10px] uppercase text-zinc-400 block font-sans">Cheque Size</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{chequeRange}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-zinc-400 block font-sans">Location</span>
            <span className="inline-flex items-center gap-1 text-zinc-800 dark:text-zinc-200">
              <MapPin size={11} className="text-zinc-400" />
              {investor.location}
            </span>
          </div>
        </div>
        
        {/* Sectors */}
        <div className="flex flex-wrap gap-1 pt-1">
          {investor.sectors.slice(0, 3).map((sector, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 text-[9px] py-0 px-1.5 font-normal"
            >
              {sector}
            </Badge>
          ))}
          {investor.sectors.length > 3 && (
            <span className="text-[9px] text-zinc-400 self-center font-mono">+{investor.sectors.length - 3}</span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-2 h-12">
        <div className="flex items-center gap-2.5">
          {investor.xHandle && (
            <a
              href={`https://x.com/${investor.xHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Twitter size={14} />
            </a>
          )}
          {investor.linkedinUrl && (
            <a
              href={investor.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Linkedin size={14} />
            </a>
          )}
          {investor.website && (
            <a
              href={investor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Globe size={14} />
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SourceBadge source="Investor Directory" url={investor.website} />
          <a
            href={investor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-900 dark:text-zinc-100 font-semibold hover:underline inline-flex items-center gap-0.5"
          >
            Website <ArrowUpRight size={12} />
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
