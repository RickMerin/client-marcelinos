import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
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

  const galleryHeading = (
    <h2 className="font-display text-3xl font-bold tracking-tight text-center mb-10">
      <span className="green">OUR</span>{" "}
      <span className="yellow">GALLERY</span>
    </h2>
  );

  if (isLoading) {
    return (
      <section id="gallery" className="py-16 bg-white text-center">
        {galleryHeading}
        <p className="text-sm opacity-80">Loading gallery...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section id="gallery" className="py-16 bg-white text-center">
        {galleryHeading}
        <p className="text-sm text-red-500">Failed to load gallery.</p>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section id="gallery" className="py-16 bg-white text-center">
        {galleryHeading}
        <p className="text-sm text-center text-gray-500 opacity-80">No gallery available.</p>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-16 bg-white text-center">
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
        {images.map((src, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                width: "100%",
                height: "350px",
                overflow: "hidden",
                borderRadius: "15px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              }}>
              <img
                src={src}
                alt={`Gallery ${index + 1}`}
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
