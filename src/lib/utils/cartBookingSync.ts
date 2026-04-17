import {
  effectiveMaxUnitsForSubgroup,
  extractInventoryGroupAvailability,
  isRoomInventoryAvailable,
  isVenueInventoryAvailable,
  normalizeRoomTypeSlug,
  sortRoomSelectionStable,
} from "@/lib/utils/booking.utils";
import {
  bedSpecificationLine,
  roomInventoryGroupKey,
  roomTypeAndBedTitle,
} from "@/lib/formatters/roomDisplayName";
import type { RoomTypeFilter } from "@/types/booking.types";
import type { FormData } from "@/types/booking.types";
import { defaultFormData } from "@/lib/constants/booking.constants";
import {
  calculateGrandTotalPrice,
  calculateTotalPrice,
  calculateVenuesLineTotal,
} from "@/lib/math/calculate";
import {
  BOOKING_EXPIRATION,
  getFromLocalStorage,
  saveToLocalStorage,
} from "@/lib/storage/localStorage";

/**
 * Shape of a single entry in `localStorage.cartItems`.
 * Rooms are stored as one line per subgroup (type + bed specification),
 * using the representative room row's id + a `quantity` count.
 */
export type CartLine = {
  id: number;
  itemType: "room" | "venue";
  quantity: number;
  name?: string;
  type?: string;
  price?: number | string;
  featured_image?: string | null;
};

const CART_KEY = "cartItems";

function readCartItems(): CartLine[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CartLine[];
  } catch {
    return [];
  }
}

function writeCartItems(items: CartLine[]): void {
  if (typeof window === "undefined") return;
  if (items.length === 0) {
    window.localStorage.removeItem(CART_KEY);
  } else {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }
  window.dispatchEvent(new Event("cart-updated"));
}

/** Rooms in `pool` (already filtered + availability-aware) that share a subgroup. */
function subgroupPool(
  roomList: any[],
  type: RoomTypeFilter | string,
  invKey: string,
): any[] {
  const t = normalizeRoomTypeSlug(type);
  if (!t) return [];
  return roomList
    .filter(
      (r: any) =>
        normalizeRoomTypeSlug(r.type) === t &&
        roomInventoryGroupKey(r) === invKey &&
        isRoomInventoryAvailable(r),
    )
    .sort((a: any, b: any) => a.id - b.id);
}

/** Best-effort human label for the representative room (used for cart drawer display). */
function representativeRoomName(room: any): string {
  const bed = bedSpecificationLine(room);
  if (bed) return bed;
  const title = roomTypeAndBedTitle(room);
  if (title) return title;
  return String(room?.name ?? "Room");
}

/**
 * Add, update, or remove a single room-subgroup cart line.
 * `nextCount` is clamped to the current subgroup availability. When the clamped
 * value is 0, the line is removed. Dispatches `cart-updated`.
 */
export function upsertRoomSubgroupInCart(args: {
  type: RoomTypeFilter | string;
  inventoryGroupKey: string;
  nextCount: number;
  roomList: any[];
  roomsResponse?: unknown;
}): number {
  const { type, inventoryGroupKey, nextCount, roomList, roomsResponse } = args;
  const t = normalizeRoomTypeSlug(type);
  if (!t) return 0;

  const pool = subgroupPool(roomList, t, inventoryGroupKey);
  const igRows =
    roomsResponse !== undefined
      ? extractInventoryGroupAvailability(roomsResponse)
      : undefined;
  const max = effectiveMaxUnitsForSubgroup(
    pool.length,
    igRows,
    t,
    inventoryGroupKey,
  );
  const clamped = Math.max(0, Math.min(Math.floor(nextCount), max));

  const items = readCartItems();

  // Locate an existing line that belongs to this subgroup. A cart line is in
  // this subgroup when its id corresponds to any room in the current pool, or
  // (as a fallback when the rep id was removed from inventory) when its type
  // + declared subgroup matches.
  const poolIds = new Set(pool.map((r: any) => Number(r.id)));
  const existingIndex = items.findIndex((entry) => {
    if (entry?.itemType !== "room") return false;
    if (poolIds.has(Number(entry.id))) return true;
    const entryType = normalizeRoomTypeSlug(entry.type);
    if (entryType !== t) return false;
    const row = roomList.find(
      (r: any) => String(r.id) === String(entry.id),
    );
    if (!row) return false;
    return roomInventoryGroupKey(row) === inventoryGroupKey;
  });

  if (clamped === 0) {
    if (existingIndex === -1) return 0;
    const next = items.slice();
    next.splice(existingIndex, 1);
    writeCartItems(next);
    return 0;
  }

  if (pool.length === 0) return 0;
  const rep = pool[0];
  const line: CartLine = {
    id: Number(rep.id),
    itemType: "room",
    quantity: clamped,
    name: representativeRoomName(rep),
    type: rep.type,
    price: rep.price,
    featured_image: rep.featured_image ?? null,
  };

  const next = items.slice();
  if (existingIndex === -1) {
    next.push(line);
  } else {
    next[existingIndex] = { ...items[existingIndex], ...line };
  }
  writeCartItems(next);
  return clamped;
}

/**
 * Toggle a single venue line in the cart. If already present, remove it;
 * otherwise add (quantity 1) when the venue row is bookable. Dispatches
 * `cart-updated`.
 */
export function toggleVenueInCart(venue: any): boolean {
  if (!venue || venue.id == null) return false;
  const items = readCartItems();
  const existingIndex = items.findIndex(
    (entry) =>
      entry?.itemType === "venue" && String(entry.id) === String(venue.id),
  );

  if (existingIndex !== -1) {
    const next = items.slice();
    next.splice(existingIndex, 1);
    writeCartItems(next);
    return false;
  }

  if (!isVenueInventoryAvailable(venue)) return false;

  const line: CartLine = {
    id: Number(venue.id),
    itemType: "venue",
    quantity: 1,
    name: venue.name,
    type: venue.type,
    price: venue.price,
    featured_image: venue.featured_image ?? null,
  };
  writeCartItems([...items, line]);
  return true;
}

