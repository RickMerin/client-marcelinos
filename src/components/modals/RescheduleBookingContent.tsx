import { useState, useMemo, useCallback, useEffect } from "react";
import { useApiMutation } from "@/lib/api/mutations/useApiMutation";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { toast } from "@/lib/logger/toast";
import { ButtonLoader } from "@/components/ui/loader";
import { CalendarWithDisabledReasons } from "@/components/calendar/CalendarWithDisabledReasons";
import { format, addDays } from "date-fns";
import { CalendarDays, Minus, Plus, AlertCircle } from "lucide-react";
import { BookingKind } from "@/types/booking.types";
import { toBlockedDateKey } from "@/lib/utils/booking.utils";
import {
  stayNightRangeModifiers,
  BOOKING_STAY_RANGE_MODIFIERS_CLASS_NAMES,
} from "@/lib/calendar/stayRange";

const OTP_RESEND_SECONDS = 60;

function toDayKey(d: Date): string {
  // Use date-fns format to prevent timezone offset issues (-1 day) from using toISOString
  return format(d, "yyyy-MM-dd");
}

function stayOverlapsBlocked(
  checkIn: Date,
  days: number,
  blockedDates: Date[],
): boolean {
  const blockedSet = new Set(blockedDates.map(toDayKey));
  const start = new Date(
    checkIn.getFullYear(),
    checkIn.getMonth(),
    checkIn.getDate(),
  );
  for (let i = 0; i <= days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (blockedSet.has(toDayKey(d))) return true;
  }
  return false;
}

