"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/app/ThemeProvider";
import FormCombobox from "@/components/FormCombobox";
import {
  UserRole,
  addBandishSecurely,
  updateBandishSecurely,
  deleteBandishSecurely,
  submitBandishContribution,
  submitBandishEdit
} from "@/app/actions";

interface BandishFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  bandish?: any;
  userRole: UserRole;
  contributorName: string;
  allRaags: string[];
  allTaals: string[];
  allLays: string[];
  maxExistingId?: number;
  onClose: () => void;
  onSuccess: (action: "add" | "edit" | "delete", data?: any, id?: string) => void;
}

export default function BandishFormModal({
  isOpen,
  isEdit,
  bandish,
  userRole,
  contributorName,
  allRaags,
  allTaals,
  allLays,
  maxExistingId = 0,
  onClose,
  onSuccess,
}: BandishFormModalProps) {
  const { isDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Self-contained Form States: Completely decoupled from parent page re-renders!
  const [formTitle, setFormTitle] = useState("");
  const [formRaag, setFormRaag] = useState("");
  const [formTaal, setFormTaal] = useState("");
  const [formLay, setFormLay] = useState("");
  const [formComposer, setFormComposer] = useState("");
  const [formTradition, setFormTradition] = useState("");
  const [formEnglish, setFormEnglish] = useState("");
  const [formDevanagari, setFormDevanagari] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize form values whenever opening or changing target bandish
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setToast(null);
      setShowConfirmDelete(false);

      if (isEdit && bandish) {
        setFormTitle(bandish.title || "");
        setFormRaag(bandish.raag || "");
        setFormTaal(bandish.taal || "");
        setFormLay(Array.isArray(bandish.lay) ? bandish.lay.join(", ") : bandish.lay || "");
        setFormComposer(bandish.composer || "");
        setFormTradition(bandish.tradition || "");
        setFormEnglish(bandish.lyrics?.english || "");
        setFormDevanagari(bandish.lyrics?.devanagari || "");
      } else {
        setFormTitle("");
        setFormRaag("");
        setFormTaal("");
        setFormLay("");
        setFormComposer("");
        setFormTradition("");
        setFormEnglish("");
        setFormDevanagari("");
      }
    }
  }, [isOpen, isEdit, bandish]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 280);
  }, [onClose]);

  // Handle escape key and lock body scrolling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (toast) {
          setToast(null);
        } else if (showConfirmDelete) {
          setShowConfirmDelete(false);
        } else {
          handleClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    };
  }, [isOpen, toast, showConfirmDelete, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim() || !formRaag.trim() || !formTaal.trim() || !formComposer.trim() || !formEnglish.trim()) {
      setToast({ message: "Please fill in all required fields.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setToast(null);

    const payload: any = {
      title: formTitle.trim(),
      raag: formRaag.trim(),
      taal: formTaal.trim(),
      lay: formLay.split(",").map((s) => s.trim()).filter(Boolean),
      composer: formComposer.trim(),
      tradition: formTradition.trim() || null,
      lyrics: {
        english: formEnglish.trim(),
        devanagari: formDevanagari.trim() || "",
      },
      contributor: contributorName,
    };

    try {
      // Contributor Flow: Submits to approval queue
      if (userRole === "contributor") {
        if (isEdit && bandish) {
          const result = await submitBandishEdit(bandish.id, payload, bandish);
          if (!result.success) throw new Error(result.error);
          onSuccess("edit", payload, bandish.id);
          handleClose();
        } else {
          const result = await submitBandishContribution(payload);
          if (!result.success) throw new Error(result.error);
          onSuccess("add", payload);
          handleClose();
        }
        return;
      }

      // Admin Flow: Direct publish/update
      if (isEdit && bandish) {
        const result = await updateBandishSecurely(bandish.id, payload);
        if (!result.success) throw new Error(result.error);
        const updated = (result.data && result.data[0]) ? result.data[0] : { ...bandish, ...payload };
        onSuccess("edit", updated, bandish.id);
        handleClose();
      } else {
        const nextId = String(maxExistingId + 1).padStart(4, "0");
        payload.id = nextId;
        const result = await addBandishSecurely(payload);
        if (!result.success) throw new Error(result.error);
        const created = (result.data && result.data[0]) ? result.data[0] : payload;
        onSuccess("add", created);
        handleClose();
      }
    } catch (err: any) {
      console.error("❌ Submission error:", err);
      setToast({ message: err.message || "Failed to submit composition", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!bandish?.id || userRole !== "admin") return;
    setIsSubmitting(true);
    setToast(null);
    try {
      const result = await deleteBandishSecurely(bandish.id);
      if (!result.success) throw new Error(result.error);
      onSuccess("delete", null, bandish.id);
      handleClose();
    } catch (err: any) {
      console.error("❌ Delete error:", err);
      setToast({ message: err.message || "Failed to delete bandish", type: "error" });
    } finally {
      setIsSubmitting(false);
      setShowConfirmDelete(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className={isDarkMode ? "dark" : ""}>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 text-left"
        onClick={handleClose}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm ${
            isClosing ? "animate-backdrop-exit" : "animate-backdrop-enter"
          }`}
        />

        {/* Modal Window with High-Performance Native Scroll */}
        <div
          data-lenis-prevent="true"
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-m3-surface-container-dark rounded-[2.5rem] border border-gray-100 dark:border-m3-surface-high-dark overflow-y-auto m3-scrollbar overscroll-contain transition-transform duration-300 ease-out ${
            isClosing ? "animate-modal-exit scale-95" : "animate-modal-enter scale-100"
          }`}
        >
          <div className="p-8 md:p-12 relative">
            {/* Close Button */}
            <div className="absolute top-6 right-6 md:top-8 md:right-8">
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center justify-center p-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-gray-900 dark:text-white rounded-full transition-colors duration-200"
                aria-label="Close modal"
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            {/* Header */}
            <div className="mb-8 pr-12">
              <h2
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2"
                style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}
              >
                {isEdit
                  ? "Edit Bandish"
                  : userRole === "contributor"
                  ? "Contribute Bandish"
                  : "Add New Bandish"}
              </h2>
              <p className="text-m3-secondary dark:text-m3-secondary-dark font-medium text-sm sm:text-base">
                {isEdit ? (
                  <>
                    Make corrections to <span className="font-bold">{bandish?.title}</span>.
                  </>
                ) : userRole === "contributor" ? (
                  "Submit a new composition for administrator verification."
                ) : (
                  "Contribute to the Wiki database."
                )}
              </p>
            </div>

            {/* Form */}
            <form noValidate onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">
                  Title
                </label>
                <input
                  type="text"
                  autoFocus={!isEdit}
                  required
                  placeholder="e.g. Hori Khelan Ko"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-m3-surface-container dark:bg-m3-surface-high-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Comboboxes & Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormCombobox
                  label="Raag"
                  value={formRaag}
                  onChange={setFormRaag}
                  suggestions={allRaags}
                  placeholder="e.g. Des"
                  required
                  quickPills={["Yaman", "Bhairav", "Bageshri", "Bhoopali", "Darbari", "Kafi"]}
                />
                <FormCombobox
                  label="Taal"
                  value={formTaal}
                  onChange={setFormTaal}
                  suggestions={allTaals}
                  placeholder="e.g. Tintal"
                  required
                  quickPills={["Tintal", "Ektaal", "Jhaptal", "Rupak", "Keherwa", "Dadra"]}
                />
                <FormCombobox
                  label="Lay (Comma Separated)"
                  value={formLay}
                  onChange={setFormLay}
                  suggestions={allLays}
                  placeholder="e.g. Vilambit, Drut"
                  isMulti
                  quickPills={["Vilambit", "Madhya", "Drut", "Ati Drut"]}
                />
                <div>
                  <label className="block text-xs font-bold text-m3-tertiary dark:text-m3-tertiary-dark uppercase tracking-wider mb-2">
                    Composer
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Traditional"
                    value={formComposer}
                    onChange={(e) => setFormComposer(e.target.value)}
                    className="w-full bg-m3-surface-container dark:bg-m3-surface-high-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-tertiary transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Gharana / Tradition
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Agra, Gwalior"
                    value={formTradition}
                    onChange={(e) => setFormTradition(e.target.value)}
                    className="w-full bg-m3-surface-container dark:bg-m3-surface-high-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Transliteration */}
              <div>
                <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">
                  English Transliteration (Required)
                </label>
                <textarea
                  required
                  placeholder="Enter the phonetic lyrics here..."
                  value={formEnglish}
                  onChange={(e) => setFormEnglish(e.target.value)}
                  className="w-full bg-m3-surface-container dark:bg-m3-surface-high-dark text-gray-900 dark:text-white px-6 py-5 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400 min-h-[140px] resize-y m3-scrollbar leading-relaxed"
                  data-lenis-prevent="true"
                  onWheel={(e: React.WheelEvent) => e.stopPropagation()}
                  onTouchMove={(e: React.TouchEvent) => e.stopPropagation()}
                />
              </div>

              {/* Devanagari */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Devanagari Script (Optional)
                </label>
                <textarea
                  placeholder="होली खेलन को चले कन्हैयाँ..."
                  value={formDevanagari}
                  onChange={(e) => setFormDevanagari(e.target.value)}
                  className="w-full bg-m3-surface-container dark:bg-m3-surface-high-dark text-gray-900 dark:text-white px-6 py-5 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400 min-h-[120px] resize-y m3-scrollbar leading-relaxed"
                  data-lenis-prevent="true"
                  onWheel={(e: React.WheelEvent) => e.stopPropagation()}
                  onTouchMove={(e: React.TouchEvent) => e.stopPropagation()}
                />
              </div>

              <hr className="border-gray-200 dark:border-m3-surface-high-dark my-2" />

              {/* Role Status Notice */}
              <div className="flex flex-col md:flex-row gap-6 items-end">
                {userRole === "admin" ? (
                  <div className="w-full p-4 rounded-2xl bg-m3-primary/10 dark:bg-m3-primary-dark/15 border border-m3-primary/20 flex items-center gap-3 text-xs sm:text-sm text-m3-primary dark:text-m3-primary-dark font-medium">
                    <span className="material-symbols-rounded text-xl shrink-0">admin_panel_settings</span>
                    <span>
                      <strong>Administrator Mode:</strong> Changes will be published directly to the live database.
                    </span>
                  </div>
                ) : (
                  <div className="w-full p-4 rounded-2xl bg-m3-tertiary/10 dark:bg-m3-tertiary-dark/15 border border-m3-tertiary/20 flex items-center gap-3 text-xs sm:text-sm text-m3-tertiary dark:text-m3-tertiary-dark font-medium">
                    <span className="material-symbols-rounded text-xl shrink-0">verified</span>
                    <span>
                      <strong>Community Contribution:</strong> Your submission will be reviewed by an administrator before appearing live on the wiki.
                    </span>
                  </div>
                )}

                {/* Submit / Delete Buttons */}
                <div className="flex gap-3 w-full md:w-auto shrink-0">
                  {isEdit && userRole === "admin" && (
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(true)}
                      disabled={isSubmitting}
                      className="px-6 py-4 rounded-[1.5rem] font-bold text-m3-error dark:text-m3-error-dark bg-m3-error/10 hover:bg-m3-error/20 dark:bg-m3-error-dark/10 dark:hover:bg-m3-error-dark/20 transition-transform active:scale-95 duration-200 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-m3-primary hover:bg-m3-primary/90 dark:bg-m3-primary-dark dark:hover:bg-m3-primary-dark/90 text-white dark:text-gray-900 px-8 py-4 rounded-[1.5rem] font-bold transition-transform duration-200 active:scale-95 disabled:opacity-50"
                  >
                    <span className="material-symbols-rounded text-[1.4rem]">
                      {userRole === "contributor" ? "send" : isEdit ? "save" : "publish"}
                    </span>
                    <span className="whitespace-nowrap">
                      {isSubmitting
                        ? isEdit
                          ? "Saving..."
                          : "Publishing..."
                        : userRole === "contributor"
                        ? "Submit for Approval"
                        : isEdit
                        ? "Save Changes"
                        : "Publish"}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Delete Confirmation Dialog Overlay */}
          {showConfirmDelete && (
            <div
              className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm animate-backdrop-enter"
              onClick={() => setShowConfirmDelete(false)}
            >
              <div
                className="relative w-full max-w-sm bg-white dark:bg-m3-surface-dark rounded-[2rem] p-6 border border-m3-surface-high dark:border-m3-surface-high-dark animate-modal-enter text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-14 h-14 bg-m3-error/10 dark:bg-m3-error-dark/10 text-m3-error dark:text-m3-error-dark rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-rounded text-3xl">delete_forever</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Bandish?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Are you sure you want to permanently delete <strong>{bandish?.title}</strong>? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="flex-1 py-3 rounded-full font-bold border border-m3-surface-high dark:border-m3-surface-high-dark text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-full font-bold bg-m3-error text-white hover:bg-m3-error/90 transition-transform active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toast && (
            <div
              className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4 rounded-full font-bold border border-white/20 animate-toast-slide-up z-[70] ${
                toast.type === "error"
                  ? "bg-m3-error dark:bg-m3-error-dark text-white"
                  : "bg-green-600 dark:bg-green-500 text-white"
              }`}
            >
              <span className="material-symbols-rounded text-[1.4rem]">
                {toast.type === "error" ? "error" : "check_circle"}
              </span>
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="ml-2 flex items-center justify-center p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close notification"
              >
                <span className="material-symbols-rounded text-[1.2rem]">close</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
