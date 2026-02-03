import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import CardItem from "@/components/cards/CardItem";
import CarouselSkeleton from "@/components/skeleton/RoomCarouselSkeleton";

interface ApiListResponse<T> {
  success?: boolean;
  data?: T[];
}

function extractList<T>(response: { data?: T[] } | T[] | undefined): T[] {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
}

function RoomCard() {
  const {
    data: roomsResponse,
    isLoading,
    error,
  } = useApiQuery<ApiListResponse<Record<string, unknown>>>(
    ["rooms", "home"],
    "/rooms?is_all=1",
  );

  const roomList = useMemo(() => extractList(roomsResponse), [roomsResponse]);

  if (error) {
    return (
      <section id="rooms" className="bg-gray-50 py-10">
        <h2 className="text-4xl font-bold text-center mb-10">
          <span className="text-green-900">OUR</span>{" "}
          <span className="text-yellow-500">ROOMS</span>
        </h2>
        <p className="text-red-500 text-center">Error loading rooms</p>
      </section>
    );
  }

  return (
    <section id="rooms" className="bg-gray-50 py-10">
      <h2 className="text-4xl font-bold text-center mb-10">
        <span className="text-green-900">OUR</span>{" "}
        <span className="text-yellow-500">ROOMS</span>
      </h2>

      {isLoading ? (
        <CarouselSkeleton />
      ) : roomList.length === 0 ? (
        <p className="text-center text-gray-500">No rooms available.</p>
      ) : (
        <Swiper
          spaceBetween={20}
          slidesPerView={3}
          pagination={{ clickable: true }}
          grabCursor={true}
          loop={roomList.length >= 2}
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
          {roomList.map((room: Record<string, unknown>) => (
            <SwiperSlide key={String(room.id)}>
              <CardItem
                id={room.id as number}
                type={room.type as string}
                name={room.name as string}
                capacity={room.capacity as number}
                price={room.price as number}
                amenities={room.amenities as unknown[]}
                featured_image={room.featured_image as string | null}
                gallery={room.gallery as string[]}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
}

export default RoomCard;