export default function RescheduleBookingContent({
  referenceNumber,
  onClose,
  onSuccess,
  currentCheckIn,
  currentDays = 1,
  bookingType = "room",
}: {
  referenceNumber: string;
  onClose: () => void;
  onSuccess?: () => void;
  currentCheckIn?: string;
  currentDays?: number;
  bookingType?: BookingKind;
}) {
  const isVenueBooking = bookingType === "venue" || bookingType === "both";
  const allowsSameDayReschedule = bookingType === "venue";
  const durationLabel = isVenueBooking ? "Number of Days" : "Number of Nights";
  const formatDurationText = (count: number) =>
    `${count} ${isVenueBooking ? (count === 1 ? "day" : "days") : count === 1 ? "night" : "nights"}`;

  const rescheduleBooking = useApiMutation("patch");
  const sendOtp = useApiMutation<{ message?: string }>("post", {
    onError: (
      err: Error & {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      },
    ) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.otp?.[0] ||
        err?.response?.data?.errors?.email?.[0] ||
        err?.response?.data?.errors?.phone?.[0] ||
        "Could not send verification code.";
      toast.error({ content: msg });
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const [days, setDays] = useState(currentDays);

  // Venue-only uses inclusive dates: 1 day means check-in and check-out are the same day.
  const selectedStaySpanDays = useMemo(
    () => (allowsSameDayReschedule ? Math.max(0, days - 1) : days),
    [allowsSameDayReschedule, days],
  );

  const currentStaySpanDays = useMemo(
    () =>
      allowsSameDayReschedule ? Math.max(0, currentDays - 1) : currentDays,
    [allowsSameDayReschedule, currentDays],
  );

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (currentCheckIn) {
      const d = new Date(currentCheckIn);
      if (!isNaN(d.getTime())) return d;
    }
    return undefined;
  });

  const currentCheckInDate = useMemo(() => {
    if (!currentCheckIn) return null;
    const d = new Date(currentCheckIn);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [currentCheckIn]);

  const currentCheckOutDate = useMemo(() => {
    if (!currentCheckInDate) return null;
    return addDays(currentCheckInDate, currentStaySpanDays);
  }, [currentCheckInDate, currentStaySpanDays]);

  type BlockedDatesResponse = {
    success?: boolean;
    data?: Array<{ date: string; reason?: string | null }>;
    blocked_dates?: Array<{ date: string; reason?: string | null }>;
  };

  const { data, isLoading: isDatesLoading } = useApiQuery<BlockedDatesResponse>(
    ["blocked-dates", referenceNumber],
    `/blocked-dates?booking_reference=${referenceNumber}`,
  );

  const blockedDateRows = useMemo(() => {
    const rows = data?.data ?? data?.blocked_dates ?? [];
    const list = Array.isArray(rows) ? rows : [];
    return list
      .map((row) => ({
        ...row,
        date: toBlockedDateKey(row.date),
      }))
      .filter((row) => row.date);
  }, [data]);

  const currentStayDateKeys = useMemo(() => {
    if (!currentCheckInDate || !currentCheckOutDate) return new Set<string>();

    const keys = new Set<string>();
    const cursor = new Date(
      currentCheckInDate.getFullYear(),
      currentCheckInDate.getMonth(),
      currentCheckInDate.getDate(),
    );
    const last = new Date(
      currentCheckOutDate.getFullYear(),
      currentCheckOutDate.getMonth(),
      currentCheckOutDate.getDate(),
    );

    while (cursor <= last) {
      keys.add(toDayKey(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return keys;
  }, [currentCheckInDate, currentCheckOutDate]);

  const effectiveBlockedDateRows = useMemo(() => {
    if (currentStayDateKeys.size === 0) return blockedDateRows;
    return blockedDateRows.filter((row) => !currentStayDateKeys.has(row.date));
  }, [blockedDateRows, currentStayDateKeys]);

  const blockedDates = useMemo(() => {
    return effectiveBlockedDateRows.map((d) => new Date(d.date + "T12:00:00"));
  }, [effectiveBlockedDateRows]);

  const blockedReasons = useMemo(() => {
    const map: Record<string, string> = {};
    effectiveBlockedDateRows.forEach((d) => {
      map[d.date] = d.reason ?? "Unavailable";
    });
    return map;
  }, [effectiveBlockedDateRows]);

  const todayStart = useMemo(
    () => new Date(new Date().setHours(0, 0, 0, 0)),
    [],
  );

  const isDateDisabled = useCallback(
    (date: Date) => {
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      if (d < todayStart) return true;
      if (blockedDates.some((b) => toDayKey(b) === toDayKey(d))) return true;
      return stayOverlapsBlocked(d, selectedStaySpanDays, blockedDates);
    },
    [todayStart, blockedDates, selectedStaySpanDays],
  );

  const isOverlapInvalid = useCallback(
    (date: Date) => {
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      if (d < todayStart) return false;
      if (blockedDates.some((b) => toDayKey(b) === toDayKey(d))) return false;
      return stayOverlapsBlocked(d, selectedStaySpanDays, blockedDates);
    },
    [todayStart, blockedDates, selectedStaySpanDays],
  );

  const stayRangeModifiers = useMemo(() => {
    if (!selectedDate) return undefined;
    return stayNightRangeModifiers(
      selectedDate,
      addDays(selectedDate, selectedStaySpanDays),
    );
  }, [selectedDate, selectedStaySpanDays]);

  const otpDigits = otp.replace(/\D/g, "").slice(0, 6);

  const payloadCheckIn = selectedDate ? toDayKey(selectedDate) : "";
  const payloadCheckOut = selectedDate
    ? allowsSameDayReschedule && selectedStaySpanDays === 0
      ? // Keep same calendar day for venue 1-day bookings while satisfying strict "after" validation.
        `${payloadCheckIn} 23:59:59`
      : toDayKey(addDays(selectedDate, selectedStaySpanDays))
    : "";

  const handleSendOtp = async () => {
    if (!referenceNumber || resendIn > 0 || sendOtp.isPending) return;
    try {
      await sendOtp.mutateAsync({
        url: `/bookings/${referenceNumber}/otp/send`,
        body: { purpose: "reschedule" },
      });
      setOtpSent(true);
      setResendIn(OTP_RESEND_SECONDS);
      toast.success({ content: "Verification code sent to your email." });
    } catch {
      /* toast in onError */
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate) {
      toast.error({ content: "Please select a new check-in date." });
      return;
    }

    if (stayOverlapsBlocked(selectedDate, selectedStaySpanDays, blockedDates)) {
      toast.error({
        content:
          "Your selected stay overlaps with blocked dates. Please adjust your dates.",
      });
      return;
    }

    if (!otpSent || otpDigits.length !== 6) {
      toast.error({
        content: "Send the verification code and enter the 6-digit OTP first.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await rescheduleBooking.mutateAsync({
        url: `/bookings/${referenceNumber}/reschedule`,
        body: {
          check_in: payloadCheckIn,
          check_out: payloadCheckOut,
          days: days,
          ...(allowsSameDayReschedule
            ? {
                booking_type: "venue",
                venue_event_date: payloadCheckIn,
              }
            : {}),
          otp: otpDigits,
        },
      });

      toast.success({ content: "Booking rescheduled successfully!" });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error({
        content:
          error?.response?.data?.message ||
          "Failed to reschedule booking. It may overlap with blocked dates.",
      });
      console.error("Reschedule Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const newCheckOut = selectedDate
    ? addDays(selectedDate, selectedStaySpanDays)
    : null;

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-260 max-h-[90vh] flex-col overflow-y-auto rounded-2xl border border-cream/15 bg-dark/95 text-cream backdrop-blur-md xl:max-h-[78vh] xl:flex-row xl:overflow-hidden">
      {/* Left side: Calendar Selection */}
      <div className="flex-1 w-full border-cream/15 p-5 xl:border-r xl:overflow-y-auto xl:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-white md:text-2xl">
              <CalendarDays className="h-5 w-5 text-gold-light md:h-6 md:w-6" />
              Reschedule Booking
            </h2>
            <p className="mt-1 text-sm text-cream/80">
              Choose a new date and duration for your stay.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Calendar Picker */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-cream/90">
              Select Check-in Date
            </label>
            <div className="relative overflow-hidden rounded-xl border border-emerald-900/20 bg-white/92 p-2 text-gray-900 shadow-sm backdrop-blur-sm sm:p-4">
              {isDatesLoading && (
                <div className="absolute inset-0 z-10 rounded-xl bg-white/60 backdrop-blur-[1px] p-3 sm:p-4">
                  <div className="grid h-full w-full gap-4 animate-pulse lg:grid-cols-[minmax(0,1.7fr)_minmax(14rem,0.75fr)]">
                    <div className="min-h-0 rounded-lg border border-slate-200/70 bg-white/70 p-3">
                      <div className="mx-auto mb-3 h-5 w-32 rounded bg-slate-200/60" />
                      <div className="mb-3 grid grid-cols-7 gap-2">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div
                            key={`weekday-${i}`}
                            className="h-3 rounded bg-slate-200/60"
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 35 }).map((_, i) => (
                          <div
                            key={`day-${i}`}
                            className="h-8 rounded-md bg-slate-200/60"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex min-h-0 flex-col gap-3 lg:justify-between">
                      <div className="rounded-lg border border-slate-200/70 bg-white/70 p-3">
                        <div className="mb-3 h-4 w-16 rounded bg-slate-200/60" />
                        <div className="space-y-2">
                          <div className="h-6 w-full rounded-full bg-slate-200/60" />
                          <div className="h-6 w-full rounded-full bg-slate-200/60" />
                          <div className="h-6 w-full rounded-full bg-slate-200/60" />
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200/70 bg-white/70 p-3 text-center">
                        <div className="mx-auto mb-2 h-3 w-24 rounded bg-slate-200/60" />
                        <div className="inline-flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-200/60" />
                          <div className="h-6 w-8 rounded bg-slate-200/60" />
                          <div className="h-8 w-8 rounded-full bg-slate-200/60" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(14rem,0.75fr)] lg:items-stretch">
                <div className="min-w-0 flex justify-center text-gray-900">
                  <CalendarWithDisabledReasons
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => d && setSelectedDate(d)}
                    disabled={isDateDisabled}
                    blockedReasons={blockedReasons}
                    isOverlapInvalid={isOverlapInvalid}
                    reasonStyle="soft"
                    className="mx-auto text-gray-900"
                    {...(stayRangeModifiers
                      ? {
                          modifiers: stayRangeModifiers,
                          modifiersClassNames:
                            BOOKING_STAY_RANGE_MODIFIERS_CLASS_NAMES,
                        }
                      : {})}
                  />
                </div>

                <div className="flex h-full flex-col gap-3 text-[11px] leading-relaxed text-gray-600 lg:justify-between">
                  <div className="rounded-lg border border-emerald-900/20 bg-emerald-900/5 px-3 py-2.5">
                    <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                      <p className="font-semibold text-gray-700">Legend</p>
                      <p className="text-[10px] text-gray-500">
                        Tap a disabled date for details
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-1 text-rose-900 ring-1 ring-inset ring-rose-200">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        Blocked or Fully Booked
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-emerald-900 ring-1 ring-inset ring-emerald-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Your selected stay
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-1 text-amber-900 ring-1 ring-inset ring-amber-200">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Would overlap this stay
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-emerald-900/20 bg-emerald-900/5 px-3 py-2.5 shadow-sm text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      {durationLabel}
                    </p>
                    <div className="mt-1 inline-flex items-center justify-center gap-2">
                      <button
                        disabled={days <= 1}
                        onClick={() => setDays((d) => Math.max(1, d - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Decrease days"
                      >
                        <Minus className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                      <div className="w-8 text-center text-base font-semibold tabular-nums text-gray-800">
                        {days}
                      </div>
                      <button
                        onClick={() => setDays((d) => d + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 transition-colors hover:bg-gray-50"
                        title="Increase days"
                      >
                        <Plus className="h-3.5 w-3.5 text-emerald-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {selectedDate &&
              stayOverlapsBlocked(
                selectedDate,
                selectedStaySpanDays,
                blockedDates,
              ) && (
                <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg font-medium flex items-start gap-2 mt-2 border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    This stay overlaps with blocked dates. Try fewer days or a
                    different check-in date.
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Right side: Summary & Action */}
      <div className="w-full bg-dark/75 flex shrink-0 flex-col gap-5 justify-between p-5 xl:w-72 xl:p-6 backdrop-blur-md border-t xl:border-t-0 border-cream/15 xl:overflow-y-auto">
        <div>
          <h3 className="text-base font-bold text-white mb-4 border-b border-cream/15 pb-2 lg:text-lg">
            Stay Summary
          </h3>

          <div className="space-y-4">
            {/* Current Stay */}
            <div className="rounded-lg border border-emerald-900/20 bg-white/85 p-3 shadow-sm backdrop-blur-sm lg:p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Original Stay
                </p>
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  {formatDurationText(currentDays)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase text-gray-500">
                    Check-in
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-gray-700">
                    {currentCheckInDate
                      ? format(currentCheckInDate, "MMM d, yyyy")
                      : "—"}
                  </p>
                </div>
                <div className="min-w-0 text-right">
                  <p className="text-[10px] font-medium uppercase text-gray-500">
                    Check-out
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-gray-700">
                    {currentCheckOutDate
                      ? format(currentCheckOutDate, "MMM d, yyyy")
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* New Stay */}
            <div
              className={`rounded-lg border p-3 transition-all duration-200 lg:p-4 ${selectedDate ? "border-emerald-800/35 bg-emerald-100/70 shadow-sm" : "border-dashed border-emerald-900/20 bg-white/85 opacity-60"}`}
            >
              <p
                className={`mb-2 text-[10px] font-bold uppercase tracking-wider ${selectedDate ? "text-emerald-700" : "text-gray-400"}`}
              >
                New Stay
              </p>

              {selectedDate ? (
                <>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="sr-only">New stay duration</span>
                    <span className="ml-auto rounded-md bg-emerald-100/50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {formatDurationText(days)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase text-emerald-600/70">
                        Check-in
                      </p>
                      <p className="mt-0.5 truncate text-sm font-bold text-emerald-900">
                        {format(selectedDate, "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="min-w-0 text-right">
                      <p className="text-[10px] font-medium uppercase text-emerald-600/70">
                        Check-out
                      </p>
                      <p className="mt-0.5 truncate text-sm font-bold text-emerald-900">
                        {newCheckOut ? format(newCheckOut, "MMM d, yyyy") : "—"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-3 text-center text-sm text-gray-400 lg:py-4">
                  <CalendarDays className="h-5 w-5 opacity-30 lg:h-6 lg:w-6" />
                  <p className="text-xs leading-tight">
                    Select a date from
                    <br />
                    the calendar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3 border-t border-cream/15 pt-5 lg:mt-8 lg:pt-6">
          <div className="rounded-lg border border-emerald-800/30 bg-emerald-100/55 p-3 text-left lg:p-4">
            <p className="mb-1 text-xs font-bold text-emerald-900">
              Email verification
            </p>
            <p className="text-[11px] text-gray-600 mb-2">
              A code is sent to the email on this booking. Enter it to confirm
              reschedule.
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={
                  !referenceNumber ||
                  resendIn > 0 ||
                  sendOtp.isPending ||
                  isSubmitting
                }
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendOtp.isPending ? (
                  <span className="inline-flex items-center gap-1">
                    <ButtonLoader
                      className="border-white/40 border-t-white"
                      size="sm"
                    />
                    Sending…
                  </span>
                ) : resendIn > 0 ? (
                  `Resend in ${resendIn}s`
                ) : (
                  "Send verification code"
                )}
              </button>
              {otpSent && (
                <span className="text-[10px] font-medium text-emerald-700">
                  Code sent.
                </span>
              )}
            </div>
            <label className="block">
              <span className="sr-only">6-digit code</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
              />
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !selectedDate ||
              stayOverlapsBlocked(
                selectedDate,
                selectedStaySpanDays,
                blockedDates,
              ) ||
              !otpSent ||
              otpDigits.length !== 6 ||
              sendOtp.isPending
            }
            className="w-full py-3.5 px-4 bg-emerald-600 text-white rounded-xl font-bold shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <>
                <ButtonLoader
                  className="border-white/40 border-t-white"
                  size="sm"
                />
                Processing...
              </>
            ) : (
              "Confirm Reschedule"
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full py-2 px-4 text-cream hover:text-white rounded-xl font-semibold transition hover:bg-cream/10 disabled:opacity-50 text-sm"
          >
            Keep Original Dates
          </button>
        </div>
      </div>
    </div>
  );
}
