import Link from 'next/link';
import { BadgeCheck, ChartPie, ExternalLink, RadioTower, UserRound } from 'lucide-react';

const roadmapItems = [
  {
    icon: BadgeCheck,
    title: 'Verified founder identity',
    body: 'Founder profiles will only ship after names, roles, and profile links are backed by trusted sources.',
  },
  {
    icon: RadioTower,
    title: 'Source-linked activity',
    body: 'Profiles will connect founder activity to startup profiles, funding rounds, launches, news, and public social handles.',
  },
  {
    icon: ChartPie,
    title: 'Ownership context',
    body: 'The shareholder view will start with transparent, source-attributed ownership data before any visualization appears.',
  },
];

export default function FoundersPage() {
  return (
    <div className="space-y-7">
      <section className="border-b border-zinc-100 pb-7 dark:border-zinc-900">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <UserRound size={14} />
              Founder intelligence
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Founder Profiles
              </h1>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Coming soon. Stackd will publish founder profiles only after the data is source-backed, attributable, and linked to a real startup profile.
              </p>
            </div>
          </div>

          <Link
            href="/startups"
            className="inline-flex w-fit items-center gap-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            View startups
            <ExternalLink size={13} />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {roadmapItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                <Icon size={17} />
              </div>
              <h2 className="font-heading text-base font-bold text-zinc-950 dark:text-zinc-50">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {item.body}
              </p>
            </div>
          );
        })}
      </section>

      <section className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="max-w-3xl space-y-2">
          <h2 className="font-heading text-lg font-bold text-zinc-950 dark:text-zinc-50">
            Source buildout starts from known startups
          </h2>
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            The next data pass should enrich the current startup directory first: official websites, LinkedIn/X/GitHub profiles, funding round links, investor participation, and only then founder and ownership relationships.
          </p>
        </div>
      </section>
    </div>
  );
}
