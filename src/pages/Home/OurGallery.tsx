import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
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
  } = useApiQuery<ApiResponse>([...queryKeys.galleries.all], endpoints.galleries);

  const galleries = galleriesResponse?.data ?? [];

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
        spaceBetween={8}
        slidesPerView={3}
        pagination={{ clickable: true }}
        loop={false}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        modules={[Pagination]}
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          paddingBottom: "50px",
        }}
      >
        {galleries.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="w-full h-[350px] overflow-hidden rounded-[4px] group">
              <img
                src={item.image}
                alt={`Gallery ${item.id}`}
                loading="lazy"
                className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default ImageCarousel;
