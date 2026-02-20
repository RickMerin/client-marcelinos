import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Varying quote line counts so skeleton matches masonry grid heights */
const QUOTE_LINES = [2, 4, 3, 5, 2, 4];

function ReviewSectionSkeleton() {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
      {QUOTE_LINES.map((lineCount, index) => (
        <Card
          key={index}
          className="break-inside-avoid mb-6 bg-white rounded-2xl p-6 shadow-md border border-(--color-sage-muted) flex flex-col">
          {/* Quote lines — varying height to match masonry */}
          <div className="space-y-2 mb-6">
            {Array.from({ length: lineCount }).map((_, i) => (
              <Skeleton
                key={i}
                className={`h-4 rounded-md ${i === lineCount - 1 && lineCount > 1 ? "w-3/4" : "w-full"}`}
              />
            ))}
          </div>
          {/* Author row */}
          <div className="flex items-center gap-3 pt-4 border-t border-sage-muted/60 mt-auto">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
            <Skeleton className="w-9 h-9 rounded-md shrink-0" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default ReviewSectionSkeleton;
