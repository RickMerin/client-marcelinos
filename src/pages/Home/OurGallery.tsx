import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

const ImageCarousel: React.FC = () => {
  const images: string[] = [
    "/CarouselImages/slide1.webp",
    "/CarouselImages/slide2.webp",
    "/CarouselImages/slide3.webp",
    "/CarouselImages/slide4.webp",
  ];

  return (
    <section
      id="gallery"
      style={{
        padding: "60px 0",
        backgroundColor: "#fff",
        textAlign: "center",
      }}>
      <h2
        style={{
          fontSize: "2.5rem",
          fontWeight: 800,
          marginBottom: "40px",
          letterSpacing: "1px",
          transition: "opacity 0.8s ease, transform 0.8s ease",
          opacity: 1,
          transform: "translateY(0)",
        }}>
        <span className="green header">OUR</span>{" "}
        <span className="yellow header">GALLERY</span>
      </h2>

      <Swiper
        spaceBetween={20}
        slidesPerView={3}
        pagination={{ clickable: true }}
        grabCursor={true}
        loop={true}
        speed={1000} // Smooth transition between slides
        autoplay={{
          delay: 3000, // Slides every 3 seconds
          disableOnInteraction: false,
        }}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        modules={[Pagination, Autoplay]}
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
                transition: "transform 0.5s ease, box-shadow 0.5s ease",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(0, 0, 0, 0.3)";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 4px 10px rgba(0, 0, 0, 0.2)";
              }}>
              <img
                src={src}
                alt={`Gallery ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 1s ease-in-out",
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
