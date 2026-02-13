"use client";

import { useMemo } from "react";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { RoomCard } from "../RoomCard";
import { cn } from "@/lib/utils";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

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

/** Build rooms/venues API URL: by date range or all (is_all=1) */
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

/** Extract list from API response: { success, data } or raw array */
function extractList<T>(response: { data?: T[] } | T[] | undefined): T[] {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
}

/** Safely get amenity names (API may return { id, name } or string) */
function amenityNames(amenities: any[] | undefined): string {
  if (!Array.isArray(amenities) || amenities.length === 0) return "—";
  return (
    amenities
      .map((a: any) => (typeof a === "string" ? a : a?.name))
      .filter(Boolean)
      .join(", ") || "—"
  );
}

/** Build image list: featured + gallery, all strings */
function roomImages(room: any): string[] {
  const featured = room.featured_image;
  const gallery = Array.isArray(room.gallery) ? room.gallery : [];
  return [featured, ...gallery].filter((url): url is string => Boolean(url));
}

/** Build image list for venue: featured_image + gallery */
function venueImages(venue: any): string[] {
  const featured = venue.featured_image;
  const gallery = Array.isArray(venue.gallery) ? venue.gallery : [];
  return [featured, ...gallery].filter((url): url is string => Boolean(url));
}

function RoomCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="col-span-1 space-y-2">
          <Skeleton className="h-40 w-full rounded-md" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-16 rounded-sm" />
            ))}
          </div>
        </div>
        <div className="col-span-2 space-y-3">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-24 mt-4" />
        </div>
      </div>
    </div>
  );
}

function VenueCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="grid md:grid-cols-3 gap-4 items-start">
        <div className="col-span-1 space-y-2">
          <Skeleton className="h-40 w-full rounded-md" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-16 rounded-sm" />
            ))}
          </div>
        </div>
        <div className="col-span-2 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-5 w-20" />
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

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-gray-900">Rooms & Venues</h2>
        <p className="text-gray-600 text-sm">
          {checkIn && checkOut
            ? `Showing availability for ${checkIn} – ${checkOut}. Select one or more rooms and optionally venues.`
            : "Showing all rooms and venues. Select check-in/check-out on the home page for date-based availability."}
        </p>
      </div>

      {/* Rooms */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
          Rooms
        </h3>
        {roomsError && (
          <p className="text-red-600 text-sm py-2">
            Error loading rooms. Please try again.
          </p>
        )}
        {roomsLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <RoomCardSkeleton key={i} />
            ))}
          </div>
        ) : roomList.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 py-10 text-center text-gray-500">
            No rooms available for the selected dates.
          </div>
        ) : (
          <div className="space-y-6">
            {roomList.map((room: any) => (
              <RoomCard
                key={room.id}
                id={room.id}
                title={room.type || room.name || "Room"}
                description={amenityNames(room.amenities)}
                images={roomImages(room)}
                size="—"
                capacity={String(room.capacity ?? "—")}
                includes={amenityNames(room.amenities)}
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

      {/* Venues */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
          Venues
        </h3>
        {venuesError && (
          <p className="text-red-600 text-sm py-2">
            Error loading venues. Please try again.
          </p>
        )}
        {venuesLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <VenueCardSkeleton key={i} />
            ))}
          </div>
        ) : venueList.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 py-10 text-center text-gray-500">
            No venues available for the selected dates.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {venueList.map((venue: any) => {
              const selected = formData.venues.some(
                (v: any) => (v?.id ?? v) === venue.id,
              );
              const images = venueImages(venue);
              const mainImage = images[0];
              return (
                <div
                  key={venue.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectVenue(venue)}
                  onKeyDown={(e) => e.key === "Enter" && onSelectVenue(venue)}
                  className={cn(
                    "rounded-lg border-2 p-4 text-left transition-all cursor-pointer flex flex-col overflow-hidden",
                    selected
                      ? "border-green-500 bg-green-50/80 ring-2 ring-green-500 ring-offset-2"
                      : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/30",
                  )}>
                  <div className="grid md:grid-cols-3 gap-4 items-start">
                    <div className="col-span-1">
                      <OptimizedImage
                        src={mainImage ?? "/placeholder-room.jpg"}
                        alt={venue.name ?? "Venue"}
                        containerClassName="h-40 rounded-md"
                        className="rounded-md"
                      />
                      {images.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {images.slice(0, 4).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              loading="lazy"
                              className="w-16 h-12 object-cover rounded-sm border border-gray-200"
                              alt={`${venue.name ?? "Venue"}-thumb-${i}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 flex flex-col min-w-0">
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="font-semibold text-gray-900 capitalize">
                          {venue.name ?? "Venue"}
                        </h4>
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            selected
                              ? "border-green-600 bg-green-600 text-white"
                              : "border-gray-300 bg-gray-50",
                          )}>
                          {selected && (
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={3}
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </span>
                      </div>
                      {venue.description ? (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {venue.description}
                        </p>
                      ) : null}
                      <p className="text-sm text-gray-500 mt-2">
                        Capacity: {venue.capacity ?? "—"}
                      </p>
                      <p className="mt-2 font-semibold text-green-700">
                        {pricingFormat(String(venue.price ?? 0))}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
