"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { addRaagSecurely } from "@/app/actions";
import { ReactLenis } from 'lenis/react';
import { LENIS_OPTIONS } from '@/components/SmoothScrolling';

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function AddRaagModal({ contributorName }: { contributorName: string }) {
  const router = useRouter();

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formThaat, setFormThaat] = useState("");
  const [formSamay, setFormSamay] = useState("");
  const [formVadi, setFormVadi] = useState("");
  const [formSamvadi, setFormSamvadi] = useState("");
  const [formAaroh, setFormAaroh] = useState("");
  const [formAvaroh, setFormAvaroh] = useState("");
  const [formDescription, setFormDescription] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

  const closeModal = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setToast(null);
      // Reset form
      setFormName("");
      setFormThaat("");
      setFormSamay("");
      setFormVadi("");
      setFormSamvadi("");
      setFormAaroh("");
      setFormAvaroh("");
      setFormDescription("");
    }, 300);
  }, []);

  // Lock Background Scrolling + Escape key
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

    if (!formName.trim()) {
      setToast({ message: "Raag Name is required.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setToast(null);
    const slug = generateSlug(formName);

    try {
      const payload = {
        name: formName,
        slug,
        thaat: formThaat,
        samay: formSamay,
        vadi: formVadi,
        samvadi: formSamvadi,
        aaroh: formAaroh,
        avaroh: formAvaroh,
        description: formDescription,
        contributor: contributorName,
      };

      const result = await addRaagSecurely(payload);
      if (!result.success) throw new Error(result.error);

      // Close modal first
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        
        // Navigate to new raag
        router.push(`/raag/${slug}`);
      }, 300);
      
    } catch (error: any) {
      console.error("❌ SUPABASE ERROR:", error);
      setToast({ message: `Database Error: ${error.message || "Check console for details"}`, type: "error" });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="w-full sm:w-auto px-6 py-4 bg-m3-primary/10 hover:bg-m3-primary/20 dark:bg-m3-primary-dark/10 dark:hover:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark rounded-[1.5rem] font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 border border-m3-primary/20 dark:border-m3-primary-dark/20"
      >
        <span className="material-symbols-rounded text-2xl">add_circle</span>
        Add New Raag
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" onClick={closeModal}>
          {/* Backdrop */}
          <div className={`absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-backdrop-exit' : 'animate-backdrop-enter'}`}></div>
          
          {/* Modal Content */}
          <div className={`relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-m3-surface-container-dark rounded-[2.5rem] border border-m3-surface-high dark:border-m3-surface-high-dark overflow-hidden flex flex-col transition-all duration-300 ease-out ${isClosing ? 'animate-modal-exit scale-95' : 'animate-modal-enter scale-100'}`} onClick={(e) => e.stopPropagation()}>
            <ReactLenis 
              options={LENIS_OPTIONS} 
              className="w-full max-h-[90vh] overflow-y-auto m3-scrollbar"
              onWheel={(e: React.WheelEvent) => e.stopPropagation()}
              onTouchMove={(e: React.TouchEvent) => e.stopPropagation()}
            >
              <div className="p-8 md:p-12">
                <div className="absolute top-6 right-6 md:top-8 md:right-8 z-10">
                  <button onClick={closeModal} className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-gray-900 dark:text-white rounded-full transition-colors duration-200">
                    <span className="material-symbols-rounded">close</span>
                  </button>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}>Add New Raag</h2>
                  <p className="text-m3-secondary dark:text-m3-secondary-dark font-medium">Contribute to the Raag database.</p>
                </div>

                <form id="add-raag-form" onSubmit={handleFormSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Raag Name *</label>
                        <input 
                          type="text" 
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full bg-m3-surface dark:bg-m3-surface-dark px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="e.g. Yaman"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Thaat</label>
                        <input 
                          type="text" 
                          value={formThaat}
                          onChange={(e) => setFormThaat(e.target.value)}
                          className="w-full bg-m3-surface dark:bg-m3-surface-dark px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="e.g. Kalyan"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Samay (Time)</label>
                        <input 
                          type="text" 
                          value={formSamay}
                          onChange={(e) => setFormSamay(e.target.value)}
                          className="w-full bg-m3-surface dark:bg-m3-surface-dark px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="e.g. Evening (First quarter of night)"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Vadi</label>
                          <input 
                            type="text" 
                            value={formVadi}
                            onChange={(e) => setFormVadi(e.target.value)}
                            className="w-full bg-m3-surface dark:bg-m3-surface-dark px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="e.g. Ga"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Samvadi</label>
                          <input 
                            type="text" 
                            value={formSamvadi}
                            onChange={(e) => setFormSamvadi(e.target.value)}
                            className="w-full bg-m3-surface dark:bg-m3-surface-dark px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="e.g. Ni"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Aaroh</label>
                        <input 
                          type="text" 
                          value={formAaroh}
                          onChange={(e) => setFormAaroh(e.target.value)}
                          className="w-full bg-m3-surface dark:bg-m3-surface-dark px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm"
                          placeholder="e.g. S R G M P D N S'"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Avaroh</label>
                        <input 
                          type="text" 
                          value={formAvaroh}
                          onChange={(e) => setFormAvaroh(e.target.value)}
                          className="w-full bg-m3-surface dark:bg-m3-surface-dark px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm"
                          placeholder="e.g. S' N D P M G R S"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Description</label>
                    <textarea 
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={4}
                      className="w-full bg-m3-surface dark:bg-m3-surface-dark px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 resize-y m3-scrollbar"
                      placeholder="General description, mood, rules, or historical context..."
                      data-lenis-prevent="true"
                      onWheel={(e: React.WheelEvent) => e.stopPropagation()}
                      onTouchMove={(e: React.TouchEvent) => e.stopPropagation()}
                    />
                  </div>

                  {/* Toast Message */}
                  {toast && (
                    <div className={`mt-6 px-6 py-4 rounded-xl font-bold flex items-center gap-3 border ${toast.type === 'error' ? 'bg-m3-error-dark/20 text-m3-error dark:text-m3-error-dark border-m3-error-dark/30' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/50'} animate-modal-enter`}>
                      <span className="material-symbols-rounded">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
                      <span className="flex-1">{toast.message}</span>
                      <button type="button" onClick={() => setToast(null)} className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors flex">
                        <span className="material-symbols-rounded text-[1.1rem]">close</span>
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-6">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto md:min-w-[200px] float-right flex justify-center items-center gap-2 bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900 py-4 px-8 rounded-full font-bold transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isSubmitting ? (
                        <span className="material-symbols-rounded text-[1.4rem] animate-spin">sync</span>
                      ) : (
                        <span className="material-symbols-rounded text-[1.4rem]">add_circle</span>
                      )}
                      {isSubmitting ? 'Creating...' : 'Create Raag'}
                    </button>
                    <div className="clear-both"></div>
                  </div>

                </form>
              </div>
            </ReactLenis>
          </div>
        </div>
      )}
    </>
  );
}
