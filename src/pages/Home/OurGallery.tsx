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
    <h2
      id="gallery-heading"
      className="font-display text-3xl font-bold tracking-tight text-center mb-10 text-(--color-charcoal)">
      <span className="green">OUR</span> <span className="yellow">GALLERY</span>
    </h2>
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
        <p className="text-sm text-red-600 font-medium">
          Failed to load gallery.
        </p>
      </section>
    );
  }

  if (galleries.length === 0) {
    return (
      <section className="w-full text-center" aria-labelledby="gallery-heading">
        {galleryHeading}
        <p className="text-sm text-center text-(--color-charcoal) opacity-80">
          No gallery available.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full text-center" aria-labelledby="gallery-heading">
      {galleryHeading}

      <Swiper
        spaceBetween={20}
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
          width: "90%",
          maxWidth: "1200px",
          margin: "0 auto",
          paddingBottom: "50px",
        }}>
        {galleries.map((item) => (
          <SwiperSlide key={item.id}>
            <div
              style={{
                width: "100%",
                height: "350px",
                overflow: "hidden",
                borderRadius: "15px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              }}>
              <img
                src={item.image}
                alt={`Gallery ${item.id}`}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default ImageCarousel;
