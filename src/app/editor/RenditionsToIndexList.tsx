"use client";

import { useState, useEffect } from "react";
import { getRenditionsToIndex, addRenditionToIndex, deleteRenditionFromIndex } from "@/app/actions";

export default function RenditionsToIndexList() {
  const [renditions, setRenditions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    
    setIsAdding(true);
    const res = await addRenditionToIndex(title, url);
    setIsAdding(false);
    
    if (res.success) {
      setTitle("");
      setUrl("");
      fetchRenditions();
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await deleteRenditionFromIndex(id);
    setDeletingId(null);
    if (res.success) {
      fetchRenditions();
    }
  };

  return (
    <div className="bg-white dark:bg-m3-surface-container-dark p-6 rounded-3xl border border-m3-surface-high dark:border-m3-surface-high-dark flex flex-col h-[400px]">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="material-symbols-rounded text-m3-primary dark:text-m3-primary-dark">queue_music</span>
        Bandishes to Index
      </h2>
      
      {/* List */}
      <div className="flex-1 overflow-y-auto m3-scrollbar pr-2 mb-4 space-y-2">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : renditions.length === 0 ? (
          <p className="text-sm text-gray-500">No renditions in the queue.</p>
        ) : (
          renditions.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-m3-surface dark:bg-m3-surface-dark rounded-xl border border-m3-surface-high dark:border-m3-surface-high-dark group">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.title}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-m3-primary dark:text-m3-primary-dark hover:underline truncate block">
                  {item.url}
                </a>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="w-8 h-8 flex items-center justify-center shrink-0 rounded-full text-gray-400 hover:text-m3-error hover:bg-m3-error/10 dark:hover:text-m3-error-dark dark:hover:bg-m3-error-dark/10 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-rounded text-[1.2rem]">{deletingId === item.id ? 'hourglass_empty' : 'remove'}</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <div className="flex-1 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-m3-surface dark:bg-m3-surface-dark px-4 py-2 text-sm rounded-xl border border-m3-surface-high dark:border-m3-surface-high-dark focus:border-m3-primary focus:ring-1 focus:ring-m3-primary outline-none transition-all placeholder:text-gray-400"
          />
          <input
            type="url"
            placeholder="YouTube Link"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-m3-surface dark:bg-m3-surface-dark px-4 py-2 text-sm rounded-xl border border-m3-surface-high dark:border-m3-surface-high-dark focus:border-m3-primary focus:ring-1 focus:ring-m3-primary outline-none transition-all placeholder:text-gray-400"
          />
        </div>
        <button
          type="submit"
          disabled={isAdding || !title.trim() || !url.trim()}
          className="w-12 shrink-0 bg-m3-primary/10 hover:bg-m3-primary/20 text-m3-primary dark:bg-m3-primary-dark/10 dark:hover:bg-m3-primary-dark/20 dark:text-m3-primary-dark rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-m3-primary/10 border border-m3-primary/20 dark:border-m3-primary-dark/20"
        >
          <span className="material-symbols-rounded">{isAdding ? 'hourglass_empty' : 'add'}</span>
        </button>
      </form>
    </div>
  );
}
