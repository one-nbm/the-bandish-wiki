"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AddRenditionModal({ bandish }: { bandish: any }) {
  const router = useRouter();

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Form State
  const [formArtist, setFormArtist] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  
  const [adminPasscode, setAdminPasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lock Background Scrolling
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
      // Reset form
      setFormArtist("");
      setFormTitle("");
      setFormUrl("");
      setAdminPasscode("");
    }, 300);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (adminPasscode !== "kalamanthan") {
      alert("Incorrect Admin Passcode!");
      return;
    }

    setIsSubmitting(true);

    const newRendition = {
      artist: formArtist,
      title: formTitle,
      url: formUrl,
    };

    const currentRenditions = bandish.youtube_renditions || [];
    const updatedRenditions = [...currentRenditions, newRendition];

    try {
      const { error } = await supabase
        .from("bandishes")
        .update({ youtube_renditions: updatedRenditions })
        .eq("id", bandish.id);

      if (error) throw error;

      // Close modal first
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        
        // Reset form
        setFormArtist("");
        setFormTitle("");
        setFormUrl("");
        setAdminPasscode("");
        
        // Refresh page to load new data
        router.refresh();
      }, 300);

    } catch (error: any) {
      console.error("❌ SUPABASE ERROR:", error);
      alert(`Database Error: ${error.message || "Check console for details"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Add Button */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-m3-primary dark:text-m3-primary-dark rounded-full transition-all duration-200 hover:scale-105 active:scale-95" 
        title="Add Rendition"
      >
        <span className="material-symbols-rounded text-[1.4rem]">add</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 text-left" onClick={closeModal}>
          <div className={`absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-backdrop-exit' : 'animate-backdrop-enter'}`}></div>
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-m3-surface dark:bg-m3-surface-dark rounded-[2.5rem] p-8 md:p-12 border border-m3-surface-high dark:border-m3-surface-high-dark m3-scrollbar shadow-2xl ${isClosing ? 'animate-modal-exit' : 'animate-modal-enter'}`} onClick={(e) => e.stopPropagation()}>
            
            <div className="absolute top-6 right-6 md:top-8 md:right-8">
              <button onClick={closeModal} className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-gray-900 dark:text-white rounded-full transition-colors duration-200">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}>Add Rendition</h2>
              <p className="text-m3-secondary dark:text-m3-secondary-dark font-medium">Add a YouTube performance to this bandish.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6 md:space-y-8">
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

              <hr className="border-gray-200 dark:border-m3-surface-high-dark my-2" />
              
              <div className="flex flex-col md:flex-row gap-6 items-end">
                <div className="w-full">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-m3-error dark:text-m3-error-dark uppercase tracking-wider mb-2">
                    <span className="material-symbols-rounded text-[1.1rem]">lock</span> Admin Passcode
                  </label>
                  <input type="password" required placeholder="Enter the secret password to publish" value={adminPasscode} onChange={(e) => setAdminPasscode(e.target.value)} className="w-full bg-m3-error/10 dark:bg-m3-error-dark/10 text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-error dark:focus:ring-m3-error-dark transition-all duration-300 placeholder-m3-error/50 dark:placeholder-m3-error-dark/50" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 bg-m3-primary hover:bg-m3-primary/90 dark:bg-m3-primary-dark dark:hover:bg-m3-primary-dark/90 text-white dark:text-gray-900 px-8 py-4 rounded-[1.5rem] font-bold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100">
                  <span className="material-symbols-rounded text-[1.4rem]">save</span>
                  {isSubmitting ? "Saving..." : "Add Rendition"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}

