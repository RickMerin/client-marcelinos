import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface RoomData {
  id: number;
  type: string;
  room_number: string;
  price: number;
  image: string;
  description: string;
  status: string;
}

interface RoomCardProps {
  room: RoomData;
  isSelected: boolean;
  onSelect: () => void;
}

export function RoomCard({ room, isSelected, onSelect }: RoomCardProps) {
  return (
    <Card
      onClick={onSelect}
      className={cn(
        "cursor-pointer transition-all border-2 rounded-2xl overflow-hidden",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-muted hover:border-primary/40"
      )}>
      <CardHeader>
        <CardTitle>{room.type}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <img
          src={room.image}
          alt={room.type + " " + room.room_number}
          loading="lazy"
          className="w-full h-40 object-cover rounded-xl"
        />
        <p className="text-sm text-muted-foreground">
          ₱{room.price.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
