"use client";

import React, { useState, useEffect } from "react";

interface BookComposerPillsProps {
  composers: string[];
  composerCounts: Record<string, number>;
}

export function BookComposerPills({ composers, composerCounts }: BookComposerPillsProps) {
  const [activeComposer, setActiveComposer] = useState<string | null>(null);

  useEffect(() => {
    const handleComposerChanged = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>;
      setActiveComposer(customEvent.detail ?? null);
    };

    window.addEventListener("book-composer-changed", handleComposerChanged);
    return () => {
      window.removeEventListener("book-composer-changed", handleComposerChanged);
    };
  }, []);

  const handleSelectComposer = (composer: string) => {
    const nextComposer = activeComposer === composer ? null : composer;
    setActiveComposer(nextComposer);

    // Notify BookCatalogueView
    window.dispatchEvent(
      new CustomEvent("select-book-composer", { detail: nextComposer })
    );

    // If selecting a composer, smoothly scroll to catalogue grid
    if (nextComposer) {
      const catalogueEl = document.getElementById("book-catalogue-section");
      if (catalogueEl) {
        catalogueEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {composers.map((composer) => {
        const isActive = activeComposer === composer;
        const count = composerCounts[composer] || 0;

        return (
          <button
            key={composer}
            type="button"
            onClick={() => handleSelectComposer(composer)}
            className={`group inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer text-left select-none ${
              isActive
                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/60 dark:border-amber-400/60 ring-1 ring-amber-500/40"
                : "bg-m3-tertiary/10 dark:bg-m3-tertiary-dark/10 text-m3-tertiary dark:text-m3-tertiary-dark border-m3-tertiary/25 hover:border-m3-tertiary/60 hover:bg-m3-tertiary/20 hover:-translate-y-0.5 active:scale-95"
            }`}
            title={
              isActive
                ? `Active filter: ${composer}. Click to clear.`
                : `Filter compositions by ${composer} (${count} bandish${count !== 1 ? "es" : ""})`
            }
          >
            <span>{composer}</span>
            <span
              className={`text-[11px] font-semibold px-1.5 py-0.2 rounded-full ${
                isActive
                  ? "bg-amber-500/30 text-amber-800 dark:text-amber-200"
                  : "bg-black/5 dark:bg-white/10 opacity-80"
              }`}
            >
              {count}
            </span>
            {isActive && (
              <span className="material-symbols-rounded text-xs ml-0.5">close</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

