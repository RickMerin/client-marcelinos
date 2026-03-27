import type { CSSProperties } from "react";
import { BedDouble, Users, Crown, ShieldQuestionMark } from "lucide-react";
import { ROOM_TYPE_BADGE_THEME } from "@/lib/constants/roomTypeTheme";

interface RoomTypeBadgeProps {
  type: string;
  className?: string;
  isTitle?: boolean;
}

export function RoomTypeBadge({
  type,
  className = "",
  isTitle = false,
}: RoomTypeBadgeProps) {
  const typeKey = type.toLowerCase();
  const isDeluxe = typeKey === "deluxe";
  const isFamily = typeKey === "family";
  const isStandard = typeKey === "standard";

  const theme = isDeluxe
    ? ROOM_TYPE_BADGE_THEME.deluxe
    : isFamily
      ? ROOM_TYPE_BADGE_THEME.family
      : isStandard
        ? ROOM_TYPE_BADGE_THEME.standard
        : ROOM_TYPE_BADGE_THEME.standard;

  const baseStyle: CSSProperties = {
    background: theme.background,
    boxShadow: theme.boxShadow,
  };

  const sizeClasses = isTitle
    ? "px-2 py-1 text-sm sm:text-sm rounded-md mb-1 inline-flex w-fit shadow-sm"
    : "px-1.5 py-1 text-[10px] rounded-md";

  const iconContainerSize = isTitle ? "h-5 w-5" : "h-5 w-5";
  const iconSize = isTitle ? 14 : 14;

  return (
    <div
      className={`relative isolate flex items-center gap-1.5 overflow-hidden font-semibold uppercase tracking-wider text-white ${sizeClasses} ${className}`}
      style={baseStyle}
      aria-label={`Room type: ${type}`}
    >
      {/* Shine only inside badge: clipped so it never blocks section/nav */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-md"
        aria-hidden
      >
        <div className="room-type-badge-shine" aria-hidden />
      </div>
      <span
        className={`relative z-10 flex shrink-0 items-center justify-center rounded-sm ${iconContainerSize}`}
        style={{ backgroundColor: theme.iconBackground }}
      >
        {isStandard && <BedDouble size={iconSize} />}
        {isFamily && <Users size={iconSize} />}
        {isDeluxe && <Crown size={iconSize} />}
        {!isStandard && !isFamily && !isDeluxe && (
          <ShieldQuestionMark size={iconSize} />
        )}
      </span>
      <span
        className={`relative z-10 w-px shrink-0 ${isTitle ? "h-3.5" : "h-3"}`}
        style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
        aria-hidden
      />
      <span className="relative z-10 pr-0.5">{type}</span>
    </div>
  );
}
