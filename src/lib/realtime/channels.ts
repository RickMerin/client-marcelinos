/**
 * Broadcast channel name helpers.
 * Must match backend App\Broadcasting\BroadcastChannelNames.
 * Use with Echo: .private(RealtimeChannels.booking(ref)) or .channel() for public.
 */

export const RealtimeChannels = {
  /** Public: single booking (receipt page). */
  booking: (reference: string) => `booking.${reference}`,

  bookingCancelled: (reference: string) => `booking. ${reference} .cancelled`,

  /** Private: admin/staff dashboard. */
  adminDashboard: () => "admin.dashboard",

  /** Public: blocked dates (calendar/booking form). */
  blockedDates: () => "blocked-dates",

  /** Public: rooms (Step1 & homepage). */
  rooms: () => "rooms",

  /** Public: venues (homepage). */
  venues: () => "venues",

  /** Public: gallery (homepage). */
  gallery: () => "gallery",

  /** Public: reviews/testimonials (landing). */
  reviews: () => "reviews",

} as const;
