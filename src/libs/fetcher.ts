/**
 * libs/fetcher.ts
 * Generic fetch wrapper for REST endpoints.
 * Keeps API handling consistent across the app.
 */

export interface FetcherOptions extends RequestInit {
  baseUrl?: string;
  auth?: boolean;
}

export const fetcher = async <T,>(
  endpoint: string,
  options: FetcherOptions = {}
): Promise<T> => {
  const baseUrl = options.baseUrl || import.meta.env.VITE_API_URL;
  const url = `${baseUrl}${endpoint}`;

  const headers = new Headers({
    "Content-Type": "application/json",
    ...(options.headers || {}),
  });

  // Optionally include auth token
  if (options.auth) {
    const token = localStorage.getItem("token");
    if (token) headers.append("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error (${response.status}): ${error}`);
  }

  return response.json() as Promise<T>;
};
