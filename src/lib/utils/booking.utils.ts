import {
  FormData,
  BookingPayload,
  BookingKind,
  type RoomLinePayload,
  type RoomTypeFilter,
} from "@/types/booking.types";
import { roomInventoryGroupKey } from "@/lib/formatters/roomDisplayName";
import { getFromLocalStorage } from "@/lib/storage/localStorage";
import { COUNTRIES } from "@/lib/constants/countries";
import { DEFAULT_ROOM_TYPE_FILTERS } from "@/lib/constants/booking.constants";
import {
  calculateTotalPrice,
  calculateGrandTotalPrice,
  calculateVenuesLineTotal,
} from "@/lib/math/calculate";

const ROOM_TYPE_SLUGS = new Set<RoomTypeFilter>([
  "standard",
  "family",
  "deluxe",
]);

/** Parse stored room-type filters; falls back to all types when missing or invalid. */
export function parseRoomTypeFilters(raw: unknown): RoomTypeFilter[] {
  if (!Array.isArray(raw)) return [...DEFAULT_ROOM_TYPE_FILTERS];
  const next = raw.filter(
    (x): x is RoomTypeFilter =>
      typeof x === "string" && ROOM_TYPE_SLUGS.has(x as RoomTypeFilter),
  );
  return next.length > 0 ? next : [...DEFAULT_ROOM_TYPE_FILTERS];
}

/**
 * Strips room vs venue selections that do not apply to the active booking kind and
 * recomputes line totals. For `both`, does not require rooms or venues.
 */
