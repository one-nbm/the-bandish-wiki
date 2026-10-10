"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { motion, useIsPresent } from "framer-motion";
import { ReactLenis } from 'lenis/react';
import { LENIS_OPTIONS } from './SmoothScrolling';

import { UserRole } from "@/app/actions";

interface BandishModalProps {
  bandish: any;
  sourceRect: DOMRect | null;
  isAdmin: boolean;
  userRole?: UserRole;
  onClose: () => void;
  onEdit: (bandish: any) => void;
}

export function BandishModal({ bandish, isAdmin, userRole, onClose, onEdit }: BandishModalProps) {
  const isPresent = useIsPresent();
  const effectiveRole: UserRole = userRole || (isAdmin ? "admin" : "viewer");

  // Escape key handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: isPresent ? 0.35 : 0.2, ease: "easeInOut" }}
        className="absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm"
        style={{ willChange: "opacity" }}
      />

      {/*
        Standard scale/fade entrance animation.
        Replaces the expensive layoutId morph animation for better performance.
      */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{
          duration: isPresent ? 0.4 : 0.2,
          ease: isPresent ? [0.34, 1.56, 0.64, 1] : "easeInOut"
        }}
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-m3-surface-container-dark rounded-[2.5rem] border border-gray-100 dark:border-m3-surface-high-dark overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ willChange: "transform, opacity, border-radius", transform: "translateZ(0)" }}
      >
        <ReactLenis 
          options={LENIS_OPTIONS} 
          data-lenis-prevent="true"
          className="w-full max-h-[90vh] overflow-y-auto m3-scrollbar overscroll-contain"
          onWheel={(e: React.WheelEvent) => e.stopPropagation()}
          onTouchMove={(e: React.TouchEvent) => e.stopPropagation()}
        >
          <motion.div
            initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.1, delay: 0 } }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="p-6 sm:p-8 md:p-12"
        >
          <div className="absolute top-6 right-6 md:top-8 md:right-8 flex flex-col gap-2 md:gap-3">
            <button
              onClick={onClose}
              className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-gray-900 dark:text-white rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-rounded text-[1.4rem]">close</span>
            </button>
            {effectiveRole === "admin" ? (
              <button
                onClick={() => onEdit(bandish)}
                className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-m3-primary dark:text-m3-primary-dark rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                title="Edit Bandish"
              >
                <span className="material-symbols-rounded text-[1.4rem]">edit</span>
              </button>
            ) : effectiveRole === "contributor" ? (
              <button
                onClick={() => onEdit(bandish)}
                className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-m3-tertiary dark:text-m3-tertiary-dark rounded-full transition-all duration-200 hover:scale-105 active:scale-95 border border-m3-tertiary/30"
                title="Suggest Edits to Bandish"
              >
                <span className="material-symbols-rounded text-[1.4rem]">edit_note</span>
              </button>
            ) : null}
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
              {bandish.lay?.map((l: string, i: number) => (
                <span key={`modal-lay-${i}`} className="bg-m3-secondary/10 dark:bg-m3-secondary-dark/10 text-m3-secondary dark:text-m3-secondary-dark px-4 py-2 rounded-full text-sm font-bold tracking-wide">
                  {l}
                </span>
              ))}
              <span className="bg-m3-tertiary/10 dark:bg-m3-tertiary-dark/10 text-m3-tertiary dark:text-m3-tertiary-dark px-4 py-2 rounded-full text-sm font-bold tracking-wide">
                {bandish.composer}
              </span>
              <span className="bg-m3-surface-high dark:bg-m3-surface-high-dark text-gray-800 dark:text-gray-200 px-4 py-2 rounded-full text-sm font-bold tracking-wide">
                {bandish.tradition || "N/A"}
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
        </motion.div>
      </ReactLenis>
    </motion.div>
    </motion.div>
  );
}
