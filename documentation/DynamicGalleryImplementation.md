# Dynamic Gallery Implementation

## Overview
This document explains how the "Our Gallery" section on the landing page was made dynamic by integrating it with the API endpoint `https://marcelinos-backend.test/api/galleries`. The implementation follows the existing API pattern used by the instructor for rooms, venues, and other resources.

## Purpose
Previously, the gallery displayed static images hardcoded in the component. To make it dynamic, we fetch images from the backend API, allowing the gallery to update automatically when new images are added to the database without changing the frontend code.

## API Response Structure
The API returns:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "image": "https://marcelinos.s3.amazonaws.com/1/01KH7ZDGPKD2XNM9QDSSAAPTS7.PNG?..."
    },
    {
      "id": 2,
      "image": "https://marcelinos.s3.amazonaws.com/2/01KH7ZJ4H9NKE75JW7YNDTRK1G.PNG?..."
    },
    {
      "id": 3,
      "image": "https://marcelinos.s3.amazonaws.com/3/01KH7ZJG120X5M137168QCP2K0.PNG?..."
    }
  ]
}
```

## Changes Made

### 1. Updated API Endpoints (`src/lib/api/endpoints.ts`)
Added the galleries endpoint and query key to centralize API configuration:

```typescript
export const endpoints = {
  // ... existing endpoints
  galleries: "/galleries",
} as const;

export const queryKeys = {
  // ... existing query keys
  galleries: {
    all: ["galleries"] as const,
  },
} as const;
```

**Why?** This keeps all API URLs and cache keys in one place, following the instructor's pattern for maintainability.

### 2. Modified Gallery Component (`src/pages/Home/OurGallery.tsx`)
Replaced static images with dynamic API fetching:

- **Imports**: Added `useApiQuery`, `endpoints`, and `queryKeys`.
- **Types**: Defined `GalleryItem` and `ApiResponse` interfaces.
- **Query**: Used `useApiQuery` to fetch data with proper loading/error handling.
- **Rendering**: Mapped API response to image sources, with fallback states for loading, error, and empty data.

Key code changes:
```typescript
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { endpoints, queryKeys } from "@/lib/api/endpoints";

interface GalleryItem {
  id: number;
  image: string;
}

interface ApiResponse {
  success: boolean;
  data: GalleryItem[];
}

const ImageCarousel: React.FC = () => {
  const {
    data: galleriesResponse,
    isLoading,
    error,
  } = useApiQuery<ApiResponse>([...queryKeys.galleries.all], endpoints.galleries);

  const images = galleriesResponse?.data?.map((item) => item.image) || [];

  // Loading and error states
  if (isLoading) return <p>Loading gallery...</p>;
  if (error) return <p>Failed to load gallery.</p>;

  if (images.length === 0) {
    return <p className="text-center text-gray-500">No gallery images available.</p>;
  }

  // Render images from API
  return (
    <Swiper>
      {images.map((src, index) => (
        <SwiperSlide key={index}>
          <img src={src} alt={`Gallery ${index + 1}`} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
```

**Why?** This uses the same `useApiQuery` hook as rooms/venues, ensuring consistency. The component now reacts to API data instead of static arrays.

## How It Works
1. **API Call**: On component mount, `useApiQuery` fetches from `/galleries` using the base URL from environment variables (e.g., `VITE_API_URL_DEV`).
2. **Caching**: TanStack Query caches the response, so repeated visits don't refetch unnecessarily.
3. **Error Handling**: Displays user-friendly messages for loading/errors.
4. **Dynamic Updates**: Images update automatically when the API data changes.

## Testing
- Build the project: `npm run build` (should pass without errors).
- Run dev server: `npm run dev` and check the gallery section loads images from the API.
- Verify in browser: Images should come from S3 URLs, not the old Pinterest links.

## Lessons Learned
- **Follow Existing Patterns**: Reuse `apiClient`, `endpoints`, `queryKeys`, and `useApiQuery` for consistency.
- **Type Safety**: Define interfaces for API responses to catch errors early.
- **User Experience**: Always handle loading and error states.
- **Separation of Concerns**: Keep API logic centralized, not scattered in components.

This implementation teaches how to integrate dynamic data into React components using modern tools like TanStack Query, following clean architecture principles.