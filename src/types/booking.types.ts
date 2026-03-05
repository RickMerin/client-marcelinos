export type Gender = "Male" | "Female";

export interface BookingResponse {
  message: string;
  guest?: unknown;
  booking?: { reference_number: string; [key: string]: unknown };
  /** @deprecated use booking instead */
  bookings?: Array<{ reference_number: string; [key: string]: unknown }>;
  total_price?: number;
}

/** API 422 response when date range conflicts with existing booking */
export interface BookingConflictResponse {
  message: string;
  error?: "date_range_conflict";
  conflicts?: {
    rooms?: Array<{ id: number; name: string }>;
    venues?: Array<{ id: number; name: string }>;
  };
}

/** API response shape for GET /bookings/reference/:reference */
export interface BookingReferenceResponse {
  booking?: {
    reference_number: string;
    status?: string;
    check_in?: string;
    check_out?: string;
    no_of_days?: number;
    total_price?: string | number;
    created_at?: string;
    guest?: {
      first_name?: string;
      middle_name?: string | null;
      last_name?: string;
      email?: string;
      contact_num?: string;
      street?: string;
      barangay?: string;
      municipality?: string;
      province?: string;
      region?: string;
      [key: string]: unknown;
    };
    rooms?: Array<{
      name?: string;
      type?: string;
      capacity?: number;
      price?: string | number;
      [key: string]: unknown;
    }>;
    venues?: Array<{
      name?: string;
      capacity?: number;
      price?: string | number;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  qr_code_url?: string | null;
  /** True when a testimonial/site review has already been submitted for this booking. */
  has_testimonial?: boolean;
}

/** API response shape for GET /booking-receipt/:reference */
export interface BookingReceipt {
  /** QR code image URL for check-in */
  qr_code_url?: string | null;
  reference_number: string;
  created_at: string;
  booking_status: string;
  check_in: string;
  check_out: string;
  issued_on: string;
  nights: number;
  guest_name: string;
  guest_email: string;
  guest_contact: string;
  guest_address: string;
  /** Multiple rooms (API now returns array) */
  rooms?: Array<{
    name: string;
    type: string;
    capacity: number;
    price: number | string;
  }>;
  /** Multiple venues */
  venues?: Array<{ name: string; capacity: number; price: number | string }>;
  /** @deprecated use rooms instead */
  room?: {
    number: number | null;
    type: string;
    capacity: number;
    price: string;
  };
  subtotal: string;
  grand_total: string;
}

export interface FormData {
  reference_number?: string;
  current_step: number;
  check_in: string;
  check_out: string;
  days: number;
  rooms: any[];
  venues: any[];

  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: Gender | "";
  phone: string;
  email: string;
  address: string;

  region: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;

  category: string;
  newsletter: boolean;
  notifications: boolean;
  paymentMethod: string;

  totalPrice: number;
  grandTotalPrice: number;
}

export interface PersonalDetails {
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
}

export interface BookingPayload {
  reference_number?: string;
  check_in: string;
  check_out: string;
  days: number;
  rooms: number[];
  venues?: number[];
  total_price: number;
  grand_total_price?: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  contact_num: string;
  gender: Gender;
  is_international: boolean;
  country?: string | null;
  region?: string | null;
  province: string | null;
  municipality: string | null;
  barangay: string | null;
  street: string;
  address: string;
  zip_code: string;
  category: string;
  newsletter: boolean;
  notifications: boolean;
  city: string | null;
}
