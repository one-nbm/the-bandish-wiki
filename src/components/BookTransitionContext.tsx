"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookMetadata } from "@/data/books";

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
                {/* Internal Solid Core */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: book.coverTheme.spineBg,
                    transform: "translateZ(0px)",
                  }}
                />

                {/* Front Cover */}
                <div
                  className="absolute inset-0 rounded-[3px] overflow-hidden border border-black/10 dark:border-white/10 flex flex-col justify-between"
                  style={{
                    background: book.coverTheme.primaryBg,
                    transform: `translateZ(${halfDepth}px)`,
                    backfaceVisibility: "hidden",
                  }}
                >
                  {book.coverImage ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        fill
                        priority
                        sizes="250px"
                        className="object-cover object-center w-full h-full pointer-events-none"
                      />
                      {/* Spine crease texture */}
                      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/50 via-black/15 to-transparent pointer-events-none" />
                      {/* Dynamic specular lighting sheen sweep as the book tilts */}
                      <motion.div
                        initial={{ opacity: 0, x: "-100%" }}
                        animate={{ opacity: [0, 0.45, 0], x: ["-40%", "140%"] }}
                        transition={{ duration: TRANSITION_DURATION, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none -skew-x-12"
                      />
                    </div>
                  ) : (
                    /* Procedural Leather & Gold Foil Cover (Identical to Book3D) */
                    <div className="relative w-full h-full flex flex-col justify-between p-6">
                      {/* Subtle Lighting Key Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />

                      {/* Spine Hinge Crease Texture */}
                      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />

                      {/* Inset Gold Foil Filigree Borders */}
                      <div
                        className="absolute inset-3 rounded-[2px] border border-dashed opacity-75 pointer-events-none"
                        style={{ borderColor: book.coverTheme.goldTrim }}
                      />
                      <div
                        className="absolute inset-4 rounded-[2px] border opacity-30 pointer-events-none"
                        style={{ borderColor: book.coverTheme.goldTrim }}
                      />

                      {/* Top Ornamental Header */}
                      <div className="relative z-10 text-center pt-2">
                        <span
                          className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] block"
                          style={{ color: book.coverTheme.subtextColor }}
                        >
                          {book.publisher ? book.publisher.split(",")[0] : "Sangeet Shastra"}
                        </span>
                        <div
                          className="w-12 h-0.5 mx-auto mt-2 rounded-full opacity-60"
                          style={{ background: book.coverTheme.goldTrim }}
                        />
                      </div>

                      {/* Centerpiece: Medallion & Title */}
                      <div className="relative z-10 text-center my-auto px-2">
                        <div
                          className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center border"
                          style={{
                            background: `radial-gradient(circle, ${book.coverTheme.goldTrim}30 0%, transparent 70%)`,
                            borderColor: book.coverTheme.goldTrim,
                          }}
                        >
                          <span
                            className="material-symbols-rounded text-2xl"
                            style={{ color: book.coverTheme.goldTrim }}
                          >
                            auto_stories
                          </span>
                        </div>

                        <h3
                          className="font-extrabold text-xl leading-snug tracking-wide line-clamp-2"
                          style={{
                            fontVariationSettings: '"wght" 800, "wdth" 120',
                            color: book.coverTheme.textColor,
                          }}
                        >
                          {book.title}
                        </h3>

                        {book.originalTitleDevanagari && (
                          <p
                            className="text-sm font-semibold mt-1"
                            style={{ color: book.coverTheme.subtextColor }}
                          >
                            {book.originalTitleDevanagari}
                          </p>
                        )}
                      </div>

                      {/* Bottom Author & Publisher Imprint */}
                      <div className="relative z-10 text-center pb-2">
                        <div
                          className="w-10 h-0.5 mx-auto mb-2 rounded-full opacity-50"
                          style={{ background: book.coverTheme.goldTrim }}
                        />
                        <p
                          className="text-xs font-bold tracking-wider"
                          style={{ color: book.coverTheme.textColor }}
                        >
                          {book.authors[0] || "Archival Treatise"}
                        </p>
                        {book.edition && (
                          <p
                            className="text-[9px] font-medium tracking-widest uppercase mt-0.5 opacity-80"
                            style={{ color: book.coverTheme.subtextColor }}
                          >
                            {book.edition.split("(")[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Back Cover */}
                <div
                  className="absolute inset-0 rounded-[3px] overflow-hidden border border-black/20 dark:border-white/10 p-5 flex flex-col justify-between"
                  style={{
                    background: book.coverTheme.primaryBg,
                    transform: `rotateY(180deg) translateZ(${halfDepth}px)`,
                    backfaceVisibility: "hidden",
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-tl from-black/40 via-transparent to-white/10" />
                </div>

                {/* 3D Spine */}
                <div
                  className="absolute left-0 top-0 overflow-hidden border-y border-l border-black/20 dark:border-white/10 flex flex-col justify-between items-center py-4"
                  style={{
                    width: targetDepth,
                    height: "100%",
                    background: `linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.08) 35%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.5) 100%), ${book.coverTheme.spineBg}`,
                    transform: `translateX(-50%) rotateY(-90deg)`,
                    backfaceVisibility: "hidden",
                  }}
                >
                  <div className="w-full h-1 border-y border-white/20 bg-white/10" />
                  <span
                    className="text-[11px] font-bold tracking-widest uppercase whitespace-nowrap rotate-90"
                    style={{ color: book.coverTheme.textColor }}
                  >
                    {book.title}
                  </span>
                  <div className="w-full h-1 border-y border-white/20 bg-white/10" />
                </div>

                {/* Fore-Edge (Page Block) */}
                <div
                  className="absolute left-0 top-0 overflow-hidden border-y border-amber-900/25"
                  style={{
                    width: targetDepth,
                    height: "100%",
                    background: book.coverTheme.pagesBg,
                    transform: `translateX(${targetWidth - halfDepth}px) rotateY(90deg)`,
                    backfaceVisibility: "hidden",
                  }}
                >
                  <div
                    className="w-full h-full opacity-35"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(to bottom, #d4a373 0px, #d4a373 1px, transparent 1px, transparent 3px)",
                    }}
                  />
                </div>

                {/* Top Page Block */}
                <div
                  className="absolute left-0 top-0 overflow-hidden border-x border-amber-900/25"
                  style={{
                    width: "100%",
                    height: targetDepth,
                    background: book.coverTheme.pagesBg,
                    transform: `translateY(-50%) rotateX(90deg)`,
                    backfaceVisibility: "hidden",
                  }}
                />

                {/* Bottom Page Block */}
                <div
                  className="absolute left-0 top-0 overflow-hidden border-x border-amber-900/25"
                  style={{
                    width: "100%",
                    height: targetDepth,
                    background: book.coverTheme.pagesBg,
                    transform: `translateY(${targetHeight - halfDepth}px) rotateX(-90deg)`,
                    backfaceVisibility: "hidden",
                  }}
                />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </BookTransitionContext.Provider>
  );
}
