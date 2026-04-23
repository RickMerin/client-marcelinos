import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const SinglePageSkeleton = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Main Selected Item Skeleton */}
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start border border-gray-100 bg-white shadow-sm shadow-gray-900/5 p-6 sm:p-8">
        <Skeleton className="h-[280px] sm:h-[360px] w-full" />

        <div className="space-y-6 pt-2">
          <Skeleton className="h-8 w-1/3" />
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>

          <div className="space-y-3 pt-4">
            <Skeleton className="h-5 w-24" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-6">
            <Skeleton className="h-10 w-48 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      </div>

      <SinglePageExploreSkeleton />
    </div>
  );
};

/** Explore / list grid only (used on Single page when detail is already shown and list is still loading). */
export function SinglePageExploreSkeleton() {
  return (
    <div
      className="space-y-6 animate-in fade-in duration-500"
      aria-busy="true"
      aria-label="Loading more rooms and venues"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-28" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={index}
            className="pt-0 gap-0 overflow-hidden border-none shadow-sm"
          >
            <CardHeader className="p-0">
              <Skeleton className="h-[220px] w-full rounded-t-xl rounded-b-none" />
            </CardHeader>
            <CardContent className="p-5 space-y-3 border border-t-0 rounded-b-xl border-gray-100">
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default SinglePageSkeleton;
