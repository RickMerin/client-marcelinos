import type { BookingKind } from "@/types/booking.types";
import type { VenueEventType } from "@/types/booking.types";

/**
 * Calculates the total price of all rooms/venues in the given arrays.
 * Allows missing/undefined price values and treats them as 0.
 */

type PriceItem = { price?: number | string };

export type VenuePriceItem = PriceItem & {
  seminar_price?: number | string;
};

/**
 * Per-night venue rate for the selected event type (full price vs seminar).
 */
export function venueEffectiveUnitPrice(
  venue: VenuePriceItem,
  eventType: VenueEventType | "",
): number {
  if (eventType === "seminar") {
    return Number(venue.seminar_price) || 0;
  }
  return Number(venue.price) || 0;
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
 * Venue amounts use `venue_event_type`: wedding/birthday → full `price`, seminar → `seminar_price`.
 */
export const calculateGrandTotalPrice = (
  rooms: PriceItem[] = [],
  numDays: number,
  venues: VenuePriceItem[] = [],
  _bookingKind: BookingKind = "room",
  venueEventType: VenueEventType | "" = "",
) => {
  const roomsTotal = calculateTotalPrice(rooms);
  const venuesTotal = calculateVenuesLineTotal(venues, venueEventType);
  const safeDays = Math.max(1, numDays);
  return (roomsTotal + venuesTotal) * safeDays;
};
