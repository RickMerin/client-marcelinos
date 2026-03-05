"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 80;

export default function ScrollNav() {
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  const updateScrollState = useCallback(() => {
    const scrollTop = window.scrollY ?? document.documentElement.scrollTop;
    const scrollHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
    );
    const clientHeight = window.innerHeight;
    const maxScroll = scrollHeight - clientHeight;

    const scrollable = maxScroll > SCROLL_THRESHOLD;
    setIsScrollable(scrollable);

    if (scrollable) {
      setCanScrollUp(scrollTop > SCROLL_THRESHOLD);
      setCanScrollDown(scrollTop < maxScroll - SCROLL_THRESHOLD);
    }
  }, []);

  useEffect(() => {
    updateScrollState();

    const handleScroll = () => updateScrollState();
    const observer = new ResizeObserver(updateScrollState);

    window.addEventListener("scroll", handleScroll, { passive: true });
    observer.observe(document.body);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [updateScrollState]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    const scrollHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
    );
    const maxScroll = scrollHeight - window.innerHeight;
    window.scrollTo({ top: maxScroll, behavior: "smooth" });
  };

  if (!isScrollable) return null;

  const btnBase =
    "flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 ease-out" +
    " focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:ring-offset-2 focus:ring-offset-transparent";

  return (
    <div
      className="fixed bottom-3 left-3 z-40 flex flex-col gap-1 sm:bottom-4 sm:left-4 sm:gap-1.5 md:bottom-5 md:left-5 md:gap-2"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0)",
        paddingLeft: "env(safe-area-inset-left, 0)",
      }}
      aria-label="Scroll shortcuts">
      <button
        type="button"
        onClick={scrollToTop}
        disabled={!canScrollUp}
        aria-label="Scroll to top"
        className={cn(
          btnBase,
          "h-9 w-9 sm:h-10 sm:w-10",
          "bg-green-700/80 text-white shadow-md hover:bg-green-700/95 hover:scale-[1.06] active:scale-[0.98]",
          !canScrollUp && "cursor-not-allowed opacity-35",
        )}>
        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <button
        type="button"
        onClick={scrollToBottom}
        disabled={!canScrollDown}
        aria-label="Scroll to bottom"
        className={cn(
          btnBase,
          "h-9 w-9 sm:h-10 sm:w-10",
          "bg-green-700/80 text-white shadow-md hover:bg-green-700/95 hover:scale-[1.06] active:scale-[0.98]",
          !canScrollDown && "cursor-not-allowed opacity-35",
        )}>
        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </div>
  );
}
