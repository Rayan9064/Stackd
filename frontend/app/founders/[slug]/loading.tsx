import PageSkeleton from '@/components/PageSkeleton';

export default function Loading() {
  return (
    <div className="space-y-7" role="status" aria-label="Loading founder profile">
      <div className="h-5 w-28 animate-pulse rounded-md bg-zinc-200/80 dark:bg-zinc-800/80" />
      <PageSkeleton titleWidth="w-64" descriptionWidth="w-[32rem]" cardCount={4} gridClassName="grid gap-3 md:grid-cols-2" />
    </div>
  );
}
