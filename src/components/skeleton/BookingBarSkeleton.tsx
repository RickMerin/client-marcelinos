import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Mirrors the home booking bar: labels, date/value rows, swap control, nights, submit. */
function BookingBarSkeleton() {
	return (
		<div
			className={cn(
				"relative z-10 flex flex-1 min-w-0 flex-col lg:flex-row lg:items-stretch",
			)}
			aria-busy="true"
			aria-label="Loading booking dates">
			{/* Check-in */}
			<div className="booking-bar-field flex flex-col items-center justify-center gap-1.5">
				<Skeleton className="h-[13px] w-[88px] rounded-sm bg-cream/20" />
				<Skeleton className="h-7 w-[min(100%,200px)] rounded-md bg-cream/12" />
			</div>
			{/* Reset / swap */}
			<div className="booking-bar-reset flex min-h-[48px] items-center justify-center lg:min-h-[52px]">
				<Skeleton className="size-12 shrink-0 rounded-full bg-cream/12" />
			</div>
			{/* Check-out */}
			<div className="booking-bar-field flex flex-col items-center justify-center gap-1.5">
				<Skeleton className="h-[13px] w-[96px] rounded-sm bg-cream/20" />
				<Skeleton className="h-7 w-[min(100%,200px)] rounded-md bg-cream/12" />
			</div>
			{/* Night(s) */}
			<div className="booking-bar-field flex flex-col items-center justify-center gap-1.5">
				<Skeleton className="h-[13px] w-[72px] rounded-sm bg-cream/20" />
				<Skeleton className="h-7 w-10 rounded-md bg-cream/12" />
			</div>
			{/* Check Availability */}
			<div className="booking-bar-submit col-span-full flex items-center justify-center pt-2 lg:pt-0">
				<Skeleton className="h-[52px] w-full max-w-[min(100%,280px)] rounded-sm bg-gold/35" />
			</div>
		</div>
	);
}

export default BookingBarSkeleton;
