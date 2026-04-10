import { Skeleton } from "@/components/ui/skeleton";

function ReviewSectionSkeleton() {
  return (
    <div className="max-w-[760px] mx-auto text-center">
      <blockquote className="my-8 space-y-3">
        <Skeleton className="h-[clamp(22px,3vw,36px)] w-full max-w-[640px] mx-auto rounded-md bg-cream/15" />
        <Skeleton className="h-[clamp(22px,3vw,36px)] w-11/12 max-w-[580px] mx-auto rounded-md bg-cream/15" />
        <Skeleton className="h-[clamp(22px,3vw,36px)] w-4/5 max-w-[480px] mx-auto rounded-md bg-cream/15" />
        <Skeleton className="h-[clamp(22px,3vw,36px)] w-3/5 max-w-[320px] mx-auto rounded-md bg-cream/12" />
      </blockquote>

      <Skeleton className="h-[13px] w-48 mx-auto rounded-sm bg-cream/20" />

      <div className="flex justify-center gap-2.5 mt-12">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-2 h-2 rounded-full shrink-0 bg-cream/25"
          />
        ))}
      </div>
    </div>
  );
}

export default ReviewSectionSkeleton;
