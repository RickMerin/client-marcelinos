import {
  FormData,
  BookingPayload,
  type RoomLinePayload,
  type RoomTypeFilter,
} from "@/types/booking.types";
import { roomInventoryGroupKey } from "@/lib/formatters/roomDisplayName";
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
 * Normalize an API date (Y-m-d or ISO datetime) to yyyy-MM-dd for calendar `isoDate` keys
 * and `blockedReasons` lookups.
 */
export function toBlockedDateKey(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "";
  const rawStr = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawStr)) return rawStr;
  const d = new Date(rawStr);
  if (Number.isNaN(d.getTime())) return rawStr.slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Whether the rooms API row can be booked for the requested dates.
 * Honors `available`, `is_block_date`, and explicit `available: false` from the API.
 */
export function isRoomInventoryAvailable(room: any): boolean {
  if (room == null) return false;
  if (room.available === false) return false;
  if (room.is_block_date === true) return false;
  return true;
}

/** Per layout row from GET /rooms (with dates); includes room_lines + assigned demand. */
export type InventoryGroupAvailabilityRow = {
  room_type: string;
  inventory_group_key: string;
  capacity: number;
  committed: number;
  remaining: number;
};

export function extractInventoryGroupAvailability(
  response: unknown,
): InventoryGroupAvailabilityRow[] | undefined {
  if (!response || typeof response !== "object") return undefined;
  const rows = (response as { inventory_group_availability?: unknown })
    .inventory_group_availability;
  if (!Array.isArray(rows)) return undefined;
  return rows as InventoryGroupAvailabilityRow[];
}

export function getRemainingForInventoryGroup(
  rows: InventoryGroupAvailabilityRow[] | undefined,
  roomType: string,
  inventoryGroupKey: string,
): number | undefined {
  if (!rows?.length) return undefined;
  const t = normalizeRoomTypeSlug(roomType);
  const hit = rows.find(
    (r) =>
      normalizeRoomTypeSlug(r.room_type) === t &&
      r.inventory_group_key === inventoryGroupKey,
  );
  return hit?.remaining;
}

/** Caps quantity by physical pool and by remaining units from inventory_group_availability. */
export function effectiveMaxUnitsForSubgroup(
  poolLength: number,
  rows: InventoryGroupAvailabilityRow[] | undefined,
  roomType: string,
  inventoryGroupKey: string,
): number {
  const rem = getRemainingForInventoryGroup(rows, roomType, inventoryGroupKey);
  if (rem === undefined) return poolLength;
  return Math.max(0, Math.min(poolLength, rem));
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

/**
 * Collapse selected inventory rows into API room_lines (type + bed-spec group + qty + rate).
 * Matches backend {@link RoomInventoryGroupKey}.
 */
export function collapseRoomsToLines(rooms: unknown[]): RoomLinePayload[] {
  if (!Array.isArray(rooms) || rooms.length === 0) return [];
  const map = new Map<
    string,
    { room_type: string; inventory_group_key: string; quantity: number; unit_price: number }
  >();
  for (const r of rooms) {
    const room = r as {
      type?: string;
      price?: number | string;
    };
    const type = normalizeRoomTypeSlug(room.type) ?? "standard";
    const key = roomInventoryGroupKey(r as Parameters<typeof roomInventoryGroupKey>[0]);
    const id = `${type}|${key}`;
    const price = Number(room.price) || 0;
    const existing = map.get(id);
    if (existing) {
      existing.quantity += 1;
    } else {
      map.set(id, {
        room_type: type,
        inventory_group_key: key,
        quantity: 1,
        unit_price: price,
      });
    }
  }
  return Array.from(map.values());
}

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
  const roomLines = collapseRoomsToLines(formData.rooms || []);
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
    ...(roomLines.length > 0 && { room_lines: roomLines }),
    ...(venueIds.length > 0 && { venues: venueIds }),
    ...(venueIds.length > 0 && {
      venue_event_type: formData.venue_event_type || "wedding",
    }),
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
