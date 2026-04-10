import type { RoomTypeFilter } from "@/types/booking.types";

/**
 * Shared palette for Standard / Family / Deluxe (`RoomTypeBadge` and related UI).
 * Standard & Family: deep forest greens; Deluxe: bronze–gold gradient.
 */
export const ROOM_TYPE_BADGE_THEME: Record<
  RoomTypeFilter,
  {
    background: string;
    iconBackground: string;
    boxShadow: string;
  }
> = {
  standard: {
    background: "#2F5D50",
    iconBackground: "#3F7A6B",
    boxShadow:
      "0 1px 4px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
  },
  family: {
    background: "#2B5246",
    iconBackground: "#3F7A6B",
    boxShadow:
      "0 1px 4px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
  },
  deluxe: {
    background: "linear-gradient(90deg, #8C6E3D 0%, #C5A059 100%)",
    iconBackground: "rgba(255,255,255,0.22)",
    boxShadow:
      "0 1px 4px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.25)",
  },
};

/**
 * Lower panel (below hero image) on booking quantity cards.
 * Use `background` (not `backgroundColor`) so gradients render correctly.
 * Standard: cool deep forest; Family: warmer sage–olive; Deluxe: bronze–gold luxury band.
 */
export const ROOM_TYPE_CARD_PANEL: Record<
  RoomTypeFilter,
  { background: string }
> = {
  standard: {
    background:
      "linear-gradient(180deg, #152A24 0%, #234238 38%, #2F5D50 72%, #3A6B5C 100%)",
  },
  family: {
    background:
      "linear-gradient(180deg, #1F3328 0%, #2D4538 42%, #3D5A4A 78%, #4D6F5C 100%)",
  },
  deluxe: {
    background:
      "linear-gradient(145deg, #3D2E1C 0%, #6B5430 28%, #9A7A42 58%, #C6A15B 92%, #D9C08A 100%)",
  },
};

/** Typography on the gradient panel (pills + pricing row). Forest: light text; deluxe gold: dark text + light halation for contrast on bronze–cream. */
export interface RoomTypeCardPanelText {
  labelClass: string;
  emphasisClass: string;
  borderClass: string;
  pillClass: string;
}

const FOREST_PANEL_TEXT: RoomTypeCardPanelText = {
  labelClass: "text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]",
  emphasisClass: "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
  borderClass: "border-white/25",
  pillClass: "border-white/25 bg-white/95 text-stone-600 shadow-sm",
};

const DELUXE_PANEL_TEXT: RoomTypeCardPanelText = {
  labelClass:
    "text-white",
  emphasisClass:
    "text-white",
  borderClass: "border-stone-900/30",
  pillClass:
    "border-amber-950/35 bg-white text-stone-800 shadow-sm [box-shadow:0_1px_0_rgba(255,255,255,0.9)]",
};

export const ROOM_TYPE_CARD_PANEL_TEXT: Record<
  RoomTypeFilter,
  RoomTypeCardPanelText
> = {
  standard: FOREST_PANEL_TEXT,
  family: FOREST_PANEL_TEXT,
  deluxe: DELUXE_PANEL_TEXT,
};
