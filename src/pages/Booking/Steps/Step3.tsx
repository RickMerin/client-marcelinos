import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { buildAvailabilityUrl, extractList } from "@/hooks/useRoomList";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { pluralize } from "@/lib/formatters/plural";
import type { FormData } from "@/types/booking.types";
import type { BookingKind, RoomTypeFilter } from "@/types/booking.types";
import {
  calculateTotalPrice,
  calculateVenuesLineTotal,
  venueEffectiveUnitPrice,
} from "@/lib/math/calculate";
import { Calendar, Pencil, Trash2, CheckCircle2, Plus, Minus, UserCheck, HousePlus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarWithDisabledReasons } from "@/components/calendar/CalendarWithDisabledReasons";
import {
  roomInventoryGroupKey,
  roomTypeAndBedTitle,
} from "@/lib/formatters/roomDisplayName";
import {
  isRoomInventoryAvailable,
  normalizeRoomTypeSlug,
  toBlockedDateKey,
  extractInventoryGroupAvailability,
  effectiveMaxUnitsForSubgroup,
} from "@/lib/utils/booking.utils";
import {
  stayNightRangeModifiers,
  BOOKING_STAY_RANGE_MODIFIERS_CLASS_NAMES,
} from "@/lib/calendar/stayRange";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  formData: FormData;
  updateFormData?: (updates: Partial<FormData>) => void;
  setSelectedRooms?: (rooms: any[]) => void;
  setSelectedVenues?: (venues: any[]) => void;
  onEdit: () => void;
  onProceed: () => void;
  selectedRoom?: {
    name: string;
    floor: string;
    bed_type: string;
    price: number;
  };
}

const ROOM_CHECK_IN = "12:00 PM";
const ROOM_CHECK_OUT = "10:00 AM";

/** Local calendar date as YYYY-MM-DD (avoid `toISOString()` shifting the day in non-UTC zones). */
function toDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Calendar days between two local dates (check-out − check-in). Same day → 0. */
function diffDays(a: Date, b: Date): number {
  const sa = startOfDay(a).getTime();
  const sb = startOfDay(b).getTime();
  return Math.round((sb - sa) / 86400000);
}

/**
 * Returns true if any calendar day in the booking window hits a blocked date.
 * - `nights`: `numberOfNights` is the stay length in nights; we check `nights + 1` calendar days
 *   (check-in day through morning check-out day), same as room stays.
 * - `single_calendar`: same-day event / venue — only the check-in calendar day is checked.
 */
function stayOverlapsBlocked(
  checkIn: Date,
  numberOfNights: number,
  blockedDates: Date[],
): boolean {
  const blockedSet = new Set(blockedDates.map(toDayKey));
  const start = new Date(
    checkIn.getFullYear(),
    checkIn.getMonth(),
    checkIn.getDate(),
  );
  for (let i = 0; i <= numberOfNights; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (blockedSet.has(toDayKey(d))) return true;
  }
  return false;
}

function bookingKindLabel(t: BookingKind): string {
  if (t === "venue") return "Venue only";
  if (t === "both") return "Room + venue";
  return "Rooms only";
}

const ROOM_TYPE_ORDER: RoomTypeFilter[] = ["standard", "family", "deluxe"];

function capacityLineForGroup(groupRooms: any[]): string | null {
  const caps = groupRooms
    .map((r) => Number(r.capacity))
    .filter((n) => !Number.isNaN(n) && n > 0);
  if (!caps.length) return null;
  const minCap = Math.min(...caps);
  const maxCap = Math.max(...caps);
  const gw = maxCap === 1 ? "guest" : "guests";
  return minCap === maxCap
    ? `${maxCap} ${gw}`
    : `${minCap}–${maxCap} ${gw}`;
}

