import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Building2, CalendarDays, Globe2, MapPin, RadioTower, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import SourceBadge from '@/components/SourceBadge';
import { api, type CompanySignal } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return date.toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function signalLabel(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function signalTone(type: string) {
  if (type.includes('github')) return 'border-sky-500/40 bg-sky-500/10 text-sky-300';
  if (type.includes('launch')) return 'border-orange-500/40 bg-orange-500/10 text-orange-300';
  if (type.includes('job')) return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
  if (type.includes('funding')) return 'border-amber-500/40 bg-amber-500/10 text-amber-300';
  return 'border-zinc-500/40 bg-zinc-500/10 text-zinc-300';
}

function evidenceLabel(sourceCount = 0, signalCount = 0) {
  if (sourceCount >= 2) return 'Corroborated';
  if (signalCount >= 2) return 'Multi-signal';
  return 'Single source';
}

function SignalRow({ signal }: { signal: CompanySignal }) {
  return (
    <article className="relative border-l border-zinc-200 pb-6 pl-5 last:pb-0 dark:border-zinc-800">
      <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border border-zinc-300 bg-zinc-950 dark:border-zinc-700 dark:bg-zinc-50" />
      <div className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <Badge variant="outline" className={`h-6 rounded-md text-[10px] font-mono ${signalTone(signal.type)}`}>
              {signalLabel(signal.type)}
            </Badge>
            <h2 className="text-sm font-bold leading-snug text-zinc-950 dark:text-zinc-50">
              <a href={signal.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                {signal.title}
                <ArrowUpRight size={13} />
              </a>
            </h2>
            {(signal.sources || []).length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {(signal.sources || []).map((source) => (
                  <SourceBadge key={`${signal.id}-${source.id}-${source.externalId}`} source={source.name} url={source.url || signal.url} />
                ))}
              </div>
            ) : signal.source && (
              <SourceBadge source={signal.source.name} url={signal.url} />
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <CalendarDays size={13} />
            {formatDate(signal.occurredAt)}
          </div>
        </div>
        {signal.summary && (
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{signal.summary}</p>
        )}
      </div>
    </article>
  );
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const company = await api.getCompany(slug);

  if (!company?.id) {
    notFound();
  }

  const signals = company.signals || [];
  const location = company.location || company.geography || company.country || 'Global';
  const sourceCount = company.sourceCount || company.sources?.length || 0;
  const signalCount = company.signalCount || signals.length;
  const founders = company.founders || [];

  return (
    <div className="space-y-7">
      <Link href="/companies" className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50">
        <ArrowLeft size={15} />
        Companies
      </Link>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-md border-zinc-200 bg-zinc-50 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                {company.sector || 'Unclassified'}
              </Badge>
              <Badge variant="secondary" className="rounded-md border border-zinc-200 bg-zinc-100 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                {company.stage || 'Tracked'}
              </Badge>
              {(company.sources || []).map((source) => (
                <Badge key={source.id} variant="outline" className="rounded-md border-zinc-200 bg-zinc-50 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                  {source.name}
                </Badge>
              ))}
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                {company.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {company.description || 'Company profile generated from Stackd ecosystem signals.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} />
                {location}
              </span>
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-zinc-950 hover:underline dark:hover:text-zinc-50">
                  <Globe2 size={13} />
                  Website
                </a>
              )}
            </div>
            {founders.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {founders.map((founder) => (
                  <Link
                    key={founder.id}
                    href={`/founders/${founder.slug}`}
                    className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-600 hover:text-zinc-950 hover:underline dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
                  >
                    <UserRound size={13} />
                    {founder.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:min-w-72">
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="mb-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <RadioTower size={13} />
                Signals
              </div>
              <div className="font-mono text-xl font-semibold text-zinc-950 dark:text-zinc-50">{signalCount}</div>
            </div>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="mb-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <Building2 size={13} />
                Evidence
              </div>
              <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{evidenceLabel(sourceCount, signalCount)}</div>
            </div>
          </div>
        </div>
      </section>

      {founders.length > 0 && (
        <section className="space-y-3">
          <div className="border-b border-zinc-100 pb-3 dark:border-zinc-900">
            <h2 className="font-heading text-lg font-bold text-zinc-950 dark:text-zinc-50">Founders</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Founder profiles attached from structured or domain-backed sources.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {founders.map((founder) => (
              <Link
                key={founder.id}
                href={`/founders/${founder.slug}`}
                className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-650"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-zinc-950 dark:text-zinc-50">{founder.name}</div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{founder.headline || founder.title || 'Founder'}</div>
                  </div>
                  <ArrowUpRight size={14} className="text-zinc-400" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-900">
          <div>
            <h2 className="font-heading text-lg font-bold text-zinc-950 dark:text-zinc-50">Signal Timeline</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Latest source-backed events attached to this company.</p>
          </div>
        </div>

        {signals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-200 py-10 text-center dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No signals have been attached to this company yet.</p>
          </div>
        ) : (
          <div>
            {signals.map((signal) => (
              <SignalRow key={signal.id} signal={signal} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
