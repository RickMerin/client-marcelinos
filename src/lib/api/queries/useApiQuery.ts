/**
 * libs/hooks/useApiQuery.ts
 * Simple TanStack query wrapper for GET endpoints.
 */

import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { API } from "../apiClient";

/** Options that can be passed without queryKey/queryFn (supplied by the hook). */
type QueryOptionsOverrides<T> = Omit<
  UseQueryOptions<T, Error, T, readonly string[]>,
  "queryKey" | "queryFn"
>;

export function useApiQuery<TData>(
  key: string[],
  endpoint: string,
  options?: QueryOptionsOverrides<TData>,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: key,
    queryFn: () => API.get<TData>(endpoint),
    ...options,
  }) as UseQueryResult<TData, Error>;
}
