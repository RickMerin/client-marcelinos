import { BedDouble, Users, Crown, ShieldQuestionMark } from "lucide-react";

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

  const baseStyle = isDeluxe
    ? {
        background:
          "linear-gradient(135deg, #8b6914 0%, #c69646 50%, #a6752e 100%)",
        boxShadow:
          "0 1px 4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
      }
    : {
        backgroundColor: "#315a3b",
        boxShadow:
          "0 1px 4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
      };

  const sizeClasses = isTitle
    ? "px-3 py-1.5 text-lg sm:text-xl rounded-lg mb-2 inline-flex w-fit"
    : "px-1.5 py-1 text-[10px] rounded-md";

  const iconContainerSize = isTitle ? "h-8 w-8" : "h-5 w-5";
  const iconSize = isTitle ? 20 : 14;

  return (
    <div
      className={`relative isolate flex items-center gap-1.5 overflow-hidden font-semibold uppercase tracking-wider text-white ${sizeClasses} ${className}`}
      style={baseStyle}
      aria-label={`Room type: ${type}`}
    >
      {/* Shine only inside badge: clipped so it never blocks section/nav */}
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden ${isTitle ? "rounded-lg" : "rounded-md"}`}
        aria-hidden
      >
        <div className="room-type-badge-shine" aria-hidden />
      </div>
      <span
        className={`relative z-10 flex shrink-0 items-center justify-center rounded-sm ${iconContainerSize}`}
        style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
      >
        {isStandard && <BedDouble size={iconSize} />}
        {isFamily && <Users size={iconSize} />}
        {isDeluxe && <Crown size={iconSize} />}
        {!isStandard && !isFamily && !isDeluxe && (
          <ShieldQuestionMark size={iconSize} />
        )}
      </span>
      <span
        className={`relative z-10 w-px shrink-0 ${isTitle ? "h-5" : "h-3"}`}
        style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
        aria-hidden
      />
      <span className="relative z-10 pr-0.5">{type}</span>
    </div>
  );
}
