import PageSkeleton from '@/components/PageSkeleton';

export default function Loading() {
  return <PageSkeleton titleWidth="w-80" descriptionWidth="w-[32rem]" withAction showNotice cardCount={9} />;
}
