"use client";

import { ReactLenis } from 'lenis/react';
import React, { useEffect } from 'react';

export const LENIS_OPTIONS = {
  lerp: 0.10,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1,
  respectReducedMotion: false,
  overscroll: true,
};

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const root = document.documentElement;

    const handleScrollActivity = () => {
      if (!root.classList.contains('is-pointer-scrolling')) {
        root.classList.add('is-pointer-scrolling');
      }
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        root.classList.remove('is-pointer-scrolling');
        timer = null;
      }, 120);
    };

    window.addEventListener('wheel', handleScrollActivity, { passive: true });
    window.addEventListener('scroll', handleScrollActivity, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleScrollActivity);
      window.removeEventListener('scroll', handleScrollActivity);
      if (timer) clearTimeout(timer);
      root.classList.remove('is-pointer-scrolling');
    };
  }, []);

  return (
    <ReactLenis
      root
      autoRaf={true}
      options={LENIS_OPTIONS}
    >
      {children}
    </ReactLenis>
  );
}

