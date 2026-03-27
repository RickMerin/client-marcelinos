import {
  FormData,
  BookingPayload,
  type RoomTypeFilter,
} from "@/types/booking.types";
import { getFromLocalStorage } from "@/lib/storage/localStorage";
import { COUNTRIES } from "@/lib/constants/countries";
import { DEFAULT_ROOM_TYPE_FILTERS } from "@/lib/constants/booking.constants";

const ROOM_TYPE_SLUGS = new Set<RoomTypeFilter>([
  "standard",
  "family",
  "deluxe",
]);

/** Parse stored room-type filters; falls back to all types when missing or invalid. */
export function parseRoomTypeFilters(raw: unknown): RoomTypeFilter[] {
  if (!Array.isArray(raw)) return [...DEFAULT_ROOM_TYPE_FILTERS];
  const next = raw.filter((x): x is RoomTypeFilter =>
    typeof x === "string" && ROOM_TYPE_SLUGS.has(x as RoomTypeFilter),
  );
  return next.length > 0 ? next : [...DEFAULT_ROOM_TYPE_FILTERS];
}

/** Map API `room.type` to a known slug, or null if unknown. */
export function normalizeRoomTypeSlug(type: unknown): RoomTypeFilter | null {
  const t = String(type ?? "")
    .toLowerCase()
    .trim();
  if (t === "standard" || t === "family" || t === "deluxe") return t;
  return null;
}

/** Group rooms by `description`; empty/missing shares one bucket. */
export function normalizeRoomDescriptionKey(description: unknown): string {
  const s = String(description ?? "").trim();
  return s || "__default__";
}

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

type ParsedLocalPHAddress = {
  barangay: string;
  municipality: string;
  province: string;
  region?: string;
};

type StoredPHAddress = {
  addressType?: "local" | "international";
  internationalAddress?: string;
};

const PH_ADDRESS_STORAGE_KEY = "reservationDetails.personal.phAddress";

const normalizeInternationalCountry = (rawCountry: string): string | null => {
  const normalized = (rawCountry || "").trim().toLowerCase();
  if (!normalized) return null;
  return (
    COUNTRIES.find((country) => country.toLowerCase() === normalized) ?? null
  );
};

/**
 * Parses the local PH address string produced by the UI:
 * "<Barangay>, <Municipality>, <Province>, <Region>".
 */
const parseLocalPHAddress = (address: string): ParsedLocalPHAddress | null => {
  const parts = (address || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length < 3) return null;

  const [barangay, municipality, province, ...rest] = parts;
  const region = rest.length ? rest.join(", ") : undefined;

  if (!barangay || !municipality || !province) return null;
  return { barangay, municipality, province, region };
};

/**
 * Builds the booking payload for API submission (matches backend POST /bookings).
 * check_in/check_out must be in "M d, Y" format (e.g. Jan 20, 2026).
 */
export const buildBookingPayload = (formData: FormData): BookingPayload => {
  const storedAddress = getFromLocalStorage(PH_ADDRESS_STORAGE_KEY) as StoredPHAddress | null;
  const isIntl = storedAddress?.addressType === "international";
  const validInternationalCountry = isIntl
    ? normalizeInternationalCountry(formData.address)
    : null;
  const roomIds = (formData.rooms || []).map(toId).filter(Boolean);
  const venueIds = (formData.venues || []).map(toId).filter(Boolean);

  const parsedLocal = !isIntl ? parseLocalPHAddress(formData.address) : null;
  const province = isIntl ? null : formData.state || parsedLocal?.province || null;
  const municipality =
    isIntl ? null : formData.city || parsedLocal?.municipality || null;
  const barangay =
    isIntl ? null : parsedLocal?.barangay || formData.address || null;

  return {
    reference_number: formData.reference_number ?? undefined,
    payment_method: formData.paymentMethod || "cash",
    check_in: formData.check_in,
    check_out: formData.check_out,
    days: formData.days,
    rooms: roomIds,
    ...(venueIds.length > 0 && { venues: venueIds }),
    total_price: formData.grandTotalPrice ?? (formData.totalPrice ?? 0) * (formData.days ?? 1),

    first_name: formData.firstName || "N/A",
    middle_name: formData.middleName || null,
    last_name: formData.lastName || "N/A",
    email: formData.email,
    contact_num: formData.phone || "0000000000",
    gender: formData.gender || "male",
    is_international: isIntl,
    country: isIntl ? validInternationalCountry : "Philippines",
    region: isIntl ? formData.region || null : parsedLocal?.region || null,
    province,
    municipality,
    barangay,
    street: formData.street || "",
    address: formData.address || "",
    zip_code: formData.zipCode || "",
    category: formData.category || "",
    newsletter: formData.newsletter ?? false,
    notifications: formData.notifications ?? false,
    city: isIntl ? formData.city : null,
  };
};
