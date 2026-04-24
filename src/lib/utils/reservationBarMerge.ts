import { defaultFormData } from "@/lib/constants/booking.constants";
import { formatDate } from "@/lib/formatters/formatDate";
import { getFromLocalStorage } from "@/lib/storage/localStorage";
import type { FormData } from "@/types/booking.types";
import { parseRoomTypeFilters } from "@/lib/utils/booking.utils";
import { deriveBookingKindFromCart, mergeBookingKindWithCart } from "@/lib/utils/bookingBarDates";

function normalizeStoredVenueEventType(
  v: string | undefined,
): FormData["venue_event_type"] {
  if (!v) return "";
  if (v === "seminar") return "meeting_staff";
  return v as FormData["venue_event_type"];
}

export function resolveBookingTypeInit(args: {
  reservationDate: ReturnType<typeof getFromLocalStorage>;
  storedFormData: Partial<FormData> | null | undefined;
}): FormData["booking_type"] {
  const explicit =
    (args.reservationDate?.booking_type as FormData["booking_type"]) ??
    args.storedFormData?.booking_type;
  return mergeBookingKindWithCart(
    explicit,
    deriveBookingKindFromCart(),
    defaultFormData.booking_type,
  );
}

/**
 * Merge `reservationDetails` with authoritative booking-bar fields from
 * `reservationDate`, matching {@link useBookingForm} initial state so cart sync
 * and React state agree on `days`, dates, and kind.
 */
export function mergeReservationDetailsWithActiveBar(
  stored: Partial<FormData> | null | undefined,
): FormData {
  const reservationDate = getFromLocalStorage("reservationDate");
  const bookingTypeInit = resolveBookingTypeInit({
    reservationDate,
    storedFormData: stored,
  });

  const base: FormData = {
    ...defaultFormData,
    ...(stored || {}),
  } as FormData;

  return {
    ...base,
    booking_type: bookingTypeInit,
    venue_event_date:
      (reservationDate?.venue_event_date &&
        formatDate(reservationDate.venue_event_date)) ||
      stored?.venue_event_date ||
      (bookingTypeInit === "both" && reservationDate?.check_in
        ? formatDate(reservationDate.check_in)
        : "") ||
      "",
    check_in:
      formatDate(reservationDate?.check_in) || stored?.check_in || "",
    check_out:
      formatDate(reservationDate?.check_out) || stored?.check_out || "",
    days: reservationDate?.days || stored?.days || 1,
    room_type_filters:
      bookingTypeInit === "venue"
        ? []
        : parseRoomTypeFilters(
            reservationDate?.room_type_filters ?? stored?.room_type_filters,
          ),
    venue_event_type: (() => {
      const v = normalizeStoredVenueEventType(
        stored?.venue_event_type as string | undefined,
      );
      if (v) return v;
      if (Array.isArray(stored?.venues) && stored.venues.length > 0) {
        return "wedding";
      }
      return defaultFormData.venue_event_type;
    })(),
  };
}
