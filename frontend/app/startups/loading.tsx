import PageSkeleton from '@/components/PageSkeleton';

export default function Loading() {
  return <PageSkeleton titleWidth="w-56" descriptionWidth="w-[28rem]" withAction showNotice cardCount={9} />;
}
