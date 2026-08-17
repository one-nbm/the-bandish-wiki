"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { supabase } from "@/lib/supabase";
import { useTheme } from "./ThemeProvider"; 

export default function Home() {
  const { isDarkMode, toggleDarkMode } = useTheme(); // <-- Pulling from Global State!
  
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("english");
  const [activeFilters, setActiveFilters] = useState<{key: string, value: string}[]>([]);
  
  const [baseData, setBaseData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Modal States
  const [selectedBandish, setSelectedBandish] = useState<any | null>(null);
  const [isClosing, setIsClosing] = useState(false); 
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isInfoClosing, setIsInfoClosing] = useState(false);

  useEffect(() => {
    const fetchBandishes = async () => {
      const { data, error } = await supabase
        .from('bandishes')
        .select('*');

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

    fetchBandishes();
  }, []);

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

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedBandish(null);
      setIsClosing(false);
    }, 300);
  };

  const closeInfoModal = () => {
    setIsInfoClosing(true);
    setTimeout(() => {
      setIsInfoOpen(false);
      setIsInfoClosing(false);
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
    // Removed the dynamic `${isDarkMode ? "dark" : ""}` because ThemeProvider handles it now!
    <main className="min-h-screen bg-[#FDF8FD] dark:bg-[#141218] transition-colors duration-500 relative">
      <div className="p-4 md:p-8 text-gray-900 dark:text-[#E6E0E9] font-sans">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* --- HERO SEARCH SECTION --- */}
          <div className="relative bg-[#EADDFF] dark:bg-[#332D41] rounded-[2.5rem] p-8 md:p-12 transition-colors duration-500">
            
            <div className="absolute top-6 right-6 md:top-8 md:right-8 flex items-center gap-2 md:gap-3">
              <Link
                href="/add"
                className="group flex items-center justify-center px-4 py-2 bg-[#6750A4] hover:bg-[#4F378B] dark:bg-[#D0BCFF] dark:hover:bg-[#EADDFF] text-white dark:text-[#381E72] rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                title="Add a new Bandish"
              >
                <span className="material-symbols-rounded text-[1.25rem]">add</span>
                <span className="hidden md:block font-bold text-sm ml-1">Add Bandish</span>
              </Link>

              <button
                onClick={() => setIsInfoOpen(true)}
                className="group flex items-center justify-center p-2 bg-[#F3EDF7]/50 dark:bg-[#1D1B20]/40 hover:bg-[#F3EDF7] dark:hover:bg-[#4A4458] text-[#4F378B] dark:text-[#D0BCFF] rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                title="How to use the wiki"
              >
                <span className="material-symbols-rounded text-[1.5rem]">info</span>
              </button>
            </div>

            <div className="pr-12 md:pr-48">
              <h1 className="text-4xl md:text-5xl font-bold text-[#21005D] dark:text-[#D0BCFF] mb-2 tracking-tight">
                The Bandish Wiki
              </h1>
              
              <p className="text-[#4F378B] dark:text-[#CAC4D0] mb-8 font-medium transition-all duration-300">
                Showing <span className="font-bold">{bandishCount}</span> bandish{bandishCount !== 1 ? "es" : ""} across <span className="font-bold">{uniqueRaagsCount}</span> raag{uniqueRaagsCount !== 1 ? "s" : ""}
              </p>
            </div>
            
            <div className="relative mb-6 group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none transition-transform duration-300 group-focus-within:scale-110 group-focus-within:text-[#6750A4]">
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
                  {activeFilters.map((filter) => (
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
                onClick={toggleDarkMode} // <-- Calls the global toggle!
                className="group flex items-center justify-center gap-2 bg-[#D0BCFF]/30 dark:bg-[#1D1B20]/50 text-[#21005D] dark:text-[#D0BCFF] px-5 py-2 rounded-full text-sm font-bold border border-[#6750A4]/20 dark:border-[#4A4458] hover:bg-[#D0BCFF]/50 dark:hover:bg-[#4A4458]/50 transition-all duration-300 hover:scale-105 active:scale-95"
              >
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
                      className="bg-[#F3EDF7] dark:bg-[#332D41] hover:bg-[#EADDFF] dark:hover:bg-[#4A4458] text-[#1D1B20] dark:text-[#E6E0E9] px-3 py-1.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 text-left hover:scale-105 active:scale-95"
                    >
                      {bandish.raag}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFilter("taal", bandish.taal); }}
                      className="bg-[#F3EDF7] dark:bg-[#332D41] hover:bg-[#EADDFF] dark:hover:bg-[#4A4458] text-[#1D1B20] dark:text-[#E6E0E9] px-3 py-1.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 text-left hover:scale-105 active:scale-95"
                    >
                      {bandish.taal}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFilter("composer", bandish.composer); }}
                      className="bg-[#F3EDF7] dark:bg-[#332D41] hover:bg-[#EADDFF] dark:hover:bg-[#4A4458] text-[#6750A4] dark:text-[#D0BCFF] px-3 py-1.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 text-left hover:scale-105 active:scale-95"
                    >
                      {bandish.composer}
                    </button>
                  </div>

                  {/* Removed flex-grow to fix text slicing issue */}
                  <p className="text-gray-700 dark:text-[#CAC4D0] leading-relaxed mb-4 whitespace-pre-wrap text-[1.05rem] transition-colors duration-300 line-clamp-4">
                    {language === "english" 
                      ? bandish.lyrics.english 
                      : (bandish.lyrics.devanagari || "Devanagari lyrics not available")}
                  </p>
                  
                  <div className="mt-auto pt-2 flex items-center text-[#6750A4] dark:text-[#D0BCFF] text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Read Full Bandish</span>
                    <span className="material-symbols-rounded text-[1.2rem] ml-1">arrow_forward</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* --- THE INFO MODAL --- */}
      {isInfoOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={closeInfoModal} 
        >
          <div className={`absolute inset-0 bg-[#21005D]/20 dark:bg-black/60 backdrop-blur-sm ${isInfoClosing ? 'animate-backdrop-exit' : 'animate-backdrop-enter'}`}></div>

          <div 
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FEF7FF] dark:bg-[#1D1B20] rounded-[2.5rem] p-8 md:p-12 border border-[#EADDFF] dark:border-[#332D41] m3-scrollbar ${isInfoClosing ? 'animate-modal-exit' : 'animate-modal-enter'}`}
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="absolute top-6 right-6 md:top-8 md:right-8">
              <button 
                onClick={closeInfoModal}
                className="flex items-center justify-center p-2 bg-[#F3EDF7] dark:bg-[#332D41] hover:bg-[#EADDFF] dark:hover:bg-[#4A4458] text-[#1D1B20] dark:text-[#E6E0E9] rounded-full transition-colors duration-200"
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-rounded text-[2.5rem] text-[#6750A4] dark:text-[#D0BCFF]">info</span>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1D1B20] dark:text-[#E6E0E9]">
                  How to use this Wiki
                </h2>
              </div>

              <div className="space-y-6">
                <div className="bg-[#F3EDF7] dark:bg-[#2B2930] p-6 rounded-3xl border border-[#EADDFF]/50 dark:border-[#332D41]/50">
                  <h3 className="font-bold text-xl text-[#21005D] dark:text-[#D0BCFF] flex items-center gap-2 mb-3">
                    <span className="material-symbols-rounded">search</span> Smart Search
                  </h3>
                  <p className="text-[#4F378B] dark:text-[#CAC4D0] leading-relaxed text-lg">
                    Type anything in the search bar! The engine automatically searches through titles, raags, taals, and composers. It will even handle small spelling mistakes gracefully.
                  </p>
                </div>

                <div className="bg-[#F3EDF7] dark:bg-[#2B2930] p-6 rounded-3xl border border-[#EADDFF]/50 dark:border-[#332D41]/50">
                  <h3 className="font-bold text-xl text-[#21005D] dark:text-[#D0BCFF] flex items-center gap-2 mb-3">
                    <span className="material-symbols-rounded">filter_list</span> Tag Filters
                  </h3>
                  <p className="text-[#4F378B] dark:text-[#CAC4D0] leading-relaxed text-lg">
                    Click any pill-shaped tag (like the Raag or Taal) on a bandish card to instantly filter the entire wiki to show only matching compositions. You can layer multiple filters together!
                  </p>
                </div>

                <div className="bg-[#F3EDF7] dark:bg-[#2B2930] p-6 rounded-3xl border border-[#EADDFF]/50 dark:border-[#332D41]/50">
                  <h3 className="font-bold text-xl text-[#21005D] dark:text-[#D0BCFF] flex items-center gap-2 mb-3">
                    <span className="material-symbols-rounded">translate</span> Language Toggle
                  </h3>
                  <p className="text-[#4F378B] dark:text-[#CAC4D0] leading-relaxed text-lg">
                    Use the switch below the search bar to swap the home grid between English transliteration and native Devanagari script.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- THE EXPANDED BANDISH MODAL --- */}
      {selectedBandish && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={closeModal} 
        >
          <div className={`absolute inset-0 bg-[#21005D]/20 dark:bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-backdrop-exit' : 'animate-backdrop-enter'}`}></div>

          <div 
            className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FEF7FF] dark:bg-[#1D1B20] rounded-[2.5rem] p-8 md:p-12 border border-[#EADDFF] dark:border-[#332D41] m3-scrollbar ${isClosing ? 'animate-modal-exit' : 'animate-modal-enter'}`}
            onClick={(e) => e.stopPropagation()} 
          >
            {/* UPDATED: Changed to flex-col to stack buttons vertically */}
            <div className="absolute top-6 right-6 md:top-8 md:right-8 flex flex-col gap-2 md:gap-3">
              
              {/* The Close Button (Moved to the top) */}
              <button 
                onClick={closeModal}
                className="flex items-center justify-center p-2 bg-[#F3EDF7] dark:bg-[#332D41] hover:bg-[#EADDFF] dark:hover:bg-[#4A4458] text-[#1D1B20] dark:text-[#E6E0E9] rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span className="material-symbols-rounded text-[1.4rem]">close</span>
              </button>

              {/* The Edit Button (Now safely underneath) */}
              <Link 
                href={`/edit/${selectedBandish.id}`}
                className="flex items-center justify-center p-2 bg-[#EADDFF]/50 dark:bg-[#4A4458]/50 hover:bg-[#EADDFF] dark:hover:bg-[#4A4458] text-[#6750A4] dark:text-[#D0BCFF] rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                title="Edit Bandish"
              >
                <span className="material-symbols-rounded text-[1.4rem]">edit</span>
              </Link>
            </div>

            <div className="pr-12 mb-8">
              <h2 className="text-3xl md:text-5xl font-bold text-[#1D1B20] dark:text-[#E6E0E9] mb-6 transition-colors duration-300">
                {selectedBandish.title}
              </h2>
              
              <div className="flex flex-wrap gap-2">
                <span className="bg-[#EADDFF] dark:bg-[#4A4458] text-[#21005D] dark:text-[#D0BCFF] px-4 py-2 rounded-full text-sm font-bold tracking-wide">
                  {selectedBandish.raag}
                </span>
                <span className="bg-[#EADDFF] dark:bg-[#4A4458] text-[#21005D] dark:text-[#D0BCFF] px-4 py-2 rounded-full text-sm font-bold tracking-wide">
                  {selectedBandish.taal}
                </span>
                <span className="bg-[#EADDFF] dark:bg-[#4A4458] text-[#21005D] dark:text-[#D0BCFF] px-4 py-2 rounded-full text-sm font-bold tracking-wide">
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