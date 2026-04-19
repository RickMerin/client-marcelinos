import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { RoomTypeBadge } from "@/components/ui/RoomTypeBadge";

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
  onClick?: () => void;
  bed_specifications?: string[];
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
    bed_specifications,
    images: imagesProp,
    onClick,
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

  const PREVIEW_WORD_LIMIT = 10;
  const { previewText, isLong } = useMemo(() => {
    if (!description) return { previewText: "", isLong: false };
    const words = description.trim().split(/\s+/);
    if (words.length <= PREVIEW_WORD_LIMIT) {
      return { previewText: description, isLong: false };
    }
    return {
      previewText: words.slice(0, PREVIEW_WORD_LIMIT).join(" ") + "...",
      isLong: true,
    };
  }, [description]);

  return (
    <motion.div
      className="group relative w-full overflow-hidden rounded-[4px] bg-white border border-sand-dark/60 transition-shadow transition-transform duration-300 hover:shadow-lg hover:shadow-ink/10 hover:z-50"
      whileHover={{ y: -4, scale: 1.05 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      {/* IMAGE */}
      <div className="relative h-60 overflow-hidden">
        <OptimizedImage
          src={mainImage ?? "/placeholder-room.jpg"}
          alt={title}
          containerClassName="h-60 w-full"
          className="object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/40 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gold/12 opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
      </div>

      {/* CONTENT */}
      <div className="relative p-5">
        {typeTitle ? (
          <div className="mb-2">
            <RoomTypeBadge type={typeTitle} isTitle />
          </div>
        ) : (
          <h2 className="font-display mb-2 text-xl font-normal tracking-tight text-ink">
            {title}
          </h2>
        )}

        {(capacity != null || description || amenityList.length > 0) && (
          <ul className="mb-3 space-y-1.5 text-base text-ink-soft">
            {capacity != null && (
              <li className="flex items-center gap-2">
                <span className="font-medium text-sea">Capacity:</span>
                <span>
                  {capacity} {capacity === 1 ? "person" : "people"}
                </span>
              </li>
            )}
            {bed_specifications && bed_specifications.length > 0 && (
              <li className="flex items-center gap-2">
                <span className="font-medium text-sea">Beds:</span>
                <span>{bed_specifications.join(", ")}</span>
              </li>
            )}
            {description && (
              <div className="flex items-center gap-1.5 text-ink-soft text-base leading-relaxed">
                <span className="truncate">
                  {isLong ? previewText : description}
                </span>
                {isLong && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setExpanded(true);
                    }}
                    className="shrink-0 font-medium text-gold hover:underline transition-colors duration-200"
                  >
                    See more
                  </button>
                )}
              </div>
            )}
          </ul>
        )}

        {price != null && (
          <div className="mt-4 flex items-baseline gap-2 border-t border-sand-dark/40 pt-4">
            <span className="text-xl font-semibold text-ink font-display">
              {pricingFormat(String(price))}
            </span>
            <span className="text-sm text-ink-soft/70">starting price</span>
          </div>
        )}
      </div>

      {/* OVERLAY */}
      <AnimatePresence>
        {expanded && (
          <>
            <motion.div
              className="absolute inset-0 bg-ink/30 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(event) => {
                event.stopPropagation();
                setExpanded(false);
              }}
            />

            <motion.div
              className="absolute inset-0 z-30 bg-dark/90 backdrop-blur-lg p-6 flex flex-col rounded-[4px]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex">
                <h2 className="flex-1 font-display text-cream text-xl font-normal mb-4">
                  {title}
                </h2>
                <div className="flex flex-col items-end text-base text-cream/90">
                  {capacity != null && <p>Capacity: {capacity}</p>}
                  {bed_specifications && bed_specifications.length > 0 && (
                    <p>Beds: {bed_specifications.join(", ")}</p>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto text-cream text-base pr-2 custom-scroll leading-relaxed">
                {amenityList.length > 0 && (
                  <div className="mb-4">
                    <div className="font-medium text-gold-light text-[13px] tracking-[0.15em] uppercase mb-1.5">
                      Amenities
                    </div>
                    <div>{amenityList.join(", ")}</div>
                  </div>
                )}
                <div>
                  <div className="font-medium text-gold-light text-[13px] tracking-[0.15em] uppercase mb-1.5">
                    Description
                  </div>
                  <div className="mt-1">{description}</div>
                </div>
              </div>

              <div className="flex">
                {price != null && (
                  <div className="text-gold text-lg flex-1 font-semibold font-display">
                    {pricingFormat(String(price))}
                  </div>
                )}
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setExpanded(false);
                  }}
                  className="self-end text-base font-medium text-gold-light hover:underline bg-transparent border-none cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CardItem;
