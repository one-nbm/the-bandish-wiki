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

  // Graph View State
  const [graphCategory, setGraphCategory] = useState<"raag" | "taal" | "tradition">("raag");

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

  // Analytics Computation for Material 3 Graph
  const graphAnalytics = useMemo(() => {
    const totalBandishes = userBandishes.length;

    // 1. By Raag
    const raagMap: Record<string, number> = {};
    // 2. By Taal
    const taalMap: Record<string, number> = {};
    // 3. By Tradition
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
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-rounded text-3xl text-m3-primary dark:text-m3-primary-dark">
              library_music
            </span>
            <span className="text-xs font-bold text-m3-primary dark:text-m3-primary-dark flex items-center gap-0.5">
              <span>View list</span>
              <span className="material-symbols-rounded text-sm">arrow_forward</span>
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
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-rounded text-3xl text-m3-primary dark:text-m3-primary-dark">
              queue_music
            </span>
            <span className="text-xs font-bold text-m3-primary dark:text-m3-primary-dark flex items-center gap-0.5">
              <span>View list</span>
              <span className="material-symbols-rounded text-sm">arrow_forward</span>
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

      {/* Stylized Material 3 Expressive Contributions Graph */}
      <div className="bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark p-6 sm:p-8 rounded-[2.5rem]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <span className="material-symbols-rounded text-m3-primary dark:text-m3-primary-dark text-2xl">bar_chart</span>
              <span>Contribution Insights</span>
            </h2>
            <p className="text-xs sm:text-sm text-m3-secondary dark:text-m3-secondary-dark mt-1 font-medium">
              Expressive distribution across raags, rhythmic cycles (taals), and gharana lineages.
            </p>
          </div>

          {/* Graph Category Toggle with Spring Pill */}
          <div className="relative flex rounded-full bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark p-1 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setGraphCategory("raag")}
              className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors z-10 ${
                graphCategory === "raag"
                  ? "text-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {graphCategory === "raag" && (
                <motion.div
                  layoutId="active-graph-tab"
                  className="absolute inset-0 bg-m3-primary dark:bg-m3-primary-dark rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span>By Raag</span>
            </button>

            <button
              type="button"
              onClick={() => setGraphCategory("taal")}
              className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors z-10 ${
                graphCategory === "taal"
                  ? "text-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {graphCategory === "taal" && (
                <motion.div
                  layoutId="active-graph-tab"
                  className="absolute inset-0 bg-m3-secondary dark:bg-m3-secondary-dark rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span>By Taal</span>
            </button>

            <button
              type="button"
              onClick={() => setGraphCategory("tradition")}
              className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors z-10 ${
                graphCategory === "tradition"
                  ? "text-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {graphCategory === "tradition" && (
                <motion.div
                  layoutId="active-graph-tab"
                  className="absolute inset-0 bg-m3-tertiary dark:bg-m3-tertiary-dark rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span>Gharana</span>
            </button>
          </div>
        </div>

        {/* Metric Badges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
              Distinct Raags
            </span>
            <span className="text-xl sm:text-2xl font-black text-m3-primary dark:text-m3-primary-dark">
              {graphAnalytics.distinctRaags}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
              Taals Represented
            </span>
            <span className="text-xl sm:text-2xl font-black text-m3-secondary dark:text-m3-secondary-dark">
              {graphAnalytics.distinctTaals}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
              Gharana Traditions
            </span>
            <span className="text-xl sm:text-2xl font-black text-m3-tertiary dark:text-m3-tertiary-dark">
              {graphAnalytics.distinctTraditions}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
              Total Repertory
            </span>
            <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {graphAnalytics.totalBandishes}
            </span>
          </div>
        </div>

        {/* Dynamic Stylized Chart Bars */}
        {graphAnalytics.totalBandishes === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            Add bandishes under your contributor name to generate statistical repertoire charts.
          </div>
        ) : (
          <div className="space-y-3.5">
            {(graphCategory === "raag"
              ? graphAnalytics.raagStats
              : graphCategory === "taal"
              ? graphAnalytics.taalStats
              : graphAnalytics.traditionStats
            ).map((item, idx) => {
              const maxCount =
                graphCategory === "raag"
                  ? graphAnalytics.raagStats[0]?.count || 1
                  : graphCategory === "taal"
                  ? graphAnalytics.taalStats[0]?.count || 1
                  : graphAnalytics.traditionStats[0]?.count || 1;

              const relativeWidth = Math.max(8, Math.round((item.count / maxCount) * 100));

              const barColor =
                graphCategory === "raag"
                  ? "bg-m3-primary dark:bg-m3-primary-dark"
                  : graphCategory === "taal"
                  ? "bg-m3-secondary dark:bg-m3-secondary-dark"
                  : "bg-m3-tertiary dark:bg-m3-tertiary-dark";

              return (
                <div key={`${item.label}-${idx}`} className="group">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-1.5">
                    <span className="text-gray-900 dark:text-white font-bold flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {graphCategory === "tradition" && item.label !== "N/A" && (
                        <span className="text-[11px] text-m3-secondary dark:text-m3-secondary-dark font-normal">
                          Gharana
                        </span>
                      )}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 font-mono text-xs">
                      <strong className="text-gray-900 dark:text-white">{item.count}</strong>{" "}
                      {item.count === 1 ? "bandish" : "bandishes"} ({item.percentage}%)
                    </span>
                  </div>

                  {/* Material 3 Expressive Rounded Pill Track & Bar */}
                  <div className="h-3.5 w-full bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark rounded-full overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${relativeWidth}%` }}
                      transition={{ type: "spring", stiffness: 220, damping: 25, delay: idx * 0.04 }}
                      className={`h-full rounded-full ${barColor} transition-opacity group-hover:opacity-90`}
                    />
                  </div>
                </div>
              );
            })}
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
