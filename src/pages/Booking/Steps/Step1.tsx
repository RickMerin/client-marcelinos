import React from "react";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { RoomCard } from "../RoomCard";

interface Props {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedRooms: (rooms: any[]) => void;
}

export function Step1({ formData, setSelectedRooms }: Props) {
  const { data, isLoading, error } = useApiQuery<Array<any>>(
    ["rooms"],
    "/rooms"
  );

  if (isLoading) return <p>Loading rooms…</p>;
  if (error) return <p>Error loading rooms</p>;

  const onSelectRoom = (room: any) => {
    const isAlreadySelected = formData.rooms.some(
      (selectedRoom: any) => selectedRoom.id === room.id
    );
    let updated: any[];

    if (isAlreadySelected) {
      // Deselect room
      updated = formData.rooms.filter(
        (selectedRoom: any) => selectedRoom.id !== room.id
      );
    } else {
      // Add new room
      updated = [...formData.rooms, room];
    }

    setSelectedRooms(updated);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-4">Rooms Available</h2>

      <div className="space-y-6">
        {Array.isArray(data) &&
          data.map((room) => (
            <RoomCard
              key={room.id}
              id={room.id}
              title={room.title}
              description={room.description}
              images={room.images}
              size={room.size}
              capacity={room.capacity}
              includes={room.includes}
              price={room.price}
              selected={formData.rooms.some(
                (selectedRoom: any) => selectedRoom.id === room.id
              )}
              onSelectRoom={() => onSelectRoom(room)}
            />
          ))}
      </div>
    </div>
  );
}
