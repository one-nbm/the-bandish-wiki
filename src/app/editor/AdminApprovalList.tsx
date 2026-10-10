"use client";

import React, { useState } from "react";
import { approveContribution, denyContribution } from "@/app/actions";

interface AdminApprovalListProps {
  initialPending: any[];
  onActionComplete?: () => void;
}

export default function AdminApprovalList({ initialPending, onActionComplete }: AdminApprovalListProps) {
  const [pendingList, setPendingList] = useState<any[]>(initialPending);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    setFeedbackMessage(null);
    try {
      const res = await approveContribution(id);
      if (res.success) {
        setPendingList((prev) => prev.filter((item) => item.id !== id));
        setSelectedItem(null);
        setFeedbackMessage({ text: "Contribution approved and published live!", type: "success" });
        if (onActionComplete) onActionComplete();
      } else {
        setFeedbackMessage({ text: res.error || "Failed to approve contribution.", type: "error" });
      }
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || "An unexpected error occurred.", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = async (id: string) => {
    setIsProcessing(true);
    setFeedbackMessage(null);
    try {
      const res = await denyContribution(id, rejectReason);
      if (res.success) {
        setPendingList((prev) => prev.filter((item) => item.id !== id));
        setSelectedItem(null);
        setShowRejectInput(false);
        setRejectReason("");
        setFeedbackMessage({ text: "Contribution has been rejected.", type: "success" });
        if (onActionComplete) onActionComplete();
      } else {
        setFeedbackMessage({ text: res.error || "Failed to reject contribution.", type: "error" });
      }
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || "An unexpected error occurred.", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "new_bandish":
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-m3-primary/10 text-m3-primary dark:bg-m3-primary-dark/20 dark:text-m3-primary-dark">New Bandish</span>;
      case "edit_bandish":
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-m3-tertiary/10 text-m3-tertiary dark:bg-m3-tertiary-dark/20 dark:text-m3-tertiary-dark">Edit Bandish</span>;
      case "new_raag":
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-m3-secondary/10 text-m3-secondary dark:bg-m3-secondary-dark/20 dark:text-m3-secondary-dark">New Raag</span>;
      case "edit_raag":
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-m3-secondary/10 text-m3-secondary dark:bg-m3-secondary-dark/20 dark:text-m3-secondary-dark">Edit Raag</span>;
      case "new_rendition":
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">New Rendition</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{type}</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark rounded-[2.5rem] p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-rounded text-2xl sm:text-3xl text-m3-primary dark:text-m3-primary-dark">
              verified_user
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white" style={{ fontVariationSettings: '"wdth" 120' }}>
              Pending Community Contributions
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-m3-primary/10 text-m3-primary dark:bg-m3-primary-dark/20 dark:text-m3-primary-dark border border-m3-primary/20 dark:border-m3-primary-dark/20">
              {pendingList.length} Pending
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review, diff, and publish submissions from community contributors.
          </p>
        </div>
      </div>

      {feedbackMessage && (
        <div className={`mb-6 p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 ${
          feedbackMessage.type === "success" 
            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
            : "bg-m3-error/10 border-m3-error/20 text-m3-error dark:text-m3-error-dark"
        }`}>
          <span className="material-symbols-rounded text-lg">
            {feedbackMessage.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* List or Empty State */}
      {pendingList.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-gray-200 dark:border-m3-surface-high-dark rounded-2xl">
          <span className="material-symbols-rounded text-4xl text-gray-400 dark:text-gray-500 mb-2 block">
            task_alt
          </span>
          <p className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300">
            All caught up! No pending contributions.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            New submissions from contributors will appear here automatically for review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingList.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-m3-surface-high-dark bg-m3-surface-container/30 dark:bg-m3-surface-container-dark/50 hover:border-m3-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {getTypeBadge(item.type)}
                  <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
                    {item.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-rounded text-sm">person</span>
                    {item.contributor_name} ({item.contributor_email})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-rounded text-sm">calendar_today</span>
                    {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {item.contributor_notes && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 italic bg-white dark:bg-m3-surface-high-dark/60 p-2 rounded-xl border border-gray-100 dark:border-m3-surface-high-dark max-w-xl">
                    &ldquo;{item.contributor_notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => { setSelectedItem(item); setShowRejectInput(false); }}
                  className="px-4 py-2 bg-m3-surface-container dark:bg-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-gray-900 dark:text-white rounded-xl text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5 border border-m3-surface-high dark:border-m3-surface-high-dark"
                >
                  <span className="material-symbols-rounded text-sm">visibility</span>
                  <span>Inspect Details</span>
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleApprove(item.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span className="material-symbols-rounded text-sm">check</span>
                  <span>Approve</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal / Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setSelectedItem(null)}>
          <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-m3-surface-container-dark rounded-[2.5rem] border border-gray-200 dark:border-m3-surface-high-dark p-6 sm:p-8 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-m3-surface-high-dark">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getTypeBadge(selectedItem.type)}
                  <span className="text-xs text-gray-400">ID: {selectedItem.id.slice(0, 8)}...</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedItem.title}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Submitted by <strong className="text-gray-900 dark:text-white">{selectedItem.contributor_name}</strong> ({selectedItem.contributor_email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-full bg-gray-100 dark:bg-m3-surface-high-dark text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-rounded text-xl">close</span>
              </button>
            </div>

            {/* Modal Body: Side-by-Side Diff or New Payload Visualizer */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {selectedItem.contributor_notes && (
                <div className="p-4 bg-m3-surface-container/60 dark:bg-m3-surface-high-dark/40 rounded-2xl border border-m3-surface-high dark:border-m3-surface-high-dark">
                  <span className="text-xs font-bold uppercase tracking-wider text-m3-secondary dark:text-m3-secondary-dark block mb-1">
                    Contributor Notes
                  </span>
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                    {selectedItem.contributor_notes}
                  </p>
                </div>
              )}

              {/* Diff View for Edits */}
              {(selectedItem.type === "edit_bandish" || selectedItem.type === "edit_raag") && selectedItem.original_data ? (
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-m3-primary dark:text-m3-primary-dark block">
                    Side-by-Side Comparison (Original vs Proposed)
                  </span>
                  <div className="border border-gray-100 dark:border-m3-surface-high-dark rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-m3-surface-high-dark text-xs sm:text-sm">
                    {Object.keys(selectedItem.data).map((key) => {
                      const oldVal = selectedItem.original_data[key];
                      const newVal = selectedItem.data[key];
                      const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

                      return (
                        <div key={key} className={`p-3.5 grid grid-cols-1 md:grid-cols-3 gap-2 ${isChanged ? "bg-amber-500/5 dark:bg-amber-500/10" : ""}`}>
                          <div className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[11px] md:pt-1">
                            {key} {isChanged && <span className="text-amber-600 dark:text-amber-400 font-bold ml-1">• Modified</span>}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 break-words">
                            <span className="md:hidden font-bold block text-[10px] text-gray-400 mb-0.5">ORIGINAL:</span>
                            {oldVal ? (typeof oldVal === "object" ? JSON.stringify(oldVal, null, 2) : String(oldVal)) : <span className="italic text-gray-400">Empty</span>}
                          </div>
                          <div className={`break-words font-medium ${isChanged ? "text-emerald-700 dark:text-emerald-300 font-bold" : "text-gray-900 dark:text-white"}`}>
                            <span className="md:hidden font-bold block text-[10px] text-emerald-500 mb-0.5">PROPOSED:</span>
                            {newVal ? (typeof newVal === "object" ? JSON.stringify(newVal, null, 2) : String(newVal)) : <span className="italic text-gray-400">Empty</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Full Payload View for New Records */
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-m3-primary dark:text-m3-primary-dark block">
                    Proposed Data Fields
                  </span>
                  <div className="bg-m3-surface-container/50 dark:bg-m3-surface-high-dark/30 p-4 rounded-2xl border border-gray-100 dark:border-m3-surface-high-dark space-y-2 text-xs sm:text-sm">
                    {Object.entries(selectedItem.data).map(([k, v]) => (
                      <div key={k} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-1 border-b border-gray-100/60 dark:border-m3-surface-high-dark/40 last:border-0">
                        <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[11px] sm:w-32 shrink-0">
                          {k}:
                        </span>
                        <span className="text-gray-900 dark:text-white break-words flex-1">
                          {typeof v === "object" ? JSON.stringify(v, null, 2) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Note Input (if user toggled Deny) */}
              {showRejectInput && (
                <div className="p-4 bg-m3-error/5 dark:bg-m3-error-dark/10 border border-m3-error/20 dark:border-m3-error-dark/20 rounded-2xl space-y-3">
                  <label className="block text-xs font-bold text-m3-error dark:text-m3-error-dark uppercase tracking-wider">
                    Rejection Feedback (Optional explanation for contributor)
                  </label>
                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Please verify the Taal notation and submit again..."
                    className="w-full p-3 rounded-xl bg-white dark:bg-m3-surface-container-dark border border-gray-200 dark:border-m3-surface-high-dark text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-m3-error"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectInput(false)}
                      className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleDeny(selectedItem.id)}
                      className="px-4 py-1.5 bg-m3-error text-white rounded-xl text-xs font-bold hover:bg-m3-error/90 active:scale-95 disabled:opacity-50"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-5 mt-4 border-t border-gray-100 dark:border-m3-surface-high-dark flex flex-wrap items-center justify-between gap-3">
              <div>
                {!showRejectInput && (
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(true)}
                    className="px-4 py-2.5 rounded-xl border border-m3-error/30 text-m3-error dark:text-m3-error-dark hover:bg-m3-error/10 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-rounded text-sm">block</span>
                    <span>Deny / Reject</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-xs font-bold transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleApprove(selectedItem.id)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span className="material-symbols-rounded text-base">check_circle</span>
                  <span>{isProcessing ? "Publishing..." : "Approve & Publish Live"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
