/**
 * Subscribe to a channel and listen for a single event. Unsubscribes on unmount.
 * Type-safe payload when using RealtimeEventMap event names.
 */

import { useEffect, useRef } from "react";
import { getEcho } from "@/lib/realtime/echo";
import { RealtimeChannels } from "@/lib/realtime/channels";
import type { RealtimeEventMap, RealtimeEventName } from "@/types/realtime.types";

type ChannelName = ReturnType<typeof RealtimeChannels.booking> | ReturnType<typeof RealtimeChannels.adminDashboard>;

interface UseRealtimeEventOptions<E extends RealtimeEventName> {
  /** Channel name (use RealtimeChannels.booking(ref) or RealtimeChannels.adminDashboard()). */
  channel: ChannelName;
  /** Event name as broadcast by backend (e.g. "BookingStatusUpdated"). */
  event: E;
  /** Callback with typed payload. */
  onEvent: (payload: RealtimeEventMap[E]) => void;
  /** If false, do not subscribe. Default true. */
  enabled?: boolean;
}

/**
 * Subscribe to a private channel and listen for one event.
 * Unsubscribes on unmount. Event name must include the leading dot for Echo: ".BookingStatusUpdated".
 */
export function useRealtimeEvent<E extends RealtimeEventName>(
  options: UseRealtimeEventOptions<E>
): void {
  const { channel, event, onEvent, enabled = true } = options;
  const eventName = event.startsWith(".") ? event : `.${event}`;
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled || !channel) return;

    const echo = getEcho();
    if (!echo) return;

    const privateChannel = echo.private(channel);
    privateChannel.listen(eventName, (payload: RealtimeEventMap[E]) => {
      onEventRef.current(payload);
    });

    return () => {
      echo.leave(channel);
    };
  }, [channel, eventName, enabled]);
}
