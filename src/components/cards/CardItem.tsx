import { pricingFormat } from "@/lib/formatters/pricingFormat";

interface CardItemProps {
  id: number;
  type?: string;
  name?: string;
  capacity?: number;
  price?: number;
  description?: string;
  amenities?: unknown[];
  /** Image URL or array: first item used as main image */
  featured_image?: string | null;
  gallery?: string[];
  images?: string[];
}

function amenityNames(amenities: unknown[] | undefined): string {
  if (!Array.isArray(amenities) || amenities.length === 0) return "—";
  return (
    amenities
      .map((a: unknown) =>
        typeof a === "string" ? a : (a as { name?: string })?.name,
      )
      .filter(Boolean)
      .join(", ") || "—"
  );
}

function CardItem(props: CardItemProps) {
  const {
    type,
    name,
    capacity,
    price,
    description,
    amenities,
    featured_image,
    gallery = [],
    images: imagesProp,
  } = props;

  const images =
    imagesProp ??
    [featured_image, ...(Array.isArray(gallery) ? gallery : [])].filter(
      (url): url is string => Boolean(url),
    );
  const mainImage = images[0];
  const title = type ?? name ?? "Room";
  const subtitle = description ?? amenityNames(amenities);

  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg duration-300">
      <div className="w-full h-60 bg-gray-100 overflow-hidden">
        <img
          src={mainImage ?? "/placeholder-room.jpg"}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-900">{title}</h2>
        {capacity != null && (
          <p className="text-gray-600 text-sm mb-1">Capacity: {capacity}</p>
        )}
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{subtitle}</p>
        {price != null && (
          <p className="text-green-800 font-semibold">
            {pricingFormat(String(price))}
          </p>
        )}
      </div>
    </div>
  );
}

export default CardItem;
