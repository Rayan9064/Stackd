import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeDollarSign,
  CalendarDays,
  ChartPie,
  Github,
  Globe2,
  Linkedin,
  MapPin,
  RadioTower,
} from 'lucide-react';
import GeoBadge from '@/components/GeoBadge';
import SourceBadge from '@/components/SourceBadge';
import { Badge } from '@/components/ui/badge';
import { api, type Startup } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

const sliceColors = ['#60a5fa', '#34d399', '#f59e0b', '#f472b6', '#a78bfa', '#f87171'];

function formatDate(value?: string) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function socialItems(startup: Startup) {
  const links = startup.socialLinks || {};
  return [
    { label: 'Website', url: startup.website, icon: Globe2 },
    { label: 'LinkedIn', url: links.linkedin, icon: Linkedin },
    { label: 'X', url: links.x, icon: ArrowUpRight },
    { label: 'GitHub', url: links.github, icon: Github },
    { label: 'Crunchbase', url: links.crunchbase, icon: ArrowUpRight },
  ].filter((item) => item.url);
}

function OwnershipDonut({ startup }: { startup: Startup }) {
  const shareholders = startup.ownership?.shareholders || [];
  const hasSlices = shareholders.length > 0;
  const gradient = hasSlices
    ? shareholders.reduce(
        (parts, shareholder, index) => {
          const start = parts.offset;
          const end = start + shareholder.percentage;
          return {
            offset: end,
            values: [
              ...parts.values,
              `${sliceColors[index % sliceColors.length]} ${start}% ${end}%`,
            ],
          };
        },
        { offset: 0, values: [] as string[] }
      ).values.join(', ')
    : '#3f3f46 0% 100%';

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold text-zinc-950 dark:text-zinc-50">
            Ownership
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {startup.ownership?.asOf ? `As of ${formatDate(startup.ownership.asOf)}` : 'Cap table status'}
          </p>
        </div>
        <Badge variant="outline" className="capitalize">
          {startup.ownership?.status || 'unavailable'}
        </Badge>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div
          className="relative h-36 w-36 shrink-0 rounded-full border border-zinc-200 dark:border-zinc-800"
          style={{ background: `conic-gradient(${gradient})` }}
          aria-label="Ownership donut chart"
        >
          <div className="absolute inset-7 rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950" />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {hasSlices ? (
            <div className="space-y-2">
              {shareholders.map((shareholder, index) => (
                <a
                  key={shareholder.name}
                  href={shareholder.sourceUrl || startup.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: sliceColors[index % sliceColors.length] }}
                    />
                    <span className="truncate text-zinc-700 dark:text-zinc-300">{shareholder.name}</span>
                  </span>
                  <span className="font-mono font-semibold text-zinc-950 dark:text-zinc-50">
                    {shareholder.percentage}%
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-zinc-200 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              Ownership graph pending. Stackd will render this only when verified percentage data exists.
            </div>
          )}
          {startup.ownership?.note && (
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {startup.ownership.note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function StartupDetailPage({ params }: PageProps) {
  const { id } = await params;
  const startup = await api.getStartup(id);

  if (!startup?.id) {
    notFound();
  }

  const fundingRounds = startup.fundingRounds || [];
  const profileSources = startup.profileSources || [];
  const socials = socialItems(startup);

  return (
    <div className="space-y-7">
      <Link href="/startups" className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50">
        <ArrowLeft size={15} />
        Startups
      </Link>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <GeoBadge geo={startup.geography} />
              <Badge variant="outline" className="capitalize">
                {startup.stage}
              </Badge>
              <Badge variant="secondary">{startup.sector}</Badge>
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                {startup.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {startup.oneLiner}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} />
                {startup.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeDollarSign size={14} />
                Total raised: {startup.fundingTotal}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <RadioTower size={14} />
                {startup.signalCount || 0} graph signals
              </span>
            </div>
          </div>

          <a
            href={startup.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Official website
            <ArrowUpRight size={13} />
          </a>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <div className="space-y-5">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-heading text-lg font-bold text-zinc-950 dark:text-zinc-50">
              Funding Rounds
            </h2>
            <div className="mt-4 space-y-3">
              {fundingRounds.length > 0 ? (
                fundingRounds.map((round) => (
                  <a
                    key={`${round.round}-${round.sourceUrl}`}
                    href={round.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="font-semibold text-zinc-950 dark:text-zinc-50">{round.round}</div>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          {round.announcedAt && (
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays size={12} />
                              {formatDate(round.announcedAt)}
                            </span>
                          )}
                          <span>{round.sourceName}</span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        {round.amount && <div className="font-mono text-sm font-semibold text-zinc-950 dark:text-zinc-50">{round.amount}</div>}
                        {round.valuation && <div className="text-xs text-zinc-500 dark:text-zinc-400">Valuation {round.valuation}</div>}
                      </div>
                    </div>
                    {round.investors && round.investors.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {round.investors.slice(0, 8).map((investor) => (
                          <Badge key={investor} variant="outline" className="text-[10px] font-normal">
                            {investor}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </a>
                ))
              ) : (
                <div className="rounded-md border border-dashed border-zinc-200 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  Funding round links have not been verified for this profile yet.
                </div>
              )}
            </div>
          </div>

          <OwnershipDonut startup={startup} />
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-heading text-lg font-bold text-zinc-950 dark:text-zinc-50">
              Social Profiles
            </h2>
            <div className="mt-4 space-y-2">
              {socials.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    <span className="inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <Icon size={14} />
                      {item.label}
                    </span>
                    <ArrowUpRight size={13} className="text-zinc-400" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-heading text-lg font-bold text-zinc-950 dark:text-zinc-50">
              Profile Sources
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {profileSources.map((source) => (
                <SourceBadge key={source.url} source={source.label} url={source.url} />
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
