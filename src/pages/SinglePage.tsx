import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import SinglePageSkeleton from "@/components/skeleton/SinglePageSkeleton";
import CardItem from "@/components/cards/CardItem";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { RoomTypeBadge } from "@/components/ui/RoomTypeBadge";
import { Minus, Plus, Users, BedDouble, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildAvailabilityUrl,
  amenityNames,
  amenityPills,
  roomImages,
} from "@/hooks/useRoomList";
import { bedSpecificationLine } from "@/lib/formatters/roomDisplayName";
import {
  venueStartingDisplayPrice,
} from "@/lib/math/calculate";
import type { VenuePriceItem } from "@/lib/math/calculate";
import { UnavailableReasonOverlay } from "@/components/booking/UnavailableReasonOverlay";

interface ApiListResponse<T> {
  success?: boolean;
  data?: T[];
}

interface ListingItem {
  id: number;
  name?: string;
  type?: string;
  capacity?: number;
  price?: number;
  description?: string;
  amenities?: unknown[];
  featured_image?: string | null;
  gallery?: string[];
  bed_specifications?: string[];
  wedding_price?: number | string;
  birthday_price?: number | string;
  meeting_staff_price?: number | string;
}

function extractList<T>(response: { data?: T[] } | T[] | undefined): T[] {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
}

