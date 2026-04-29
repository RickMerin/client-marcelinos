import {
  DEFAULT_ROOM_TYPE_FILTERS,
  defaultFormData,
} from "@/lib/constants/booking.constants";
import {
  BOOKING_EXPIRATION,
  getFromLocalStorage,
  saveToLocalStorage,
} from "@/lib/storage/localStorage";
import type { BookingKind, FormData } from "@/types/booking.types";
import { alignFormDataToBookingType } from "@/lib/utils/booking.utils";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function diffDays(a: Date, b: Date): number {
  const sa = startOfDay(a).getTime();
  const sb = startOfDay(b).getTime();
  return Math.round((sb - sa) / 86400000);
}

/**
 * Calendar payload for `reservationDate` and for merging into `reservationDetails`.
 * Same shape as the original home booking bar.
 */
export function buildReservationDatePayload(
  kind: BookingKind,
  checkIn: Date,
  checkOut: Date,
): Record<string, unknown> | null {
  const ci = startOfDay(checkIn);
  const co = startOfDay(checkOut);
  if (co < ci) return null;
  const d = diffDays(ci, co);
  if (kind === "room" || kind === "both") {
    if (d < 1) return null;
  }
  let days: number;
  if (kind === "venue") {
    days = d + 1;
  } else {
    days = Math.max(1, d);
  }
  let venueEventDate: Date | undefined;
  if (kind === "both") {
    venueEventDate = ci;
  }
  return {
    booking_type: kind,
    days,
    check_in: checkIn.toISOString(),
    check_out: checkOut.toISOString(),
    ...(kind === "room" || kind === "both"
      ? { room_type_filters: [...DEFAULT_ROOM_TYPE_FILTERS] }
      : {}),
    ...(kind === "both" && venueEventDate
      ? { venue_event_date: venueEventDate.toISOString() }
      : {}),
  };
}

function mergeReservationDetailsWithBarPayload(
  kind: BookingKind,
  payload: NonNullable<ReturnType<typeof buildReservationDatePayload>>,
) {
  const stored = getFromLocalStorage("reservationDetails") as
    | Partial<FormData>
    | null;
  if (!stored) return;

  const merged: FormData = {
    ...defaultFormData,
    ...stored,
    current_step: 1,
    booking_type: kind,
    check_in: String(payload.check_in),
    check_out: String(payload.check_out),
    days: Number(payload.days),
  };
  if (
    "room_type_filters" in payload &&
    Array.isArray(payload.room_type_filters)
  ) {
    merged.room_type_filters = payload
      .room_type_filters as FormData["room_type_filters"];
  }
  if (kind === "both" && payload.venue_event_date) {
    merged.venue_event_date = String(payload.venue_event_date);
  } else if (kind === "room") {
    merged.venue_event_date = "";
  }

  const aligned = alignFormDataToBookingType(merged, kind);
  saveToLocalStorage("reservationDetails", aligned, BOOKING_EXPIRATION);
}

export function clearBarReservationInStorage(kind: BookingKind) {
  saveToLocalStorage(
    "reservationDate",
    { booking_type: kind, days: 0 },
    BOOKING_EXPIRATION,
  );
  window.dispatchEvent(new Event("reservation-date-updated"));
}

export function persistBarReservation(
  kind: BookingKind,
  checkIn: Date,
  checkOut: Date,
) {
  const payload = buildReservationDatePayload(kind, checkIn, checkOut);
  if (!payload) return;
  saveToLocalStorage("reservationDate", payload, BOOKING_EXPIRATION);
  mergeReservationDetailsWithBarPayload(
    kind,
    payload as NonNullable<ReturnType<typeof buildReservationDatePayload>>,
  );
  localStorage.removeItem("emailVerificationPending");
  window.dispatchEvent(new Event("reservation-date-updated"));
}
