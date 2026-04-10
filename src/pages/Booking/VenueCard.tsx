import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
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

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const hasGallery = images.length > 1;
  const mainImage =
    images[activeImageIndex] ?? images[0] ?? "/placeholder-room.jpg";

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((i) => (i - 1 + images.length) % images.length);
  };
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((i) => (i + 1) % images.length);
  };

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
			{/* Image on top */}
			<div
				className="relative w-full h-[200px] bg-gray-100 overflow-hidden"
				onClick={(e) => e.stopPropagation()}
				style={{
					backgroundImage: `url(${mainImage})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
				role="img"
				aria-label={name}>
				{/* Not available for selected dates — text only, readable on any background */}
				{!isAvailable && (
					<UnavailableReasonOverlay
						title={unavailableHeadline}
						detail={unavailableSub}
					/>
				)}
				{hasGallery && (
					<>
						<button
							type="button"
							onClick={goPrev}
							className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/10 backdrop-blur-sm hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-sage)"
							aria-label="Previous image">
							<svg
								className="h-5 w-5 text-gray-700"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15 19l-7-7 7-7"
								/>
							</svg>
						</button>
						<button
							type="button"
							onClick={goNext}
							className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/10 backdrop-blur-sm hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-sage)"
							aria-label="Next image">
							<svg
								className="h-5 w-5 text-gray-700"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</button>
						<div className="absolute bottom-2 left-2 right-2 flex gap-1.5 overflow-x-auto pb-1">
							{images.map((img, i) => (
								<button
									key={i}
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										setActiveImageIndex(i);
									}}
									className={cn(
										"aspect-4/3 w-14 shrink-0 rounded-lg overflow-hidden ring-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-sage) focus-visible:ring-offset-2 focus-visible:ring-offset-white",
										i === activeImageIndex
											? "ring-(--color-sage) shadow-lg shadow-black/20"
											: "ring-white/80 opacity-90",
									)}
									aria-label={`View image ${i + 1}`}
									aria-pressed={i === activeImageIndex}
									style={{
										backgroundImage: `url(${img})`,
										backgroundSize: "cover",
										backgroundPosition: "center",
									}}>
									<span className="sr-only">Image {i + 1}</span>
								</button>
							))}
						</div>
					</>
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
								className="text-xs mt-1 font-medium"
								style={{ color: "var(--color-sage, #4a6741)" }}>
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
