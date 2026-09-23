"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { updateRaagSecurely, deleteRaagSecurely } from "@/app/actions";

export default function EditRaagModal({ raag }: { raag: any }) {
  const router = useRouter();

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Form State
  const [formName, setFormName] = useState(raag.name || "");
  const [formThaat, setFormThaat] = useState(raag.thaat || "");
  const [formSamay, setFormSamay] = useState(raag.samay || "");
  const [formVadi, setFormVadi] = useState(raag.vadi || "");
  const [formSamvadi, setFormSamvadi] = useState(raag.samvadi || "");
  const [formAaroh, setFormAaroh] = useState(raag.aaroh || "");
  const [formAvaroh, setFormAvaroh] = useState(raag.avaroh || "");
  const [formDescription, setFormDescription] = useState(raag.description || "");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const closeModal = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setToast(null);
      setConfirmDialog(false);
      // Reset form if closed without saving
      setFormName(raag.name || "");
      setFormThaat(raag.thaat || "");
      setFormSamay(raag.samay || "");
      setFormVadi(raag.vadi || "");
      setFormSamvadi(raag.samvadi || "");
      setFormAaroh(raag.aaroh || "");
      setFormAvaroh(raag.avaroh || "");
      setFormDescription(raag.description || "");
    }, 300);
  }, [raag]);

  // Lock Background Scrolling + Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (toast) {
          setToast(null);
        } else if (confirmDialog) {
          setConfirmDialog(false);
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
  }, [isOpen, toast, confirmDialog, closeModal]);

  const handleFormSubmit = async (e: React.FormEvent, action: 'save' | 'delete' = 'save') => {
    e.preventDefault();
    setIsSubmitting(true);
    setToast(null);

    if (action === 'delete') {
      try {
        const result = await deleteRaagSecurely(raag.slug);
        
        if (!result.success) {
          throw new Error(result.error);
        }
        
        // Redirect to home since this raag is gone
        router.push("/");
      } catch (error: any) {
        console.error("❌ SUPABASE ERROR:", error);
        setToast({ message: `Database Error: ${error.message || "Check console for details"}`, type: "error" });
        setIsSubmitting(false);
        setConfirmDialog(false);
      }
      return;
    }

    const payload = {
      name: formName,
      thaat: formThaat,
      samay: formSamay,
      vadi: formVadi,
      samvadi: formSamvadi,
      aaroh: formAaroh,
      avaroh: formAvaroh,
      description: formDescription,
    };

    try {
      const result = await updateRaagSecurely(raag.slug, payload);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Close modal first
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        
        // Refresh page to show new data
        router.refresh();
      }, 300);

    } catch (error: any) {
      console.error("❌ SUPABASE ERROR:", error);
      setToast({ message: `Database Error: ${error.message || "Check console for details"}`, type: "error" });
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = () => {
    handleFormSubmit({ preventDefault: () => {} } as React.FormEvent, 'delete');
  };

  return (
    <>
      {/* Edit Button */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="flex items-center justify-center p-2 bg-white dark:bg-m3-surface-dark hover:bg-gray-50 dark:hover:bg-m3-surface-container-dark text-m3-primary dark:text-m3-primary-dark rounded-full transition-all duration-200 hover:scale-105 active:scale-95 border border-gray-100 dark:border-gray-800" 
        title="Edit Raag"
      >
        <span className="material-symbols-rounded text-[1.4rem]">edit</span>
      </button>

      {/* Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 text-left" onClick={closeModal}>
          <div className={`absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-backdrop-exit' : 'animate-backdrop-enter'}`}></div>
          <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-m3-surface dark:bg-m3-surface-dark rounded-[2.5rem] p-8 md:p-12 border border-m3-surface-high dark:border-m3-surface-high-dark m3-scrollbar shadow-2xl ${isClosing ? 'animate-modal-exit' : 'animate-modal-enter'}`} onClick={(e) => e.stopPropagation()}>
            
            <div className="absolute top-6 right-6 md:top-8 md:right-8">
              <button onClick={closeModal} className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-gray-900 dark:text-white rounded-full transition-colors duration-200">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}>Edit Raag</h2>
              <p className="text-m3-secondary dark:text-m3-secondary-dark font-medium">Make corrections to <span className="font-bold">{raag.name}</span>.</p>
            </div>

            <form onSubmit={(e) => handleFormSubmit(e, 'save')} className="space-y-6 md:space-y-8">
              <div>
                <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Name</label>
                <input type="text" required placeholder="e.g. Yaman" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-m3-secondary dark:text-m3-secondary-dark uppercase tracking-wider mb-2">Thaat</label>
                  <input type="text" placeholder="e.g. Kalyan" value={formThaat} onChange={(e) => setFormThaat(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-secondary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-m3-secondary dark:text-m3-secondary-dark uppercase tracking-wider mb-2">Samay (Time)</label>
                  <input type="text" placeholder="e.g. Evening" value={formSamay} onChange={(e) => setFormSamay(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-secondary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-m3-tertiary dark:text-m3-tertiary-dark uppercase tracking-wider mb-2">Vadi</label>
                  <input type="text" placeholder="e.g. Ga" value={formVadi} onChange={(e) => setFormVadi(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-tertiary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-m3-tertiary dark:text-m3-tertiary-dark uppercase tracking-wider mb-2">Samvadi</label>
                  <input type="text" placeholder="e.g. Ni" value={formSamvadi} onChange={(e) => setFormSamvadi(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-tertiary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Aaroh</label>
                  <input type="text" placeholder="e.g. S R G M P D N S" value={formAaroh} onChange={(e) => setFormAaroh(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Avaroh</label>
                  <input type="text" placeholder="e.g. S N D P M G R S" value={formAvaroh} onChange={(e) => setFormAvaroh(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Description</label>
                <textarea placeholder="Description of the raag..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-5 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 min-h-[140px] resize-y m3-scrollbar" />
              </div>

              <hr className="border-gray-200 dark:border-m3-surface-high-dark my-2" />

              {/* Toast */}
              {toast && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${toast.type === "error" ? "bg-m3-error/10 dark:bg-m3-error-dark/10 text-m3-error dark:text-m3-error-dark border border-m3-error/20 dark:border-m3-error-dark/20" : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/50"}`}>
                  <span className="material-symbols-rounded text-[1.1rem]">{toast.type === "error" ? "error" : "check_circle"}</span>
                  <span className="flex-1">{toast.message}</span>
                  <button type="button" onClick={() => setToast(null)} className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors">
                    <span className="material-symbols-rounded text-[1rem]">close</span>
                  </button>
                </div>
              )}
              
              <div className="flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setConfirmDialog(true)}
                  disabled={isSubmitting} 
                  className="flex items-center justify-center gap-2 bg-m3-error/10 hover:bg-m3-error/20 dark:bg-m3-error-dark/10 dark:hover:bg-m3-error-dark/20 text-m3-error dark:text-m3-error-dark px-6 py-4 rounded-[1.5rem] font-bold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <span className="material-symbols-rounded text-[1.4rem]">delete</span>
                  Delete
                </button>
                <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 bg-m3-primary hover:bg-m3-primary/90 dark:bg-m3-primary-dark dark:hover:bg-m3-primary-dark/90 text-white dark:text-gray-900 px-8 py-4 rounded-[1.5rem] font-bold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100">
                  <span className="material-symbols-rounded text-[1.4rem]">save</span>
                  <span className="whitespace-nowrap">{isSubmitting ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Confirm Delete Dialog */}
          {confirmDialog && (
            <div className="absolute inset-0 z-[70] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm animate-backdrop-enter" onClick={() => setConfirmDialog(false)} />
              <div className="relative w-full max-w-sm bg-m3-surface dark:bg-m3-surface-dark rounded-[2rem] p-6 shadow-2xl animate-modal-enter border border-m3-surface-high dark:border-m3-surface-high-dark">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 bg-m3-error/10 dark:bg-m3-error-dark/10 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-rounded text-[2rem] text-m3-error dark:text-m3-error-dark">delete_forever</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete "{raag.name}"?</h3>
                  <p className="text-m3-secondary dark:text-m3-secondary-dark text-sm">
                    This will permanently delete the raag and all its associated data. This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDialog(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 rounded-full font-bold text-gray-700 dark:text-gray-300 bg-m3-surface-container dark:bg-m3-surface-container-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-high-dark transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 rounded-full font-bold text-white dark:text-gray-900 bg-m3-error dark:bg-m3-error-dark hover:bg-m3-error/90 dark:hover:bg-m3-error-dark/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
