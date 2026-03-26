type Props = {
  title: string;
  detail: string;
};

/**
 * Overlay on room/venue card images when the resource is not bookable for the selected dates.
 * Primary line is typically from the API (maintenance, blocked dates with reason, or already reserved).
 */
export function UnavailableReasonOverlay({ title, detail }: Props) {
  return (
    <div
      className="absolute inset-0 z-20 flex max-h-full flex-col items-center justify-center gap-1.5 overflow-y-auto bg-black/30 px-3 py-4 backdrop-blur-[2px]"
      onClick={(e) => e.stopPropagation()}
      aria-hidden
    >
      <p
        className="text-center font-semibold leading-snug"
        style={{
          color: "#fafaf9",
          fontSize: "0.9375rem",
          textShadow:
            "0 0 1px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.7)",
        }}
      >
        {title}
      </p>
      <p
        className="text-center text-xs leading-relaxed"
        style={{
          color: "#f5f5f4",
          textShadow: "0 0 1px rgba(0,0,0,1), 0 1px 2px rgba(0,0,0,0.8)",
        }}
      >
        {detail}
      </p>
    </div>
  );
}
