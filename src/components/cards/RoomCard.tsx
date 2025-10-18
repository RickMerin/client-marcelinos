import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

import CardItem from "./CardItem";

function RoomCard() {
  const rooms = [
    { id: 1, title: "Exclusive Room", image: "src/assets/img/room1.jpg" },
    { id: 2, title: "Deluxe Room", image: "src/assets/img/room2.jpg" },
    { id: 3, title: "Family Suite", image: "src/assets/img/room3.jpg" },
    { id: 4, title: "Luxury Room", image: "src/assets/img/room4.jpg" },
  ];

  return (
    <section className="min-h-screen bg-gray-50 py-10">
      <h1 className="text-4xl font-bold text-center mb-10">
        <span className="text-green-900">OUR</span>{" "}
        <span className="text-yellow-500">ROOMS</span>
      </h1>

      <Swiper
        spaceBetween={20}
        slidesPerView={3}
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
        }}
        modules={[Pagination, Autoplay]}
        style={{
          width: "90%",
          maxWidth: "1200px",
          margin: "0 auto",
          paddingBottom: "50px",
        }}>
        {rooms.map((room) => (
          <SwiperSlide key={room.id}>
            <CardItem image={room.image} title={room.title} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default RoomCard;
