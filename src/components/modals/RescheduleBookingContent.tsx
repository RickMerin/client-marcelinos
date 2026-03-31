import { useState, useMemo, useCallback, useEffect } from "react";
import { useApiMutation } from "@/lib/api/mutations/useApiMutation";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { toast } from "@/lib/logger/toast";
import { ButtonLoader } from "@/components/ui/loader";
import { CalendarWithDisabledReasons } from "@/components/calendar/CalendarWithDisabledReasons";
import { format, addDays } from "date-fns";
import {
  CalendarDays,
  ArrowRight,
  Minus,
  Plus,
  AlertCircle,
} from "lucide-react";
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
  const durationLabel = isVenueBooking ? "Number of Days" : "Number of Nights";
  const formatDurationText = (count: number) =>
    `${count} ${isVenueBooking ? (count === 1 ? "day" : "days") : count === 1 ? "night" : "nights"}`;

  const rescheduleBooking = useApiMutation("patch");
  const sendOtp = useApiMutation<{ message?: string }>("post", {
    onError: (err: Error & { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.otp?.[0] ||
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

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (currentCheckIn) {
      const d = new Date(currentCheckIn);
      if (!isNaN(d.getTime())) return d;
    }
    return undefined;
  });

  type BlockedDatesResponse = {
    success?: boolean;
    data?: Array<{ date: string; reason?: string | null }>;
    blocked_dates?: Array<{ date: string; reason?: string | null }>;
  };

  const { data, isLoading: isDatesLoading } = useApiQuery<BlockedDatesResponse>(
    ["blocked-dates"],
    "/blocked-dates",
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

  const blockedDates = useMemo(() => {
    return blockedDateRows.map((d) => new Date(d.date + "T12:00:00"));
  }, [blockedDateRows]);

  const blockedReasons = useMemo(() => {
    const map: Record<string, string> = {};
    blockedDateRows.forEach((d) => {
      map[d.date] = d.reason ?? "Unavailable";
    });
    return map;
  }, [blockedDateRows]);

  const todayStart = useMemo(
    () => new Date(new Date().setHours(0, 0, 0, 0)),
    [],
  );

  const isDateDisabled = useCallback(
    (date: Date) => {
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      if (d < todayStart) return true;
      if (blockedDates.some((b) => toDayKey(b) === toDayKey(d))) return true;
      return stayOverlapsBlocked(d, days, blockedDates);
    },
    [todayStart, blockedDates, days],
  );

  const isOverlapInvalid = useCallback(
    (date: Date) => {
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      if (d < todayStart) return false;
      if (blockedDates.some((b) => toDayKey(b) === toDayKey(d))) return false;
      return stayOverlapsBlocked(d, days, blockedDates);
    },
    [todayStart, blockedDates, days],
  );

  const stayRangeModifiers = useMemo(() => {
    if (!selectedDate) return undefined;
    return stayNightRangeModifiers(selectedDate, addDays(selectedDate, days));
  }, [selectedDate, days]);

  const otpDigits = otp.replace(/\D/g, "").slice(0, 6);

  const handleSendOtp = async () => {
    if (!referenceNumber || resendIn > 0 || sendOtp.isPending) return;
    try {
      await sendOtp.mutateAsync({
        url: `/bookings/${referenceNumber}/otp/send`,
        body: { purpose: "reschedule" },
      });
      setOtpSent(true);
      setResendIn(OTP_RESEND_SECONDS);
      toast.success({ content: "Verification code sent to your mobile number." });
    } catch {
      /* toast in onError */
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate) {
      toast.error({ content: "Please select a new check-in date." });
      return;
    }

    if (stayOverlapsBlocked(selectedDate, days, blockedDates)) {
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
          check_in: toDayKey(selectedDate),
          check_out: toDayKey(addDays(selectedDate, days)),
          days: days,
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

  const newCheckOut = selectedDate ? addDays(selectedDate, days) : null;
  const currentCheckInDate = currentCheckIn ? new Date(currentCheckIn) : null;
  const currentCheckOutDate = currentCheckInDate
    ? addDays(currentCheckInDate, currentDays)
    : null;

  return (
    <div className="flex flex-col md:flex-row max-h-[85vh] overflow-y-auto md:overflow-hidden w-full bg-white/85 text-gray-800 backdrop-blur-md relative z-10">
      {/* Left side: Calendar Selection */}
      <div className="flex-1 p-6 md:p-8 md:border-r border-emerald-900/10 md:overflow-y-auto w-full">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-emerald-600" />
              Reschedule Booking
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Choose a new date and duration for your stay.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Days Counter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 block">
              {durationLabel}
            </label>
            <div className="flex items-center gap-3">
              <button
                disabled={days <= 1}
                onClick={() => setDays((d) => Math.max(1, d - 1))}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Decrease days"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <div className="text-lg font-semibold w-8 text-center tabular-nums">
                {days}
              </div>
              <button
                onClick={() => setDays((d) => d + 1)}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                title="Increase days"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          </div>

          {/* Calendar Picker */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 block">
              Select Check-in Date
            </label>
            <div className="border border-emerald-900/10 rounded-xl p-2 sm:p-4 shadow-sm bg-white/80 backdrop-blur-sm min-h-[350px] relative w-full overflow-hidden flex justify-center">
              {isDatesLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 backdrop-blur-[1px] rounded-xl">
                  <div className="flex flex-col items-center gap-2">
                    <span className="spinner-border spinner-border-sm text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">
                      Loading availability...
                    </span>
                  </div>
                </div>
              )}
              <CalendarWithDisabledReasons
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                disabled={isDateDisabled}
                blockedReasons={blockedReasons}
                isOverlapInvalid={isOverlapInvalid}
                className="mx-auto"
                {...(stayRangeModifiers
                  ? {
                      modifiers: stayRangeModifiers,
                      modifiersClassNames:
                        BOOKING_STAY_RANGE_MODIFIERS_CLASS_NAMES,
                    }
                  : {})}
              />
            </div>
            {selectedDate &&
              stayOverlapsBlocked(selectedDate, days, blockedDates) && (
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
      <div className="w-full md:w-80 bg-emerald-50/70 flex shrink-0 flex-col gap-6 justify-between p-6 md:p-8 backdrop-blur-md border-t md:border-t-0 border-emerald-900/10 md:overflow-y-auto">
        <div>
          <h3 className="text-lg font-bold text-emerald-950 mb-6 border-b border-emerald-900/10 pb-2">
            Stay Summary
          </h3>

          <div className="space-y-5">
            {/* Current Stay */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-emerald-900/10 shadow-sm">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                Original Stay
              </p>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 uppercase font-medium">
                    Check-in
                  </p>
                  <p className="font-semibold text-gray-700 text-sm mt-0.5">
                    {currentCheckInDate
                      ? format(currentCheckInDate, "MMM d, yyyy")
                      : "—"}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                <div className="flex-1 text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-medium">
                    Check-out
                  </p>
                  <p className="font-semibold text-gray-700 text-sm mt-0.5">
                    {currentCheckOutDate
                      ? format(currentCheckOutDate, "MMM d, yyyy")
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 text-right">
                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
                  {formatDurationText(currentDays)}
                </span>
              </div>
            </div>

            {/* New Stay */}
            <div
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${selectedDate ? "bg-emerald-50 border-emerald-200 shadow-sm" : "bg-white border-dashed border-gray-200 opacity-60"}`}
            >
              <p
                className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${selectedDate ? "text-emerald-700" : "text-gray-400"}`}
              >
                New Stay
              </p>

              {selectedDate ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-[10px] text-emerald-600/70 uppercase font-medium">
                        Check-in
                      </p>
                      <p className="font-bold text-emerald-900 text-sm mt-0.5">
                        {format(selectedDate, "MMM d, yyyy")}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-300 shrink-0" />
                    <div className="flex-1 text-right">
                      <p className="text-[10px] text-emerald-600/70 uppercase font-medium">
                        Check-out
                      </p>
                      <p className="font-bold text-emerald-900 text-sm mt-0.5">
                        {newCheckOut ? format(newCheckOut, "MMM d, yyyy") : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-emerald-100/50 text-right">
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-100/50 px-2 py-1 rounded-md">
                      {formatDurationText(days)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                  <CalendarDays className="w-6 h-6 opacity-30" />
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

        <div className="mt-8 space-y-3 pt-6 border-t border-gray-200">
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 text-left">
            <p className="text-xs font-bold text-emerald-900 mb-1">
              SMS verification
            </p>
            <p className="text-[11px] text-gray-600 mb-2">
              A code is sent to the mobile number on this booking. Enter it to
              confirm reschedule.
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
              stayOverlapsBlocked(selectedDate, days, blockedDates) ||
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
            className="w-full py-2 px-4 text-gray-600 hover:text-gray-900 rounded-xl font-semibold transition hover:bg-gray-100 disabled:opacity-50 text-sm"
          >
            Keep Original Dates
          </button>
        </div>
      </div>
    </div>
  );
}
