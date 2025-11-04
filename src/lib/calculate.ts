/**
 * Calculates the total price of all rooms in the given array.
 * @param {Room[]} rooms - An array of Room objects containing price information.
 * @returns {number} The total price of all rooms in the array.
 */
type Room = { price: number | string };

export const calculateTotalPrice = (rooms: Room[] = []) => {
  if (!Array.isArray(rooms) || rooms.length === 0) return 0;

  return rooms.reduce((total, room) => {
    const price = Number(room.price) || 0;
    return total + price;
  }, 0);
};

export const calculateGrandTotalPrice = (
  rooms: Room[] = [],
  numDays: number
) => {
  if (!Array.isArray(rooms) || rooms.length === 0) return 0;

  const totalPrice = rooms.reduce((total, room) => {
    const price = Number(room.price) || 0;
    return total + price;
  }, 0);

  return totalPrice * numDays;
};
