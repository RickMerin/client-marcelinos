# 🧩 API Client Boilerplate (Axios + TanStack Query)

A modular, type-safe, and maintainable REST API layer built with **Axios** and **TanStack Query (v5)**.  
This setup provides a unified way to handle API calls, caching, mutations, and error management — without repeating logic across your app.

---

## 📚 Table of Contents

- [⚙️ Features](#️-features)
- [📂 Directory Structure](#-directory-structure)
- [🚀 Getting Started](#-getting-started)
  - [1. Install Dependencies](#1-install-dependencies)
  - [2. Configure Environment Variables](#2-configure-environment-variables)
  - [3. Setup Query Provider](#3-setup-query-provider)
- [🧠 Usage](#-usage)
  - [🔹 1. GET (Data Fetching)](#-1-get-data-fetching)
  - [🔹 2. POST (Create Resource)](#-2-post-create-resource)
  - [🔹 3. PUT (Update Resource)](#-3-put-update-resource)
  - [🔹 4. PATCH (Partial Update)](#-4-patch-partial-update)
  - [🔹 5. DELETE (Remove Resource)](#-5-delete-remove-resource)
- [🧩 API Methods (Direct Axios Usage)](#-api-methods-direct-axios-usage)
- [🔐 Authentication](#-authentication)
- [⚠️ Error Handling](#️-error-handling)
- [🧱 Advanced Usage](#-advanced-usage)
  - [✅ File Uploads](#-file-uploads)
  - [✅ Custom Query Config](#-custom-query-config)
  - [✅ Manual Refetch](#-manual-refetch)
- [🧪 Testing](#-testing)
- [🧠 Design Principles](#-design-principles)
- [🏁 Summary](#-summary)

---

## ⚙️ Features

✅ **Axios-based REST client** — handles all HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`)  
✅ **TanStack Query integration** — provides caching, revalidation, and mutation hooks  
✅ **Automatic token handling** via Axios interceptors  
✅ **Centralized error normalization**  
✅ **Full TypeScript support** for end-to-end type safety  
✅ **SOC + DRY + KISS** — clean separation of concerns and maintainable design

---

## 📂 Directory Structure

```
└── 📁lib
    └── 📁hooks
        ├── README.md
        ├── useApiMutation.ts
        ├── useApiQuery.ts
    ├── apiClient.ts
    ├── formatDate.ts
    ├── logger.ts
    ├── queryClient.ts
    └── utils.ts
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install axios @tanstack/react-query
# or
yarn add axios @tanstack/react-query
```

---

### 2. Configure Environment Variables

If you don't have a `.env` file, copy the example:

```bash
cp .env.example .env
```

Then edit your `.env` file:

```bash
VITE_ENV=development
VITE_API_URL_DEV=http://127.0.0.1:8000/api
VITE_API_URL_PROD=https://api.example.com/api
```

> `VITE_` prefix is required for Vite projects so environment variables are exposed to the client.

---

### 3. Setup Query Provider

```tsx
// main.tsx or App.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

---

## 🧠 Usage

### 🔹 1. GET (Data Fetching)

```tsx
import { useApiQuery } from "@/lib/hooks/useApiQuery";

function UserList() {
  const { data, isLoading, error } = useApiQuery(["users"], "/users");

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

---

### 🔹 2. POST (Create Resource)

```tsx
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { queryClient } from "@/lib/queryClient";

function AddUser() {
  const createUser = useApiMutation("post", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleSubmit = () => {
    createUser.mutate({
      url: "/users",
      body: { name: "Rick", email: "rick@example.com" },
    });
  };

  return (
    <button onClick={handleSubmit} disabled={createUser.isPending}>
      {createUser.isPending ? "Saving..." : "Add User"}
    </button>
  );
}
```

---

### 🔹 3. PUT (Update Resource)

```tsx
const updateUser = useApiMutation("put", {
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
});

updateUser.mutate({
  url: `/users/123`,
  body: { name: "Rick Updated" },
});
```

---

### 🔹 4. PATCH (Partial Update)

```tsx
const patchUser = useApiMutation("patch");

patchUser.mutate({
  url: `/users/123`,
  body: { status: "active" },
});
```

---

### 🔹 5. DELETE (Remove Resource)

```tsx
const deleteUser = useApiMutation("delete", {
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
});

deleteUser.mutate({ url: `/users/123` });
```

---

## 🧩 API Methods (Direct Axios Usage)

If you need to call the API outside React (e.g., utilities or services):

```tsx
import { API } from "@/lib/apiClient";

const users = await API.get<User[]>("/users");
const newUser = await API.post<User>("/users", { name: "Rick" });
```

| Method   | Function Signature        | Use Case                  |
| -------- | ------------------------- | ------------------------- |
| `get`    | `API.get<T>(url)`         | Fetch list or single item |
| `post`   | `API.post<T>(url, body)`  | Create resource           |
| `put`    | `API.put<T>(url, body)`   | Replace resource          |
| `patch`  | `API.patch<T>(url, body)` | Update partial data       |
| `delete` | `API.delete<T>(url)`      | Delete resource           |

---

## 🔐 Authentication

The Axios client automatically attaches your Bearer token (if present):

```ts
localStorage.setItem("token", "your-jwt-token");
```

> Injected automatically as:
>
> ```
> Authorization: Bearer <token>
> ```

---

## ⚠️ Error Handling

All errors are normalized via Axios interceptors.

```tsx
const { error } = useApiQuery(["users"], "/users");

if (error) console.error(error.message);
```

✅ Human-readable `.message`  
✅ Graceful network failure handling

---

## 🧱 Advanced Usage

### ✅ File Uploads

```tsx
const formData = new FormData();
formData.append("file", selectedFile);

await API.post("/upload", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
```

---

### ✅ Custom Query Config

```tsx
useApiQuery(["users"], "/users", {
  staleTime: 1000 * 60, // 1 min cache
  retry: 2,
  enabled: !!token,
});
```

---

### ✅ Manual Refetch

```tsx
const { refetch } = useApiQuery(["users"], "/users");

<button onClick={() => refetch()}>Reload</button>;
```

---

## 🧪 Testing

Example with Vitest:

```ts
import { describe, it, expect, vi } from "vitest";
import { API } from "@/lib/apiClient";
import axios from "axios";

vi.mock("axios");

describe("API Client", () => {
  it("calls GET correctly", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { message: "ok" } });
    const res = await API.get<{ message: string }>("/ping");
    expect(res.message).toBe("ok");
  });
});
```

---

## 🧠 Design Principles

| Rule                              | Application                                  |
| --------------------------------- | -------------------------------------------- |
| **SOC (Separation of Concerns)**  | Hooks, client, and query logic are isolated  |
| **DRY (Don’t Repeat Yourself)**   | All REST logic centralized in `apiClient.ts` |
| **KISS (Keep It Simple, Stupid)** | Minimal, declarative hook usage              |
| **TDD Ready**                     | Fully testable with mocked `axios`           |
| **YAGNI**                         | Avoids abstraction until justified           |

---

## 🏁 Summary

| Concern             | Implementation                    |
| ------------------- | --------------------------------- |
| REST Handling       | Centralized `apiClient.ts`        |
| Caching & Mutations | TanStack Query                    |
| Auth Tokens         | Axios interceptors                |
| Error Management    | Unified response normalization    |
| Type Safety         | Generics with Axios + TS          |
| Revalidation        | `queryClient.invalidateQueries()` |
