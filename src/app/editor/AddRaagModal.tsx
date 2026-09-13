"use client";

import { useState, useEffect } from "react";
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
      setFormName("");
      setFormThaat("");
      setFormSamay("");
      setFormVadi("");
      setFormSamvadi("");
      setFormAaroh("");
      setFormAvaroh("");
      setFormDescription("");
      setAdminPasscode("");
    }, 300);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();



    if (!formName.trim()) {
      alert("Raag Name is required.");
      return;
    }

    setIsSubmitting(true);
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

      const result = await addRaagSecurely(payload, adminPasscode);
      if (!result.success) throw new Error(result.error);

      // Close modal first
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        setAdminPasscode("");
        
        // Navigate to new raag
        router.push(`/raag/${slug}`);
      }, 300);
      
    } catch (error: any) {
      console.error("❌ SUPABASE ERROR:", error);
      alert(`Database Error: ${error.message || "Check console for details"}`);
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

            {/* Footer with Passcode & Submit */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1A181E] rounded-b-3xl shrink-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 w-full">
                  <input 
                    type="password" 
                    placeholder="Admin Passcode"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    required
                    form="add-raag-form"
                    className="w-full sm:max-w-xs px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-m3-surface-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark"
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 sm:flex-none px-6 py-2.5 font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    form="add-raag-form"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-8 py-2.5 bg-m3-primary hover:bg-m3-primary/90 text-white rounded-xl font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
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
        </div>
      )}
    </>
  );
}

