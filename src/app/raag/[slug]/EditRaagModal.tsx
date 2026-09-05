"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
      // Reset form if closed without saving
      setFormName(raag.name || "");
      setFormThaat(raag.thaat || "");
      setFormSamay(raag.samay || "");
      setFormVadi(raag.vadi || "");
      setFormSamvadi(raag.samvadi || "");
      setFormAaroh(raag.aaroh || "");
      setFormAvaroh(raag.avaroh || "");
      setFormDescription(raag.description || "");
      setAdminPasscode("");
    }, 300);
  };

  const handleFormSubmit = async (e: React.FormEvent, action: 'save' | 'delete' = 'save') => {
    e.preventDefault();

    if (adminPasscode !== "kalamanthan") {
      alert("Incorrect Admin Passcode!");
      return;
    }

    setIsSubmitting(true);

    if (action === 'delete') {
      try {
        const { error } = await supabase
          .from("raags")
          .delete()
          .eq("slug", raag.slug);
        
        if (error) throw error;
        
        // Redirect to home since this raag is gone
        router.push("/");
      } catch (error: any) {
        console.error("❌ SUPABASE ERROR:", error);
        alert(`Database Error: ${error.message || "Check console for details"}`);
        setIsSubmitting(false);
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
      const { error } = await supabase
        .from("raags")
        .update(payload)
        .eq("slug", raag.slug);

      if (error) throw error;

      // Close modal first
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
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
              
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-m3-error dark:text-m3-error-dark uppercase tracking-wider mb-2">
                    <span className="material-symbols-rounded text-[1.1rem]">lock</span> Admin Passcode
                  </label>
                  <input type="password" required placeholder="Enter the secret password to publish" value={adminPasscode} onChange={(e) => setAdminPasscode(e.target.value)} className="w-full bg-m3-error/10 dark:bg-m3-error-dark/10 text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-error dark:focus:ring-m3-error-dark transition-all duration-300 placeholder-m3-error/50 dark:placeholder-m3-error-dark/50" />
                </div>
                <div className="flex gap-3 w-full md:w-auto shrink-0">
                  <button 
                    type="button" 
                    onClick={(e) => {
                      if (confirm("Are you sure you want to delete this raag?")) {
                        handleFormSubmit(e as unknown as React.FormEvent, 'delete');
                      }
                    }}
                    disabled={isSubmitting} 
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-m3-error/10 hover:bg-m3-error/20 dark:bg-m3-error-dark/10 dark:hover:bg-m3-error-dark/20 text-m3-error dark:text-m3-error-dark px-6 py-4 rounded-[1.5rem] font-bold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <span className="material-symbols-rounded text-[1.4rem]">delete</span>
                    <span className="md:hidden lg:inline">Delete</span>
                  </button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-m3-primary hover:bg-m3-primary/90 dark:bg-m3-primary-dark dark:hover:bg-m3-primary-dark/90 text-white dark:text-gray-900 px-8 py-4 rounded-[1.5rem] font-bold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100">
                    <span className="material-symbols-rounded text-[1.4rem]">save</span>
                    <span className="whitespace-nowrap">{isSubmitting ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}

