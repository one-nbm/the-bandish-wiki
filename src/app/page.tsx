"use client";

import { useState, useEffect, useMemo, useDeferredValue, useRef, useCallback } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { createClient } from "@/utils/supabase/client";
import { useTheme } from "./ThemeProvider";
import { M3LoadingIndicator } from "@alerix/m3-loading-indicator/react";
import { checkIsEditor, addBandishSecurely, updateBandishSecurely, deleteBandishSecurely } from "./actions";
import WelcomeScreen from "@/components/WelcomeScreen";
import { BandishCard } from "@/components/BandishCard";
import { BandishModal } from "@/components/BandishModal";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const supabase = createClient();
  const { isDarkMode, toggleDarkMode } = useTheme();

  // --- 1. SEARCH & FILTER STATES ---
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [language, setLanguage] = useState("english");
  const [activeFilters, setActiveFilters] = useState<{ key: string, value: string }[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [hasStartedBrowsing, setHasStartedBrowsing] = useState(false);

  // --- 2. DATA STATES ---
  const [baseData, setBaseData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [contributorName, setContributorName] = useState("Anonymous");

  // --- 3. MODAL VISIBILITY STATES ---
  const [selectedBandish, setSelectedBandish] = useState<any | null>(null);
  const [selectedBandishRect, setSelectedBandishRect] = useState<DOMRect | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isInfoClosing, setIsInfoClosing] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAddClosing, setIsAddClosing] = useState(false);
  const [editingBandish, setEditingBandish] = useState<any | null>(null);
  const [isEditClosing, setIsEditClosing] = useState(false);

  // --- 4. UNIFIED FORM STATES (Used for both Add and Edit) ---
  const [formTitle, setFormTitle] = useState("");
  const [formRaag, setFormRaag] = useState("");
  const [formTaal, setFormTaal] = useState("");
  const [formComposer, setFormComposer] = useState("");
  const [formEnglish, setFormEnglish] = useState("");
  const [formDevanagari, setFormDevanagari] = useState("");
  const [adminPasscode, setAdminPasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string, onConfirm: () => void } | null>(null);
  const [isViewOptionsOpen, setIsViewOptionsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [enableGlur, setEnableGlur] = useState(true);

  // --- 5. EFFECTS ---
  useEffect(() => {
    const fetchAdminStatus = async () => {
      const adminStatus = await checkIsEditor();
      setIsAdmin(adminStatus);
    };

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

    fetchAdminStatus();
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
  }, []);
  const closeInfoModal = () => { setIsInfoClosing(true); setTimeout(() => { setIsInfoOpen(false); setIsInfoClosing(false); }, 300); };

  const clearForm = () => {
    setFormTitle(""); setFormRaag(""); setFormTaal(""); setFormComposer("");
    setFormEnglish(""); setFormDevanagari(""); setAdminPasscode("");
  };

  const closeAddModal = () => {
    setIsAddClosing(true);
    setTimeout(() => { setIsAddOpen(false); setIsAddClosing(false); clearForm(); }, 300);
  };

  const closeEditModal = () => {
    setIsEditClosing(true);
    setTimeout(() => { setEditingBandish(null); setIsEditClosing(false); clearForm(); }, 300);
  };

  const openEditModal = (bandish: any) => {
    setEditingBandish(bandish);
    setFormTitle(bandish.title);
    setFormRaag(bandish.raag);
    setFormTaal(bandish.taal);
    setFormComposer(bandish.composer);
    setFormEnglish(bandish.lyrics.english);
    setFormDevanagari(bandish.lyrics.devanagari || "");
    // Close the viewing modal instantly without animation to transition smoothly to edit
    setSelectedBandish(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (toast) setToast(null);
        else if (confirmDialog) setConfirmDialog(null);
        else if (isViewOptionsOpen) setIsViewOptionsOpen(false);
        else if (isAddOpen) closeAddModal();
        else if (editingBandish) closeEditModal();
        else if (isInfoOpen) closeInfoModal();
        // Note: selectedBandish / BandishModal handles its own Escape key internally with animation
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
  }, [toast, confirmDialog, isViewOptionsOpen, isAddOpen, editingBandish, isInfoOpen]);

  const handleFormSubmit = async (e: React.FormEvent, isEdit: boolean, action: 'save' | 'delete' = 'save') => {
    e.preventDefault();

    if (action !== 'delete') {
      if (!formTitle || !formRaag || !formTaal || !formComposer || !formEnglish || !adminPasscode) {
        setToast({ message: "Please fill in all required fields.", type: 'error' });
        return;
      }
    }

    setIsSubmitting(true);

    if (action === 'delete') {
      try {
        const result = await deleteBandishSecurely(editingBandish.id);
        if (!result.success) throw new Error(result.error);

        setBaseData(prev => prev.filter(b => b.id !== editingBandish.id));
        closeEditModal();
      } catch (error: any) {
        console.error("❌ SUPABASE ERROR:", error);
        setToast({ message: `Database Error: ${error.message || "Check console for details"}`, type: 'error' });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // --- NEW LOGIC: Calculate the next sequential ID ---
    let nextId = "";
    if (!isEdit) {
      const currentIds = baseData.map(b => parseInt(b.id, 10)).filter(n => !isNaN(n));
      const maxId = currentIds.length > 0 ? Math.max(...currentIds) : 0;
      nextId = String(maxId + 1).padStart(4, '0');
    }

    // Prepare the data for Supabase
    const payload: any = {
      title: formTitle,
      raag: formRaag,
      taal: formTaal,
      composer: formComposer,
      lyrics: {
        english: formEnglish,
        devanagari: formDevanagari || "",
      },
      contributor: contributorName,
    };

    if (!isEdit) {
      payload.id = nextId;
    }

    try {
      if (isEdit && editingBandish) {
        const result = await updateBandishSecurely(editingBandish.id, payload);
        if (!result.success) throw new Error(result.error);

        // INSTANT UI UPDATE
        if (result.data && result.data.length > 0) {
          setBaseData(prev => prev.map(b => b.id === editingBandish.id ? result.data[0] : b));
        }
      } else {
        const result = await addBandishSecurely(payload);
        if (!result.success) throw new Error(result.error);

        // INSTANT UI UPDATE
        if (result.data && result.data.length > 0) {
          setBaseData(prev => [result.data[0], ...prev]);
        }
      }

      isEdit ? closeEditModal() : closeAddModal();

    } catch (error: any) {
      console.error("❌ SUPABASE ERROR:", error);
      setToast({ message: `Database Error: ${error.message || "Check console for details"}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFilter = useCallback((key: string, value: string) => {
    setActiveFilters((prev) => {
      const isAlreadyActive = prev.some((f) => f.key === key && f.value === value);
      if (isAlreadyActive) return prev.filter((f) => !(f.key === key && f.value === value));
      return [...prev, { key, value }];
    });
  }, []);

  const toggleFavorite = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    const newFavs = favorites.includes(id)
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id];

    setFavorites(newFavs);

    if (isSignedIn) {
      await supabase.auth.updateUser({
        data: { favorites: newFavs }
      });
    } else {
      localStorage.setItem("wiki-favorites", JSON.stringify(newFavs));
    }
  }, [favorites, isSignedIn, supabase]);

  // --- 7. DATA PROCESSING ---
  const preSearchData = useMemo(() => {
    let data = baseData;
    if (showFavoritesOnly) data = data.filter((bandish) => favorites.includes(bandish.id));
    if (activeFilters.length > 0) {
      data = data.filter((bandish) => activeFilters.every((filter) => {
        if (filter.key === "raag") return bandish.raag === filter.value;
        if (filter.key === "taal") return bandish.taal === filter.value;
        if (filter.key === "composer") return bandish.composer === filter.value;
        return true;
      }));
    }
    return data;
  }, [baseData, showFavoritesOnly, favorites, activeFilters]);

  const fuseBandishes = useMemo(() => new Fuse(preSearchData, { keys: ["title", "raag", "composer", "taal"], threshold: 0.4 }), [preSearchData]);

  const processedData = useMemo(() => {
    if (deferredQuery) {
      return fuseBandishes.search(deferredQuery).map((result) => result.item);
    }
    return preSearchData;
  }, [preSearchData, deferredQuery, fuseBandishes]);

  const bandishCount = processedData.length;
  const uniqueRaagsCount = new Set(processedData.map((b) => b.raag)).size;

  const allRaags = useMemo(() => Array.from(new Set(baseData.map(b => b.raag))), [baseData]);
  const allComposers = useMemo(() => Array.from(new Set(baseData.map(b => b.composer))), [baseData]);

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
          <div className="group relative bg-m3-secondary/10 dark:bg-m3-secondary-dark/10 p-6 md:p-8 rounded-3xl border border-m3-secondary/20 flex flex-col items-start break-inside-avoid mb-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:scale-[1.01]">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-rounded text-[2rem] text-m3-secondary dark:text-m3-secondary-dark">manage_search</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">Looking for Raag {suggestedRaag}?</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-[1.05rem]">Switch to a tag filter to see a clean list of all bandishes in this raag.</p>
            <div className="flex flex-wrap gap-3 mt-1">
              <button
                onClick={() => { toggleFilter("raag", suggestedRaag); setQuery(""); }}
                className="flex items-center gap-2 bg-m3-secondary hover:bg-m3-secondary/90 dark:bg-m3-secondary-dark dark:hover:bg-m3-secondary-dark/90 text-white dark:text-gray-900 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-95"
              >
                <span className="material-symbols-rounded text-[1.2rem]">filter_list</span>
                Filter by {suggestedRaag}
              </button>
              <Link
                href={`/raag/${suggestedRaag.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-2 bg-m3-primary/10 hover:bg-m3-primary/20 dark:bg-m3-primary-dark/10 dark:hover:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-95 group"
              >
                <span className="material-symbols-rounded text-[1.2rem] transition-transform group-hover:scale-110">menu_book</span>
                Read Raag Wiki
              </Link>
            </div>
          </div>
        )}

        {suggestedComposer && (
          <div className="group relative bg-m3-tertiary/10 dark:bg-m3-tertiary-dark/10 p-6 md:p-8 rounded-3xl border border-m3-tertiary/20 flex flex-col items-start break-inside-avoid mb-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:scale-[1.01]">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-rounded text-[2rem] text-m3-tertiary dark:text-m3-tertiary-dark">person_search</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">Looking for {suggestedComposer}?</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-[1.05rem]">Switch to a tag filter to see a clean list of all bandishes by this composer.</p>
            <button onClick={() => { toggleFilter("composer", suggestedComposer); setQuery(""); }} className="flex items-center gap-2 bg-m3-tertiary hover:bg-m3-tertiary/90 dark:bg-m3-tertiary-dark dark:hover:bg-m3-tertiary-dark/90 text-white dark:text-gray-900 px-6 py-3 rounded-full font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-95">
              <span className="material-symbols-rounded text-[1.2rem]">filter_list</span> Filter by {suggestedComposer}
            </button>
          </div>
        )}

        {processedData.map((bandish, index) => (
          <BandishCard
            key={bandish.id}
            bandish={bandish}
            index={index}
            isSelected={selectedBandishId === bandish.id}
            isFavorited={favorites.includes(bandish.id)}
            language={language}
            onSelect={selectBandish}
            onToggleFavorite={toggleFavorite}
            onToggleFilter={toggleFilter}
          />
        ))}
      </div>
    );
  };

  // --- 9. SHARED FORM JSX (Used by Add and Edit Modals) ---
  const renderForm = (isEdit: boolean) => (
    <form noValidate onSubmit={(e) => handleFormSubmit(e, isEdit)} className="space-y-6 md:space-y-8">
      <div>
        <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Title</label>
        <input type="text" autoFocus required placeholder="e.g. Hori Khelan Ko" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-high-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-bold text-m3-secondary dark:text-m3-secondary-dark uppercase tracking-wider mb-2">Raag</label>
          <input type="text" required placeholder="e.g. Des" value={formRaag} onChange={(e) => setFormRaag(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-high-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-secondary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" />
        </div>
        <div>
          <label className="block text-xs font-bold text-m3-secondary dark:text-m3-secondary-dark uppercase tracking-wider mb-2">Taal</label>
          <input type="text" required placeholder="e.g. Tintal" value={formTaal} onChange={(e) => setFormTaal(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-high-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-secondary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" />
        </div>
        <div>
          <label className="block text-xs font-bold text-m3-tertiary dark:text-m3-tertiary-dark uppercase tracking-wider mb-2">Composer</label>
          <input type="text" required placeholder="e.g. Traditional" value={formComposer} onChange={(e) => setFormComposer(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-high-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-tertiary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">English Transliteration (Required)</label>
        <textarea required placeholder="Enter the phonetic lyrics here..." value={formEnglish} onChange={(e) => setFormEnglish(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-high-dark text-gray-900 dark:text-white px-6 py-5 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 min-h-[140px] resize-y m3-scrollbar" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Devanagari Script (Optional)</label>
        <textarea placeholder="होली खेलन को चले कन्हैयाँ..." value={formDevanagari} onChange={(e) => setFormDevanagari(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-high-dark text-gray-900 dark:text-white px-6 py-5 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 min-h-[140px] resize-y m3-scrollbar" />
      </div>
      <hr className="border-gray-200 dark:border-m3-surface-high-dark my-2" />
      <div className="flex flex-col md:flex-row gap-6 items-end">
        <div className="w-full">
          <label className="flex items-center gap-1.5 text-xs font-bold text-m3-error dark:text-m3-error-dark uppercase tracking-wider mb-2">
            <span className="material-symbols-rounded text-[1.1rem]">lock</span> Admin Passcode
          </label>
          <input type="password" required placeholder="Enter the secret password to publish" value={adminPasscode} onChange={(e) => setAdminPasscode(e.target.value)} className="w-full bg-m3-error/10 dark:bg-m3-error-dark/10 text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-error dark:focus:ring-m3-error-dark transition-all duration-300 placeholder-m3-error/50 dark:placeholder-m3-error-dark/50" />
        </div>
        <div className="flex gap-3 w-full md:w-auto shrink-0">
          {isEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setConfirmDialog({
                  message: "Are you sure you want to delete this bandish?",
                  onConfirm: () => handleFormSubmit(e as unknown as React.FormEvent, true, 'delete')
                });
              }}
              disabled={isSubmitting}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-m3-error/10 hover:bg-m3-error/20 dark:bg-m3-error-dark/10 dark:hover:bg-m3-error-dark/20 text-m3-error dark:text-m3-error-dark px-6 py-4 rounded-[1.5rem] font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="material-symbols-rounded text-[1.4rem]">delete</span>
              <span className="md:hidden lg:inline">Delete</span>
            </button>
          )}
          <button type="submit" disabled={isSubmitting} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-m3-primary hover:bg-m3-primary/90 dark:bg-m3-primary-dark dark:hover:bg-m3-primary-dark/90 text-white dark:text-gray-900 px-8 py-4 rounded-[1.5rem] font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-95 disabled:opacity-50 disabled:hover:scale-100">
            <span className="material-symbols-rounded text-[1.4rem]">{isEdit ? 'save' : 'publish'}</span>
            <span className="whitespace-nowrap">{isSubmitting ? (isEdit ? "Saving..." : "Publishing...") : (isEdit ? "Save Changes" : "Publish")}</span>
          </button>
        </div>
      </div>
    </form>
  );

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
                  {enableGlur ? (
                    <div
                      className="absolute inset-x-0 top-0 h-[calc(100%+2rem)] md:h-[calc(100%+3rem)] pointer-events-none z-0"
                    >
                      <div className="absolute inset-0 bg-m3-surface-container/80 dark:bg-m3-surface-dark/80" style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }} />
                      <div className="absolute inset-0" style={{ backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }} />
                      <div className="absolute inset-0" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', maskImage: 'linear-gradient(to bottom, black 40%, transparent 80%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 80%)' }} />
                      <div className="absolute inset-0" style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', maskImage: 'linear-gradient(to bottom, black 20%, transparent 60%)', WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 60%)' }} />
                      <div className="absolute inset-0" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', maskImage: 'linear-gradient(to bottom, black 0%, transparent 40%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 40%)' }} />
                    </div>
                  ) : (
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
                          <input ref={searchInputRef} type="text" placeholder="Search by text... (Ctrl+K)" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-white dark:bg-m3-surface-container-dark text-gray-900 dark:text-white text-base md:text-lg pl-[3.75rem] md:pl-[4.25rem] pr-[3.75rem] py-4 md:py-5 rounded-full border border-m3-surface-high dark:border-m3-surface-high-dark focus:border-m3-primary dark:focus:border-m3-primary-dark focus:ring-1 focus:ring-m3-primary dark:focus:ring-m3-primary-dark focus:outline-none transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" />
                          <div className="absolute inset-y-0 right-2 flex items-center">
                            <button onClick={() => setIsViewOptionsOpen(!isViewOptionsOpen)} className={`p-2 md:p-3 rounded-full transition-all duration-300 flex items-center justify-center ${isViewOptionsOpen ? 'bg-m3-primary/15 dark:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark' : 'text-gray-500 hover:text-m3-primary dark:text-gray-400 dark:hover:text-m3-primary-dark hover:bg-gray-100 dark:hover:bg-m3-surface-high-dark'}`} title="View Options">
                              <span className="material-symbols-rounded text-xl md:text-2xl transition-transform duration-500 group-hover:rotate-180">tune</span>
                            </button>
                          </div>
                        </div>

                        {/* Info Button (Hidden on Mobile Search Row) */}
                        <button onClick={() => setIsInfoOpen(true)} className="group hidden sm:flex items-center justify-center w-[3.5rem] h-[3.5rem] p-0 bg-m3-surface-container dark:bg-m3-surface-container-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-high-dark text-m3-primary dark:text-m3-primary-dark rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-95 border border-m3-surface-high dark:border-m3-surface-high-dark shrink-0" title="How to use the wiki">
                          <span className="material-symbols-rounded text-[1.5rem]">info</span>
                        </button>

                        {/* Add Button */}
                        {isAdmin ? (
                          <button onClick={() => { clearForm(); setIsAddOpen(true); }} className="group flex items-center justify-center w-[3.5rem] h-[3.5rem] sm:w-auto sm:px-6 bg-m3-primary hover:bg-m3-primary/90 dark:bg-m3-primary-dark dark:hover:bg-m3-primary-dark/90 text-white dark:text-gray-900 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-95 shrink-0" title="Add a new Bandish">
                            <span className="material-symbols-rounded text-[1.5rem]">add</span>
                            <span className="hidden sm:block font-bold text-sm ml-1">Add</span>
                          </button>
                        ) : (
                          <a
                            href="https://forms.gle/sTqp5q4Ym6JLzaSA9"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-center w-[3.5rem] h-[3.5rem] sm:w-auto sm:px-6 bg-m3-surface-container dark:bg-m3-surface-container-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-high-dark text-m3-primary dark:text-m3-primary-dark rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-95 border border-m3-surface-high dark:border-m3-surface-high-dark shrink-0"
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
                  <div className="min-h-[40vh] flex flex-col items-center justify-center gap-6 text-center px-4 animate-fade-in mt-8 md:mt-12">
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
                      {isAdmin ? (
                        <button onClick={() => { clearForm(); setIsAddOpen(true); }} className="px-6 py-3 rounded-full font-bold text-white bg-m3-primary dark:bg-m3-primary-dark hover:bg-m3-primary/90 transition-transform active:scale-95 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05]">
                          Add New Bandish
                        </button>
                      ) : (
                        <a href="https://forms.gle/sTqp5q4Ym6JLzaSA9" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-full font-bold text-white bg-m3-primary dark:bg-m3-primary-dark hover:bg-m3-primary/90 transition-transform active:scale-95 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05]">
                          Submit a New Bandish
                        </a>
                      )}
                    </div>
                  </div>
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
          <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-m3-surface-container-dark rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-m3-surface-high-dark m3-scrollbar ${isInfoClosing ? 'animate-modal-exit' : 'animate-modal-enter'}`} onClick={(e) => e.stopPropagation()}>
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
        </div>
      )}


      {/* --- ADD MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={closeAddModal}>
          <div className={`absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm ${isAddClosing ? 'animate-backdrop-exit' : 'animate-backdrop-enter'}`}></div>
          <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-m3-surface-container-dark rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-m3-surface-high-dark m3-scrollbar transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isAddClosing ? 'animate-modal-exit scale-95' : 'animate-modal-enter scale-100'}`} onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-6 right-6 md:top-8 md:right-8">
              <button onClick={closeAddModal} className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-gray-900 dark:text-white rounded-full transition-colors duration-200">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}>Add New Bandish</h2>
              <p className="text-m3-secondary dark:text-m3-secondary-dark font-medium">Contribute to the Wiki database.</p>
            </div>
            {renderForm(false)}
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {editingBandish && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" onClick={closeEditModal}>
          <div className={`absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm ${isEditClosing ? 'animate-backdrop-exit' : 'animate-backdrop-enter'}`}></div>
          <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-m3-surface-container-dark rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-m3-surface-high-dark m3-scrollbar transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isEditClosing ? 'animate-modal-exit scale-95' : 'animate-modal-enter scale-100'}`} onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-6 right-6 md:top-8 md:right-8">
              <button onClick={closeEditModal} className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-gray-900 dark:text-white rounded-full transition-colors duration-200">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}>Edit Bandish</h2>
              <p className="text-m3-secondary dark:text-m3-secondary-dark font-medium">Make corrections to <span className="font-bold">{editingBandish.title}</span>.</p>
            </div>
            {renderForm(true)}
          </div>
        </div>
      )}

      {/* --- EXPANDED BANDISH MODAL (GPU-accelerated FLIP animation, no layoutId) --- */}
      {selectedBandish && !editingBandish && (
        <BandishModal
          key={selectedBandish.id}
          bandish={selectedBandish}
          sourceRect={selectedBandishRect}
          isAdmin={isAdmin}
          onClose={closeModal}
          onEdit={openEditModal}
        />
      )}

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