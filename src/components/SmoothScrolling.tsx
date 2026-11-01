"use client";

import { ReactLenis, useLenis } from 'lenis/react';
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const LENIS_OPTIONS = {
  lerp: 0.10,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1,
  respectReducedMotion: false,
  overscroll: true,
};

function BookRouteScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (pathname.startsWith("/book/")) {
      if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [pathname, lenis]);

  return null;
}

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      autoRaf={true}
      options={LENIS_OPTIONS}
    >
      <BookRouteScrollReset />
      {children}
    </ReactLenis>
  );
}

