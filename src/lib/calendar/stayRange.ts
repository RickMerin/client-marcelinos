import type { Matcher } from "react-day-picker";

function startOfDayLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (value == null) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? null : d;
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Modifiers for hotel stay nights in [check_in, check_out) — each calendar night
 * of the stay, for range highlighting on single-date pickers.
 */
export function stayNightRangeModifiers(
  checkIn: Date | string | null | undefined,
  checkOut: Date | string | null | undefined,
): Record<string, Matcher> | undefined {
  const ci = toDate(checkIn);
  const co = toDate(checkOut);
  if (!ci || !co) return undefined;
  const s = startOfDayLocal(ci);
  const e = startOfDayLocal(co);
  if (!(e > s)) return undefined;

  const nightCount = Math.round((e.getTime() - s.getTime()) / 86400000);
  if (nightCount < 1) return undefined;

  const lastNight = new Date(s);
  lastNight.setDate(lastNight.getDate() + nightCount - 1);

  const matchers: Record<string, Matcher> = {};

  matchers.booking_stay_single = (date: Date) =>
    nightCount === 1 && sameCalendarDay(date, s);

  matchers.booking_stay_start = (date: Date) =>
    nightCount > 1 && sameCalendarDay(date, s);

  matchers.booking_stay_end = (date: Date) =>
    nightCount > 1 && sameCalendarDay(date, lastNight);

  matchers.booking_stay_middle = (date: Date) => {
    if (nightCount <= 2) return false;
    const t = startOfDayLocal(date).getTime();
    const first = s.getTime();
    const last = lastNight.getTime();
    return t > first && t < last;
  };

  return matchers;
}

/**
 * Tailwind classes for stay range — one continuous mint band (no per-cell white
 * chips). Slight horizontal overlap hides gaps between rounded day buttons.
 */
const STAY_BAND = "bg-emerald-100 text-gray-800 border-0";

export const BOOKING_STAY_RANGE_MODIFIERS_CLASS_NAMES: Record<string, string> = {
  booking_stay_single: `rounded-lg ${STAY_BAND} font-medium aria-disabled:opacity-40`,
  /* Overlap neighbors by 1px so backgrounds meet and the bar does not “stutter” */
  booking_stay_start: `rounded-l-lg rounded-r-none ${STAY_BAND} relative z-[1] -mr-px aria-disabled:opacity-40`,
  booking_stay_middle: `rounded-none ${STAY_BAND} relative z-0 -mx-px w-[calc(100%+2px)] max-w-none aria-disabled:opacity-40`,
  booking_stay_end: `rounded-r-lg rounded-l-none ${STAY_BAND} relative z-[1] -ml-px aria-disabled:opacity-40`,
};
