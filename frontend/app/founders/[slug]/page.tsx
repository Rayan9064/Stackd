import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Building2, Globe2, Linkedin, MapPin, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function FounderDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const founder = await api.getFounder(slug);

  if (!founder?.id) {
    notFound();
  }

  const companies = founder.companies || [];

  return (
    <div className="space-y-7">
      <Link href="/companies" className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50">
        <ArrowLeft size={15} />
        Companies
      </Link>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge variant="outline" className="inline-flex items-center gap-1 rounded-md border-zinc-200 bg-zinc-50 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <UserRound size={13} />
              Founder Profile
            </Badge>
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                {founder.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {founder.headline || 'Founder profile generated from structured Stackd ecosystem sources.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              {founder.geography && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} />
                  {founder.geography}
                </span>
              )}
              {founder.linkedinUrl && (
                <a href={founder.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-zinc-950 hover:underline dark:hover:text-zinc-50">
                  <Linkedin size={13} />
                  LinkedIn
                </a>
              )}
              {founder.website && (
                <a href={founder.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-zinc-950 hover:underline dark:hover:text-zinc-50">
                  <Globe2 size={13} />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="border-b border-zinc-100 pb-3 dark:border-zinc-900">
          <h2 className="font-heading text-lg font-bold text-zinc-950 dark:text-zinc-50">Companies</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Company relationships attached from source-backed records.</p>
        </div>

        {companies.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-200 py-10 text-center dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No company relationships have been attached yet.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.slug}`}
                className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-650"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1 font-semibold text-zinc-950 dark:text-zinc-50">
                      <Building2 size={14} />
                      {company.name}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{company.title || company.role || 'Founder'}</div>
                  </div>
                  <ArrowUpRight size={14} className="text-zinc-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
