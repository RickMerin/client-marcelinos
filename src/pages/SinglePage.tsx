import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import SinglePageSkeleton from "@/components/skeleton/SinglePageSkeleton";
import CardItem from "@/components/cards/CardItem";
import Section from "@/components/Section";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { RoomTypeBadge } from "@/components/ui/RoomTypeBadge";
import {
  Minus,
  Plus,
  Users,
  BedDouble,
  MapPin,
  X,
  ZoomIn,
  CalendarRange,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildAvailabilityUrl,
  amenityNames,
  roomImages,
  formatShortDate,
} from "@/hooks/useRoomList";
import { bedSpecificationLine } from "@/lib/formatters/roomDisplayName";
import {
  venueStartingDisplayPrice,
} from "@/lib/math/calculate";
import type { VenuePriceItem } from "@/lib/math/calculate";
import { UnavailableReasonOverlay } from "@/components/booking/UnavailableReasonOverlay";
import { getActiveStayDates } from "@/lib/utils/bookingDates";
import {
  pruneCartItemsToAvailability,
  syncCartToReservationDetails,
} from "@/lib/utils/cartBookingSync";
import { roomInventoryGroupKey } from "@/lib/formatters/roomDisplayName";
import {
  effectiveMaxUnitsForSubgroup,
  extractInventoryGroupAvailability,
  isRoomInventoryAvailable,
  isVenueInventoryAvailable,
  normalizeRoomTypeSlug,
} from "@/lib/utils/booking.utils";
import type { RoomTypeFilter } from "@/types/booking.types";

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
  /** Present on date-scoped inventory responses */
  available?: boolean;
  unavailability_title?: string;
  unavailability_detail?: string;
}

type CartItem = {
  id: number;
  itemType: "room" | "venue";
  quantity?: number;
};

function extractList<T>(response: { data?: T[] } | T[] | undefined): T[] {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
}

