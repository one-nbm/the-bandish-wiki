"use client";

import { useState, useEffect } from "react";
import { getRenditionsToIndex, addRenditionToIndex, deleteRenditionFromIndex } from "@/app/actions";
import { ReactLenis } from 'lenis/react';
import { LENIS_OPTIONS } from '@/components/SmoothScrolling';

export default function RenditionsToIndexList() {
  const [renditions, setRenditions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [urlWarning, setUrlWarning] = useState<string | null>(null);

  const fetchRenditions = async () => {
    const res = await getRenditionsToIndex();
    if (res.success && res.data) {
      setRenditions(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRenditions();
  }, []);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value.trim() && !value.includes("youtube.com") && !value.includes("youtu.be")) {
      setUrlWarning("Please verify this is a valid YouTube link (e.g. youtube.com or youtu.be)");
    } else {
      setUrlWarning(null);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    
    setIsAdding(true);
    const res = await addRenditionToIndex(title.trim(), url.trim());
    setIsAdding(false);
    
    if (res.success) {
      setTitle("");
      setUrl("");
      setUrlWarning(null);
      fetchRenditions();
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await deleteRenditionFromIndex(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (res.success) {
      fetchRenditions();
    }
  };

  return (
    <div className="bg-white dark:bg-m3-surface-container-dark p-6 sm:p-8 rounded-[2.5rem] border border-m3-surface-high dark:border-m3-surface-high-dark flex flex-col min-h-[460px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-rounded text-m3-primary dark:text-m3-primary-dark">queue_music</span>
            Reference Recording Staging Queue
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Performances queued by editors for cataloging, transcription, and linking to wiki bandishes.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark text-gray-700 dark:text-gray-300 self-start sm:self-auto shrink-0">
          {renditions.length} Queued
        </span>
      </div>
      
      {/* List */}
      <ReactLenis 
        options={LENIS_OPTIONS} 
        className="flex-1 overflow-y-auto m3-scrollbar pr-2 mb-4 space-y-2 max-h-[300px]"
        onWheel={(e: React.WheelEvent) => e.stopPropagation()}
        onTouchMove={(e: React.TouchEvent) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-400">
            <span className="material-symbols-rounded animate-spin mr-2">sync</span>
            Loading queue...
          </div>
        ) : renditions.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-m3-surface-high dark:border-m3-surface-high-dark bg-m3-surface/50 dark:bg-m3-surface-dark/50">
            <span className="material-symbols-rounded text-3xl text-gray-400 mb-2">music_note</span>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No recordings in the queue.</p>
            <p className="text-xs text-gray-500 mt-0.5">Use the form below to submit a reference performance.</p>
          </div>
        ) : (
          renditions.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3.5 bg-m3-surface dark:bg-m3-surface-dark rounded-2xl border border-m3-surface-high dark:border-m3-surface-high-dark group transition-colors">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.title}</p>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-m3-primary dark:text-m3-primary-dark hover:opacity-80 transition-opacity truncate block mt-0.5"
                >
                  {item.url}
                </a>
              </div>

              {confirmDeleteId === item.id ? (
                <div className="flex items-center gap-2 shrink-0 animate-fadeIn">
                  <span className="text-xs font-bold text-m3-error dark:text-m3-error-dark hidden sm:inline">Delete?</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="px-3 py-1.5 bg-m3-error dark:bg-m3-error-dark text-white dark:text-gray-900 rounded-full text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {deletingId === item.id ? "..." : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-2.5 py-1.5 border border-m3-surface-high dark:border-m3-surface-high-dark rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-m3-surface-high/40 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(item.id)}
                  title="Remove from staging queue"
                  className="w-8 h-8 flex items-center justify-center shrink-0 rounded-full text-gray-400 hover:text-m3-error hover:bg-m3-error/10 dark:hover:text-m3-error-dark dark:hover:bg-m3-error-dark/10 transition-colors"
                >
                  <span className="material-symbols-rounded text-[1.2rem]">delete</span>
                </button>
              )}
            </div>
          ))
        )}
      </ReactLenis>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="pt-2 border-t border-m3-surface-high dark:border-m3-surface-high-dark">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Recording Title (e.g. Ustad Amir Khan - Yaman Drut)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 bg-m3-surface dark:bg-m3-surface-dark px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-m3-surface-high dark:border-m3-surface-high-dark focus:border-m3-primary dark:focus:border-m3-primary-dark outline-none transition-all placeholder:text-gray-400"
            />
            <input
              type="url"
              placeholder="YouTube URL (https://www.youtube.com/...)"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="flex-1 bg-m3-surface dark:bg-m3-surface-dark px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-m3-surface-high dark:border-m3-surface-high-dark focus:border-m3-primary dark:focus:border-m3-primary-dark outline-none transition-all placeholder:text-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={isAdding || !title.trim() || !url.trim()}
            className="px-5 py-2.5 bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-transform duration-200 active:scale-95 disabled:opacity-50 shrink-0"
          >
            <span className="material-symbols-rounded text-base">{isAdding ? 'sync' : 'add'}</span>
            <span>{isAdding ? "Queuing..." : "Queue Recording"}</span>
          </button>
        </div>

        {urlWarning && (
          <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
            <span className="material-symbols-rounded text-sm">info</span>
            {urlWarning}
          </p>
        )}
      </form>
    </div>
  );
}
