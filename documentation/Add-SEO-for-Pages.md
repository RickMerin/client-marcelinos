# Adding SEO for Other Pages

## Overview

The app uses a **`usePageSEO`** hook to set per-page document title and meta tags (description, Open Graph, Twitter, canonical). This keeps search results and social shares accurate for each route. The hook restores the previous meta when the user leaves the page.

## Hook location

- **`src/hooks/usePageSEO.ts`**

## Options

| Option       | Type   | Required | Description |
|-------------|--------|----------|-------------|
| `title`    | string | Yes      | Browser tab title and `og:title` / `twitter:title`. |
| `description` | string | Yes   | Meta description and `og:description` / `twitter:description`. |
| `path`     | string | Yes      | Page path (e.g. `"/create-booking"`). Used for canonical URL and `og:url` (built as `origin + path`). |
| `keywords` | string | No       | Comma-separated keywords for `<meta name="keywords">`. |
| `image`    | string | No       | Full URL for `og:image` and `twitter:image`. Defaults to `https://marcelinos.com/og-image.jpg`. |

## How to add SEO to a page

### 1. Import the hook

In the page component (or the route-level component that wraps the page):

```ts
import { usePageSEO } from "@/hooks/usePageSEO";
```

### 2. Define the SEO config

Define an object with `title`, `description`, `path`, and optionally `keywords` and `image`. You can put it outside the component so it’s not recreated every render:

```ts
const MY_PAGE_SEO = {
  title: "Page Title | Marcelino's Resort and Hotel | Hilongos, Leyte",
  description: "One or two sentences describing this page for search and social.",
  path: "/my-page",
  keywords: "optional, comma, separated, keywords",
  // image: "https://marcelinos.com/some-image.jpg",  // optional
};
```

### 3. Call the hook

Pass the config when the user is on that page; pass `null` when they are not (so the hook doesn’t override meta on other routes):

```tsx
export default function MyPage() {
  const location = useLocation();
  const isMyPage = location.pathname === "/my-page";

  usePageSEO(isMyPage ? MY_PAGE_SEO : null);

  return (
    // ...your page JSX
  );
}
```

For a component that is only ever mounted on one route, you can pass the config directly:

```tsx
export default function TestimonialPage() {
  usePageSEO({
    title: "Guest Reviews | Marcelino's Resort and Hotel",
    description: "Read what our guests say about their stay at Marcelino's.",
    path: "/testimonial",
  });
  return ( /* ... */ );
}
```

## Example: `/create-booking`

The booking page only sets SEO when the path is `/create-booking` (not on the receipt route):

**`src/pages/Booking/Index.tsx`**

```tsx
import { usePageSEO } from "@/hooks/usePageSEO";

const CREATE_BOOKING_SEO = {
  title: "Book Your Stay | Marcelino's Resort and Hotel | Hilongos, Leyte",
  description:
    "Reserve your room or event at Marcelino's Resort and Hotel. Choose dates, venue, and accommodations in Hilongos, Leyte, Philippines. Secure booking in a few steps.",
  path: "/create-booking",
  keywords:
    "book Marcelinos, reserve hotel Hilongos Leyte, Marcelinos booking, resort reservation Philippines, event venue booking",
};

export default function BookingIndex() {
  const location = useLocation();
  const isCreateBooking = location.pathname === "/create-booking";

  usePageSEO(isCreateBooking ? CREATE_BOOKING_SEO : null);

  // ...
}
```

## What gets updated

When `usePageSEO(options)` runs with a non-null config, it updates:

- **Document:** `document.title`
- **Meta tags:** `description`, `keywords` (if provided), `og:title`, `og:description`, `og:url`, `og:image`, `twitter:title`, `twitter:description`, `twitter:image`
- **Canonical:** `<link rel="canonical" href="{origin}{path}">`

On unmount or when the hook is called with `null`, the previous values are restored so other pages (e.g. the home page) keep their own SEO.

## Tips

- **Title:** Include the page topic and site name, e.g. `"Page Topic | Marcelino's Resort and Hotel | Hilongos, Leyte"`.
- **Description:** Keep it under ~155 characters; make it specific to the page.
- **Path:** Must match the route path exactly (e.g. `"/testimonial"`, `"/privacy-policy"`).
- **Home page:** The default SEO is in `index.html`; you can still call `usePageSEO` from the Home component if you want to override it from the app.

## Routes that may need SEO

- `/` — Home (default in `index.html`)
- `/create-booking` — Booking funnel (implemented)
- `/testimonial` — Guest reviews
- `/privacy-policy` — Privacy policy
- `/booking-receipt/:reference_number` — Receipt (optional; often `noindex`)

Add `usePageSEO` in the corresponding page component for each route you want to customize.
