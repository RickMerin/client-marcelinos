# Frontend API Key Integration Documentation

## Overview
To synchronize the frontend with the newly secured backend, we have implemented an `x-api-key` mechanism for all outgoing API requests. This ensures that the frontend can successfully authenticate and communicate with the backend.

## Details of Changes Made

### 1. Environment Variables Configuration
We added the new `VITE_API_KEY` to the environment configuration files to store and reference the API key locally.
- Added `VITE_API_KEY=xLTwnw4fD74RAQqsYofVylaZiboufrA6` to the [.env](file:///c:/Users/kingv/OneDrive/Desktop/Marcelinos/client-marcelinos/.env) file.
- Added `VITE_API_KEY=your_api_key_here` to the [.env.example](file:///c:/Users/kingv/OneDrive/Desktop/Marcelinos/client-marcelinos/.env.example) file so other developers know to set this key in their own environments.

### 2. TypeScript Environment Definitions
We updated the [src/vite-env.d.ts](file:///c:/Users/kingv/OneDrive/Desktop/Marcelinos/client-marcelinos/src/vite-env.d.ts) file to properly type the new environment variable.
- Added `readonly VITE_API_KEY: string;` to the [ImportMetaEnv](file:///c:/Users/kingv/OneDrive/Desktop/Marcelinos/client-marcelinos/src/vite-env.d.ts#3-15) interface. This provides TypeScript autocomplete and prevents type errors when accessing `import.meta.env.VITE_API_KEY`.

### 3. Axios Client Configuration
We modified the centralized API client ([src/lib/api/apiClient.ts](file:///c:/Users/kingv/OneDrive/Desktop/Marcelinos/client-marcelinos/src/lib/api/apiClient.ts)) to automatically attach the `x-api-key` header to every outgoing request.
- Retrieved the API key from the environment variables using `import.meta.env.VITE_API_KEY`.
- Appended `"x-api-key": apiKey` to the generic `headers` of the Axios instance.

## Result
Now, every HTTP request made through the centralized Axios client (`API.get`, `API.post`, etc.) will reliably include the proper `x-api-key` header, fulfilling the backend's security constraints seamlessly.
