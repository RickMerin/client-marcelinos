/**
 * libs/logger.ts
 * Centralized logger for development & production.
 */

const isDev = import.meta.env.DEV;

export const log = (...args: any[]) => {
  if (isDev) console.log("[LOG]:", ...args);
};

export const warn = (...args: any[]) => {
  console.warn("[WARN]:", ...args);
};

export const error = (...args: any[]) => {
  console.error("[ERROR]:", ...args);
};
