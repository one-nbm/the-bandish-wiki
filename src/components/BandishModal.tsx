"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

interface BandishModalProps {
  bandish: any;
  /** Viewport rect of the card at click time (used for open animation) */
  sourceRect: DOMRect | null;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: (bandish: any) => void;
}

const OPEN_DURATION = 420;  // ms
const CLOSE_DURATION = 350; // ms

/**
 * Gets the current viewport rect of the source card.
 * Falls back to `sourceRect` if the card can't be found.
 */
function getCardRect(bandishId: string, fallback: DOMRect | null): DOMRect | null {
  const el = document.querySelector(`[data-bandish-id="${bandishId}"]`);
  if (el) return el.getBoundingClientRect();
  return fallback;
}

/**
 * Compute transform vars to morph the modal panel from a card rect to center.
 * Writes CSS custom properties onto the panel element.
 */
function applyFromRect(panelEl: HTMLElement, rect: DOMRect) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Match the CSS: max-w-3xl (768px), p-4 sm:p-6 padding on each side
  const sidePad = vw < 640 ? 16 : 24;
  const maxW = Math.min(vw - sidePad * 2, 768);
  const maxH = vh * 0.9;

  const finalCX = vw / 2;
  const finalCY = vh / 2;

  const srcCX = rect.left + rect.width / 2;
  const srcCY = rect.top + rect.height / 2;

  const scaleX = rect.width / maxW;
  const scaleY = rect.height / maxH;
  const tx = srcCX - finalCX;
  const ty = srcCY - finalCY;

  panelEl.style.setProperty("--from-tx", `${tx}px`);
  panelEl.style.setProperty("--from-ty", `${ty}px`);
  panelEl.style.setProperty("--from-sx", `${scaleX}`);
  panelEl.style.setProperty("--from-sy", `${scaleY}`);
}

export function BandishModal({ bandish, sourceRect, isAdmin, onClose, onEdit }: BandishModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeScheduled = useRef(false);

  // ── Open animation ──────────────────────────────────────────────────────────
  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel) return;

    const rect = getCardRect(bandish.id, sourceRect);

    if (rect) {
      applyFromRect(panel, rect);
      // Set "from" state (no transition)
      panel.style.transform = `translate(var(--from-tx), var(--from-ty)) scale(var(--from-sx), var(--from-sy))`;
      panel.style.borderRadius = "24px";
      panel.style.opacity = "0.15";
    } else {
      // Fallback: just fade + scale from center
      panel.style.transform = "scale(0.92)";
      panel.style.opacity = "0";
    }

    if (backdrop) backdrop.style.opacity = "0";

    // Commit "from" state to the GPU before starting transition
    void panel.offsetHeight;

    // expo-out: extremely fast start, long deceleration tail — same organic feel as the Framer Motion logo spring
    const openEase = "cubic-bezier(0.16, 1, 0.3, 1)";
    panel.style.transition = [
      `transform ${OPEN_DURATION}ms ${openEase}`,
      `border-radius ${OPEN_DURATION}ms ${openEase}`,
      `opacity ${Math.round(OPEN_DURATION * 0.3)}ms ease-out`,
    ].join(", ");
    panel.style.transform = "translate(0px, 0px) scale(1, 1)";
    panel.style.borderRadius = "2.5rem";
    panel.style.opacity = "1";

    if (backdrop) {
      backdrop.style.transition = `opacity ${OPEN_DURATION}ms ease`;
      backdrop.style.opacity = "1";
    }

    const timer = setTimeout(() => {
      // Strip inline transitions to restore natural CSS cascade
      if (panel) {
        panel.style.transition = "";
        panel.style.transform = "";
        panel.style.borderRadius = "";
        panel.style.opacity = "";
      }
    }, OPEN_DURATION + 16);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Close animation ─────────────────────────────────────────────────────────
  const triggerClose = useCallback(() => {
    if (closeScheduled.current) return;
    closeScheduled.current = true;

    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel) { onClose(); return; }

    // Fade source card back in *now*, synchronized with the modal close animation.
    // Direct DOM manipulation so it starts immediately without waiting for a React re-render.
    const sourceCard = document.querySelector<HTMLElement>(`[data-bandish-id="${bandish.id}"]`);
    if (sourceCard) {
      sourceCard.style.transition = `opacity ${CLOSE_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      sourceCard.style.opacity = "1";
    }

    // Get fresh card rect (card may have scrolled)
    const rect = getCardRect(bandish.id, sourceRect);
    if (rect) applyFromRect(panel, rect);

    // expo-out on close — snaps back to card position with organic deceleration
    const closeEase = "cubic-bezier(0.16, 1, 0.3, 1)";
    panel.style.transition = [
      `transform ${CLOSE_DURATION}ms ${closeEase}`,
      `border-radius ${CLOSE_DURATION}ms ${closeEase}`,
      `opacity ${Math.round(CLOSE_DURATION * 0.25)}ms ease-out`,
    ].join(", ");

    if (rect) {
      panel.style.transform = `translate(var(--from-tx), var(--from-ty)) scale(var(--from-sx), var(--from-sy))`;
      panel.style.borderRadius = "24px";
    } else {
      panel.style.transform = "scale(0.92)";
      panel.style.borderRadius = "2.5rem";
    }
    panel.style.opacity = "0";

    if (backdrop) {
      backdrop.style.transition = `opacity ${CLOSE_DURATION}ms ease-out`;
      backdrop.style.opacity = "0";
    }

    setTimeout(onClose, CLOSE_DURATION + 16);
  }, [bandish.id, sourceRect, onClose]);

  // Escape key handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") triggerClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [triggerClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={triggerClose}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm"
        style={{ opacity: 0 }}
      />

      {/*
        Morphing panel.
        - `will-change` hints the GPU to composite this element separately.
        - Initial opacity:0 is overridden immediately in the useEffect above.
        - Only `transform`, `opacity`, and `border-radius` ever animate — zero layout cost.
      */}
      <div
        ref={panelRef}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-m3-surface-container-dark rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-m3-surface-high-dark m3-scrollbar"
        style={{ opacity: 0, willChange: "transform, opacity, border-radius" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-6 right-6 md:top-8 md:right-8 flex flex-col gap-2 md:gap-3">
          <button
            onClick={triggerClose}
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
  );
}
