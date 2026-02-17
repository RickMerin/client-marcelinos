import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
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

  const [expanded, setExpanded] = useState(false);

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

// preview

  const PREVIEW_WORD_LIMIT = 6;

  const { previewText, isLong } = useMemo(() => {
    if (!subtitle || subtitle === "—") {
      return { previewText: subtitle, isLong: false };
    }

    const words = subtitle.trim().split(/\s+/);

    if (words.length <= PREVIEW_WORD_LIMIT) {
      return { previewText: subtitle, isLong: false };
    }

    return {
      previewText: words.slice(0, PREVIEW_WORD_LIMIT).join(" ") + "...",
      isLong: true,
    };
  }, [subtitle]);

  return (
    <motion.div
      className="group relative w-full overflow-hidden rounded-2xl border border-gray-100/90 bg-white shadow-lg shadow-gray-900/5 transition-shadow duration-300 hover:border-amber-200/60 hover:shadow-xl hover:shadow-green-900/10"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}>
      {/* Accent bar */}
      <div className="absolute left-0 right-0 top-0 z-10 h-1 bg-linear-to-r from-green-800 via-[#F4C95D] to-amber-400" />

      {/* IMAGE */}
      <div className="relative h-60 overflow-hidden">
        <OptimizedImage
          src={mainImage ?? "/placeholder-room.jpg"}
          alt={title}
          containerClassName="h-60 w-full"
          className="object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />

        {typeTitle && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-green-800 shadow-sm backdrop-blur-sm">
            {typeTitle}
          </span>
        )}
      </div>

      {/* CONTENT */}
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
              <li className="text-gray-700 text-sm leading-relaxed">
                {amenityList.length > 0 ? (
                  <>
                    <span className="font-medium text-green-800">
                      Amenities:
                    </span>{" "}
                    {amenityList.slice(0, 3).join(", ")}
                    {amenityList.length > 3 && " and more"}
                  </>
                ) : (
                  <>
                    {previewText}

                    {isLong && (
                      <button
                        onClick={() => setExpanded(true)}
                        className="ml-1 font-medium text-[#0D542B] hover:text-[#F0B100] transition-colors duration-200">
                        See more
                      </button>
                    )}
                  </>
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

      {/* ================= OVERLAY ================= */}

      <AnimatePresence>
        {expanded && (
          <>
            {/* Lighter Background Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/30 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setExpanded(false)}
            />

            {/* Slide Panel */}
            <motion.div
              className="absolute inset-0 z-30 bg-[#0D542B]/90 backdrop-blur-lg p-6 flex flex-col rounded-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}>
              <h2 className="text-white text-xl font-semibold mb-4">{title}</h2>

              {capacity != null && (
                <p className="text-white text-sm mb-3">Capacity: {capacity}</p>
              )}

              {/* Professional Scroll Area */}
              <div className="flex-1 overflow-y-auto text-white text-sm pr-2 custom-scroll">
                {subtitle}
              </div>

              {price != null && (
                <div className="mt-4 text-[#F0B100] font-semibold">
                  {pricingFormat(String(price))}
                </div>
              )}

              <button
                onClick={() => setExpanded(false)}
                className="mt-6 self-end text-sm font-medium text-[#F0B100] hover:underline">
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CardItem;
