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
  const [recentlyUnselectedCount, setRecentlyUnselectedCount] = useState(0);
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

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2
          className="font-display text-3xl font-bold tracking-tight"
          style={{ color: "var(--color-charcoal)" }}
        >
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
          style={{ borderColor: "var(--color-sage-muted, #e5e7eb)" }}
        >
          <div className="grid grid-cols-3 gap-4 md:gap-8">
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
        </div>
      </div>

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
            Select one or more rooms. You can add multiple rooms to your
            booking.
          </p>
        </div>
        {roomsError && (
          <p className="text-red-600 text-sm py-2">
            Error loading rooms. Please try again.
          </p>
        )}
        {recentlyUnselectedCount > 0 && (
          <div
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
            style={{ color: "var(--color-charcoal)" }}
          >
            {recentlyUnselectedCount === 1
              ? "A room you selected became unavailable for these dates and was removed."
              : `${recentlyUnselectedCount} rooms you selected became unavailable for these dates and were removed.`}
          </div>
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
                title={room.name || "Room"}
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
            style={{ color: "var(--color-charcoal)" }}
          >
            Event spaces{" "}
            <span className="font-normal opacity-80">(optional)</span>
          </h3>
          <p
            className="text-sm mt-0.5 opacity-80"
            style={{ color: "var(--color-charcoal)" }}
          >
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
