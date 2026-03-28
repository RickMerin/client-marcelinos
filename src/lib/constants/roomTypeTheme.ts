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
    background: "#385638",
    iconBackground: "#4E6B4E",
    boxShadow:
      "0 1px 4px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
  },
  family: {
    background: "#385139",
    iconBackground: "#5b735c",
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
