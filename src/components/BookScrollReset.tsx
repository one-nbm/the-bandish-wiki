"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";

/**
 * Ensures that all book pages always start at the very top (scrollY: 0)
 * and never save or restore previous scroll positions across visits or history navigations.
 */
export function BookScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();

  useLayoutEffect(() => {
    // 1. Disable browser's automatic history scroll restoration while on book pages
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const resetToTop = () => {
      // Reset native DOM scroll
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;

      // Reset Lenis smooth scroll virtual coordinate immediately
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      }
    };

    // Execute immediately before browser paint
    resetToTop();

    // Re-verify in next animation frames to catch any delayed browser popstate restoration
    const rafId = requestAnimationFrame(() => {
      resetToTop();
    });

    const timerId = setTimeout(() => {
      resetToTop();
    }, 50);

    // Listen to popstate (e.g. browser Back/Forward navigation returning to book page)
    const handlePopState = () => {
      resetToTop();
      requestAnimationFrame(resetToTop);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      window.removeEventListener("popstate", handlePopState);
      // Restore standard scroll restoration for non-book pages when leaving
      if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, [pathname, lenis]);

  return null;
}
