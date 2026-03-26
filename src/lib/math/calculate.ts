import type { BookingKind } from "@/types/booking.types";

/**
 * Calculates the total price of all rooms/venues in the given arrays.
 * Allows missing/undefined price values and treats them as 0.
 */

type PriceItem = { price?: number | string };

export const calculateTotalPrice = (items: PriceItem[] = []) => {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((total, item) => total + (Number(item.price) || 0), 0);
};

/**
 * All selected line items (rooms + venues) are priced × `numDays` (stay length).
 * Venue-only bookings use `numDays === 1`. Room + venue uses the same nights for
 * both—e.g. 6 nights → room and venue each × 6.
 */
export const calculateGrandTotalPrice = (
  rooms: PriceItem[] = [],
  numDays: number,
  venues: PriceItem[] = [],
  _bookingKind: BookingKind = "room",
) => {
  const roomsTotal = calculateTotalPrice(rooms);
  const venuesTotal = calculateTotalPrice(venues);
  const safeDays = Math.max(1, numDays);
  return (roomsTotal + venuesTotal) * safeDays;
};
