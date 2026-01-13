/**
 * libs/hooks/useApiMutation.ts
 * Mutation wrapper for POST, PUT, PATCH, DELETE requests.
 */

import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { API } from "../apiClient";

type HttpMethod = "post" | "put" | "patch" | "delete";

interface MutationArgs {
  url: string;
  body?: unknown;
}

type ApiMethod = (url: string, body?: unknown) => Promise<unknown>;

export function useApiMutation<T>(
  method: HttpMethod,
  options?: UseMutationOptions<T, Error, MutationArgs>
) {
  const apiMethod = API[method] as ApiMethod;

  return useMutation<T, Error, MutationArgs>({
    mutationFn: ({ url, body }) => apiMethod(url, body) as Promise<T>,
    ...options,
  });
}
