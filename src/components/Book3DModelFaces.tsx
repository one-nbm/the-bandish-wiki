"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookMetadata } from "@/data/books";

interface Book3DModelFacesProps {
  book: BookMetadata;
  bookWidth?: number;
  bookHeight?: number;
  bookDepth?: number;
  showSheenSweep?: boolean;
}

/**
 * Unified 3D Book Faces Model Component
 * Single source of truth for 3D book faces across both the floating page-transition rig
 * and the interactive hero Book3D component, ensuring 100% pixel-perfect font, layout,
 * and aesthetic synchronization without jarring visual jumps or font mismatches.
 */
export function Book3DModelFaces({
  book,
  bookWidth = 230,
  bookHeight = 330,
  bookDepth = 31.5,
  showSheenSweep = false,
}: Book3DModelFacesProps) {
  const { coverTheme } = book;
  const halfDepth = bookDepth / 2;

  // Split title if it contains volume designation (e.g. "Sangita Raga-Kalpadruma, Vol. 1")
  let mainTitle = book.title;
  let volumeBadge: string | null = null;
  if (book.title.includes(",")) {
    const parts = book.title.split(/,\s*/);
    mainTitle = parts[0];
    volumeBadge = parts.slice(1).join(", ");
  } else if (/vol\.\s*\d+/i.test(book.title)) {
    const match = book.title.match(/(.*?)\s+(vol\.\s*\d+.*)/i);
    if (match) {
      mainTitle = match[1];
      volumeBadge = match[2];
    }
  }

  return (
    <>
      {/* ================= INTERNAL SOLID CORE ================= */}
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

            {/* Optional flight sheen sweep */}
            {showSheenSweep && (
              <motion.div
                initial={{ opacity: 0, x: "-100%" }}
                animate={{ opacity: [0, 0.45, 0], x: ["-40%", "140%"] }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none -skew-x-12"
              />
            )}
          </div>
        ) : (
          /* Procedural Leather & Gold Foil Cover */
          <div className="relative w-full h-full flex flex-col justify-between px-4 py-4">
            {/* Subtle Lighting Key Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />

            {/* Spine Hinge Crease Texture */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />

            {/* Optional flight sheen sweep */}
            {showSheenSweep && (
              <motion.div
                initial={{ opacity: 0, x: "-100%" }}
                animate={{ opacity: [0, 0.45, 0], x: ["-40%", "140%"] }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none -skew-x-12"
              />
            )}

            {/* Inset Gold Foil Filigree Borders */}
            <div
              className="absolute inset-2.5 rounded-[2px] border border-dashed opacity-75 pointer-events-none"
              style={{ borderColor: coverTheme.goldTrim }}
            />
            <div
              className="absolute inset-3.5 rounded-[2px] border opacity-30 pointer-events-none"
              style={{ borderColor: coverTheme.goldTrim }}
            />

            {/* Top Ornamental Header */}
            <div className="relative z-10 text-center pt-1">
              <span
                className="text-[8.5px] sm:text-[9px] font-bold uppercase tracking-[0.12em] block line-clamp-2 max-w-[170px] mx-auto leading-tight"
                style={{ color: coverTheme.subtextColor }}
              >
                {book.publisher ? book.publisher.split(",")[0] : "Sangeet Shastra"}
              </span>
              <div
                className="w-10 h-0.5 mx-auto mt-1.5 rounded-full opacity-60"
                style={{ background: coverTheme.goldTrim }}
              />
            </div>

            {/* Centerpiece: Medallion & Title */}
            <div className="relative z-10 text-center my-auto px-1.5">
              {/* Ornate Gold Emblem */}
              <div
                className="w-9 h-9 mx-auto mb-2 rounded-full flex items-center justify-center border"
                style={{
                  borderColor: coverTheme.goldTrim,
                  background: "radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)",
                }}
              >
                <span
                  className="material-symbols-rounded text-lg"
                  style={{ color: coverTheme.goldTrim }}
                >
                  menu_book
                </span>
              </div>

              {/* Title in English with Responsive Font Sizing */}
              <h2
                className={`font-extrabold tracking-tight leading-snug text-center ${
                  mainTitle.length > 20
                    ? "text-base sm:text-[17px]"
                    : mainTitle.length > 14
                    ? "text-lg sm:text-xl"
                    : "text-xl sm:text-2xl"
                }`}
                style={{
                  color: coverTheme.textColor,
                  fontVariationSettings: '"wght" 850, "wdth" 105',
                }}
              >
                {mainTitle}
              </h2>

              {/* Volume Badge Pill if applicable */}
              {volumeBadge && (
                <div className="mt-1.5 flex justify-center">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest uppercase border"
                    style={{
                      borderColor: `${coverTheme.goldTrim}60`,
                      background: `${coverTheme.goldTrim}15`,
                      color: coverTheme.goldTrim,
                    }}
                  >
                    {volumeBadge}
                  </span>
                </div>
              )}

              {/* Title in Devanagari */}
              {book.originalTitleDevanagari && (
                <p
                  className="text-xs sm:text-[13px] font-semibold opacity-90 mt-1.5 tracking-wide line-clamp-1"
                  style={{ color: coverTheme.subtextColor }}
                >
                  {book.originalTitleDevanagari}
                </p>
              )}
            </div>

            {/* Bottom: Author & Publication */}
            <div className="relative z-10 text-center pb-1">
              <div
                className="w-12 h-0.5 mx-auto mb-2 rounded-full opacity-60"
                style={{ background: coverTheme.goldTrim }}
              />
              <p
                className="text-xs font-bold tracking-wide line-clamp-1"
                style={{ color: coverTheme.textColor }}
              >
                {book.authors[0] || "Traditional Anthology"}
              </p>
              {book.publisher && (
                <p
                  className="text-[9px] tracking-wider uppercase opacity-70 mt-0.5 line-clamp-1"
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
        <div className="absolute inset-0 bg-gradient-to-tl from-black/40 via-transparent to-white/10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-black/60 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-3 rounded-[2px] border border-dashed border-white/20 opacity-40 pointer-events-none" />

        {/* Top Back Header */}
        <div className="relative z-10 text-center pt-2">
          <span
            className="text-[9px] font-bold uppercase tracking-[0.15em] block truncate max-w-[180px] mx-auto"
            style={{ color: coverTheme.subtextColor }}
          >
            {book.title}
          </span>
        </div>

        {/* Center Summary Blurb */}
        <div className="relative z-10 px-2 text-center">
          <p
            className="text-[10px] leading-relaxed line-clamp-5 font-medium italic opacity-90"
            style={{ color: coverTheme.subtextColor }}
          >
            &ldquo;{book.description}&rdquo;
          </p>
        </div>

        {/* Bottom Archival Seal / Barcode */}
        <div className="relative z-10 flex flex-col items-center gap-1.5 pb-2">
          <div className="w-16 h-5 border border-dashed border-white/20 rounded flex items-center justify-center opacity-60">
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
        <div className="w-full h-1 border-y border-white/20 bg-white/10 opacity-70" />
        <div className="flex-1 flex items-center justify-center my-4 overflow-hidden">
          <span
            className="text-[10px] font-bold tracking-wider uppercase whitespace-nowrap rotate-90 truncate max-w-[220px]"
            style={{ color: coverTheme.textColor }}
          >
            {book.title}
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span
            className="material-symbols-rounded text-sm"
            style={{ color: coverTheme.textColor }}
          >
            music_note
          </span>
          <div className="w-full h-1 border-y border-white/20 bg-white/10 opacity-70" />
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
        <div
          className="w-full h-full opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, #d4a373 0px, #d4a373 1px, transparent 1px, transparent 3px)",
          }}
        />
      </div>

      {/* ================= 5. TOP PAGE BLOCK ================= */}
      <div
        className="absolute left-0 top-0 overflow-hidden border-x border-amber-900/25 pointer-events-none"
        style={{
          width: bookWidth,
          height: bookDepth,
          background: coverTheme.pagesBg,
          transform: `translateY(-50%) rotateX(90deg)`,
          backfaceVisibility: "hidden",
        }}
      />

      {/* ================= 6. BOTTOM PAGE BLOCK ================= */}
      <div
        className="absolute left-0 top-0 overflow-hidden border-x border-amber-900/25 pointer-events-none"
        style={{
          width: bookWidth,
          height: bookDepth,
          background: coverTheme.pagesBg,
          transform: `translateY(${bookHeight - halfDepth}px) rotateX(-90deg)`,
          backfaceVisibility: "hidden",
        }}
      />
    </>
  );
}
