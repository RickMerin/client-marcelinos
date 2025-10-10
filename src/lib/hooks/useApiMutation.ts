/**
 * libs/hooks/useApiMutation.ts
 * Mutation wrapper for POST, PUT, PATCH, DELETE requests.
 */

import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { API } from "../apiClient";

type Method = "post" | "put" | "patch" | "delete";

interface MutationArgs {
  url: string;
  body?: unknown;
}

export function useApiMutation<T>(
  method: Method,
  options?: UseMutationOptions<T, Error, MutationArgs>
) {
  return useMutation<T, Error, MutationArgs>({
    mutationFn: ({ url, body }) => (API as any)[method](url, body),
    ...options,
  });
}