export function alignFormDataToBookingType(
  data: FormData,
  kind: BookingKind,
): FormData {
  let next: FormData = { ...data, booking_type: kind };

  if (kind === "room") {
    next = {
      ...next,
      venues: [],
      venue_event_date: "",
      venue_event_type: "",
    };
  } else if (kind === "venue") {
    next = {
      ...next,
      rooms: [],
      room_type_filters: [],
    };
  }

  const rooms = next.rooms ?? [];
  const venues = next.venues ?? [];
  const venueEventType = next.venue_event_type || "wedding";
  const totalPrice =
    calculateTotalPrice(rooms) +
    calculateVenuesLineTotal(venues, venueEventType);
  const grandTotalPrice = calculateGrandTotalPrice(
    rooms,
    next.days,
    venues,
    kind,
    venueEventType,
  );

  return { ...next, totalPrice, grandTotalPrice };
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

/** Same availability rules as rooms (API uses `available` + optional `is_block_date`). */
export function isVenueInventoryAvailable(venue: any): boolean {
  return isRoomInventoryAvailable(venue);
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

/** Per-night rate key for line items (2 dp, avoids float map key drift). */
function normalizeUnitPrice(raw: unknown): number {
  const n = Number(raw);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100) / 100;
}

/**
 * Replace selected room snapshots with the latest rows from GET /rooms (same `id`),
 * preserving selection order. Drops ids missing from `freshList`.
 */
export function reconcileRoomsWithInventory(
  selectedRooms: unknown[],
  freshList: unknown[],
): unknown[] {
  if (!Array.isArray(selectedRooms) || selectedRooms.length === 0) return [];
  const byId = new Map<number, unknown>();
  for (const row of freshList) {
    const id = Number((row as { id?: number }).id);
    if (id && !Number.isNaN(id)) byId.set(id, row);
  }
  const out: unknown[] = [];
  for (const r of selectedRooms) {
    const id = Number((r as { id?: number }).id);
    if (!id || Number.isNaN(id)) continue;
    const fresh = byId.get(id);
    if (fresh !== undefined) out.push(fresh);
  }
  return out;
}

/**
 * Deterministic order for selected room rows (type → layout group → id).
 * Safe for Step1: UI counts per subgroup do not depend on array order.
 */
export function sortRoomSelectionStable(rooms: unknown[]): unknown[] {
  if (!Array.isArray(rooms) || rooms.length === 0) return [];
  const copy = [...rooms];
  copy.sort((a, b) => {
    const ra = a as { type?: string; id?: number };
    const rb = b as { type?: string; id?: number };
    const ta = normalizeRoomTypeSlug(ra.type) ?? "";
    const tb = normalizeRoomTypeSlug(rb.type) ?? "";
    if (ta !== tb) return ta.localeCompare(tb);
    const ka = roomInventoryGroupKey(
      ra as Parameters<typeof roomInventoryGroupKey>[0],
    );
    const kb = roomInventoryGroupKey(
      rb as Parameters<typeof roomInventoryGroupKey>[0],
    );
    if (ka !== kb) return ka.localeCompare(kb);
    return Number(ra.id) - Number(rb.id);
  });
  return copy;
}

/** True if selection length, room ids, or any per-night price differs. */
export function roomSelectionsDiffer(
  prev: unknown[] | undefined,
  next: unknown[],
): boolean {
  const a = prev ?? [];
  if (a.length !== next.length) return true;
  for (let i = 0; i < next.length; i++) {
    const p = a[i] as { id?: number; price?: number | string };
    const n = next[i] as { id?: number; price?: number | string };
    if (Number(p?.id) !== Number(n?.id)) return true;
    if (normalizeUnitPrice(p?.price) !== normalizeUnitPrice(n?.price))
      return true;
  }
  return false;
}

/**
 * Collapse selected inventory rows into API room_lines (type + bed-spec group + qty + rate).
 * One line per distinct per-night rate within the same layout group (multiple DB prices supported).
 * Matches backend {@link RoomInventoryGroupKey}.
 */
export function collapseRoomsToLines(rooms: unknown[]): RoomLinePayload[] {
  if (!Array.isArray(rooms) || rooms.length === 0) return [];
  const map = new Map<
    string,
    {
      room_type: string;
      inventory_group_key: string;
      quantity: number;
      unit_price: number;
    }
  >();
  for (const r of rooms) {
    const room = r as {
      type?: string;
      price?: number | string;
    };
    const type = normalizeRoomTypeSlug(room.type) ?? "standard";
    const key = roomInventoryGroupKey(
      r as Parameters<typeof roomInventoryGroupKey>[0],
    );
    const unit = normalizeUnitPrice(room.price);
    const lineKey = `${type}|${key}|${unit}`;
    const existing = map.get(lineKey);
    if (existing) {
      existing.quantity += 1;
    } else {
      map.set(lineKey, {
        room_type: type,
        inventory_group_key: key,
        quantity: 1,
        unit_price: unit,
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

export type BuildBookingPayloadOptions = {
  captchaToken?: string | null;
  /** Honeypot field — leave empty for real users */
  website?: string;
};

/**
 * Builds the booking payload for API submission (matches backend POST /bookings).
 * check_in/check_out must be in "M d, Y" format (e.g. Jan 20, 2026).
 */
export const buildBookingPayload = (
  formData: FormData,
  options?: BuildBookingPayloadOptions,
): BookingPayload => {
  const storedAddress = getFromLocalStorage(
    PH_ADDRESS_STORAGE_KEY,
  ) as StoredPHAddress | null;
  const isIntl = storedAddress?.addressType === "international";
  const validInternationalCountry = isIntl
    ? normalizeInternationalCountry(formData.address)
    : null;
  const roomIds = (formData.rooms || [])
    .map(toId)
    .filter((id) => Number.isFinite(id) && id > 0);
  const roomLines = collapseRoomsToLines(formData.rooms || []);
  const venueIds = (formData.venues || []).map(toId).filter(Boolean);

  const parsedLocal = !isIntl ? parseLocalPHAddress(formData.address) : null;
  const province = isIntl
    ? null
    : formData.state || parsedLocal?.province || null;
  const municipality = isIntl
    ? null
    : formData.city || parsedLocal?.municipality || null;
  const barangay = isIntl
    ? null
    : parsedLocal?.barangay || formData.address || null;

  const captcha = options?.captchaToken?.trim();
  const websiteHoneypot = options?.website ?? "";

  return {
    ...(captcha ? { captcha_token: captcha } : {}),
    website: websiteHoneypot,
    reference_number: formData.reference_number ?? undefined,
    payment_method: formData.paymentMethod || "cash",
    ...(formData.paymentMethod === "online" && formData.onlinePaymentPlan
      ? { online_payment_plan: formData.onlinePaymentPlan }
      : {}),
    check_in: formData.check_in,
    check_out: formData.check_out,
    days: formData.days,
    ...(roomIds.length > 0 && { room_ids: roomIds }),
    ...(roomLines.length > 0 && { room_lines: roomLines }),
    ...(venueIds.length > 0 && { venues: venueIds }),
    ...(venueIds.length > 0 && {
      venue_event_type: formData.venue_event_type || "wedding",
    }),
    total_price:
      formData.grandTotalPrice ??
      (formData.totalPrice ?? 0) * (formData.days ?? 1),

    first_name: formData.firstName || "N/A",
    middle_name: formData.middleName || null,
    last_name: formData.lastName || "N/A",
    email: formData.email,
    contact_num: (formData.phone || "").trim(),
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
