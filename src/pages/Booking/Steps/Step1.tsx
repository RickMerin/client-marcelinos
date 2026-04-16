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
  extractInventoryGroupAvailability,
  effectiveMaxUnitsForSubgroup,
  reconcileRoomsWithInventory,
  roomSelectionsDiffer,
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
		<div className="flex flex-col rounded-xl border border-sand-dark/50 bg-white shadow-sm overflow-hidden">
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

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Calendar days between check-in and check-out (check-out − check-in). Same day → 0. */
function diffDaysBetweenDateStrings(checkIn: string, checkOut: string): number | null {
  if (!checkIn?.trim() || !checkOut?.trim()) return null;
  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  if (Number.isNaN(ci.getTime()) || Number.isNaN(co.getTime())) return null;
  return Math.round(
    (startOfDay(co).getTime() - startOfDay(ci).getTime()) / 86400000,
  );
}

function VenueCardSkeleton() {
  return (
		<div className="flex flex-col rounded-xl border border-sand-dark/50 bg-white shadow-sm overflow-hidden">
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
	} = useApiQuery<ApiListResponse<any>>(
		["rooms", checkIn, checkOut],
		roomsUrl,
		{
			enabled: showRooms,
		},
	);
  const {
		data: venuesResponse,
		isLoading: venuesLoading,
		error: venuesError,
	} = useApiQuery<ApiListResponse<any>>(
		["venues", venueRangeStart, venueRangeEnd],
		venuesUrl,
		{ enabled: showVenues },
	);

  const roomList = useMemo(
    () => extractList<any>(roomsResponse),
    [roomsResponse],
  );

  const inventoryGroupAvailability = useMemo(
    () => extractInventoryGroupAvailability(roomsResponse),
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
      const max = effectiveMaxUnitsForSubgroup(
        pool.length,
        inventoryGroupAvailability,
        type,
        inventoryGroupKey,
      );
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
    [
      formData.rooms,
      roomsByType,
      setSelectedRooms,
      roomMatchesSubgroup,
      inventoryGroupAvailability,
    ],
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

  // Sync items from the cart if the user navigated from the single product page
  useEffect(() => {
    const rawCart = localStorage.getItem("cartItems");
    if (!rawCart) return; // Ignore if no cart items
    if (roomList.length === 0 && venueList.length === 0) return; // Wait until API responds
    
    try {
      const items = JSON.parse(rawCart);
      if (Array.isArray(items) && items.length > 0) {
        let roomsToAdd: any[] = [];
        let venuesToAdd: any[] = [];
        
        items.forEach((item: any) => {
          if (item.itemType === "room" && roomList.length > 0) {
            // Locate the exact room prototype using ID (could also match from single page)
            const exactRoom = roomList.find((r: any) => String(r.id) === String(item.id));
            if (exactRoom) {
              const t = normalizeRoomTypeSlug(item.type || exactRoom.type);
              const invk = roomInventoryGroupKey(exactRoom);
              
              const pool = roomList.filter(
                (r: any) =>
                  normalizeRoomTypeSlug(r.type) === t &&
                  roomInventoryGroupKey(r) === invk &&
                  isRoomInventoryAvailable(r) &&
                  !roomsToAdd.some((added) => String(added.id) === String(r.id))
              ).sort((a: any, b: any) => a.id - b.id);
              
              const needed = Number(item.quantity) || 1;
              const toAdd = pool.slice(0, needed);
              roomsToAdd.push(...toAdd);
            }
          } else if (item.itemType === "venue" && venueList.length > 0) {
            const exactVenue = venueList.find((v: any) => String(v.id) === String(item.id));
            if (exactVenue && !venuesToAdd.some((added) => String(added.id) === String(exactVenue.id))) {
               venuesToAdd.push(exactVenue);
            }
          }
        });

        // Push new rooms to form data
        if (roomsToAdd.length > 0) {
          const ids = new Set(formData.rooms.map((p: any) => String(p.id)));
          const newRooms = roomsToAdd.filter((n) => !ids.has(String(n.id)));
          if (newRooms.length > 0) {
            setSelectedRooms([...formData.rooms, ...newRooms]);
          }
        }
        
        // Push new venues to form data
        if (venuesToAdd.length > 0) {
          const ids = new Set(formData.venues.map((p: any) => String(p.id)));
          const newVenues = venuesToAdd.filter((n) => !ids.has(String(n.id)));
          if (newVenues.length > 0) {
            setSelectedVenues([...formData.venues, ...newVenues]);
          }
        }
        
      }
    } catch (e) {
      console.error("Failed to parse cartItems", e);
    }
  }, [roomList, venueList, setSelectedRooms, setSelectedVenues, formData.rooms, formData.venues]);

  // Remove pre-selected rooms that are unavailable for the current inventory response,
  // trim counts when room_lines on other bookings consume remaining units,
  // and refresh each selected row from the latest GET /rooms payload (rates stay in sync).
  useEffect(() => {
    if (!roomList.length || !formData.rooms.length) return;

    const reconciled = reconcileRoomsWithInventory(formData.rooms, roomList);

    const availableRoomIds = new Set(
      roomList
        .filter((room: any) => isRoomInventoryAvailable(room))
        .map((room: any) => room.id),
    );

    let filteredRooms = reconciled.filter((r: unknown) =>
      availableRoomIds.has((r as { id?: number })?.id ?? r),
    ) as any[];

    const igRows = extractInventoryGroupAvailability(roomsResponse);
    if (igRows?.length) {
      const byGroup = new Map<string, any[]>();
      for (const r of filteredRooms) {
        const t = normalizeRoomTypeSlug((r as { type?: string }).type);
        if (!t) continue;
        const invk = roomInventoryGroupKey(
          r as Parameters<typeof roomInventoryGroupKey>[0],
        );
        const gk = `${t}\0${invk}`;
        if (!byGroup.has(gk)) byGroup.set(gk, []);
        byGroup.get(gk)!.push(r);
      }
      filteredRooms = [];
      for (const [gk, list] of byGroup) {
        const [t, invk] = gk.split("\0");
        const pool = roomList.filter(
          (room: any) =>
            normalizeRoomTypeSlug(room.type) === t &&
            roomInventoryGroupKey(room) === invk &&
            isRoomInventoryAvailable(room),
        );
        const max = effectiveMaxUnitsForSubgroup(
          pool.length,
          igRows,
          t,
          invk,
        );
        list.sort((a: any, b: any) => a.id - b.id);
        filteredRooms.push(...list.slice(0, max));
      }
    }

    if (roomSelectionsDiffer(formData.rooms, filteredRooms)) {
      setSelectedRooms(filteredRooms);
      if (filteredRooms.length < formData.rooms.length) {
        setRecentlyUnselectedCount(formData.rooms.length - filteredRooms.length);
      }
      return;
    }

    if (recentlyUnselectedCount !== 0) {
      setRecentlyUnselectedCount(0);
    }
  }, [
    roomList,
    formData.rooms,
    roomsResponse,
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
  const staySpanDaysRaw = diffDaysBetweenDateStrings(checkIn, checkOut);
  const nightCount =
    staySpanDaysRaw === null ? null : Math.max(0, staySpanDaysRaw);
  const dayCountVenueOnly =
    staySpanDaysRaw === null ? null : Math.max(1, staySpanDaysRaw);

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
      return staySameDay || !checkOut
        ? `Single-day venue booking for ${checkIn}. Pick venues below.`
        : `Venue booking for ${checkIn} – ${checkOut}. Pick venues below.`;
    }
    return `Availability for ${checkIn} – ${checkOut}. Choose how many Standard, Family, or Deluxe rooms you need; specific units are assigned by staff at check-in.`;
  })();

  return (
		<div className="space-y-10">
			<div className="space-y-2">
				<p className="booking-funnel-eyebrow">
					{bookingType === "room" && "Rooms only"}
					{bookingType === "venue" && "Venue only"}
					{bookingType === "both" && "Room + venue"}
				</p>
				<h2 className="landing-section-title">{stepTitle}</h2>
				<p className="max-w-3xl text-ink-soft">{stepIntro}</p>

				<br />

				{/* Booking summary — labels match room vs venue vs combined */}
				<div className="booking-form-panel text-center">
					{bookingType === "venue" ? (
						<>
							<div className="grid grid-cols-2 gap-4 md:gap-8 lg:grid-cols-4">
								<div>
									<p className="text-sm font-medium opacity-80">
										Venues selected
									</p>
									<p className="mt-1 text-xl font-bold tracking-tight">
										{venueCount}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium opacity-80">Check-in</p>
									<p className="mt-1 text-xl font-bold tracking-tight">
										{formatShortDate(checkIn)}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium opacity-80">Check-out</p>
									<p className="mt-1 text-xl font-bold tracking-tight">
										{formatShortDate(checkOut)}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium opacity-80">
										No. of Day(s)
									</p>
									<p className="mt-1 text-xl font-bold tracking-tight">
										{dayCountVenueOnly ?? "—"}
									</p>
								</div>
							</div>
							<p
								className="mt-4 border-t pt-3 text-xs leading-relaxed opacity-85 text-ink-soft"
								style={{
									borderColor: "var(--color-sage-muted, #e5e7eb)",
								}}>
								{staySameDay ? (
									<>
										For single-day venue bookings, check-in and check-out fall
										on the{" "}
										<span className="font-semibold">same calendar day</span>{" "}
										(your event window). You are not selecting an overnight room
										stay here.
									</>
								) : (
									<>
										Venue days are counted from check-in through check-out;
										times follow property policy unless stated otherwise.
									</>
								)}
							</p>
						</>
					) : bookingType === "both" ? (
						<>
							<div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
								<div>
									<p className="text-sm font-medium opacity-80">
										Rooms selected
									</p>
									<p className="mt-1 text-xl font-bold tracking-tight">
										{roomCount}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium opacity-80">
										Venues selected
									</p>
									<p className="mt-1 text-xl font-bold tracking-tight">
										{venueCount}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium opacity-80">
										Room & venue dates
									</p>
									<p className="mt-1 text-lg font-bold tracking-tight sm:text-xl">
										{formatShortDate(checkIn)} – {formatShortDate(checkOut)}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium opacity-80">
										No. of Night(s)
									</p>
									<p className="mt-1 text-xl font-bold tracking-tight">
										{nightCount === null ? "—" : nightCount}
									</p>
								</div>
							</div>
							<p
								className="mt-4 border-t pt-3 text-xs leading-relaxed opacity-85 text-ink-soft"
								style={{
									borderColor: "var(--color-sage-muted, #e5e7eb)",
								}}>
								<span className="font-semibold">Room and venue</span> share the
								same check-in and check-out; venue line items are priced for the
								full length of your stay (e.g. 6 nights → 6 days of venue
								pricing).
							</p>
						</>
					) : (
						<>
							<div className="grid grid-cols-2 gap-4 md:gap-8 lg:grid-cols-4">
								<div>
									<p className="text-sm font-medium opacity-80">
										Rooms selected
									</p>
									<p className="mt-1 text-xl font-bold tracking-tight">
										{roomCount}
									</p>
								</div>

								<div>
									<p className="text-sm font-medium opacity-80">Check-in</p>
									<p className="mt-1 text-xl font-bold tracking-tight">
										{formatShortDate(checkIn)}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium opacity-80">Check-out</p>
									<p className="mt-1 text-xl font-bold tracking-tight">
										{formatShortDate(checkOut)}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium opacity-80">
										No. of Night(s)
									</p>
									<p className="mt-1 text-xl font-bold tracking-tight">
										{nightCount === null ? "—" : nightCount}
									</p>
								</div>
							</div>
							{staySameDay ? (
								<p
									className="mt-4 border-t pt-3 text-xs leading-relaxed opacity-85 text-ink-soft"
									style={{
										borderColor: "var(--color-sage-muted, #e5e7eb)",
									}}>
									Check-in and check-out show the same date because this stay is
									a single calendar day; actual times follow property policy
									(e.g. 12:00 PM in / 10:00 AM out).
								</p>
							) : (
								<p
									className="mt-4 border-t pt-3 text-xs leading-relaxed opacity-85 text-ink-soft"
									style={{
										borderColor: "var(--color-sage-muted, #e5e7eb)",
									}}>
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
							className="rounded-xl border-2 border-dashed py-12 text-center text-ink bg-cream"
							style={{
								borderColor: "var(--color-sage-muted)",
							}}>
							No rooms available for the selected dates.
						</div>
					) : typesWithInventory.length === 0 ? (
						<div
							className="rounded-xl border-2 border-dashed py-12 text-center text-ink bg-cream"
							style={{
								borderColor: "var(--color-sage-muted)",
							}}>
							No bookable rooms in Standard, Family, or Deluxe for these dates.
							Try different dates on the home page.
						</div>
					) : (
						<div className="space-y-12">
							{typesWithInventory.map((type) => {
								const subgroups = subgroupsByType.get(type) ?? [];
								const opt = ROOM_TYPE_FILTER_OPTIONS.find(
									(o) => o.value === type,
								);
								const typeLabel = opt?.label ?? type;
								return (
									<section key={type} className="space-y-5">
										<div
											className="border-b pb-3"
											style={{
												borderColor: "var(--color-sage-muted, #e5e7eb)",
											}}>
											<h4 className="font-display text-lg font-semibold tracking-tight sm:text-xl">
												{typeLabel}
											</h4>
											<p className="mt-1 max-w-2xl text-sm opacity-80">
												{subgroups.length > 1
													? "Each layout is booked separately. Use +/− up to availability for that layout."
													: "Use +/− to choose how many rooms you need, up to availability."}
											</p>
										</div>
										<div className="grid gap-6 sm:grid-cols-2">
											{subgroups.map(({ key, rooms: roomsInGroup }) => {
												const poolLen = roomsInGroup.filter((r: any) =>
													isRoomInventoryAvailable(r),
												).length;
												const maxAvailable = effectiveMaxUnitsForSubgroup(
													poolLen,
													inventoryGroupAvailability,
													type,
													key,
												);
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
						<h3 className="font-display text-xl font-semibold">
							Event spaces{" "}
							{bookingType === "both" && (
								<span className="font-normal opacity-80">(optional)</span>
							)}
						</h3>
						<p className="text-sm mt-0.5 opacity-80">
							{bookingType === "venue"
								? "Select one or more venues for your event date."
								: bookingType === "both"
									? "Optional if you only need rooms: add one or more venues for your event day."
									: "Add a venue if you need a dedicated space for events (e.g. meetings, celebrations)."}
						</p>
					</div>

					<div className="booking-form-panel">
						<p className="text-sm font-semibold mb-3">Event type</p>
						<p className="text-xs opacity-80 mb-4 max-w-2xl">
							Venue rates depend on event type. Each venue has its own wedding,
							birthday, and Meeting/Seminar prices (set in admin).
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
												? "border-sea bg-sage-muted font-medium"
												: "border-sand-dark/50 hover:border-sea/40"
										}`}>
										<input
											type="radio"
											name="venue_event_type"
											value={opt.value}
											checked={selected}
											onChange={() =>
												updateFormData({ venue_event_type: opt.value })
											}
											className="accent-sea"
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
						<div className="grid gap-6 sm:grid-cols-2">
							{[1, 2, 3].map((i) => (
								<VenueCardSkeleton key={i} />
							))}
						</div>
					) : venueList.length === 0 ? (
						<div
							className="rounded-xl border-2 border-dashed py-12 text-center text-ink bg-cream"
							style={{
								borderColor: "var(--color-sage-muted)",
							}}>
							No venues available for the selected dates.
						</div>
					) : (
						<div className="grid gap-6 sm:grid-cols-2">
							{venueList.map((venue: any) => {
								const eventType = (formData.venue_event_type || "wedding") as
									| VenueEventType
									| "";
								const displayPrice = venueEffectiveUnitPrice(venue, eventType);
								const priceTierLabel =
									eventType === "wedding"
										? "Wedding rate"
										: eventType === "birthday"
											? "Birthday rate"
											: "Meeting/Seminar rate";
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