export function Step3({
  formData,
  updateFormData,
  setSelectedRooms,
  setSelectedVenues,
}: Props) {
  const { check_in, check_out, days } = formData;
  const bookingType = formData.booking_type ?? "room";
  const rooms = formData.rooms ?? [];
  const venues = formData.venues ?? [];
  const hasRooms = rooms.length > 0;
  const hasVenues = venues.length > 0;

  // Editing state
  const [editingDates, setEditingDates] = useState(false);
  const [tempCheckIn, setTempCheckIn] = useState(check_in);
  const [tempCheckOut, setTempCheckOut] = useState(check_out);
  const [openCalendarField, setOpenCalendarField] = useState<string | null>(
    null,
  );
  const [openAddRoom, setOpenAddRoom] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    setTempCheckIn(formData.check_in);
    setTempCheckOut(formData.check_out);
  }, [formData.check_in, formData.check_out]);

  const roomsUrl = useMemo(
    () => buildAvailabilityUrl("/rooms", tempCheckIn, tempCheckOut),
    [tempCheckIn, tempCheckOut],
  );

  const { data: roomsResponse, isLoading: roomsLoading } = useApiQuery<any>(
    ["rooms", tempCheckIn, tempCheckOut],
    roomsUrl,
  );

  const availableRoomsList = extractList(roomsResponse);
  const inventoryGroupAvailability = useMemo(
    () => extractInventoryGroupAvailability(roomsResponse),
    [roomsResponse],
  );
  const availableRooms = availableRoomsList.filter((r: any) =>
    isRoomInventoryAvailable(r),
  );

  /** Total units left across layouts (room_lines + pivot demand); falls back to API room count. */
  const totalBookableUnitsHint = useMemo(() => {
    const rows = inventoryGroupAvailability;
    if (rows?.length) {
      return rows.reduce((acc, r) => acc + Math.max(0, r.remaining), 0);
    }
    return availableRooms.length;
  }, [inventoryGroupAvailability, availableRooms.length]);

  // ✅ Fetch blocked dates like FormWrapper does
  type BlockedDatesResponse = {
    success?: boolean;
    data?: Array<{ date: string; reason?: string | null }>;
    blocked_dates?: Array<{ date: string; reason?: string | null }>;
  };

  const { data: blockedDatesData } = useApiQuery<BlockedDatesResponse>(
    ["blocked-dates"],
    "/blocked-dates",
  );

  const blockedDateRows = useMemo(() => {
    const rows =
      blockedDatesData?.data ?? blockedDatesData?.blocked_dates ?? [];
    const list = Array.isArray(rows) ? rows : [];
    return list
      .map((row) => ({
        ...row,
        date: toBlockedDateKey(row.date),
      }))
      .filter((row) => row.date);
  }, [blockedDatesData]);

  const blockedDates = useMemo(() => {
    return blockedDateRows.map((d) => new Date(d.date + "T12:00:00"));
  }, [blockedDateRows]);

  const blockedReasons = useMemo(() => {
    const map: Record<string, string> = {};
    blockedDateRows.forEach((d) => {
      if (d?.date) {
        map[d.date] = d.reason ?? "Unavailable";
      }
    });
    return map;
  }, [blockedDateRows]);

  const stayRangeModifiers = useMemo(() => {
    if (bookingType === "venue" || !tempCheckIn || !tempCheckOut) {
      return undefined;
    }
    return stayNightRangeModifiers(tempCheckIn, tempCheckOut);
  }, [bookingType, tempCheckIn, tempCheckOut]);

  const todayStart = useMemo(
    () => new Date(new Date().setHours(0, 0, 0, 0)),
    [],
  );

  const cardBorder = { borderColor: "var(--color-sage-muted, #e5e7eb)" };
  const labelClass = "font-semibold opacity-90 text-sm";
  const safeNights = Math.max(1, days ?? 1);

  /** Check if a date would be disabled for check-in */
  const isCheckInDisabled = (date: Date): boolean => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (d < todayStart) return true;
    if (blockedDates.some((b) => toDayKey(b) === toDayKey(d))) return true;

    // If checkout is set, check that checkin is before checkout
    if (tempCheckOut) {
      const coDate = new Date(tempCheckOut);
      const coD = startOfDay(coDate);
      const numNights = diffDays(d, coD);
      if (numNights < 0) return true;
    }

    // Check for overlap with blocked dates
    const numNights = tempCheckOut
      ? diffDays(d, startOfDay(new Date(tempCheckOut)))
      : 0;
    return stayOverlapsBlocked(d, Math.max(0, numNights), blockedDates);
  };

  /** Check if a date would be disabled for check-out */
  const isCheckOutDisabled = (date: Date): boolean => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (d < todayStart) return true;
    if (blockedDates.some((b) => toDayKey(b) === toDayKey(d))) return true;

    if (!tempCheckIn) return true;
    const ciDate = new Date(tempCheckIn);
    const ciD = startOfDay(ciDate);
    const numNights = diffDays(ciD, d);
    if (numNights < 1) return true; // checkout must be at least 1 day after checkin

    return stayOverlapsBlocked(ciD, numNights, blockedDates);
  };

  /** Check if checkout would cause overlap with blocked dates */
  const isCheckOutOverlapInvalid = (date: Date): boolean => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (d < todayStart) return false;
    if (blockedDates.some((b) => toDayKey(b) === toDayKey(d))) return false;
    if (!tempCheckIn) return false;

    const ciDate = new Date(tempCheckIn);
    const ciD = startOfDay(ciDate);
    const numNights = diffDays(ciD, d);
    if (numNights < 1) return false;

    return stayOverlapsBlocked(ciD, numNights, blockedDates);
  };

  /** Check if checkin would cause overlap with blocked dates */
  const isCheckInOverlapInvalid = (date: Date): boolean => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (d < todayStart) return false;
    if (blockedDates.some((b) => toDayKey(b) === toDayKey(d))) return false;
    if (!tempCheckOut) return false;

    const coDate = new Date(tempCheckOut);
    const coD = startOfDay(coDate);
    const numNights = diffDays(d, coD);
    if (numNights < 0) return false;

    return stayOverlapsBlocked(d, numNights, blockedDates);
  };

  const handleDateUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setDateError(null);
    if (!updateFormData) return;

    if (
      bookingType !== "venue" &&
      new Date(tempCheckOut) <= new Date(tempCheckIn)
    ) {
      setDateError("Check-out must be after check-in");
      return;
    }

    let nextDays = days;
    if (bookingType === "venue") {
      setTempCheckOut(tempCheckIn); // Force same day for venues
      nextDays = 1;
    } else {
      nextDays = Math.ceil(
        (new Date(tempCheckOut).getTime() - new Date(tempCheckIn).getTime()) /
          (1000 * 60 * 60 * 24),
      );
    }

    updateFormData({
      check_in: tempCheckIn,
      check_out: bookingType === "venue" ? tempCheckIn : tempCheckOut,
      days: Math.max(1, nextDays),
    });

    setEditingDates(false);
    setOpenCalendarField(null);
  };

  /** At least one venue must remain when venues are required for the booking flow. */
  const canRemoveVenue =
    venues.length > 1 ||
    (bookingType === "both" && rooms.length > 0);

  const roomMatchesSubgroup = useCallback(
    (r: any, type: RoomTypeFilter, inventoryGroupKeyStr: string) => {
      if (normalizeRoomTypeSlug(r.type) !== type) return false;
      return roomInventoryGroupKey(r) === inventoryGroupKeyStr;
    },
    [],
  );

  /**
   * Same rules as Step 1: pool by room type + description (bed layout group);
   * add/remove concrete units by id when the quantity changes.
   */
  const setQuantityForSubgroup = useCallback(
    (type: RoomTypeFilter, inventoryGroupKeyStr: string, nextCount: number) => {
      if (!setSelectedRooms) return;
      const pool = availableRoomsList
        .filter(
          (r: any) =>
            normalizeRoomTypeSlug(r.type) === type &&
            roomInventoryGroupKey(r) === inventoryGroupKeyStr &&
            isRoomInventoryAvailable(r),
        )
        .sort((a: any, b: any) => a.id - b.id);
      const max = effectiveMaxUnitsForSubgroup(
        pool.length,
        inventoryGroupAvailability,
        type,
        inventoryGroupKeyStr,
      );
      const clamped = Math.max(0, Math.min(nextCount, max));
      const selectedOfSubgroup = rooms.filter((r: any) =>
        roomMatchesSubgroup(r, type, inventoryGroupKeyStr),
      );
      const current = selectedOfSubgroup.length;
      if (clamped === current) return;

      let nextRooms: any[];
      if (clamped < current) {
        const sortedSel = [...selectedOfSubgroup].sort(
          (a: any, b: any) => b.id - a.id,
        );
        const toRemove = new Set(
          sortedSel.slice(0, current - clamped).map((r: any) => r.id),
        );
        nextRooms = rooms.filter((r: any) => !toRemove.has(r?.id ?? r));
      } else {
        const selectedIds = new Set(rooms.map((r: any) => r?.id ?? r));
        const toAdd = pool
          .filter((r: any) => !selectedIds.has(r.id))
          .slice(0, clamped - current);
        nextRooms = [...rooms, ...toAdd];
      }

      if (nextRooms.length === 0) {
        if (bookingType === "room") return;
        if (bookingType === "both" && venues.length === 0) return;
      }
      setSelectedRooms(nextRooms);
    },
    [
      rooms,
      availableRoomsList,
      setSelectedRooms,
      roomMatchesSubgroup,
      bookingType,
      venues.length,
      inventoryGroupAvailability,
    ],
  );

  /** Selected rooms grouped like Step 1 (type + bed layout / description). */
  const groupedRoomRows = useMemo(() => {
    const map = new Map<
      string,
      { type: RoomTypeFilter; inventoryGroupKey: string; groupRooms: any[] }
    >();
    for (const r of rooms) {
      const type = normalizeRoomTypeSlug(r.type);
      if (!type) continue;
      const inventoryGroupKeyStr = roomInventoryGroupKey(r);
      const key = `${type}:${inventoryGroupKeyStr}`;
      if (!map.has(key)) {
        map.set(key, { type, inventoryGroupKey: inventoryGroupKeyStr, groupRooms: [] });
      }
      map.get(key)!.groupRooms.push(r);
    }
    for (const g of map.values()) {
      g.groupRooms.sort((a, b) => a.id - b.id);
    }
    return [...map.values()].sort((a, b) => {
      const ia = ROOM_TYPE_ORDER.indexOf(a.type);
      const ib = ROOM_TYPE_ORDER.indexOf(b.type);
      if (ia !== ib) return ia - ib;
      return a.inventoryGroupKey.localeCompare(b.inventoryGroupKey);
    });
  }, [rooms]);

  /**
   * Add Room popover: one row per type + bed layout (Standard, Family, Deluxe).
   */
  const addRoomInventoryGroups = useMemo(() => {
    const map = new Map<
      string,
      { type: RoomTypeFilter; inventoryGroupKey: string; pool: any[] }
    >();
    for (const r of availableRoomsList as any[]) {
      if (!isRoomInventoryAvailable(r)) continue;
      const type = normalizeRoomTypeSlug(r.type);
      if (!type) continue;
      const inventoryGroupKeyStr = roomInventoryGroupKey(r);
      const key = `${type}:${inventoryGroupKeyStr}`;
      if (!map.has(key)) {
        map.set(key, { type, inventoryGroupKey: inventoryGroupKeyStr, pool: [] });
      }
      map.get(key)!.pool.push(r);
    }
    for (const g of map.values()) {
      g.pool.sort((a: any, b: any) => a.id - b.id);
    }
    return [...map.values()].sort((a, b) => {
      const ia = ROOM_TYPE_ORDER.indexOf(a.type);
      const ib = ROOM_TYPE_ORDER.indexOf(b.type);
      if (ia !== ib) return ia - ib;
      return a.inventoryGroupKey.localeCompare(b.inventoryGroupKey);
    });
  }, [availableRoomsList]);

  /**
   * Add Room only lists groups not yet in the booking — avoid duplicating rows that
   * already appear under Selected Rooms (quantity is changed with +/− there).
   */
  const addRoomInventoryGroupsNotYetSelected = useMemo(() => {
    return addRoomInventoryGroups.filter((g) => {
      const selectedInGroup = rooms.filter((r: any) =>
        roomMatchesSubgroup(r, g.type, g.inventoryGroupKey),
      ).length;
      return selectedInGroup === 0;
    });
  }, [addRoomInventoryGroups, rooms, roomMatchesSubgroup]);

  /** Stepping down is blocked when it would leave no rooms while the booking still requires at least one. */
  const canDecrementRooms = useCallback(
    (selectedInGroup: number) =>
      selectedInGroup > 0 &&
      (rooms.length > 1 ||
        (bookingType === "both" && venues.length > 0)),
    [rooms.length, bookingType, venues.length],
  );

  const handleDeleteVenue = (index: number) => {
    if (!setSelectedVenues) return;
    const nextVenues = venues.filter((_, i) => i !== index);
    if (nextVenues.length === 0) {
      if (bookingType === "venue") return;
      if (bookingType === "both" && rooms.length === 0) return;
    }
    setSelectedVenues(nextVenues);
  };

  const stepIntro =
    bookingType === "venue"
      ? "Confirm your event date, venue, and guest details before payment."
      : bookingType === "both"
        ? "Confirm your room stay, venue (if any), and guest details before payment."
        : "Confirm your stay dates, rooms, and guest details before payment.";

  return (
		<div className="space-y-8">
			<div className="space-y-2">
				<p
					className="text-xs font-semibold uppercase tracking-wide"
					style={{ color: "var(--color-sage, #4a6741)" }}>
					{bookingKindLabel(bookingType)}
				</p>
				<h2
					className="font-display text-3xl sm:text-4xl font-bold tracking-tight"
					style={{ color: "var(--color-charcoal)" }}>
					Review Booking Details
				</h2>
				<p
					className="text-sm opacity-80 max-w-2xl"
					style={{ color: "var(--color-charcoal)" }}>
					{stepIntro} Modify your dates or rooms directly below if necessary.
				</p>

				{!hasRooms && bookingType !== "venue" && (
					<div className="p-3 bg-red-50 text-red-700 text-sm font-semibold rounded-md border border-red-200 mt-4">
						You currently have no rooms selected. Please add a room to proceed.
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(auto,380px)] gap-8">
				<div className="space-y-6">
					{/* Guest Details Section */}
					<div
						className="rounded-xl border bg-white shadow-sm overflow-hidden"
						style={cardBorder}>
						<div
							className="px-5 py-3.5 font-semibold text-white flex justify-between items-center"
							style={{ backgroundColor: "var(--color-sage)" }}>
							<div className="flex items-center gap-2">
								<UserCheck className="w-5 h-5" />
								<span>Guest Details</span>
							</div>
						</div>
						<div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<p className="text-sm font-medium text-gray-500">Name</p>
								<p className="font-sm text-gray-900">
									{formData.firstName}{" "}
									{formData.middleName ? `${formData.middleName} ` : ""}
									{formData.lastName}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">Gender</p>
								<p className="font-sm text-gray-900 capitalize">
									{formData.gender || "—"}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">Email</p>
								<p className="font-sm text-gray-900">{formData.email}</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">Phone</p>
								<p className="font-sm text-gray-900">{formData.phone}</p>
							</div>
							{formData.address && (
								<div className="sm:col-span-2">
									<p className="text-sm font-medium text-gray-500">Address</p>
									<p className="font-sm text-gray-900">
										{[
											formData.address,
											formData.street,
											formData.city,
											formData.state,
											formData.region,
											formData.zipCode,
										]
											.filter(Boolean)
											.join(", ")}
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Dates Section */}
					<div
						className="rounded-xl border bg-white shadow-sm overflow-hidden"
						style={cardBorder}>
						<div
							className="px-5 py-3.5 font-semibold flex justify-between items-center text-white"
							style={{ backgroundColor: "var(--color-sage)" }}>
							<div className="flex items-center gap-2">
								<Calendar className="w-5 h-5" />
								{bookingType === "venue"
									? "Event Date"
									: bookingType === "both"
										? "Room & Venue Stay"
										: "Selected Stay"}
							</div>
							{!editingDates && updateFormData && (
								<button
									onClick={() => setEditingDates(true)}
									className="p-1.5 hover:bg-white/20 rounded-md transition-colors text-white flex items-center gap-1 text-xs">
									<Pencil className="w-3.5 h-3.5" /> Edit
								</button>
							)}
						</div>

						<div className="p-5">
							{editingDates ? (
								<form onSubmit={handleDateUpdate} className="space-y-4">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										{/* Check-in Calendar */}
										<div className="space-y-1.5">
											<label className="text-sm font-medium text-gray-700">
												Check-in
											</label>
											<Popover
												open={openCalendarField === "check_in"}
												onOpenChange={(o) =>
													setOpenCalendarField(o ? "check_in" : null)
												}>
												<PopoverTrigger asChild>
													<button
														type="button"
														className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none text-sm text-left">
														{tempCheckIn
															? new Date(tempCheckIn).toLocaleDateString(
																	"en-US",
																	{
																		month: "short",
																		day: "numeric",
																		year: "numeric",
																	},
																)
															: "Select date"}
													</button>
												</PopoverTrigger>
												<PopoverContent align="start" className="p-0 w-auto">
													<CalendarWithDisabledReasons
														mode="single"
														selected={
															tempCheckIn ? new Date(tempCheckIn) : undefined
														}
														onSelect={(date) => {
															if (date) {
																const months = [
																	"Jan",
																	"Feb",
																	"Mar",
																	"Apr",
																	"May",
																	"Jun",
																	"Jul",
																	"Aug",
																	"Sep",
																	"Oct",
																	"Nov",
																	"Dec",
																];
																const dateStr = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
																setTempCheckIn(dateStr);
																setDateError(null);

																if (bookingType === "venue") {
																	setTempCheckOut(dateStr);
																}
															}
														}}
														disabled={isCheckInDisabled}
														blockedReasons={blockedReasons}
														overlapInvalidReason="Your stay would include blocked dates. Pick another check-in or fewer days."
														isOverlapInvalid={isCheckInOverlapInvalid}
														{...(stayRangeModifiers
															? {
																	modifiers: stayRangeModifiers,
																	modifiersClassNames:
																		BOOKING_STAY_RANGE_MODIFIERS_CLASS_NAMES,
																}
															: {})}
													/>
												</PopoverContent>
											</Popover>
										</div>

										{/* Check-out Calendar */}
										{bookingType !== "venue" && (
											<div className="space-y-1.5">
												<label className="text-sm font-medium text-gray-700">
													Check-out
												</label>
												<Popover
													open={openCalendarField === "check_out"}
													onOpenChange={(o) =>
														setOpenCalendarField(o ? "check_out" : null)
													}>
													<PopoverTrigger asChild>
														<button
															type="button"
															className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none text-sm text-left">
															{tempCheckOut
																? new Date(tempCheckOut).toLocaleDateString(
																		"en-US",
																		{
																			month: "short",
																			day: "numeric",
																			year: "numeric",
																		},
																	)
																: "Select date"}
														</button>
													</PopoverTrigger>
													<PopoverContent align="start" className="p-0 w-auto">
														<CalendarWithDisabledReasons
															mode="single"
															selected={
																tempCheckOut
																	? new Date(tempCheckOut)
																	: undefined
															}
															onSelect={(date) => {
																if (date) {
																	const months = [
																		"Jan",
																		"Feb",
																		"Mar",
																		"Apr",
																		"May",
																		"Jun",
																		"Jul",
																		"Aug",
																		"Sep",
																		"Oct",
																		"Nov",
																		"Dec",
																	];
																	const dateStr = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
																	setTempCheckOut(dateStr);
																	setDateError(null);
																}
															}}
															disabled={isCheckOutDisabled}
															blockedReasons={blockedReasons}
															overlapInvalidReason="Your stay would include blocked dates. Pick another check-in or fewer days."
															isOverlapInvalid={isCheckOutOverlapInvalid}
															{...(stayRangeModifiers
																? {
																		modifiers: stayRangeModifiers,
																		modifiersClassNames:
																			BOOKING_STAY_RANGE_MODIFIERS_CLASS_NAMES,
																	}
																: {})}
														/>
													</PopoverContent>
												</Popover>
											</div>
										)}
									</div>

									{dateError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                    {dateError}
                  </div>
                )}

									<div className="flex gap-2 justify-end pt-2">
										<button
											type="button"
											onClick={() => {
												setEditingDates(false);
												setTempCheckIn(check_in);
												setTempCheckOut(check_out);
												setOpenCalendarField(null);
												setDateError(null);
											}}
											className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
											Cancel
										</button>
										<button
											type="submit"
											className="px-4 py-2 text-sm text-white rounded-md transition-colors bg-green-700 hover:bg-green-800">
											Save Dates
										</button>
									</div>
								</form>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
									{bookingType !== "venue" && (
										<div>
											<p className={labelClass}>Nights</p>
											<p className="mt-1 font-medium">
												{days ?? "—"} {pluralize(days, "night")}
											</p>
										</div>
									)}
									<div>
										<p className={labelClass}>
											{bookingType === "venue" ? "Event Day" : "Check-in"}
										</p>
										<p className="mt-1 font-medium text-green-800">
											{check_in ? `${check_in}` : "—"}
										</p>
										<p className="text-xs text-gray-500 mt-0.5">
											{ROOM_CHECK_IN}
										</p>
									</div>
									{bookingType !== "venue" && (
										<div>
											<p className={labelClass}>Check-out</p>
											<p className="mt-1 font-medium text-green-800">
												{check_out ? `${check_out}` : "—"}
											</p>
											<p className="text-xs text-gray-500 mt-0.5">
												{ROOM_CHECK_OUT}
											</p>
										</div>
									)}
								</div>
							)}

							{/* Show availability for the selected dates! */}
							{editingDates && bookingType !== "venue" && (
								<div className="mt-6 pt-4 border-t border-gray-100">
									{roomsLoading ? (
										<div className="text-sm text-gray-500 flex items-center gap-2">
											<span className="w-4 h-4 rounded-full border-2 border-green-700 border-t-transparent animate-spin" />{" "}
											Gathering availability...
										</div>
									) : (
										<div className="space-y-3">
											<div className="flex items-center gap-2 text-sm font-medium text-green-800 bg-green-50 w-fit px-3 py-1.5 rounded-full border border-green-100">
												<CheckCircle2 className="w-4 h-4" />
												{totalBookableUnitsHint}{" "}
												{pluralize(totalBookableUnitsHint, "room")} available
												for these dates.
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Rooms Section */}
					{hasRooms && (
						<div
							className="rounded-xl border bg-white shadow-sm overflow-hidden"
							style={cardBorder}>
							<div
								className="px-5 py-3.5 font-semibold text-white flex justify-between items-center"
								style={{ backgroundColor: "var(--color-sage)" }}>
								<div className="flex items-center gap-3 min-w-0">
									<div className="flex items-center gap-2 min-w-0">
										<HousePlus className="w-5 h-5" />
										<span className="whitespace-nowrap truncate">
											Selected Rooms
										</span>
									</div>
									<span className="text-xs bg-white/20 px-2 py-0.5 rounded-full inline-flex items-center whitespace-nowrap leading-none">
										{rooms.length} {pluralize(rooms.length, "room")}
									</span>
								</div>

								{bookingType !== "venue" && setSelectedRooms && (
									<Popover open={openAddRoom} onOpenChange={setOpenAddRoom}>
										<PopoverTrigger asChild>
											<button className="py-1 px-2 hover:bg-white/20 rounded-md transition-colors text-white flex items-center gap-1 text-xs">
												<Plus className="w-3.5 h-3.5" /> Add Room
											</button>
										</PopoverTrigger>
										<PopoverContent align="end" className="p-3 w-80">
											<div className="space-y-3">
												<p className="text-sm font-semibold text-gray-900">
													Add a room:
												</p>
												<div className="space-y-2 max-h-80 overflow-y-auto">
													{addRoomInventoryGroupsNotYetSelected.length > 0 ? (
														addRoomInventoryGroupsNotYetSelected.map((g) => {
															const rep = g.pool[0];
															const prices = g.pool.map(
																(r: any) => Number(r.price) || 0,
															);
															const minP = Math.min(...prices);
															const maxP = Math.max(...prices);
															const sameP = minP === maxP;
															const caps = g.pool
																.map((r: any) => Number(r.capacity))
																.filter(
																	(n: number) => !Number.isNaN(n) && n > 0,
																);
															const capLine =
																caps.length > 0
																	? (() => {
																			const minC = Math.min(...caps);
																			const maxC = Math.max(...caps);
																			const gw =
																				maxC === 1 ? "guest" : "guests";
																			return minC === maxC
																				? `${maxC} ${gw}`
																				: `${minC}–${maxC} ${gw}`;
																		})()
																	: null;
															const selectedInGroup = rooms.filter((r: any) =>
																roomMatchesSubgroup(
																	r,
																	g.type,
																	g.inventoryGroupKey,
																),
															).length;
															const maxAdd = effectiveMaxUnitsForSubgroup(
																g.pool.length,
																inventoryGroupAvailability,
																g.type,
																g.inventoryGroupKey,
															);
															const canAddMore = selectedInGroup < maxAdd;

															return (
																<button
																	key={`${g.type}:${g.inventoryGroupKey}`}
																	type="button"
																	disabled={!canAddMore}
																	title={
																		!canAddMore
																			? "No more units available in this group for these dates."
																			: undefined
																	}
																	onClick={() => {
																		setQuantityForSubgroup(
																			g.type,
																			g.inventoryGroupKey,
																			selectedInGroup + 1,
																		);
																		setOpenAddRoom(false);
																	}}
																	className="w-full text-left p-2 rounded-md border border-gray-200 transition enabled:hover:bg-sage-50 enabled:hover:border-sage-300 disabled:cursor-not-allowed disabled:opacity-50">
																	<p className="text-sm font-semibold text-gray-900 leading-snug">
																		{roomTypeAndBedTitle(rep)}
																	</p>
																	<p className="text-xs text-gray-600 mt-1">
																		{capLine && <span>{capLine} • </span>}
																		<span className="font-medium text-green-800">
																			{sameP ? (
																				<>
																					{pricingFormat(minP)}
																					/night
																				</>
																			) : (
																				<>
																					{pricingFormat(minP)} –{" "}
																					{pricingFormat(maxP)}/night
																				</>
																			)}
																		</span>
																	</p>
																</button>
															);
														})
													) : (
														<p className="text-sm text-gray-500">
															{roomsLoading
																? "Loading…"
																: addRoomInventoryGroups.length === 0
																	? "No room groups available to add for these dates."
																	: "Every group is already in your selection above. Use +/− on each row to change quantities."}
														</p>
													)}
												</div>
											</div>
										</PopoverContent>
									</Popover>
								)}
							</div>

							<div className="divide-y divide-gray-100">
								{groupedRoomRows.map((group) => {
									const rep = group.groupRooms[0];
									const selectedCount = group.groupRooms.length;
									const nightlySelectedSubtotal = calculateTotalPrice(
										group.groupRooms,
									);
									const bookingSubtotal = nightlySelectedSubtotal * safeNights;
									const pool = availableRoomsList
										.filter(
											(r: any) =>
												normalizeRoomTypeSlug(r.type) === group.type &&
												roomInventoryGroupKey(r) === group.inventoryGroupKey &&
												isRoomInventoryAvailable(r),
										)
										.sort((a: any, b: any) => a.id - b.id);
									const maxAvailable = effectiveMaxUnitsForSubgroup(
										pool.length,
										inventoryGroupAvailability,
										group.type,
										group.inventoryGroupKey,
									);
									const prices = pool.map((r: any) => Number(r.price) || 0);
									const minPrice = prices.length ? Math.min(...prices) : 0;
									const maxPrice = prices.length ? Math.max(...prices) : 0;
									const samePrice = minPrice === maxPrice;
									const capLine = capacityLineForGroup(group.groupRooms);
									const canInc = selectedCount < maxAvailable;
									const canDec =
										canDecrementRooms(selectedCount) && selectedCount > 0;

									return (
										<div
											key={`${group.type}:${group.inventoryGroupKey}`}
											className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
											<div className="space-y-1.5 flex-1 min-w-0">
												<h4 className="text-lg font-semibold text-gray-900 truncate">
													{roomTypeAndBedTitle(rep)}
												</h4>
												<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm pt-0.5">
													{capLine && (
														<span className="text-gray-600 px-1.5 py-[1px] border border-gray-200 rounded bg-gray-50 text-xs font-medium">
															{capLine}
														</span>
													)}
													<span className="font-medium text-green-800">
														{samePrice ? (
															pricingFormat(minPrice)
														) : (
															<>
																{pricingFormat(minPrice)}
																<span className="font-normal text-gray-500 hover:text-gray-600">
																	{" "}
																	– {pricingFormat(maxPrice)}
																</span>
															</>
														)}
														<span className="text-gray-500 font-normal">
															{" "}
															/ night
														</span>
													</span>
												</div>

												{bookingType !== "venue" && (
													<div className="w-fit mt-1.5 px-3 py-1.5 rounded-md bg-stone-50 border border-stone-200 text-xs text-stone-600 whitespace-nowrap">
														<span className="font-semibold text-stone-700">
															{safeNights} {pluralize(safeNights, "night")}
														</span>{" "}
														× {pricingFormat(nightlySelectedSubtotal)} ={" "}
														<span className="font-semibold text-stone-900">
															{pricingFormat(bookingSubtotal)}
														</span>
													</div>
												)}
											</div>

											<div className="flex shrink-0 items-center gap-2 border-t sm:border-none pt-3 sm:pt-0">
												<Button
													type="button"
													variant="outline"
													size="icon"
													className="border-stone-200 bg-white shadow-sm hover:bg-stone-50 h-9 w-9"
													disabled={!canDec}
													onClick={() =>
														setQuantityForSubgroup(
															group.type,
															group.inventoryGroupKey,
															selectedCount - 1,
														)
													}
													aria-label={`Remove one ${roomTypeAndBedTitle(rep)}`}>
													<Minus className="size-4" />
												</Button>
												<span
													className="min-w-10 text-center font-display text-lg font-semibold tabular-nums text-stone-900"
													aria-live="polite">
													{selectedCount}
												</span>
												<Button
													type="button"
													variant="outline"
													size="icon"
													className={cn(
														"border-stone-200 bg-white shadow-sm hover:bg-stone-50 h-9 w-9",
														canInc &&
															"border-emerald-300/90 hover:border-emerald-400 hover:bg-emerald-50/90",
													)}
													disabled={!canInc}
													onClick={() =>
														setQuantityForSubgroup(
															group.type,
															group.inventoryGroupKey,
															selectedCount + 1,
														)
													}
													aria-label={`Add one ${roomTypeAndBedTitle(rep)}`}>
													<Plus className="size-4 text-emerald-700" />
												</Button>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Venues Section */}
					{hasVenues && (
						<div
							className="rounded-xl border bg-white shadow-sm overflow-hidden"
							style={cardBorder}>
							<div
								className="px-5 py-3.5 font-semibold text-white flex justify-between items-center"
								style={{ backgroundColor: "var(--color-sage)" }}>
								<span>Selected Venues</span>
								<span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
									{venues.length}
								</span>
							</div>
							<div className="divide-y divide-gray-100">
								{venues.map((venue: any, index: number) => (
									<div
										key={index}
										className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
										<div className="space-y-1">
											<span className="font-semibold text-gray-900 text-lg">
												{venue.name || "—"}
											</span>
											<div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 pt-1">
												{venue.capacity && (
													<span>Up to {venue.capacity} persons</span>
												)}
												<span className="font-medium text-green-800">
													{pricingFormat(
														venueEffectiveUnitPrice(
															venue,
															formData.venue_event_type || "wedding",
														),
													)}
												</span>
											</div>
										</div>

										<button
											type="button"
											disabled={!canRemoveVenue}
											title={
												!canRemoveVenue
													? "At least one venue must stay selected for this booking."
													: undefined
											}
											onClick={() => handleDeleteVenue(index)}
											className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-md transition disabled:pointer-events-none disabled:opacity-45">
											<Trash2 className="w-3.5 h-3.5" /> Remove
										</button>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Sidebar Summary Placeholder / Order Totals */}
				<div className="h-fit sticky top-24 bg-sage-muted/20 border border-sage-muted/50 rounded-2xl p-6">
					<h3 className="font-display font-semibold text-xl mb-4 text-gray-900 border-b pb-3">
						Booking Summary
					</h3>

					<div className="space-y-3 mb-6 text-sm">
						{bookingType !== "venue" && hasRooms && (
							<div className="flex justify-between">
								<span className="text-gray-600">
									Rooms ({days} {pluralize(days, "night")})
								</span>
								<span className="font-medium text-gray-900">
									{pricingFormat(calculateTotalPrice(rooms) * days)}
								</span>
							</div>
						)}
						{(bookingType === "venue" || bookingType === "both") &&
							hasVenues && (
								<div className="flex justify-between">
									<span className="text-gray-600">Venues</span>
									<span className="font-medium text-gray-900">
										{pricingFormat(
											calculateVenuesLineTotal(
												venues,
												formData.venue_event_type || "wedding",
											) * (bookingType === "both" ? days : 1),
										)}
									</span>
								</div>
							)}
					</div>

					<div className="border-t border-gray-200 pt-4 flex justify-between items-end">
						<span className="text-gray-600 font-medium">Total</span>
						<span className="text-2xl font-bold text-green-900">
							{pricingFormat(formData.grandTotalPrice ?? 0)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
