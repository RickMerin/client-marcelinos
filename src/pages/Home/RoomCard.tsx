import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import CardItem from "@/components/cards/CardItem";
import CarouselSkeleton from "@/components/skeleton/RoomCarouselSkeleton";

function RoomCard() {
  const { data, isLoading, error } = useApiQuery(["rooms"], "/rooms");

  if (error) {
    return (
      <section className="bg-gray-50 py-10">
        <h1 className="text-4xl font-bold text-center mb-10">
          <span className="text-green-900">OUR</span>{" "}
          <span className="text-yellow-500">ROOMS</span>
        </h1>
        <p className="text-red-500 text-center">Error loading rooms</p>
      </section>
    );
  }

  return (
    <section id="rooms" className="bg-gray-50 py-10">
      <h1 className="text-4xl font-bold text-center mb-10">
        <span className="text-green-900">OUR</span>{" "}
        <span className="text-yellow-500">ROOMS</span>
      </h1>

      {isLoading ? (
        <CarouselSkeleton />
      ) : (
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
          {Array.isArray(data) &&
            data.map((room) => (
              <SwiperSlide key={room.id}>
                <CardItem {...room} />
              </SwiperSlide>
            ))}
        </Swiper>
      )}
    </section>
  );
}

export default RoomCard;
