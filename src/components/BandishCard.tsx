import React, { memo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export const BandishCard = memo(({
  bandish,
  index,
  isSelected,
  isFavorited,
  language,
  isSearching,
  disableEntranceAnimation,
  onSelect,
  onToggleFavorite,
  onToggleFilter,
}: {
  bandish: any;
  index: number;
  isSelected: boolean;
  isFavorited: boolean;
  language: string;
  isSearching?: boolean;
  disableEntranceAnimation?: boolean;
  onSelect: (bandish: any, rect: DOMRect) => void;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onToggleFilter: (key: string, value: string) => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const renditionCount = bandish.youtube_renditions?.length ?? 0;

  const handleClick = useCallback(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      onSelect(bandish, rect);
    }
  }, [bandish, onSelect]);

  return (
    <motion.div
      initial={disableEntranceAnimation ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`break-inside-avoid mb-4 ${disableEntranceAnimation ? '' : 'animate-card'}`}
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <div
        ref={cardRef}
        onClick={handleClick}
        data-bandish-id={bandish.id}
        className="bandish-card group relative bg-white dark:bg-m3-surface-container-dark p-6 rounded-[1.5rem] border border-gray-100 dark:border-m3-surface-high-dark flex flex-col cursor-pointer"
      >
        {/* Top Right Action Icons */}
        <div className="absolute top-5 right-5 z-10 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Admin Only Badge with Tooltip */}
          {bandish.is_published === false && (
            <div className="group/admin relative flex items-center">
              <div
                className="w-8 h-8 flex items-center justify-center rounded-full text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20 transition-all duration-200 cursor-default"
                aria-label="Admin Only (Unpublished Draft)"
              >
                <span className="material-symbols-rounded text-[1.1rem]">lock</span>
              </div>
              {/* Tooltip */}
              <div className="pointer-events-none absolute top-full right-0 mt-2 opacity-0 group-hover/admin:opacity-100 transition-opacity duration-200 z-20">
                <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap border border-gray-800 dark:border-gray-200">
                  Admin Only Draft
                </div>
              </div>
            </div>
          )}

          {/* Renditions Badge */}
          {renditionCount > 0 && (
            <div className="group/rendition relative flex items-center">
              <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 px-1.5 h-8 rounded-full transition-all duration-200 cursor-default">
                <span className="material-symbols-rounded text-[1.1rem]" style={{ fontVariationSettings: '"FILL" 1' }}>play_circle</span>
                <span className="text-xs font-semibold leading-none">{renditionCount}</span>
              </div>
              {/* Tooltip */}
              <div className="pointer-events-none absolute top-full right-0 mt-2 opacity-0 group-hover/rendition:opacity-100 transition-opacity duration-200 z-20">
                <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap border border-gray-800 dark:border-gray-200">
                  This bandish has {renditionCount} rendition{renditionCount !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={(e) => onToggleFavorite(e, bandish.id)}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition duration-200 hover:scale-110 active:scale-90 ${
              isFavorited
                ? "text-m3-error dark:text-m3-error-dark bg-m3-error/10 dark:bg-m3-error-dark/20"
                : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            aria-label="Toggle Favorite"
          >
            <span
              className="material-symbols-rounded text-[1.35rem] transition"
              style={{ fontVariationSettings: isFavorited ? '"FILL" 1' : '"FILL" 0' }}
            >
              favorite
            </span>
          </button>
        </div>

        <div className="flex justify-between items-start mb-3 pr-28 md:pr-36">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            <Link
              href={`/bandish/${bandish.id}`}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
                  e.preventDefault();
                  handleClick();
                }
              }}
              className="hover:text-m3-primary dark:hover:text-m3-primary-dark transition-colors focus:outline-none"
            >
              {bandish.title}
            </Link>
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFilter("raag", bandish.raag); }}
            className="bg-m3-secondary/10 dark:bg-m3-secondary-dark/10 hover:bg-m3-secondary/20 dark:hover:bg-m3-secondary-dark/20 text-m3-secondary dark:text-m3-secondary-dark px-3 py-1.5 rounded-2xl text-sm font-bold tracking-wide transition duration-200 text-left hover:scale-105 active:scale-95"
          >
            {bandish.raag}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFilter("taal", bandish.taal); }}
            className="bg-m3-secondary/10 dark:bg-m3-secondary-dark/10 hover:bg-m3-secondary/20 dark:hover:bg-m3-secondary-dark/20 text-m3-secondary dark:text-m3-secondary-dark px-3 py-1.5 rounded-2xl text-sm font-bold tracking-wide transition duration-200 text-left hover:scale-105 active:scale-95"
          >
            {bandish.taal}
          </button>
          {bandish.lay?.map((l: string, i: number) => (
            <button
              key={`lay-${i}`}
              onClick={(e) => { e.stopPropagation(); onToggleFilter("lay", l); }}
              className="bg-m3-secondary/10 dark:bg-m3-secondary-dark/10 hover:bg-m3-secondary/20 dark:hover:bg-m3-secondary-dark/20 text-m3-secondary dark:text-m3-secondary-dark px-3 py-1.5 rounded-2xl text-sm font-bold tracking-wide transition duration-200 text-left hover:scale-105 active:scale-95"
            >
              {l}
            </button>
          ))}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFilter("composer", bandish.composer); }}
            className="bg-m3-tertiary/10 dark:bg-m3-tertiary-dark/10 hover:bg-m3-tertiary/20 dark:hover:bg-m3-tertiary-dark/20 text-m3-tertiary dark:text-m3-tertiary-dark px-3 py-1.5 rounded-2xl text-sm font-bold tracking-wide transition duration-200 text-left hover:scale-105 active:scale-95"
          >
            {bandish.composer}
          </button>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap text-[1.05rem] transition-colors duration-300 line-clamp-4">
          {language === "english" ? bandish.lyrics.english : (bandish.lyrics.devanagari || "Devanagari lyrics not available")}
        </p>
        <Link
          href={`/bandish/${bandish.id}`}
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
              e.preventDefault();
              handleClick();
            }
          }}
          className="mt-2 pt-2 flex items-center text-m3-primary dark:text-m3-primary-dark text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:underline"
        >
          <span>Read Full Bandish</span>
          <span className="material-symbols-rounded text-[1.2rem] ml-1">arrow_forward</span>
        </Link>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.bandish.id === nextProps.bandish.id &&
    prevProps.bandish.is_published === nextProps.bandish.is_published &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isFavorited === nextProps.isFavorited &&
    prevProps.language === nextProps.language &&
    prevProps.isSearching === nextProps.isSearching &&
    prevProps.disableEntranceAnimation === nextProps.disableEntranceAnimation
  );
});
