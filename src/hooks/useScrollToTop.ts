import { useEffect } from "react";

export type ScrollToTopOptions = {
  /** Scroll behavior: "smooth" animates, "instant" jumps. Default: "smooth" */
  behavior?: ScrollBehavior;
  /** Vertical offset from top (e.g. for sticky header). Default: 0 */
  top?: number;
};

/**
 * Scrolls the window to the top when the component mounts.
 * Use on page components so users always start at the top when navigating.
 */
export function useScrollToTop(options: ScrollToTopOptions = {}) {
  const { behavior = "smooth", top = 0 } = options;

  useEffect(() => {
    window.scrollTo({ top, behavior });
  }, [behavior, top]);
}
