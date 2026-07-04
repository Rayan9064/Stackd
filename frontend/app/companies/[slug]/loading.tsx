import PageSkeleton from '@/components/PageSkeleton';

export default function Loading() {
  return (
    <div className="space-y-7" role="status" aria-label="Loading company profile">
      <div className="h-5 w-28 animate-pulse rounded-md bg-zinc-200/80 dark:bg-zinc-800/80" />
      <PageSkeleton
        titleWidth="w-64"
        descriptionWidth="w-[32rem]"
        withStats
        cardCount={4}
        gridClassName="space-y-4"
      />
    </div>
  );
}
