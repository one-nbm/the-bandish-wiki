import React, { memo, useRef, useCallback } from "react";

export const BandishCard = memo(({
  bandish,
  index,
  isSelected,
  isFavorited,
  language,
  onSelect,
  onToggleFavorite,
  onToggleFilter,
}: {
  bandish: any;
  index: number;
  isSelected: boolean;
  isFavorited: boolean;
  language: string;
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
    <div
      ref={cardRef}
      onClick={handleClick}
      data-bandish-id={bandish.id}
      className="group relative animate-card bg-white dark:bg-m3-surface-container-dark p-6 rounded-3xl border border-gray-100 dark:border-m3-surface-high-dark flex flex-col cursor-pointer break-inside-avoid mb-4 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms`, opacity: isSelected ? 0 : 1 }}
    >
      {/* Renditions Badge */}
      {renditionCount > 0 && (
        <div className="group/rendition absolute top-5 right-[3.75rem] z-10 h-11 flex items-center" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 px-1.5 rounded-full transition-all duration-300 cursor-default">
            <span className="material-symbols-rounded text-[1.1rem]" style={{ fontVariationSettings: '"FILL" 1' }}>play_circle</span>
            <span className="text-xs font-semibold leading-none">{renditionCount}</span>
          </div>
          {/* Tooltip */}
          <div className="pointer-events-none absolute top-full right-0 mt-2 opacity-0 group-hover/rendition:opacity-100 transition-opacity duration-200 z-20">
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">
              This bandish has {renditionCount} rendition{renditionCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      )}
      <button onClick={(e) => onToggleFavorite(e, bandish.id)} className={`absolute top-5 right-5 w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-90 ${isFavorited ? "text-m3-error dark:text-m3-error-dark bg-m3-error/10 dark:bg-m3-error-dark/20" : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`} aria-label="Toggle Favorite">
        <span className="material-symbols-rounded text-[1.4rem] transition-all duration-300" style={{ fontVariationSettings: isFavorited ? '"FILL" 1' : '"FILL" 0' }}>favorite</span>
      </button>
      <div className="flex justify-between items-start mb-3 pr-28 md:pr-32">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{bandish.title}</h2>
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFilter("raag", bandish.raag); }}
          className="bg-m3-secondary/10 dark:bg-m3-secondary-dark/10 hover:bg-m3-secondary/20 dark:hover:bg-m3-secondary-dark/20 text-m3-secondary dark:text-m3-secondary-dark px-3 py-1.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 text-left hover:scale-105 active:scale-95"
        >
          {bandish.raag}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFilter("taal", bandish.taal); }}
          className="bg-m3-secondary/10 dark:bg-m3-secondary-dark/10 hover:bg-m3-secondary/20 dark:hover:bg-m3-secondary-dark/20 text-m3-secondary dark:text-m3-secondary-dark px-3 py-1.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 text-left hover:scale-105 active:scale-95"
        >
          {bandish.taal}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFilter("composer", bandish.composer); }}
          className="bg-m3-tertiary/10 dark:bg-m3-tertiary-dark/10 hover:bg-m3-tertiary/20 dark:hover:bg-m3-tertiary-dark/20 text-m3-tertiary dark:text-m3-tertiary-dark px-3 py-1.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 text-left hover:scale-105 active:scale-95"
        >
          {bandish.composer}
        </button>
      </div>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap text-[1.05rem] transition-colors duration-300 line-clamp-4">
        {language === "english" ? bandish.lyrics.english : (bandish.lyrics.devanagari || "Devanagari lyrics not available")}
      </p>
      <div className="mt-2 pt-2 flex items-center text-m3-primary dark:text-m3-primary-dark text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span>Read Full Bandish</span>
        <span className="material-symbols-rounded text-[1.2rem] ml-1">arrow_forward</span>
      </div>
    </div>
  );
});
