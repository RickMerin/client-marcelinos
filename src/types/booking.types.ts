export type Gender = "Male" | "Female";

export interface BookingResponse {
  message: string;
  data: {
    id: number;
  };
}

export interface FormData {
  reference_number?: string;
  current_step: number;
  check_in: string;
  check_out: string;
  days: number;
  rooms: any[];

  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: Gender | "";
  phone: string;
  email: string;
  address: string;

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
  total_price: number;
  grand_total_price: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  contact_num: string;
  gender: Gender;
  is_international: boolean;
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
