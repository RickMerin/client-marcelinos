import { z } from "zod";
import type { FormWrapperField } from "@/components/forms/FormWrapper";
import { getFromLocalStorage } from "@/lib/storage/localStorage";
import type { BookingKind } from "@/types/booking.types";
import { toBlockedDateKey } from "@/lib/utils/booking.utils";
import {
  clearBarReservationInStorage,
  persistBarReservation,
} from "./bookingBarStorage";

export { clearBarReservationInStorage, persistBarReservation } from "./bookingBarStorage";
export { buildReservationDatePayload } from "./bookingBarStorage";

export function deriveBookingKindFromCart(): BookingKind | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("cartItems");
    if (!raw) return null;
    const items = JSON.parse(raw) as unknown;
    if (!Array.isArray(items) || items.length === 0) return null;

    const hasVenue = items.some(
      (item: { itemType?: string }) => item?.itemType === "venue",
    );
    const hasRoom = items.some(
      (item: { itemType?: string }) => item?.itemType === "room",
    );

    if (hasVenue && hasRoom) return "both";
    if (hasVenue) return "venue";
    if (hasRoom) return "room";
    return null;
  } catch {
    return null;
  }
}

/**
 * Combine the guest's chosen booking type (from the home bar or stored form) with
 * the cart line types. A deliberate "Room + Venue" (`both`) is never narrowed
 * to `room` or `venue` just because the cart only has one line type. Cart can
 * still set `both` when it contains both room and venue lines.
 */
export function mergeBookingKindWithCart(
  explicitKind: BookingKind | undefined | null,
  cartKind: BookingKind | null,
  fallback: BookingKind = "room",
): BookingKind {
  if (explicitKind === "both") return "both";
  if (cartKind === "both") return "both";
  if (cartKind === "room" || cartKind === "venue") return cartKind;
  if (explicitKind === "room" || explicitKind === "venue") return explicitKind;
  return fallback;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(date: Date, numDays: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + numDays);
  return d;
}

export function diffDays(a: Date, b: Date): number {
  const sa = startOfDay(a).getTime();
  const sb = startOfDay(b).getTime();
  return Math.round((sb - sa) / 86400000);
}

export function buildSchema(kind: BookingKind) {
  const base = z.object({
    days: z.coerce.number().min(0).optional(),
    check_in: z.coerce.date({ error: "Select a date" }),
    check_out: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.coerce.date({ error: "Select check-out date" }).optional(),
    ),
    venue_event_date: z.coerce.date().optional(),
  });

  return base.superRefine((data, ctx) => {
    if (!data.check_out) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["check_out"],
        message: "Select check-out date",
      });
      return;
    }
    const ci = startOfDay(data.check_in);
    const co = startOfDay(data.check_out);
    if (co < ci) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["check_out"],
        message: "Check-out must be on or after check-in",
      });
      return;
    }
    const d = diffDays(ci, co);
    if (kind === "room" || kind === "both") {
      if (d < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["check_out"],
          message: "Check-out must be after check-in (at least one night)",
        });
      }
    }
  });
}

export function buildBookingBarFields(args: {
  kind: BookingKind;
  reservationDate: Record<string, unknown>;
  blockedSet: Set<string>;
}): FormWrapperField[] {
  const { kind, reservationDate: r, blockedSet } = args;

  let checkInVal: Date | "" = "";
  let checkOutVal: Date | "" = "";

  if (r.check_in) {
    checkInVal = new Date(r.check_in as string);
    checkOutVal = r.check_out ? new Date(r.check_out as string) : "";
  } else {
    const now = new Date();
    const currentHour = now.getHours();
    let ci = startOfDay(new Date());
    if (currentHour >= 21) {
      ci = addDays(ci, 1);
    }

    while (blockedSet.has(toBlockedDateKey(ci.toISOString()))) {
      ci = addDays(ci, 1);
    }
    checkInVal = ci;
    checkOutVal = addDays(ci, 1);
  }

  let daysStored = 0;
  if (checkInVal && checkOutVal) {
    const d = diffDays(startOfDay(checkInVal), startOfDay(checkOutVal));
    if (kind === "venue") {
      daysStored = d + 1;
    } else {
      daysStored = Math.max(1, d);
    }
  }

  const minOff = kind === "venue" ? 0 : 1;
  const daysLabel = kind === "venue" ? "Day(s)" : "Night(s)";
  const ciLabel = "Check-in";
  const coLabel = "Check-out";

  return [
    {
      name: "check_in",
      type: "calendar",
      calendarVariant: "stay",
      minCheckOutOffsetDays: minOff,
      label: ciLabel,
      placeholder: "Select Date",
      value: checkInVal,
      itemClassName: "booking-bar-field",
    },
    {
      name: "date_reset",
      type: "reset",
      itemClassName: "booking-bar-reset",
      className:
        "text-gold-light/60 hover:text-gold-light hover:bg-cream/5 border-cream/10 bg-transparent",
      label: "",
      onClick: (form: { setValue: (n: string, v: unknown) => void; clearErrors: (n: string[]) => void }) => {
        form.setValue("check_in", "");
        form.setValue("check_out", "");
        form.setValue("days", 0);
        form.clearErrors(["check_in", "check_out"]);
        clearBarReservationInStorage(kind);
      },
    },
    {
      name: "check_out",
      type: "calendar",
      calendarVariant: "stay",
      minCheckOutOffsetDays: minOff,
      label: coLabel,
      placeholder: "Select Date",
      value: checkOutVal,
      itemClassName: "booking-bar-field",
    },
    {
      name: "days",
      type: "display",
      label: daysLabel,
      value: daysStored,
      itemClassName: "booking-bar-field",
    },
  ];
}

type BarChangeFieldsValues = {
  check_in?: Date;
  check_out?: Date;
  days?: number;
  venue_event_date?: Date;
};

/**
 * Shared with BookingForm and StayDateRangeSheet `onChangeFields` to keep
 * check-in / check-out and localStorage in sync while editing.
 */
export function applyBookingBarOnChangeFields(
  kind: BookingKind,
  values: BarChangeFieldsValues,
): Partial<BarChangeFieldsValues> {
  const ci = values.check_in;
  const co = values.check_out;
  if (!ci) {
    clearBarReservationInStorage(kind);
    return {};
  }
  if (!co) {
    clearBarReservationInStorage(kind);
    return { days: 0 };
  }
  const ciD = startOfDay(new Date(ci));
  const coD = startOfDay(new Date(co));
  if (coD < ciD) {
    if (kind === "venue") {
      return { check_out: ciD, days: 1 };
    }
    return { check_out: addDays(ciD, 1), days: 1 };
  }
  const d = diffDays(ciD, coD);
  if (kind === "room" || kind === "both") {
    if (d < 1) {
      clearBarReservationInStorage(kind);
      return { days: 0 };
    }
  }
  let days: number;
  if (kind === "venue") {
    days = d + 1;
  } else {
    days = Math.max(1, d);
  }
  persistBarReservation(kind, new Date(ci), new Date(co));
  return { days };
}

/**
 * For SinglePage: resolve home-bar booking kind the same way as BookingForm
 * initial `kind` (cart + stored reservation + route fallback).
 */
export function resolveBookingBarKind(isVenuePage: boolean): BookingKind {
  const reservationDate =
    (getFromLocalStorage("reservationDate") as { booking_type?: BookingKind } | null) ??
    {};
  return mergeBookingKindWithCart(
    reservationDate.booking_type,
    deriveBookingKindFromCart(),
    isVenuePage ? "venue" : "room",
  );
}
