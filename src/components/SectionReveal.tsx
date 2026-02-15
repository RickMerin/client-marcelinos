import { motion, type Variants } from "framer-motion";

/** Viewport options: animate when this fraction of the section is visible. Only run once for scroll perf. */
const DEFAULT_VIEWPORT = {
  once: true,
  amount: 0.15,
  margin: "0px 0px -50px 0px",
} as const;

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

type SectionRevealProps = {
  children: React.ReactNode;
  /** Section id for anchor links; applied to the motion wrapper */
  id?: string;
  /** Extra class names for the wrapper */
  className?: string;
  /** Fraction of element that must be visible to trigger (0–1). Default 0.15 (fragment visible). */
  amount?: number;
  /** Custom variants; defaults to fade + slide up using opacity/transform only (GPU-friendly). */
  variants?: Variants;
  /** Optional viewport margin (e.g. "0px 0px -80px 0px" to trigger earlier). */
  viewportMargin?: string;
};

/**
 * Wraps content in a motion.div that animates only when the section (or a fragment) is in view.
 * Uses Framer Motion's whileInView with once: true so scroll performance is not affected after first reveal.
 * Animations use only opacity and transform for compositor-friendly performance.
 */
export function SectionReveal({
  children,
  id,
  className = "",
  amount = 0.15,
  variants = defaultVariants,
  viewportMargin,
}: SectionRevealProps) {
  const viewport = {
    ...DEFAULT_VIEWPORT,
    amount,
    ...(viewportMargin != null && { margin: viewportMargin }),
  };

  return (
    <motion.div
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
