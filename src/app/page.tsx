"use client";

import { useState, useEffect, useMemo, useDeferredValue } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { supabase } from "@/lib/supabase";
import { useTheme } from "./ThemeProvider";
import { M3LoadingIndicator } from "@alerix/m3-loading-indicator/react";

export default function Home() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Search & Filter States
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [language, setLanguage] = useState("english");
  const [activeFilters, setActiveFilters] = useState<{key: string, value: string}[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Data States
  const [baseData, setBaseData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Modal States
  const [selectedBandish, setSelectedBandish] = useState<any | null>(null);
  const [isClosing, setIsClosing] = useState(false); 
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isInfoClosing, setIsInfoClosing] = useState(false);

  // 1. Fetch Data & Load Favorites
  useEffect(() => {
    const fetchBandishes = async () => {
      const { data, error } = await supabase.from('bandishes').select('*');
      if (error) {
        console.error("Error fetching data:", error);
        return;
      }
      if (data) {
        const shuffled = [...data];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setBaseData(shuffled);
      }
      setIsMounted(true);
    };

    const savedFavs = localStorage.getItem("wiki-favorites");
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    }

    fetchBandishes();
  }, []);

  // 2. Lock Background Scrolling for Modals
  useEffect(() => {
    if (selectedBandish || isInfoOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    }
    return () => { 
      document.body.style.paddingRight = "";
      document.body.style.overflow = ""; 
    };
  }, [selectedBandish, isInfoOpen]);

  // 3. Modal & Filter Handlers
  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => { setSelectedBandish(null); setIsClosing(false); }, 300);
  };

  const closeInfoModal = () => {
    setIsInfoClosing(true);
    setTimeout(() => { setIsInfoOpen(false); setIsInfoClosing(false); }, 300);
  };

  const toggleFilter = (key: string, value: string) => {
    setActiveFilters((prev) => {
      const isAlreadyActive = prev.some((f) => f.key === key && f.value === value);
      if (isAlreadyActive) return prev.filter((f) => !(f.key === key && f.value === value));
      return [...prev, { key, value }];
    });
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavs = prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id];
      localStorage.setItem("wiki-favorites", JSON.stringify(newFavs));
      return newFavs;
    });
  };

  // 4. Data Processing
  const processedData = useMemo(() => {
    let data = baseData;

    if (showFavoritesOnly) data = data.filter((bandish) => favorites.includes(bandish.id));

    if (activeFilters.length > 0) {
      data = data.filter((bandish) => {
        return activeFilters.every((filter) => {
          if (filter.key === "raag") return bandish.raag === filter.value;
          if (filter.key === "taal") return bandish.taal === filter.value;
          if (filter.key === "composer") return bandish.composer === filter.value;
          return true;
        });
      });
    }

    if (deferredQuery) {
      const fuse = new Fuse(data, { keys: ["title", "raag", "composer", "taal"], threshold: 0.4 });
      data = fuse.search(deferredQuery).map((result) => result.item);
    }
    return data;
  }, [baseData, showFavoritesOnly, favorites, activeFilters, deferredQuery]);

  const bandishCount = processedData.length;
  const uniqueRaagsCount = new Set(processedData.map((b) => b.raag)).size;

  // 5. Smart Suggestions for Raags & Composers
  const allRaags = useMemo(() => Array.from(new Set(baseData.map(b => b.raag))), [baseData]);
  const allComposers = useMemo(() => Array.from(new Set(baseData.map(b => b.composer))), [baseData]);

  const suggestedRaag = useMemo(() => {
    const cleanQuery = deferredQuery.trim();
    if (!cleanQuery || cleanQuery.length < 3) return null; 
    const fuse = new Fuse(allRaags, { threshold: 0.4 });
    const results = fuse.search(cleanQuery);
    if (results.length > 0) {
      const bestMatch = results[0].item;
      const isAlreadyFiltered = activeFilters.some(f => f.key === "raag" && f.value === bestMatch);
      return !isAlreadyFiltered ? bestMatch : null;
    }
    return null;
  }, [deferredQuery, allRaags, activeFilters]);

  const suggestedComposer = useMemo(() => {
    const cleanQuery = deferredQuery.trim();
    if (!cleanQuery || cleanQuery.length < 3) return null; 
    const fuse = new Fuse(allComposers, { threshold: 0.4 });
    const results = fuse.search(cleanQuery);
    if (results.length > 0) {
      const bestMatch = results[0].item;
      const isAlreadyFiltered = activeFilters.some(f => f.key === "composer" && f.value === bestMatch);
      return !isAlreadyFiltered ? bestMatch : null;
    }
    return null;
  }, [deferredQuery, allComposers, activeFilters]);

  // 6. Memoized Grid
  const memoizedGrid = useMemo(() => {
    if (processedData.length === 0 && !suggestedRaag && !suggestedComposer) {
      return (
        <div className="text-center py-16 animate-card">
          <p className="text-lg text-gray-400 dark:text-gray-500 font-medium tracking-wide">
            {showFavoritesOnly ? "You haven't saved any favorites yet!" : "no bandishes found for the given criteria"}
          </p>
        </div>
      );
    }

    return (
      <div className="columns-1 md:columns-2 gap-4">
        
        {/* Raag Suggestion Card */}
        {suggestedRaag && (
          <div className="group relative bg-m3-secondary/10 dark:bg-m3-secondary-dark/10 p-6 md:p-8 rounded-3xl border border-m3-secondary/20 flex flex-col items-start break-inside-avoid mb-4 transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-rounded text-[2rem] text-m3-secondary dark:text-m3-secondary-dark">manage_search</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                Looking for Raag {suggestedRaag}?
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-[1.05rem]">
              Switch to a tag filter to see a clean list of all bandishes in this raag.
            </p>
            <button
              onClick={() => { toggleFilter("raag", suggestedRaag); setQuery(""); }}
              className="flex items-center gap-2 bg-m3-secondary hover:bg-m3-secondary/90 dark:bg-m3-secondary-dark dark:hover:bg-m3-secondary-dark/90 text-white dark:text-gray-900 px-6 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-rounded text-[1.2rem]">filter_list</span>
              Filter by {suggestedRaag}
            </button>
          </div>
        )}

        {/* Composer Suggestion Card */}
        {suggestedComposer && (
          <div className="group relative bg-m3-tertiary/10 dark:bg-m3-tertiary-dark/10 p-6 md:p-8 rounded-3xl border border-m3-tertiary/20 flex flex-col items-start break-inside-avoid mb-4 transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-rounded text-[2rem] text-m3-tertiary dark:text-m3-tertiary-dark">person_search</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                Looking for {suggestedComposer}?
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-[1.05rem]">
              Switch to a tag filter to see a clean list of all bandishes by this composer.
            </p>
            <button
              onClick={() => { toggleFilter("composer", suggestedComposer); setQuery(""); }}
              className="flex items-center gap-2 bg-m3-tertiary hover:bg-m3-tertiary/90 dark:bg-m3-tertiary-dark dark:hover:bg-m3-tertiary-dark/90 text-white dark:text-gray-900 px-6 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-rounded text-[1.2rem]">filter_list</span>
              Filter by {suggestedComposer}
            </button>
          </div>
        )}

        {processedData.map((bandish, index) => {
          const isFavorited = favorites.includes(bandish.id);
          
          return (
            <div 
              key={bandish.id} 
              onClick={() => setSelectedBandish(bandish)}
              className="group relative animate-card bg-white dark:bg-m3-surface-container-dark hover:bg-m3-surface-container dark:hover:bg-m3-surface-high-dark p-6 rounded-3xl border border-gray-100 dark:border-m3-surface-high-dark flex flex-col transition-all duration-300 hover:-translate-y-1 cursor-pointer break-inside-avoid mb-4"
              style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
            >
              
              <button
                onClick={(e) => toggleFavorite(e, bandish.id)}
                className={`absolute top-5 right-5 w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-90 ${
                  isFavorited 
                    ? "text-m3-error dark:text-m3-error-dark bg-m3-error/10 dark:bg-m3-error-dark/20" 
                    : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                aria-label="Toggle Favorite"
              >
                <span className="material-symbols-rounded text-[1.4rem] transition-all duration-300" style={{ fontVariationSettings: isFavorited ? '"FILL" 1' : '"FILL" 0' }}>
                  favorite
                </span>
              </button>

              <div className="flex justify-between items-start mb-3 pr-16 md:pr-20">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {bandish.title}
                </h2>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-5">
                {/* Secondary Pill for Raag & Taal */}
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFilter("raag", bandish.raag); }}
                  className="bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-secondary/20 dark:hover:bg-m3-secondary-dark/20 text-m3-secondary dark:text-m3-secondary-dark px-3 py-1.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 text-left hover:scale-105 active:scale-95"
                >
                  {bandish.raag}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFilter("taal", bandish.taal); }}
                  className="bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-secondary/20 dark:hover:bg-m3-secondary-dark/20 text-m3-secondary dark:text-m3-secondary-dark px-3 py-1.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 text-left hover:scale-105 active:scale-95"
                >
                  {bandish.taal}
                </button>
                {/* Tertiary Pill for Composer */}
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFilter("composer", bandish.composer); }}
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
        })}
      </div>
    );
  }, [processedData, favorites, language, suggestedRaag, suggestedComposer, showFavoritesOnly]);

  return (
    <main className="min-h-screen bg-m3-surface dark:bg-m3-surface-dark transition-colors duration-500 relative">
      <div className="p-4 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* --- HERO SEARCH SECTION --- */}
          <div className="relative bg-m3-surface-high dark:bg-m3-surface-high-dark rounded-[2.5rem] p-8 md:p-12 transition-colors duration-500">
            
            <div className="absolute top-6 right-6 md:top-8 md:right-8 flex items-center gap-2 md:gap-3">
              <Link
                href="/add"
                className="group flex items-center justify-center px-4 py-2 bg-m3-primary hover:bg-m3-primary/90 dark:bg-m3-primary-dark dark:hover:bg-m3-primary-dark/90 text-white dark:text-gray-900 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                title="Add a new Bandish"
              >
                <span className="material-symbols-rounded text-[1.25rem]">add</span>
                <span className="hidden md:block font-bold text-sm ml-1">Add Bandish</span>
              </Link>

              <button
                onClick={() => setIsInfoOpen(true)}
                className="group flex items-center justify-center p-2 bg-m3-surface-container/50 dark:bg-m3-surface-dark/40 hover:bg-m3-surface-container dark:hover:bg-m3-surface-high-dark text-m3-primary dark:text-m3-primary-dark rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                title="How to use the wiki"
              >
                <span className="material-symbols-rounded text-[1.5rem]">info</span>
              </button>
            </div>

            <div className="pr-32 md:pr-48">
              <h1 
                className="text-4xl md:text-5xl text-gray-900 dark:text-white mb-2 tracking-tight"
                style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}
              >
                The Bandish Wiki
              </h1>
              <p className="text-m3-secondary dark:text-m3-secondary-dark mb-8 font-medium transition-all duration-300">
                Showing <span className="font-bold">{bandishCount}</span> bandish{bandishCount !== 1 ? "es" : ""} across <span className="font-bold">{uniqueRaagsCount}</span> raag{uniqueRaagsCount !== 1 ? "s" : ""}
              </p>
            </div>
            
            <div className="relative mb-6 group mx-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-within:-mx-2 md:focus-within:-mx-4">
              <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none z-10 transition-transform duration-500 group-focus-within:scale-110">
                <span className="material-symbols-rounded transition-colors duration-300 text-gray-600 dark:text-gray-400 group-focus-within:text-m3-primary dark:group-focus-within:text-m3-primary-dark">
                  search
                </span>
              </div>
              <input
                type="text"
                placeholder="Search by text..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-m3-surface dark:bg-m3-surface-dark text-gray-900 dark:text-white text-lg pl-[4.25rem] pr-6 py-5 rounded-full focus:outline-none transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-black/20"
              />
            </div>

            <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${activeFilters.length > 0 ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <div className="flex flex-wrap justify-center gap-3 pt-2 pb-6">
                  {activeFilters.map((filter) => (
                    <div 
                      key={`${filter.key}-${filter.value}`}
                      className="inline-flex items-center gap-2 bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900 px-4 py-1.5 rounded-full text-sm font-bold transition-transform duration-300 hover:scale-105"
                    >
                      <span className="capitalize opacity-80 font-medium">{filter.key}:</span>
                      <span>{filter.value}</span>
                      <button
                        onClick={() => toggleFilter(filter.key, filter.value)}
                        className="flex items-center justify-center hover:rotate-90 hover:bg-white/20 dark:hover:bg-black/10 rounded-full p-0.5 ml-1 transition-all duration-300"
                        aria-label="Remove filter"
                      >
                        <span className="material-symbols-rounded text-[1.1rem]">close</span>
                      </button>
                    </div>
                  ))}
                  
                  {activeFilters.length > 1 && (
                    <button
                      onClick={() => setActiveFilters([])}
                      className="text-sm font-bold text-m3-primary dark:text-m3-primary-dark hover:text-gray-900 dark:hover:text-white underline underline-offset-4 px-2 active:scale-95 transition-transform duration-200"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* --- CONTROLS ROW --- */}
            <div className="flex flex-wrap justify-center gap-4 items-center">
              <div className="relative flex items-center bg-m3-surface-container dark:bg-m3-surface-dark/50 p-1 rounded-full border border-gray-200 dark:border-gray-700">
                <div 
                  className={`absolute top-1 bottom-1 w-[105px] rounded-full bg-m3-primary dark:bg-m3-primary-dark transition-transform duration-500 ease-out ${
                    language === "english" ? "translate-x-0" : "translate-x-[105px]"
                  }`}
                />
                <button
                  onClick={() => setLanguage("english")}
                  className={`relative z-10 w-[105px] py-1.5 text-sm font-bold transition-colors duration-300 ${
                    language === "english" ? "text-white dark:text-gray-900" : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage("devanagari")}
                  className={`relative z-10 w-[105px] py-1.5 text-sm font-bold transition-colors duration-300 ${
                    language === "devanagari" ? "text-white dark:text-gray-900" : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
                  }`}
                >
                  Devanagari
                </button>
              </div>

              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`group flex items-center justify-center gap-2 px-5 py-2 rounded-full text-sm font-bold border transition-all duration-300 hover:scale-105 active:scale-95 ${
                  showFavoritesOnly 
                    ? "bg-m3-error dark:bg-m3-error-dark text-white dark:text-gray-900 border-transparent" 
                    : "bg-m3-surface-container dark:bg-m3-surface-dark/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-m3-surface-high dark:hover:bg-m3-surface-high-dark"
                }`}
              >
                <span className="material-symbols-rounded text-[1.25rem] transition-all duration-300" style={{ fontVariationSettings: showFavoritesOnly ? '"FILL" 1' : '"FILL" 0' }}>
                  favorite
                </span>
                <span>{showFavoritesOnly ? "Favorites Only" : "All Bandishes"}</span>
              </button>

              <button
                onClick={toggleDarkMode}
                className="group flex items-center justify-center gap-2 bg-m3-surface-container dark:bg-m3-surface-dark/50 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-full text-sm font-bold border border-gray-200 dark:border-gray-700 hover:bg-m3-surface-high dark:hover:bg-m3-surface-high-dark transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span className={`material-symbols-rounded text-[1.25rem] transition-transform duration-500 ease-in-out ${isDarkMode ? "rotate-[360deg]" : "group-hover:rotate-45"}`}>
                  {isDarkMode ? "light_mode" : "dark_mode"}
                </span>
                <span className="hidden sm:inline">{isDarkMode ? "Light" : "Dark"}</span>
              </button>
            </div>
          </div>

          {/* --- BANDISH GRID --- */}
          {!isMounted ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6">
              <M3LoadingIndicator size={48} contained={true} color={isDarkMode ? "#D0BCFF" : "#6750A4"} containerColor={isDarkMode ? "#211F26" : "#F3EDF7"} />
            </div>
          ) : (
            memoizedGrid
          )}

        </div>
      </div>

      {/* --- THE INFO MODAL --- */}
      {isInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={closeInfoModal}>
          <div className={`absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm ${isInfoClosing ? 'animate-backdrop-exit' : 'animate-backdrop-enter'}`}></div>

          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-m3-surface dark:bg-m3-surface-dark rounded-[2.5rem] p-8 md:p-12 border border-m3-surface-high dark:border-m3-surface-high-dark m3-scrollbar ${isInfoClosing ? 'animate-modal-exit' : 'animate-modal-enter'}`} onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-6 right-6 md:top-8 md:right-8">
              <button onClick={closeInfoModal} className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-gray-900 dark:text-white rounded-full transition-colors duration-200">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-rounded text-[2.5rem] text-m3-primary dark:text-m3-primary-dark">info</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">How to use this Wiki</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-m3-surface-container dark:bg-m3-surface-container-dark p-6 rounded-3xl border border-m3-surface-high dark:border-m3-surface-high-dark">
                  <h3 className="font-bold text-xl text-m3-primary dark:text-m3-primary-dark flex items-center gap-2 mb-3">
                    <span className="material-symbols-rounded">search</span> Smart Search
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    Type anything in the search bar! The engine automatically searches through titles, raags, taals, and composers.
                  </p>
                </div>
                <div className="bg-m3-surface-container dark:bg-m3-surface-container-dark p-6 rounded-3xl border border-m3-surface-high dark:border-m3-surface-high-dark">
                  <h3 className="font-bold text-xl text-m3-primary dark:text-m3-primary-dark flex items-center gap-2 mb-3">
                    <span className="material-symbols-rounded">filter_list</span> Tag Filters
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    Click any pill-shaped tag (like the Raag or Taal) on a bandish card to instantly filter the entire wiki. You can layer multiple filters together!
                  </p>
                </div>
                <div className="bg-m3-surface-container dark:bg-m3-surface-container-dark p-6 rounded-3xl border border-m3-surface-high dark:border-m3-surface-high-dark">
                  <h3 className="font-bold text-xl text-m3-primary dark:text-m3-primary-dark flex items-center gap-2 mb-3">
                    <span className="material-symbols-rounded">favorite</span> Personal Favorites
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    Click the heart icon on any bandish to save it to your local browser memory. Use the toggle at the top to quickly filter your personal repertoire!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- THE EXPANDED BANDISH MODAL --- */}
      {selectedBandish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={closeModal}>
          <div className={`absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-backdrop-exit' : 'animate-backdrop-enter'}`}></div>

          <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-m3-surface dark:bg-m3-surface-dark rounded-[2.5rem] p-8 md:p-12 border border-m3-surface-high dark:border-m3-surface-high-dark m3-scrollbar shadow-2xl ${isClosing ? 'animate-modal-exit' : 'animate-modal-enter'}`} onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-6 right-6 md:top-8 md:right-8 flex flex-col gap-2 md:gap-3">
              <button onClick={closeModal} className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-gray-900 dark:text-white rounded-full transition-all duration-200 hover:scale-105 active:scale-95">
                <span className="material-symbols-rounded text-[1.4rem]">close</span>
              </button>
              <Link href={`/edit/${selectedBandish.id}`} className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-m3-primary dark:text-m3-primary-dark rounded-full transition-all duration-200 hover:scale-105 active:scale-95" title="Edit Bandish">
                <span className="material-symbols-rounded text-[1.4rem]">edit</span>
              </Link>
            </div>

            <div className="pr-12 mb-8 mt-2">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {selectedBandish.title}
              </h2>
              
              <div className="flex flex-wrap gap-2">
                <span className="bg-m3-surface-container dark:bg-m3-surface-high-dark text-m3-secondary dark:text-m3-secondary-dark px-4 py-2 rounded-full text-sm font-bold tracking-wide">
                  {selectedBandish.raag}
                </span>
                <span className="bg-m3-surface-container dark:bg-m3-surface-high-dark text-m3-secondary dark:text-m3-secondary-dark px-4 py-2 rounded-full text-sm font-bold tracking-wide">
                  {selectedBandish.taal}
                </span>
                <span className="bg-m3-tertiary/10 dark:bg-m3-tertiary-dark/10 text-m3-tertiary dark:text-m3-tertiary-dark px-4 py-2 rounded-full text-sm font-bold tracking-wide">
                  {selectedBandish.composer}
                </span>
              </div>
            </div>

            <div className="space-y-8 md:space-y-10">
              {selectedBandish.lyrics.devanagari && (
                <div>
                  <h3 className="text-sm font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-3 transition-colors duration-300">
                    Devanagari
                  </h3>
                  <p className="text-gray-900 dark:text-white text-xl md:text-2xl leading-relaxed whitespace-pre-wrap font-medium transition-colors duration-300">
                    {selectedBandish.lyrics.devanagari}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-3 transition-colors duration-300">
                  Transliteration
                </h3>
                <p className="text-gray-900 dark:text-white text-xl md:text-2xl leading-relaxed whitespace-pre-wrap font-medium transition-colors duration-300">
                  {selectedBandish.lyrics.english}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}