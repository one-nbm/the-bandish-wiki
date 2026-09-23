"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { addRaagSecurely } from "@/app/actions";

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
      // 1. Manually calculate the next sequential ID for the raags table
      const { data: existingRaags, error: fetchError } = await supabase
        .from("raags")
        .select("id");
        
      if (fetchError) throw fetchError;

      // Look at all existing IDs, convert them to numbers, and find the highest one
      const currentIds = (existingRaags || []).map(r => parseInt(r.id, 10)).filter(n => !isNaN(n));
      const maxId = currentIds.length > 0 ? Math.max(...currentIds) : 0;
      
      // Add 1, and pad it with leading zeros to maintain the "0001" format
      const nextId = String(maxId + 1).padStart(4, '0');

      const payload = {
        id: nextId,
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
        className="w-full sm:w-auto px-6 py-4 bg-m3-surface-high dark:bg-m3-surface-high-dark hover:bg-m3-primary/10 dark:hover:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark rounded-2xl font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-700"
      >
        <span className="material-symbols-rounded text-2xl">add_circle</span>
        Add New Raag
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'animate-backdrop-enter'}`}
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div 
            className={`relative w-full max-w-4xl bg-m3-surface dark:bg-m3-surface-dark rounded-3xl shadow-2xl flex flex-col max-h-[90vh] transition-all duration-300 origin-center ${isClosing ? 'opacity-0 scale-95' : 'animate-modal-enter'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-3">
                <span className="material-symbols-rounded text-m3-primary dark:text-m3-primary-dark text-2xl">library_add</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Raag</h3>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto p-6 custom-scrollbar">
              <form id="add-raag-form" onSubmit={handleFormSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Raag Name *</label>
                      <input 
                        type="text" 
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-m3-surface-container-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark"
                        placeholder="e.g. Yaman"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Thaat</label>
                      <input 
                        type="text" 
                        value={formThaat}
                        onChange={(e) => setFormThaat(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-m3-surface-container-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark"
                        placeholder="e.g. Kalyan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Samay (Time)</label>
                      <input 
                        type="text" 
                        value={formSamay}
                        onChange={(e) => setFormSamay(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-m3-surface-container-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark"
                        placeholder="e.g. Evening (First quarter of night)"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Vadi</label>
                        <input 
                          type="text" 
                          value={formVadi}
                          onChange={(e) => setFormVadi(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-m3-surface-container-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark"
                          placeholder="e.g. Ga"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Samvadi</label>
                        <input 
                          type="text" 
                          value={formSamvadi}
                          onChange={(e) => setFormSamvadi(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-m3-surface-container-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark"
                          placeholder="e.g. Ni"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Aaroh</label>
                      <input 
                        type="text" 
                        value={formAaroh}
                        onChange={(e) => setFormAaroh(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-m3-surface-container-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark font-mono text-sm"
                        placeholder="e.g. S R G M P D N S'"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Avaroh</label>
                      <input 
                        type="text" 
                        value={formAvaroh}
                        onChange={(e) => setFormAvaroh(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-m3-surface-container-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark font-mono text-sm"
                        placeholder="e.g. S' N D P M G R S"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea 
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-m3-surface-container-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark resize-y custom-scrollbar"
                    placeholder="General description, mood, rules, or historical context..."
                  />
                </div>

              </form>
            </div>

            {/* Footer with Submit */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1A181E] rounded-b-3xl shrink-0">
              {/* Toast inside footer */}
              {toast && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-3 text-sm font-bold ${toast.type === "error" ? "bg-m3-error/10 dark:bg-m3-error-dark/10 text-m3-error dark:text-m3-error-dark border border-m3-error/20 dark:border-m3-error-dark/20" : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/50"}`}>
                  <span className="material-symbols-rounded text-[1.1rem]">{toast.type === "error" ? "error" : "check_circle"}</span>
                  <span className="flex-1">{toast.message}</span>
                  <button onClick={() => setToast(null)} className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors">
                    <span className="material-symbols-rounded text-[1rem]">close</span>
                  </button>
                </div>
              )}
              <div className="flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="add-raag-form"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-m3-primary hover:bg-m3-primary/90 text-white rounded-xl font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-rounded animate-spin text-[1.2rem]">sync</span>
                  ) : (
                    <span className="material-symbols-rounded text-[1.2rem]">add_circle</span>
                  )}
                  {isSubmitting ? 'Creating...' : 'Create Raag'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
