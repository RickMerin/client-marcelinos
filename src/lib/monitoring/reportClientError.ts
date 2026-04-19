/**
 * Sends anonymized error context to the API for Slack when enabled server-side.
 * Enabled when Vite build is production, or when VITE_ERROR_REPORTING=true (e.g. local testing).
 */

const env = import.meta.env.VITE_ENV;
const apiUrlDev = import.meta.env.VITE_API_URL_DEV as string | undefined;
const apiUrlProd = import.meta.env.VITE_API_URL_PROD as string | undefined;
const isLocalHost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname.toLowerCase());

const baseURL =
  env === "production" && !isLocalHost ? apiUrlProd : apiUrlDev;

const reportingEnabled =
  import.meta.env.VITE_ERROR_REPORTING === "true" || import.meta.env.PROD;

let lastFingerprint = "";
let lastSentAt = 0;
const clientDedupeMs = 5000;

function fingerprint(message: string, pageUrl: string): string {
  return `${message.slice(0, 200)}|${pageUrl}`;
}

export type ClientErrorPayload = {
  message: string;
  stack?: string;
  source: string;
  page_url?: string;
  component_stack?: string;
};

export function reportClientError(payload: ClientErrorPayload): void {
  if (!reportingEnabled || !baseURL) {
    return;
  }

  const pageUrl =
    payload.page_url ??
    (typeof window !== "undefined" ? window.location.href : undefined);

  const fp = fingerprint(payload.message, pageUrl ?? "");
  const now = Date.now();
  if (fp === lastFingerprint && now - lastSentAt < clientDedupeMs) {
    return;
  }
  lastFingerprint = fp;
  lastSentAt = now;

  const url = `${baseURL.replace(/\/$/, "")}/client-errors`;
  const body = JSON.stringify({
    message: payload.message,
    stack: payload.stack,
    source: payload.source,
    page_url: pageUrl,
    component_stack: payload.component_stack,
  });

  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const ok = navigator.sendBeacon(url, blob);
      if (ok) {
        return;
      }
    }
  } catch {
    // fall through to fetch
  }

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    /* ignore — monitoring must not throw */
  });
}
