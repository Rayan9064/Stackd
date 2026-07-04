interface PageSkeletonProps {
  titleWidth?: string;
  descriptionWidth?: string;
  withAction?: boolean;
  withStats?: boolean;
  cardCount?: number;
  gridClassName?: string;
  showNotice?: boolean;
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-zinc-200/80 dark:bg-zinc-800/80 ${className}`}
      aria-hidden="true"
    />
  );
}

function FilterSkeleton() {
  return (
    <div className="flex flex-col gap-3 border-b border-zinc-100 pb-5 dark:border-zinc-900 sm:flex-row sm:items-center sm:justify-between">
      <SkeletonBlock className="h-11 w-full sm:max-w-xl" />
      <div className="flex gap-2">
        <SkeletonBlock className="h-11 w-36" />
        <SkeletonBlock className="h-11 w-36" />
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex min-h-72 flex-col justify-between rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-5 w-48" />
          </div>
          <SkeletonBlock className="h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-11/12" />
          <SkeletonBlock className="h-4 w-2/3" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-900">
        <SkeletonBlock className="h-6 w-24 rounded-full" />
        <SkeletonBlock className="h-4 w-20" />
      </div>
    </div>
  );
}

export default function PageSkeleton({
  titleWidth = 'w-64',
  descriptionWidth = 'w-96',
  withAction = false,
  withStats = false,
  cardCount = 9,
  gridClassName = 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',
  showNotice = false,
}: PageSkeletonProps) {
  return (
    <div className="space-y-6" role="status" aria-label="Loading page content">
      <div className="border-b border-zinc-100 pb-6 dark:border-zinc-900">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <SkeletonBlock className={`h-8 ${titleWidth}`} />
            <SkeletonBlock className={`h-4 max-w-full ${descriptionWidth}`} />
          </div>
          {withAction && <SkeletonBlock className="h-9 w-40" />}
          {withStats && (
            <div className="grid grid-cols-3 gap-2">
              <SkeletonBlock className="h-16 w-28" />
              <SkeletonBlock className="h-16 w-28" />
              <SkeletonBlock className="h-16 w-28" />
            </div>
          )}
        </div>
      </div>

      <FilterSkeleton />

      <div className={gridClassName}>
        {Array.from({ length: cardCount }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>

      {showNotice && (
        <div className="mx-auto mt-12 max-w-xl rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-850 dark:bg-zinc-950/50">
          <div className="space-y-3">
            <SkeletonBlock className="mx-auto h-5 w-36" />
            <SkeletonBlock className="mx-auto h-4 w-full max-w-md" />
            <SkeletonBlock className="mx-auto h-4 w-48" />
          </div>
        </div>
      )}
    </div>
  );
}
