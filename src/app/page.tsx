"use client";

import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import bandishesData from "@/data/parsed-bandishes.json";

export default function Home() {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("english");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{key: string, value: string}[]>([]);
  
  const [baseData, setBaseData] = useState(bandishesData);
  const [isMounted, setIsMounted] = useState(false);

  const [selectedBandish, setSelectedBandish] = useState<any | null>(null);
  const [isClosing, setIsClosing] = useState(false); 

  useEffect(() => {
    const shuffled = [...bandishesData];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setBaseData(shuffled);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (selectedBandish) {
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
  }, [selectedBandish]);

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedBandish(null);
      setIsClosing(false);
    }, 300);
  };

  const toggleFilter = (key: string, value: string) => {
    setActiveFilters((prev) => {
      const isAlreadyActive = prev.some((f) => f.key === key && f.value === value);
      if (isAlreadyActive) {
        return prev.filter((f) => !(f.key === key && f.value === value));
      } else {
        return [...prev, { key, value }];
      }
    });
  };

  let processedData = baseData;

  if (activeFilters.length > 0) {
    processedData = processedData.filter((bandish) => {
      return activeFilters.every((filter) => {
        if (filter.key === "raag") return bandish.raag === filter.value;
        if (filter.key === "taal") return bandish.taal === filter.value;
        if (filter.key === "composer") return bandish.composer === filter.value;
        return true;
      });
    });
  }

  if (query) {
    const fuse = new Fuse(processedData, {
      keys: ["title", "raag", "composer", "taal"],
      threshold: 0.4,
    });
    processedData = fuse.search(query).map((result) => result.item);
  }

  const bandishCount = processedData.length;
  const uniqueRaagsCount = new Set(processedData.map((b) => b.raag)).size;

  return (
    <main className={`${isDarkMode ? "dark" : ""} min-h-screen bg-[#FDF8FD] dark:bg-[#141218] transition-colors duration-500 relative`}>
      <div className="p-4 md:p-8 text-gray-900 dark:text-[#E6E0E9] font-sans">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* --- HERO SEARCH SECTION --- */}
          <div className="bg-[#EADDFF] dark:bg-[#332D41] rounded-[2.5rem] p-8 md:p-12 transition-colors duration-500">
            <h1 className="text-4xl md:text-5xl font-bold text-[#21005D] dark:text-[#D0BCFF] mb-2 tracking-tight">
              The Bandish Wiki
            </h1>
            
            <p className="text-[#4F378B] dark:text-[#CAC4D0] mb-8 font-medium transition-all duration-300">
              Showing <span className="font-bold">{bandishCount}</span> bandish{bandishCount !== 1 ? "es" : ""} across <span className="font-bold">{uniqueRaagsCount}</span> raag{uniqueRaagsCount !== 1 ? "s" : ""}
            </p>
            
            <div className="relative mb-6 group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none transition-transform duration-300 group-focus-within:scale-110 group-focus-within:text-[#6750A4]">
                {/* Updated Icon Class */}
                <span className="material-symbols-rounded text-[#1D1B20] dark:text-[#CAC4D0] transition-colors duration-300">
                  search
                </span>
              </div>
              <input
                type="text"
                placeholder="Search by text..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[#FEF7FF] dark:bg-[#4A4458] text-[#1D1B20] dark:text-[#E6E0E9] text-lg pl-[4.25rem] pr-6 py-5 rounded-full focus:outline-none transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 focus:-translate-y-1 ring-0 focus:ring-4 ring-[#6750A4]/30 focus:bg-white dark:focus:bg-[#4f495e]"
              />
            </div>

            <div 
              className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                activeFilters.length > 0 ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap justify-center gap-3 pt-2 pb-6">
                  {activeFilters.map((filter, index) => (
                    <div 
                      key={`${filter.key}-${filter.value}`}
                      className="inline-flex items-center gap-2 bg-[#21005D] dark:bg-[#D0BCFF] text-white dark:text-[#381E72] px-4 py-1.5 rounded-full text-sm font-bold transition-transform duration-300 hover:scale-105"
                    >
                      <span className="capitalize opacity-80 font-medium">{filter.key}:</span>
                      <span>{filter.value}</span>
                      <button
                        onClick={() => toggleFilter(filter.key, filter.value)}
                        className="flex items-center justify-center hover:rotate-90 hover:bg-white/20 dark:hover:bg-black/10 rounded-full p-0.5 ml-1 transition-all duration-300"
                        aria-label="Remove filter"
                      >
                        {/* Updated Icon Class */}
                        <span className="material-symbols-rounded text-[1.1rem]">close</span>
                      </button>
                    </div>
                  ))}
                  
                  {activeFilters.length > 1 && (
                    <button
                      onClick={() => setActiveFilters([])}
                      className="text-sm font-bold text-[#4F378B] dark:text-[#CAC4D0] hover:text-[#21005D] dark:hover:text-white underline underline-offset-4 px-2 active:scale-95 transition-transform duration-200"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 items-center">
              <div className="relative flex items-center bg-[#D0BCFF]/30 dark:bg-[#1D1B20]/50 p-1 rounded-full border border-[#6750A4]/20 dark:border-[#4A4458]">
                <div 
                  className={`absolute top-1 bottom-1 w-[105px] rounded-full bg-[#21005D] dark:bg-[#D0BCFF] transition-transform duration-500 ease-out ${
                    language === "english" ? "translate-x-0" : "translate-x-[105px]"
                  }`}
                />
                <button
                  onClick={() => setLanguage("english")}
                  className={`relative z-10 w-[105px] py-1.5 text-sm font-bold transition-colors duration-300 ${
                    language === "english" ? "text-white dark:text-[#381E72]" : "text-[#21005D] dark:text-[#CAC4D0] hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage("devanagari")}
                  className={`relative z-10 w-[105px] py-1.5 text-sm font-bold transition-colors duration-300 ${
                    language === "devanagari" ? "text-white dark:text-[#381E72]" : "text-[#21005D] dark:text-[#CAC4D0] hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
                  }`}
                >
                  Devanagari
                </button>
              </div>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="group flex items-center justify-center gap-2 bg-[#D0BCFF]/30 dark:bg-[#1D1B20]/50 text-[#21005D] dark:text-[#D0BCFF] px-5 py-2 rounded-full text-sm font-bold border border-[#6750A4]/20 dark:border-[#4A4458] hover:bg-[#D0BCFF]/50 dark:hover:bg-[#4A4458]/50 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {/* Updated Icon Class */}
                <span className={`material-symbols-rounded text-[1.25rem] transition-transform duration-500 ease-in-out ${isDarkMode ? "rotate-[360deg]" : "group-hover:rotate-45"}`}>
                  {isDarkMode ? "light_mode" : "dark_mode"}
                </span>
                <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </div>
          </div>

          {/* --- BANDISH GRID --- */}
          {!isMounted ? (
            <div className="min-h-[50vh]"></div>
          ) : processedData.length === 0 ? (
            <div className="text-center py-16 animate-card">
              <p className="text-lg text-gray-400 dark:text-[#635f69] font-medium tracking-wide">
                no bandishes found for the given criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {processedData.map((bandish, index) => (
                <div 
                  key={bandish.id} 
                  onClick={() => setSelectedBandish(bandish)}
                  className="group animate-card bg-white dark:bg-[#211F26] hover:bg-[#F7F2FA] dark:hover:bg-[#2B2930] p-6 rounded-3xl border border-gray-100 dark:border-[#332D41] flex flex-col h-full transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-2xl font-bold text-[#1D1B20] dark:text-[#E6E0E9] transition-colors duration-300">
                      {bandish.title}
                    </h2>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFilter("raag", bandish.raag); }}
                      className="bg-[#F3EDF7] dark:bg-[#332D41] hover:bg-[#EADDFF] dark:hover:bg-[#4A4458] text-[#1D1B20] dark:text-[#E6E0E9] px-3 py-1.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 text-left hover:scale-105 active:scale-95"
                    >
                      {bandish.raag}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFilter("taal", bandish.taal); }}
                      className="bg-[#F3EDF7] dark:bg-[#332D41] hover:bg-[#EADDFF] dark:hover:bg-[#4A4458] text-[#1D1B20] dark:text-[#E6E0E9] px-3 py-1.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 text-left hover:scale-105 active:scale-95"
                    >
                      {bandish.taal}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFilter("composer", bandish.composer); }}
                      className="bg-[#F3EDF7] dark:bg-[#332D41] hover:bg-[#EADDFF] dark:hover:bg-[#4A4458] text-[#6750A4] dark:text-[#D0BCFF] px-3 py-1.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 text-left hover:scale-105 active:scale-95"
                    >
                      {bandish.composer}
                    </button>
                  </div>

                  <p className="text-gray-700 dark:text-[#CAC4D0] leading-relaxed mb-4 whitespace-pre-wrap flex-grow text-[1.05rem] transition-colors duration-300 line-clamp-4">
                    {language === "english" 
                      ? bandish.lyrics.english 
                      : (bandish.lyrics.devanagari || "Devanagari lyrics not available")}
                  </p>
                  
                  <div className="mt-auto pt-2 flex items-center text-[#6750A4] dark:text-[#D0BCFF] text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Read Full Bandish</span>
                    {/* Updated Icon Class */}
                    <span className="material-symbols-rounded text-[1.2rem] ml-1">arrow_forward</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* --- THE EXPANDED MODAL --- */}
      {selectedBandish && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={closeModal} 
        >
          <div className={`absolute inset-0 bg-[#21005D]/20 dark:bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-backdrop-exit' : 'animate-backdrop-enter'}`}></div>

          <div 
            className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FEF7FF] dark:bg-[#1D1B20] rounded-[2.5rem] p-8 md:p-12 border border-[#EADDFF] dark:border-[#332D41] ${isClosing ? 'animate-modal-exit' : 'animate-modal-enter'}`}
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="absolute top-6 right-6 md:top-8 md:right-8">
              <button 
                onClick={closeModal}
                className="flex items-center justify-center p-2 bg-[#F3EDF7] dark:bg-[#332D41] hover:bg-[#EADDFF] dark:hover:bg-[#4A4458] text-[#1D1B20] dark:text-[#E6E0E9] rounded-full transition-colors duration-200"
              >
                {/* Updated Icon Class */}
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <div className="pr-12 mb-8">
              <h2 className="text-3xl md:text-5xl font-bold text-[#1D1B20] dark:text-[#E6E0E9] mb-6 transition-colors duration-300">
                {selectedBandish.title}
              </h2>
              
              <div className="flex flex-wrap gap-2">
                <span className="bg-[#EADDFF] dark:bg-[#4A4458] text-[#21005D] dark:text-[#D0BCFF] px-4 py-2 rounded-xl text-sm font-bold tracking-wide">
                  {selectedBandish.raag}
                </span>
                <span className="bg-[#EADDFF] dark:bg-[#4A4458] text-[#21005D] dark:text-[#D0BCFF] px-4 py-2 rounded-xl text-sm font-bold tracking-wide">
                  {selectedBandish.taal}
                </span>
                <span className="bg-[#EADDFF] dark:bg-[#4A4458] text-[#21005D] dark:text-[#D0BCFF] px-4 py-2 rounded-xl text-sm font-bold tracking-wide">
                  {selectedBandish.composer}
                </span>
              </div>
            </div>

            <div className="space-y-8 md:space-y-10">
              {selectedBandish.lyrics.devanagari && (
                <div>
                  <h3 className="text-sm font-bold text-[#6750A4] dark:text-[#D0BCFF] uppercase tracking-wider mb-3 transition-colors duration-300">
                    Devanagari
                  </h3>
                  <p className="text-[#1D1B20] dark:text-[#E6E0E9] text-xl md:text-2xl leading-relaxed whitespace-pre-wrap font-medium transition-colors duration-300">
                    {selectedBandish.lyrics.devanagari}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-[#6750A4] dark:text-[#D0BCFF] uppercase tracking-wider mb-3 transition-colors duration-300">
                  Transliteration
                </h3>
                <p className="text-[#1D1B20] dark:text-[#E6E0E9] text-xl md:text-2xl leading-relaxed whitespace-pre-wrap font-medium transition-colors duration-300">
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