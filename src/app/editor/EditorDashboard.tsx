"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ReactLenis } from 'lenis/react';
import { LENIS_OPTIONS } from '@/components/SmoothScrolling';
import AddRaagModal from "./AddRaagModal";
import RenditionsToIndexList from "./RenditionsToIndexList";

interface ContributedBandish {
  id: string;
  title: string;
  raag: string;
  taal: string;
  composer?: string;
  lay?: string[];
  tradition?: string;
}

interface ContributedRaag {
  id: string;
  name: string;
  slug: string;
  thaat?: string;
  samay?: string;
  vadi?: string;
  samvadi?: string;
}

interface EditorDashboardProps {
  initialName: string;
  bandishCount: number;
  raagCount: number;
  userBandishes?: ContributedBandish[];
  userRaags?: ContributedRaag[];
}

export default function EditorDashboard({
  initialName,
  bandishCount,
  raagCount,
  userBandishes = [],
  userRaags = []
}: EditorDashboardProps) {
  const [name, setName] = useState(initialName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Contributions Workspace State
  const [activeTab, setActiveTab] = useState<"bandishes" | "raags">("bandishes");
  const [searchQuery, setSearchQuery] = useState("");

  // Graph View Category State
  const [bandishCategory, setBandishCategory] = useState<"raag" | "taal" | "tradition">("raag");
  const [raagCategory, setRaagCategory] = useState<"thaat" | "samay" | "vadi">("thaat");
  const [activeColumnIndex, setActiveColumnIndex] = useState<number>(0);
  const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setIsSavingName(true);
    setToast(null);

    // Update user metadata in Supabase Auth
    const { error } = await supabase.auth.updateUser({
      data: { contributor_name: name.trim() }
    });

    setIsSavingName(false);

    if (error) {
      setToast({ type: "error", message: `Failed to update name: ${error.message}` });
    } else {
      setIsEditingName(false);
      setToast({ type: "success", message: "Contributor name updated successfully." });
      router.refresh();
    }
  };

  // Filtered lists based on search query
  const filteredBandishes = useMemo(() => {
    if (!searchQuery.trim()) return userBandishes;
    const q = searchQuery.toLowerCase();
    return userBandishes.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.raag.toLowerCase().includes(q) ||
        (b.composer && b.composer.toLowerCase().includes(q)) ||
        (b.tradition && b.tradition.toLowerCase().includes(q))
    );
  }, [userBandishes, searchQuery]);

  const filteredRaags = useMemo(() => {
    if (!searchQuery.trim()) return userRaags;
    const q = searchQuery.toLowerCase();
    return userRaags.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.thaat && r.thaat.toLowerCase().includes(q)) ||
        (r.samay && r.samay.toLowerCase().includes(q))
    );
  }, [userRaags, searchQuery]);

  // Analytics Computation for Bandishes
  const bandishAnalytics = useMemo(() => {
    const totalBandishes = userBandishes.length;

    const raagMap: Record<string, number> = {};
    const taalMap: Record<string, number> = {};
    const traditionMap: Record<string, number> = {};

    userBandishes.forEach((b) => {
      const raagName = b.raag?.trim() || "Unknown";
      raagMap[raagName] = (raagMap[raagName] || 0) + 1;

      const taalName = b.taal?.trim() || "Unspecified";
      taalMap[taalName] = (taalMap[taalName] || 0) + 1;

      const traditionName = b.tradition?.trim() || "N/A";
      traditionMap[traditionName] = (traditionMap[traditionName] || 0) + 1;
    });

    const sortEntries = (map: Record<string, number>) =>
      Object.entries(map)
        .map(([label, count]) => ({
          label,
          count,
          percentage: totalBandishes > 0 ? Math.round((count / totalBandishes) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

    const raagStats = sortEntries(raagMap);
    const taalStats = sortEntries(taalMap);
    const traditionStats = sortEntries(traditionMap);

    return {
      totalBandishes,
      distinctRaags: Object.keys(raagMap).length,
      distinctTaals: Object.keys(taalMap).length,
      distinctTraditions: Object.keys(traditionMap).filter((t) => t !== "N/A").length,
      raagStats: raagStats.slice(0, 7),
      taalStats: taalStats.slice(0, 7),
      traditionStats: traditionStats.slice(0, 7)
    };
  }, [userBandishes]);

  // Analytics Computation for Raags
  const raagAnalytics = useMemo(() => {
    const totalRaags = userRaags.length;

    const thaatMap: Record<string, number> = {};
    const samayMap: Record<string, number> = {};
    const vadiMap: Record<string, number> = {};

    userRaags.forEach((r) => {
      const thaatName = r.thaat?.trim() || "Unassigned";
      thaatMap[thaatName] = (thaatMap[thaatName] || 0) + 1;

      const samayName = r.samay?.trim() || "Unspecified";
      samayMap[samayName] = (samayMap[samayName] || 0) + 1;

      const vadiName = r.vadi?.trim() || "Unspecified";
      vadiMap[vadiName] = (vadiMap[vadiName] || 0) + 1;
    });

    const sortEntries = (map: Record<string, number>) =>
      Object.entries(map)
        .map(([label, count]) => ({
          label,
          count,
          percentage: totalRaags > 0 ? Math.round((count / totalRaags) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

    const thaatStats = sortEntries(thaatMap);
    const samayStats = sortEntries(samayMap);
    const vadiStats = sortEntries(vadiMap);

    return {
      totalRaags,
      distinctThaats: Object.keys(thaatMap).filter((t) => t !== "Unassigned").length,
      distinctSamays: Object.keys(samayMap).filter((s) => s !== "Unspecified").length,
      distinctVadis: Object.keys(vadiMap).filter((v) => v !== "Unspecified").length,
      thaatStats: thaatStats.slice(0, 7),
      samayStats: samayStats.slice(0, 7),
      vadiStats: vadiStats.slice(0, 7)
    };
  }, [userRaags]);

  // Active statistics for Google Health Style Graph
  const currentChartStats = useMemo(() => {
    if (activeTab === "bandishes") {
      if (bandishCategory === "raag") return bandishAnalytics.raagStats;
      if (bandishCategory === "taal") return bandishAnalytics.taalStats;
      return bandishAnalytics.traditionStats;
    } else {
      if (raagCategory === "thaat") return raagAnalytics.thaatStats;
      if (raagCategory === "samay") return raagAnalytics.samayStats;
      return raagAnalytics.vadiStats;
    }
  }, [activeTab, bandishCategory, raagCategory, bandishAnalytics, raagAnalytics]);

  const maxStatCount = useMemo(() => {
    return currentChartStats.length > 0 ? Math.max(...currentChartStats.map((s) => s.count)) : 1;
  }, [currentChartStats]);

  const avgStatCount = useMemo(() => {
    if (currentChartStats.length === 0) return 0;
    const sum = currentChartStats.reduce((acc, curr) => acc + curr.count, 0);
    return Math.round((sum / currentChartStats.length) * 10) / 10;
  }, [currentChartStats]);

  const selectedItem = useMemo(() => {
    const idx = hoveredColumnIndex !== null ? hoveredColumnIndex : activeColumnIndex;
    return currentChartStats[idx] || currentChartStats[0] || null;
  }, [hoveredColumnIndex, activeColumnIndex, currentChartStats]);

  return (
    <div className="relative z-10 flex flex-col gap-8">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`px-6 py-4 rounded-2xl font-medium text-sm flex items-center justify-between border transition-all animate-modal-enter ${
            toast.type === "error"
              ? "bg-m3-error/10 dark:bg-m3-error-dark/20 text-m3-error dark:text-m3-error-dark border-m3-error/30"
              : "bg-green-100/70 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-800/50"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-rounded text-lg">
              {toast.type === "error" ? "error" : "check_circle"}
            </span>
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors flex"
          >
            <span className="material-symbols-rounded text-base">close</span>
          </button>
        </div>
      )}

      {/* Profile Settings Card */}
      <div className="bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark p-6 sm:p-8 rounded-[2.5rem]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <span className="material-symbols-rounded text-m3-primary dark:text-m3-primary-dark text-2xl">person</span>
            <span>Editor Profile Settings</span>
          </h2>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-m3-primary/10 text-m3-primary dark:bg-m3-primary-dark/10 dark:text-m3-primary-dark">
            Verified Editor
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-m3-secondary dark:text-m3-secondary-dark uppercase tracking-wider mb-1.5">
              Contributor Attribution Name
            </label>
            {isEditingName ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-m3-surface-high dark:border-m3-surface-high-dark bg-m3-surface dark:bg-m3-surface-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark transition-all text-sm"
                placeholder="Enter your name as it should appear on wiki bandishes"
              />
            ) : (
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{name}</p>
            )}
          </div>

          <div className="shrink-0 flex items-end">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="px-4 py-2.5 text-xs sm:text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  className="px-6 py-2.5 bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900 rounded-full font-bold text-xs sm:text-sm transition-transform duration-200 active:scale-95 disabled:opacity-50"
                >
                  {isSavingName ? "Saving..." : "Save Attribution"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="px-5 py-2.5 bg-m3-surface dark:bg-m3-surface-dark hover:bg-m3-surface-high/40 dark:hover:bg-m3-surface-high-dark text-m3-primary dark:text-m3-primary-dark rounded-full font-bold text-xs sm:text-sm border border-m3-surface-high dark:border-m3-surface-high-dark transition-transform duration-200 active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-rounded text-base">edit</span>
                <span>Edit Name</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          This attribution is credited on all bandishes and raags you author or import into the wiki.
        </p>
      </div>

      {/* Interactive Stats & Fast Action Triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat: Bandishes */}
        <button
          type="button"
          onClick={() => setActiveTab("bandishes")}
          className={`p-6 rounded-[2rem] border text-left transition-all duration-200 flex flex-col justify-between ${
            activeTab === "bandishes"
              ? "bg-m3-primary/5 dark:bg-m3-primary-dark/10 border-m3-primary dark:border-m3-primary-dark"
              : "bg-white dark:bg-m3-surface-container-dark border-m3-surface-high dark:border-m3-surface-high-dark hover:-translate-y-1"
          }`}
        >
          <div className="mb-4">
            <span className="material-symbols-rounded text-3xl text-m3-primary dark:text-m3-primary-dark">
              library_music
            </span>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">{bandishCount}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
              Bandishes Authored
            </p>
          </div>
        </button>

        {/* Stat: Raags */}
        <button
          type="button"
          onClick={() => setActiveTab("raags")}
          className={`p-6 rounded-[2rem] border text-left transition-all duration-200 flex flex-col justify-between ${
            activeTab === "raags"
              ? "bg-m3-primary/5 dark:bg-m3-primary-dark/10 border-m3-primary dark:border-m3-primary-dark"
              : "bg-white dark:bg-m3-surface-container-dark border-m3-surface-high dark:border-m3-surface-high-dark hover:-translate-y-1"
          }`}
        >
          <div className="mb-4">
            <span className="material-symbols-rounded text-3xl text-m3-primary dark:text-m3-primary-dark">
              queue_music
            </span>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">{raagCount}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
              Raags Authored
            </p>
          </div>
        </button>

        {/* Action: Add Raag Modal */}
        <div className="bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark p-6 rounded-[2rem] flex flex-col justify-between">
          <div>
            <span className="material-symbols-rounded text-3xl text-m3-primary dark:text-m3-primary-dark mb-2 block">
              add_circle
            </span>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">New Raag</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Create a new canonical raag entry with scales & mood.
            </p>
          </div>
          <div className="mt-4">
            <AddRaagModal contributorName={initialName} />
          </div>
        </div>

        {/* Action: Bulk Add Bandishes */}
        <div className="bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark p-6 rounded-[2rem] flex flex-col justify-between">
          <div>
            <span className="material-symbols-rounded text-3xl text-m3-primary dark:text-m3-primary-dark mb-2 block">
              upload_file
            </span>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Bulk Ingestion</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Validate and batch upload multiple compositions.
            </p>
          </div>
          <div className="mt-4">
            <Link
              href="/bulk"
              className="w-full py-3.5 px-4 bg-m3-primary/10 hover:bg-m3-primary/20 dark:bg-m3-primary-dark/10 dark:hover:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark rounded-[1.5rem] font-bold text-xs sm:text-sm transition-transform duration-200 active:scale-95 flex items-center justify-center gap-2 border border-m3-primary/20 dark:border-m3-primary-dark/20"
            >
              <span className="material-symbols-rounded text-lg">cloud_upload</span>
              <span>Open Bulk Tool</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Google Health Inspired Expressive Contributions Graph */}
      <div className="bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark p-6 sm:p-8 rounded-[2.5rem]">
        {/* Header with Google Health Top Metric Hierarchy */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-m3-secondary dark:text-m3-secondary-dark">
              {activeTab === "bandishes" ? "Repertoire Breakdown" : "Canonical Scale Distribution"}
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                {activeTab === "bandishes"
                  ? `${userBandishes.length} ${userBandishes.length === 1 ? "Bandish" : "Bandishes"}`
                  : `${userRaags.length} ${userRaags.length === 1 ? "Raag" : "Raags"}`}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark text-gray-600 dark:text-gray-300">
                {activeTab === "bandishes"
                  ? `${bandishAnalytics.distinctRaags} raags covered`
                  : `${raagAnalytics.distinctThaats} parent thaats`}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {activeTab === "bandishes"
                ? "Distribution across compositions, rhythmic cycles (taals), and gharanas."
                : "Distribution across parent thaats, performance times (samay), and dominant swaras (vadi)."}
            </p>
          </div>

          {/* Category Toggle Pills with Spring Transition */}
          {activeTab === "bandishes" ? (
            <div className="relative flex rounded-full bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark p-1 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setBandishCategory("raag");
                  setActiveColumnIndex(0);
                }}
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors z-10 ${
                  bandishCategory === "raag"
                    ? "text-white dark:text-gray-900"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {bandishCategory === "raag" && (
                  <motion.div
                    layoutId="active-bandish-graph-tab"
                    className="absolute inset-0 bg-[#00A88F] dark:bg-[#00C4A7] rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span>By Raag</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBandishCategory("taal");
                  setActiveColumnIndex(0);
                }}
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors z-10 ${
                  bandishCategory === "taal"
                    ? "text-white dark:text-gray-900"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {bandishCategory === "taal" && (
                  <motion.div
                    layoutId="active-bandish-graph-tab"
                    className="absolute inset-0 bg-[#3B82F6] dark:bg-[#60A5FA] rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span>By Taal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBandishCategory("tradition");
                  setActiveColumnIndex(0);
                }}
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors z-10 ${
                  bandishCategory === "tradition"
                    ? "text-white dark:text-gray-900"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {bandishCategory === "tradition" && (
                  <motion.div
                    layoutId="active-bandish-graph-tab"
                    className="absolute inset-0 bg-[#F59E0B] dark:bg-[#FBBF24] rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span>Gharana</span>
              </button>
            </div>
          ) : (
            <div className="relative flex rounded-full bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark p-1 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setRaagCategory("thaat");
                  setActiveColumnIndex(0);
                }}
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors z-10 ${
                  raagCategory === "thaat"
                    ? "text-white dark:text-gray-900"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {raagCategory === "thaat" && (
                  <motion.div
                    layoutId="active-raag-graph-tab"
                    className="absolute inset-0 bg-[#00A88F] dark:bg-[#00C4A7] rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span>By Thaat</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRaagCategory("samay");
                  setActiveColumnIndex(0);
                }}
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors z-10 ${
                  raagCategory === "samay"
                    ? "text-white dark:text-gray-900"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {raagCategory === "samay" && (
                  <motion.div
                    layoutId="active-raag-graph-tab"
                    className="absolute inset-0 bg-[#3B82F6] dark:bg-[#60A5FA] rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span>By Samay (Time)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRaagCategory("vadi");
                  setActiveColumnIndex(0);
                }}
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors z-10 ${
                  raagCategory === "vadi"
                    ? "text-white dark:text-gray-900"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {raagCategory === "vadi" && (
                  <motion.div
                    layoutId="active-raag-graph-tab"
                    className="absolute inset-0 bg-[#F59E0B] dark:bg-[#FBBF24] rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span>Vadi Swara</span>
              </button>
            </div>
          )}
        </div>

        {/* Google Health Vertical Capsule Chart Canvas */}
        {currentChartStats.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-m3-surface-high dark:border-m3-surface-high-dark bg-m3-surface/40 dark:bg-m3-surface-dark/40 my-4">
            <span className="material-symbols-rounded text-3xl text-gray-400 mb-2">bar_chart</span>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
              No statistical distribution data available yet.
            </p>
          </div>
        ) : (
          <div className="my-6">
            <div className="relative h-64 sm:h-72 w-full pt-8 pb-10 flex flex-col justify-end">
              {/* Benchmark / Average Horizontal Dashed Line (Google Health target benchmark) */}
              {avgStatCount > 0 && (
                <div
                  className="absolute left-0 right-0 z-0 pointer-events-none flex items-center"
                  style={{
                    bottom: `calc(40px + ${Math.min(80, Math.max(20, (avgStatCount / maxStatCount) * 65))}%)`
                  }}
                >
                  <div className="w-full border-b border-dashed border-[#00A88F]/40 dark:border-[#00C4A7]/40" />
                  <span className="absolute right-0 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark text-[#00A88F] dark:text-[#00C4A7]">
                    Avg: {avgStatCount}
                  </span>
                </div>
              )}

              {/* 7 Vertical Pill Columns Grid */}
              <div
                className="grid gap-2 sm:gap-4 h-full items-end relative z-10"
                style={{
                  gridTemplateColumns: `repeat(${currentChartStats.length}, minmax(0, 1fr))`
                }}
              >
                {currentChartStats.map((item, idx) => {
                  const isSelected = (hoveredColumnIndex ?? activeColumnIndex) === idx;
                  const isAboveAverage = item.count >= avgStatCount;
                  const heightPercent = Math.max(22, Math.round((item.count / maxStatCount) * 100));

                  // Google Health signature pill color (mint by default, or category-themed)
                  const pillColor =
                    (activeTab === "bandishes" && bandishCategory === "taal") ||
                    (activeTab === "raags" && raagCategory === "samay")
                      ? "bg-[#3B82F6] dark:bg-[#60A5FA]"
                      : (activeTab === "bandishes" && bandishCategory === "tradition") ||
                        (activeTab === "raags" && raagCategory === "vadi")
                      ? "bg-[#F59E0B] dark:bg-[#FBBF24]"
                      : "bg-[#00A88F] dark:bg-[#00C4A7]";

                  return (
                    <button
                      key={`${item.label}-${idx}`}
                      type="button"
                      onClick={() => setActiveColumnIndex(idx)}
                      onMouseEnter={() => setHoveredColumnIndex(idx)}
                      onMouseLeave={() => setHoveredColumnIndex(null)}
                      onFocus={() => setActiveColumnIndex(idx)}
                      className="group flex flex-col items-center h-full justify-end cursor-pointer outline-none transition-transform duration-200"
                    >
                      {/* Vertical Capsule Bar Track */}
                      <div className="relative w-full max-w-[42px] sm:max-w-[48px] h-full flex flex-col justify-end items-center">
                        {/* Rounded Pill Fill */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ type: "spring", stiffness: 240, damping: 26, delay: idx * 0.03 }}
                          className={`w-full rounded-full ${pillColor} relative flex flex-col items-center justify-start pt-1.5 transition-all duration-200 ${
                            isSelected ? "ring-2 ring-m3-primary dark:ring-m3-primary-dark opacity-100" : "opacity-90 group-hover:opacity-100"
                          }`}
                        >
                          {/* Top Badge (Google Health Checkmark / Star Rosette Badge) */}
                          {isAboveAverage && (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white dark:bg-gray-950 text-gray-900 dark:text-white flex items-center justify-center border border-black/10 dark:border-white/10 shrink-0">
                              <span className="material-symbols-rounded text-[10px] sm:text-xs font-bold leading-none">
                                {idx === 0 ? "star" : "check"}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      </div>

                      {/* X-Axis Day / Category Label (Google Health style rounded letter pill) */}
                      <div className="mt-2.5 flex flex-col items-center">
                        <span
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-black"
                              : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                          }`}
                        >
                          {item.label.slice(0, 1).toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                          {item.count}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Status Chip (Google Health "301 cal left" style pill) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-m3-surface-high dark:border-m3-surface-high-dark">
              {selectedItem ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark text-xs font-bold text-gray-800 dark:text-gray-200">
                  <span className="material-symbols-rounded text-sm text-[#00A88F] dark:text-[#00C4A7]">
                    insights
                  </span>
                  <span>
                    <strong className="text-gray-900 dark:text-white">{selectedItem.label}</strong>:{" "}
                    {selectedItem.count}{" "}
                    {activeTab === "bandishes"
                      ? selectedItem.count === 1 ? "bandish" : "bandishes"
                      : selectedItem.count === 1 ? "raag" : "raags"}{" "}
                    ({selectedItem.percentage}% of repertory)
                  </span>
                </div>
              ) : (
                <div />
              )}

              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                Click or hover columns to inspect breakdown
              </span>
            </div>
          </div>
        )}

        {/* Metric Badges Row (Preserved for high-level numbers) */}
        {activeTab === "bandishes" ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-3.5 rounded-2xl bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                Total Repertory
              </span>
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {bandishAnalytics.totalBandishes}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                Raags Authored
              </span>
              <span className="text-xl sm:text-2xl font-black text-m3-primary dark:text-m3-primary-dark">
                {userRaags.length}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                Taals Represented
              </span>
              <span className="text-xl sm:text-2xl font-black text-m3-secondary dark:text-m3-secondary-dark">
                {bandishAnalytics.distinctTaals}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                Gharana Traditions
              </span>
              <span className="text-xl sm:text-2xl font-black text-m3-tertiary dark:text-m3-tertiary-dark">
                {bandishAnalytics.distinctTraditions}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-3.5 rounded-2xl bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                Raags Authored
              </span>
              <span className="text-xl sm:text-2xl font-black text-m3-primary dark:text-m3-primary-dark">
                {raagAnalytics.totalRaags}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                Parent Thaats
              </span>
              <span className="text-xl sm:text-2xl font-black text-m3-secondary dark:text-m3-secondary-dark">
                {raagAnalytics.distinctThaats}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                Performance Samays
              </span>
              <span className="text-xl sm:text-2xl font-black text-m3-tertiary dark:text-m3-tertiary-dark">
                {raagAnalytics.distinctSamays}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                Vadi Swaras
              </span>
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {raagAnalytics.distinctVadis}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive "My Contributions" Management Workspace */}
      <div className="bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark p-6 sm:p-8 rounded-[2.5rem]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <span className="material-symbols-rounded text-m3-primary dark:text-m3-primary-dark text-2xl">library_music</span>
              <span>My Contributions</span>
            </h2>
            <p className="text-xs sm:text-sm text-m3-secondary dark:text-m3-secondary-dark mt-1 font-medium">
              Browse, inspect, and manage compositions and scales authored under your contributor name.
            </p>
          </div>

          {/* Tab Selector with Spring-Sliding Pill */}
          <div className="relative flex rounded-full bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark p-1 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("bandishes")}
              className={`relative px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors z-10 ${
                activeTab === "bandishes"
                  ? "text-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {activeTab === "bandishes" && (
                <motion.div
                  layoutId="active-contributions-tab"
                  className="absolute inset-0 bg-m3-primary dark:bg-m3-primary-dark rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="material-symbols-rounded text-sm">library_music</span>
              <span>Bandishes ({userBandishes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("raags")}
              className={`relative px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors z-10 ${
                activeTab === "raags"
                  ? "text-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {activeTab === "raags" && (
                <motion.div
                  layoutId="active-contributions-tab"
                  className="absolute inset-0 bg-m3-primary dark:bg-m3-primary-dark rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="material-symbols-rounded text-sm">queue_music</span>
              <span>Raags ({userRaags.length})</span>
            </button>
          </div>
        </div>

        {/* Search Filter Toolbar */}
        <div className="mb-4">
          <div className="relative">
            <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder={
                activeTab === "bandishes"
                  ? "Filter your bandishes by title, raag, or composer..."
                  : "Filter your raags by name, thaat, or time..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-m3-surface-high dark:border-m3-surface-high-dark bg-m3-surface dark:bg-m3-surface-dark text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:border-m3-primary dark:focus:border-m3-primary-dark transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <span className="material-symbols-rounded text-base">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Table with Smooth Hover Lenis Scroll and Cutoff Protection */}
        {activeTab === "bandishes" ? (
          filteredBandishes.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-m3-surface-high dark:border-m3-surface-high-dark bg-m3-surface/50 dark:bg-m3-surface-dark/50">
              <span className="material-symbols-rounded text-3xl text-gray-400 mb-2">library_music</span>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {searchQuery ? "No matching bandishes found." : "No bandishes authored under this name yet."}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {searchQuery ? "Try clearing your search query." : "Use the Bulk Ingestion tool or Home page to add compositions."}
              </p>
            </div>
          ) : (
            <div className="border border-m3-surface-high dark:border-m3-surface-high-dark rounded-2xl overflow-hidden">
              <ReactLenis
                options={LENIS_OPTIONS}
                className="max-h-[380px] overflow-y-auto m3-scrollbar"
                onWheel={(e: React.WheelEvent) => e.stopPropagation()}
                onTouchMove={(e: React.TouchEvent) => e.stopPropagation()}
              >
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="sticky top-0 bg-m3-surface dark:bg-m3-surface-dark border-b border-m3-surface-high dark:border-m3-surface-high-dark text-gray-600 dark:text-gray-400 uppercase tracking-wider text-[11px] font-bold z-10">
                    <tr>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Raag</th>
                      <th className="py-3 px-4">Taal</th>
                      <th className="py-3 px-4">Composer</th>
                      <th className="py-3 pl-4 pr-6 sm:pr-8 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-m3-surface-high dark:divide-m3-surface-high-dark bg-white dark:bg-m3-surface-container-dark">
                    {filteredBandishes.map((b) => (
                      <tr
                        key={b.id}
                        className="hover:bg-m3-surface/60 dark:hover:bg-m3-surface-dark/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white max-w-[220px] truncate">
                          <Link
                            href={`/bandish/${b.id}`}
                            className="hover:text-m3-primary dark:hover:text-m3-primary-dark transition-colors"
                          >
                            {b.title}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-m3-secondary dark:text-m3-secondary-dark font-medium whitespace-nowrap">
                          {b.raag}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{b.taal}</td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400 capitalize">
                          <div className="font-medium">{b.composer || "unknown"}</div>
                          {b.tradition && b.tradition !== "N/A" && (
                            <div className="text-[11px] text-m3-tertiary dark:text-m3-tertiary-dark font-medium">
                              {b.tradition}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 pl-4 pr-6 sm:pr-8 text-right whitespace-nowrap">
                          <Link
                            href={`/bandish/${b.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark text-m3-primary dark:text-m3-primary-dark hover:bg-m3-primary/10 transition-colors"
                          >
                            <span>Open</span>
                            <span className="material-symbols-rounded text-sm">open_in_new</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ReactLenis>
            </div>
          )
        ) : filteredRaags.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-m3-surface-high dark:border-m3-surface-high-dark bg-m3-surface/50 dark:bg-m3-surface-dark/50">
            <span className="material-symbols-rounded text-3xl text-gray-400 mb-2">queue_music</span>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {searchQuery ? "No matching raags found." : "No raags authored under this name yet."}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Click &quot;New Raag&quot; above to contribute a raag scale to the wiki.
            </p>
          </div>
        ) : (
          <div className="border border-m3-surface-high dark:border-m3-surface-high-dark rounded-2xl overflow-hidden">
            <ReactLenis
              options={LENIS_OPTIONS}
              className="max-h-[380px] overflow-y-auto m3-scrollbar"
              onWheel={(e: React.WheelEvent) => e.stopPropagation()}
              onTouchMove={(e: React.TouchEvent) => e.stopPropagation()}
            >
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="sticky top-0 bg-m3-surface dark:bg-m3-surface-dark border-b border-m3-surface-high dark:border-m3-surface-high-dark text-gray-600 dark:text-gray-400 uppercase tracking-wider text-[11px] font-bold z-10">
                  <tr>
                    <th className="py-3 px-4">Raag Name</th>
                    <th className="py-3 px-4">Thaat</th>
                    <th className="py-3 px-4">Samay (Time)</th>
                    <th className="py-3 pl-4 pr-6 sm:pr-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-m3-surface-high dark:divide-m3-surface-high-dark bg-white dark:bg-m3-surface-container-dark">
                  {filteredRaags.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-m3-surface/60 dark:hover:bg-m3-surface-dark/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        <Link
                          href={`/raag/${r.slug}`}
                          className="hover:text-m3-primary dark:hover:text-m3-primary-dark transition-colors"
                        >
                          {r.name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-m3-secondary dark:text-m3-secondary-dark font-medium whitespace-nowrap">
                        {r.thaat || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{r.samay || "N/A"}</td>
                      <td className="py-3.5 pl-4 pr-6 sm:pr-8 text-right whitespace-nowrap">
                        <Link
                          href={`/raag/${r.slug}`}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark text-m3-primary dark:text-m3-primary-dark hover:bg-m3-primary/10 transition-colors"
                        >
                          <span>Open</span>
                          <span className="material-symbols-rounded text-sm">open_in_new</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ReactLenis>
          </div>
        )}
      </div>

      {/* Reference Recording Staging Queue */}
      <div>
        <RenditionsToIndexList />
      </div>
    </div>
  );
}
