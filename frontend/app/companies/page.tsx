import { Activity, Database, RadioTower } from 'lucide-react';
import CompaniesClient from './CompaniesClient';
import CompanyCard from '@/components/CompanyCard';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    sector?: string;
    geography?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function CompaniesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;
  const limit = 18;

  const companiesRes = await api.getCompanies({
    page,
    limit,
    sector: resolvedParams.sector || '',
    geography: resolvedParams.geography || '',
    search: resolvedParams.search || '',
  });

  const companies = companiesRes?.data || [];
  const totalItems = companiesRes?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);
  const totalSignals = companies.reduce((sum, company) => sum + (company.signalCount || 0), 0);

  return (
    <div className="space-y-7">
      <div className="border-b border-zinc-100 pb-6 dark:border-zinc-900">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <RadioTower size={14} />
              Stage 1 intelligence layer
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Company Signal Graph
            </h1>
            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Canonical company profiles resolved from launches, repositories, jobs, funding mentions, and startup profiles.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <Database size={13} />
                Companies
              </div>
              <div className="font-mono text-lg font-semibold text-zinc-950 dark:text-zinc-50">{totalItems}</div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <Activity size={13} />
                Page Signals
              </div>
              <div className="font-mono text-lg font-semibold text-zinc-950 dark:text-zinc-50">{totalSignals}</div>
            </div>
            <div className="col-span-2 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 sm:col-span-1">
              <div className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">Sources</div>
              <div className="font-mono text-lg font-semibold text-zinc-950 dark:text-zinc-50">7</div>
            </div>
          </div>
        </div>
      </div>

      <CompaniesClient currentPage={page} totalPages={totalPages} />

      {companies.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-200 py-12 text-center dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No companies match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </div>
  );
}
