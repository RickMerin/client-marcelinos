"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { RoomTypeQuantityCard } from "../RoomTypeQuantityCard";
import { VenueCard } from "../VenueCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  buildAvailabilityUrl,
  extractList,
  venueImages,
  formatShortDate,
} from "@/hooks/useRoomList";
import type { BookingKind, FormData, RoomTypeFilter } from "@/types/booking.types";
import {
  ROOM_TYPE_FILTER_OPTIONS,
  VENUE_EVENT_OPTIONS,
} from "@/lib/constants/booking.constants";
import {
  isRoomInventoryAvailable,
  normalizeRoomTypeSlug,
} from "@/lib/utils/booking.utils";
import {
  bedSpecificationLine,
  roomInventoryGroupKey,
} from "@/lib/formatters/roomDisplayName";
import { venueEffectiveUnitPrice } from "@/lib/math/calculate";
import type { VenueEventType } from "@/types/booking.types";

interface ApiListResponse<T> {
  success?: boolean;
  data?: T[];
}

interface Props {
  formData: {
    booking_type?: BookingKind;
    venue_event_date?: string;
    venue_event_type?: string;
    check_in: string;
    check_out: string;
    rooms: any[];
    venues: any[];
  };
  updateFormData: (updates: Partial<FormData>) => void;
  setSelectedRooms: (rooms: any[]) => void;
  setSelectedVenues: (venues: any[]) => void;
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
  updateFormData,
  setSelectedRooms,
  setSelectedVenues,
}: Props) {
  const [recentlyUnselectedCount, setRecentlyUnselectedCount] = useState(0);
  const bookingType = formData.booking_type ?? "room";
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

  /** Rooms grouped by Standard / Family / Deluxe (sorted by id). All categories shown. */
  const roomsByType = useMemo(() => {
    const map = new Map<RoomTypeFilter, any[]>();
    for (const opt of ROOM_TYPE_FILTER_OPTIONS) {
      map.set(opt.value, []);
    }
    for (const room of roomList) {
      const t = normalizeRoomTypeSlug(room.type);
      if (!t) continue;
      map.get(t)!.push(room);
    }
    for (const opt of ROOM_TYPE_FILTER_OPTIONS) {
      map.get(opt.value)!.sort((a: any, b: any) => a.id - b.id);
    }
    return map;
  }, [roomList]);

  /** Types that have at least one inventory row for these dates. */
  const typesWithInventory = useMemo(() => {
    return ROOM_TYPE_FILTER_OPTIONS.map((o) => o.value).filter(
      (t) => (roomsByType.get(t)?.length ?? 0) > 0,
    );
  }, [roomsByType]);

  /**
   * Within each type (Standard / Family / Deluxe), sub-group by API layout:
   * `bed_specifications` when present, else `description` (same as review step).
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
        const k = roomInventoryGroupKey(room);
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
    (r: any, type: RoomTypeFilter, inventoryGroupKey: string) => {
      if (normalizeRoomTypeSlug(r.type) !== type) return false;
      return roomInventoryGroupKey(r) === inventoryGroupKey;
    },
    [],
  );

  const setQuantityForSubgroup = useCallback(
    (type: RoomTypeFilter, inventoryGroupKey: string, nextCount: number) => {
      const pool = (roomsByType.get(type) || [])
        .filter(
          (r: any) =>
            roomInventoryGroupKey(r) === inventoryGroupKey &&
            isRoomInventoryAvailable(r),
        )
        .sort((a: any, b: any) => a.id - b.id);
      const max = pool.length;
      const clamped = Math.max(0, Math.min(nextCount, max));
      const selectedOfSubgroup = formData.rooms.filter((r: any) =>
        roomMatchesSubgroup(r, type, inventoryGroupKey),
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

  const countForSubgroup = (type: RoomTypeFilter, inventoryGroupKey: string) =>
    formData.rooms.filter((r: any) =>
      roomMatchesSubgroup(r, type, inventoryGroupKey),
    ).length;

  const layoutLabelForSubgroup = (_key: string, rooms: any[]) => {
    const rep = rooms[0];
    if (!rep) return "Room options";
    const bed = bedSpecificationLine(rep);
    if (bed) return bed;
    return rep.description?.trim() || "Room options";
  };

  // Remove pre-selected rooms that are unavailable for the current inventory response
  useEffect(() => {
    if (!roomList.length || !formData.rooms.length) return;

    const availableRoomIds = new Set(
      roomList
        .filter((room: any) => isRoomInventoryAvailable(room))
        .map((room: any) => room.id),
    );

    const filteredRooms = formData.rooms.filter((r: any) =>
      availableRoomIds.has(r?.id ?? r),
    );

    if (filteredRooms.length !== formData.rooms.length) {
      setSelectedRooms(filteredRooms);
      setRecentlyUnselectedCount(formData.rooms.length - filteredRooms.length);
      return;
    }

    if (recentlyUnselectedCount !== 0) {
      setRecentlyUnselectedCount(0);
    }
  }, [roomList, formData.rooms, setSelectedRooms, recentlyUnselectedCount]);

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
                ? "Standard, Family, and Deluxe appear below by layout. Use +/− for each—up to what’s available—or skip rooms if you only need a venue."
                : "Browse Standard, Family, and Deluxe by layout. Use +/− to choose how many rooms you need; you can’t exceed availability for your dates."}
            </p>
          </div>
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
              No bookable rooms in Standard, Family, or Deluxe for these dates.
              Try different dates on the home page.
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
                          (r: any) => isRoomInventoryAvailable(r),
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

          <div
            className="rounded-md border bg-white p-5 shadow-sm md:p-6"
            style={{ borderColor: "var(--color-sage-muted, #e5e7eb)" }}
          >
            <p
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--color-charcoal)" }}
            >
              Event type
            </p>
            <p
              className="text-xs opacity-80 mb-4 max-w-2xl"
              style={{ color: "var(--color-charcoal)" }}
            >
              Venue list prices update based on your choice. Wedding and
              birthday use the full list price; seminar uses the seminar rate
              set for each venue.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {VENUE_EVENT_OPTIONS.map((opt) => {
                const selected =
                  (formData.venue_event_type || "wedding") === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition ${
                      selected
                        ? "border-emerald-700 bg-emerald-50/80 font-medium"
                        : "border-gray-200 hover:border-emerald-300"
                    }`}
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    <input
                      type="radio"
                      name="venue_event_type"
                      value={opt.value}
                      checked={selected}
                      onChange={() =>
                        updateFormData({ venue_event_type: opt.value })
                      }
                      className="accent-emerald-700"
                    />
                    {opt.label}
                  </label>
                );
              })}
            </div>
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
              {venueList.map((venue: any) => {
                const eventType = (formData.venue_event_type ||
                  "wedding") as VenueEventType | "";
                const displayPrice = venueEffectiveUnitPrice(venue, eventType);
                const priceTierLabel =
                  eventType === "seminar" ? "Seminar rate" : "Full price";
                return (
                  <VenueCard
                    key={venue.id}
                    id={venue.id}
                    name={venue.name ?? "Venue"}
                    images={venueImages(venue)}
                    capacity={String(venue.capacity ?? "—")}
                    price={displayPrice}
                    priceTierLabel={priceTierLabel}
                    availability={venue.available ?? false}
                    unavailabilityTitle={venue.unavailability_title}
                    unavailabilityDetail={venue.unavailability_detail}
                    selected={formData.venues.some(
                      (v: any) => (v?.id ?? v) === venue.id,
                    )}
                    onSelectVenue={() => onSelectVenue(venue)}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
