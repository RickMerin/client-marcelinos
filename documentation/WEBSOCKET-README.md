# WebSocket Setup & Process Guide

This README explains how real-time updates work in Marcelinos (Pusher + Laravel Echo), the process flow from start to finish, and how to add a new WebSocket event.

---

## Table of Contents

1. [Who Uses What](#1-who-uses-what)
2. [Process Flow (Start to Finish)](#2-process-flow-start-to-finish)
3. [Setup From Start to Finish](#3-setup-from-start-to-finish)
4. [How to Add a New WebSocket Entry](#4-how-to-add-a-new-websocket-entry)
5. [Quick Reference](#5-quick-reference)

---

## 1. Who Uses What

| Consumer | Mechanism | Purpose |
|----------|-----------|---------|
| **React frontend** (public site) | **WebSocket** (Pusher + Echo) | Live updates when data changes (rooms, venues, booking status, etc.) so users see changes without refreshing. |
| **Filament admin** | **Polling** (e.g. table every 10s) | Keeps admin tables/data fresh. Filament does **not** use the WebSocket. |

So: **WebSocket is for the React app only.** When you change something in Filament (or via the API), the backend broadcasts an event; the React client receives it over the WebSocket and refetches data so the public site stays in sync.

---

## 2. Process Flow (Start to Finish)

```
┌──────────────────┐                    ┌──────────────────┐                    ┌──────────────────┐
│  Admin / API     │   dispatch event   │  Queue worker    │   push to Pusher  │  Pusher service │
│  (Filament, etc.)│ ─────────────────► │  (queue:work)    │ ─────────────────► │  (WS server)     │
└──────────────────┘                    └──────────────────┘                    └────────┬─────────┘
         │                                                                               │
         │  Event queued (e.g. RoomsUpdated)                                             │  Pusher protocol
         ▼                                                                               ▼
┌──────────────────┐                    ┌──────────────────┐                    ┌──────────────────┐
│  Laravel (queue)  │                    │  React client    │ ◄───────────────────│  Browser tab     │
│  Jobs table      │                    │  (Laravel Echo)  │    WebSocket        │  (subscribed to  │
└──────────────────┘                    └────────┬─────────┘                    │   channel)       │
                                                 │                               └──────────────────┘
                                                 │  invalidateQueries + refetch
                                                 ▼
                                        ┌──────────────────┐
                                        │  TanStack Query   │  → UI updates without reload
                                        │  (React)         │
                                        └──────────────────┘
```

**Step by step:**

1. **Something changes** — e.g. admin updates a room in Filament, or booking status changes via Observer.
2. **Backend dispatches a broadcast event** — e.g. `RoomsUpdated::dispatch()`. The event is **queued** (not sent immediately).
3. **Queue worker** runs `php artisan queue:work`, picks up the job, and sends the event to **Pusher**.
4. **Pusher** (WebSocket server) pushes the event to every browser tab that is subscribed to that channel (e.g. `rooms`).
5. **React** — Laravel Echo receives the event. Your hooks (e.g. `useRealtimeGlobalSubscriber`) run `queryClient.invalidateQueries()` and `refetchQueries()` for the matching query key.
6. **UI** — Any component that uses a query with that key refetches and re-renders, so the user sees the new data without reloading.

**Important:** If the **queue worker** is not running, events never leave the queue and the React app will not get updates until the user refreshes.

---

## 3. Setup From Start to Finish

### 3.1 Backend (be-marcelinos)

**1. Environment (`.env`)**

- Set **`BROADCAST_CONNECTION=pusher`**. If this is `log` or missing, events are only logged and never reach the client.
- Configure Pusher (example for local dev / self-hosted-compatible websockets):

```env
PUSHER_APP_ID=marcelinos-app
PUSHER_APP_KEY=local-key
PUSHER_APP_SECRET=local-secret
PUSHER_APP_CLUSTER=ap1
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
```

**2. Run the required processes**

| Process | Command | Purpose |
|--------|---------|---------|
| **Pusher** | (managed/self-hosted) | WebSocket server; delivers events to the browser |
| **Queue worker** | `php artisan queue:work` | Processes the queue; sends broadcast events to Pusher |

- **Windows:** Run each in a separate terminal (or use WSL and the script below).
- **Linux / cPanel:** One command starts everything:

```bash
cd be-marcelinos
php artisan services:start
# or
./start-services.sh
```

Stop with: `php artisan services:stop` or `./stop-services.sh`.

See **`be-marcelinos/documentation/deployment-services.md`** for cPanel and scheduler details.

### 3.2 Frontend (client-marcelinos)

**1. Environment (`.env`) — optional**

Defaults are derived from the API URL and `local-key`. Override if needed:

```env
VITE_WS_HOST=localhost
VITE_WS_PORT=8080
VITE_WS_KEY=local-key
VITE_WS_SCHEME=http
```

**2. Echo and hooks**

- **`src/lib/realtime/echo.ts`** — Creates the Echo client (Pusher protocol) and connects to your Pusher-compatible websocket endpoint. `getEcho()` returns `null` if env is missing (realtime disabled).
- **Private channels:** Echo sends the request to `/broadcasting/auth` with the token (default: `localStorage.getItem('token')`). You can set a custom token getter with `setEchoTokenGetter()`. After login, call `disconnectEcho()` so the next subscription uses the new token.
- **`useRealtimeEvent`** — Subscribe to one channel and one event (e.g. booking receipt page).
- **`useRealtimeGlobalSubscriber`** — Mounted in `App.tsx`; subscribes to public channels (rooms, venues, gallery, reviews, blocked-dates) and invalidates/refetches the matching query keys so the whole app stays in sync without reload.

### 3.3 Checklist: “Is WebSocket working?”

- [ ] `BROADCAST_CONNECTION=pusher` in `be-marcelinos/.env`
- [ ] Queue worker running: `php artisan queue:work`
- [ ] Frontend has WS env (or defaults) so `getEcho()` is not null
- [ ] No CORS/auth issues: `/broadcasting/auth` is reachable from the frontend

---

## 4. How to Add a New WebSocket Entry

Use this when you want a **new resource or event** to be broadcast so the React app can react (e.g. refetch data) without a page reload.

### 4.1 Backend

**Step 1: Channel name**

- In **`be-marcelinos/app/Broadcasting/BroadcastChannelNames.php`**, add a method that returns the channel string (e.g. public channel `promos`):

```php
public static function promos(): string
{
    return 'promos';
}
```

**Step 2: Event class**

- In **`be-marcelinos/app/Events/`**, create a class that extends `App\Events\BaseBroadcastEvent`:

```php
<?php

namespace App\Events;

use App\Broadcasting\BroadcastChannelNames;
use Illuminate\Broadcasting\Channel;

final class PromosUpdated extends BaseBroadcastEvent
{
    public function broadcastOn(): array
    {
        return [new Channel(BroadcastChannelNames::promos())];
    }

    public function broadcastWith(): array
    {
        return ['updated_at' => now()->toIso8601String()];
    }
}
```

- Use **`Channel`** for public channels, **`PrivateChannel`** for private (and then authorize in `routes/channels.php`).
- The **event name** the client listens for is the class short name (e.g. `PromosUpdated` → listen for `.PromosUpdated`).

**Step 3: Dispatch the event**

- When the resource changes:
  - **Model changes:** Create an Observer (e.g. `app/Observers/PromoObserver.php`) and in `saved()` / `deleted()` call `PromosUpdated::dispatch()`. Register in `AppServiceProvider`: `Promo::observe(PromoObserver::class)`.
  - **One-off:** Dispatch from a controller or Filament action after create/update/delete.

**Step 4: Private channel (only if you used `PrivateChannel`)**

- In **`be-marcelinos/routes/channels.php`**, add authorization (channel name **without** `private-` prefix):

```php
Broadcast::channel('admin.promos', function ($user) {
    return in_array($user->role ?? null, ['admin', 'staff'], true);
});
```

### 4.2 Frontend

**Step 1: Channel name**

- In **`client-marcelinos/src/lib/realtime/channels.ts`**, add the same channel name:

```ts
promos: () => "promos",
```

**Step 2: Query keys (for global refetch)**

- In **`client-marcelinos/src/lib/api/endpoints.ts`**, add a query key factory with an `all` key:

```ts
promos: {
  all: ["promos"] as const,
  list: () => ["promos", "list"] as const,
  // ...
},
```

- Use these keys in any `useQuery` / `useApiQuery` that fetches promos (e.g. `["promos"]`, `["promos", "home"]`) so they share the same prefix for invalidation.

**Step 3: Subscribe and refetch (global sync)**

- In **`client-marcelinos/src/hooks/useRealtimeGlobalSubscriber.ts`**, add an entry to the `channels` array:

```ts
{ channel: RealtimeChannels.promos(), event: ".PromosUpdated", queryKey: queryKeys.promos.all },
```

- Event name must match the backend class short name (with a leading dot).

**Step 4: (Optional) Event payload types**

- If the payload is more than the generic `ResourceUpdatedPayload`, extend **`client-marcelinos/src/types/realtime.types.ts`**:

```ts
export interface PromosUpdatedPayload {
  updated_at: string;
  // ...
}

export interface RealtimeEventMap {
  // ... existing
  PromosUpdated: PromosUpdatedPayload;
}
```

### 4.3 Single-page or one-off event (no global subscriber)

If the new event is only needed on one page (e.g. a single booking receipt):

- Backend: define channel + event and dispatch as above.
- Frontend: use **`useRealtimeEvent`** in that component instead of the global subscriber:

```tsx
useRealtimeEvent({
  channel: RealtimeChannels.booking(referenceNumber),
  event: "BookingStatusUpdated",
  enabled: !!referenceNumber,
  isPrivate: false, // for public channel
  onEvent: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings.byReference(referenceNumber) });
  },
});
```

### 4.4 Summary checklist (new entry)

| # | Backend | Frontend |
|---|---------|----------|
| 1 | Add channel in `BroadcastChannelNames.php` | Add same channel in `channels.ts` |
| 2 | Create event class in `app/Events/` extending `BaseBroadcastEvent` | — |
| 3 | Implement `broadcastOn()` and `broadcastWith()` | — |
| 4 | Dispatch event (Observer / controller / Filament) | — |
| 5 | If private: authorize in `routes/channels.php` | — |
| 6 | — | Add `queryKeys.*.all` in `endpoints.ts`; use in queries |
| 7 | — | Add channel + event + queryKey in `useRealtimeGlobalSubscriber` (or use `useRealtimeEvent` on one page) |
| 8 | — | Optionally add payload type in `realtime.types.ts` |

---

## 5. Quick Reference

| What | Where |
|------|--------|
| Backend channel names | `be-marcelinos/app/Broadcasting/BroadcastChannelNames.php` |
| Backend events | `be-marcelinos/app/Events/` (extend `BaseBroadcastEvent`) |
| Channel authorization | `be-marcelinos/routes/channels.php` |
| Frontend channel names | `client-marcelinos/src/lib/realtime/channels.ts` |
| Echo client | `client-marcelinos/src/lib/realtime/echo.ts` |
| Event payload types | `client-marcelinos/src/types/realtime.types.ts` |
| Global subscriber | `client-marcelinos/src/hooks/useRealtimeGlobalSubscriber.ts` |
| Single-event hook | `client-marcelinos/src/hooks/useRealtimeEvent.ts` |
| Full technical doc | `be-marcelinos/documentation/realtime-websocket.md` |
| Services start/stop | `be-marcelinos/documentation/deployment-services.md` |

**Troubleshooting:** If the React app does not update without reload, verify: `BROADCAST_CONNECTION=pusher`, the queue worker is running, and frontend has `VITE_WS_KEY` / `VITE_WS_HOST` (or defaults) so `getEcho()` is not null.
