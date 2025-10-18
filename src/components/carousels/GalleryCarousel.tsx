/** Reusable Nani HAHAHA **/

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

interface ImageCarouselProps {
  title?: React.ReactNode;
  images: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ title, images }) => {
  return (
    <section
      style={{
        padding: "60px 0",
        backgroundColor: "#fff",
        textAlign: "center",
        overflowX: "hidden", // ✅ prevents horizontal scrollbar
      }}
    >
      {title && (
        <h2
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            marginBottom: "40px",
            letterSpacing: "1px",
          }}
        >
          {title}
        </h2>
      )}

      <Swiper
        spaceBetween={20}
        slidesPerView={4}
        pagination={{ clickable: true }}
        grabCursor={true}
        loop={true} 
        speed={1000}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1440: { slidesPerView: 4 },
        }}
        modules={[Pagination, Autoplay]}
        style={{
          width: "90%",
          maxWidth: "1200px",
          margin: "0 auto",
          paddingBottom: "50px",
        }}
      >
        {images.map((src, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                width: "100%",
                height: "320px",
                overflow: "hidden",
                borderRadius: "15px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              }}
            >
              <img
                src={src}
                alt={`Gallery ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
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
