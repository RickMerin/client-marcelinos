import { easeInOut } from "framer-motion";
import type { FormData, RoomTypeFilter, VenueEventType } from "@/types/booking.types";

/** Facebook Messenger page ID (preferred), with URL override fallback for backward compatibility. */
const envMessengerPageId = import.meta.env.VITE_MESSENGER_PAGE_ID as
  | string
  | undefined;
const envMessengerUrl = import.meta.env.VITE_MESSENGER_URL as
  | string
  | undefined;
const DEFAULT_MESSENGER_PAGE_ID = "61557457680496";

export const MESSENGER_PAGE_ID =
  typeof envMessengerPageId === "string" && envMessengerPageId.trim() !== ""
    ? envMessengerPageId.trim()
    : DEFAULT_MESSENGER_PAGE_ID;

export const MESSENGER_CHAT_URL =
  typeof envMessengerUrl === "string" && envMessengerUrl.trim() !== ""
    ? envMessengerUrl.trim()
    : `https://m.me/${MESSENGER_PAGE_ID}`;

/** Default: all room types visible until the guest narrows the list. */
export const DEFAULT_ROOM_TYPE_FILTERS: RoomTypeFilter[] = [
  "standard",
  "family",
  "deluxe",
];

export const VENUE_EVENT_OPTIONS: {
  value: VenueEventType;
  label: string;
}[] = [
  { value: "wedding", label: "Wedding" },
  { value: "birthday", label: "Birthday" },
  { value: "meeting_staff", label: "Meeting/Seminar" },
];

export const ROOM_TYPE_FILTER_OPTIONS: {
  value: RoomTypeFilter;
  label: string;
}[] = [
  { value: "standard", label: "Standard" },
  { value: "family", label: "Family" },
  { value: "deluxe", label: "Deluxe" },
];

export const defaultFormData: FormData = {
  current_step: 1,
  booking_type: "room",
  venue_event_date: "",
  venue_event_type: "",
  check_in: "",
  check_out: "",
  days: 1,
  room_type_filters: [...DEFAULT_ROOM_TYPE_FILTERS],
  rooms: [],
  venues: [],

  firstName: "",
  middleName: null,
  lastName: "",
  gender: "",
  phone: "",
  email: "",
  address: "",


  region: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",

  category: "",
  newsletter: false,
  notifications: false,
  paymentMethod: "",
  onlinePaymentPlan: "",

  totalPrice: 0,
  grandTotalPrice: 0,
};

export const stepMotion = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.35, ease: easeInOut },
};
