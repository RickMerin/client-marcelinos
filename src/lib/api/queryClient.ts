/**
 * libs/queryClient.ts
 * Singleton TanStack Query client instance with system-design best practices:
 * - Caching: sensible staleTime so identical requests are deduplicated and served from cache
 * - gcTime: how long inactive cache entries stay in memory
 * - Retry and refetch behavior tuned for API reliability
 */

import { QueryClient } from "@tanstack/react-query";

/** Default stale time: 2 min — data considered fresh, no refetch */
const DEFAULT_STALE_TIME_MS = 2 * 60 * 1000;
/** Default cache (gc) time: 10 min — unused data kept for background refetch */
const DEFAULT_GC_TIME_MS = 10 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: DEFAULT_STALE_TIME_MS,
      gcTime: DEFAULT_GC_TIME_MS,
    },
    mutations: {
      retry: 0,
    },
  },
});
