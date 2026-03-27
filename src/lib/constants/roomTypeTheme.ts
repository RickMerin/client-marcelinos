import type { RoomTypeFilter } from "@/types/booking.types";

/**
 * Shared palette for Standard / Family / Deluxe so badges, filters, and cards stay consistent.
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

/** Category filter tiles (Step 1) — selected / focus accents aligned with badges */
export const ROOM_TYPE_FILTER_CARD_THEME: Record<
  RoomTypeFilter,
  {
    checkedBorder: string;
    checkedRing: string;
    checkedBg: string;
    iconOuter: string;
    iconInner: string;
    iconUnchecked: string;
    cardUnchecked: string;
    hoverBorder: string;
    focusRing: string;
    checkboxChecked: string;
    checkboxFocus: string;
  }
> = {
  standard: {
    checkedBorder: "border-[#385638]/55",
    checkedRing: "ring-[#385638]/20",
    checkedBg:
      "bg-gradient-to-br from-[#f4f7f4] via-white to-[#eef3ee] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_32px_-16px_rgba(56,86,56,0.14)]",
    iconOuter:
      "flex border-[#385638]/30 bg-[#385638] p-0.5 text-white shadow-md shadow-[#385638]/20",
    iconInner: "flex flex-1 items-center justify-center rounded-lg bg-[#4E6B4E]",
    iconUnchecked:
      "flex items-center justify-center border-stone-200/85 bg-stone-50 text-stone-600 group-hover:border-[#385638]/40 group-hover:bg-[#f4f7f4] group-hover:text-[#385638]",
    cardUnchecked: "border-stone-200/90 bg-white/55 hover:shadow-md",
    hoverBorder: "hover:border-[#385638]/35",
    focusRing:
      "focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#385638]/30",
    checkboxChecked:
      "data-[state=checked]:border-[#385638] data-[state=checked]:bg-[#385638]",
    checkboxFocus:
      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#385638]/40",
  },
  family: {
    checkedBorder: "border-[#385139]/55",
    checkedRing: "ring-[#385139]/20",
    checkedBg:
      "bg-gradient-to-br from-[#f3f6f3] via-white to-[#eef2ee] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_32px_-16px_rgba(56,81,57,0.14)]",
    iconOuter:
      "flex border-[#385139]/30 bg-[#385139] p-0.5 text-white shadow-md shadow-[#385139]/20",
    iconInner: "flex flex-1 items-center justify-center rounded-lg bg-[#5b735c]",
    iconUnchecked:
      "flex items-center justify-center border-stone-200/85 bg-stone-50 text-stone-600 group-hover:border-[#385139]/40 group-hover:bg-[#f3f6f3] group-hover:text-[#385139]",
    cardUnchecked: "border-stone-200/90 bg-white/55 hover:shadow-md",
    hoverBorder: "hover:border-[#385139]/35",
    focusRing:
      "focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#385139]/30",
    checkboxChecked:
      "data-[state=checked]:border-[#385139] data-[state=checked]:bg-[#385139]",
    checkboxFocus:
      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#385139]/40",
  },
  deluxe: {
    checkedBorder: "border-[#A67C35]/60",
    checkedRing: "ring-[#C5A059]/25",
    checkedBg:
      "bg-gradient-to-br from-[#fdfaf3] via-white to-[#f8f0e0] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_32px_-16px_rgba(140,110,61,0.16)]",
    iconOuter:
      "flex border-[#8C6E3D]/40 bg-gradient-to-r from-[#8C6E3D] to-[#C5A059] p-0.5 text-white shadow-md shadow-[#8C6E3D]/25",
    iconInner:
      "flex flex-1 items-center justify-center rounded-md bg-white/20",
    iconUnchecked:
      "flex items-center justify-center border-stone-200/85 bg-stone-50 text-stone-600 group-hover:border-[#C5A059]/45 group-hover:bg-[#fdfaf3] group-hover:text-[#8C6E3D]",
    cardUnchecked: "border-stone-200/90 bg-white/55 hover:shadow-md",
    hoverBorder: "hover:border-[#C5A059]/45",
    focusRing:
      "focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#C5A059]/35",
    checkboxChecked:
      "data-[state=checked]:border-[#8C6E3D] data-[state=checked]:bg-[#8C6E3D]",
    checkboxFocus:
      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C5A059]/45",
  },
};
