import React from "react";
import { cn } from "@/lib/utils";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

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
    <section
      className={cn(
        "rounded-lg border border-gray-200 p-4 bg-white shadow-sm cursor-pointer transition-all duration-200",
        selected ? "bg-green-100" : "hover:bg-gray-100/50"
      )}
      onClick={() => onSelectRoom(id)}>
      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="col-span-1">
          <OptimizedImage
            src={images[0] ?? "/placeholder-room.jpg"}
            alt={title}
            containerClassName="h-40 rounded-md"
            className="rounded-md"
          />
          <div className="flex gap-2 mt-2">
            {images.slice(0, 4).map((img, i) => (
              <img
                key={i}
                src={img}
                loading="lazy"
                className="w-16 h-12 object-cover rounded-sm border"
                alt={`${title}-thumb-${i}`}
              />
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <div className="flex justify-between items-center gap-3">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <div
              role="checkbox"
              aria-checked={selected}
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onSelectRoom(id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectRoom(id);
              }}
              className={cn(
                "flex items-center justify-center rounded-2xl cursor-pointer select-none transition-all duration-200 shadow-sm border outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                selected
                  ? "bg-green-600 border-green-600 hover:bg-green-700"
                  : "bg-amber-100/70 border-amber-300 hover:bg-amber-200/80"
              )}>
              <span
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 rounded-full border-4 transition-all duration-300 shadow-sm",
                  selected
                    ? "bg-white border-green-600 scale-110"
                    : "bg-white border-gray-400/50 hover:border-gray-500"
                )}>
                {selected && (
                  <svg
                    className="w-4 h-4 text-green-600 animate-in fade-in-50 zoom-in-50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </span>
            </div>
          </div>
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
          </div>
        </div>
      </div>
    </section>
  );
};
