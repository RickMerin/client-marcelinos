/**
 * Broadcast channel name helpers.
 * Must match backend App\Broadcasting\BroadcastChannelNames.
 * Use with Echo: .private(RealtimeChannels.booking(ref)) — Echo adds "private-" prefix.
 */

export const RealtimeChannels = {
  /** Private channel for a single booking (by reference). */
  booking: (reference: string) => `booking.${reference}`,

  /** Private channel for admin/staff dashboard. */
  adminDashboard: () => "admin.dashboard",

  /** Public channel (if used). */
  bookingsPublic: () => "bookings",
} as const;
