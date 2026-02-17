import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { pricingFormat } from "@/lib/formatters/pricingFormat";

interface RoomCardProps {
  id: number;
  title: string;
  type: string;
  description: string;
  images?: string[];
  size: string;
  capacity: string;
  includes: string;
  price: string | number;
  selected?: boolean;
  onSelectRoom: (id: number) => void;
  /** Optional list of amenity names for pill tags (e.g. ["WiFi", "AC", "Slippers"]) */
  amenityPills?: string[];
}

const EMPTY_FIELD = "—";

export const RoomCard: React.FC<RoomCardProps> = ({
  id,
  title,
  type,
  description,
  images = [],
  size: _size,
  capacity,
  includes,
  price,
  selected = false,
  onSelectRoom,
  amenityPills,
}) => {
  const showCapacity = capacity && capacity !== EMPTY_FIELD;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const hasGallery = images.length > 1;
  const mainImage =
    images[activeImageIndex] ?? images[0] ?? "/placeholder-room.jpg";

  const pills: string[] =
    amenityPills && amenityPills.length > 0
      ? amenityPills
      : includes && includes !== EMPTY_FIELD
        ? includes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((i) => (i - 1 + images.length) % images.length);
  };
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((i) => (i + 1) % images.length);
  };

  return (
    <section
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${title}, ${pricingFormat(String(price))} per night. ${selected ? "Selected" : "Select"}`}
      className={cn(
        "group relative flex flex-col rounded-md text-left shadow-sm transition-all duration-200 overflow-hidden",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        selected
          ? "border-2 border-(--color-sage) bg-sage-muted/30 shadow-md ring-2 ring-sage/20 focus-visible:ring-(--color-sage)"
          : "border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md focus-visible:ring-(--color-sage)",
      )}
      onClick={() => onSelectRoom(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectRoom(id);
        }
      }}>
      {/* Image on top */}
      <div
        className="relative w-full h-[250px] bg-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundImage: `url(${mainImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        role="img"
        aria-label={title}>
        {/* Type Badge (e.g. "family") in the top-left over the image */}
        <div className="absolute top-2 left-2 z-10">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize"
            style={{
              backgroundColor: "var(--color-cream, #f5f5f0)",
              color: "var(--color-sage, #7ebb5e)",
              border: "1.5px solid var(--color-sage, #7ebb5e)",
              boxShadow: "0 1px 3px 0 rgba(60,60,60,.08)",
              letterSpacing: "0.03em",
            }}>
            {type}
          </span>
        </div>
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
        {/* Selected: checkmark in top-right of white content, slightly overlapping image */}
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
          className="font-display text-xl font-bold capitalize tracking-tight"
          style={{ color: "var(--color-charcoal)" }}>
          {title}
        </h3>
        {description && description !== EMPTY_FIELD && (
          <p
            className="mt-1 text-sm opacity-80"
            style={{ color: "var(--color-charcoal)" }}>
            {description}
          </p>
        )}
        {showCapacity && (
          <p
            className={cn(
              "mt-2 text-sm",
              selected ? "font-medium" : "opacity-80",
            )}
            style={{ color: "var(--color-charcoal)" }}>
            Capacity:{" "}
            <span className="font-semibold">
              {capacity} {Number(capacity) === 1 ? "guest" : "guests"}
            </span>
          </p>
        )}
        {pills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {pills.map((label, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium border-gray-200/80"
                style={{
                  backgroundColor: "var(--color-cream, #f5f5f0)",
                  color: "var(--color-charcoal)",
                }}>
                {label}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto pt-4 flex items-end justify-between gap-4">
          <div>
            <p
              className={cn("text-xs", selected ? "opacity-90" : "opacity-70")}
              style={{ color: "var(--color-charcoal)" }}>
              From
            </p>
            <p
              className={cn(
                "font-display text-lg font-bold",
                selected ? "opacity-100" : "opacity-90",
              )}
              style={{ color: "var(--color-charcoal)" }}>
              {pricingFormat(String(price))}
              <span
                className={cn(
                  "text-sm font-normal",
                  selected ? "opacity-80" : "opacity-70",
                )}>
                {" "}
                /night
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectRoom(id);
            }}
            className={cn(
              "shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-sage) focus-visible:ring-offset-2",
              selected
                ? "bg-(--color-sage) text-white shadow-sm"
                : "border border-gray-200/80 hover:bg-gray-100",
            )}
            style={
              selected
                ? { backgroundColor: "var(--color-sage)" }
                : {
                    backgroundColor: "var(--color-cream, #f5f5f0)",
                    color: "var(--color-charcoal)",
                  }
            }
            aria-label={selected ? "Selected" : "Select room"}>
            {selected ? "Selected" : "Select"}
          </button>
        </div>
      </div>
    </section>
  );
};
