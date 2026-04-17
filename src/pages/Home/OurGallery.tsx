import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectCoverflow, Autoplay } from "swiper/modules";

// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/pagination";
// @ts-ignore
import "swiper/css/effect-coverflow";

import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { endpoints, queryKeys } from "@/lib/api/endpoints";
import GallerySkeleton from "@/components/skeleton/GallerySkeleton";

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
  } = useApiQuery<ApiResponse>(
    [...queryKeys.galleries.all],
    endpoints.galleries,
  );

  const galleries = galleriesResponse?.data ?? [];

  // Duplicate galleries ONLY if there are too few images to loop properly.
  // If there are plenty of images (say, more than 5), Swiper natively handles loop duplication.
  // This prevents unnecessary DOM bloat if the API returns 50+ images at once.
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

  const galleryHeading = (
    <div className="text-center mb-12">
      <div className="section-eyebrow justify-center">Our Gallery</div>
      <h2
        id="gallery-heading"
        className="font-display text-fluid-h2 font-light text-ink"
      >
        Capture the <em className="italic text-forest">Moments</em>
      </h2>
    </div>
  );

  if (isLoading) {
    return (
      <section className="w-full text-center" aria-labelledby="gallery-heading">
        {galleryHeading}
        <GallerySkeleton />
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full text-center" aria-labelledby="gallery-heading">
        {galleryHeading}
        <p className="text-base text-red-600 font-medium">
          Failed to load gallery.
        </p>
      </section>
    );
  }

  if (galleries.length === 0) {
    return (
      <section className="w-full text-center" aria-labelledby="gallery-heading">
        {galleryHeading}
        <p className="text-base text-center text-ink-soft opacity-80">
          No gallery available.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full text-center" aria-labelledby="gallery-heading">
      {galleryHeading}

      <Swiper
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={"auto"}
        modules={[EffectCoverflow, Pagination, Autoplay]}
        pagination={{ clickable: true }}
        loop={true}
        speed={800} // Slows down the transition to make it smooth and graceful
        autoplay={{
          delay: 3000, // Waits 3 seconds before auto-scrolling
          disableOnInteraction: false, // Allows auto-scroll to resume even after you interrupt it by swiping manually
        }}
        coverflowEffect={{
          rotate: 0,
          stretch: -20, // Adjusted for just a slight overlap on the sides
          depth: 120, // Keeps the side images clearly underneath without being too far back
          modifier: 1, // Standardizes the distance between cards uniformly
          slideShadows: true,
          scale: 0.9,
        }}
        className="w-full pt-10 pb-16"
        style={{
          margin: "0 auto",
        }}
      >
        {infiniteGalleries.map((item) => (
          <SwiperSlide
            key={item.uniqueId}
            className="flex items-center justify-center rounded-[1.5rem] overflow-hidden bg-white shadow-xl aspect-square border-2 sm:border-4 border-white/50 !w-[280px] !h-[280px] lg:!w-[360px] lg:!h-[360px] xl:!w-[400px] xl:!h-[400px] cursor-pointer"
          >
            <div className="w-full h-full group">
              <img
                src={item.image}
                alt={`Gallery ${item.id}`}
                loading="lazy"
                className="w-full h-full object-cover block transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default ImageCarousel;
