/**
 * Realtime event payload types.
 * Keep in sync with backend event broadcastWith() return shapes.
 */

export interface BookingStatusUpdatedPayload {
  booking_id: number;
  reference: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  updated_at: string | null;
}

export interface AdminDashboardNotificationPayload {
  type: string;
  title: string;
  payload: Record<string, unknown>;
  at: string;
}

/** Map event names (broadcastAs) to payload types for type-safe listeners */
export interface RealtimeEventMap {
  BookingStatusUpdated: BookingStatusUpdatedPayload;
  AdminDashboardNotification: AdminDashboardNotificationPayload;
}

export type RealtimeEventName = keyof RealtimeEventMap;
