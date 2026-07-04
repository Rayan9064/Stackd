import PageSkeleton from '@/components/PageSkeleton';

export default function Loading() {
  return <PageSkeleton titleWidth="w-72" descriptionWidth="w-[35rem]" withAction showNotice cardCount={9} />;
}
