"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { BookMetadata, getBookGlowColor } from "@/data/books";
import { useBookTransition } from "./BookTransitionContext";

interface Book3DProps {
  book: BookMetadata;
  className?: string;
}

export function Book3D({ book, className = "" }: Book3DProps) {
  const { isTransitioning } = useBookTransition();
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const orbitStartTime = useRef<number | null>(null);

  // Rotation motion values (degrees) - Default 3/4 beauty view
  const dragRotateY = useMotionValue(-26);
  const dragRotateX = useMotionValue(10);

  // Smoothed springs for organic tactile inertia
  const smoothRotateY = useSpring(dragRotateY, { stiffness: 180, damping: 24 });
  const smoothRotateX = useSpring(dragRotateX, { stiffness: 180, damping: 24 });

  // Drag interaction tracking
  const dragStartRef = useRef<{ x: number; y: number; startRotY: number; startRotX: number } | null>(null);

  // Hold landing beauty pose peacefully on arrival, then smoothly ease into orbit
  useEffect(() => {
    if (isTransitioning) {
      setIsSpinning(false);
      return;
    }
    const timer = setTimeout(() => {
      orbitStartTime.current = performance.now();
      setIsSpinning(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [isTransitioning]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    setIsSpinning(false);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startRotY: dragRotateY.get(),
      startRotX: dragRotateX.get(),
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [dragRotateY, dragRotateX]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    const newRotY = dragStartRef.current.startRotY + deltaX * 0.65;
    const newRotX = Math.max(-35, Math.min(35, dragStartRef.current.startRotX - deltaY * 0.45));

    dragRotateY.set(newRotY);
    dragRotateX.set(newRotX);
  }, [isDragging, dragRotateY, dragRotateX]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    dragStartRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    // Resume auto-orbit smoothly after user finishes inspecting
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      orbitStartTime.current = performance.now();
      setIsSpinning(true);
    }, 800);
  }, []);

  // Keyboard accessibility: Left / Right arrows to rotate, Home / Escape to reset
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIsSpinning(false);
        dragRotateY.set(dragRotateY.get() - 15);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setIsSpinning(false);
        dragRotateY.set(dragRotateY.get() + 15);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIsSpinning(false);
        dragRotateX.set(Math.min(35, dragRotateX.get() + 8));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setIsSpinning(false);
        dragRotateX.set(Math.max(-35, dragRotateX.get() - 8));
      } else if (e.key === "Home" || e.key === "Escape") {
        e.preventDefault();
        dragRotateY.set(-26);
        dragRotateX.set(10);
      }

      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        orbitStartTime.current = performance.now();
        setIsSpinning(true);
      }, 1500);
    },
    [dragRotateY, dragRotateX]
  );

  // Ambient continuous orbit loop with smooth acceleration
  useEffect(() => {
    if (!isSpinning) return;
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Smooth acceleration from 0 deg/s up to 20 deg/s over 1000ms
      const elapsed = orbitStartTime.current ? (time - orbitStartTime.current) / 1000 : 1;
      const progress = Math.min(1, elapsed / 1.0);
      const easeSpeed = progress * progress * 20;

      const current = dragRotateY.get();
      dragRotateY.set(current + delta * easeSpeed);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isSpinning, dragRotateY]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const { coverTheme } = book;

  // Book physical dimensions (reduced depth by 25% from 42px to 31.5px)
  const bookWidth = 230;
  const bookHeight = 330;
  const bookDepth = 31.5;
  const halfDepth = bookDepth / 2;

  const handleResetPose = (e: React.MouseEvent) => {
    e.stopPropagation();
    dragRotateY.set(-26);
    dragRotateX.set(10);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center select-none pt-1 pb-2 ${className} ${
        isTransitioning ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* 3D Scene Viewport with Accessible Keyboard Navigation */}
      <div
        tabIndex={0}
        role="region"
        aria-label={`Interactive 3D model of ${book.title}. Drag with pointer or use arrow keys to rotate 360 degrees.`}
        className="relative flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y focus:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary dark:focus-visible:ring-m3-primary-dark rounded-2xl"
        style={{
          perspective: 1200,
          width: bookWidth + 40,
          height: bookHeight + 30,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        {/* Soft Ambient Glow Halo (Strictly flat: diffuse blur, no box-shadows, deintensified in light mode) */}
        <div
          className="absolute inset-0 rounded-full blur-[70px] pointer-events-none opacity-[0.10] dark:opacity-20 transition-all duration-700"
          style={{ background: getBookGlowColor(book) }}
        />

        {/* 3D Transform Origin Rig (No CSS transition here to prevent fighting Framer Motion spring) */}
        <motion.div
          style={{
            width: bookWidth,
            height: bookHeight,
            transformStyle: "preserve-3d",
            rotateY: smoothRotateY,
            rotateX: smoothRotateX,
          }}
          className="relative pointer-events-none"
        >
          {/* ================= INTERNAL SOLID CORE (Prevents Subpixel Light Bleeds) ================= */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: coverTheme.spineBg,
              transform: "translateZ(0px)",
            }}
          />

          {/* ================= 1. FRONT COVER (Z = +halfDepth) ================= */}
          <div
            className="absolute inset-0 rounded-[3px] overflow-hidden border border-black/10 dark:border-white/10 flex flex-col justify-between pointer-events-none"
            style={{
              width: bookWidth,
              height: bookHeight,
              background: coverTheme.primaryBg,
              transform: `translateZ(${halfDepth}px)`,
              backfaceVisibility: "hidden",
            }}
          >
            {book.coverImage ? (
              /* Real Printed Book Cover Art */
              <div className="relative w-full h-full">
                <Image
                  src={book.coverImage}
                  alt={`${book.title} Cover`}
                  fill
                  priority
                  sizes={`${bookWidth}px`}
                  className="object-cover object-center w-full h-full pointer-events-none"
                />
                {/* Subtle Lighting Key Specular Sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/10 pointer-events-none" />

                {/* Spine Hinge Crease Shadow Texture */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/50 via-black/15 to-transparent pointer-events-none" />
              </div>
            ) : (
              /* Procedural Leather & Gold Foil Cover (Fallback) */
              <div className="relative w-full h-full flex flex-col justify-between p-6">
                {/* Subtle Lighting Key Gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />

                {/* Spine Hinge Crease Texture */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />

                {/* Inset Gold Foil Filigree Borders */}
                <div
                  className="absolute inset-3 rounded-[2px] border border-dashed opacity-75 pointer-events-none"
                  style={{ borderColor: coverTheme.goldTrim }}
                />
                <div
                  className="absolute inset-4 rounded-[2px] border opacity-30 pointer-events-none"
                  style={{ borderColor: coverTheme.goldTrim }}
                />

                {/* Top Ornamental Header */}
                <div className="relative z-10 text-center pt-2">
                  <span
                    className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] block"
                    style={{ color: coverTheme.subtextColor }}
                  >
                    {book.publisher ? book.publisher.split(",")[0] : "Sangeet Shastra"}
                  </span>
                  <div
                    className="w-12 h-0.5 mx-auto mt-2 rounded-full opacity-60"
                    style={{ background: coverTheme.goldTrim }}
                  />
                </div>

                {/* Centerpiece: Medallion & Title */}
                <div className="relative z-10 text-center my-auto px-2">
                  {/* Ornate Gold Emblem */}
                  <div
                    className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center border"
                    style={{
                      borderColor: coverTheme.goldTrim,
                      background: "radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)",
                    }}
                  >
                    <span
                      className="material-symbols-rounded text-2xl"
                      style={{ color: coverTheme.goldTrim }}
                    >
                      menu_book
                    </span>
                  </div>

                  {/* Title in English */}
                  <h2
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-1"
                    style={{
                      color: coverTheme.textColor,
                      fontVariationSettings: '"wght" 900, "wdth" 130',
                    }}
                  >
                    {book.title}
                  </h2>

                  {/* Title in Devanagari */}
                  {book.originalTitleDevanagari && (
                    <p
                      className="text-lg sm:text-xl font-bold opacity-90 mt-1"
                      style={{ color: coverTheme.subtextColor }}
                    >
                      {book.originalTitleDevanagari}
                    </p>
                  )}
                </div>

                {/* Bottom: Author & Publication */}
                <div className="relative z-10 text-center pb-2">
                  <div
                    className="w-16 h-0.5 mx-auto mb-2.5 rounded-full opacity-60"
                    style={{ background: coverTheme.goldTrim }}
                  />
                  <p
                    className="text-xs sm:text-sm font-bold tracking-wide line-clamp-1"
                    style={{ color: coverTheme.textColor }}
                  >
                    {book.authors[0] || "Traditional Anthology"}
                  </p>
                  {book.publisher && (
                    <p
                      className="text-[10px] tracking-wider uppercase opacity-75 mt-0.5 line-clamp-1"
                      style={{ color: coverTheme.subtextColor }}
                    >
                      {book.publisher.split(",")[0]}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ================= 2. BACK COVER (Z = -halfDepth) ================= */}
          <div
            className="absolute inset-0 rounded-[3px] overflow-hidden border border-black/20 dark:border-white/10 flex flex-col justify-between p-6 pointer-events-none"
            style={{
              width: bookWidth,
              height: bookHeight,
              background: coverTheme.primaryBg,
              transform: `rotateY(180deg) translateZ(${halfDepth}px)`,
              backfaceVisibility: "hidden",
            }}
          >
            {/* Subtle Lighting Key Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tl from-black/40 via-transparent to-white/10 pointer-events-none" />

            {/* Spine Hinge Crease (Right side in back cover perspective, next to world X = 0) */}
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-black/60 via-black/20 to-transparent pointer-events-none" />

            {/* Inset Subtle Filigree Border */}
            <div
              className="absolute inset-3 rounded-[2px] border border-dashed border-white/20 opacity-40 pointer-events-none"
            />

            {/* Top Back Header */}
            <div className="relative z-10 text-center pt-2">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em] block"
                style={{ color: coverTheme.subtextColor }}
              >
                {book.title}
              </span>
            </div>

            {/* Center Summary Blurb */}
            <div className="relative z-10 px-2 text-center">
              <p
                className="text-[11px] leading-relaxed line-clamp-6 font-medium italic opacity-90"
                style={{ color: coverTheme.subtextColor }}
              >
                &ldquo;{book.description}&rdquo;
              </p>
            </div>

            {/* Bottom Archival Seal / Barcode */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 pb-2">
              <div
                className="w-16 h-5 border border-dashed border-white/20 rounded flex items-center justify-center opacity-60"
              >
                <span
                  className="text-[8px] font-mono tracking-widest uppercase font-bold"
                  style={{ color: coverTheme.subtextColor }}
                >
                  BW-ARCHIVE
                </span>
              </div>
              <span
                className="text-[9px] tracking-wider uppercase font-semibold opacity-75"
                style={{ color: coverTheme.subtextColor }}
              >
                The Bandish Wiki Library
              </span>
            </div>
          </div>

          {/* ================= 3. SPINE (X = 0, Left Side) ================= */}
          <div
            className="absolute left-0 top-0 overflow-hidden border-y border-l border-black/20 dark:border-white/10 flex flex-col justify-between items-center py-5 pointer-events-none"
            style={{
              width: bookDepth,
              height: bookHeight,
              background: `linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.08) 35%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.5) 100%), ${coverTheme.spineBg}`,
              transform: `translateX(-50%) rotateY(-90deg)`,
              backfaceVisibility: "hidden",
            }}
          >
            {/* Head Subtle Band */}
            <div
              className="w-full h-1 border-y border-white/20 bg-white/10 opacity-70"
            />

            {/* Vertical Spine Title */}
            <div className="flex-1 flex items-center justify-center my-4 overflow-hidden">
              <span
                className="text-xs sm:text-sm font-bold tracking-widest uppercase whitespace-nowrap rotate-90"
                style={{ color: coverTheme.textColor }}
              >
                {book.title}
              </span>
            </div>

            {/* Tail Subtle Band & Music Emblem */}
            <div className="flex flex-col items-center gap-2">
              <span
                className="material-symbols-rounded text-sm"
                style={{ color: coverTheme.textColor }}
              >
                music_note
              </span>
              <div
                className="w-full h-1 border-y border-white/20 bg-white/10 opacity-70"
              />
            </div>
          </div>

          {/* ================= 4. RIGHT FORE-EDGE (X = bookWidth, Pages Block) ================= */}
          <div
            className="absolute left-0 top-0 flex flex-col justify-between overflow-hidden border-y border-amber-900/25 pointer-events-none"
            style={{
              width: bookDepth,
              height: bookHeight,
              background: coverTheme.pagesBg,
              transform: `translateX(${bookWidth - halfDepth}px) rotateY(90deg)`,
              backfaceVisibility: "hidden",
            }}
          >
            {/* Fine Paper Lines Repeating Pattern (Stacked Sheets from Top to Bottom) */}
            <div
              className="w-full h-full opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, #d4a373 0px, #d4a373 1px, transparent 1px, transparent 3px)",
              }}
            />

            {/* Soft Ambient Depth Shadows at Top & Bottom Page Junctions */}
            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>

          {/* ================= 5. TOP PAGE BLOCK (Y = 0, Head Edge) ================= */}
          <div
            className="absolute left-0 top-0 flex items-center justify-between overflow-hidden border-x border-amber-900/25 pointer-events-none"
            style={{
              width: bookWidth,
              height: bookDepth,
              background: coverTheme.pagesBg,
              transform: `translateY(-50%) rotateX(90deg)`,
              backfaceVisibility: "hidden",
            }}
          >
            {/* Headband Cloth Wrap Accent along Spine (Left 4px) */}
            <div
              className="w-1.5 h-full opacity-90 shrink-0"
              style={{ background: coverTheme.spineBg }}
            />

            {/* Authentic Stacked Paper Sheets (Repeating from Front Cover to Back Cover) */}
            <div
              className="flex-1 h-full opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, #d4a373 0px, #d4a373 1px, transparent 1px, transparent 3px)",
              }}
            />

            {/* Spine Hinge Depth Vignette on Left */}
            <div className="absolute left-0 inset-y-0 w-4 bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />
          </div>

          {/* ================= 6. BOTTOM PAGE BLOCK (Y = bookHeight, Tail Edge) ================= */}
          <div
            className="absolute left-0 top-0 flex items-center justify-between overflow-hidden border-x border-amber-900/25 pointer-events-none"
            style={{
              width: bookWidth,
              height: bookDepth,
              background: coverTheme.pagesBg,
              transform: `translateY(${bookHeight - halfDepth}px) rotateX(-90deg)`,
              backfaceVisibility: "hidden",
            }}
          >
            {/* Tailband Cloth Wrap Accent along Spine (Left 4px) */}
            <div
              className="w-1.5 h-full opacity-90 shrink-0"
              style={{ background: coverTheme.spineBg }}
            />

            {/* Stacked Paper Sheets Pattern */}
            <div
              className="flex-1 h-full opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, #d4a373 0px, #d4a373 1px, transparent 1px, transparent 3px)",
              }}
            />

            {/* Spine Hinge Depth Vignette on Left */}
            <div className="absolute left-0 inset-y-0 w-4 bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>

      {/* Rotation Hint & Camera Reset Affordance */}
      <div className="mt-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-m3-surface-container-dark/70 border border-m3-surface-high dark:border-m3-surface-high-dark text-[11px] font-medium text-gray-500 dark:text-gray-400 select-none">
          <span className="material-symbols-rounded text-xs text-m3-primary dark:text-m3-primary-dark">
            360
          </span>
          <span>Drag or use arrow keys to rotate</span>
        </span>
        <button
          type="button"
          onClick={handleResetPose}
          title="Reset to default view"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/70 dark:bg-m3-surface-container-dark/70 border border-m3-surface-high dark:border-m3-surface-high-dark text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:border-m3-primary dark:hover:border-m3-primary-dark transition-all cursor-pointer"
        >
          <span className="material-symbols-rounded text-xs">restart_alt</span>
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}

