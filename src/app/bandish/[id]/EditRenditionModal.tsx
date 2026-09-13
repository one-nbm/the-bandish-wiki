"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { updateBandishSecurely } from "@/app/actions";

export default function EditRenditionModal({ bandish, index }: { bandish: any; index: number }) {
  const router = useRouter();

  const rendition = bandish.youtube_renditions?.[index] || {};

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [formArtist, setFormArtist] = useState(rendition.artist || "");
  const [formTitle, setFormTitle] = useState(rendition.title || "");
  const [formUrl, setFormUrl] = useState(rendition.url || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setFormArtist(rendition.artist || "");
      setFormTitle(rendition.title || "");
      setFormUrl(rendition.url || "");
    }, 300);
  };

  const handleFormSubmit = async (e: React.FormEvent, action: 'save' | 'delete') => {
    e.preventDefault();
    setIsSubmitting(true);

    const currentRenditions = [...(bandish.youtube_renditions || [])];
    if (action === 'delete') {
      currentRenditions.splice(index, 1);
    } else {
      currentRenditions[index] = { artist: formArtist, title: formTitle, url: formUrl };
    }

    try {
      const result = await updateBandishSecurely(bandish.id, { youtube_renditions: currentRenditions });
      if (!result.success) throw new Error(result.error ?? "Unknown error");

      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        router.refresh();
      }, 300);
    } catch (error: any) {
      console.error("❌ ERROR:", error);
      alert(`Error: ${error.message || "Check console for details"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Edit Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center p-2.5 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 hover:text-m3-primary dark:hover:text-white hover:bg-m3-primary/10 dark:hover:bg-white/10 rounded-full transition-all duration-300"
        title="Edit Rendition"
      >
        <span className="material-symbols-rounded text-[1.1rem]">edit</span>
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 text-left" onClick={closeModal}>
          <div className={`absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-backdrop-exit' : 'animate-backdrop-enter'}`} />
          <div
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-m3-surface dark:bg-m3-surface-dark rounded-[2.5rem] p-8 md:p-12 border border-m3-surface-high dark:border-m3-surface-high-dark m3-scrollbar shadow-2xl ${isClosing ? 'animate-modal-exit' : 'animate-modal-enter'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-6 right-6 md:top-8 md:right-8">
              <button onClick={closeModal} className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-gray-900 dark:text-white rounded-full transition-colors duration-200">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}>Edit Rendition</h2>
              <p className="text-m3-secondary dark:text-m3-secondary-dark font-medium">Update or remove this performance.</p>
            </div>

            <form onSubmit={(e) => handleFormSubmit(e, 'save')} className="space-y-6 md:space-y-8">
              <div>
                <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Artist (Required)</label>
                <input type="text" required placeholder="e.g. Pandit Jasraj" value={formArtist} onChange={(e) => setFormArtist(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" />
              </div>

              <div>
                <label className="block text-xs font-bold text-m3-secondary dark:text-m3-secondary-dark uppercase tracking-wider mb-2">Title (Optional)</label>
                <input type="text" placeholder="e.g. Live at Sawai Gandharva" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-secondary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" />
              </div>

              <div>
                <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">YouTube URL (Required)</label>
                <input type="url" required placeholder="e.g. https://youtube.com/watch?v=..." value={formUrl} onChange={(e) => setFormUrl(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    if (confirm("Are you sure you want to delete this rendition?")) {
                      handleFormSubmit(e as unknown as React.FormEvent, 'delete');
                    }
                  }}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 bg-m3-error/10 hover:bg-m3-error/20 dark:bg-m3-error-dark/10 dark:hover:bg-m3-error-dark/20 text-m3-error dark:text-m3-error-dark px-6 py-4 rounded-[1.5rem] font-bold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <span className="material-symbols-rounded text-[1.4rem]">delete</span>
                  Delete
                </button>

                <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 bg-m3-primary hover:bg-m3-primary/90 dark:bg-m3-primary-dark dark:hover:bg-m3-primary-dark/90 text-white dark:text-gray-900 px-8 py-4 rounded-[1.5rem] font-bold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100">
                  <span className="material-symbols-rounded text-[1.4rem]">save</span>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
