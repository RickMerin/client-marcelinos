import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface BookingCardGalleryProps {
  images: string[];
  alt: string;
  mainHeightClass?: string;
  className?: string;
  placeholderSrc?: string;
}

export const BookingCardGallery: React.FC<BookingCardGalleryProps> = ({
  images,
  alt,
  mainHeightClass = "h-[200px]",
  className,
  placeholderSrc = "/placeholder-room.jpg",
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const galleryImages = images.length > 0 ? images : [placeholderSrc];
  const hasGallery = galleryImages.length > 1;
  const mainImage = galleryImages[activeImageIndex] ?? galleryImages[0];

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex(
      (i) => (i - 1 + galleryImages.length) % galleryImages.length,
    );
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((i) => (i + 1) % galleryImages.length);
  };

  return (
    <div
      className={cn("flex flex-col bg-gray-100", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={cn("relative w-full overflow-hidden", mainHeightClass)}>
        <img
          src={mainImage}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />

        {hasGallery && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/10 backdrop-blur-sm hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-sage)"
              aria-label="Previous image"
            >
              <svg
                className="h-5 w-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/10 backdrop-blur-sm hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-sage)"
              aria-label="Next image"
            >
              <svg
                className="h-5 w-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {hasGallery && (
        <div className="flex gap-1.5 overflow-x-auto border-t border-gray-200 bg-white p-2">
          {galleryImages.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex(i);
              }}
              className={cn(
                "h-12 w-[4.5rem] shrink-0 overflow-hidden rounded-lg ring-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-sage) focus-visible:ring-offset-2",
                i === activeImageIndex
                  ? "ring-(--color-sage) shadow-md"
                  : "ring-gray-200 opacity-90 hover:opacity-100",
              )}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === activeImageIndex}
            >
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                aria-hidden
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