const SinglePage = () => {
  const navigate = useNavigate();
  const { roomId, venueId } = useParams<{
    roomId?: string;
    venueId?: string;
  }>();
  const location = useLocation();
  const state = location.state as {
    room?: ListingItem;
    venue?: ListingItem;
  } | null;
  const detailRef = useRef<HTMLDivElement>(null);

  const isVenuePage = location.pathname.startsWith("/venues");
  const stateItem = state?.room ?? state?.venue;

  const { data, isLoading, error } = useApiQuery<
    ApiListResponse<ListingItem> | ListingItem[]
  >(
    [isVenuePage ? "venues" : "rooms", "single-page"],
    isVenuePage ? "/venues?is_all=1" : "/rooms?is_all=1",
  );

  const itemList = useMemo(() => extractList<ListingItem>(data), [data]);

  const selectedItem = useMemo(() => {
    const idToMatch = isVenuePage ? venueId : roomId;
    if (idToMatch) {
      const match = itemList.find((item) => String(item.id) === idToMatch);
      if (match) return match;
    }
    return stateItem ?? null;
  }, [isVenuePage, venueId, roomId, itemList, stateItem]);

  const visibleList = useMemo(() => {
    if (!selectedItem) return itemList;
    return itemList.filter((item) => item.id !== selectedItem.id);
  }, [itemList, selectedItem]);

  const handleCardClick = (id: number, item?: ListingItem) => {
    const path = isVenuePage ? `/venues/${id}` : `/rooms/${id}`;
    navigate(path, {
      state: {
        [isVenuePage ? "venue" : "room"]:
          item ?? itemList.find((entry) => entry.id === id),
      },
    });
  };

  const heroImage = selectedItem?.featured_image ?? selectedItem?.gallery?.[0];
  const bedSpecs = selectedItem?.bed_specifications ?? [];
  const headingLabel = isVenuePage ? "Our Venues" : "Our Rooms";
  const introTitle = isVenuePage
    ? "Find the perfect venue"
    : "Find the perfect stay";
  const introCopy = isVenuePage
    ? "Browse every venue we have available. Click any card to open its full details."
    : "Browse every room we have available. Click any card to open its full details.";
  const listLabel = isVenuePage ? "All venues" : "All rooms";
  const availableLabel = isVenuePage ? "venues" : "rooms";
  const fallbackLabel = isVenuePage ? "Venue" : "Room";

  const mainTitle = isVenuePage
    ? (selectedItem?.name ?? fallbackLabel)
    : bedSpecs.length > 0
      ? bedSpecs.join(", ")
      : (selectedItem?.type ?? fallbackLabel);

  useEffect(() => {
    if (selectedItem && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedItem]);

  /**
   * Example of using the buildAvailabilityUrl function to construct an API URL for fetching available rooms based on check-in and check-out dates. This demonstrates how to integrate the utility function from useRoomList into the SinglePage component to retrieve availability data.
   */
  const dateToday = new Date().toISOString().split("T")[0];
  const dateTommorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const extractAvailabilityUrl = buildAvailabilityUrl(
    "/rooms",
    dateToday,
    dateTommorrow,
  );
  const { data: availabilityRoomData } = useApiQuery<ApiListResponse<any>>(
    ["rooms", dateToday, dateTommorrow],
    extractAvailabilityUrl,
  );

  console.table(availabilityRoomData?.data);

  const availabilityList = useMemo(
    () => extractList<any>(availabilityRoomData?.data ?? availabilityRoomData),
    [availabilityRoomData],
  );

  const availabilityMatch = useMemo(() => {
    if (isVenuePage || !roomId) return null;
    return availabilityList.find((item) => String(item.id) === roomId) ?? null;
  }, [availabilityList, isVenuePage, roomId]);

  const isUnavailable = availabilityMatch?.available === false;
  const unavailableTitle =
    availabilityMatch?.unavailability_title || "Fully booked";
  const unavailableDetail =
    availabilityMatch?.unavailability_detail ||
    "Please pick different dates or another room.";

  const showUnavailableOverlay = isUnavailable;
  const fullyBooked = showUnavailableOverlay;

  const bookingButtonDisabled = isUnavailable;

  const [quantityInCart, setQuantityInCart] = useState(0);

  const images = roomImages(selectedItem as any);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const hasGallery = images.length > 1;
  const mainImage =
    images[activeImageIndex] ?? images[0] ?? "/placeholder-room.jpg";

  const pills = amenityPills(selectedItem?.amenities as any);
  const fallbackDesc =
    selectedItem?.description?.trim() ||
    amenityNames(selectedItem?.amenities as any) ||
    "—";
  const headline = fallbackDesc !== "—" ? fallbackDesc : (selectedItem?.type || "Unit Details");

  const cap = Number(selectedItem?.capacity);
  const capacityGuestWord = cap === 1 ? "guest" : "guests";
  const capacityLine = !Number.isNaN(cap) && cap > 0 ? `${cap} ${capacityGuestWord}` : null;

  const bedExtra = bedSpecificationLine(selectedItem as any);
  const showBedExtra =
    bedExtra && headline && bedExtra.toLowerCase() !== headline.toLowerCase();

  const priceVal = isVenuePage
    ? venueStartingDisplayPrice(selectedItem as unknown as VenuePriceItem)
    : Number(selectedItem?.price) || 0;

  useEffect(() => {
    const updateQuantity = () => {
      if (!selectedItem) {
        setQuantityInCart(0);
        return;
      }
      const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const itemType = isVenuePage ? "venue" : "room";
      const existing = items.find(
        (i: any) => i.id === selectedItem.id && i.itemType === itemType
      );
      setQuantityInCart(existing ? existing.quantity || 0 : 0);
    };

    updateQuantity();
    window.addEventListener("cart-updated", updateQuantity);
    window.addEventListener("storage", updateQuantity);
    return () => {
      window.removeEventListener("cart-updated", updateQuantity);
      window.removeEventListener("storage", updateQuantity);
    };
  }, [selectedItem, isVenuePage]);

  const handleIncrementCart = () => {
    if (!selectedItem) return;
    const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const itemType = isVenuePage ? "venue" : "room";
    const existingIndex = items.findIndex(
      (i: any) => i.id === selectedItem.id && i.itemType === itemType
    );

    if (existingIndex >= 0) {
      items[existingIndex].quantity = (items[existingIndex].quantity || 0) + 1;
    } else {
      items.push({
        id: selectedItem.id,
        itemType,
        name: mainTitle,
        type: selectedItem.type,
        price: isVenuePage ? venueStartingDisplayPrice(selectedItem as unknown as VenuePriceItem) : selectedItem.price,
        featured_image: heroImage,
        quantity: 1,
      });
    }

    localStorage.setItem("cartItems", JSON.stringify(items));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleDecrementCart = () => {
    if (!selectedItem) return;
    const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const itemType = isVenuePage ? "venue" : "room";
    const existingIndex = items.findIndex(
      (i: any) => i.id === selectedItem.id && i.itemType === itemType
    );

    if (existingIndex >= 0) {
      if (items[existingIndex].quantity > 1) {
        items[existingIndex].quantity--;
      } else {
        items.splice(existingIndex, 1);
      }
      localStorage.setItem("cartItems", JSON.stringify(items));
      window.dispatchEvent(new Event("cart-updated"));
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 sm:pt-28 sm:pb-14 space-y-10">
<div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">        
          <div className="flex-1">
            <p className="text-sm uppercase tracking-[0.15em] text-green-800/70 font-semibold">
              {headingLabel}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-(--color-charcoal)">
              {introTitle}
            </h1>
            <p className="mt-2 text-gray-600 max-w-2xl">{introCopy}</p> 
          </div>
        </div>

        {isLoading ? (
          <SinglePageSkeleton />
        ) : error ? (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-red-800">
            Unable to load {availableLabel} right now. Please try again later.
          </div>
        ) : (
          <div className="space-y-12">
            {selectedItem && (
              <div className="relative mx-auto flex w-full max-w-[700px] flex-col items-start gap-4">
                <div className="w-full flex justify-end">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 hover:shadow-md cursor-pointer group"
                  >
                    <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1 text-green-700" />
                    <span>Back</span>
                  </button>
                </div>

                <div
                  ref={detailRef}
                  className="w-full group/card flex flex-col overflow-hidden rounded-2xl border border-sand-dark/40 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] transition-shadow hover:shadow-[0_1px_0_rgba(15,23,42,0.05),0_16px_40px_-14px_rgba(15,23,42,0.14)]"
                >
                <div className="relative h-[250px] sm:h-[350px] w-full bg-gradient-to-b from-sand to-sand-dark/50">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/card:scale-[1.02]"
                    style={{ backgroundImage: `url(${mainImage})` }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent"
                    aria-hidden
                  />
                  
                  {showUnavailableOverlay && (
                    <UnavailableReasonOverlay
                      title={unavailableTitle}
                      detail={unavailableDetail}
                    />
                  )}

                  {quantityInCart > 0 && !fullyBooked && (
                    <div
                      className="absolute top-4 right-4 z-10 flex h-10 min-w-10 items-center justify-center rounded-full bg-sea px-2.5 shadow-lg ring-2 ring-white/30"
                      aria-hidden>
                      <span className="text-sm font-bold tracking-tight text-white tabular-nums">
                        {quantityInCart}
                      </span>
                    </div>
                  )}

                  {hasGallery && !fullyBooked && (
                    <div className="absolute bottom-2 left-2 right-2 pl-2 flex gap-2 overflow-x-auto pb-2 pt-6">
                      {images.map((img: string, i: number) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex(i);
                          }}
                          className={cn(
                            "aspect-4/3 w-16 shrink-0 overflow-hidden rounded-lg ring-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark/80",
                            i === activeImageIndex
                              ? "ring-white shadow-lg shadow-black/30"
                              : "ring-white/70 opacity-90 hover:opacity-100",
                          )}
                          aria-label={`View image ${i + 1}`}
                          aria-pressed={i === activeImageIndex}
                          style={{
                            backgroundImage: `url(${img})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}>
                          <span className="sr-only">Image {i + 1}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative flex flex-1 flex-col bg-[linear-gradient(180deg,#fffefc_0%,#faf8f5_100%)] p-6">
                  {selectedItem.type && (
					          <div className="mb-4 inline-flex">
                      <RoomTypeBadge type={selectedItem.type} isTitle />
                    </div>
                  )}

                  <div
                    className="mb-4 rounded-xl border border-amber-100/80 bg-gradient-to-br from-stone-50/95 via-white to-amber-50/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(245, 158, 11, 0.06)" }}
                  >
                    <div className="flex gap-3.5">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(47, 93, 80, 0.14) 0%, rgba(47, 93, 80, 0.06) 100%)",
                          color: "var(--color-sea)",
                        }}
                      >
                        <BedDouble className="h-5 w-5" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                          {isVenuePage ? "Details" : "Bed layout"}
                        </p>
                        <p className="font-display text-lg font-semibold leading-snug tracking-tight text-ink sm:text-xl">
                          {headline}
                        </p>
                        {showBedExtra && (
                          <p className="text-xs leading-relaxed text-ink-soft">
                            Also listed: <span className="font-medium text-ink">{bedExtra}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {capacityLine && (
                      <div className="mt-4 flex items-center gap-2.5 border-t border-gold-light/40 pt-3.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sand text-ink-soft">
                          <Users className="h-4 w-4" strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-soft">
                            Capacity
                          </p>
                          <p className="text-sm font-semibold text-ink">
                            {capacityLine}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {pills.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {pills.map((pill, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-full border border-sand-dark/40 bg-white/80 px-3 py-1 text-xs font-medium text-ink-soft shadow-sm"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex flex-col gap-3 border-t border-sand-dark/40 pt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-soft">
                        From
                      </p>
                      <p className="font-display text-xl font-bold text-ink">
                        {pricingFormat(priceVal)}
                        <span className="text-sm font-normal text-ink-soft">
                          {" "}
                          /night
                        </span>
                      </p>
                    </div>

                      <div className="flex flex-wrap items-center justify-end gap-4"> 
                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="border-sand-dark/35 bg-white shadow-sm hover:bg-sage-muted"
                          disabled={quantityInCart === 0}
                          onClick={handleDecrementCart}
                          aria-label={`Remove one ${mainTitle} from cart`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span
                          className="min-w-10 text-center font-display text-xl font-semibold tabular-nums text-ink"
                          aria-live="polite"
                        >
                          {quantityInCart}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className={cn(
                            "border-sand-dark/35 bg-white shadow-sm hover:bg-sage-muted",
                            "border-sea/40 hover:border-sea/60 hover:bg-sage-muted"
                          )}
                          disabled={bookingButtonDisabled}
                          onClick={handleIncrementCart}
                          aria-label={`Add one ${mainTitle} to cart`}
                        >
                          <Plus className="h-4 w-4 text-sea" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-semibold text-(--color-charcoal)">
                  {listLabel}
                </h3>
                <span className="text-sm text-gray-500">
                  {visibleList.length} {availableLabel} available
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleList.map((item) => (
                  <CardItem
                    key={item.id}
                    id={item.id}
                    type={item.type}
                    name={item.name}
                    description={item.description}
                    capacity={item.capacity}
                    price={
                      isVenuePage
                        ? venueStartingDisplayPrice(
                            item as unknown as VenuePriceItem,
                          )
                        : item.price
                    }
                    amenities={item.amenities}
                    featured_image={item.featured_image}
                    gallery={item.gallery}
                    bed_specifications={item.bed_specifications}
                    onClick={() => handleCardClick(item.id, item)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SinglePage;
