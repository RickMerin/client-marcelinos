import { useState } from "react";
import { BedDouble, Minus, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { RoomTypeBadge } from "@/components/ui/RoomTypeBadge";
import { UnavailableReasonOverlay } from "@/components/booking/UnavailableReasonOverlay";
import { Button } from "@/components/ui/button";
import {
  amenityNames,
  amenityPills,
  roomImages,
} from "@/hooks/useRoomList";
import type { RoomTypeFilter } from "@/types/booking.types";

const EMPTY_FIELD = "—";

export interface RoomTypeQuantityCardProps {
  roomType: RoomTypeFilter;
  typeLabel: string;
  /** Primary headline — usually `description` (e.g. "2 Single Bed", "1 Double Bed"). */
  layoutLabel: string;
  roomsInGroup: any[];
  selectedCount: number;
  maxAvailable: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

function bedSpecsLine(room: any): string | null {
  const specs = room?.bed_specifications;
  if (!Array.isArray(specs) || specs.length === 0) return null;
  const mods = room?.bed_modifiers;
  const base = specs.filter(Boolean).join(", ");
  if (!base) return null;
  if (Array.isArray(mods) && mods.length > 0) {
    return `${base} (${mods.join(", ")})`;
  }
  return base;
}

export function RoomTypeQuantityCard({
  roomType,
  typeLabel,
  layoutLabel,
  roomsInGroup,
  selectedCount,
  maxAvailable,
  onIncrement,
  onDecrement,
}: RoomTypeQuantityCardProps) {
  const availableRooms = roomsInGroup.filter((r) => r.available !== false);
  const rep =
    availableRooms[0] ??
    roomsInGroup[0] ??
    ({ type: typeLabel } as Record<string, unknown>);
  const images = roomImages(rep);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const hasGallery = images.length > 1;
  const mainImage =
    images[activeImageIndex] ?? images[0] ?? "/placeholder-room.jpg";

  const pills = amenityPills((rep as any).amenities);
  const fallbackDesc =
    (rep as any).description?.trim() ||
    amenityNames((rep as any).amenities) ||
    EMPTY_FIELD;
  const headline =
    layoutLabel.trim() ||
    (fallbackDesc !== EMPTY_FIELD ? fallbackDesc : typeLabel);

  const caps = availableRooms
    .map((r) => Number(r.capacity))
    .filter((n) => !Number.isNaN(n) && n > 0);
  const maxCap = caps.length ? Math.max(...caps) : null;
  const minCap = caps.length ? Math.min(...caps) : null;
  const capacityGuestWord =
    maxCap !== null && Number(maxCap) === 1 ? "guest" : "guests";
  const capacityLine =
    maxCap === null
      ? null
      : minCap === maxCap
        ? `${maxCap} ${capacityGuestWord}`
        : `${minCap}–${maxCap} ${capacityGuestWord}`;

  const bedExtra = bedSpecsLine(rep);
  const showBedExtra =
    bedExtra &&
    bedExtra.toLowerCase() !== headline.toLowerCase();

  const prices = availableRooms.map((r) => Number(r.price) || 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const samePrice = minPrice === maxPrice;

  const fullyBooked = maxAvailable === 0 && roomsInGroup.length > 0;
  const firstBlocked = roomsInGroup.find((r) => r.available === false);
  const unavailableTitle =
    firstBlocked?.unavailability_title?.trim() || "Fully booked";
  const unavailableDetail =
    firstBlocked?.unavailability_detail?.trim() ||
    "No rooms in this category for the selected dates.";

  const canInc = selectedCount < maxAvailable;
  const canDec = selectedCount > 0;
  const unavailableInGroup = roomsInGroup.length - maxAvailable;

  return (
    <section
      className={cn(
        "group/card flex flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] transition-shadow hover:shadow-[0_1px_0_rgba(15,23,42,0.05),0_16px_40px_-14px_rgba(15,23,42,0.14)]",
        selectedCount > 0 &&
          "border-emerald-200/90 ring-1 ring-emerald-500/25 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]",
      )}
    >
      <div className="relative h-[200px] w-full bg-gradient-to-b from-stone-100 to-stone-200/90 sm:h-[230px]">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/card:scale-[1.02]"
          style={{ backgroundImage: `url(${mainImage})` }}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent"
          aria-hidden
        />
        {fullyBooked && (
          <UnavailableReasonOverlay
            title={unavailableTitle}
            detail={unavailableDetail}
          />
        )}
        {selectedCount > 0 && !fullyBooked && (
          <div
            className="absolute top-3 right-3 z-10 flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 shadow-lg ring-2 ring-white/30"
            style={{ backgroundColor: "var(--color-sage)" }}
            aria-hidden
          >
            <span className="text-sm font-bold tracking-tight text-white tabular-nums">
              {selectedCount}
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="inline-flex rounded-md border border-white/25 bg-black/35 px-2 py-1 backdrop-blur-sm">
            <RoomTypeBadge type={typeLabel} isTitle />
          </div>
        </div>
        {hasGallery && !fullyBooked && (
          <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 overflow-x-auto pb-1 pt-6">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(i);
                }}
                className={cn(
                  "aspect-4/3 w-14 shrink-0 overflow-hidden rounded-lg ring-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900/80",
                  i === activeImageIndex
                    ? "ring-white shadow-lg shadow-black/30"
                    : "ring-white/70 opacity-90 hover:opacity-100",
                )}
                aria-label={`View image ${i + 1}`}
                aria-pressed={i === activeImageIndex}
                style={{
                  backgroundImage: `url(${img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <span className="sr-only">Image {i + 1}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative flex flex-1 flex-col bg-[linear-gradient(180deg,#fffefc_0%,#faf8f5_100%)] p-5 pt-4">
        <div
          className="mb-4 rounded-xl border border-amber-100/80 bg-gradient-to-br from-stone-50/95 via-white to-amber-50/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
          style={{ boxShadow: "inset 0 0 0 1px rgba(245, 158, 11, 0.06)" }}
        >
          <div className="flex gap-3.5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm"
              style={{
                background:
                  "linear-gradient(145deg, rgba(49, 90, 59, 0.12) 0%, rgba(49, 90, 59, 0.06) 100%)",
                color: "var(--color-sage, #315a3b)",
              }}
            >
              <BedDouble className="size-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Bed layout
              </p>
              <p
                className="font-display text-lg font-semibold leading-snug tracking-tight text-stone-900 sm:text-xl"
                style={{ color: "var(--color-charcoal, #1c1917)" }}
              >
                {headline}
              </p>
              {showBedExtra && (
                <p className="text-xs leading-relaxed text-stone-600">
                  Also listed:{" "}
                  <span className="font-medium text-stone-800">{bedExtra}</span>
                </p>
              )}
            </div>
          </div>

          {capacityLine && (
            <div className="mt-4 flex items-center gap-2.5 border-t border-amber-100/90 pt-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
                <Users className="size-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-stone-500">
                  Capacity
                </p>
                <p className="text-sm font-semibold text-stone-900">
                  {capacityLine}
                  {minCap !== maxCap && (
                    <span className="ml-1 text-xs font-normal text-stone-500">
                      (varies by unit)
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/80">
              {maxAvailable} available
            </span>
            {unavailableInGroup > 0 && (
              <span className="text-xs text-stone-500">
                {unavailableInGroup} unavailable for these dates
              </span>
            )}
          </div>
        </div>

        {pills.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {pills.map((pill, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full border border-stone-200/90 bg-white/80 px-3 py-1 text-xs font-medium text-stone-700 shadow-sm"
              >
                {pill}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 border-t border-stone-200/70 pt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p
              className="text-[0.65rem] font-semibold uppercase tracking-wider text-stone-500"
            >
              From
            </p>
            <p
              className="font-display text-xl font-bold text-stone-900"
              style={{ color: "var(--color-charcoal, #1c1917)" }}
            >
              {samePrice ? (
                pricingFormat(minPrice)
              ) : (
                <>
                  {pricingFormat(minPrice)}
                  <span className="text-sm font-normal text-stone-600">
                    {" "}
                    – {pricingFormat(maxPrice)}
                  </span>
                </>
              )}
              <span className="text-sm font-normal text-stone-500"> /night</span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="border-stone-200 bg-white shadow-sm hover:bg-stone-50"
              disabled={!canDec || fullyBooked}
              onClick={onDecrement}
              aria-label={`Remove one ${roomType} room (${headline})`}
            >
              <Minus className="size-4" />
            </Button>
            <span
              className="min-w-10 text-center font-display text-xl font-semibold tabular-nums text-stone-900"
              aria-live="polite"
            >
              {selectedCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                "border-stone-200 bg-white shadow-sm hover:bg-stone-50",
                canInc &&
                  !fullyBooked &&
                  "border-emerald-300/90 hover:border-emerald-400 hover:bg-emerald-50/90",
              )}
              disabled={!canInc || fullyBooked}
              onClick={onIncrement}
              aria-label={`Add one ${roomType} room (${headline})`}
            >
              <Plus className="size-4 text-emerald-700" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
