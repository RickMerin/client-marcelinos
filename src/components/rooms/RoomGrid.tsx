"use client";

import { RoomCard, RoomData } from "./RoomCard";

interface RoomsGridProps {
  rooms: RoomData[];
  selectedRooms: number[];
  onSelect: (selected: number[]) => void;
}

export function RoomsGrid({ rooms, selectedRooms, onSelect }: RoomsGridProps) {
  if (!rooms) return;
  console.log(rooms);
  const toggleRoom = (roomId: number) => {
    const isSelected = selectedRooms.includes(roomId);
    onSelect(
      isSelected
        ? selectedRooms.filter((id) => id !== roomId)
        : [...selectedRooms, roomId]
    );
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          isSelected={selectedRooms.includes(room.id)}
          onSelect={() => toggleRoom(room.id)}
        />
      ))}
    </div>
  );
}
