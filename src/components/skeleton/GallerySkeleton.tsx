import { Skeleton } from "@/components/ui/skeleton";

function GallerySkeleton() {
  return (
    <div
      className="w-[90%] max-w-[1200px] mx-auto pb-[50px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      aria-hidden>
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-[350px] w-full rounded-[15px]"
        />
      ))}
    </div>
  );
}

export default GallerySkeleton;