/**
 * Expand the cart into the `{rooms, venues}` shape used by the booking form.
 * Each room cart line produces up to `min(quantity, subgroup max)` expanded
 * unit rows drawn from the current availability pool. Items that no longer
 * match available inventory are dropped so decrements propagate cleanly.
 */
export function reconcileFormDataFromCart(
  items: CartLine[] | undefined,
  roomList: any[],
  venueList: any[],
  roomsResponse?: unknown,
): { rooms: any[]; venues: any[] } {
  const rooms: any[] = [];
  const venues: any[] = [];
  if (!Array.isArray(items) || items.length === 0) return { rooms, venues };

  const igRows = extractInventoryGroupAvailability(roomsResponse);
  const takenRoomIds = new Set<number>();

  for (const entry of items) {
    if (!entry || typeof entry !== "object") continue;

    if (entry.itemType === "venue") {
      if (venueList.length === 0) continue;
      const match = venueList.find(
        (v: any) => String(v.id) === String(entry.id),
      );
      if (!match || !isVenueInventoryAvailable(match)) continue;
      if (venues.some((v: any) => String(v.id) === String(match.id))) continue;
      venues.push(match);
      continue;
    }

    if (entry.itemType === "room") {
      if (roomList.length === 0) continue;
      const rep = roomList.find(
        (r: any) => String(r.id) === String(entry.id),
      );
      if (!rep) continue;
      const t = normalizeRoomTypeSlug(entry.type || rep.type);
      if (!t) continue;
      const invKey = roomInventoryGroupKey(rep);
      const pool = subgroupPool(roomList, t, invKey).filter(
        (r: any) => !takenRoomIds.has(Number(r.id)),
      );
      const max = effectiveMaxUnitsForSubgroup(
        subgroupPool(roomList, t, invKey).length,
        igRows,
        t,
        invKey,
      );
      const requested = Math.max(0, Number(entry.quantity) || 0);
      const take = Math.min(requested, max, pool.length);
      for (let i = 0; i < take; i++) {
        const row = pool[i];
        rooms.push(row);
        takenRoomIds.add(Number(row.id));
      }
    }
  }

  return {
    rooms: sortRoomSelectionStable(rooms) as any[],
    venues,
  };
}

/**
 * Drops or clamps cart lines that exceed current GET /rooms + GET /venues availability.
 * Returns true when `cartItems` in localStorage was modified. Dispatches
 * `cart-updated` on change.
 */
export function pruneCartItemsToAvailability(
  roomList: any[],
  venueList: any[],
  roomsResponse: unknown,
): boolean {
  const items = readCartItems();
  if (items.length === 0) return false;

  const igRows = extractInventoryGroupAvailability(roomsResponse);
  const next: CartLine[] = [];

  for (const entry of items) {
    if (!entry || typeof entry !== "object") continue;

    if (entry.itemType === "venue") {
      const v = venueList.find((x: any) => String(x.id) === String(entry.id));
      if (!v || !isVenueInventoryAvailable(v)) continue;
      const q = Math.min(Math.max(0, Number(entry.quantity) || 0), 1);
      if (q === 0) continue;
      next.push({ ...entry, quantity: q });
      continue;
    }

    if (entry.itemType === "room") {
      const r = roomList.find((x: any) => String(x.id) === String(entry.id));
      if (!r || !isRoomInventoryAvailable(r)) continue;
      const t = normalizeRoomTypeSlug(entry.type || r.type) as
        | RoomTypeFilter
        | null;
      if (!t) continue;
      const invk = roomInventoryGroupKey(r);
      const poolLen = subgroupPool(roomList, t, invk).length;
      const maxQ = effectiveMaxUnitsForSubgroup(poolLen, igRows, t, invk);
      const requested = Math.max(0, Number(entry.quantity) || 0);
      const q = Math.min(requested, maxQ);
      if (q === 0) continue;
      next.push({ ...entry, quantity: q });
      continue;
    }

    next.push(entry);
  }

  if (JSON.stringify(next) === JSON.stringify(items)) return false;
  writeCartItems(next);
  return true;
}

/**
 * Rewrites `reservationDetails.rooms` and `reservationDetails.venues` to match
 * the current cart (expanded through inventory), so decrements from the cart
 * drawer or SinglePage flow into the booking funnel's persisted state.
 */
export function syncCartToReservationDetails(
  roomList: any[],
  venueList: any[],
  roomsResponse?: unknown,
): void {
  const stored = getFromLocalStorage("reservationDetails") as
    | Partial<FormData>
    | null;
  const base: FormData = {
    ...defaultFormData,
    ...(stored || {}),
  } as FormData;

  const items = readCartItems();
  const { rooms, venues } = reconcileFormDataFromCart(
    items,
    roomList,
    venueList,
    roomsResponse,
  );

  const venueEventType = base.venue_event_type || "wedding";
  const totalPrice =
    calculateTotalPrice(rooms) +
    calculateVenuesLineTotal(venues, venueEventType);
  const grandTotalPrice = calculateGrandTotalPrice(
    rooms,
    base.days,
    venues,
    base.booking_type,
    venueEventType,
  );

  saveToLocalStorage(
    "reservationDetails",
    {
      ...base,
      rooms,
      venues,
      totalPrice,
      grandTotalPrice,
    },
    BOOKING_EXPIRATION,
  );
}
