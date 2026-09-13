"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import AddRaagModal from "./AddRaagModal";

interface EditorDashboardProps {
  initialName: string;
  bandishCount: number;
  raagCount: number;
}

export default function EditorDashboard({ initialName, bandishCount, raagCount }: EditorDashboardProps) {
  const [name, setName] = useState(initialName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setIsSavingName(true);
    
    // Update user metadata in Supabase Auth
    const { error } = await supabase.auth.updateUser({
      data: { contributor_name: name.trim() }
    });
    
    setIsSavingName(false);
    
    if (error) {
      alert("Failed to update name: " + error.message);
    } else {
      setIsEditingName(false);
      router.refresh();
    }
  };

  return (
    <div className="relative z-10 flex flex-col gap-6">
      
      {/* Settings Card */}
      <div className="bg-m3-surface-container dark:bg-m3-surface-container-dark p-6 rounded-3xl">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-rounded text-m3-primary dark:text-m3-primary-dark">person</span>
          Profile Settings
        </h2>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-m3-secondary dark:text-m3-secondary-dark uppercase tracking-wider mb-1">
              Contributor Name
            </label>
            {isEditingName ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-m3-surface-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark transition-all"
                placeholder="Enter your name as it should appear on contributions"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{name}</p>
            )}
          </div>
          
          <div className="shrink-0 flex items-end">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingName(false)}
                  className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  className="px-6 py-2.5 bg-m3-primary hover:bg-m3-primary/90 text-white rounded-xl font-bold text-sm transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSavingName ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="px-4 py-2.5 bg-m3-surface-high dark:bg-m3-surface-high-dark hover:bg-gray-200 dark:hover:bg-gray-700 text-m3-primary dark:text-m3-primary-dark rounded-xl font-bold text-sm transition-transform active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-rounded text-[1.2rem]">edit</span>
                Edit Name
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          This name will be displayed next to any bandishes or raags you add to the wiki.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-m3-surface-container dark:bg-m3-surface-container-dark p-6 rounded-3xl flex flex-col items-center justify-center text-center">
          <span className="material-symbols-rounded text-4xl text-m3-primary dark:text-m3-primary-dark mb-2">library_music</span>
          <p className="text-4xl font-black text-gray-900 dark:text-white">{bandishCount}</p>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">Bandishes Added</p>
        </div>
        <div className="bg-m3-surface-container dark:bg-m3-surface-container-dark p-6 rounded-3xl flex flex-col items-center justify-center text-center">
          <span className="material-symbols-rounded text-4xl text-m3-primary dark:text-m3-primary-dark mb-2">queue_music</span>
          <p className="text-4xl font-black text-gray-900 dark:text-white">{raagCount}</p>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">Raags Added</p>
        </div>
      </div>

      {/* Add New Raag Section */}
      <div className="mt-4">
        <AddRaagModal contributorName={initialName} />
      </div>

    </div>
  );
}

