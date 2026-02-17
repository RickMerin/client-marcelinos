import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./assets/styles/fonts.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/api/queryClient.ts";

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

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
