/**
 * libs/apiClient.ts
 * Axios-based REST API client with token and base URL support.
 * Keeps API requests consistent across the app.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const env = import.meta.env.VITE_ENV;
const apiUrlDev = import.meta.env.VITE_API_URL_DEV;
const apiUrlProd = import.meta.env.VITE_API_URL_PROD;

const baseURL = env === "production" ? apiUrlProd : apiUrlDev; // Dynamic base URL based on environment

const apiKey = import.meta.env.VITE_API_KEY;

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    ...(apiKey ? { "x-api-key": apiKey } : {}),
  },
});

// Interceptor: Automatically attach token if exists
// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Response Interceptor: Error normalization (preserve response for conflict details etc.)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Unknown API error occurred";
    const err = new Error(message) as Error & { response?: typeof error.response };
    err.response = error.response;
    return Promise.reject(err);
  }
);

// Generic REST methods
export const API = {
  /**** Get Method ****/
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const { data } = await apiClient.get<T>(url, config);
    return data;
  },

  /**** Post Method ****/
  post: async <T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const { data } = await apiClient.post<T>(url, body, config);
    return data;
  },

  /**** Put Method ****/
  put: async <T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const { data } = await apiClient.put<T>(url, body, config);
    return data;
  },

  /**** Patch Method ****/
  patch: async <T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const { data } = await apiClient.patch<T>(url, body, config);
    return data;
  },

  /**** Delete Method ****/
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const { data } = await apiClient.delete<T>(url, config);
    return data;
  },
};

export default apiClient;
