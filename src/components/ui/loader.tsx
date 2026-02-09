import { cn } from "@/lib/utils";

const loaderSizes = {
  sm: "size-4",
  md: "size-8",
  lg: "size-12",
} as const;

type LoaderSize = keyof typeof loaderSizes;

/** Base spinner dot – brand-colored, use inside other loaders or standalone */
function SpinnerDot({
  size = "md",
  className,
  ...props
}: React.ComponentProps<"div"> & { size?: LoaderSize }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "rounded-full border-2 border-(--default-color)/30 border-t-(--default-color) animate-spin",
        loaderSizes[size],
        className
      )}
      {...props}
    />
  );
}

/** Full-page loader – for route Suspense or full-screen loading (e.g. receipt) */
function PageLoader({
  message,
  className,
  ...props
}: React.ComponentProps<"div"> & { message?: string }) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/90 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <SpinnerDot size="lg" />
      {message && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

/** Inline loader – for sections, cards, or replace-of-content loading */
function InlineLoader({
  message,
  size = "md",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  message?: string;
  size?: LoaderSize;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-8",
        className
      )}
      {...props}
    >
      <SpinnerDot size={size} />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

/** Small spinner for inside buttons – use with disabled and this as children */
function ButtonLoader({
  size = "sm",
  className,
  ...props
}: React.ComponentProps<"div"> & { size?: LoaderSize }) {
  return (
    <SpinnerDot
      size={size}
      className={cn("border-white/40 border-t-white", className)}
      {...props}
    />
  );
}

/** Overlay on a container (e.g. card, table) while loading */
function OverlayLoader({
  loading,
  children,
  message,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  loading: boolean;
  children: React.ReactNode;
  message?: string;
}) {
  if (!loading) return <>{children}</>;
  return (
    <div className={cn("relative", className)} {...props}>
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/80 backdrop-blur-[2px]">
        <SpinnerDot size="md" />
        {message && (
          <p className="text-xs font-medium text-muted-foreground">{message}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export {
  SpinnerDot,
  PageLoader,
  InlineLoader,
  ButtonLoader,
  OverlayLoader,
  loaderSizes,
};
export type { LoaderSize };
