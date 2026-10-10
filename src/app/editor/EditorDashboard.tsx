"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AddRaagModal from "./AddRaagModal";
import RenditionsToIndexList from "./RenditionsToIndexList";

interface ContributedBandish {
  id: string;
  title: string;
  raag: string;
  taal: string;
  composer?: string;
  lay?: string[];
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
        (b.composer && b.composer.toLowerCase().includes(q))
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-rounded text-m3-primary dark:text-m3-primary-dark">person</span>
            Editor Profile Settings
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

      {/* Interactive "My Contributions" Management Workspace */}
      <div className="bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark p-6 sm:p-8 rounded-[2.5rem]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2
              className="text-2xl font-bold text-gray-900 dark:text-white"
              style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}
            >
              My Contributions
            </h2>
            <p className="text-xs sm:text-sm text-m3-secondary dark:text-m3-secondary-dark mt-1 font-medium">
              Browse, inspect, and manage compositions and scales authored under your contributor name.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-full bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark p-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("bandishes")}
              className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === "bandishes"
                  ? "bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span className="material-symbols-rounded text-sm">library_music</span>
              <span>Bandishes ({userBandishes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("raags")}
              className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === "raags"
                  ? "bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
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

        {/* Content Table */}
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
              <div className="max-h-[360px] overflow-y-auto m3-scrollbar">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="sticky top-0 bg-m3-surface dark:bg-m3-surface-dark border-b border-m3-surface-high dark:border-m3-surface-high-dark text-gray-600 dark:text-gray-400 uppercase tracking-wider text-[11px] font-bold z-10">
                    <tr>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Raag</th>
                      <th className="py-3 px-4">Taal</th>
                      <th className="py-3 px-4">Composer</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-m3-surface-high dark:divide-m3-surface-high-dark bg-white dark:bg-m3-surface-container-dark">
                    {filteredBandishes.map((b) => (
                      <tr
                        key={b.id}
                        className="hover:bg-m3-surface/60 dark:hover:bg-m3-surface-dark/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                          <Link
                            href={`/bandish/${b.id}`}
                            className="hover:text-m3-primary dark:hover:text-m3-primary-dark transition-colors"
                          >
                            {b.title}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-m3-secondary dark:text-m3-secondary-dark font-medium">
                          {b.raag}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">{b.taal}</td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400 capitalize">
                          {b.composer || "unknown"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
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
              </div>
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
            <div className="max-h-[360px] overflow-y-auto m3-scrollbar">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="sticky top-0 bg-m3-surface dark:bg-m3-surface-dark border-b border-m3-surface-high dark:border-m3-surface-high-dark text-gray-600 dark:text-gray-400 uppercase tracking-wider text-[11px] font-bold z-10">
                  <tr>
                    <th className="py-3 px-4">Raag Name</th>
                    <th className="py-3 px-4">Thaat</th>
                    <th className="py-3 px-4">Samay (Time)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-m3-surface-high dark:divide-m3-surface-high-dark bg-white dark:bg-m3-surface-container-dark">
                  {filteredRaags.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-m3-surface/60 dark:hover:bg-m3-surface-dark/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                        <Link
                          href={`/raag/${r.slug}`}
                          className="hover:text-m3-primary dark:hover:text-m3-primary-dark transition-colors"
                        >
                          {r.name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-m3-secondary dark:text-m3-secondary-dark font-medium">
                        {r.thaat || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">{r.samay || "N/A"}</td>
                      <td className="py-3.5 px-4 text-right">
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
            </div>
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
