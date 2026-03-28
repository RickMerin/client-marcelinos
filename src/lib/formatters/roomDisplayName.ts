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
  bed_modifiers?: string[] | null;
}): string | null {
  const specs = room?.bed_specifications;
  if (!Array.isArray(specs) || specs.length === 0) return null;
  const base = specs.filter(Boolean).join(", ");
  if (!base) return null;
  const mods = room?.bed_modifiers;
  if (Array.isArray(mods) && mods.length > 0) {
    return `${base} (${mods.join(", ")})`;
  }
  return base;
}

/**
 * Stable bucket for inventory grouping (matches {@link roomTypeAndBedTitle}):
 * prefer `bed_specifications` (+ modifiers), else fall back to `description`.
 */
export function roomInventoryGroupKey(room: {
  description?: string | null;
  bed_specifications?: string[] | null;
  bed_modifiers?: string[] | null;
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
  bed_modifiers?: string[] | null;
}): string {
  const typeLabel = roomTypeDisplayLabel(room?.type);
  const bed = bedSpecificationLine(room);
  if (bed) return `${typeLabel} - ${bed}`;
  const desc = room?.description?.trim();
  if (desc) return `${typeLabel} - ${desc}`;
  return typeLabel;
}
