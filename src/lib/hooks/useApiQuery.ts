/**
 * libs/hooks/useApiQuery.ts
 * Simple TanStack query wrapper for GET endpoints.
 */

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { API } from "../apiClient";

export function useApiQuery<T>(
  key: string[],
  endpoint: string,
  options?: UseQueryOptions<T>
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => API.get<T>(endpoint),
    ...options,
  });
}
