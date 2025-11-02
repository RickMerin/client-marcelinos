/**
 * Saves a value to the local storage with the specified key.
 * @param {string} key - The key under which the value will be stored in local storage.
 * @param {any} value - The value to be stored in local storage.
 * @returns None
 */
export const saveToLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

/**
 * Retrieves a value from the local storage based on the provided key.
 * @param {string} key - The key to look up in the local storage.
 * @returns The value associated with the key if found, otherwise null.
 */
export const getFromLocalStorage = (key: string) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};
