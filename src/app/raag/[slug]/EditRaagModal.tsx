"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { updateRaagSecurely, deleteRaagSecurely, submitRaagEdit, getAllRaagMetadata, UserRole } from "@/app/actions";
import { useTheme } from "@/app/ThemeProvider";
import FormCombobox from "@/components/FormCombobox";

export default function EditRaagModal({ raag, userRole = "admin" }: { raag: any; userRole?: UserRole }) {
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
  const [formName, setFormName] = useState(raag.name || "");
  const [formThaat, setFormThaat] = useState(raag.thaat || "");
  const [formSamay, setFormSamay] = useState(raag.samay || "");
  const [formVadi, setFormVadi] = useState(raag.vadi || "");
  const [formSamvadi, setFormSamvadi] = useState(raag.samvadi || "");
  const [formAaroh, setFormAaroh] = useState(raag.aaroh || "");
  const [formAvaroh, setFormAvaroh] = useState(raag.avaroh || "");
  const [formDescription, setFormDescription] = useState(raag.description || "");
  const [formFurtherReading, setFormFurtherReading] = useState<{ title: string; url: string; source: string }[]>(
    Array.isArray(raag.further_reading) ? raag.further_reading : []
  );
  
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
  const [confirmDialog, setConfirmDialog] = useState(false);

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
      setFormFurtherReading(Array.isArray(raag.further_reading) ? raag.further_reading : []);
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
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, toast, confirmDialog, closeModal]);

  const handleFormSubmit = async (e: React.FormEvent, action: 'save' | 'delete' = 'save') => {
    e.preventDefault();
    setIsSubmitting(true);
    setToast(null);

    if (action === 'delete') {
      if (userRole !== "admin") {
        setToast({ message: "Only administrators can delete raags.", type: "error" });
        setIsSubmitting(false);
        return;
      }
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
      further_reading: formFurtherReading.filter((l) => l.url.trim() && l.title.trim()),
    };

    try {
      if (userRole === "contributor") {
        const result = await submitRaagEdit(raag.slug, payload, raag);
        if (!result.success) throw new Error(result.error);
        setToast({ message: "Suggested revisions submitted for administrator approval!", type: "success" });
        setIsSubmitting(false);
        setTimeout(() => {
          closeModal();
        }, 1500);
        return;
      }

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
        title={userRole === "contributor" ? "Suggest Edit to Raag" : "Edit Raag"}
      >
        <span className="material-symbols-rounded text-[1.4rem]">
          {userRole === "contributor" ? "edit_note" : "edit"}
        </span>
      </button>

      {/* Edit Modal */}
      {isOpen && mounted && createPortal(
        <div className={isDarkMode ? "dark" : ""}>
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 text-left" onClick={closeModal}>
            <div className={`absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-backdrop-exit' : 'animate-backdrop-enter'}`}></div>
            <div data-lenis-prevent="true" className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain bg-m3-surface dark:bg-m3-surface-dark rounded-[2.5rem] p-8 md:p-12 border border-m3-surface-high dark:border-m3-surface-high-dark m3-scrollbar ${isClosing ? 'animate-modal-exit' : 'animate-modal-enter'}`} onClick={(e) => e.stopPropagation()}>
              
              <div className="absolute top-6 right-6 md:top-8 md:right-8">
                <button onClick={closeModal} className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-gray-900 dark:text-white rounded-full transition-colors duration-200">
                  <span className="material-symbols-rounded">close</span>
                </button>
              </div>
              
              <div className="mb-8 pr-14 md:pr-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}>
                  {userRole === "contributor" ? "Suggest Edit to Raag" : "Edit Raag"}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {userRole === "contributor" 
                    ? "Propose revisions to musical scales, timings, or theoretical descriptions for review."
                    : "Update the canonical details, performance timings, or scale rules for this raag."}
                </p>
                {userRole === "contributor" && (
                  <div className="mt-3 p-3 rounded-2xl bg-m3-tertiary/10 dark:bg-m3-tertiary-dark/15 border border-m3-tertiary/20 flex items-center gap-2 text-xs font-semibold text-m3-tertiary dark:text-m3-tertiary-dark">
                    <span className="material-symbols-rounded text-base">verified</span>
                    <span>Community Suggestion: Modifications are queued for Admin verification.</span>
                  </div>
                )}
              </div>

              <form onSubmit={(e) => handleFormSubmit(e, 'save')} className="space-y-6">
                
                <div>
                  <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Raag Name (Required)</label>
                  <input 
                    type="text" 
                    required 
                    value={formName} 
                    onChange={(e) => setFormName(e.target.value)} 
                    className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 font-bold" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Avaroh</label>
                  <input 
                    type="text" 
                    value={formAvaroh} 
                    onChange={(e) => setFormAvaroh(e.target.value)} 
                    className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Description</label>
                  <textarea 
                    value={formDescription} 
                    onChange={(e) => setFormDescription(e.target.value)} 
                    rows={4} 
                    className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 resize-y m3-scrollbar" 
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
                          key={`link-input-${idx}`}
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

                {toast && (
                  <div className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 ${
                    toast.type === 'error'
                      ? 'bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800 text-red-900 dark:text-red-300'
                      : 'bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-800 text-green-900 dark:text-green-300'
                  }`}>
                    <span className="material-symbols-rounded">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
                    <span>{toast.message}</span>
                  </div>
                )}

                <hr className="border-gray-200 dark:border-m3-surface-high-dark my-4" />

                <div className="flex justify-between items-center">
                  {userRole === "admin" ? (
                    <button 
                      type="button" 
                      onClick={() => setConfirmDialog(true)} 
                      disabled={isSubmitting} 
                      className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 dark:bg-red-500/15 dark:hover:bg-red-500/25 text-red-600 dark:text-red-400 px-6 py-4 rounded-[1.5rem] font-bold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <span className="material-symbols-rounded text-[1.4rem]">delete</span>
                      Delete
                    </button>
                  ) : <div />}
                  
                  <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 bg-m3-primary hover:bg-m3-primary/90 dark:bg-m3-primary-dark dark:hover:bg-m3-primary-dark/90 text-white dark:text-gray-900 px-8 py-4 rounded-[1.5rem] font-bold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100">
                    <span className="material-symbols-rounded text-[1.4rem]">
                      {userRole === "contributor" ? "send" : "save"}
                    </span>
                    <span className="whitespace-nowrap">
                      {isSubmitting 
                        ? "Saving..." 
                        : userRole === "contributor" 
                        ? "Submit for Approval" 
                        : "Save Changes"}
                    </span>
                  </button>
                </div>

              </form>
            </div>

            {/* Confirm Delete Dialog */}
            {confirmDialog && (
              <div className="absolute inset-0 z-[70] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm animate-backdrop-enter" onClick={() => setConfirmDialog(false)} />
                <div className="relative w-full max-w-sm bg-m3-surface dark:bg-m3-surface-dark rounded-[2rem] p-6 animate-modal-enter border border-m3-surface-high dark:border-m3-surface-high-dark">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-red-500/10 dark:bg-red-500/15 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-rounded text-[2rem] text-red-600 dark:text-red-400">delete_forever</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete "{raag.name}"?</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
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
                      className="flex-1 px-4 py-3 rounded-full font-bold text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
