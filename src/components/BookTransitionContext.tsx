"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookMetadata } from "@/data/books";
import { Book3DModelFaces } from "./Book3DModelFaces";

interface TransitionData {
  book: BookMetadata;
  startRect: DOMRect;
  url: string;
}

interface BookTransitionContextType {
  startBookTransition: (data: TransitionData) => void;
  isTransitioning: boolean;
}

const BookTransitionContext = createContext<BookTransitionContextType>({
  startBookTransition: () => {},
  isTransitioning: false,
});

export function useBookTransition() {
  return useContext(BookTransitionContext);
}

// 3D physical book dimensions on destination book page
const targetWidth = 230;
const targetHeight = 330;
const targetDepth = 31.5;
const halfDepth = targetDepth / 2;

// Perfectly calibrated transition timeline: smooth, organic, and non-contrived
const TRANSITION_DURATION = 1.0;

const bookFlightTiming = {
  duration: TRANSITION_DURATION,
  ease: [0.22, 1, 0.36, 1] as const, // Organic physical deceleration
};

// Compute dynamic hero destination coordinates based on responsive viewport bounds
function getTargetPosition() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { x: 203, y: 276 };
  }

  // 1. Direct real-DOM measurement if the destination page element is already in the document
  const liveEl = document.getElementById("hero-book-3d-viewport");
  if (liveEl) {
    const rect = liveEl.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return {
        x: rect.left + (rect.width - targetWidth) / 2,
        y: rect.top + (rect.height - targetHeight) / 2,
      };
    }
  }

  // 2. CSS-accurate clientWidth measurement (excluding scrollbar to match mx-auto perfectly)
  const clientW = document.documentElement.clientWidth || window.innerWidth;
  if (clientW >= 1152) {
    // Desktop full container: centered max-w-6xl container (left col-span-5)
    // Centering is calculated from clientWidth (which excludes the scrollbar),
    // eliminating the 3.5-4px offset previously caused by window.innerWidth.
    const containerLeft = (clientW - 1152) / 2;
    return {
      x: containerLeft + 139,
      y: 276,
    };
  } else if (clientW >= 1024) {
    // Desktop compact (1024 - 1151px): content width = clientW - 96px padding
    const contentW = clientW - 96;
    const col5W = (contentW - 528) * (5 / 12) + 192;
    return {
      x: 48 + (col5W - targetWidth) / 2,
      y: 296,
    };
  } else if (clientW >= 768) {
    // Tablet: Centered
    return {
      x: (clientW - targetWidth) / 2,
      y: 223,
    };
  } else {
    // Mobile: Centered
    return {
      x: (clientW - targetWidth) / 2,
      y: 163,
    };
  }
}

// Hard ceiling so the overlay can never get stuck if navigation fails or is cancelled
const MAX_WAIT_MS = 8000;

