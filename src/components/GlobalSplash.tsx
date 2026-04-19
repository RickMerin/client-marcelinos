import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LeafLoader } from "@/components/ui/LeafLoader";

const FONT_LINK_ID = "marcelino-loader-fonts";

type MarcelinoPageLoaderProps = {
  /** When false, plays exit animation then calls onComplete. */
  isLoading: boolean;
  onComplete?: () => void;
};

/** Legacy prop shape used by App.tsx (`isExiting` ↔ `!isLoading`). */
type GlobalSplashLegacyProps = {
  isExiting: boolean;
  onComplete?: () => void;
};

function injectLoaderFonts() {
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Jost:wght@200;300;400&display=swap";
  document.head.appendChild(link);
}

function CornerOrnament({ mirror }: { mirror: "tl" | "tr" | "bl" | "br" }) {
  const transforms: Record<string, string> = {
    tl: "none",
    tr: "scaleX(-1)",
    bl: "scaleY(-1)",
    br: "scale(-1)",
  };
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      className="mpl-corner"
      style={{ transform: transforms[mirror] }}
      aria-hidden
    >
      <path
        d="M 4 36 L 4 8 A 4 4 0 0 1 8 4 L 36 4"
        fill="none"
        stroke="#4A6741"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.18}
      />
    </svg>
  );
}

function LoaderShell({
  isLoading,
  onComplete,
}: MarcelinoPageLoaderProps) {
  const completedRef = useRef(false);

  useEffect(() => {
    injectLoaderFonts();
  }, []);

  useEffect(() => {
    if (isLoading) {
      completedRef.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [isLoading, onComplete]);

  return (
    <>
      <style>{`
        @keyframes mpl-shimmer {
          from { left: -100%; }
          to { left: 100%; }
        }
        .mpl-shimmer-bar {
          position: absolute;
          top: 0;
          width: 55%;
          height: 100%;
          left: -100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(181, 137, 58, 0.45),
            transparent
          );
          animation: mpl-shimmer 1.8s ease-in-out infinite;
        }
        @keyframes mpl-text-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .mpl-loading-text {
          animation: mpl-text-pulse 2s ease-in-out infinite;
        }
      `}</style>

      <motion.div
        role="status"
        aria-busy={isLoading}
        aria-label="Loading site"
        className="mpl-overlay"
        initial={false}
        animate={
          isLoading
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 1.02 }
        }
        transition={{ duration: 0.6, ease: "easeIn" }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#F0EDE6",
          pointerEvents: isLoading ? "auto" : "none",
        }}
      >
        <div
          className="mpl-vignette"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 95% 95% at 50% 50%, transparent 52%, rgba(139, 122, 105, 0.14) 100%)",
          }}
        />

        <div
          className="mpl-corners"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <div style={{ position: "absolute", top: 20, left: 20 }}>
            <CornerOrnament mirror="tl" />
          </div>
          <div style={{ position: "absolute", top: 20, right: 20 }}>
            <CornerOrnament mirror="tr" />
          </div>
          <div style={{ position: "absolute", bottom: 20, left: 20 }}>
            <CornerOrnament mirror="bl" />
          </div>
          <div style={{ position: "absolute", bottom: 20, right: 20 }}>
            <CornerOrnament mirror="br" />
          </div>
        </div>

        <div
          style={{
            position: "relative",
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "18px",
              }}
            >
              <img
                src="/brand-logo.webp"
                alt=""
                width={48}
                height={48}
                style={{ height: 48, width: "auto", objectFit: "contain" }}
              />

              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontWeight: 300,
                    fontStyle: "italic",
                    fontSize: "2rem",
                    letterSpacing: "0.22em",
                    color: "#B5893A",
                    textTransform: "uppercase",
                    lineHeight: 1.15,
                  }}
                >
                  Marcelino&apos;s
                </div>
                <div
                  style={{
                    marginTop: "6px",
                    fontFamily: '"Jost", sans-serif',
                    fontWeight: 200,
                    fontSize: "0.62rem",
                    letterSpacing: "0.42em",
                    color: "#7A8C6E",
                    textTransform: "uppercase",
                  }}
                >
                  Resort & Hotel
                </div>
              </div>

              <div
                style={{
                  width: 48,
                  height: 0.5,
                  background:
                    "linear-gradient(90deg, #B5893A 0%, transparent 100%)",
                }}
              />
            </div>

            <LeafLoader />

            <div style={{ width: 120, marginTop: 4 }}>
              <div
                style={{
                  position: "relative",
                  width: 120,
                  height: 0.5,
                  overflow: "hidden",
                  background: "rgba(122, 140, 110, 0.2)",
                  borderRadius: 1,
                }}
              >
                <div className="mpl-shimmer-bar" />
              </div>
            </div>

            <p
              className="mpl-loading-text"
              style={{
                margin: 0,
                fontFamily: '"Jost", sans-serif',
                fontWeight: 200,
                fontSize: 10,
                letterSpacing: "0.45em",
                textTransform: "uppercase",
                color: "#9BA890",
              }}
              aria-live="polite"
            >
              Preparing your experience
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/**
 * Full-viewport page loader — “Refined Tropical Luxury” splash.
 * Use `isLoading` + optional `onComplete`, or legacy `isExiting` from App.
 */
export function MarcelinoPageLoader(props: MarcelinoPageLoaderProps) {
  return <LoaderShell {...props} />;
}

export function GlobalSplash({ isExiting, onComplete }: GlobalSplashLegacyProps) {
  return (
    <MarcelinoPageLoader isLoading={!isExiting} onComplete={onComplete} />
  );
}
