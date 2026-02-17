/**
 * Saves a value to the local storage with the specified key.
 * @param {string} key - The key under which the value will be stored in local storage.
 * @param {any} value - The value to be stored in local storage.
 * @returns None
 */

// default and recommended expiration for booking-related data (e.g. reservation details) 
// 30 minutes after last update

export const BOOKING_EXPIRATION = 30 * 60 * 1000;

export const saveToLocalStorage = (
  key: string,
  value: any,
  expirationInMs?: number
): void => {
  const item = {
    value,
    expiry: expirationInMs
      ? Date.now() + expirationInMs
      : null,
  };

  localStorage.setItem(key, JSON.stringify(item));
};

/**
 * Retrieves a value from the local storage based on the provided key.
 * @param {string} key - The key to look up in the local storage.
 * @returns The value associated with the key if found, otherwise null.
 */
export const getFromLocalStorage = (key: string) => {

  const itemStr = localStorage.getItem(key);

  if (!itemStr) return null;

  try {

    const item = JSON.parse(itemStr);

    if (!item.expiry) {

      return item.value;

    }

    if (Date.now() > item.expiry) {

      localStorage.removeItem(key);

      return null;

    }

    return item.value;

  } catch {

    localStorage.removeItem(key);

    return null;

  }

};



/** Keys used for booking flow */
const BOOKING_KEYS = [
  "reservationDate",
  "reservationDetails",
  "reservationDetails.personal",
] as const;

/**
 * Clears booking-related data from localStorage (e.g. after successful booking).
 */
export const clearBookingStorage = () => {
  BOOKING_KEYS.forEach((key) => localStorage.removeItem(key));
};
