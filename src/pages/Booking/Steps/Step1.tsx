"use client";

import { useMemo } from "react";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { RoomCard } from "../RoomCard";
import { VenueCard } from "../VenueCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ApiListResponse<T> {
  success?: boolean;
  data?: T[];
}

interface Props {
  formData: {
    check_in: string;
    check_out: string;
    rooms: any[];
    venues: any[];
  };
  setSelectedRooms: (rooms: any[]) => void;
  setSelectedVenues: (venues: any[]) => void;
}

function buildAvailabilityUrl(
  base: string,
  checkIn: string,
  checkOut: string,
): string {
  if (checkIn && checkOut) {
    return `${base}?check_in=${encodeURIComponent(checkIn)}&check_out=${encodeURIComponent(checkOut)}`;
  }
  return `${base}?is_all=1`;
}

function extractList<T>(response: { data?: T[] } | T[] | undefined): T[] {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
}

function amenityNames(amenities: any[] | undefined): string {
  if (!Array.isArray(amenities) || amenities.length === 0) return "—";
  return (
    amenities
      .map((a: any) => (typeof a === "string" ? a : a?.name))
      .filter(Boolean)
      .join(", ") || "—"
  );
}

/** Amenity names as array for room card pills */
function amenityPills(amenities: any[] | undefined): string[] {
  if (!Array.isArray(amenities) || amenities.length === 0) return [];
  return amenities
    .map((a: any) => (typeof a === "string" ? a : a?.name))
    .filter(Boolean);
}

function roomImages(room: any): string[] {
  const featured = room.featured_image;
  const gallery = Array.isArray(room.gallery) ? room.gallery : [];
  return [featured, ...gallery].filter((url): url is string => Boolean(url));
}

function venueImages(venue: any): string[] {
  const featured = venue.featured_image;
  const gallery = Array.isArray(venue.gallery) ? venue.gallery : [];
  return [featured, ...gallery].filter((url): url is string => Boolean(url));
}

/** Format date string for summary card (e.g. "Feb 26") */
function formatShortDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
  const checkIn = formData.check_in || "";
  const checkOut = formData.check_out || "";
  const roomsUrl = useMemo(
    () => buildAvailabilityUrl("/rooms", checkIn, checkOut),
    [checkIn, checkOut],
  );
  const venuesUrl = useMemo(
    () => buildAvailabilityUrl("/venues", checkIn, checkOut),
    [checkIn, checkOut],
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
    ["venues", checkIn, checkOut],
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

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2
          className="font-display text-3xl font-bold tracking-tight"
          style={{ color: "var(--color-charcoal)" }}>
          Choose your stay
        </h2>
        <p style={{ color: "var(--color-charcoal)" }}>
          {checkIn && checkOut
            ? `Availability for ${checkIn} – ${checkOut}. Pick one or more rooms for your stay, add event spaces if you need a venue.`
            : "Select your rooms below. Add check-in and check-out dates on the home page to see date-based availability."}
        </p>

        <br />

        {/* Booking summary card */}
        <div
          className="rounded-md border bg-white p-5 shadow-sm md:p-6"
          style={{ borderColor: "var(--color-sage-muted, #e5e7eb)" }}>
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            <div>
              <p
                className="text-sm font-medium opacity-80"
                style={{ color: "var(--color-charcoal)" }}>
                Rooms selected
              </p>
              <p
                className="mt-1 text-xl font-bold tracking-tight"
                style={{ color: "var(--color-charcoal)" }}>
                {roomCount}
              </p>
            </div>

            <div>
              <p
                className="text-sm font-medium opacity-80"
                style={{ color: "var(--color-charcoal)" }}>
                Check-in
              </p>
              <p
                className="mt-1 text-xl font-bold tracking-tight"
                style={{ color: "var(--color-charcoal)" }}>
                {formatShortDate(checkIn)}
              </p>
            </div>
            <div>
              <p
                className="text-sm font-medium opacity-80"
                style={{ color: "var(--color-charcoal)" }}>
                Check-out
              </p>
              <p
                className="mt-1 text-xl font-bold tracking-tight"
                style={{ color: "var(--color-charcoal)" }}>
                {formatShortDate(checkOut)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h3
            className="font-display text-xl font-semibold"
            style={{ color: "var(--color-charcoal)" }}>
            Where you&apos;ll stay
          </h3>
          <p
            className="text-sm mt-0.5 opacity-80"
            style={{ color: "var(--color-charcoal)" }}>
            Select one or more rooms. You can add multiple rooms to your
            booking.
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
            }}>
            No rooms available for the selected dates.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {roomList.map((room: any) => (
              <RoomCard
                key={room.id}
                id={room.id}
                title={room.type || room.name || "Room"}
                description={room.description || amenityNames(room.amenities)}
                images={roomImages(room)}
                size={room.size ?? "—"}
                capacity={String(room.capacity ?? "—")}
                includes={amenityNames(room.amenities)}
                amenityPills={amenityPills(room.amenities)}
                price={room.price ?? 0}
                selected={formData.rooms.some(
                  (r: any) => (r?.id ?? r) === room.id,
                )}
                onSelectRoom={() => onSelectRoom(room)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h3
            className="font-display text-xl font-semibold"
            style={{ color: "var(--color-charcoal)" }}>
            Event spaces{" "}
            <span className="font-normal opacity-80">(optional)</span>
          </h3>
          <p
            className="text-sm mt-0.5 opacity-80"
            style={{ color: "var(--color-charcoal)" }}>
            Add a venue if you need a dedicated space for events (e.g. meetings,
            celebrations).
          </p>
        </div>
        {venuesError && (
          <p className="text-red-600 text-sm py-2">
            Error loading venues. Please try again.
          </p>
        )}
        {venuesLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
            }}>
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
                selected={formData.venues.some(
                  (v: any) => (v?.id ?? v) === venue.id,
                )}
                onSelectVenue={() => onSelectVenue(venue)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
