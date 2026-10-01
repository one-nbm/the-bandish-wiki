"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

interface BandishModalProps {
  bandish: any;
  sourceRect: DOMRect | null;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: (bandish: any) => void;
}

/*
  MORPH ANIMATION — MANUAL FLIP WITH CSS TRANSITIONS
  =====================================================
  Instead of using Framer Motion's layoutId (which coordinates ALL 138 registered
  elements on every animation frame via JS), we implement a manual FLIP:

  OPEN:
  1. Modal mounts at full size / center position (its natural layout).
  2. We immediately measure the modal's final bounding rect.
  3. We calculate the transform needed to make the modal LOOK like it's at the
     source card's position (scale + translate).
  4. We apply that transform instantly (no transition yet) to "warp" it to the card.
  5. On the next rAF we remove the transform override — the CSS transition takes 
     over and smoothly animates from card to center. 100% GPU compositor thread.

  CLOSE:
  1. We re-apply the source-card transform with CSS transition active.
  2. After the duration, we call onClose() to unmount.

  PERFORMANCE DELTA vs layoutId approach:
  - BEFORE: Framer runs ProjectionNode math on 138 nodes per frame in JS.
  - AFTER:  Browser's CSS engine handles a single transform tween on the GPU.
  - Estimated improvement: ~60-80% reduction in main thread work per frame.
*/
export function BandishModal({ bandish, sourceRect, isAdmin, onClose, onEdit }: BandishModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Compute the CSS transform that maps modal center → source card position
  const getSourceTransform = useCallback((panelEl: HTMLDivElement): string => {
    if (!sourceRect) return "none";
    const panelRect = panelEl.getBoundingClientRect();

    const scaleX = sourceRect.width / panelRect.width;
    const scaleY = sourceRect.height / panelRect.height;
    // Use the smaller scale so the panel never overflows the card rect
    const scale = Math.min(scaleX, scaleY);

    const panelCenterX = panelRect.left + panelRect.width / 2;
    const panelCenterY = panelRect.top + panelRect.height / 2;
    const cardCenterX = sourceRect.left + sourceRect.width / 2;
    const cardCenterY = sourceRect.top + sourceRect.height / 2;

    const tx = cardCenterX - panelCenterX;
    const ty = cardCenterY - panelCenterY;

    return `translate(${tx}px, ${ty}px) scale(${scale})`;
  }, [sourceRect]);

  // OPEN animation — runs once on mount
  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const content = contentRef.current;
    if (!panel) return;

    // Step 1: Hide content immediately (it will fade in separately)
    if (content) content.style.opacity = "0";
    if (backdrop) { backdrop.style.opacity = "0"; backdrop.style.transition = "none"; }

    // Step 2: Snap to source card position with NO transition
    panel.style.transition = "none";
    panel.style.transform = getSourceTransform(panel);
    panel.style.opacity = "1";

    // Step 3: Force a style flush, then begin the transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.style.transition = "transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease";
        panel.style.transform = "none";

        // Fade in backdrop
        if (backdrop) {
          backdrop.style.transition = "opacity 0.35s ease";
          backdrop.style.opacity = "1";
        }

        // Fade in content after panel has mostly settled
        setTimeout(() => {
          if (content) {
            content.style.transition = "opacity 0.2s ease";
            content.style.opacity = "1";
          }
        }, 200);
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CLOSE animation
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);

    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const content = contentRef.current;

    // Fade out content immediately
    if (content) { content.style.transition = "opacity 0.12s ease"; content.style.opacity = "0"; }

    // Animate panel back to source card
    if (panel) {
      panel.style.transition = "transform 0.38s cubic-bezier(0.4, 0, 0.8, 0.6), opacity 0.2s ease 0.2s";
      panel.style.transform = getSourceTransform(panel);
      panel.style.opacity = "0";
    }

    // Fade out backdrop
    if (backdrop) { backdrop.style.transition = "opacity 0.35s ease"; backdrop.style.opacity = "0"; }

    // Unmount after animation completes
    setTimeout(onClose, 420);
  }, [isClosing, getSourceTransform, onClose]);

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop — separate from panel so it animates independently */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm"
        style={{ opacity: 0, willChange: "opacity" }}
      />

      {/*
        Modal panel.
        Initial opacity:0 is set in JS before the first rAF so it doesn't flash.
        willChange: transform promotes this to its own GPU compositor layer,
        ensuring the CSS transition runs entirely off the main thread.
      */}
      <div
        ref={panelRef}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-m3-surface-container-dark rounded-[2rem] border border-gray-100 dark:border-m3-surface-high-dark m3-scrollbar"
        onClick={(e) => e.stopPropagation()}
        style={{ opacity: 0, willChange: "transform, opacity", transformOrigin: "center center" }}
      >
        {/* Content wrapper — fades in after the panel has reached center */}
        <div ref={contentRef} className="p-8 md:p-12" style={{ opacity: 0, willChange: "opacity" }}>
          <div className="absolute top-6 right-6 md:top-8 md:right-8 flex flex-col gap-2 md:gap-3">
            <button
              onClick={handleClose}
              className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-gray-900 dark:text-white rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-rounded text-[1.4rem]">close</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => onEdit(bandish)}
                className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-m3-primary dark:text-m3-primary-dark rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                title="Edit Bandish"
              >
                <span className="material-symbols-rounded text-[1.4rem]">edit</span>
              </button>
            )}
          </div>

          <div className="pr-12 mb-8 mt-2">
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight"
              style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}
            >
              {bandish.title}
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/raag/${bandish.raag.toLowerCase().replace(/\s+/g, "-")}`}
                className="group flex items-center gap-1.5 bg-m3-secondary/10 hover:bg-m3-secondary/20 dark:bg-m3-secondary-dark/10 dark:hover:bg-m3-secondary-dark/20 text-m3-secondary dark:text-m3-secondary-dark px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300"
              >
                {bandish.raag}
                <span className="material-symbols-rounded text-[1rem] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                  arrow_outward
                </span>
              </Link>
              <span className="bg-m3-secondary/10 dark:bg-m3-secondary-dark/10 text-m3-secondary dark:text-m3-secondary-dark px-4 py-2 rounded-full text-sm font-bold tracking-wide">
                {bandish.taal}
              </span>
              <span className="bg-m3-tertiary/10 dark:bg-m3-tertiary-dark/10 text-m3-tertiary dark:text-m3-tertiary-dark px-4 py-2 rounded-full text-sm font-bold tracking-wide">
                {bandish.composer}
              </span>
            </div>
          </div>

          <div className="space-y-8 md:space-y-10">
            {bandish.lyrics.devanagari && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider transition-colors duration-300">
                    Devanagari
                  </h3>
                  <CopyButton textToCopy={bandish.lyrics.devanagari} />
                </div>
                <p className="text-gray-900 dark:text-white text-xl md:text-2xl leading-relaxed whitespace-pre-wrap font-medium transition-colors duration-300">
                  {bandish.lyrics.devanagari}
                </p>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider transition-colors duration-300">
                  Transliteration
                </h3>
                <CopyButton textToCopy={bandish.lyrics.english} />
              </div>
              <p className="text-gray-900 dark:text-white text-xl md:text-2xl leading-relaxed whitespace-pre-wrap font-medium transition-colors duration-300">
                {bandish.lyrics.english}
              </p>
            </div>
            <div className="pt-4 flex justify-end">
              <Link
                href={`/bandish/${bandish.id}`}
                className="flex items-center gap-2 bg-m3-primary/10 hover:bg-m3-primary/20 dark:bg-m3-primary-dark/10 dark:hover:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span>Open Full View</span>
                <span className="material-symbols-rounded text-[1.2rem]">arrow_outward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

