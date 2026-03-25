/**
 * Calculates the total price of all rooms/venues in the given arrays.
 * Allows missing/undefined price values and treats them as 0.
 */
type PriceItem = { price?: number | string };

export const calculateTotalPrice = (items: PriceItem[] = []) => {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((total, item) => total + (Number(item.price) || 0), 0);
};

/** Grand total = (rooms total + venues total) × numDays */
export const calculateGrandTotalPrice = (
  rooms: PriceItem[] = [],
  numDays: number,
  venues: PriceItem[] = [],
) => {
  const roomsTotal = calculateTotalPrice(rooms);
  const venuesTotal = calculateTotalPrice(venues);
  return (roomsTotal + venuesTotal) * Math.max(1, numDays);
};
