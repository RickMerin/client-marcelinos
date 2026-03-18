/**
 * Laravel Echo client singleton for WebSocket real-time updates.
 * Connects to Laravel Reverb using Pusher protocol.
 *
 * Usage: getEcho() then .private(channel).listen('.EventName', callback)
 * Or use hooks: useRealtimeChannel, useRealtimeEvent.
 */

import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo?: Echo<any>;
  }
}

window.Pusher = Pusher;

const env = import.meta.env.VITE_ENV;
const apiUrlDev = import.meta.env.VITE_API_URL_DEV;
const apiUrlProd = import.meta.env.VITE_API_URL_PROD;
const baseApiUrl = env === "production" ? apiUrlProd : apiUrlDev;

const wsHost = import.meta.env.VITE_WS_HOST;
const wsPort = import.meta.env.VITE_WS_PORT ?? "8080";
const wsKey = import.meta.env.VITE_WS_KEY ?? "local-key";
const wsScheme = import.meta.env.VITE_WS_SCHEME ?? "http";

/** Full WebSocket host for Echo (e.g. localhost:8080) */
const host = wsHost ?? (typeof baseApiUrl === "string" ? new URL(baseApiUrl).hostname : "localhost");
const port = wsPort;
const key = wsKey;
const useTls = wsScheme === "https";

/** Auth endpoint for private channels (API base + /broadcasting/auth) */
const authEndpoint = baseApiUrl && typeof baseApiUrl === "string"
  ? `${baseApiUrl.replace(/\/api\/?$/, "")}/broadcasting/auth`
  : `${wsScheme}://${host}:${port}/broadcasting/auth`;

/** Optional: provide token for private channel auth (default: localStorage "token") */
export type TokenGetter = () => string | null;

let echoInstance: Echo<any> | null = null;
let tokenGetter: TokenGetter = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

/**
 * Set a custom token getter (e.g. from auth context). Call before getEcho().
 */
export function setEchoTokenGetter(getter: TokenGetter): void {
  tokenGetter = getter;
}

/**
 * Get the Echo singleton. Creates it on first call.
 * Returns null if realtime is disabled (missing env) or in SSR.
 */
export function getEcho(): Echo<any> | null {
  if (typeof window === "undefined") return null;
  if (!key || !host) return null;

  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: "reverb",
      key,
      wsHost: host,
      wsPort: Number(port),
      wssPort: Number(port),
      forceTLS: useTls,
      enabledTransports: useTls ? ["wss", "ws"] : ["ws"],
      authEndpoint,
      auth: {
        headers: {
          Authorization: `Bearer ${tokenGetter() ?? ""}`,
          Accept: "application/json",
        },
      },
    });
  }

  return echoInstance;
}

/**
 * Disconnect and clear the Echo instance (e.g. on logout).
 */
export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
