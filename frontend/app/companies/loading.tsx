import PageSkeleton from '@/components/PageSkeleton';

export default function Loading() {
  return (
    <PageSkeleton
      titleWidth="w-72"
      descriptionWidth="w-[34rem]"
      withStats
      cardCount={9}
      gridClassName="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
    />
  );
}
