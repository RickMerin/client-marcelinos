import { FormData, BookingPayload } from "@/types/booking.types";

/**
 * Generates a unique reference ID for bookings
 * @returns A random uppercase alphanumeric string
 */
export const generateReferenceId = (): string => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${rand}`;
};

/**
 * Builds the booking payload for API submission
 * @param formData - The form data to transform
 * @returns The formatted booking payload
 */
export const buildBookingPayload = (formData: FormData): BookingPayload => {
  const isIntl = false;

  return {
    // Booking details
    reference_number: formData.reference_number,
    check_in: formData.check_in,
    check_out: formData.check_out,
    days: formData.days,
    rooms: formData.rooms.map((room) => room.id),
    total_price: formData.totalPrice,
    grand_total_price: formData.grandTotalPrice,

    // Guest details
    first_name: formData.firstName || "N/A",
    middle_name: formData.middleName || null,
    last_name: formData.lastName || "N/A",
    email: formData.email,
    contact_num: formData.phone || "0000000000",
    gender: formData.gender || "Male",
    is_international: isIntl,
    province: isIntl ? null : formData.state || "Unknown",
    municipality: isIntl ? null : formData.city || "Unknown",
    barangay: isIntl ? null : formData.address || "Unknown",

    // Address details
    street: formData.street,
    address: formData.address,
    zip_code: formData.zipCode,

    // Preferences
    category: formData.category,
    newsletter: formData.newsletter,
    notifications: formData.notifications,

    // International fields
    city: isIntl ? formData.city : null,
  };
};
