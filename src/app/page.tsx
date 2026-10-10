"use client";

import { useState, useEffect, useMemo, useRef, useCallback, useDeferredValue } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { createClient } from "@/utils/supabase/client";
import { useTheme } from "./ThemeProvider";
import { M3LoadingIndicator } from "@alerix/m3-loading-indicator/react";
import { checkIsEditor, getUserRole, UserRole } from "./actions";
import WelcomeScreen from "@/components/WelcomeScreen";
import { BandishCard } from "@/components/BandishCard";
import { BandishModal } from "@/components/BandishModal";
import BandishFormModal from "@/components/BandishFormModal";
import { motion, AnimatePresence } from "framer-motion";
import { ReactLenis } from 'lenis/react';
import { LENIS_OPTIONS } from '@/components/SmoothScrolling';

export default function Home() {
  const supabase = createClient();
  const { isDarkMode, toggleDarkMode } = useTheme();

  // --- 1. SEARCH & FILTER STATES ---
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [language, setLanguage] = useState("english");
  const [activeFilters, setActiveFilters] = useState<{ key: string, value: string }[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const favoritesRef = useRef<string[]>(favorites);
  
  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [hasStartedBrowsing, setHasStartedBrowsing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query.trim() !== "" || activeFilters.length > 0 || showFavoritesOnly) {
      setHasSearched(true);
    }
  }, [query, activeFilters, showFavoritesOnly]);

  // Prevent hover thrashing / scroll choppiness on bandish cards while scrolling
  useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    let isScrollingActive = false;

    const stopScrolling = () => {
      if (scrollTimer) {
        clearTimeout(scrollTimer);
        scrollTimer = null;
      }
      if (isScrollingActive) {
        document.body.classList.remove("is-scrolling");
        isScrollingActive = false;
      }
    };

    const handleScrollActivity = () => {
      if (!isScrollingActive) {
        isScrollingActive = true;
        document.body.classList.add("is-scrolling");
      }
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        stopScrolling();
      }, 70);
    };

    // Instant bypass on any click / tap via capture phase so zero clicks are swallowed
    const handlePointerDown = () => {
      stopScrolling();
    };

    window.addEventListener("scroll", handleScrollActivity, { passive: true });
    window.addEventListener("wheel", handleScrollActivity, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { capture: true, passive: true });
    window.addEventListener("touchstart", handlePointerDown, { capture: true, passive: true });
    window.addEventListener("blur", stopScrolling);

    return () => {
      window.removeEventListener("scroll", handleScrollActivity);
      window.removeEventListener("wheel", handleScrollActivity);
      window.removeEventListener("pointerdown", handlePointerDown, { capture: true });
      window.removeEventListener("touchstart", handlePointerDown, { capture: true });
      window.removeEventListener("blur", stopScrolling);
      stopScrolling();
    };
  }, []);

  // --- 2. DATA STATES ---
  const [baseData, setBaseData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("viewer");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [contributorName, setContributorName] = useState("Anonymous");

  // --- 3. MODAL VISIBILITY STATES ---
  const [selectedBandish, setSelectedBandish] = useState<any | null>(null);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [selectedBandishRect, setSelectedBandishRect] = useState<DOMRect | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isInfoClosing, setIsInfoClosing] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBandish, setEditingBandish] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string, onConfirm: () => void } | null>(null);
  const [isViewOptionsOpen, setIsViewOptionsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [enableGlur, setEnableGlur] = useState(true);

  // --- 5. EFFECTS ---
  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getUserRole();
      setUserRole(role);
      setIsAdmin(role === "admin");
    };

    fetchUserRole();

    const fetchBandishes = async () => {
      const { data, error } = await supabase.from('bandishes').select('*');
      if (error) { console.error("Error fetching data:", error); return; }
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

    const fetchUserAndFavorites = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsSignedIn(true);
        if (session.user.user_metadata?.contributor_name) {
          setContributorName(session.user.user_metadata.contributor_name);
        }
        const userFavs = session.user.user_metadata?.favorites;
        if (Array.isArray(userFavs)) {
          setFavorites(userFavs);
        } else {
          // fallback to local storage if no user metadata yet
          const savedFavs = localStorage.getItem("wiki-favorites");
          if (savedFavs) { try { setFavorites(JSON.parse(savedFavs)); } catch (e) { } }
        }
      } else {
        setIsSignedIn(false);
        const savedFavs = localStorage.getItem("wiki-favorites");
        if (savedFavs) { try { setFavorites(JSON.parse(savedFavs)); } catch (e) { } }
      }
    };

    const savedGlur = localStorage.getItem("wiki-glur");
    if (savedGlur !== null) setEnableGlur(savedGlur === "true");

    fetchUserAndFavorites();
    fetchBandishes();
  }, []);

  // Lock Background Scrolling
  useEffect(() => {
    if (selectedBandish || isInfoOpen || isAddOpen || editingBandish) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    }
    return () => { document.body.style.paddingRight = ""; document.body.style.overflow = ""; };
  }, [selectedBandish, isInfoOpen, isAddOpen, editingBandish]);

  // --- 6. HANDLERS ---
  const closeModal = () => { setSelectedBandish(null); setSelectedBandishRect(null); };
  const selectBandish = useCallback((bandish: any, rect: DOMRect) => {
    setSelectedBandish(bandish);
    setSelectedBandishRect(rect);
    setIsModalAnimating(true);
  }, []);
  const closeInfoModal = () => { setIsInfoClosing(true); setTimeout(() => { setIsInfoOpen(false); setIsInfoClosing(false); }, 300); };

  const openEditModal = (bandish: any) => {
    setEditingBandish(bandish);
    // Close the viewing modal without animation to transition smoothly to edit
    setSelectedBandish(null);
  };

  const maxExistingId = useMemo(() => {
    const currentIds = baseData.map(b => parseInt(b.id, 10)).filter(n => !isNaN(n));
    return currentIds.length > 0 ? Math.max(...currentIds) : 0;
  }, [baseData]);

  const handleBandishModalSuccess = useCallback((action: "add" | "edit" | "delete", data?: any, id?: string) => {
    if (action === "add") {
      if (userRole === "contributor") {
        setToast({ message: "New bandish submitted for administrator approval!", type: 'success' });
      } else {
        if (data) {
          setBaseData(prev => [data, ...prev]);
        }
        setToast({ message: "Bandish published successfully!", type: 'success' });
      }
      setIsAddOpen(false);
    } else if (action === "edit") {
      if (userRole === "contributor") {
        setToast({ message: "Suggested edits submitted for administrator approval!", type: 'success' });
      } else {
        if (data && id) {
          setBaseData(prev => prev.map(b => b.id === id ? data : b));
          setSelectedBandish(data);
        }
        setToast({ message: "Bandish updated successfully!", type: 'success' });
      }
      setEditingBandish(null);
    } else if (action === "delete") {
      if (id) {
        setBaseData(prev => prev.filter(b => b.id !== id));
      }
      setEditingBandish(null);
      setSelectedBandish(null);
      setToast({ message: "Bandish deleted.", type: 'success' });
    }
  }, [userRole]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (toast) setToast(null);
        else if (confirmDialog) setConfirmDialog(null);
        else if (isViewOptionsOpen) setIsViewOptionsOpen(false);
        else if (isInfoOpen) closeInfoModal();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setHasStartedBrowsing(true); // Jump to browse if they use the shortcut
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };

    const handleResetBrowsing = () => {
      setHasStartedBrowsing(false);
      setQuery("");
      setActiveFilters([]);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("reset-browsing", handleResetBrowsing);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("reset-browsing", handleResetBrowsing);
    };
  }, [toast, confirmDialog, isViewOptionsOpen, isInfoOpen]);

  const toggleFilter = useCallback((key: string, value: string) => {
    setActiveFilters((prev) => {
      const isAlreadyActive = prev.some((f) => f.key === key && f.value === value);
      if (isAlreadyActive) return prev.filter((f) => !(f.key === key && f.value === value));
      return [...prev, { key, value }];
    });
  }, []);

  const toggleFavorite = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    const currentFavs = favoritesRef.current;
    const newFavs = currentFavs.includes(id)
      ? currentFavs.filter((favId) => favId !== id)
      : [...currentFavs, id];

    setFavorites(newFavs);

    if (isSignedIn) {
      await supabase.auth.updateUser({
        data: { favorites: newFavs }
      });
    } else {
      localStorage.setItem("wiki-favorites", JSON.stringify(newFavs));
    }
  }, [isSignedIn, supabase]);

  // --- 7. DATA PROCESSING ---
  const preSearchData = useMemo(() => {
    let data = baseData;
    if (showFavoritesOnly) data = data.filter((bandish) => favorites.includes(bandish.id));
    if (activeFilters.length > 0) {
      data = data.filter((bandish) => activeFilters.every((filter) => {
        if (filter.key === "raag") return bandish.raag === filter.value;
        if (filter.key === "taal") return bandish.taal === filter.value;
        if (filter.key === "lay") return bandish.lay?.includes(filter.value);
        if (filter.key === "composer") return bandish.composer === filter.value;
        return true;
      }));
    }
    return data;
  }, [baseData, showFavoritesOnly, favorites, activeFilters]);

  const fuseBandishes = useMemo(() => new Fuse(preSearchData, { keys: ["title", "raag", "composer", "taal", "lay"], threshold: 0.4 }), [preSearchData]);

  const processedData = useMemo(() => {
    if (deferredQuery) {
      return fuseBandishes.search(deferredQuery).map((result) => result.item);
    }
    return preSearchData;
  }, [preSearchData, deferredQuery, fuseBandishes]);

  const bandishCount = processedData.length;
  const uniqueRaagsCount = new Set(processedData.map((b) => b.raag)).size;

  const allRaags = useMemo(() => Array.from(new Set(baseData.map(b => b.raag).filter(Boolean))).sort(), [baseData]);
  const allTaals = useMemo(() => {
    const set = new Set<string>();
    baseData.forEach((b) => {
      if (b.taal) set.add(b.taal.trim());
    });
    ["Tintal", "Teentaal", "Ektaal", "Jhaptal", "Rupak", "Keherwa", "Dadra", "Tilwada", "Dhamar", "Deepchandi", "Ada Chautal", "Chautal", "Roopak"].forEach((t) => set.add(t));
    return Array.from(set).filter(Boolean).sort();
  }, [baseData]);

  const allLays = useMemo(() => {
    const set = new Set<string>(["Vilambit", "Madhya", "Drut", "Ati Drut", "Vilambit Laya", "Drut Laya"]);
    baseData.forEach((b) => {
      if (!b.lay) return;
      if (Array.isArray(b.lay)) {
        b.lay.forEach((l: any) => {
          if (typeof l === "string") {
            const trimmed = l.trim();
            if (trimmed) set.add(trimmed);
          }
        });
      } else if (typeof b.lay === "string") {
        b.lay.split(",").forEach((l: string) => {
          const trimmed = l.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set).filter(Boolean).sort();
  }, [baseData]);

  const allComposers = useMemo(() => Array.from(new Set(baseData.map(b => b.composer).filter(Boolean))).sort(), [baseData]);

  const fuseRaags = useMemo(() => new Fuse(allRaags, { threshold: 0.4 }), [allRaags]);
  const fuseComposers = useMemo(() => new Fuse(allComposers, { threshold: 0.4 }), [allComposers]);

  const suggestedRaag = useMemo(() => {
    const cleanQuery = deferredQuery.trim();
    if (!cleanQuery || cleanQuery.length < 3) return null;
    const results = fuseRaags.search(cleanQuery);
    if (results.length > 0 && !activeFilters.some(f => f.key === "raag" && f.value === results[0].item)) return results[0].item;
    return null;
  }, [deferredQuery, fuseRaags, activeFilters]);

  const suggestedComposer = useMemo(() => {
    const cleanQuery = deferredQuery.trim();
    if (!cleanQuery || cleanQuery.length < 3) return null;
    const results = fuseComposers.search(cleanQuery);
    if (results.length > 0 && !activeFilters.some(f => f.key === "composer" && f.value === results[0].item)) return results[0].item;
    return null;
  }, [deferredQuery, fuseComposers, activeFilters]);

  // --- 8. MEMOIZED GRID ---
  const selectedBandishId = selectedBandish?.id ?? null;

  const renderGrid = () => {
    if (processedData.length === 0 && !suggestedRaag && !suggestedComposer) {
      return (
        <div className="text-center py-16 animate-card">
          <p className="text-lg text-gray-400 dark:text-gray-500 font-medium tracking-wide">
            {showFavoritesOnly ? "You haven't saved any favorites yet!" : "No bandishes found... Adjust your filters or search query."}
          </p>
        </div>
      );
    }

    return (
      <div className="columns-1 md:columns-2 xl:columns-3 gap-4">
        {suggestedRaag && (
          <div className="group relative bg-m3-secondary/10 dark:bg-m3-secondary-dark/10 p-6 md:p-8 rounded-[1.5rem] border border-m3-secondary/20 flex flex-col items-start break-inside-avoid mb-4 transition duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:scale-[1.01] transform-gpu">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-rounded text-[2rem] text-m3-secondary dark:text-m3-secondary-dark">manage_search</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">Looking for Raag {suggestedRaag}?</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-[1.05rem]">Switch to a tag filter to see a clean list of all bandishes in this raag.</p>
            <div className="flex flex-wrap gap-3 mt-1">
              <button
                onClick={() => { toggleFilter("raag", suggestedRaag); setQuery(""); }}
                className="flex items-center gap-2 bg-m3-secondary hover:bg-m3-secondary/90 dark:bg-m3-secondary-dark dark:hover:bg-m3-secondary-dark/90 text-white dark:text-gray-900 px-5 py-2.5 rounded-3xl text-sm font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-95"
              >
                <span className="material-symbols-rounded text-[1.2rem]">filter_list</span>
                Filter by {suggestedRaag}
              </button>
              <Link
                href={`/raag/${suggestedRaag.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-2 bg-m3-primary/10 hover:bg-m3-primary/20 dark:bg-m3-primary-dark/10 dark:hover:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark px-5 py-2.5 rounded-3xl text-sm font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-95 group"
              >
                <span className="material-symbols-rounded text-[1.2rem] transition-transform group-hover:scale-110">menu_book</span>
                Read Raag Wiki
              </Link>
            </div>
          </div>
        )}

        {suggestedComposer && (
          <div className="group relative bg-m3-tertiary/10 dark:bg-m3-tertiary-dark/10 p-6 md:p-8 rounded-[1.5rem] border border-m3-tertiary/20 flex flex-col items-start break-inside-avoid mb-4 transition duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:scale-[1.01] transform-gpu">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-rounded text-[2rem] text-m3-tertiary dark:text-m3-tertiary-dark">person_search</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">Looking for {suggestedComposer}?</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-[1.05rem]">Switch to a tag filter to see a clean list of all bandishes by this composer.</p>
            <button onClick={() => { toggleFilter("composer", suggestedComposer); setQuery(""); }} className="flex items-center gap-2 bg-m3-tertiary hover:bg-m3-tertiary/90 dark:bg-m3-tertiary-dark dark:hover:bg-m3-tertiary-dark/90 text-white dark:text-gray-900 px-6 py-3 rounded-3xl font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-95">
              <span className="material-symbols-rounded text-[1.2rem]">filter_list</span> Filter by {suggestedComposer}
            </button>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {processedData.map((bandish, index) => (
            <BandishCard
              key={bandish.id}
              bandish={bandish}
              index={index}
              isSelected={selectedBandishId === bandish.id}
              isFavorited={favorites.includes(bandish.id)}
              language={language}
              isSearching={deferredQuery.trim() !== ""}
              disableEntranceAnimation={hasSearched}
              onSelect={selectBandish}
              onToggleFavorite={toggleFavorite}
              onToggleFilter={toggleFilter}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-transparent transition-colors duration-500 relative font-sans">
      <AnimatePresence mode="wait">
            {!hasStartedBrowsing ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                className="w-full max-w-5xl mx-auto p-3 sm:p-4 md:p-8"
              >
                <WelcomeScreen
                  query={query}
                  setQuery={setQuery}
                  onStartBrowsing={() => {
                    setHasStartedBrowsing(true);
                    window.dispatchEvent(new Event("start-browsing"));
                  }}
                  totalBandishes={baseData.length}
                  totalRaags={new Set(baseData.map(b => b.raag)).size}
                  searchInputRef={searchInputRef}
                />
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="w-full"
              >
                {/* --- HERO SEARCH SECTION --- */}
                <div className="sticky top-0 z-40 mb-6 md:mb-8">
                  {/* PROGRESSIVE GLUR BACKGROUND */}
                  {enableGlur && !isModalAnimating && (
                    <div
                      className="absolute inset-x-0 top-0 h-[calc(100%+2rem)] md:h-[calc(100%+3rem)] pointer-events-none z-0"
                    >
                      <div className="absolute inset-0 bg-m3-surface-container/80 dark:bg-m3-surface-dark/80" style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }} />
                      <div className="absolute inset-0" style={{ backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }} />
                      <div className="absolute inset-0" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', maskImage: 'linear-gradient(to bottom, black 40%, transparent 80%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 80%)' }} />
                      <div className="absolute inset-0" style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', maskImage: 'linear-gradient(to bottom, black 20%, transparent 60%)', WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 60%)' }} />
                      <div className="absolute inset-0" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', maskImage: 'linear-gradient(to bottom, black 0%, transparent 40%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 40%)' }} />
                    </div>
                  )}
                  {/* FAST FALLBACK GRADIENT DURING ANIMATION (No Blur) */}
                  {enableGlur && isModalAnimating && (
                    <div
                      className="absolute inset-x-0 top-0 h-[calc(100%+2rem)] md:h-[calc(100%+3rem)] pointer-events-none z-0"
                    >
                      <div className="absolute inset-0 bg-m3-surface-container dark:bg-m3-surface-dark" style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }} />
                    </div>
                  )}
                  {!enableGlur && (
                    <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none z-[-1] bg-m3-surface-container dark:bg-m3-surface-container-dark" />
                  )}
                  <div className="relative z-10 pt-6 pb-4 md:pt-10 md:pb-6 max-w-7xl mx-auto px-4 sm:px-8 md:px-16 lg:px-24">
                    <div className="flex flex-col gap-3 md:gap-4 mb-2 md:mb-4">
                      {/* Search Bar + Controls */}
                      <div className="flex flex-row items-center gap-2 md:gap-3 px-1 md:px-2">
                        <div className="relative flex-1 group transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-5 md:pl-6 pointer-events-none z-10 transition-transform duration-500">
                            <span className="material-symbols-rounded transition-colors duration-300 text-gray-500 dark:text-gray-400 group-focus-within:text-m3-primary dark:group-focus-within:text-m3-primary-dark">search</span>
                          </div>
                          <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search by text... (Ctrl+K)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-white dark:bg-m3-surface-container-dark text-gray-900 dark:text-white text-base md:text-lg pl-[3.75rem] md:pl-[4.25rem] pr-[3.75rem] py-4 md:py-5 rounded-full border border-m3-surface-high dark:border-m3-surface-high-dark focus:border-m3-primary dark:focus:border-m3-primary-dark focus:ring-1 focus:ring-m3-primary dark:focus:ring-m3-primary-dark focus:outline-none transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                          />
                          <div className="absolute inset-y-0 right-2 flex items-center">
                            <button onClick={() => setIsViewOptionsOpen(!isViewOptionsOpen)} className={`p-2 md:p-3 rounded-full transition-all duration-300 flex items-center justify-center ${isViewOptionsOpen ? 'bg-m3-primary/15 dark:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark' : 'text-gray-500 hover:text-m3-primary dark:text-gray-400 dark:hover:text-m3-primary-dark hover:bg-gray-100 dark:hover:bg-m3-surface-high-dark'}`} title="View Options">
                              <span className="material-symbols-rounded text-xl md:text-2xl transition-transform duration-500 group-hover:rotate-180">tune</span>
                            </button>
                          </div>
                        </div>

                        {/* Info Button (Hidden on Mobile Search Row) */}
                        <button onClick={() => setIsInfoOpen(true)} className="group hidden sm:flex items-center justify-center w-[3.5rem] h-[3.5rem] p-0 bg-m3-primary/5 hover:bg-m3-primary/10 dark:bg-m3-primary-dark/10 dark:hover:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-95 border border-m3-primary/20 dark:border-m3-primary-dark/20 shrink-0" title="How to use the wiki">
                          <span className="material-symbols-rounded text-[1.5rem]">info</span>
                        </button>

                        {/* Add Button */}
                        {userRole === "admin" || userRole === "contributor" ? (
                          <button onClick={() => setIsAddOpen(true)} className="group flex items-center justify-center w-[3.5rem] h-[3.5rem] sm:w-auto sm:px-6 bg-m3-primary hover:bg-m3-primary/90 dark:bg-m3-primary-dark dark:hover:bg-m3-primary-dark/90 text-white dark:text-gray-900 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-95 shrink-0" title={userRole === "admin" ? "Add a new Bandish" : "Contribute a new Bandish"}>
                            <span className="material-symbols-rounded text-[1.5rem]">add</span>
                            <span className="hidden sm:block font-bold text-sm ml-1">Add</span>
                          </button>
                        ) : (
                          <a
                            href="https://forms.gle/sTqp5q4Ym6JLzaSA9"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-center w-[3.5rem] h-[3.5rem] sm:w-auto sm:px-6 bg-m3-primary/5 hover:bg-m3-primary/10 dark:bg-m3-primary-dark/10 dark:hover:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-95 border border-m3-primary/20 dark:border-m3-primary-dark/20 shrink-0"
                            title="Submit a Bandish"
                          >
                            <span className="material-symbols-rounded text-[1.5rem]">add</span>
                            <span className="hidden sm:block font-bold text-sm ml-1">Submit</span>
                          </a>
                        )}
                      </div>

                      {/* Meta/Summary Row */}
                      <div className="flex flex-row items-center justify-between px-2 pt-1 md:pt-0">
                        <p className="text-xs md:text-sm text-m3-secondary dark:text-m3-secondary-dark font-medium transition-all duration-300">
                          Showing <span className="font-bold">{bandishCount}</span> bandish{bandishCount !== 1 ? "es" : ""} across <span className="font-bold">{uniqueRaagsCount}</span> raag{uniqueRaagsCount !== 1 ? "s" : ""}
                        </p>
                        {/* Info Button for Mobile */}
                        <button onClick={() => setIsInfoOpen(true)} className="sm:hidden flex items-center text-m3-primary dark:text-m3-primary-dark p-1" title="How to use the wiki">
                          <span className="material-symbols-rounded text-[1.25rem]">info</span>
                        </button>
                      </div>

                      {/* Active Filters */}
                      <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${activeFilters.length > 0 ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                        <div className="overflow-hidden">
                          <div className="flex flex-wrap justify-start gap-2 md:gap-3 pt-1 px-2">
                            {activeFilters.map((filter) => (
                              <div key={`${filter.key}-${filter.value}`} className="inline-flex items-center gap-2 bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold transition-transform duration-300 hover:scale-105">
                                <span className="capitalize opacity-80 font-medium">{filter.key}:</span><span>{filter.value}</span>
                                <button onClick={() => toggleFilter(filter.key, filter.value)} className="flex items-center justify-center hover:rotate-90 hover:bg-white/20 dark:hover:bg-black/10 rounded-full p-0.5 ml-1 transition-all duration-300"><span className="material-symbols-rounded text-[1.1rem] md:text-[1.25rem]">close</span></button>
                              </div>
                            ))}
                            {activeFilters.length > 1 && (
                              <button onClick={() => setActiveFilters([])} className="text-xs md:text-sm font-bold text-m3-primary dark:text-m3-primary-dark hover:text-gray-900 dark:hover:text-white underline underline-offset-4 px-2 active:scale-95 transition-transform duration-200">Clear All</button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* --- BANDISH GRID --- */}
                <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16 lg:px-24 space-y-6 md:space-y-8 pb-8">
                  {!isMounted ? (
                  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6">
                    <M3LoadingIndicator size={96} contained={true} color={isDarkMode ? "#D0BCFF" : "#6750A4"} containerColor={isDarkMode ? "#211F26" : "#F3EDF7"} />
                  </div>
                ) : bandishCount === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    className="min-h-[40vh] flex flex-col items-center justify-center gap-6 text-center px-4 mt-8 md:mt-12"
                  >
                    <div className="w-24 h-24 bg-m3-surface-container dark:bg-m3-surface-container-dark rounded-full flex items-center justify-center mb-2">
                      <span className="material-symbols-rounded text-5xl text-m3-secondary dark:text-m3-secondary-dark opacity-60">search_off</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontVariationSettings: '"wdth" 120' }}>No bandishes found</h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        We couldn't find any compositions matching your filters.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                      {(query || activeFilters.length > 0) && (
                        <button onClick={() => { setQuery(""); setActiveFilters([]); }} className="px-6 py-3 rounded-full font-bold text-m3-primary dark:text-m3-primary-dark bg-m3-primary/10 dark:bg-m3-primary-dark/10 hover:bg-m3-primary/20 transition-colors">
                          Clear Filters
                        </button>
                      )}
                      {userRole === "admin" || userRole === "contributor" ? (
                        <button onClick={() => setIsAddOpen(true)} className="px-6 py-3 rounded-full font-bold text-white bg-m3-primary dark:bg-m3-primary-dark hover:bg-m3-primary/90 transition-transform active:scale-95 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05]">
                          Add New Bandish
                        </button>
                      ) : (
                        <a href="https://forms.gle/sTqp5q4Ym6JLzaSA9" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-full font-bold text-white bg-m3-primary dark:bg-m3-primary-dark hover:bg-m3-primary/90 transition-transform active:scale-95 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05]">
                          Submit a New Bandish
                        </a>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  renderGrid()
                )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

      {/* --- INFO MODAL --- */}
      {isInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={closeInfoModal}>
          <div className={`absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm ${isInfoClosing ? 'animate-backdrop-exit' : 'animate-backdrop-enter'}`}></div>
          <div className={`relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-m3-surface-container-dark rounded-[2.5rem] border border-gray-100 dark:border-m3-surface-high-dark overflow-hidden flex flex-col ${isInfoClosing ? 'animate-modal-exit' : 'animate-modal-enter'}`} onClick={(e) => e.stopPropagation()}>
            <ReactLenis 
              options={LENIS_OPTIONS} 
              data-lenis-prevent="true"
              className="w-full max-h-[90vh] overflow-y-auto m3-scrollbar overscroll-contain"
              onWheel={(e: React.WheelEvent) => e.stopPropagation()}
              onTouchMove={(e: React.TouchEvent) => e.stopPropagation()}
            >
              <div className="p-8 md:p-12">
            <div className="absolute top-6 right-6 md:top-8 md:right-8">
              <button onClick={closeInfoModal} className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-gray-900 dark:text-white rounded-full transition-colors duration-200">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-6 pr-14">
                <span className="material-symbols-rounded text-[2.5rem] text-m3-primary dark:text-m3-primary-dark shrink-0">info</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white" style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}>How to use this Wiki</h2>
              </div>
              <div className="space-y-4 md:space-y-5">
                <div className="bg-m3-surface-container dark:bg-m3-surface-container-dark p-5 sm:p-6 rounded-3xl border border-m3-surface-high dark:border-m3-surface-high-dark">
                  <h3 className="font-bold text-lg sm:text-xl text-m3-primary dark:text-m3-primary-dark flex items-center gap-2 mb-2">
                    <span className="material-symbols-rounded text-[1.4rem]">search</span>
                    Smart Search & Suggestions
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                    Type anything in the search bar! The engine fuzzy-searches titles, raags, taals, and composers simultaneously, and surfaces intelligent suggestion banners when you search for specific raags or artists.
                  </p>
                </div>

                <div className="bg-m3-surface-container dark:bg-m3-surface-container-dark p-5 sm:p-6 rounded-3xl border border-m3-surface-high dark:border-m3-surface-high-dark">
                  <h3 className="font-bold text-lg sm:text-xl text-m3-primary dark:text-m3-primary-dark flex items-center gap-2 mb-2">
                    <span className="material-symbols-rounded text-[1.4rem]">filter_list</span>
                    Tag Filtering & Raag Wiki Pages
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                    Tap any badge on a bandish card (Raag, Taal, Composer) to instantly filter the library. Click through dedicated Raag links to explore full theoretical details like Thaat, Samay, Vadi, Samvadi, and Aaroh/Avaroh.
                  </p>
                </div>

                <div className="bg-m3-surface-container dark:bg-m3-surface-container-dark p-5 sm:p-6 rounded-3xl border border-m3-surface-high dark:border-m3-surface-high-dark">
                  <h3 className="font-bold text-lg sm:text-xl text-m3-primary dark:text-m3-primary-dark flex items-center gap-2 mb-2">
                    <span className="material-symbols-rounded text-[1.4rem]">translate</span>
                    Dual-Script Lyrics
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                    Toggle seamlessly between English phonetics and Devanagari script using the header pill. You can also view lyrics in both formats inside any bandish card and copy them with one click.
                  </p>
                </div>

                <div className="bg-m3-surface-container dark:bg-m3-surface-container-dark p-5 sm:p-6 rounded-3xl border border-m3-surface-high dark:border-m3-surface-high-dark">
                  <h3 className="font-bold text-lg sm:text-xl text-m3-primary dark:text-m3-primary-dark flex items-center gap-2 mb-2">
                    <span className="material-symbols-rounded text-[1.4rem]">favorite</span>
                    Favorites & Cloud Sync
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                    Tap the heart icon on any bandish to bookmark it. Use the &ldquo;Favorites Only&rdquo; toggle to view your curated collection. When you sign in, your favorites are securely saved to your account across all your devices.
                  </p>
                </div>

                <div className="bg-m3-surface-container dark:bg-m3-surface-container-dark p-5 sm:p-6 rounded-3xl border border-m3-surface-high dark:border-m3-surface-high-dark">
                  <h3 className="font-bold text-lg sm:text-xl text-m3-primary dark:text-m3-primary-dark flex items-center gap-2 mb-2">
                    <span className="material-symbols-rounded text-[1.4rem]">edit_note</span>
                    Contributing & Editor Access
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                    Signed-in users can add and edit notable audio/video renditions. If you would like to contribute new bandishes or revise musical notations, click your account menu and choose &ldquo;Become an Editor&rdquo;!
                  </p>
                </div>
                  </div>
                </div>
              </div>
            </ReactLenis>
          </div>
        </div>
      )}


      {/* --- ADD BANDISH MODAL --- */}
      <BandishFormModal
        isOpen={isAddOpen}
        isEdit={false}
        userRole={userRole}
        contributorName={contributorName}
        allRaags={allRaags}
        allTaals={allTaals}
        allLays={allLays}
        maxExistingId={maxExistingId}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleBandishModalSuccess}
      />

      {/* --- EDIT BANDISH MODAL --- */}
      <BandishFormModal
        isOpen={Boolean(editingBandish)}
        isEdit={true}
        bandish={editingBandish}
        userRole={userRole}
        contributorName={contributorName}
        allRaags={allRaags}
        allTaals={allTaals}
        allLays={allLays}
        onClose={() => {
          const prev = editingBandish;
          setEditingBandish(null);
          if (prev) setSelectedBandish(prev);
        }}
        onSuccess={handleBandishModalSuccess}
      />

      {/* --- EXPANDED BANDISH MODAL (GPU-accelerated FLIP animation) --- */}
      <AnimatePresence onExitComplete={() => setIsModalAnimating(false)}>
        {selectedBandish && !editingBandish && (
          <BandishModal
            key={`modal-${selectedBandish.id}`}
            bandish={selectedBandish}
            sourceRect={selectedBandishRect}
            isAdmin={isAdmin}
            userRole={userRole}
            onClose={closeModal}
            onEdit={openEditModal}
          />
        )}
      </AnimatePresence>

      {/* --- CUSTOM CONFIRM DIALOG --- */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6" onClick={() => setConfirmDialog(null)}>
          <div className="absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm animate-backdrop-enter"></div>
          <div className="relative w-full max-w-sm bg-m3-surface dark:bg-m3-surface-dark rounded-[2.5rem] p-8 border border-m3-surface-high dark:border-m3-surface-high-dark animate-modal-enter text-center" onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-rounded text-5xl text-m3-error dark:text-m3-error-dark mb-4">warning</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Are you sure?</h3>
            <p className="text-m3-secondary dark:text-m3-secondary-dark mb-8">{confirmDialog.message}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmDialog(null)} className="px-6 py-3 rounded-full font-bold text-gray-700 dark:text-gray-300 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="px-6 py-3 rounded-full font-bold text-white dark:text-gray-900 bg-m3-error dark:bg-m3-error-dark hover:opacity-90 transition-opacity">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM TOAST NOTIFICATION --- */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] animate-modal-enter">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-full border font-bold ${toast.type === 'error' ? 'bg-m3-error-dark/20 text-m3-error dark:text-m3-error-dark border-m3-error-dark/30' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/50'}`}>
            <span className="material-symbols-rounded">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70 flex items-center justify-center"><span className="material-symbols-rounded text-lg">close</span></button>
          </div>
        </div>
      )}

      {/* --- VIEW OPTIONS MODAL --- */}
      <AnimatePresence>
        {isViewOptionsOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" onClick={() => setIsViewOptionsOpen(false)}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm"></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-[22rem] bg-m3-surface-container dark:bg-m3-surface-container-dark rounded-3xl border border-m3-surface-high dark:border-m3-surface-high-dark overflow-hidden flex flex-col gap-3 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex items-center bg-m3-surface dark:bg-m3-surface-dark p-1 rounded-full border border-m3-surface-high dark:border-m3-surface-high-dark mx-auto w-[220px]">
                <div className={`absolute top-1 bottom-1 w-[105px] rounded-full bg-m3-primary dark:bg-m3-primary-dark transition-transform duration-500 ease-out ${language === "english" ? "translate-x-0" : "translate-x-[107px]"}`} />
                <button onClick={() => setLanguage("english")} className={`relative z-10 w-[105px] py-1.5 text-sm font-bold transition-colors duration-300 ${language === "english" ? "text-white dark:text-gray-900" : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"}`}>English</button>
                <button onClick={() => setLanguage("devanagari")} className={`relative z-10 w-[105px] py-1.5 text-sm font-bold transition-colors duration-300 ${language === "devanagari" ? "text-white dark:text-gray-900" : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"}`}>Devanagari</button>
              </div>
              <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className={`w-full group flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border transition-all duration-300 ${showFavoritesOnly ? "bg-m3-error dark:bg-m3-error-dark text-white dark:text-gray-900 border-transparent" : "bg-m3-surface dark:bg-m3-surface-dark text-gray-700 dark:text-gray-300 border-m3-surface-high dark:border-m3-surface-high-dark hover:bg-m3-primary/15 dark:hover:bg-m3-primary-dark/20"}`}>
                <span className="material-symbols-rounded text-[1.25rem] transition-all duration-300" style={{ fontVariationSettings: showFavoritesOnly ? '"FILL" 1' : '"FILL" 0' }}>favorite</span>
                <span>{showFavoritesOnly ? "Favorites Only" : "All Bandishes"}</span>
              </button>
              <button onClick={() => { const next = !enableGlur; setEnableGlur(next); localStorage.setItem("wiki-glur", String(next)); }} className="w-full group flex items-center justify-center gap-2 bg-m3-surface dark:bg-m3-surface-dark text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-full text-sm font-bold border border-m3-surface-high dark:border-m3-surface-high-dark hover:bg-m3-primary/15 dark:hover:bg-m3-primary-dark/20 transition-all duration-300">
                <span className="material-symbols-rounded text-[1.25rem]">{enableGlur ? "blur_on" : "blur_off"}</span>
                <span>{enableGlur ? "Disable Header Blur" : "Enable Header Blur"}</span>
              </button>
              <button onClick={toggleDarkMode} className="w-full group flex items-center justify-center gap-2 bg-m3-surface dark:bg-m3-surface-dark text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-full text-sm font-bold border border-m3-surface-high dark:border-m3-surface-high-dark hover:bg-m3-primary/15 dark:hover:bg-m3-primary-dark/20 transition-all duration-300">
                <span className={`material-symbols-rounded text-[1.25rem] transition-transform duration-500 ease-in-out ${isDarkMode ? "rotate-[360deg]" : "group-hover:rotate-45"}`}>{isDarkMode ? "light_mode" : "dark_mode"}</span>
                <span>{isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}