export function BookTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTransition, setActiveTransition] = useState<TransitionData | null>(null);
  const [flightDone, setFlightDone] = useState(false);
  const [liveTargetPos, setLiveTargetPos] = useState<{ x: number; y: number } | null>(null);
  const handoffTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (handoffTimerRef.current) clearTimeout(handoffTimerRef.current);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    handoffTimerRef.current = null;
    safetyTimerRef.current = null;
  };

  const startBookTransition = useCallback(
    ({ book, startRect, url }: TransitionData) => {
      clearTimers();
      setFlightDone(false);
      setLiveTargetPos(null);
      setActiveTransition({ book, startRect, url });

      // Trigger client-side navigation immediately. In production the destination is a
      // dynamic server render (auth + database), so it can take far longer than the flight.
      router.push(url);

      // The flight itself always takes exactly TRANSITION_DURATION; the book then rests at its
      // destination pose until the new route has really committed.
      handoffTimerRef.current = setTimeout(() => setFlightDone(true), TRANSITION_DURATION * 1000);

      // Safety net: never leave the overlay stuck
      safetyTimerRef.current = setTimeout(() => setActiveTransition(null), MAX_WAIT_MS);
    },
    [router]
  );

  // Continuously poll for the real-DOM anchor as soon as the target page mounts
  // so Framer Motion glides with subpixel precision directly to the real Book3D position
  useEffect(() => {
    if (!activeTransition) {
      setLiveTargetPos(null);
      return;
    }

    let animId: number;
    const checkLiveAnchor = () => {
      const el = document.getElementById("hero-book-3d-viewport");
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const exactX = rect.left + (rect.width - targetWidth) / 2;
          const exactY = rect.top + (rect.height - targetHeight) / 2;
          setLiveTargetPos({ x: exactX, y: exactY });
          return;
        }
      }
      animId = requestAnimationFrame(checkLiveAnchor);
    };

    animId = requestAnimationFrame(checkLiveAnchor);
    return () => cancelAnimationFrame(animId);
  }, [activeTransition, pathname]);

  // Hand off to the real Book3D only when BOTH the flight finished AND the destination route
  // is actually on screen. Two rAFs let the new page paint before the proxy unmounts (zero gap).
  useEffect(() => {
    if (!activeTransition || !flightDone) return;
    const targetPath = activeTransition.url.split("?")[0];
    if (pathname !== targetPath) return;

    // Ensure the destination book page is strictly at top (0, 0)
    if (typeof window !== "undefined" && window.scrollY !== 0) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        clearTimers();
        setActiveTransition(null);
        setFlightDone(false);
        setLiveTargetPos(null);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [activeTransition, flightDone, pathname]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => clearTimers();
  }, []);

  const book = activeTransition?.book;
  const startRect = activeTransition?.startRect;

  // Use live subpixel measured coordinates if the destination page has mounted, otherwise accurate clientWidth formula
  const targetPos = liveTargetPos || getTargetPosition();
  const startScale = startRect ? startRect.width / targetWidth : 0.156;
  const startX = startRect ? startRect.left + startRect.width / 2 - targetWidth / 2 : 0;
  const startY = startRect ? startRect.top + startRect.height / 2 - targetHeight / 2 : 0;

  return (
    <BookTransitionContext.Provider
      value={{
        startBookTransition,
        isTransitioning: Boolean(activeTransition),
      }}
    >
      {children}

      {/* ================= SIMULTANEOUS 3D BOOK FLIGHT OVERLAY ================= */}
      {/* Note: The atmospheric glow lives strictly on the page at z-0 behind content so it NEVER renders
          above text or snaps away. The overlay strictly renders the 3D book proxy during flight. */}
      <AnimatePresence>
        {activeTransition && book && (
          <div
            key="book-transition-overlay"
            className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
          >
            {/* The 3D Flying Book: Simultaneously morphing, scaling and rotating inside true 3D perspective */}
            <motion.div
              initial={{
                x: startX,
                y: startY,
              }}
              animate={{
                x: targetPos.x,
                y: targetPos.y,
              }}
              transition={bookFlightTiming}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: targetWidth,
                height: targetHeight,
                perspective: 1200,
                perspectiveOrigin: "center center",
                willChange: "transform",
              }}
              className="pointer-events-none z-20"
            >
              <motion.div
                initial={{
                  scale: startScale,
                  rotateY: 0,
                  rotateX: 0,
                  opacity: 1,
                }}
                animate={{
                  scale: 1,
                  rotateY: -26,
                  rotateX: 10,
                  opacity: 1,
                }}
                transition={bookFlightTiming}
                style={{
                  width: targetWidth,
                  height: targetHeight,
                  transformOrigin: "center center",
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
              >
                <Book3DModelFaces
                  book={book}
                  bookWidth={targetWidth}
                  bookHeight={targetHeight}
                  bookDepth={targetDepth}
                  showSheenSweep={true}
                />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </BookTransitionContext.Provider>
  );
}
