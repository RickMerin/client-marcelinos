"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { RoomTypeQuantityCard } from "../RoomTypeQuantityCard";
import { VenueCard } from "../VenueCard";
import { BedDouble, Crown, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  buildAvailabilityUrl,
  extractList,
  venueImages,
  formatShortDate,
} from "@/hooks/useRoomList";
import type { BookingKind, FormData, RoomTypeFilter } from "@/types/booking.types";
import { ROOM_TYPE_FILTER_OPTIONS } from "@/lib/constants/booking.constants";
import { ROOM_TYPE_FILTER_CARD_THEME } from "@/lib/constants/roomTypeTheme";
import {
  normalizeRoomDescriptionKey,
  normalizeRoomTypeSlug,
} from "@/lib/utils/booking.utils";
import { cn } from "@/lib/utils";

const ROOM_FILTER_ICONS = {
  standard: BedDouble,
  family: Users,
  deluxe: Crown,
} as const;

const ROOM_FILTER_BLURBS: Record<RoomTypeFilter, string> = {
  standard: "Essential comfort & value",
  family: "Extra room for families or groups",
  deluxe: "Premium space & details",
};

const ROOM_FILTER_CHECKBOX_BASE =
  "size-5 shrink-0 rounded-md border-2 border-stone-300 bg-white shadow-sm " +
  "focus-visible:ring-2 focus-visible:ring-offset-2";

interface ApiListResponse<T> {
  success?: boolean;
  data?: T[];
}

interface Props {
  formData: {
    booking_type?: BookingKind;
    venue_event_date?: string;
    check_in: string;
    check_out: string;
    room_type_filters?: RoomTypeFilter[];
    rooms: any[];
    venues: any[];
  };
  setSelectedRooms: (rooms: any[]) => void;
  setSelectedVenues: (venues: any[]) => void;
  updateFormData: (updates: Partial<FormData>) => void;
}

function RoomCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
      <Skeleton className="w-full h-[250px]" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-6 w-14 rounded-full" />
          ))}
        </div>
        <div className="pt-4 flex items-end justify-between">
          <div className="space-y-1">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** True when check-in and check-out strings refer to the same local calendar day */
