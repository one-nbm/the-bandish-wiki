"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { addRaagSecurely, submitRaagContribution, getAllRaagMetadata, UserRole } from "@/app/actions";
import { useTheme } from "@/app/ThemeProvider";
import { ReactLenis } from 'lenis/react';
import { LENIS_OPTIONS } from '@/components/SmoothScrolling';
import FormCombobox from "@/components/FormCombobox";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function AddRaagModal({ contributorName, userRole = "admin" }: { contributorName: string; userRole?: UserRole }) {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const [formFurtherReading, setFormFurtherReading] = useState<{ title: string; url: string; source: string }[]>([]);

  const handleAddLink = () => {
    setFormFurtherReading((prev) => [...prev, { title: "", url: "", source: "Tanarang" }]);
  };

  const handleUpdateLink = (index: number, field: "title" | "url" | "source", value: string) => {
    setFormFurtherReading((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveLink = (index: number) => {
    setFormFurtherReading((prev) => prev.filter((_, i) => i !== index));
  };
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

  const [metadata, setMetadata] = useState<{
    thaats: string[];
    samays: string[];
    vadis: string[];
    samvadis: string[];
  }>({
    thaats: ["Asawari", "Bhairav", "Bhairavi", "Bilawal", "Kafi", "Kalyan", "Khamaj", "Marwa", "Purvi", "Todi"],
    samays: ["Morning (6 AM – 9 AM)", "Late Morning (9 AM – 12 PM)", "Afternoon (12 PM – 3 PM)", "Late Afternoon (3 PM – 6 PM)", "Evening (6 PM – 9 PM)", "Night (9 PM – 12 AM)", "Late Night (12 AM – 3 AM)", "Pre-Dawn (3 AM – 6 AM)", "Any Time"],
    vadis: ["Sa", "Shadja (S)", "Re", "Rishabh (R)", "Komal Rishabh (r)", "Ga", "Gandhar (G)", "Gandhar (Ga)", "Komal Gandhar (g)", "Ma", "Madhyam (M)", "Teevra Madhyam (m)", "Pa", "Pancham (P)", "Dha", "Dhaivat (D)", "Komal Dhaivat (d)", "Ni", "Nishad (N)", "Komal Nishad (n)"],
    samvadis: ["Sa", "Shadja (S)", "Re", "Rishabh (R)", "Komal Rishabh (r)", "Ga", "Gandhar (G)", "Gandhar (Ga)", "Komal Gandhar (g)", "Ma", "Madhyam (M)", "Teevra Madhyam (m)", "Pa", "Pancham (P)", "Dha", "Dhaivat (D)", "Komal Dhaivat (d)", "Ni", "Nishad (N)", "Komal Nishad (n)"],
  });

  useEffect(() => {
    if (isOpen) {
      getAllRaagMetadata().then(res => {
        if (res.success && res.data) setMetadata(res.data);
      });
    }
  }, [isOpen]);

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
      setFormFurtherReading([]);
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
        further_reading: formFurtherReading.filter((l) => l.url.trim() && l.title.trim()),
        contributor: contributorName,
      };

      if (userRole === "contributor") {
        const result = await submitRaagContribution(payload);
        if (!result.success) throw new Error(result.error);
        setToast({ message: "Raag submitted for Admin approval! You can track its review status in your dashboard.", type: "success" });
        setIsSubmitting(false);
        setTimeout(() => {
          closeModal();
          router.refresh();
        }, 1500);
        return;
      }

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
      {isOpen && mounted && createPortal(
        <div className={isDarkMode ? "dark" : ""}>
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" onClick={closeModal}>
          {/* Backdrop */}
          <div className={`absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-backdrop-exit' : 'animate-backdrop-enter'}`}></div>
          
          {/* Modal Content */}
          <div className={`relative w-full max-w-3xl max-h-[90vh] bg-m3-surface dark:bg-m3-surface-dark rounded-[2.5rem] border border-m3-surface-high dark:border-m3-surface-high-dark overflow-hidden flex flex-col transition-all duration-300 ease-out ${isClosing ? 'animate-modal-exit scale-95' : 'animate-modal-enter scale-100'}`} onClick={(e) => e.stopPropagation()}>
            <ReactLenis 
              options={LENIS_OPTIONS} 
              data-lenis-prevent="true"
              className="w-full max-h-[90vh] overflow-y-auto m3-scrollbar overscroll-contain"
              onWheel={(e: React.WheelEvent) => e.stopPropagation()}
              onTouchMove={(e: React.TouchEvent) => e.stopPropagation()}
            >
              <div className="p-8 md:p-12">
                <div className="absolute top-6 right-6 md:top-8 md:right-8 z-10">
                  <button onClick={closeModal} className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-gray-900 dark:text-white rounded-full transition-colors duration-200">
                    <span className="material-symbols-rounded">close</span>
                  </button>
                </div>
                
                <div className="mb-8 pr-14 md:pr-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}>Add New Raag</h2>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Contribute to the Raag database.</p>
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
                          className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 font-bold"
                          placeholder="e.g. Yaman"
                        />
                      </div>
                      
                      <FormCombobox
                        label="Thaat"
                        value={formThaat}
                        onChange={setFormThaat}
                        suggestions={metadata.thaats}
                        placeholder="e.g. Kalyan"
                        labelColor="text-m3-primary dark:text-m3-primary-dark"
                        focusRingColor="focus:ring-m3-primary dark:focus:ring-m3-primary-dark"
                        inputClassName="bg-m3-surface-container dark:bg-m3-surface-container-dark"
                        quickPills={["Bilawal", "Kalyan", "Khamaj", "Kafi", "Asawari", "Bhairav", "Bhairavi", "Todi", "Purvi", "Marwa"]}
                      />

                      <FormCombobox
                        label="Samay (Time)"
                        value={formSamay}
                        onChange={setFormSamay}
                        suggestions={metadata.samays}
                        placeholder="e.g. Evening (6 PM – 9 PM)"
                        labelColor="text-m3-primary dark:text-m3-primary-dark"
                        focusRingColor="focus:ring-m3-primary dark:focus:ring-m3-primary-dark"
                        inputClassName="bg-m3-surface-container dark:bg-m3-surface-container-dark"
                        quickPills={[
                          { label: "Morning", value: "Morning (6 AM – 9 AM)" },
                          { label: "Afternoon", value: "Afternoon (12 PM – 3 PM)" },
                          { label: "Evening", value: "Evening (6 PM – 9 PM)" },
                          { label: "Night", value: "Night (9 PM – 12 AM)" },
                          { label: "Late Night", value: "Late Night (12 AM – 3 AM)" },
                        ]}
                      />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <FormCombobox
                          label="Vadi"
                          value={formVadi}
                          onChange={setFormVadi}
                          suggestions={metadata.vadis}
                          placeholder="e.g. Ga"
                          labelColor="text-m3-primary dark:text-m3-primary-dark"
                          focusRingColor="focus:ring-m3-primary dark:focus:ring-m3-primary-dark"
                          inputClassName="bg-m3-surface-container dark:bg-m3-surface-container-dark"
                          quickPills={["Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni"]}
                        />
                        <FormCombobox
                          label="Samvadi"
                          value={formSamvadi}
                          onChange={setFormSamvadi}
                          suggestions={metadata.samvadis}
                          placeholder="e.g. Ni"
                          labelColor="text-m3-primary dark:text-m3-primary-dark"
                          focusRingColor="focus:ring-m3-primary dark:focus:ring-m3-primary-dark"
                          inputClassName="bg-m3-surface-container dark:bg-m3-surface-container-dark"
                          quickPills={["Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni"]}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Aaroh</label>
                        <input 
                          type="text" 
                          value={formAaroh}
                          onChange={(e) => setFormAaroh(e.target.value)}
                          className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm"
                          placeholder="e.g. S R G M P D N S'"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Avaroh</label>
                        <input 
                          type="text" 
                          value={formAvaroh}
                          onChange={(e) => setFormAvaroh(e.target.value)}
                          className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm"
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
                      className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 resize-y m3-scrollbar"
                      placeholder="General description, mood, rules, or historical context..."
                      data-lenis-prevent="true"
                      onWheel={(e: React.WheelEvent) => e.stopPropagation()}
                      onTouchMove={(e: React.TouchEvent) => e.stopPropagation()}
                    />
                  </div>

                  {/* Further Reading Links Section */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider">
                          Further Reading Links
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Authoritative links to Tanarang, Parrikar.org, AUTRIM, SwarGanga, or classical treatises.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddLink}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-m3-primary/10 hover:bg-m3-primary/20 text-m3-primary dark:text-m3-primary-dark transition-colors"
                      >
                        <span className="material-symbols-rounded text-sm">add</span>
                        Add Link
                      </button>
                    </div>

                    {formFurtherReading.length === 0 ? (
                      <div className="p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-center text-xs text-gray-400">
                        No further reading links added. Click &quot;Add Link&quot; above to add scholarly references.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formFurtherReading.map((link, idx) => (
                          <div
                            key={`add-link-input-${idx}`}
                            className="p-4 rounded-2xl bg-m3-surface-container dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                Link #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveLink(idx)}
                                className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-bold flex items-center gap-1 transition-colors"
                              >
                                <span className="material-symbols-rounded text-sm">delete</span>
                                Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[0.7rem] font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">
                                  Source / Publisher
                                </label>
                                <input
                                  type="text"
                                  value={link.source}
                                  onChange={(e) => handleUpdateLink(idx, "source", e.target.value)}
                                  placeholder="e.g. Tanarang, Parrikar.org"
                                  className="w-full bg-white dark:bg-m3-surface-dark text-gray-900 dark:text-white px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-m3-primary"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-[0.7rem] font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">
                                  Link Title
                                </label>
                                <input
                                  type="text"
                                  value={link.title}
                                  onChange={(e) => handleUpdateLink(idx, "title", e.target.value)}
                                  placeholder="e.g. Raag Yaman - Tanarang Music"
                                  className="w-full bg-white dark:bg-m3-surface-dark text-gray-900 dark:text-white px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-m3-primary"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[0.7rem] font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">
                                URL (https://...)
                              </label>
                              <input
                                type="url"
                                value={link.url}
                                onChange={(e) => handleUpdateLink(idx, "url", e.target.value)}
                                placeholder="https://tanarang.com/..."
                                className="w-full bg-white dark:bg-m3-surface-dark text-gray-900 dark:text-white px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-m3-primary"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Toast Message */}
                  {toast && (
                    <div className={`mt-6 px-6 py-4 rounded-xl font-bold flex items-center gap-3 border ${
                      toast.type === 'error'
                        ? 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-300 border-red-300 dark:border-red-800'
                        : 'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-300 border-green-300 dark:border-green-800'
                    } animate-modal-enter`}>
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
                        <span className="material-symbols-rounded text-[1.4rem]">{userRole === "contributor" ? "send" : "add_circle"}</span>
                      )}
                      {isSubmitting ? 'Submitting...' : userRole === 'contributor' ? 'Submit for Approval' : 'Create Raag'}
                    </button>
                    <div className="clear-both"></div>
                  </div>

                </form>
              </div>
            </ReactLenis>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
