import { Skeleton } from "@/components/ui/skeleton";

function CarouselSkeleton() {
  return (
    <div className="relative w-full max-w-[1200px] mx-auto min-h-[420px] shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-h-[420px]">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="group bg-dark overflow-hidden relative border border-white/6 shadow-lg"
          >
            <div className="relative overflow-hidden h-[280px] md:h-[340px]">
              <Skeleton className="h-full w-full rounded-none bg-cream/10" />
            </div>
            <div className="p-6 pt-5">
              <Skeleton className="h-[13px] w-24 rounded-sm mb-2 bg-cream/15" />
              <Skeleton className="h-7 w-4/5 max-w-[200px] rounded-md mb-3 bg-cream/15" />
              <Skeleton className="h-4 w-full rounded-md mb-2 bg-cream/10" />
              <Skeleton className="h-4 w-[90%] rounded-md mb-5 bg-cream/10" />
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-8 w-28 rounded-md bg-cream/15" />
                <Skeleton className="h-4 w-14 rounded-md bg-cream/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CarouselSkeleton;
