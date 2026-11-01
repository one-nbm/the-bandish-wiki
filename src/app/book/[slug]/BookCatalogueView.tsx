"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { BandishCard } from "@/components/BandishCard";
import { getUserRole, UserRole } from "@/app/actions";
import { createClient } from "@/utils/supabase/client";

interface BookCatalogueViewProps {
  initialBandishes: any[];
  bookTitle: string;
  userRole: UserRole;
  publishedCount?: number;
  privateCount?: number;
  totalCount?: number;
}

export function BookCatalogueView({
  initialBandishes,
  bookTitle,
  userRole,
  publishedCount,
  privateCount,
  totalCount,
}: BookCatalogueViewProps) {
  const [bandishes, setBandishes] = useState<any[]>(initialBandishes);
  const [role, setRole] = useState<UserRole>(userRole);
  const isAdmin = role === "admin";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeRaag, setActiveRaag] = useState<string | null>(null);
  const [activeTaal, setActiveTaal] = useState<string | null>(null);
  const [activeComposer, setActiveComposer] = useState<string | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");
  const [language, setLanguage] = useState<string>("english");
  const [favorites, setFavorites] = useState<string[]>([]);

  const supabase = useMemo(() => createClient(), []);

  // Keep bandishes in sync if initialBandishes prop updates
  useEffect(() => {
    if (initialBandishes && initialBandishes.length > 0) {
      setBandishes(initialBandishes);
    }
  }, [initialBandishes]);

  // Synchronize client-side auth role and ensure all compositions are loaded for admins
  useEffect(() => {
    let isCancelled = false;

    const syncRoleAndData = async () => {
      try {
        const resolvedRole = await getUserRole();
        if (!isCancelled && resolvedRole) {
          setRole(resolvedRole);
        }

        const isUserAdmin = resolvedRole === "admin";
        if (isUserAdmin) {
          // If bandishes currently does not contain private ones, query all matching bandishes
          const hasPrivate = bandishes.some((b) => b.is_published === false);
          if (!hasPrivate) {
            const { data } = await supabase
              .from("bandishes")
              .select("id, title, raag, taal, composer, tradition, lyrics, youtube_renditions, is_published, lay, book")
              .ilike("book", bookTitle);
            if (!isCancelled && data && data.length > 0) {
              setBandishes(data);
            }
          }
        }
      } catch (err) {
        console.error("Error synchronizing admin role in BookCatalogueView:", err);
      }
    };

    syncRoleAndData();

    return () => {
      isCancelled = true;
    };
  }, [bookTitle, supabase]);

  // Sync saved language & favorites from local storage / auth metadata
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("wiki-language");
      if (savedLang === "english" || savedLang === "devanagari") {
        setLanguage(savedLang);
      }
    } catch { }

    const loadFavorites = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.user_metadata?.favorites) {
          setFavorites(session.user.user_metadata.favorites);
        } else {
          const localFavs = localStorage.getItem("wiki-favorites");
          if (localFavs) setFavorites(JSON.parse(localFavs));
        }
      } catch { }
    };
    loadFavorites();
  }, [supabase]);

  // Toggle favorite
  const handleToggleFavorite = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("wiki-favorites", JSON.stringify(updated));
      } catch { }
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          supabase.auth.updateUser({ data: { favorites: updated } }).catch(() => { });
        }
      });
      return updated;
    });
  }, [supabase]);


  // Handle filter pill clicks
  const handleToggleFilter = useCallback((key: string, value: string) => {
    if (key === "raag") {
      setActiveRaag((prev) => (prev === value ? null : value));
    } else if (key === "taal") {
      setActiveTaal((prev) => (prev === value ? null : value));
    } else if (key === "composer") {
      setActiveComposer((prev) => (prev === value ? null : value));
    }
  }, []);

  // Filter options derived from the book's bandishes
  const availableRaags = useMemo(() => {
    const set = new Set<string>();
    bandishes.forEach((b) => {
      if (!isAdmin && b.is_published === false) return;
      if (b.raag) set.add(b.raag);
    });
    return Array.from(set).sort();
  }, [bandishes, isAdmin]);

  const availableTaals = useMemo(() => {
    const set = new Set<string>();
    bandishes.forEach((b) => {
      if (!isAdmin && b.is_published === false) return;
      if (b.taal) set.add(b.taal);
    });
    return Array.from(set).sort();
  }, [bandishes, isAdmin]);

  const availableComposers = useMemo(() => {
    const set = new Set<string>();
    bandishes.forEach((b) => {
      if (!isAdmin && b.is_published === false) return;
      if (b.composer && b.composer.toLowerCase() !== "unknown") {
        set.add(b.composer);
      }
    });
    return Array.from(set).sort();
  }, [bandishes, isAdmin]);

  // Client-side instant search and filtering
  const filteredBandishes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return bandishes.filter((b) => {
      // 0. Non-admins should NEVER see unpublished drafts
      if (!isAdmin && b.is_published === false) return false;

      // Admin Visibility Filter
      if (isAdmin && visibilityFilter === "public" && b.is_published === false) return false;
      if (isAdmin && visibilityFilter === "private" && b.is_published !== false) return false;

      // 1. Text search query
      if (query) {
        const titleMatch = b.title?.toLowerCase().includes(query);
        const raagMatch = b.raag?.toLowerCase().includes(query);
        const taalMatch = b.taal?.toLowerCase().includes(query);
        const compMatch = b.composer?.toLowerCase().includes(query);
        const engLyrics = b.lyrics?.english?.toLowerCase().includes(query);
        const devLyrics = b.lyrics?.devanagari?.toLowerCase().includes(query);

        if (!titleMatch && !raagMatch && !taalMatch && !compMatch && !engLyrics && !devLyrics) {
          return false;
        }
      }

      // 2. Raag Filter
      if (activeRaag && b.raag !== activeRaag) return false;

      // 3. Taal Filter
      if (activeTaal && b.taal !== activeTaal) return false;

      // 4. Composer Filter
      if (activeComposer && b.composer !== activeComposer) return false;

      return true;
    });
  }, [bandishes, searchQuery, activeRaag, activeTaal, activeComposer, isAdmin, visibilityFilter]);

  const hasActiveFilters = Boolean(searchQuery || activeRaag || activeTaal || activeComposer || visibilityFilter !== "all");

  const clearFilters = () => {
    setSearchQuery("");
    setActiveRaag(null);
    setActiveTaal(null);
    setActiveComposer(null);
    setVisibilityFilter("all");
  };

  const actualPublishedCount = useMemo(() => {
    return bandishes.filter((b) => b.is_published !== false).length;
  }, [bandishes]);

  const actualPrivateCount = useMemo(() => {
    return bandishes.filter((b) => b.is_published === false).length;
  }, [bandishes]);

  const actualTotalCount = bandishes.length;

  return (
    <section className="w-full mt-16 pt-12 border-t border-gray-200 dark:border-gray-800 animate-page-enter">
      {/* Catalogue Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="material-symbols-rounded text-m3-primary dark:text-m3-primary-dark text-[1.8rem]">
              library_music
            </span>
            Compositions in this Book
          </h3>
          {isAdmin ? (
            hasActiveFilters ? (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Showing{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {filteredBandishes.length}
                </span>{" "}
                of {actualTotalCount} bandishes ({actualPublishedCount} public, {actualPrivateCount} private) from {bookTitle}
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Showing{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {actualPublishedCount}
                </span>{" "}
                publicly catalogued bandish{actualPublishedCount !== 1 ? "es" : ""}{" "}
                {actualPrivateCount > 0 && (
                  <>
                    and{" "}
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {actualPrivateCount}
                    </span>{" "}
                    private bandish{actualPrivateCount !== 1 ? "es" : ""}{" "}
                  </>
                )}
                from {bookTitle}
              </p>
            )
          ) : (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Showing{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {filteredBandishes.length}
              </span>{" "}
              of {actualPublishedCount} publicly catalogued bandish{actualPublishedCount !== 1 ? "es" : ""} from {bookTitle}
            </p>
          )}
        </div>

        {/* Controls Pill: Visibility Toggle for Admins & Script Preferences */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Admin Visibility Toggle */}
          {isAdmin && actualPrivateCount > 0 && (
            <div className="flex items-center p-0.5 rounded-full bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark text-xs font-bold">
              <button
                type="button"
                onClick={() => setVisibilityFilter("all")}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  visibilityFilter === "all"
                    ? "bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                All ({actualTotalCount})
              </button>
              <button
                type="button"
                onClick={() => setVisibilityFilter("public")}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  visibilityFilter === "public"
                    ? "bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Public ({actualPublishedCount})
              </button>
              <button
                type="button"
                onClick={() => setVisibilityFilter("private")}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  visibilityFilter === "private"
                    ? "bg-amber-500 text-white"
                    : "text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300"
                }`}
              >
                Private ({actualPrivateCount})
              </button>
            </div>
          )}

          {/* Script Preferences Pill */}
          <div className="flex items-center p-0.5 rounded-full bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark">
            <button
              type="button"
              onClick={() => {
                setLanguage("english");
                try { localStorage.setItem("wiki-language", "english"); } catch { }
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                language === "english"
                  ? "bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => {
                setLanguage("devanagari");
                try { localStorage.setItem("wiki-language", "devanagari"); } catch { }
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                language === "devanagari"
                  ? "bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              देवनागरी
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 mb-8">
        {/* Search Input */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            <span className="material-symbols-rounded text-xl">search</span>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${isAdmin ? actualTotalCount : actualPublishedCount} bandishes in ${bookTitle}...`}
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm font-medium focus:outline-none focus:border-m3-primary dark:focus:border-m3-primary-dark transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-3 flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <span className="material-symbols-rounded text-lg">close</span>
            </button>
          )}
        </div>

        {/* Quick Filter Chips (Raag, Taal, Composer) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none text-xs">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-bold hover:bg-rose-500/20 shrink-0 transition-colors cursor-pointer"
            >
              <span className="material-symbols-rounded text-sm">filter_alt_off</span>
              <span>Reset</span>
            </button>
          )}

          {/* Active filter badges */}
          {activeRaag && (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-m3-primary/10 dark:bg-m3-primary-dark/15 text-m3-primary dark:text-m3-primary-dark border border-m3-primary/30 font-bold shrink-0">
              <span>Raag: {activeRaag}</span>
              <button
                type="button"
                onClick={() => setActiveRaag(null)}
                className="hover:opacity-75 cursor-pointer ml-0.5"
              >
                <span className="material-symbols-rounded text-sm">close</span>
              </button>
            </span>
          )}

          {activeTaal && (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-m3-secondary/10 dark:bg-m3-secondary-dark/15 text-m3-secondary dark:text-m3-secondary-dark border border-m3-secondary/30 font-bold shrink-0">
              <span>Taal: {activeTaal}</span>
              <button
                type="button"
                onClick={() => setActiveTaal(null)}
                className="hover:opacity-75 cursor-pointer ml-0.5"
              >
                <span className="material-symbols-rounded text-sm">close</span>
              </button>
            </span>
          )}

          {activeComposer && (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold shrink-0">
              <span>Composer: {activeComposer}</span>
              <button
                type="button"
                onClick={() => setActiveComposer(null)}
                className="hover:opacity-75 cursor-pointer ml-0.5"
              >
                <span className="material-symbols-rounded text-sm">close</span>
              </button>
            </span>
          )}

          {/* Suggested Quick Raag Chips (Top 8) */}
          {!activeRaag && availableRaags.slice(0, 8).map((raag) => (
            <button
              key={`quick-raag-${raag}`}
              type="button"
              onClick={() => setActiveRaag(raag)}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark text-gray-700 dark:text-gray-300 font-medium hover:border-m3-primary/40 dark:hover:border-m3-primary-dark/40 shrink-0 transition-colors cursor-pointer"
            >
              {raag}
            </button>
          ))}
        </div>
      </div>

      {/* Compositions Grid */}
      {filteredBandishes.length > 0 ? (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
          {filteredBandishes.map((bandish, index) => (
            <BandishCard
              key={bandish.id}
              bandish={bandish}
              index={index}
              isFavorited={favorites.includes(bandish.id)}
              language={language}
              isSearching={Boolean(searchQuery)}
              disableEntranceAnimation={true}
              linkDirectly={true}
              onToggleFavorite={handleToggleFavorite}
              onToggleFilter={handleToggleFilter}
            />
          ))}
        </div>
      ) : (
        /* Empty Search State */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-white/50 dark:bg-m3-surface-container-dark/50 border border-m3-surface-high dark:border-m3-surface-high-dark">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-gray-400">
            <span className="material-symbols-rounded text-3xl">search_off</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            No compositions found
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4">
            No bandishes in {bookTitle} match your current search query or active filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 rounded-full bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}


    </section>
  );
}
