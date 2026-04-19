# Gallery Carousel Enhancements (Coverflow Effect)

This document explains the recent structural and aesthetic improvements made to the gallery carousel in `src/pages/Home/OurGallery.tsx`. The goal was to upgrade the standard horizontal image slider into a striking, continuous 3D "pyramid" top-view stack using Swiper's `EffectCoverflow`.

## Key Features

### 1. 3D Coverflow Overlap

We migrated from standard responsive slides or the `EffectCards` deck to a centralized `EffectCoverflow`. This styling ensures the **center image** acts as the primary hero focal point, while the adjacent images peek out slightly from behind.

**Implementation details:**

```typescript
coverflowEffect={{
  rotate: 0,        // Keeps images flat (no tilted angles)
  stretch: -20,     // Negative stretch pulls the adjacent inactive slides closer to the center, creating the overlap
  depth: 120,       // Pushes the side images backwards along the Z-axis
  modifier: 1,      // Standardizes the distance/scale multiplier uniformly
  slideShadows: true, // Enables a realistic shadow cast by the overlapping center image onto the side images
  scale: 0.9,       // Scales down the side images slightly so the center image pops more
}}
```

### 2. Smooth Autoplay & Infinite Looping

To make the gallery feel alive and continuous without forcing the user to swipe manually:

- **Intelligent Content Duplication (The "Never-ending" Loop):**
  If the API only returns a small handful of images (e.g., 3 images), Swiper struggles to perform a true infinite `loop={true}` without visual snapping. To fix this, we dynamically map over the gallery data multiple times _only if there are fewer than 6 images_. If there is a sufficient amount of data (6+ objects), we leave the main array alone, preventing over-bloating the DOM and allowing Swiper to handle loop duplication natively.

  ```typescript
  let infiniteGalleries = galleries.map((g) => ({
    ...g,
    uniqueId: `orig-${g.id}`,
  }));
  if (galleries.length > 0 && galleries.length < 6) {
    infiniteGalleries = [
      ...galleries.map((g) => ({ ...g, uniqueId: `a-${g.id}` })),
      ...galleries.map((g) => ({ ...g, uniqueId: `b-${g.id}` })),
      ...galleries.map((g) => ({ ...g, uniqueId: `c-${g.id}` })),
    ];
  }
  ```

- **Interruptible Autoplay:**
  The Swiper has a transition `speed={800}` ensuring that slides glide gracefully. The `Autoplay` module is configured to pause when you grab/swipe the carousel, but immediately kicks back in when you let go (`disableOnInteraction: false`).

### 3. Responsive "Photo Card" Styling

The cards are strictly enforced as perfect squares using `aspect-square`. Because `slidesPerView="auto"` can sometimes cause sizing discrepancies, we used `!important` tailwind width/height classes to lock the dimensions.

- **Mobile / Tablets:** `!w-[280px] !h-[280px]`
- **Large Laptops:** `lg:!w-[360px] lg:!h-[360px]`
- **Desktops / High-Res Monitors:** `xl:!w-[400px] xl:!h-[400px]`

To complete the physical stacked look, each slide is styled with `rounded-[1.5rem]`, a subtle backdrop shadow (`shadow-xl`), and a distinct frosted border (`border-2 sm:border-4 border-white/50`).
