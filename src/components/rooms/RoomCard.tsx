import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";

export interface RoomData {
  id: number;
  type: string;
  room_number: string;
  price: number;
  image: string;
  description: string;
  status: string;
  bed_count?: number;
  bed_type?: string;
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
          : "border-muted hover:border-primary/40",
      )}
    >
      <CardHeader>
        <CardTitle>{room.type}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <OptimizedImage
          src={room.image}
          alt={`${room.type} ${room.room_number}`}
          containerClassName="h-40 rounded-xl"
          className="rounded-xl"
        />
        <p className="text-sm text-muted-foreground">
          ₱{room.price.toLocaleString()}
        </p>
        {room.bed_count != null && room.bed_type ? (
          <p className="text-sm text-muted-foreground">
            🛏 {room.bed_count} {room.bed_type} bed
            {room.bed_count > 1 ? "s" : ""}
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {room.description}
        </p>
      </CardContent>
    </Card>
  );
}
