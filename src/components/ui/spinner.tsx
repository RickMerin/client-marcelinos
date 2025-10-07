import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-8 animate-spin", className)}
      {...props}
    />
  );
}

export function SpinnerCustom() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/80">
      <Spinner />
    </div>
  );
}

export { SpinnerCustom as Spinner };
