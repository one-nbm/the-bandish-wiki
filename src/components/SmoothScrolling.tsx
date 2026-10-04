"use client";

import { ReactLenis } from 'lenis/react';
import React from 'react';

export const LENIS_OPTIONS = {
  lerp: 0.10,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1,
  respectReducedMotion: false,
  overscroll: true,
};

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
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
