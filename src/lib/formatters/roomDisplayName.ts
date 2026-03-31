import { normalizeRoomDescriptionKey } from "@/lib/utils/booking.utils";

/**
 * Human-readable room type (aligned with backend `Room::typeOptions`).
 */
export function roomTypeDisplayLabel(type: string | undefined | null): string {
  if (type == null || type === "") return "Room";
  const key = String(type).toLowerCase();
  if (key === "standard") return "Standard";
  if (key === "family") return "Family";
  if (key === "deluxe") return "Deluxe";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/** Bed spec line including optional modifiers (same rules as quantity cards). */
export function bedSpecificationLine(room: {
  bed_specifications?: string[] | null;
}): string | null {
  const specs = room?.bed_specifications;
  if (!Array.isArray(specs) || specs.length === 0) return null;
  const base = specs.filter(Boolean).join(", ");
  if (!base) return null;
  return base;
}

/**
 * Stable bucket for inventory grouping (matches {@link roomTypeAndBedTitle}):
 * prefer `bed_specifications`, else fall back to `description`.
 */
export function roomInventoryGroupKey(room: {
  description?: string | null;
  bed_specifications?: string[] | null;
}): string {
  const bedLine = bedSpecificationLine(room);
  if (bedLine) return `spec:${bedLine}`;
  return `desc:${normalizeRoomDescriptionKey(room.description)}`;
}

/**
 * Primary room label: room type + bed specification (e.g. Standard - 1 Single Bed).
 * Uses description as the bed/layout part when specs are missing.
 */
export function roomTypeAndBedTitle(room: {
  type?: string | null;
  description?: string | null;
  bed_specifications?: string[] | null;
}): string {
  const typeLabel = roomTypeDisplayLabel(room?.type);
  const bed = bedSpecificationLine(room);
  if (bed) return `${typeLabel} - ${bed}`;
  const desc = room?.description?.trim();
  if (desc) return `${typeLabel} - ${desc}`;
  return typeLabel;
}

/**
 * Billing line when a physical room is assigned: "Room 101 (Standard - 1 Double Bed)".
 */
export function assignedRoomBillingTitle(room: {
  name?: string | null;
  type?: string | null;
  description?: string | null;
  bed_specifications?: string[] | null;
}): string {
  const inner = roomTypeAndBedTitle(room);
  const name = (room.name ?? "").trim() || "Room";
  return `${name} (${inner})`;
}

/** Receipt row for requested room type only (no room name until staff assigns). */
export function formatRoomLineTitle(line: {
  room_type: string;
  inventory_group_key: string;
  quantity: number;
}): string {
  const typeLabel = roomTypeDisplayLabel(line.room_type);
  const raw = line.inventory_group_key;
  const detail = raw.startsWith("spec:")
    ? raw.slice(5)
    : raw.startsWith("desc:")
      ? raw.slice(5)
      : raw;
  const qty = line.quantity > 1 ? ` ×${line.quantity}` : "";
  return `${typeLabel} - ${detail}${qty}`;
}
