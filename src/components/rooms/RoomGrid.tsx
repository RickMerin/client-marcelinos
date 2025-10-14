"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { RoomCard, RoomData } from "./RoomCard";

interface RoomsGridProps {
  rooms: RoomData[];
  selectedRooms: number[];
  onSelect: (selected: number[]) => void;
}

export function RoomsGrid({ rooms, selectedRooms, onSelect }: RoomsGridProps) {
  if (!rooms) return;

  const toggleRoom = (roomId: number) => {
    const isSelected = selectedRooms.includes(roomId);
    onSelect(
      isSelected
        ? selectedRooms.filter((id) => id !== roomId)
        : [...selectedRooms, roomId]
    );
  };

  return (
    <Swiper
      spaceBetween={20}
      slidesPerView={3}
      pagination={{ clickable: true }}
      grabCursor={true}
      speed={1000} // Smooth transition between slides
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
      {rooms.map((room, index) => (
        <SwiperSlide key={index}>
          <RoomCard
            key={room.id}
            room={room}
            isSelected={selectedRooms.includes(room.id)}
            onSelect={() => toggleRoom(room.id)}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
