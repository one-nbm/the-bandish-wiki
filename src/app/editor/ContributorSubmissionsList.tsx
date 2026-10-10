"use client";

import React, { useState } from "react";

interface ContributorSubmissionsListProps {
  initialSubmissions: any[];
}

export default function ContributorSubmissionsList({ initialSubmissions }: ContributorSubmissionsListProps) {
  const [submissions] = useState<any[]>(initialSubmissions);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <span className="material-symbols-rounded text-xs">check_circle</span>
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-m3-error/10 text-m3-error dark:bg-m3-error-dark/20 dark:text-m3-error-dark border border-m3-error/20 flex items-center gap-1">
            <span className="material-symbols-rounded text-xs">cancel</span>
            Denied
          </span>
        );
      case "deleted":
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <span className="material-symbols-rounded text-xs">delete</span>
            Deleted by Admin
          </span>
        );
      case "pending":
      default:
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <span className="material-symbols-rounded text-xs">schedule</span>
            Pending Review
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "new_bandish":
        return "New Bandish";
      case "edit_bandish":
        return "Suggested Bandish Edit";
      case "new_raag":
        return "New Raag Entry";
      case "edit_raag":
        return "Suggested Raag Revision";
      case "new_rendition":
        return "New Rendition Submission";
      default:
        return type;
    }
  };

  return (
    <div className="bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark rounded-[2.5rem] p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-rounded text-2xl sm:text-3xl text-m3-tertiary dark:text-m3-tertiary-dark">
          history_edu
        </span>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            My Community Submissions
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track the status of your compositions, scale revisions, and suggested edits.
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-gray-200 dark:border-m3-surface-high-dark rounded-2xl">
          <span className="material-symbols-rounded text-4xl text-gray-400 dark:text-gray-500 mb-2 block">
            post_add
          </span>
          <p className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300">
            No submissions yet!
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-md mx-auto">
            When you add new bandishes, propose raag entries, or suggest edits to existing compositions, their review status will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-m3-surface-high-dark bg-m3-surface-container/20 dark:bg-m3-surface-container-dark/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-m3-secondary dark:text-m3-secondary-dark uppercase tracking-wider">
                    {getTypeLabel(item.type)}
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span>Submitted {new Date(item.created_at).toLocaleDateString()}</span>
                  {item.reviewed_at && (
                    <span>• Reviewed {new Date(item.reviewed_at).toLocaleDateString()}</span>
                  )}
                </div>
                {item.reviewer_notes && (
                  <p className="text-xs text-m3-error dark:text-m3-error-dark mt-1 bg-m3-error/5 p-2 rounded-xl border border-m3-error/10">
                    <strong>Admin Note:</strong> {item.reviewer_notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {getStatusBadge(item.status)}
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(item)}
                  className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-m3-surface-high-dark transition-colors"
                  title="View Submitted Payload"
                >
                  <span className="material-symbols-rounded text-lg">info</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setSelectedSubmission(null)}>
          <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xl max-h-[85vh] bg-white dark:bg-m3-surface-container-dark rounded-[2.5rem] border border-gray-200 dark:border-m3-surface-high-dark p-6 sm:p-8 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-gray-100 dark:border-m3-surface-high-dark">
              <div>
                <span className="text-xs font-bold text-m3-secondary dark:text-m3-secondary-dark uppercase tracking-wider block mb-1">
                  {getTypeLabel(selectedSubmission.type)}
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedSubmission.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="p-2 rounded-full bg-gray-100 dark:bg-m3-surface-high-dark text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <span className="material-symbols-rounded text-lg">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-m3-surface-container/50 dark:bg-m3-surface-high-dark/30 border border-gray-100 dark:border-m3-surface-high-dark">
                <span className="font-bold text-gray-500">Current Status:</span>
                <div>{getStatusBadge(selectedSubmission.status)}</div>
              </div>

              {selectedSubmission.contributor_notes && (
                <div className="p-3 rounded-xl bg-m3-surface-container/30 border border-gray-100 dark:border-m3-surface-high-dark">
                  <span className="font-bold text-gray-500 uppercase tracking-wider text-[11px] block mb-1">Your Note:</span>
                  <p className="text-gray-800 dark:text-gray-200">{selectedSubmission.contributor_notes}</p>
                </div>
              )}

              {selectedSubmission.reviewer_notes && (
                <div className="p-3 rounded-xl bg-m3-error/10 border border-m3-error/20 text-m3-error dark:text-m3-error-dark">
                  <span className="font-bold uppercase tracking-wider text-[11px] block mb-1">Feedback from Admin:</span>
                  <p>{selectedSubmission.reviewer_notes}</p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-m3-surface-container/40 dark:bg-m3-surface-high-dark/30 border border-gray-100 dark:border-m3-surface-high-dark space-y-2">
                <span className="font-bold text-gray-500 uppercase tracking-wider text-[11px] block mb-2">Submitted Data:</span>
                {Object.entries(selectedSubmission.data).map(([k, v]) => (
                  <div key={k} className="flex flex-col sm:flex-row sm:items-start gap-1 py-1 border-b border-gray-100 dark:border-m3-surface-high-dark/40 last:border-0">
                    <span className="font-bold text-gray-500 text-[11px] sm:w-28 shrink-0">{k}:</span>
                    <span className="text-gray-900 dark:text-white break-words flex-1">
                      {typeof v === "object" ? JSON.stringify(v, null, 2) : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-gray-100 dark:border-m3-surface-high-dark flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-5 py-2 rounded-xl bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900 text-xs font-bold active:scale-95 transition-transform"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
