import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const ImageCarousel: React.FC = () => {
  const images = [
    "https://i.pinimg.com/736x/e8/31/d2/e831d24c1d60271b9da91249fffdba14.jpg",
    "https://i.pinimg.com/736x/70/11/dc/7011dcbe4d17d782eb0979ba9e087815.jpg",
    "https://i.pinimg.com/736x/e0/c8/26/e0c826f17ab711e5e05af94adb220cea.jpg",
    "https://i.pinimg.com/736x/6b/b7/2e/6bb72e3e7dc30fdf7ad1e68251fd88ad.jpg",
    "https://i.pinimg.com/736x/ad/6d/37/ad6d378103197c3bd9b12f91e14ea8a0.jpg",
    "https://i.pinimg.com/736x/be/94/4d/be944d48e93d753ac3b6bf942520176a.jpg",
    "https://i.pinimg.com/736x/ad/af/0c/adaf0cdf6b82351c763e5ad1aa9ee6b4.jpg",
    "https://i.pinimg.com/736x/20/b2/20/20b2205ae2c69c5b79bf688d738cbba8.jpg",
    "https://i.pinimg.com/736x/5b/75/56/5b7556037cea55f336003027db3e27e3.jpg",
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
        }}>
        <span className="green header">OUR</span>{" "}
        <span className="yellow header">GALLERY</span>
      </h2>

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
