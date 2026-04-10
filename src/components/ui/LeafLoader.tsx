import { useEffect } from "react";

const leafPulseKeyframes = `
  @keyframes leaf-pulse {
    0%, 100% {
      opacity: 0.4;
      transform: scale(0.85) translateY(4px);
    }
    50% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

export function LeafLoader() {
  const leaves = Array.from({ length: 8 }, (_, i) => i);

  useEffect(() => {
    const styleId = "leaf-loader-keyframes";
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = leafPulseKeyframes;
    document.head.appendChild(style);
  }, []);

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
                fill={`hsl(${130 + index * 5}, ${55 + index * 3}%, ${35 + index * 4}%)`}
              />
              <path
                d="M20 8 L20 70"
                stroke={`hsl(${125 + index * 5}, 50%, ${25 + index * 2}%)`}
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M20 20 L12 28 M20 30 L10 40 M20 40 L11 52 M20 50 L14 60 M20 20 L28 28 M20 30 L30 40 M20 40 L29 52 M20 50 L26 60"
                stroke={`hsl(${125 + index * 5}, 45%, ${30 + index * 2}%)`}
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
            background: "rgba(16, 185, 129, 0.1)",
            filter: "blur(8px)",
          }}
        />
      </div>
    </div>
  );
}