function sameCalendarDay(a: string, b: string): boolean {
  if (!a?.trim() || !b?.trim()) return false;
  const da = new Date(a);
  const db = new Date(b);
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) {
    return a.trim() === b.trim();
  }
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function VenueCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
      <Skeleton className="w-full h-[200px] md:h-[150px]" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-24" />
        <div className="pt-4 flex items-end justify-between">
          <div className="space-y-1">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-10 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function Step1({
  formData,
  setSelectedRooms,
  setSelectedVenues,
  updateFormData,
}: Props) {
  const [recentlyUnselectedCount, setRecentlyUnselectedCount] = useState(0);
  const bookingType = formData.booking_type ?? "room";
  const roomTypeFilters = formData.room_type_filters ?? [];
  const checkIn = formData.check_in || "";
  const checkOut = formData.check_out || "";
  /** For room + venue, venue availability uses the same stay window as the room. */
  const venueRangeStart = checkIn;
  const venueRangeEnd = checkOut;

  const showRooms = bookingType !== "venue";
  const showVenues = bookingType !== "room";

  const roomsUrl = useMemo(
    () => buildAvailabilityUrl("/rooms", checkIn, checkOut),
    [checkIn, checkOut],
  );
  const venuesUrl = useMemo(
    () => buildAvailabilityUrl("/venues", venueRangeStart, venueRangeEnd),
    [venueRangeStart, venueRangeEnd],
  );

  const {
    data: roomsResponse,
    isLoading: roomsLoading,
    error: roomsError,
  } = useApiQuery<ApiListResponse<any>>(["rooms", checkIn, checkOut], roomsUrl);
  const {
    data: venuesResponse,
    isLoading: venuesLoading,
    error: venuesError,
  } = useApiQuery<ApiListResponse<any>>(
    ["venues", venueRangeStart, venueRangeEnd],
    venuesUrl,
  );

  const roomList = useMemo(
    () => extractList<any>(roomsResponse),
    [roomsResponse],
  );
  const venueList = useMemo(
    () => extractList<any>(venuesResponse),
    [venuesResponse],
  );

  /** Rooms grouped by Standard / Family / Deluxe (sorted by id). Respects room-type filters. */
  const roomsByType = useMemo(() => {
    const map = new Map<RoomTypeFilter, any[]>();
    for (const opt of ROOM_TYPE_FILTER_OPTIONS) {
      map.set(opt.value, []);
    }
    for (const room of roomList) {
      const t = normalizeRoomTypeSlug(room.type);
      if (!t) continue;
      if (roomTypeFilters.length > 0 && !roomTypeFilters.includes(t)) continue;
      map.get(t)!.push(room);
    }
    for (const opt of ROOM_TYPE_FILTER_OPTIONS) {
      map.get(opt.value)!.sort((a: any, b: any) => a.id - b.id);
    }
    return map;
  }, [roomList, roomTypeFilters]);

  /** Which categories appear in the UI (filter chips). Empty array means all three. */
  const visibleTypes = useMemo((): RoomTypeFilter[] => {
    if (!roomTypeFilters.length) {
      return ROOM_TYPE_FILTER_OPTIONS.map((o) => o.value);
    }
    return roomTypeFilters;
  }, [roomTypeFilters]);

  /** Types that have at least one inventory row for the current filters/dates. */
  const typesWithInventory = useMemo(() => {
    return ROOM_TYPE_FILTER_OPTIONS.map((o) => o.value).filter(
      (t) =>
        visibleTypes.includes(t) && (roomsByType.get(t)?.length ?? 0) > 0,
    );
  }, [visibleTypes, roomsByType]);

  /**
   * Within each type (Standard / Family / Deluxe), sub-group by `description`
   * so e.g. Standard "2 Single Bed" vs "1 Double Bed" get separate steppers.
   */
  const subgroupsByType = useMemo(() => {
    const map = new Map<
      RoomTypeFilter,
      { key: string; rooms: any[] }[]
    >();
    for (const t of ROOM_TYPE_FILTER_OPTIONS.map((o) => o.value)) {
      const rooms = roomsByType.get(t) ?? [];
      const byDesc = new Map<string, any[]>();
      for (const room of rooms) {
        const k = normalizeRoomDescriptionKey(room.description);
        if (!byDesc.has(k)) byDesc.set(k, []);
        byDesc.get(k)!.push(room);
      }
      for (const list of byDesc.values()) {
        list.sort((a: any, b: any) => a.id - b.id);
      }
      const subgroups = [...byDesc.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, list]) => ({ key, rooms: list }));
      map.set(t, subgroups);
    }
    return map;
  }, [roomsByType]);

  const roomMatchesSubgroup = useCallback(
    (r: any, type: RoomTypeFilter, descriptionKey: string) => {
      if (normalizeRoomTypeSlug(r.type) !== type) return false;
      return normalizeRoomDescriptionKey(r.description) === descriptionKey;
    },
    [],
  );

  const setQuantityForSubgroup = useCallback(
    (type: RoomTypeFilter, descriptionKey: string, nextCount: number) => {
      const pool = (roomsByType.get(type) || [])
        .filter(
          (r: any) =>
            normalizeRoomDescriptionKey(r.description) === descriptionKey &&
            r.available !== false,
        )
        .sort((a: any, b: any) => a.id - b.id);
      const max = pool.length;
      const clamped = Math.max(0, Math.min(nextCount, max));
      const selectedOfSubgroup = formData.rooms.filter((r: any) =>
        roomMatchesSubgroup(r, type, descriptionKey),
      );
      const current = selectedOfSubgroup.length;
      if (clamped === current) return;

      const selectedIds = new Set(
        formData.rooms.map((r: any) => r?.id ?? r),
      );

      if (clamped < current) {
        const sortedSel = [...selectedOfSubgroup].sort(
          (a: any, b: any) => b.id - a.id,
        );
        const toRemove = new Set(
          sortedSel.slice(0, current - clamped).map((r: any) => r.id),
        );
        setSelectedRooms(
          formData.rooms.filter((r: any) => !toRemove.has(r?.id ?? r)),
        );
      } else {
        const toAdd = pool
          .filter((r: any) => !selectedIds.has(r.id))
          .slice(0, clamped - current);
        setSelectedRooms([...formData.rooms, ...toAdd]);
      }
    },
    [formData.rooms, roomsByType, setSelectedRooms, roomMatchesSubgroup],
  );

  const countForSubgroup = (type: RoomTypeFilter, descriptionKey: string) =>
    formData.rooms.filter((r: any) =>
      roomMatchesSubgroup(r, type, descriptionKey),
    ).length;

  const layoutLabelForSubgroup = (key: string, rooms: any[]) => {
    if (key === "__default__") {
      return rooms[0]?.description?.trim() || "Room options";
    }
    return rooms[0]?.description?.trim() || key;
  };

  const toggleRoomTypeFilter = (value: RoomTypeFilter) => {
    const next = roomTypeFilters.includes(value)
      ? roomTypeFilters.length <= 1
        ? roomTypeFilters
        : roomTypeFilters.filter((x) => x !== value)
      : [...roomTypeFilters, value].sort(
          (a, b) =>
            ROOM_TYPE_FILTER_OPTIONS.findIndex((o) => o.value === a) -
            ROOM_TYPE_FILTER_OPTIONS.findIndex((o) => o.value === b),
        );
    updateFormData({ room_type_filters: next });
  };

  // Remove pre-selected rooms that are unavailable or no longer match room-type filters
  useEffect(() => {
    if (!roomList.length || !formData.rooms.length) return;

    const availableRoomIds = new Set(
      roomList
        .filter((room: any) => room?.available !== false)
        .map((room: any) => room.id),
    );

    const allowedTypes =
      roomTypeFilters.length > 0
        ? new Set(roomTypeFilters.map((x) => x.toLowerCase()))
        : null;

    const filteredRooms = formData.rooms.filter((r: any) => {
      if (!availableRoomIds.has(r?.id ?? r)) return false;
      if (allowedTypes) {
        const t = normalizeRoomTypeSlug(r.type);
        if (!t || !allowedTypes.has(t)) return false;
      }
      return true;
    });

    if (filteredRooms.length !== formData.rooms.length) {
      setSelectedRooms(filteredRooms);
      setRecentlyUnselectedCount(formData.rooms.length - filteredRooms.length);
      return;
    }

    if (recentlyUnselectedCount !== 0) {
      setRecentlyUnselectedCount(0);
    }
  }, [
    roomList,
    roomTypeFilters,
    formData.rooms,
    setSelectedRooms,
    recentlyUnselectedCount,
  ]);

  const onSelectVenue = (venue: any) => {
    const isAlreadySelected = formData.venues.some(
      (v: any) => (v?.id ?? v) === venue.id,
    );
    const updated = isAlreadySelected
      ? formData.venues.filter((v: any) => (v?.id ?? v) !== venue.id)
      : [...formData.venues, venue];
    setSelectedVenues(updated);
  };

  const roomCount = formData.rooms.length;
  const venueCount = formData.venues.length;
  const staySameDay = sameCalendarDay(checkIn, checkOut);

  const stepTitle =
    bookingType === "venue"
      ? "Choose your venue"
      : bookingType === "both"
        ? "Choose your room & venue"
        : "Choose your stay";

  const stepIntro = (() => {
    if (!checkIn || !checkOut) {
      return "Add dates on the home page first, then choose rooms and/or venues below.";
    }
    if (bookingType === "both") {
      return `Room & venue stay: ${checkIn} – ${checkOut}. Venue pricing matches your stay length (same check-in and check-out as your room). You can book rooms only, venues only, or both.`;
    }
    if (bookingType === "venue") {
      return `Single-day venue booking for ${checkIn}. Pick venues below.`;
    }
    return `Availability for ${checkIn} – ${checkOut}. Choose how many Standard, Family, or Deluxe rooms you need; specific units are assigned by staff at check-in.`;
  })();

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--color-sage, #4a6741)" }}
        >
          {bookingType === "room" && "Rooms only"}
          {bookingType === "venue" && "Venue only"}
          {bookingType === "both" && "Room + venue"}
        </p>
        <h2
          className="font-display text-3xl font-bold tracking-tight"
          style={{ color: "var(--color-charcoal)" }}
        >
          {stepTitle}
        </h2>
        <p className="max-w-3xl" style={{ color: "var(--color-charcoal)" }}>
          {stepIntro}
        </p>

        <br />

        {/* Booking summary — labels match room vs venue vs combined */}
        <div
          className="rounded-md border bg-white p-5 shadow-sm md:p-6"
          style={{ borderColor: "var(--color-sage-muted, #e5e7eb)" }}
        >
          {bookingType === "venue" ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
                <div>
                  <p
                    className="text-sm font-medium opacity-80"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    Venues selected
                  </p>
                  <p
                    className="mt-1 text-xl font-bold tracking-tight"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    {venueCount}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm font-medium opacity-80"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    Event date
                  </p>
                  <p
                    className="mt-1 text-xl font-bold tracking-tight"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    {formatShortDate(checkIn)}
                  </p>
                </div>
              </div>
              <p
                className="mt-4 border-t pt-3 text-xs leading-relaxed opacity-85"
                style={{
                  borderColor: "var(--color-sage-muted, #e5e7eb)",
                  color: "var(--color-charcoal)",
                }}
              >
                For venue bookings, check-in and check-out fall on the{" "}
                <span className="font-semibold">same calendar day</span> (your
                event window). You are not selecting an overnight room stay
                here.
              </p>
            </>
          ) : bookingType === "both" ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
                <div>
                  <p
                    className="text-sm font-medium opacity-80"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    Rooms selected
                  </p>
                  <p
                    className="mt-1 text-xl font-bold tracking-tight"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    {roomCount}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm font-medium opacity-80"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    Venues selected
                  </p>
                  <p
                    className="mt-1 text-xl font-bold tracking-tight"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    {venueCount}
                  </p>
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <p
                    className="text-sm font-medium opacity-80"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    Room & venue dates
                  </p>
                  <p
                    className="mt-1 text-lg font-bold tracking-tight sm:text-xl"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    {formatShortDate(checkIn)} – {formatShortDate(checkOut)}
                  </p>
                </div>
              </div>
              <p
                className="mt-4 border-t pt-3 text-xs leading-relaxed opacity-85"
                style={{
                  borderColor: "var(--color-sage-muted, #e5e7eb)",
                  color: "var(--color-charcoal)",
                }}
              >
                <span className="font-semibold">Room and venue</span> share the
                same check-in and check-out; venue line items are priced for the
                full length of your stay (e.g. 6 nights → 6 days of venue
                pricing).
              </p>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-8">
                <div>
                  <p
                    className="text-sm font-medium opacity-80"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    Rooms selected
                  </p>
                  <p
                    className="mt-1 text-xl font-bold tracking-tight"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    {roomCount}
                  </p>
                </div>

                <div>
                  <p
                    className="text-sm font-medium opacity-80"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    Check-in
                  </p>
                  <p
                    className="mt-1 text-xl font-bold tracking-tight"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    {formatShortDate(checkIn)}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm font-medium opacity-80"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    Check-out
                  </p>
                  <p
                    className="mt-1 text-xl font-bold tracking-tight"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    {formatShortDate(checkOut)}
                  </p>
                </div>
              </div>
              {staySameDay ? (
                <p
                  className="mt-4 border-t pt-3 text-xs leading-relaxed opacity-85"
                  style={{
                    borderColor: "var(--color-sage-muted, #e5e7eb)",
                    color: "var(--color-charcoal)",
                  }}
                >
                  Check-in and check-out show the same date because this stay is
                  a single calendar day; actual times follow property policy
                  (e.g. 12:00 PM in / 10:00 AM out).
                </p>
              ) : (
                <p
                  className="mt-4 border-t pt-3 text-xs leading-relaxed opacity-85"
                  style={{
                    borderColor: "var(--color-sage-muted, #e5e7eb)",
                    color: "var(--color-charcoal)",
                  }}
                >
                  Nights are between check-in and check-out dates. Times follow
                  property policy unless stated otherwise.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {showRooms && (
        <section className="space-y-4">
          <div>
            <h3
              className="font-display text-xl font-semibold"
              style={{ color: "var(--color-charcoal)" }}
            >
              Where you&apos;ll stay
            </h3>
            <p
              className="text-sm mt-0.5 opacity-80"
              style={{ color: "var(--color-charcoal)" }}
            >
              {bookingType === "both"
                ? "Optional if you only need a venue: choose which categories appear, then set how many rooms per category (up to what’s available)."
                : "Select which categories to show, then use +/− to choose how many rooms per category. You can’t exceed availability for your dates."}
            </p>
          </div>
          {(bookingType === "room" || bookingType === "both") && (
            <div
              className="overflow-hidden rounded-2xl border border-stone-200/90 shadow-[0_1px_0_rgba(15,23,42,0.04),0_20px_50px_-24px_rgba(15,23,42,0.12)]"
              style={{
                background:
                  "linear-gradient(165deg, #fffefc 0%, #f7f5f0 48%, #f3f1ec 100%)",
              }}
            >
              <div
                className="relative border-b border-stone-200/70 px-5 py-5 md:px-7 md:py-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(49, 90, 59, 0.07) 0%, rgba(49, 90, 59, 0.02) 55%, transparent 100%)",
                }}
              >
                <div
                  className="absolute left-0 top-0 h-full w-1 rounded-r-sm bg-gradient-to-b from-emerald-700/90 via-[var(--color-sage,#315a3b)] to-emerald-900/80"
                  aria-hidden
                />
                <p className="pl-3 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Categories
                </p>
                <h4
                  className="font-display mt-1.5 pl-3 text-xl font-semibold tracking-tight text-stone-900 md:text-2xl"
                  style={{ color: "var(--color-charcoal)" }}
                >
                  Room types to show
                </h4>
                <p
                  className="mt-2 max-w-2xl pl-3 text-sm leading-relaxed text-stone-600"
                  style={{ color: "var(--color-charcoal)" }}
                >
                  Choose which room lines appear below. At least one category
                  must stay on—toggle to focus on Standard, Family, or Deluxe.
                </p>
              </div>
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                  {ROOM_TYPE_FILTER_OPTIONS.map((opt) => {
                    const checked = roomTypeFilters.includes(opt.value);
                    const Icon = ROOM_FILTER_ICONS[opt.value];
                    const blurb = ROOM_FILTER_BLURBS[opt.value];
                    const ft = ROOM_TYPE_FILTER_CARD_THEME[opt.value];
                    return (
                      <label
                        key={opt.value}
                        className={cn(
                          "group flex cursor-pointer flex-col rounded-2xl border p-4 transition-all duration-200 md:p-5",
                          "min-h-[7.5rem]",
                          checked
                            ? cn(
                                "border ring-1",
                                ft.checkedBorder,
                                ft.checkedRing,
                                ft.checkedBg,
                              )
                            : cn(ft.cardUnchecked, ft.hoverBorder),
                          ft.focusRing,
                        )}
                        style={{ color: "var(--color-charcoal)" }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className={cn(
                              "h-11 w-11 shrink-0 overflow-hidden rounded-xl border transition-colors duration-200",
                              checked ? ft.iconOuter : ft.iconUnchecked,
                            )}
                          >
                            {checked ? (
                              <div className={ft.iconInner}>
                                <Icon className="size-5" strokeWidth={1.75} />
                              </div>
                            ) : (
                              <Icon className="size-5" strokeWidth={1.75} />
                            )}
                          </div>
                          <Checkbox
                            className={cn(
                              ROOM_FILTER_CHECKBOX_BASE,
                              ft.checkboxChecked,
                              ft.checkboxFocus,
                            )}
                            checked={checked}
                            onCheckedChange={() =>
                              toggleRoomTypeFilter(opt.value)
                            }
                          />
                        </div>
                        <div className="mt-3 min-w-0 flex-1">
                          <span className="font-display text-base font-semibold tracking-tight text-stone-900 md:text-lg">
                            {opt.label}
                          </span>
                          <p className="mt-1 text-xs leading-snug text-stone-500">
                            {blurb}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {roomsError && (
            <p className="text-red-600 text-sm py-2">
              Error loading rooms. Please try again.
            </p>
          )}
          {roomsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <RoomCardSkeleton key={i} />
              ))}
            </div>
          ) : roomList.length === 0 ? (
            <div
              className="rounded-xl border-2 border-dashed py-12 text-center"
              style={{
                borderColor: "var(--color-sage-muted)",
                backgroundColor: "var(--color-cream)",
                color: "var(--color-charcoal)",
              }}
            >
              No rooms available for the selected dates.
            </div>
          ) : typesWithInventory.length === 0 ? (
            <div
              className="rounded-xl border-2 border-dashed py-12 text-center"
              style={{
                borderColor: "var(--color-sage-muted)",
                backgroundColor: "var(--color-cream)",
                color: "var(--color-charcoal)",
              }}
            >
              No rooms match the selected room types. Try including more types
              above, or change your dates on the home page.
            </div>
          ) : (
            <div className="space-y-12">
              {typesWithInventory.map((type) => {
                const subgroups = subgroupsByType.get(type) ?? [];
                const opt = ROOM_TYPE_FILTER_OPTIONS.find((o) => o.value === type);
                const typeLabel = opt?.label ?? type;
                return (
                  <section key={type} className="space-y-5">
                    <div
                      className="border-b pb-3"
                      style={{ borderColor: "var(--color-sage-muted, #e5e7eb)" }}
                    >
                      <h4
                        className="font-display text-lg font-semibold tracking-tight sm:text-xl"
                        style={{ color: "var(--color-charcoal)" }}
                      >
                        {typeLabel}
                      </h4>
                      <p
                        className="mt-1 max-w-2xl text-sm opacity-80"
                        style={{ color: "var(--color-charcoal)" }}
                      >
                        {subgroups.length > 1
                          ? "Each layout is booked separately. Use +/− up to availability for that layout."
                          : "Use +/− to choose how many rooms you need, up to availability."}
                      </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      {subgroups.map(({ key, rooms: roomsInGroup }) => {
                        const maxAvailable = roomsInGroup.filter(
                          (r: any) => r.available !== false,
                        ).length;
                        const n = countForSubgroup(type, key);
                        const layoutLabel = layoutLabelForSubgroup(
                          key,
                          roomsInGroup,
                        );
                        return (
                          <RoomTypeQuantityCard
                            key={`${type}-${key}`}
                            roomType={type}
                            typeLabel={typeLabel}
                            layoutLabel={layoutLabel}
                            roomsInGroup={roomsInGroup}
                            selectedCount={n}
                            maxAvailable={maxAvailable}
                            onIncrement={() =>
                              setQuantityForSubgroup(type, key, n + 1)
                            }
                            onDecrement={() =>
                              setQuantityForSubgroup(type, key, n - 1)
                            }
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>
      )}

      {showVenues && (
        <section className="space-y-4">
          <div>
            <h3
              className="font-display text-xl font-semibold"
              style={{ color: "var(--color-charcoal)" }}
            >
              Event spaces{" "}
              {bookingType === "both" && (
                <span className="font-normal opacity-80">(optional)</span>
              )}
            </h3>
            <p
              className="text-sm mt-0.5 opacity-80"
              style={{ color: "var(--color-charcoal)" }}
            >
              {bookingType === "venue"
                ? "Select one or more venues for your event date."
                : bookingType === "both"
                  ? "Optional if you only need rooms: add one or more venues for your event day."
                  : "Add a venue if you need a dedicated space for events (e.g. meetings, celebrations)."}
            </p>
          </div>
          {venuesError && (
            <p className="text-red-600 text-sm py-2">
              Error loading venues. Please try again.
            </p>
          )}
          {venuesLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3].map((i) => (
                <VenueCardSkeleton key={i} />
              ))}
            </div>
          ) : venueList.length === 0 ? (
            <div
              className="rounded-xl border-2 border-dashed py-12 text-center"
              style={{
                borderColor: "var(--color-sage-muted)",
                backgroundColor: "var(--color-cream)",
                color: "var(--color-charcoal)",
              }}
            >
              No venues available for the selected dates.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {venueList.map((venue: any) => (
                <VenueCard
                  key={venue.id}
                  id={venue.id}
                  name={venue.name ?? "Venue"}
                  images={venueImages(venue)}
                  capacity={String(venue.capacity ?? "—")}
                  price={venue.price ?? 0}
                  availability={venue.available ?? false}
                  unavailabilityTitle={venue.unavailability_title}
                  unavailabilityDetail={venue.unavailability_detail}
                  selected={formData.venues.some(
                    (v: any) => (v?.id ?? v) === venue.id,
                  )}
                  onSelectVenue={() => onSelectVenue(venue)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
