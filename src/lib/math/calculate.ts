import type { BookingKind } from "@/types/booking.types";
import type { VenueEventType } from "@/types/booking.types";

/**
 * Calculates the total price of all rooms/venues in the given arrays.
 * Allows missing/undefined price values and treats them as 0.
 */

type PriceItem = { price?: number | string };

export type VenuePriceItem = {
  wedding_price?: number | string;
  birthday_price?: number | string;
  meeting_staff_price?: number | string;
};

function normalizeVenueEventTypeForPricing(
  eventType: VenueEventType | "" | "seminar",
): VenueEventType | "" {
  if (eventType === "seminar") return "meeting_staff";
  return eventType;
}

/** Lowest per-event rate among the three tiers (for list cards / “starting at”). */
export function venueStartingDisplayPrice(venue: VenuePriceItem): number {
  const w = Number(venue.wedding_price) || 0;
  const b = Number(venue.birthday_price) || 0;
  const m = Number(venue.meeting_staff_price) || 0;
  const vals = [w, b, m].filter((n) => n > 0);
  if (vals.length === 0) return 0;
  return Math.min(...vals);
}

/**
 * Per-night venue rate for the selected event type (each venue sets its own amounts).
 */
export function venueEffectiveUnitPrice(
  venue: VenuePriceItem,
  eventType: VenueEventType | "" | "seminar",
): number {
  const t = normalizeVenueEventTypeForPricing(eventType);
  if (t === "birthday") {
    return Number(venue.birthday_price) || 0;
  }
  if (t === "meeting_staff") {
    return Number(venue.meeting_staff_price) || 0;
  }
  return Number(venue.wedding_price) || 0;
}

export function calculateVenuesLineTotal(
  venues: VenuePriceItem[] = [],
  eventType: VenueEventType | "",
): number {
  if (!Array.isArray(venues) || venues.length === 0) return 0;
  return venues.reduce(
    (total, v) => total + venueEffectiveUnitPrice(v, eventType),
    0,
  );
}

export const calculateTotalPrice = (items: PriceItem[] = []) => {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((total, item) => total + (Number(item.price) || 0), 0);
};

/**
 * All selected line items (rooms + venues) are priced × `numDays` (stay length).
 * Venue-only bookings use `numDays === 1`. Room + venue uses the same nights for
 * both—e.g. 6 nights → room and venue each × 6.
 * Venue amounts use `venue_event_type` and each venue’s wedding / birthday / meeting_staff prices.
 */
export const calculateGrandTotalPrice = (
  rooms: PriceItem[] = [],
  numDays: number,
  venues: VenuePriceItem[] = [],
  _bookingKind: BookingKind = "room",
  venueEventType: VenueEventType | "" | "seminar" = "",
) => {
  const roomsTotal = calculateTotalPrice(rooms);
  const venuesTotal = calculateVenuesLineTotal(venues, venueEventType);
  const safeDays = Math.max(1, numDays);
  return (roomsTotal + venuesTotal) * safeDays;
};
