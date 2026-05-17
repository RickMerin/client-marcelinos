import React from "react";
import { cn } from "@/lib/utils";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { BookingCardGallery } from "@/components/booking/BookingCardGallery";
import { UnavailableReasonOverlay } from "@/components/booking/UnavailableReasonOverlay";

interface VenueCardProps {
  id: number;
  name: string;
  images?: string[];
  capacity: string;
  price: string | number;
  /** Shown under the amount, e.g. "Wedding rate" vs "Meeting/Seminar rate" */
  priceTierLabel?: string;
  selected?: boolean;
  onSelectVenue: (id: number) => void;
  /** When false, venue is not available for the selected dates; selection is disabled. When true or undefined, venue is bookable. */
  availability?: boolean | null;
  unavailabilityTitle?: string | null;
  unavailabilityDetail?: string | null;
}

export const VenueCard: React.FC<VenueCardProps> = ({
  id,
  name,
  images = [],
  capacity,
  price,
  priceTierLabel,
  selected = false,
  onSelectVenue,
  availability = true,
  unavailabilityTitle,
  unavailabilityDetail,
}) => {
  const unavailableHeadline =
    unavailabilityTitle?.trim() || "Not available for selected dates";
  const unavailableSub =
    unavailabilityDetail?.trim() ||
    "Choose different dates or another venue";

  const showCapacity = capacity && capacity.trim() !== "" && capacity !== "—";
  const isAvailable = availability !== false;

  const handleSelect = () => {
    if (!isAvailable) return;
    onSelectVenue(id);
  };

  return (
		<article
			role="button"
			tabIndex={isAvailable ? 0 : -1}
			aria-pressed={selected}
			aria-disabled={!isAvailable}
			aria-label={
				isAvailable
					? `${name}, ${pricingFormat(String(price))} per event. ${selected ? "Added" : "Add to booking"}`
					: `${name}, ${pricingFormat(String(price))} per event. ${unavailableHeadline}. ${unavailableSub}`
			}
			className={cn(
				"group relative flex flex-col border bg-white text-left shadow-sm transition-all duration-200 overflow-hidden",
				"focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
				!isAvailable &&
					"opacity-85 cursor-not-allowed border-gray-200 bg-gray-50/80",
				isAvailable &&
					(selected
						? "border-(--color-sage) bg-sage-muted/30 shadow-md ring-2 ring-sage/20 focus-visible:ring-(--color-sage)"
						: "border-gray-200/80 hover:border-(--color-sage-light) hover:shadow-md focus-visible:ring-(--color-sage)"),
			)}
			onClick={handleSelect}
			onKeyDown={(e) => {
				if (!isAvailable) return;
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onSelectVenue(id);
				}
			}}>
			<div className="relative">
				<BookingCardGallery
					images={images}
					alt={name}
					mainHeightClass="h-[200px]"
					placeholderSrc="/placeholder-room.jpg"
				/>
				{!isAvailable && (
					<UnavailableReasonOverlay
						title={unavailableHeadline}
						detail={unavailableSub}
					/>
				)}
			</div>

			{/* Content below image */}
			<div className="relative flex flex-col flex-1 p-5">
				{/* Selected: checkmark in top-right of content */}
				{selected && (
					<div
						className="absolute top-4 right-5 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-md"
						style={{ backgroundColor: "var(--color-sage)" }}
						aria-hidden>
						<svg
							className="h-5 w-5 text-white"
							fill="none"
							stroke="currentColor"
							strokeWidth={3}
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
				)}
				<h3
					className="font-display text-lg font-bold capitalize tracking-tight"
					style={{ color: "var(--color-charcoal)" }}>
					{name}
				</h3>
				{showCapacity && (
					<p
						className="mt-2 text-sm"
						style={{ color: "var(--color-charcoal)" }}>
						{capacity} {Number(capacity) === 1 ? "guest" : "guests"}
					</p>
				)}
				<div className="mt-auto pt-4 flex items-end justify-between gap-4">
					<div>
						<p
							className="text-xs opacity-70"
							style={{ color: "var(--color-charcoal)" }}>
							From
						</p>
						<p
							className="font-display text-lg font-bold"
							style={{ color: "var(--color-charcoal)" }}>
							{pricingFormat(String(price))}
							<span className="text-sm font-normal opacity-70"> /event</span>
						</p>
						{priceTierLabel ? (
							<p
								className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium italic text-amber-900">
								{priceTierLabel}
							</p>
						) : null}
					</div>
					<button
						type="button"
						disabled={!isAvailable}
						onClick={(e) => {
							e.stopPropagation();
							if (isAvailable) onSelectVenue(id);
						}}
						className={cn(
							"shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all",
							"focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
							!isAvailable &&
								"cursor-not-allowed border-0 bg-transparent text-gray-500 focus-visible:ring-gray-400",
							isAvailable && "focus-visible:ring-(--color-sage)",
							isAvailable &&
								(selected
									? "bg-(--color-sage) text-white shadow-sm"
									: "bg-(--color-cream) text-(--color-charcoal) hover:bg-gray-200/80 border border-gray-200/80"),
						)}
						style={
							isAvailable && selected
								? { borderColor: "(--color-sage)" }
								: undefined
						}
						aria-label={
							!isAvailable
								? `${unavailableHeadline}. ${unavailableSub}`
								: selected
									? "Added"
									: "Add venue"
						}>
						{!isAvailable ? "Unavailable" : selected ? "Added" : "Add"}
					</button>
				</div>
			</div>
		</article>
	);
};
