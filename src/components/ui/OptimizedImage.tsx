import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface OptimizedImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string | null | undefined;
  alt: string;
  /** Aspect ratio as "width/height" e.g. "16/9" or "1" for square. Preserves layout and prevents CLS. */
  aspectRatio?: string;
  /** Optional explicit height class (e.g. "h-60"). Use with or without aspectRatio. */
  containerClassName?: string;
  skeletonClassName?: string;
}

/**
 * Image with skeleton placeholder and fixed dimensions to reduce layout shift
 * and improve perceived load for S3/remote images.
 */
export function OptimizedImage({
  src,
  alt,
  className,
  containerClassName,
  skeletonClassName,
  aspectRatio = "4/3",
  loading = "lazy",
  ...imgProps
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const effectiveSrc = src || undefined;
  const showPlaceholder = !loaded || !effectiveSrc;

  return (
    <div
      className={cn("relative w-full overflow-hidden bg-muted", containerClassName)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {showPlaceholder && (
        <Skeleton
          className={cn(
            "absolute inset-0 h-full w-full rounded-none",
            skeletonClassName
          )}
        />
      )}
      {effectiveSrc && (
        <img
          {...imgProps}
          src={effectiveSrc}
          alt={alt}
          loading={loading}
          onLoad={() => setLoaded(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </div>
  );
}
