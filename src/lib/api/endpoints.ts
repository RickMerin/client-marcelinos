/**
 * Centralized API endpoints and TanStack Query key factory.
 * System design: single source of truth for URLs and query keys so
 * invalidation and refetch behavior stay consistent.
 */

/** Base path segments for API resources (no leading slash; apiClient has baseURL). */
export const endpoints = {
  bookings: "/bookings",
  bookingByReference: (reference: string) => `/bookings/reference/${reference}`,
  cancelBooking: (reference: string) => `/bookings/ ${reference} /cancel`,
  rooms: "/rooms",
  roomById: (id: string | number) => `/rooms/${id}`,
  venues: "/venues",
  venueById: (id: string | number) => `/venues/${id}`,
  blockedDates: "/blocked-dates",
  contact: "/contact",
  testimonialByReference: (reference: string) =>
    `/bookings/reference/${reference}/review`,
  galleries: "/galleries",
} as const;

/**
 * Query key factory for TanStack Query.
 * Use these keys so invalidateQueries({ queryKey: queryKeys.rooms.all }) works.
 */
export const queryKeys = {
  rooms: {
    all: ["rooms"] as const,
    list: (checkIn?: string, checkOut?: string) =>
      ["rooms", checkIn ?? "", checkOut ?? ""] as const,
    detail: (id: string | number) => ["rooms", String(id)] as const,
  },
  venues: {
    all: ["venues"] as const,
    list: (checkIn?: string, checkOut?: string) =>
      ["venues", checkIn ?? "", checkOut ?? ""] as const,
    detail: (id: string | number) => ["venues", String(id)] as const,
  },
  blockedDates: {
    all: ["blocked-dates"] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    detail: (id: string | number) => ["bookings", String(id)] as const,
    byReference: (reference: string) =>
      ["bookings", "reference", reference] as const,
    receipt: (reference: string) =>
      ["booking-receipt", reference] as const,
  },
  galleries: {
    all: ["galleries"] as const,
  },
  reviews: {
    all: ["reviews"] as const,
  },
} as const;
