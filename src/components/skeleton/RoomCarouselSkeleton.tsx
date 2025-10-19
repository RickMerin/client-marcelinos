import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function CarouselSkeleton() {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="pt-0 gap-0">
          <CardHeader className="px-0">
            <Skeleton className="h-60 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-40 rounded-md" />
            <Skeleton className="h-20 w-full rounded-md mt-2" />
            <Skeleton className="h-10 w-full rounded-md mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default CarouselSkeleton;
