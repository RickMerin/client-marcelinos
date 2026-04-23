import { useMemo } from "react";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { toBlockedDateKey } from "@/lib/utils/booking.utils";

/**
 * Blocked property dates for the home booking bar and stay-date sheet.
 * Shared with `BookingForm` and `StayDateRangeSheet` so default check-in
 * behavior stays aligned with `buildBookingBarFields`.
 */
export function useBookingBarBlockedSet() {
  const { data: blockedData, isLoading: isLoadingBlocked } = useApiQuery<{
    data?: Array<{ date?: string }>;
    blocked_dates?: Array<{ date?: string }>;
  }>(["blocked-dates"], "/blocked-dates");

  const blockedSet = useMemo(() => {
    const rows = blockedData?.data ?? blockedData?.blocked_dates ?? [];
    const list = Array.isArray(rows) ? rows : [];
    const keys = list
      .map((row: { date?: string }) =>
        row.date ? toBlockedDateKey(row.date) : null,
      )
      .filter((k): k is string => k != null);
    return new Set(keys);
  }, [blockedData]);

  return { blockedSet, isLoadingBlocked };
}
