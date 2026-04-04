# Realtime (WebSocket)

This folder contains the Laravel Echo client and channel helpers for real-time updates from the backend (Pusher / Pusher-compatible websockets).

## Quick start

1. Ensure the backend has broadcasting configured for Pusher (`BROADCAST_CONNECTION=pusher`) and your `PUSHER_*` env vars are set.
2. In the client, set `VITE_WS_*` in `.env` if you need to override defaults (see project root documentation).
3. In a React component, use the hooks:

```tsx
import { useRealtimeEvent } from "@/hooks/useRealtimeEvent";
import { RealtimeChannels } from "@/lib/realtime/channels";

useRealtimeEvent({
  channel: RealtimeChannels.booking(referenceNumber),
  event: "BookingStatusUpdated",
  onEvent: (payload) => {
    // payload is typed (e.g. booking_id, reference, status, ...)
    queryClient.invalidateQueries({ queryKey: ["booking-receipt", referenceNumber] });
  },
});
```

For full architecture, new events, channels, and senior dev practices, see the backend documentation:

**`be-marcelinos/documentation/realtime-websocket.md`**
