import { BedDouble, Users , Crown, ShieldQuestionMark} from "lucide-react";

interface RoomTypeBadgeProps {
  type: string;
  className?: string;
}

export function RoomTypeBadge({ type, className = "" }: RoomTypeBadgeProps) {
  const typeKey = type.toLowerCase();
  const isDeluxe = typeKey === "deluxe";
  const isFamily = typeKey === "family";
  const isStandard = typeKey === "standard";

  const baseStyle = isDeluxe
    ? {
        background: "linear-gradient(135deg, #8b6914 0%, #c69646 50%, #a6752e 100%)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
      }
    : {
        backgroundColor: "#315a3b",
        boxShadow: "0 1px 4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
      };

  return (
    <div
      className={`relative isolate flex items-center gap-1.5 overflow-hidden rounded-md px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white ${className}`}
      style={baseStyle}
      aria-label={`Room type: ${type}`}>
      {/* Shine only inside badge: clipped so it never blocks section/nav */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-md" aria-hidden>
        <div className="room-type-badge-shine" aria-hidden />
      </div>
      <span
        className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm"
        style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
        {isStandard && <BedDouble size={14} />}
        {isFamily && <Users size={14} />}
        {isDeluxe && <Crown size={14} />}
        {!isStandard && !isFamily && !isDeluxe && <ShieldQuestionMark size={14} />}
      </span>
      <span
        className="relative z-10 h-3 w-px shrink-0"
        style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
        aria-hidden
      />
      <span className="relative z-10 pr-0.5">{type}</span>
    </div>
  );
}
