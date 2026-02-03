import { FormData, BookingPayload } from "@/types/booking.types";

/**
 * Generates a unique reference ID for bookings
 */
export const generateReferenceId = (): string => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${rand}`;
};

/** Normalize room/venue to id (object with id or number). */
const toId = (item: { id?: number } | number): number =>
  typeof item === "number" ? item : Number((item as { id: number }).id) || 0;

/**
 * Builds the booking payload for API submission (matches backend POST /bookings).
 * check_in/check_out must be in "M d, Y" format (e.g. Jan 20, 2026).
 */
export const buildBookingPayload = (formData: FormData): BookingPayload => {
  const isIntl = false;
  const roomIds = (formData.rooms || []).map(toId).filter(Boolean);
  const venueIds = (formData.venues || []).map(toId).filter(Boolean);

  return {
    reference_number: formData.reference_number ?? undefined,
    check_in: formData.check_in,
    check_out: formData.check_out,
    days: formData.days,
    rooms: roomIds,
    ...(venueIds.length > 0 && { venues: venueIds }),
    total_price: formData.totalPrice,
    grand_total_price: formData.grandTotalPrice,

    first_name: formData.firstName || "N/A",
    middle_name: formData.middleName || null,
    last_name: formData.lastName || "N/A",
    email: formData.email,
    contact_num: formData.phone || "0000000000",
    gender: formData.gender || "Male",
    is_international: isIntl,
    country: isIntl ? formData.address : "Philippines",
    province: isIntl ? null : formData.state || null,
    municipality: isIntl ? null : formData.city || null,
    barangay: isIntl ? null : formData.address || null,
    street: formData.street || "",
    address: formData.address || "",
    zip_code: formData.zipCode || "",
    category: formData.category || "",
    newsletter: formData.newsletter ?? false,
    notifications: formData.notifications ?? false,
    city: isIntl ? formData.city : null,
  };
};
