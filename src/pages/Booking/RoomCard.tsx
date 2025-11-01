import React from "react";
import { BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingFormat } from "@/lib/pricingFormat";

interface RoomCardProps {
  id: number;
  title: string;
  description: string;
  images?: string[];
  size: string;
  capacity: string;
  includes: string;
  price: string | number;
  selected?: boolean;
  onSelectRoom: (id: number) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  id,
  title,
  description,
  images = [],
  size,
  capacity,
  includes,
  price,
  selected = false,
  onSelectRoom,
}) => {
  return (
    <section className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="col-span-1">
          <div className="rounded-md overflow-hidden h-40 bg-gray-100">
            <img
              src={images[0] ?? "/placeholder-room.jpg"}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {images.slice(0, 4).map((img, i) => (
              <img
                key={i}
                src={img}
                className="w-16 h-12 object-cover rounded-sm border"
                alt={`${title}-thumb-${i}`}
              />
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            {description}
          </p>

          <ul className="text-sm text-gray-700 space-y-1 mb-4">
            <li>
              <strong>Size:</strong> {size}
            </li>
            <li>
              <strong>Capacity:</strong> {capacity}
            </li>
            <li>
              <strong>Includes:</strong> {includes}
            </li>
          </ul>

          <div className="flex items-center justify-between">
            <p className="text-lg">
              Price:{" "}
              <span className="font-bold">{pricingFormat(String(price))}</span>
            </p>

            <div className="flex items-center gap-3">
              <Button
                className={`flex items-center gap-2 rounded-xl px-4 py-2 ${
                  selected
                    ? "bg-green-600 text-white"
                    : "bg-amber-400/50 text-gray-900"
                }`}
                onClick={() => onSelectRoom(id)}>
                <BedDouble className="w-4 h-4" />
                {selected ? "Selected" : "Book This"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
