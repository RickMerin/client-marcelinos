import { formatDate } from "@/lib/formatters/formatDate";
import { getFromLocalStorage } from "@/lib/storage/localStorage";

/**
 * Stay window for availability APIs — matches create-booking / Step1 (`formData.check_in` / `check_out`).
 * Prefers formatted strings from `reservationDetails`, else derives from `reservationDate` ISO strings.
 */
export function getActiveStayDates(): {
  checkIn: string;
  checkOut: string;
} | null {
  const details = getFromLocalStorage("reservationDetails") as
    | { check_in?: string; check_out?: string }
    | null;
  const ciD = details?.check_in?.trim();
  const coD = details?.check_out?.trim();
  if (ciD && coD) {
    return { checkIn: ciD, checkOut: coD };
  }

  const reservationDate = getFromLocalStorage("reservationDate") as {
    check_in?: string;
    check_out?: string;
  } | null;
  const ciR = reservationDate?.check_in?.trim();
  const coR = reservationDate?.check_out?.trim();
  if (reservationDate && ciR && coR) {
    const cin = reservationDate.check_in as string;
    const cout = reservationDate.check_out as string;
    return {
      checkIn: formatDate(cin),
      checkOut: formatDate(cout),
    };
  }

  return null;
}
