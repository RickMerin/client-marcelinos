import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./assets/styles/fonts.css";
import "react-toastify/dist/ReactToastify.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/api/queryClient.ts";
import { reportClientError } from "./lib/monitoring/reportClientError";

// Only allow search engine indexing on production/root domain; noindex on testing/staging
const productionHosts = (import.meta.env.VITE_PRODUCTION_HOST ?? "")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);
const currentHost = typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
const allowIndexing = productionHosts.length > 0 && productionHosts.includes(currentHost);
if (typeof document !== "undefined") {
  const robotsMeta = document.querySelector('meta[name="robots"]');
  if (robotsMeta) {
    robotsMeta.setAttribute("content", allowIndexing ? "index, follow" : "noindex, nofollow");
  }
}

if (typeof window !== "undefined") {
	window.addEventListener("error", (event) => {
		const err = event.error;
		const message =
			err instanceof Error
				? err.message
				: typeof event.message === "string"
					? event.message
					: "window error";
		const stack =
			err instanceof Error
				? err.stack
				: event.filename
					? `${event.filename}:${event.lineno}:${event.colno}`
					: undefined;
		reportClientError({
			message,
			stack,
			source: "window.onerror",
		});
	});

	window.addEventListener("unhandledrejection", (event) => {
		const reason = event.reason;
		const message =
			reason instanceof Error
				? reason.message
				: typeof reason === "string"
					? reason
					: "Unhandled promise rejection";
		const stack = reason instanceof Error ? reason.stack : undefined;
		reportClientError({
			message,
			stack,
			source: "unhandledrejection",
		});
	});
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
