import React, { useState, useMemo, useEffect } from "react";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { buildAvailabilityUrl, extractList } from "@/hooks/useRoomList";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { pluralize } from "@/lib/formatters/plural";
import type { FormData } from "@/types/booking.types";
import type { BookingKind } from "@/types/booking.types";
import {
  calculateTotalPrice,
  calculateVenuesLineTotal,
  venueEffectiveUnitPrice,
} from "@/lib/math/calculate";
import { Calendar, Pencil, Trash2, CheckCircle2, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarWithDisabledReasons } from "@/components/calendar/CalendarWithDisabledReasons";

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
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);
  const [openAddRoom, setOpenAddRoom] = useState(false);

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
  const availableRooms = availableRoomsList.filter(
    (r: any) => r.available !== false,
  );

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
    return Array.isArray(rows) ? rows : [];
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

  const todayStart = useMemo(
    () => new Date(new Date().setHours(0, 0, 0, 0)),
    [],
  );

  const cardBorder = { borderColor: "var(--color-sage-muted, #e5e7eb)" };
  const labelClass = "font-semibold opacity-90 text-sm";

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
    if (!updateFormData) return;

    if (
      bookingType !== "venue" &&
      new Date(tempCheckOut) <= new Date(tempCheckIn)
    ) {
      alert("Check-out must be after check-in");
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

  const handleDeleteRoom = (index: number) => {
    if (!setSelectedRooms) return;
    if (rooms.length === 1 && bookingType !== "both") {
      if (
        !confirm(
          "This is your last room. You cannot proceed without any rooms. Delete?",
        )
      )
        return;
    }
    const updated = rooms.filter((_, i) => i !== index);
    setSelectedRooms(updated);
    setEditingRoomIndex(null);
  };

  const handleSelectRoomVariant = (index: number, newRoom: any) => {
    if (!setSelectedRooms) return;
    const updated = [...rooms];
    updated[index] = newRoom;
    setSelectedRooms(updated);
    setEditingRoomIndex(null);
  };

  const handleDeleteVenue = (index: number) => {
    if (!setSelectedVenues) return;
    const updated = venues.filter((_, i) => i !== index);
    setSelectedVenues(updated);
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
          style={{ color: "var(--color-sage, #4a6741)" }}
        >
          {bookingKindLabel(bookingType)}
        </p>
        <h2
          className="font-display text-3xl sm:text-4xl font-bold tracking-tight"
          style={{ color: "var(--color-charcoal)" }}
        >
          Review Booking Details
        </h2>
        <p
          className="text-sm opacity-80 max-w-2xl"
          style={{ color: "var(--color-charcoal)" }}
        >
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
          {/* Dates Section */}
          <div
            className="rounded-xl border bg-white shadow-sm overflow-hidden"
            style={cardBorder}
          >
            <div
              className="px-5 py-3.5 font-semibold flex justify-between items-center text-white"
              style={{ backgroundColor: "var(--color-sage)" }}
            >
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
                  className="p-1.5 hover:bg-white/20 rounded-md transition-colors text-white flex items-center gap-1 text-xs"
                >
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
                        }
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none text-sm text-left"
                          >
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
                                const dateStr = date
                                  .toISOString()
                                  .split("T")[0];
                                setTempCheckIn(dateStr);
                                if (bookingType === "venue") {
                                  setTempCheckOut(dateStr);
                                }
                              }
                            }}
                            disabled={isCheckInDisabled}
                            blockedReasons={blockedReasons}
                            overlapInvalidReason="Your stay would include blocked dates. Pick another check-in or fewer days."
                            isOverlapInvalid={isCheckInOverlapInvalid}
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
                          }
                        >
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none text-sm text-left"
                            >
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
                                  const dateStr = date
                                    .toISOString()
                                    .split("T")[0];
                                  setTempCheckOut(dateStr);
                                }
                              }}
                              disabled={isCheckOutDisabled}
                              blockedReasons={blockedReasons}
                              overlapInvalidReason="Your stay would include blocked dates. Pick another check-in or fewer days."
                              isOverlapInvalid={isCheckOutOverlapInvalid}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDates(false);
                        setTempCheckIn(check_in);
                        setTempCheckOut(check_out);
                        setOpenCalendarField(null);
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm text-white rounded-md transition-colors bg-green-700 hover:bg-green-800"
                    >
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
                        {availableRooms.length}{" "}
                        {pluralize(availableRooms.length, "room")} available for
                        these dates.
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
              style={cardBorder}
            >
              <div
                className="px-5 py-3.5 font-semibold text-white flex justify-between items-center"
                style={{ backgroundColor: "var(--color-sage)" }}
              >
                <div className="flex items-center gap-3">
                  <span>Selected Rooms</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
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
                          {availableRooms.length > 0 ? (
                            availableRooms.map(
                              (availRoom: any, idx: number) => (
                                <button
                                  key={`${availRoom.id}-${idx}-add`}
                                  onClick={() => {
                                    setSelectedRooms([...rooms, availRoom]);
                                    setOpenAddRoom(false);
                                  }}
                                  className="w-full text-left p-2 hover:bg-sage-50 rounded-md border border-gray-200 hover:border-sage-300 transition"
                                >
                                  <div className="flex flex-wrap gap-1.5 mb-1">
                                    {availRoom.bed_specifications &&
                                    availRoom.bed_specifications.length > 0 ? (
                                      availRoom.bed_specifications.map(
                                        (spec: string, sIdx: number) => (
                                          <span
                                            key={sIdx}
                                            className="px-2 py-0.5 bg-sage-100 text-sage-700 text-xs font-semibold rounded-md"
                                          >
                                            {spec}
                                          </span>
                                        ),
                                      )
                                    ) : (
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                                        {availRoom.name ?? availRoom.type}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {availRoom.capacity && (
                                      <span>
                                        {availRoom.capacity} guests •{" "}
                                      </span>
                                    )}
                                    <span className="font-medium text-green-800">
                                      {pricingFormat(availRoom.price ?? 0)}
                                      /night
                                    </span>
                                  </p>
                                </button>
                              ),
                            )
                          ) : (
                            <p className="text-sm text-gray-500">
                              No available rooms for the selected dates.
                            </p>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="divide-y divide-gray-100">
                {rooms.map((room: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      {/* Display bed_specifications as badges */}
                      <div className="flex flex-wrap gap-2">
                        {room.bed_specifications &&
                        room.bed_specifications.length > 0 ? (
                          room.bed_specifications.map(
                            (spec: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-sage-50 text-sage-700 text-xs font-semibold rounded-md border border-sage-200"
                              >
                                {spec}
                              </span>
                            ),
                          )
                        ) : (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
                            {room.name ?? room.type ?? "Room"}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 pt-1">
                        {room.capacity && <span>{room.capacity} guests</span>}
                        <span className="font-medium text-green-800">
                          {pricingFormat(room.price ?? 0)} / night
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 border-t sm:border-none pt-3 sm:pt-0">
                      {editingRoomIndex === index ? (
                        <Popover
                          open={true}
                          onOpenChange={(o) => !o && setEditingRoomIndex(null)}
                        >
                          <PopoverTrigger asChild>
                            <span className="sr-only">Room selection menu</span>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="p-3 w-80">
                            <div className="space-y-3">
                              <p className="text-sm font-semibold text-gray-900">
                                Choose a different room:
                              </p>
                              <div className="space-y-2 max-h-80 overflow-y-auto">
                                {availableRooms.length > 0 ? (
                                  availableRooms.map(
                                    (availRoom: any, idx: number) => (
                                      <button
                                        key={`${availRoom.id}-${idx}`}
                                        onClick={() =>
                                          handleSelectRoomVariant(
                                            index,
                                            availRoom,
                                          )
                                        }
                                        className="w-full text-left p-2 hover:bg-sage-50 rounded-md border border-gray-200 hover:border-sage-300 transition"
                                      >
                                        <div className="flex flex-wrap gap-1.5 mb-1">
                                          {availRoom.bed_specifications &&
                                          availRoom.bed_specifications.length >
                                            0 ? (
                                            availRoom.bed_specifications.map(
                                              (spec: string, sIdx: number) => (
                                                <span
                                                  key={sIdx}
                                                  className="px-2 py-0.5 bg-sage-100 text-sage-700 text-xs font-semibold rounded-md"
                                                >
                                                  {spec}
                                                </span>
                                              ),
                                            )
                                          ) : (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                                              {availRoom.name ?? availRoom.type}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-600">
                                          {availRoom.capacity && (
                                            <span>
                                              {availRoom.capacity} guests •{" "}
                                            </span>
                                          )}
                                          <span className="font-medium">
                                            {pricingFormat(
                                              availRoom.price ?? 0,
                                            )}
                                            /night
                                          </span>
                                        </p>
                                      </button>
                                    ),
                                  )
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    No available rooms for the selected dates.
                                  </p>
                                )}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : null}

                      <button
                        onClick={() => setEditingRoomIndex(index)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition border border-blue-200"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Change Room
                      </button>

                      <button
                        onClick={() => handleDeleteRoom(index)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-md transition border border-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Venues Section */}
          {hasVenues && (
            <div
              className="rounded-xl border bg-white shadow-sm overflow-hidden"
              style={cardBorder}
            >
              <div
                className="px-5 py-3.5 font-semibold text-white flex justify-between items-center"
                style={{ backgroundColor: "var(--color-sage)" }}
              >
                <span>Selected Venues</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {venues.length}
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {venues.map((venue: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
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
                      onClick={() => handleDeleteVenue(index)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-md transition"
                    >
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
            <span className="text-gray-600 font-medium">Grand Total</span>
            <span className="text-2xl font-bold text-green-900">
              {pricingFormat(formData.grandTotalPrice ?? 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
