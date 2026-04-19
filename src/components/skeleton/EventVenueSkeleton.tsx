import { Skeleton } from "@/components/ui/skeleton";

function EventVenueSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr_1.25fr] gap-12 lg:gap-18 items-start w-full">
      {/* Left: intro + features + CTA — mirrors EventVenues loaded layout */}
      <div>
        <div className="space-y-3 mb-10 max-w-[65ch]">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-start gap-3.5">
              <Skeleton className="w-9 h-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-3 w-full rounded-md" />
                <Skeleton className="h-3 w-5/6 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        <Skeleton className="h-11 w-full max-w-[220px] rounded-md" />
      </div>

      {/* Right: CardItem-style venue cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="relative w-full overflow-hidden rounded-[4px] bg-white border border-sand-dark/60"
          >
            <Skeleton className="h-60 w-full rounded-none" />
            <div className="relative p-5 space-y-3">
              <Skeleton className="h-6 w-3/4 max-w-[180px] rounded-md" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-11/12 rounded-md" />
              </div>
              <div className="mt-4 pt-4 border-t border-sand-dark/40 flex items-baseline gap-2">
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventVenueSkeleton;
