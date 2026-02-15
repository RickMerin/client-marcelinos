/**
 * Subscribe to a private channel and optionally listen for events.
 * Unsubscribes on unmount. Prefer useRealtimeEvent for a single event.
 */

import { useEffect, useRef } from "react";
import { getEcho } from "@/lib/realtime/echo";
import { RealtimeChannels } from "@/lib/realtime/channels";

type ChannelName = ReturnType<typeof RealtimeChannels.booking> | ReturnType<typeof RealtimeChannels.adminDashboard>;

interface UseRealtimeChannelOptions {
  /** Channel name (use RealtimeChannels.booking(ref) or RealtimeChannels.adminDashboard()). */
  channel: ChannelName;
  /** Called when subscription succeeds (optional). */
  onSubscribed?: () => void;
  /** Called when subscription fails (optional). */
  onError?: (error: unknown) => void;
  /** If false, do not subscribe (e.g. when ref is missing). Default true. */
  enabled?: boolean;
}

/**
 * Subscribe to a private channel. Unsubscribes on unmount.
 * Use this when you need the channel instance to bind multiple events
 * or use useRealtimeEvent for a single event.
 */
export function useRealtimeChannel(options: UseRealtimeChannelOptions): void {
  const { channel, onSubscribed, onError, enabled = true } = options;
  const onSubscribedRef = useRef(onSubscribed);
  const onErrorRef = useRef(onError);
  onSubscribedRef.current = onSubscribed;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!enabled || !channel) return;

    const echo = getEcho();
    if (!echo) return;

    const privateChannel = echo.private(channel);
    privateChannel
      .subscribed(() => {
        onSubscribedRef.current?.();
      })
      .error((err: unknown) => {
        onErrorRef.current?.(err);
      });

    return () => {
      echo.leave(channel);
    };
  }, [channel, enabled]);
}
