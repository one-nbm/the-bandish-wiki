"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

// Pure function — no closure deps, safe outside the component
function getSamayFromHour(hour: number) {
  if (hour >= 5 && hour < 12) return { greeting: "Good morning", samay: "Morning", themeClass: "from-amber-500/15 to-orange-500/15 dark:from-amber-500/10 dark:to-orange-500/10", icon: "wb_sunny" };
  if (hour >= 12 && hour < 17) return { greeting: "Good afternoon", samay: "Afternoon", themeClass: "from-orange-500/15 to-rose-500/15 dark:from-orange-500/10 dark:to-rose-500/10", icon: "light_mode" };
  if (hour >= 17 && hour < 21) return { greeting: "Good evening", samay: "Evening", themeClass: "from-indigo-500/15 to-purple-500/15 dark:from-indigo-500/10 dark:to-purple-500/10", icon: "clear_night" };
  return { greeting: "Good night", samay: "Night", themeClass: "from-blue-600/15 to-indigo-900/15 dark:from-blue-600/10 dark:to-indigo-900/10", icon: "bedtime" };
}

type WelcomeScreenProps = {
  query: string;
  setQuery: (q: string) => void;
  onStartBrowsing: () => void;
  totalBandishes: number;
  totalRaags: number;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
};

export default function WelcomeScreen({ query, setQuery, onStartBrowsing, totalBandishes, totalRaags, searchInputRef }: WelcomeScreenProps) {
  const [raagPool, setRaagPool] = useState<{ name: string; slug: string; thaat?: string; bandishCount?: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform);

  // Initialise synchronously — no race condition
  const [timeState, setTimeState] = useState(() => getSamayFromHour(new Date().getHours()));

  // Keep it up-to-date if the user leaves the tab open across a samay boundary
  useEffect(() => {
    const id = setInterval(() => {
      setTimeState(getSamayFromHour(new Date().getHours()));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setFetchError(false);
    async function fetchSamayRaags() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("raags")
          .select("name, slug, thaat")
          .ilike("samay", `%${timeState.samay}%`)
          .order("name");
        if (error) throw error;
        if (data && data.length > 0) {
          const withCounts = await Promise.all(
            data.map(async (raag) => {
              const { count } = await supabase
                .from("bandishes")
                .select("id", { count: "exact", head: true })
                .eq("raag", raag.name);
              return { ...raag, bandishCount: count ?? 0 };
            })
          );
          setRaagPool(withCounts);
        } else {
          // Fallback: grab any raag if samay has no matches
          const { data: fallback } = await supabase.from("raags").select("name, slug, thaat").order("name").limit(10);
          setRaagPool(fallback ?? []);
        }
      } catch {
        setFetchError(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSamayRaags();
  }, [timeState.samay]);

  function retryFetch() {
    setFetchError(false);
    setIsLoading(true);
    // Re-trigger by momentarily changing a dep isn't clean — instead call directly
    const supabase = createClient();
    supabase
      .from("raags")
      .select("name, slug, thaat")
      .ilike("samay", `%${timeState.samay}%`)
      .order("name")
      .then(async ({ data, error }) => {
        if (error || !data || data.length === 0) {
          const { data: fallback } = await supabase.from("raags").select("name, slug, thaat").order("name").limit(10);
          setRaagPool(fallback ?? []);
          if (error) { setFetchError(true); }
        } else {
          const withCounts = await Promise.all(
            data.map(async (raag) => {
              const { count } = await supabase.from("bandishes").select("id", { count: "exact", head: true }).eq("raag", raag.name);
              return { ...raag, bandishCount: count ?? 0 };
            })
          );
          setRaagPool(withCounts);
        }
        setIsLoading(false);
      });
  }

  const featuredRaag = useMemo(() => {
    if (raagPool.length === 0) return null;
    // Sort for stable ordering across renders
    const sorted = [...raagPool].sort((a, b) => a.name.localeCompare(b.name));
    // Deterministic hash seeded by date + samay — stable across refreshes
    const today = new Date();
    const seedString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}-${timeState.samay}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = (hash << 5) - hash + seedString.charCodeAt(i);
      hash = hash & hash;
    }
    return sorted[Math.abs(hash) % sorted.length] || null;
  }, [raagPool, timeState.samay]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Empty query = browse all — no silent failure
    onStartBrowsing();
  };

  return (
    <div className={`min-h-[85vh] flex flex-col items-center justify-center p-6 sm:p-8 animate-modal-enter relative`}>

      {/* Background Gradient Blob based on Samay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${timeState.themeClass} opacity-50 dark:opacity-30 blur-3xl pointer-events-none transition-all duration-1000`} />

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center text-center">

        {/* Title */}
        <motion.h2 layoutId="app-title" className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight" style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}>
          The Bandish Wiki
        </motion.h2>

        {/* Greeting & Samay Indicator */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-m3-surface-container-dark/90 border border-gray-200/80 dark:border-gray-700/80 backdrop-blur-xl mb-8 animate-toast-slide-up cursor-default"
          title="Samay refers to the time of day a raag is traditionally performed in Hindustani classical music"
        >
          <span className="material-symbols-rounded text-[1.2rem] text-m3-primary dark:text-m3-primary-dark">{timeState.icon}</span>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-wide uppercase">{timeState.samay} Samay</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight" style={{ fontVariationSettings: '"wght" 900, "wdth" 130' }}>
          {timeState.greeting}.
        </h1>

        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-xl mx-auto font-medium">
          Welcome to the Bandish Wiki, a living archive of Hindustani bandishes; notated, translated, and growing.
        </p>

        {/* Big Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full relative group mb-12">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <span className="material-symbols-rounded text-[1.8rem] text-gray-400 dark:text-gray-500 group-focus-within:text-m3-primary dark:group-focus-within:text-m3-primary-dark transition-colors duration-300">search</span>
          </div>
          <input
            ref={searchInputRef}
            type="text"
            className="w-full bg-white dark:bg-m3-surface-container-dark text-gray-900 dark:text-white text-lg md:text-xl px-16 py-6 rounded-[2rem] border-2 border-transparent focus:border-m3-primary dark:focus:border-m3-primary-dark outline-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Search for a bandish, raag, taal, composer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 right-4 flex items-center gap-2">
            {/* Ctrl+K hint — fades out when the input is focused */}
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200/60 dark:border-gray-700/40 pointer-events-none group-focus-within:opacity-0 transition-opacity duration-200 select-none">
              {isMounted ? (isMac ? <span className="font-sans">⌘</span> : <span>Ctrl</span>) : <span>Ctrl</span>}K
            </kbd>
            <button type="submit" className="bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900 w-12 h-12 flex items-center justify-center rounded-full transition-transform duration-300 hover:scale-105 active:scale-95">
              <span className="material-symbols-rounded">arrow_forward</span>
            </button>
          </div>
        </form>

        {/* Quick Links / Curator's Desk Elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">

          {/* Featured Raag — skeleton while loading, error state on failure, full card when ready */}
          {isLoading ? (
            <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-m3-surface-container-dark/70 rounded-3xl border border-gray-200/80 dark:border-gray-700/80 backdrop-blur-xl animate-pulse">
              <div className="space-y-2 flex-1 mr-4">
                <div className="h-3 w-20 bg-gray-300/60 dark:bg-gray-600/60 rounded-full" />
                <div className="h-6 w-36 bg-gray-300/60 dark:bg-gray-600/60 rounded-full" />
                <div className="h-3 w-28 bg-gray-200/60 dark:bg-gray-700/60 rounded-full" />
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200/60 dark:bg-gray-700/60 shrink-0" />
            </div>
          ) : fetchError ? (
            <button onClick={onStartBrowsing} className="group flex items-center justify-between p-6 bg-m3-error/5 dark:bg-m3-error-dark/5 rounded-3xl border border-m3-error/20 dark:border-m3-error-dark/20 text-left transition-all duration-300 hover:-translate-y-1 w-full">
              <div>
                <span className="block text-xs font-bold text-m3-error dark:text-m3-error-dark uppercase tracking-wider mb-1">Featured Raag</span>
                <span className="text-base font-semibold text-gray-600 dark:text-gray-400">Couldn't load</span>
                <div className="flex gap-3 mt-2">
                  <button onClick={(e) => { e.stopPropagation(); retryFetch(); }} className="text-xs font-bold text-m3-primary dark:text-m3-primary-dark hover:underline">Try again</button>
                  <span className="text-xs text-gray-400">·</span>
                  <button onClick={(e) => { e.stopPropagation(); onStartBrowsing(); }} className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:underline">Browse all instead</button>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-m3-error/10 flex items-center justify-center text-m3-error dark:text-m3-error-dark shrink-0">
                <span className="material-symbols-rounded text-[1.2rem]">sync_problem</span>
              </div>
            </button>
          ) : featuredRaag ? (
            <Link
              href={featuredRaag.slug ? `/raag/${featuredRaag.slug}` : `/raag/${featuredRaag.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}`}
              className="group flex items-center justify-between p-6 bg-white/90 dark:bg-m3-surface-container-dark/90 hover:bg-white dark:hover:bg-m3-surface-high-dark backdrop-blur-xl rounded-3xl border border-gray-200/80 dark:border-gray-700/80 transition-all duration-500 hover:-translate-y-1 text-left"
            >
              <div className="flex-1 mr-4">
                <span className="block text-xs font-bold text-m3-secondary dark:text-m3-secondary-dark uppercase tracking-wider mb-1">{timeState.samay} Raag</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white block mb-1">{featuredRaag.name}</span>
                <span
                  className="text-xs text-gray-500 dark:text-gray-400 font-medium"
                  title="Thaat is the parent scale family a raag belongs to"
                >
                  {[featuredRaag.thaat && `${featuredRaag.thaat} thaat`, featuredRaag.bandishCount != null && `${featuredRaag.bandishCount} bandish${featuredRaag.bandishCount !== 1 ? "es" : ""}`].filter(Boolean).join(" · ")}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-m3-secondary/10 dark:bg-m3-secondary-dark/10 flex items-center justify-center text-m3-secondary dark:text-m3-secondary-dark transition-transform group-hover:scale-110 shrink-0">
                <span className="material-symbols-rounded text-[1.2rem]">menu_book</span>
              </div>
            </Link>
          ) : null}

          <button onClick={onStartBrowsing} className="group flex items-center justify-between p-6 bg-white/90 dark:bg-m3-surface-container-dark/90 hover:bg-white dark:hover:bg-m3-surface-high-dark backdrop-blur-xl rounded-3xl border border-gray-200/80 dark:border-gray-700/80 transition-all duration-500 hover:-translate-y-1 text-left">
            <div className="flex-1 mr-4">
              <span className="text-xl font-bold text-gray-900 dark:text-white block mb-1">Browse Full Archive</span>
              {totalBandishes > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{totalBandishes} bandishes{totalRaags > 0 ? ` · ${totalRaags} raags` : ""}</span>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-m3-primary/10 dark:bg-m3-primary-dark/10 flex items-center justify-center text-m3-primary dark:text-m3-primary-dark transition-transform group-hover:scale-110 shrink-0">
              <span className="material-symbols-rounded">library_music</span>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
