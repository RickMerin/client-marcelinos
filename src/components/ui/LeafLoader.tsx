/** Leaf fills: sea → forest → leaf → sage-light (brand tropical palette) */
const LEAF_FILLS = [
  "color-mix(in oklch, var(--color-sea) 96%, var(--color-sage-light) 4%)",
  "color-mix(in oklch, var(--color-sea) 82%, var(--color-leaf) 18%)",
  "color-mix(in oklch, var(--color-sea) 68%, var(--color-leaf) 32%)",
  "color-mix(in oklch, var(--color-forest) 52%, var(--color-forest-soft) 48%)",
  "color-mix(in oklch, var(--color-forest-soft) 48%, var(--color-leaf) 52%)",
  "color-mix(in oklch, var(--color-leaf) 45%, var(--color-sage) 55%)",
  "color-mix(in oklch, var(--color-sage) 38%, var(--color-sage-light) 62%)",
  "color-mix(in oklch, var(--color-sage-light) 78%, var(--color-sea) 22%)",
] as const;

const LEAF_STEM_STROKES = [
  "color-mix(in oklch, var(--color-sea) 72%, var(--color-dark) 28%)",
  "color-mix(in oklch, var(--color-sea) 68%, var(--color-dark) 32%)",
  "color-mix(in oklch, var(--color-forest) 65%, var(--color-dark) 35%)",
  "color-mix(in oklch, var(--color-forest-soft) 62%, var(--color-dark) 38%)",
  "color-mix(in oklch, var(--color-forest-soft) 58%, var(--color-ink) 42%)",
  "color-mix(in oklch, var(--color-leaf) 55%, var(--color-ink-soft) 45%)",
  "color-mix(in oklch, var(--color-sage) 52%, var(--color-ink-soft) 48%)",
  "color-mix(in oklch, var(--color-sage-light) 48%, var(--color-sea) 52%)",
] as const;

const LEAF_VEIN_STROKES = [
  "color-mix(in oklch, var(--color-sea) 58%, var(--color-ink) 42%)",
  "color-mix(in oklch, var(--color-sea) 55%, var(--color-ink-soft) 45%)",
  "color-mix(in oklch, var(--color-forest) 52%, var(--color-ink-soft) 48%)",
  "color-mix(in oklch, var(--color-forest-soft) 50%, var(--color-ink-soft) 50%)",
  "color-mix(in oklch, var(--color-forest-soft) 48%, var(--color-ink-soft) 52%)",
  "color-mix(in oklch, var(--color-leaf) 45%, var(--color-ink-soft) 55%)",
  "color-mix(in oklch, var(--color-sage) 42%, var(--color-sea) 58%)",
  "color-mix(in oklch, var(--color-sage-light) 40%, var(--color-sea) 60%)",
] as const;

export function LeafLoader() {
  const leaves = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div style={{ position: "relative", width: "128px", height: "128px" }}>
      {leaves.map((index) => {
        const rotation = index * 45;
        const delay = index * 0.15;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <svg
              viewBox="0 0 40 80"
              style={{
                width: "24px",
                height: "48px",
                animation: "leaf-pulse 1.6s ease-in-out infinite",
                animationDelay: `${delay}s`,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            >
              <path
                d="M20 0 C20 0, 8 15, 6 30 C4 45, 8 60, 20 75 C32 60, 36 45, 34 30 C32 15, 20 0, 20 0Z"
                fill={LEAF_FILLS[index]}
              />
              <path
                d="M20 8 L20 70"
                stroke={LEAF_STEM_STROKES[index]}
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M20 20 L12 28 M20 30 L10 40 M20 40 L11 52 M20 50 L14 60 M20 20 L28 28 M20 30 L30 40 M20 40 L29 52 M20 50 L26 60"
                stroke={LEAF_VEIN_STROKES[index]}
                strokeWidth="0.8"
                fill="none"
                strokeLinecap="round"
                opacity="0.7"
              />
            </svg>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background:
              "color-mix(in oklch, var(--color-leaf) 22%, transparent)",
            filter: "blur(8px)",
          }}
        />
      </div>
    </div>
  );
}
