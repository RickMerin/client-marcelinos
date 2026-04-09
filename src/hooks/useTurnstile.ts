import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

const RETRY_MS = 300;

export type UseTurnstileOptions = {
  /** Defaults to `import.meta.env.VITE_TURNSTILE_SITE_KEY` */
  siteKey?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  messages?: {
    expired?: string;
    error?: string;
  };
};

export type UseTurnstileResult = {
  /** Attach this ref to the element where Turnstile should mount */
  containerRef: RefObject<HTMLDivElement>;
  token: string | null;
  error: string;
  /** Same state as `error` — use for custom validation messages (e.g. missing token) */
  setError: Dispatch<SetStateAction<string>>;
  /** Clears token/error state and calls `turnstile.reset` for this widget */
  reset: () => void;
};

const defaultMessages = {
  expired: "Captcha expired. Please verify again.",
  error: "Captcha failed. Please try again.",
} as const;

/**
 * Renders a Cloudflare Turnstile widget in `containerRef` and exposes token state
 * plus `reset()` for after submit success/error. Requires the Turnstile script in `index.html`.
 */
export function useTurnstile(options: UseTurnstileOptions = {}): UseTurnstileResult {
  const {
    siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string,
    theme = "light",
    size = "normal",
    messages: messagesProp,
  } = options;

  const messages = { ...defaultMessages, ...messagesProp };

  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  const reset = useCallback(() => {
    setToken(null);
    setError("");
    if (window.turnstile && widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    let retryTimer: number | null = null;

    const scheduleRetry = (fn: () => void) => {
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
      }
      retryTimer = window.setTimeout(() => {
        retryTimer = null;
        fn();
      }, RETRY_MS);
    };

    const initTurnstile = () => {
      if (!isMountedRef.current) return;

      if (!containerRef.current) {
        scheduleRetry(initTurnstile);
        return;
      }

      if (!window.turnstile) {
        scheduleRetry(initTurnstile);
        return;
      }

      if (widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        size,
        callback: (t: string) => {
          if (!isMountedRef.current) return;
          setToken(t);
          setError("");
        },
        "expired-callback": () => {
          if (!isMountedRef.current) return;
          setToken(null);
          setError(messages.expired);
        },
        "error-callback": () => {
          if (!isMountedRef.current) return;
          setToken(null);
          setError(messages.error);
        },
      });
    };

    initTurnstile();

    return () => {
      isMountedRef.current = false;

      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
      }

      if (window.turnstile && widgetIdRef.current && window.turnstile.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }

      widgetIdRef.current = null;
    };
  }, [siteKey, theme, size, messages.expired, messages.error]);

  return {
    containerRef,
    token,
    error,
    setError,
    reset,
  };
}