/** Same key as grouped room rows: type + bed_specifications. */
function roomGroupKey(item: ListingItem): string {
  const typeLabel = (item.type || "Other").trim();
  const bedLabel = (item.bed_specifications ?? []).length
    ? item.bed_specifications!.join(", ")
    : "No bed specification";
  return `${typeLabel.toLowerCase()}::${bedLabel.toLowerCase()}`;
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
  const basePath = isVenuePage ? "/venues" : "/rooms";

  const stayDates = useMemo(
    () => getActiveStayDates(),
    [location.key, location.pathname],
  );

  const roomsUrl = useMemo(
    () =>
      stayDates
        ? buildAvailabilityUrl("/rooms", stayDates.checkIn, stayDates.checkOut)
        : "/rooms?is_all=1&limit=80",
    [stayDates],
  );
  const venuesUrl = useMemo(
    () =>
      stayDates
        ? buildAvailabilityUrl(
            "/venues",
            stayDates.checkIn,
            stayDates.checkOut,
          )
        : "/venues?is_all=1&limit=60",
    [stayDates],
  );

  const roomsQueryKey = useMemo(
    () =>
      stayDates
        ? ["rooms", stayDates.checkIn, stayDates.checkOut]
        : ["rooms", "browse", "single-page"],
    [stayDates],
  );
  const venuesQueryKey = useMemo(
    () =>
      stayDates
        ? ["venues", stayDates.checkIn, stayDates.checkOut]
        : ["venues", "browse", "single-page"],
    [stayDates],
  );

  const { data: roomsData, isLoading: roomsLoading, error: roomsError } =
    useApiQuery<ApiListResponse<ListingItem> | ListingItem[]>(
      roomsQueryKey,
      roomsUrl,
    );
  const { data: venuesData, isLoading: venuesLoading, error: venuesError } =
    useApiQuery<ApiListResponse<ListingItem> | ListingItem[]>(
      venuesQueryKey,
      venuesUrl,
    );

  const roomList = useMemo(
    () => extractList<ListingItem>(roomsData),
    [roomsData],
  );
  const venueList = useMemo(
    () => extractList<ListingItem>(venuesData),
    [venuesData],
  );

  const itemList = isVenuePage ? venueList : roomList;
  const isLoading = isVenuePage ? venuesLoading : roomsLoading;
  const error = isVenuePage ? venuesError : roomsError;

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

  const groupedRooms = useMemo(() => {
    if (isVenuePage) return [];
    const grouped = new Map<
      string,
      { key: string; label: string; bedLabel: string; items: ListingItem[] }
    >();

    visibleList.forEach((item) => {
      const groupKey = roomGroupKey(item);
      const typeLabel = (item.type || "Other").trim();
      const bedLabel = (item.bed_specifications ?? []).length
        ? item.bed_specifications!.join(", ")
        : "No bed specification";
      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, {
          key: groupKey,
          label: typeLabel,
          bedLabel,
          items: [],
        });
      }
      grouped.get(groupKey)!.items.push(item);
    });

    return Array.from(grouped.values()).sort((a, b) => {
      const typeCompare = a.label.localeCompare(b.label);
      if (typeCompare !== 0) return typeCompare;
      return a.bedLabel.localeCompare(b.bedLabel);
    });
  }, [visibleList, isVenuePage]);

  const consolidatedRoomCards = useMemo(() => {
    if (isVenuePage) return [];
    const hideGroupKey =
      selectedItem && !isVenuePage ? roomGroupKey(selectedItem) : null;
    return groupedRooms
      .filter((g) => hideGroupKey == null || g.key !== hideGroupKey)
      .map((group) => {
      const sorted = [...group.items].sort((a, b) => {
        const pa = Number(a.price) || 0;
        const pb = Number(b.price) || 0;
        if (pa !== pb) return pa - pb;
        return a.id - b.id;
      });
      const rep = sorted[0]!;
      const prices = group.items
        .map((i) => Number(i.price))
        .filter((p) => !Number.isNaN(p));
      const minPrice = prices.length > 0 ? Math.min(...prices) : rep.price;
      return { group, rep, minPrice };
    });
  }, [groupedRooms, isVenuePage, selectedItem]);

  const handleCardClick = (id: number, item?: ListingItem) => {
    const path = `${basePath}/${id}`;
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

  /** Fresh row from date-scoped list (preferred over navigation state). */
  const availabilityRow = useMemo(() => {
    if (!selectedItem) return null;
    if (isVenuePage) {
      return (
        venueList.find((v) => String(v.id) === String(selectedItem.id)) ??
        selectedItem
      );
    }
    return (
      roomList.find((r) => String(r.id) === String(selectedItem.id)) ??
      selectedItem
    );
  }, [selectedItem, isVenuePage, roomList, venueList]);

  const maxSelectableQuantity = useMemo(() => {
    if (!availabilityRow) return 0;
    if (isVenuePage) {
      return isVenueInventoryAvailable(availabilityRow) ? 1 : 0;
    }
    if (!isRoomInventoryAvailable(availabilityRow)) return 0;
    const t = normalizeRoomTypeSlug(availabilityRow.type);
    if (!t) return 0;
    const invk = roomInventoryGroupKey(
      availabilityRow as Parameters<typeof roomInventoryGroupKey>[0],
    );
    const poolLen = roomList.filter(
      (r) =>
        normalizeRoomTypeSlug(r.type) === t &&
        roomInventoryGroupKey(r as Parameters<typeof roomInventoryGroupKey>[0]) ===
          invk &&
        isRoomInventoryAvailable(r),
    ).length;
    const igRows = extractInventoryGroupAvailability(roomsData);
    return effectiveMaxUnitsForSubgroup(
      poolLen,
      igRows,
      t as RoomTypeFilter,
      invk,
    );
  }, [availabilityRow, isVenuePage, roomList, roomsData]);

  const isUnavailable =
    availabilityRow != null &&
    (isVenuePage
      ? !isVenueInventoryAvailable(availabilityRow)
      : maxSelectableQuantity === 0);

  const unavailableTitle =
    availabilityRow?.unavailability_title ||
    selectedItem?.unavailability_title ||
    "Fully booked";
  const unavailableDetail =
    availabilityRow?.unavailability_detail ||
    selectedItem?.unavailability_detail ||
    "Please pick different dates or another room.";

  const showUnavailableOverlay = isUnavailable;
  const fullyBooked = showUnavailableOverlay;

  const bookingButtonDisabled = isUnavailable;

  const [quantityInCart, setQuantityInCart] = useState(0);
  const [draftQuantity, setDraftQuantity] = useState(0);
  const [isAddAnimating, setIsAddAnimating] = useState(false);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);

 const images = selectedItem
  ? roomImages(selectedItem as unknown as Record<string, unknown>)
  : [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const hasGallery = images.length > 1;
  const mainImage =
    images[activeImageIndex] ?? images[0] ?? "/placeholder-room.jpg";

  const fallbackDesc =
    selectedItem?.description?.trim() ||
    amenityNames(selectedItem?.amenities as any[] | undefined) ||
    "—";
  const headline = fallbackDesc !== "—" ? fallbackDesc : (selectedItem?.type || "Unit Details");
  const [descExpanded, setDescExpanded] = useState(false);
  const descriptionPreview = useMemo(() => {
    const raw = String(headline ?? "").trim();
    if (!raw) return { short: "", isLong: false };
    const words = raw.split(/\s+/);
    const limit = 26;
    if (words.length <= limit) return { short: raw, isLong: false };
    return { short: words.slice(0, limit).join(" ") + "…", isLong: true };
  }, [headline]);

  const cap = Number(selectedItem?.capacity);
  const capacityGuestWord = cap === 1 ? "guest" : "guests";
  const capacityLine = !Number.isNaN(cap) && cap > 0 ? `${cap} ${capacityGuestWord}` : null;

  const bedExtra = bedSpecificationLine(
    selectedItem as unknown as Record<string, unknown>,
  );
  void bedExtra;

const priceVal = selectedItem
  ? isVenuePage
    ? venueStartingDisplayPrice(selectedItem as unknown as VenuePriceItem)
    : Number(selectedItem.price) || 0
  : 0;
  const propertyLocation = "Hilongos, Leyte, Philippines";

  const stayDatesLabel = useMemo(() => {
    if (!stayDates) return null;
    const ci = formatShortDate(stayDates.checkIn);
    const co = formatShortDate(stayDates.checkOut);
    if (ci === "—" && co === "—") return null;
    return `${ci} – ${co}`;
  }, [stayDates]);

  useEffect(() => {
    const changed = pruneCartItemsToAvailability(
      roomList,
      venueList,
      roomsData,
    );
    if (changed) {
      window.dispatchEvent(new Event("cart-updated"));
    }
  }, [roomList, venueList, roomsData]);

  useEffect(() => {
    setDraftQuantity((d) => Math.min(d, maxSelectableQuantity));
  }, [maxSelectableQuantity]);

  useEffect(() => {
    const updateQuantity = () => {
      if (!selectedItem) {
        setQuantityInCart(0);
        setDraftQuantity(0);
        return;
      }
      const items = JSON.parse(
        localStorage.getItem("cartItems") || "[]",
      ) as CartItem[];
      const itemType = isVenuePage ? "venue" : "room";
      const existing = items.find(
        (i) => i.id === selectedItem.id && i.itemType === itemType,
      );
      const nextQty = existing ? existing.quantity || 0 : 0;
      const capped = Math.min(nextQty, maxSelectableQuantity);
      setQuantityInCart(capped);
      setDraftQuantity(capped);
    };

    updateQuantity();
    window.addEventListener("cart-updated", updateQuantity);
    window.addEventListener("storage", updateQuantity);
    return () => {
      window.removeEventListener("cart-updated", updateQuantity);
      window.removeEventListener("storage", updateQuantity);
    };
  }, [selectedItem, isVenuePage, maxSelectableQuantity]);

  useEffect(() => {
    setDescExpanded(false);
  }, [selectedItem?.id]);

  const playLeafFlightToCart = (sourceEl?: HTMLElement | null) => {
    const cartButton = document.querySelector(
      'button[aria-label="View Cart"]',
    ) as HTMLElement | null;
    if (!sourceEl || !cartButton) return;

    const start = sourceEl.getBoundingClientRect();
    const end = cartButton.getBoundingClientRect();
    const startX = start.left + start.width / 2;
    const startY = start.top + start.height / 2;
    const endX = end.left + end.width / 2;
    const endY = end.top + end.height / 2;

    const burst = document.createElement("div");
    burst.style.position = "fixed";
    burst.style.left = `${startX}px`;
    burst.style.top = `${startY}px`;
    burst.style.width = "16px";
    burst.style.height = "16px";
    burst.style.zIndex = "9998";
    burst.style.pointerEvents = "none";
    burst.style.borderRadius = "9999px";
    burst.style.background = "rgba(198, 161, 91, 0.45)";
    burst.style.transform = "translate(-50%, -50%) scale(0.2)";
    burst.style.boxShadow = "0 0 0 0 rgba(198, 161, 91, 0.45)";
    document.body.appendChild(burst);
    const burstAnim = burst.animate(
      [
        {
          transform: "translate(-50%, -50%) scale(0.2)",
          opacity: 0.85,
          boxShadow: "0 0 0 0 rgba(198, 161, 91, 0.45)",
        },
        {
          transform: "translate(-50%, -50%) scale(2.1)",
          opacity: 0,
          boxShadow: "0 0 0 20px rgba(198, 161, 91, 0)",
        },
      ],
      { duration: 520, easing: "ease-out" },
    );
    burstAnim.onfinish = () => burst.remove();

    for (let i = 0; i < 10; i += 1) {
      const trail = document.createElement("div");
      trail.style.position = "fixed";
      trail.style.left = `${startX}px`;
      trail.style.top = `${startY}px`;
      trail.style.width = "42px";
      trail.style.height = "2px";
      trail.style.zIndex = "9997";
      trail.style.pointerEvents = "none";
      trail.style.transformOrigin = "left center";
      trail.style.borderRadius = "9999px";
      trail.style.background =
        "linear-gradient(90deg, rgba(230,211,163,0.65) 0%, rgba(198,161,91,0.25) 70%, rgba(198,161,91,0) 100%)";
      trail.style.filter = "blur(0.4px)";
      document.body.appendChild(trail);

      const leaf = document.createElement("div");
      leaf.style.position = "fixed";
      leaf.style.left = `${startX}px`;
      leaf.style.top = `${startY}px`;
      leaf.style.width = i % 2 === 0 ? "22px" : "18px";
      leaf.style.height = i % 2 === 0 ? "14px" : "12px";
      leaf.style.zIndex = "9999";
      leaf.style.pointerEvents = "none";
      leaf.style.borderRadius = "80% 10% 80% 10%";
      leaf.style.background =
        i % 3 === 0
          ? "linear-gradient(135deg, #E6D3A3 0%, #C6A15B 100%)"
          : "linear-gradient(135deg, #9cc5b5 0%, #2F5D50 100%)";
      leaf.style.transform = "translate(-50%, -50%) rotate(30deg)";
      leaf.style.filter = "drop-shadow(0 4px 8px rgba(15,31,26,0.25))";
      document.body.appendChild(leaf);

      const wobble = i % 2 === 0 ? 72 : -72;
      const drift = (i - 4) * 10;
      const midX = startX + (endX - startX) * 0.45 + wobble + drift;
      const midY = startY + (endY - startY) * 0.34 - 110 - i * 6;

      const animation = leaf.animate(
        [
          {
            transform: "translate(-50%, -50%) rotate(20deg) scale(1)",
            left: `${startX}px`,
            top: `${startY}px`,
            opacity: 0.95,
          },
          {
            transform: "translate(-50%, -50%) rotate(260deg) scale(0.98)",
            left: `${midX}px`,
            top: `${midY}px`,
            opacity: 0.95,
            offset: 0.52,
          },
          {
            transform: "translate(-50%, -50%) rotate(520deg) scale(0.42)",
            left: `${endX}px`,
            top: `${endY}px`,
            opacity: 0.1,
          },
        ],
        {
          duration: 1020 + i * 90,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          delay: i * 45,
        },
      );

      animation.onfinish = () => {
        leaf.remove();
      };

      const dx = endX - startX;
      const dy = endY - startY;
      const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      const trailAnimation = trail.animate(
        [
          {
            transform: `translate(-50%, -50%) rotate(${angleDeg - 8}deg) scaleX(0.35)`,
            left: `${startX}px`,
            top: `${startY}px`,
            opacity: 0.6,
          },
          {
            transform: `translate(-50%, -50%) rotate(${angleDeg + 10}deg) scaleX(1.05)`,
            left: `${startX + dx * 0.55}px`,
            top: `${startY + dy * 0.48 - 18}px`,
            opacity: 0.35,
            offset: 0.62,
          },
          {
            transform: `translate(-50%, -50%) rotate(${angleDeg}deg) scaleX(0.2)`,
            left: `${endX}px`,
            top: `${endY}px`,
            opacity: 0,
          },
        ],
        {
          duration: 980 + i * 80,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          delay: i * 45,
        },
      );

      trailAnimation.onfinish = () => {
        trail.remove();
      };
    }

    cartButton.animate(
      [
        { transform: "scale(1) rotate(0deg)" },
        { transform: "scale(1.24) rotate(-10deg)" },
        { transform: "scale(1.12) rotate(8deg)" },
        { transform: "scale(1) rotate(0deg)" },
      ],
      { duration: 640, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  };

  const handleIncrementDraft = () => {
    if (bookingButtonDisabled || maxSelectableQuantity === 0) return;
    setDraftQuantity((prev) => Math.min(maxSelectableQuantity, prev + 1));
  };

  const handleDecrementDraft = () => {
    setDraftQuantity((prev) => Math.max(0, prev - 1));
  };

  const handleAddToCart = (sourceEl?: HTMLElement | null) => {
    if (!selectedItem) return;
    const nextQuantity = Math.min(
      Math.max(0, draftQuantity),
      maxSelectableQuantity,
    );
    const items = JSON.parse(
      localStorage.getItem("cartItems") || "[]",
    ) as Array<Record<string, unknown> & CartItem>;
    const itemType = isVenuePage ? "venue" : "room";
    const existingIndex = items.findIndex(
      (i) => i.id === selectedItem.id && i.itemType === itemType,
    );

    if (existingIndex >= 0) {
      if (nextQuantity === 0) {
        items.splice(existingIndex, 1);
      } else {
        items[existingIndex] = {
          ...items[existingIndex],
          quantity: nextQuantity,
          name: mainTitle,
          type: selectedItem.type,
          price: isVenuePage
            ? venueStartingDisplayPrice(selectedItem as unknown as VenuePriceItem)
            : selectedItem.price,
          featured_image: heroImage,
        };
      }
    } else if (nextQuantity > 0) {
      items.push({
        id: selectedItem.id,
        itemType,
        name: mainTitle,
        type: selectedItem.type,
        price: isVenuePage
          ? venueStartingDisplayPrice(selectedItem as unknown as VenuePriceItem)
          : selectedItem.price,
        featured_image: heroImage,
        quantity: nextQuantity,
      });
    }

    localStorage.setItem("cartItems", JSON.stringify(items));
    window.dispatchEvent(new Event("cart-updated"));
    syncCartToReservationDetails(roomList, venueList, roomsData);
    playLeafFlightToCart(sourceEl);
    setIsAddAnimating(true);
    window.setTimeout(() => setIsAddAnimating(false), 700);

    if (nextQuantity === 0) return;
  };

  const theme = isVenuePage
    ? {
        heroSectionClass: "section-depth-light",
        heroEyebrowStyle: { color: "var(--color-gold)" } as const,
        heroTextClass: "text-ink",
        heroSubTextClass: "text-ink-soft",
        panelClass:
          "bg-white border border-sand-dark/70 shadow-[0_18px_60px_rgba(15,31,26,0.10)]",
      }
    : {
        heroSectionClass: "section-depth-light",
        heroEyebrowStyle: { color: "var(--color-gold)" } as const,
        heroTextClass: "text-ink",
        heroSubTextClass: "text-ink-soft",
        panelClass:
          "bg-white border border-sand-dark/70 shadow-[0_18px_60px_rgba(15,31,26,0.10)]",
      };

  return (
    <div className="w-full landing-section-alt booking-funnel--leaves-bg relative">
      {!selectedItem && (
        <Section
          className={cn(
            theme.heroSectionClass,
            "pt-28 md:pt-32 lg:pt-36 pb-10",
          )}
          innerClassName="max-w-[1400px] px-6 lg:px-16 xl:px-20"
        >
          <div className="space-y-5">
            <div className="text-sm font-medium text-ink-soft">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="hover:text-ink transition-colors bg-transparent border-none cursor-pointer p-0"
              >
                Home
              </button>
              <span className="mx-2 text-ink-soft/60">/</span>
              <button
                type="button"
                onClick={() => navigate(basePath)}
                className="hover:text-ink transition-colors bg-transparent border-none cursor-pointer p-0"
              >
                {headingLabel}
              </button>
            </div>

            <div className="flex items-end justify-between gap-8 flex-wrap max-md:flex-col max-md:items-start">
              <div className="max-w-3xl">
                <div className="section-eyebrow" style={theme.heroEyebrowStyle}>
                  {headingLabel}
                </div>
                <h1
                  className={cn(
                    "font-display text-fluid-h1 font-light leading-[1.05]",
                    theme.heroTextClass,
                  )}
                >
                  {introTitle}
                </h1>
                <p
                  className={cn(
                    "mt-4 text-base leading-relaxed",
                    theme.heroSubTextClass,
                  )}
                >
                  {introCopy}
                </p>
                {stayDatesLabel ? (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-sand-dark/60 bg-white/80 px-3 py-1.5 text-xs font-medium text-ink shadow-sm">
                    <CalendarRange className="h-3.5 w-3.5 text-sea" />
                    <span className="text-ink-soft">
                      Availability for
                    </span>
                    <span className="tabular-nums text-ink">
                      {stayDatesLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="ml-1 rounded-full border-none bg-transparent p-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-sea underline underline-offset-2 cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-sand-dark/70 bg-white/70 px-3 py-1.5 text-xs font-medium text-ink-soft">
                    <CalendarRange className="h-3.5 w-3.5" />
                    <span>
                      Pick dates on the home page to see live availability.
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate("/create-booking")}
                className="btn-primary-mockup max-md:w-full max-md:text-center"
              >
                Book Now
              </button>
            </div>
          </div>
        </Section>
      )}

      <Section
        className={cn(
          "bg-transparent",
          selectedItem ? "pt-28 md:pt-32 lg:pt-36" : "pt-8 md:pt-10 lg:pt-12",
        )}
      >
        {isLoading ? (
          <SinglePageSkeleton />
        ) : error ? (
          <div className="rounded-lg border border-red-200/60 bg-red-50 p-5 text-red-900 shadow-sm">
            Unable to load {availableLabel} right now. Please try again later.
          </div>
        ) : (
          <div className="space-y-14">
            {selectedItem && (
              <div className="relative mx-auto w-full max-w-280" ref={detailRef}>
                <div className="grid gap-5 lg:grid-cols-[1.35fr_0.95fr] items-stretch">
                  <div className="h-full flex flex-col">
                    {/* Gallery (match reference: big image + 3-up thumbnails) */}
                    <div className="h-full flex flex-col rounded-xl bg-white border border-sand-dark/60 shadow-[0_8px_24px_rgba(15,31,26,0.08)] overflow-hidden">
                      <div
                        className="relative flex-1 min-h-55 sm:min-h-77.5 w-full bg-sand cursor-zoom-in"
                        onClick={() => setIsImageZoomOpen(true)}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-[1.03]"
                          style={{ backgroundImage: `url(${mainImage})` }}
                        />
                        <div
                          className="pointer-events-none absolute inset-0 bg-linear-to-t from-dark/65 via-dark/10 to-transparent"
                          aria-hidden
                        />
                        <div className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-ink shadow-sm">
                          <ZoomIn className="h-3.5 w-3.5" />
                          Zoom
                        </div>

                        {showUnavailableOverlay && (
                          <UnavailableReasonOverlay
                            title={unavailableTitle}
                            detail={unavailableDetail}
                          />
                        )}

                        {quantityInCart > 0 && !fullyBooked && (
                          <div
                            className="absolute top-4 right-4 z-10 flex h-10 min-w-10 items-center justify-center rounded-full bg-sea px-2.5 shadow-lg ring-2 ring-white/30"
                            aria-hidden
                          >
                            <span className="text-sm font-bold tracking-tight text-white tabular-nums">
                              {quantityInCart}
                            </span>
                          </div>
                        )}
                      </div>

                      {hasGallery && !fullyBooked && (
                        <div className="grid grid-cols-3 gap-2 p-2 border-t border-sand-dark/60 bg-white">
                          {images.slice(0, 3).map((img: string, i: number) => (
                            <button
                              key={img + i}
                              type="button"
                              onClick={() => setActiveImageIndex(i)}
                              className={cn(
                                "aspect-4/3 w-full overflow-hidden rounded-[6px] ring-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
                                i === activeImageIndex
                                  ? "ring-sea shadow-sm"
                                  : "ring-sand-dark/60 opacity-90 hover:opacity-100",
                              )}
                              aria-label={`View image ${i + 1}`}
                              aria-pressed={i === activeImageIndex}
                              style={{
                                backgroundImage: `url(${img})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            >
                              <span className="sr-only">Image {i + 1}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sticky sidebar panel (WordPress theme vibe) */}
                  <aside>
                    <div className="h-full flex flex-col rounded-xl border border-sand-dark/60 bg-white p-4 md:p-5 shadow-[0_8px_24px_rgba(15,31,26,0.08)] space-y-3.5">
                      {selectedItem.type && (
                        <div className="inline-flex">
                          <RoomTypeBadge type={selectedItem.type} isTitle />
                        </div>
                      )}

                      <h3 className="text-ink font-semibold text-base md:text-lg leading-snug">
                        {mainTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-md md:text-sm text-ink-soft">
                        {bedSpecs.length > 0 && (
                          <span className="inline-flex items-center gap-2">
                            <BedDouble className="h-4 w-4" />
                            {bedSpecs.length} Beds
                          </span>
                        )}
                        {capacityLine && (
                          <span className="inline-flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {capacityLine}
                          </span>
                        )}
                        {/* {selectedItem.type && (
                          <span className="inline-flex items-center gap-2">
                            <span className="h-4 w-4 rounded-[4px] border border-sand-dark/70 bg-sand" />
                            {selectedItem.type}
                          </span>
                        )} */}
                      </div>
                     {isVenuePage ? (
                        <div className="space-y-1 text-sm md:text-base">
                          {selectedItem.wedding_price && (
                            <div className="flex justify-between text-black">
                              <span>Wedding:</span>
                              <span className="font-semibold text-sea">
                                {pricingFormat(Number(selectedItem.wedding_price))}
                              </span>
                            </div>
                          )}
                          {selectedItem.birthday_price && (
                            <div className="flex justify-between text-black">
                              <span>Birthday:</span>
                              <span className="font-semibold text-sea">
                                {pricingFormat(Number(selectedItem.birthday_price))}
                              </span>
                            </div>
                          )}
                          {selectedItem.meeting_staff_price && (
                            <div className="flex justify-between text-black">
                              <span>Seminar/Meeting:</span>
                              <span className="font-semibold text-sea">
                                {pricingFormat(Number(selectedItem.meeting_staff_price))}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="font-semibold text-sea text-xl leading-none">
                          {pricingFormat(priceVal)}
                        </div>
                      )}
                      <div className="flex items-start gap-2 text-md md:text-sm text-black">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span>{propertyLocation}</span>
                      </div>

                      {stayDatesLabel ? (
                        <div className="flex items-center justify-between gap-2 rounded-[6px] border border-sand-dark/60 bg-sand/60 px-2.5 py-2 text-[12px] text-ink">
                          <span className="inline-flex items-center gap-2">
                            <CalendarRange className="h-4 w-4 text-sea" />
                            <span className="text-ink-soft">
                              Checking availability for
                            </span>
                            <span className="font-semibold tabular-nums text-ink">
                              {stayDatesLabel}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sea underline underline-offset-2 bg-transparent border-none cursor-pointer p-0"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-[6px] border border-dashed border-sand-dark/70 bg-sand/40 px-2.5 py-2 text-[12px] text-ink-soft">
                          <CalendarRange className="h-4 w-4" />
                          <span>
                            Set check-in and check-out on the home page to see
                            live availability.
                          </span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="text-md md:text-sm font-semibold text-ink">
                          Property Description:
                        </div>
                        <div className="text-md md:text-sm text-black leading-relaxed">
                          {descExpanded ? headline : descriptionPreview.short}
                          {descriptionPreview.isLong && (
                            <>
                              {" "}
                              <button
                                type="button"
                                onClick={() => setDescExpanded((v) => !v)}
                                className="text-sea font-semibold underline underline-offset-2 bg-transparent border-none cursor-pointer p-0"
                              >
                                {descExpanded ? "read less" : "read more"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl bg-sand p-2.5 border border-sand-dark/60">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                          Add to cart
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 min-h-8 min-w-8 border-sand-dark/60 bg-white shadow-sm hover:bg-sage-muted"
                            disabled={draftQuantity === 0}
                            onClick={handleDecrementDraft}
                            aria-label={`Remove one ${mainTitle} from cart`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span
                            className="min-w-8 text-center font-display text-lg font-semibold tabular-nums text-ink"
                            aria-live="polite"
                          >
                            {draftQuantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8 min-h-8 min-w-8 border-sand-dark/60 bg-white shadow-sm hover:bg-sage-muted",
                              "border-sea/40 hover:border-sea/60",
                            )}
                            disabled={
                              bookingButtonDisabled ||
                              maxSelectableQuantity === 0 ||
                              draftQuantity >= maxSelectableQuantity
                            }
                            onClick={handleIncrementDraft}
                            aria-label={`Add one ${mainTitle} to cart`}
                          >
                            <Plus className="h-3.5 w-3.5 text-sea" />
                          </Button>
                        </div>
                        <div className="mt-1 text-[14px] text-black text-center">
                          In cart: {quantityInCart}
                          {!isVenuePage && maxSelectableQuantity > 0 && (
                            <span className="block text-xs text-black mt-0.5">
                              Up to {maxSelectableQuantity} available for your
                              dates
                            </span>
                          )}
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        onClick={(event) =>
                          handleAddToCart(event.currentTarget as HTMLElement)
                        }
                        className="btn-primary-mockup w-full justify-center mt-auto min-h-10 text-xs md:text-sm tracking-[0.08em] px-3 rounded-[6px]"
                        disabled={bookingButtonDisabled || draftQuantity === quantityInCart}
                        animate={
                          isAddAnimating
                            ? {
                                rotateX: [0, -18, 12, -4, 0],
                                rotateY: [0, 14, -9, 4, 0],
                                scale: [1, 1.1, 0.98, 1.03, 1],
                                boxShadow: [
                                  "0 0 0 rgba(198,161,91,0)",
                                  "0 0 24px rgba(198,161,91,0.55)",
                                  "0 0 10px rgba(198,161,91,0.22)",
                                  "0 0 0 rgba(198,161,91,0)",
                                ],
                              }
                            : {
                                rotateX: 0,
                                rotateY: 0,
                                scale: 1,
                                boxShadow: "0 0 0 rgba(198,161,91,0)",
                              }
                        }
                        transition={{ duration: 0.66, ease: [0.22, 1, 0.36, 1] }}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        Update cart
                      </motion.button>

                      {fullyBooked && (
                        <div className="text-sm text-red-700 bg-red-50 border border-red-200/70 rounded-[6px] p-3">
                          This {isVenuePage ? "venue" : "room"} is currently unavailable.
                        </div>
                      )}
                    </div>
                  </aside>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-end justify-between gap-6 flex-wrap">
                <div>
                  <div className="section-eyebrow">Explore</div>
                  <h3 className="font-display text-fluid-h3 font-light text-ink leading-[1.1]">
                    {listLabel}
                  </h3>
                </div>
                <div className="text-md text-black">
                  {visibleList.length} {availableLabel} available
                </div>
              </div>

              {visibleList.length === 0 ? (
                <div className="rounded-lg border border-sand-dark/70 bg-white p-6 text-black">
                  No {availableLabel} to show right now.
                </div>
              ) : !isVenuePage ? (
                consolidatedRoomCards.length === 0 ? (
                  <div className="rounded-lg border border-sand-dark/70 bg-white p-6 text-black">
                    No other room categories to explore — the list below hides the category you are viewing.
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {consolidatedRoomCards.map(({ group, rep, minPrice }) => (
                      <CardItem
                        key={group.key}
                        id={rep.id}
                        type={rep.type}
                        name={rep.name}
                        description={rep.description}
                        capacity={rep.capacity}
                        price={minPrice}
                        amenities={rep.amenities}
                        featured_image={rep.featured_image}
                        gallery={rep.gallery}
                        bed_specifications={rep.bed_specifications}
                        onClick={() => handleCardClick(rep.id, rep)}
                      />
                    ))}
                  </div>
                )
              ) : (
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
              )}
            </div>
          </div>
        )}
      </Section>

      {isImageZoomOpen && (
        <div
          className="fixed inset-0 z-1000 bg-black/80 backdrop-blur-sm p-4 md:p-10"
          onClick={() => setIsImageZoomOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-md hover:bg-white"
            onClick={() => setIsImageZoomOpen(false)}
            aria-label="Close image zoom"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="h-full w-full flex items-center justify-center">
            <img
              src={mainImage}
              alt={mainTitle}
              className="max-h-[90vh] max-w-[92vw] object-contain rounded-[10px] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SinglePage;
