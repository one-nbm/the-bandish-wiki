"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { syncRenditionAcrossBandishes, getAllBandishTitles, submitRenditionContribution, UserRole } from "@/app/actions";
import BandishCombobox from "./BandishCombobox";

export default function AddRenditionModal({ bandish, userRole = "admin" }: { bandish: any; userRole?: UserRole }) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [formArtist, setFormArtist] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formYear, setFormYear] = useState("");
  const [formIsVideo, setFormIsVideo] = useState(false);
  const [formBandishes, setFormBandishes] = useState<string[]>([bandish?.title || ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allTitles, setAllTitles] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      getAllBandishTitles().then(res => {
        if (res.success && res.data) setAllTitles(res.data);
      });
    }
  }, [isOpen]);

  const closeModal = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setFormArtist("");
      setFormUrl("");
      setFormYear("");
      setFormIsVideo(false);
      setFormBandishes([bandish?.title || ""]);
      setToast(null);
    }, 300);
  }, [bandish]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (toast) {
          setToast(null);
        } else if (isOpen) {
          closeModal();
        }
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = "hidden";
    } else {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    };
  }, [isOpen, toast, closeModal]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setToast(null);

    const newRendition = { 
      artist: formArtist, 
      url: formUrl,
      year: formYear,
      isVideo: formIsVideo,
      bandishes: formBandishes.map((s: string) => s.trim()).filter(Boolean)
    };

    try {
      if (userRole === "contributor") {
        const result = await submitRenditionContribution(bandish.id, newRendition);
        if (!result.success) throw new Error(result.error ?? "Failed to submit rendition");
        setToast({ message: "Rendition submitted for administrator approval!", type: 'success' });
        setTimeout(() => {
          closeModal();
        }, 1500);
        return;
      }

      const result = await syncRenditionAcrossBandishes(null, newRendition);
      if (!result.success) throw new Error(result.error ?? "Unknown error");

      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        setFormArtist("");
        setFormUrl("");
        setFormYear("");
        setFormIsVideo(false);
        setFormBandishes([bandish?.title || ""]);
        router.refresh();
      }, 300);
    } catch (error: any) {
      console.error("❌ ERROR:", error);
      setToast({ message: error.message || "An unknown error occurred", type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-m3-primary dark:text-m3-primary-dark rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
        title={userRole === "contributor" ? "Suggest Rendition" : "Add Rendition"}
      >
        <span className="material-symbols-rounded text-[1.4rem]">add</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 text-left" onClick={closeModal}>
          <div className={`absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-backdrop-exit' : 'animate-backdrop-enter'}`} />
          
          <div
            data-lenis-prevent="true"
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto overscroll-contain bg-m3-surface dark:bg-m3-surface-dark rounded-[2.5rem] p-8 md:p-12 border border-m3-surface-high dark:border-m3-surface-high-dark m3-scrollbar ${isClosing ? 'animate-modal-exit' : 'animate-modal-enter'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-6 right-6 md:top-8 md:right-8">
              <button onClick={closeModal} className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-gray-900 dark:text-white rounded-full transition-colors duration-200">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}>
                {userRole === "contributor" ? "Suggest Rendition" : "Add Notable Rendition"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {userRole === "contributor"
                  ? "Submit a notable audio/video rendition. It will be verified by an administrator before appearing live."
                  : "Link a notable performance or recording of this composition."}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Artist / Performer</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pt. Bhimsen Joshi"
                  value={formArtist}
                  onChange={(e) => setFormArtist(e.target.value)}
                  className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">YouTube URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Year / Era (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1978 or 1980s"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 cursor-pointer py-4">
                    <input
                      type="checkbox"
                      checked={formIsVideo}
                      onChange={(e) => setFormIsVideo(e.target.checked)}
                      className="w-5 h-5 rounded-lg border-m3-surface-high text-m3-primary focus:ring-m3-primary"
                    />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contains Video footage</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider">Compositions Included</label>
                  <button type="button" onClick={() => setFormBandishes([...formBandishes, ""])} className="text-xs font-bold text-m3-primary dark:text-m3-primary-dark hover:underline flex items-center gap-1">
                    <span className="material-symbols-rounded text-[1rem]">add</span> Add Bandish
                  </button>
                </div>
                <div className="space-y-3">
                  {formBandishes.map((b, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <BandishCombobox
                        value={b}
                        onChange={(val) => {
                          const newB = [...formBandishes];
                          newB[index] = val;
                          setFormBandishes(newB);
                        }}
                        allTitles={allTitles}
                      />
                      {formBandishes.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => setFormBandishes(formBandishes.filter((_, i) => i !== index))} 
                          className="p-3 text-gray-400 hover:text-m3-error dark:hover:text-m3-error-dark hover:bg-m3-error/10 dark:hover:bg-m3-error-dark/10 rounded-full transition-colors"
                        >
                          <span className="material-symbols-rounded">delete</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 bg-m3-primary hover:bg-m3-primary/90 dark:bg-m3-primary-dark dark:hover:bg-m3-primary-dark/90 text-white dark:text-gray-900 px-8 py-4 rounded-[1.5rem] font-bold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100">
                  <span className="material-symbols-rounded text-[1.4rem]">{userRole === "contributor" ? "send" : "save"}</span>
                  {isSubmitting ? "Submitting..." : userRole === "contributor" ? "Submit for Approval" : "Add Rendition"}
                </button>
              </div>
            </form>
          </div>
          
          {/* Toast Notification */}
          {toast && (
            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4 rounded-full font-bold border border-white/20 animate-toast-slide-up z-[70] ${toast.type === 'error' ? 'bg-m3-error dark:bg-m3-error-dark text-white' : 'bg-green-600 dark:bg-green-500 text-white'}`}>
              <span className="material-symbols-rounded text-[1.4rem]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
              <span>{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-2 flex items-center justify-center p-1 hover:bg-white/20 rounded-full transition-colors">
                <span className="material-symbols-rounded text-[1.2rem]">close</span>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
