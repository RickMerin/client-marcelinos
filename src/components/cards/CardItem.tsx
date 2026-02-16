import { motion } from "framer-motion";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

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
  const title = name ?? "—";
  const typeTitle = type ?? null;
  const amenityList: string[] = Array.isArray(amenities)
    ? amenities
        .map((a: unknown) =>
          typeof a === "string" ? a : (a as { name?: string })?.name,
        )
        .filter((x): x is string => Boolean(x))
    : [];
  const subtitle =
    description ?? (amenityList.length ? amenityList.join(", ") : "—");

  return (
    <motion.div
      className="group relative mx-auto max-w-sm overflow-hidden rounded-2xl border border-gray-100/90 bg-white shadow-lg shadow-gray-900/5 transition-shadow duration-300 hover:border-amber-200/60 hover:shadow-xl hover:shadow-green-900/10"
      initial={false}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}>
      {/* Gold accent bar (theme) */}
      <div
        className="absolute left-0 right-0 top-0 z-10 h-1 bg-linear-to-r from-green-800 via-[#F4C95D] to-amber-400"
        aria-hidden
      />

      {/* Image with subtle bottom gradient for premium feel */}
      <div className="relative h-60 overflow-hidden">
        <OptimizedImage
          src={mainImage ?? "/placeholder-room.jpg"}
          alt={title}
          containerClassName="h-60 w-full"
          className="object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"
          aria-hidden
        />
        {/* Type pill overlay on image (optional) */}
        {typeTitle && (
          <span
            className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-green-800 shadow-sm backdrop-blur-sm"
            aria-hidden>
            {typeTitle}
          </span>
        )}
      </div>

      <div className="relative p-5">
        <h2 className="mb-2 text-xl font-semibold tracking-tight text-gray-900">
          {title}
        </h2>

        {(capacity != null || subtitle !== "—") && (
          <ul className="mb-3 space-y-1 text-sm text-gray-600">
            {capacity != null && (
              <li className="flex items-center gap-2">
                <span className="font-medium text-green-800">Capacity:</span>
                <span>
                  {capacity} {capacity === 1 ? "person" : "people"}
                </span>
              </li>
            )}
            {subtitle !== "—" && (
              <li className="text-gray-700 text-sm">
                {amenityList.length > 0 ? (
                  <>
                    <span className="font-medium text-green-800">
                      Amenities:
                    </span>{" "}
                    {amenityList.slice(0, 3).map((point, idx) => (
                      <span key={idx}>
                        {point}
                        {idx < Math.min(2, amenityList.length - 1) ? ", " : ""}
                      </span>
                    ))}
                    {amenityList.length > 3 && " and more"}
                  </>
                ) : (
                  subtitle
                )}
              </li>
            )}
          </ul>
        )}

        {price != null && (
          <div className="mt-3 flex items-baseline gap-2 border-t border-gray-100 pt-3">
            <span className="text-lg font-bold text-green-800">
              {pricingFormat(String(price))}
            </span>
            <span className="text-xs text-gray-500">starting price</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default CardItem;
