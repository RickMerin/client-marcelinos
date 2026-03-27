"use client";

import { useEffect, useMemo, useState } from "react";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { RoomCard } from "../RoomCard";
import { VenueCard } from "../VenueCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  buildAvailabilityUrl,
  extractList,
  amenityNames,
  amenityPills,
  roomImages,
  venueImages,
  formatShortDate,
} from "@/hooks/useRoomList";
import type { BookingKind } from "@/types/booking.types";

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
    rooms: any[];
    venues: any[];
  };
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

  // Remove any pre-selected rooms that the API marks as unavailable for the chosen dates
  useEffect(() => {
    if (!roomList.length || !formData.rooms.length) return;

    const availableRoomIds = new Set(
      roomList
        .filter((room: any) => room?.available !== false)
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

  const onSelectRoom = (room: any) => {
    const isAlreadySelected = formData.rooms.some(
      (r: any) => (r?.id ?? r) === room.id,
    );
    const updated = isAlreadySelected
      ? formData.rooms.filter((r: any) => (r?.id ?? r) !== room.id)
      : [...formData.rooms, room];
    setSelectedRooms(updated);
  };

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
    return `Availability for ${checkIn} – ${checkOut}. Pick one or more rooms for your stay.`;
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
                ? "Optional if you only need a venue: select one or more rooms for your stay."
                : "Select one or more rooms. You can add multiple rooms to your booking."}
            </p>
          </div>
          {roomsError && (
            <p className="text-red-600 text-sm py-2">
              Error loading rooms. Please try again.
            </p>
          )}
          {roomsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
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
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {roomList.map((room: any) => (
                <RoomCard
                  key={room.id}
                  id={room.id}
                  title={room.name || room.type || "Standard"}
                  type={room.type || "Standard"}
                  description={room.description || amenityNames(room.amenities)}
                  images={roomImages(room)}
                  size={room.size ?? "—"}
                  capacity={String(room.capacity ?? "—")}
                  includes={amenityNames(room.amenities)}
                  amenityPills={amenityPills(room.amenities)}
                  bed_specifications={room.bed_specifications}
                  bed_modifiers={room.bed_modifiers}
                  price={room.price ?? 0}
                  availability={room.available ?? false}
                  unavailabilityTitle={room.unavailability_title}
                  unavailabilityDetail={room.unavailability_detail}
                  selected={formData.rooms.some(
                    (r: any) => (r?.id ?? r) === room.id,
                  )}
                  onSelectRoom={() => onSelectRoom(room)}
                />
              ))}
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
