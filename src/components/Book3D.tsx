"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { BookMetadata, getBookGlowColor } from "@/data/books";
import { useBookTransition } from "./BookTransitionContext";
import { Book3DModelFaces } from "./Book3DModelFaces";

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

  // Book physical dimensions (reduced depth by 25% from 42px to 31.5px)
  const bookWidth = 230;
  const bookHeight = 330;
  const bookDepth = 31.5;

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center select-none pt-1 pb-2 ${className} ${
        isTransitioning ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* 3D Scene Viewport with Accessible Keyboard Navigation */}
      <div
        id="hero-book-3d-viewport"
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
          <Book3DModelFaces
            book={book}
            bookWidth={bookWidth}
            bookHeight={bookHeight}
            bookDepth={bookDepth}
          />
        </motion.div>
      </div>
    </div>
  );
}
