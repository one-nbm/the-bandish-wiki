"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import SignOutButton from "./SignOutButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRole } from "@/app/actions";

export interface ApprovedContributionNotification {
  id: string;
  title: string;
  type: string;
  reviewed_at?: string;
}

interface UserAccountMenuProps {
  email: string;
  isAdmin?: boolean;
  role?: UserRole;
  pendingRequestsCount?: number;
  approvedContributions?: ApprovedContributionNotification[];
}

export default function UserAccountMenu({
  email,
  isAdmin,
  role,
  pendingRequestsCount = 0,
  approvedContributions = []
}: UserAccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [seenApprovedIds, setSeenApprovedIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Compute effective role (fallback to legacy isAdmin boolean)
  const effectiveRole: UserRole = role || (isAdmin ? "admin" : "viewer");
  const canAccessDashboard = effectiveRole === "admin" || effectiveRole === "contributor";

  // Load seen approved contribution IDs from localStorage
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem("wiki_seen_approved_ids");
      if (stored) {
        setSeenApprovedIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    const handleNotificationUpdate = () => {
      router.refresh();
    };

    window.addEventListener("wiki-notifications-updated", handleNotificationUpdate);
    window.addEventListener("focus", handleNotificationUpdate);

    return () => {
      window.removeEventListener("wiki-notifications-updated", handleNotificationUpdate);
      window.removeEventListener("focus", handleNotificationUpdate);
    };
  }, [router]);

  // Click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  // Filter approved contributions that have not yet been acknowledged/dismissed
  const unseenApproved = useMemo(() => {
    if (!isMounted) return [];
    return approvedContributions.filter((item) => !seenApprovedIds.includes(item.id));
  }, [approvedContributions, seenApprovedIds, isMounted]);

  const unseenApprovedCount = unseenApproved.length;
  const adminPendingCount = effectiveRole === "admin" ? pendingRequestsCount : 0;

  // Active numeric notification count:
  // - For Admin: pending requests count + unseen approved contributions (if any)
  // - For Contributor/User: unseen approved bandishes/contributions count
  const totalNotificationCount = adminPendingCount + unseenApprovedCount;

  const handleDismissApproved = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newSeenIds = Array.from(new Set([...seenApprovedIds, ...approvedContributions.map((a) => a.id)]));
    setSeenApprovedIds(newSeenIds);
    try {
      localStorage.setItem("wiki_seen_approved_ids", JSON.stringify(newSeenIds));
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative inline-flex items-center" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={`User account menu${totalNotificationCount > 0 ? `, ${totalNotificationCount} notifications` : ""}`}
        className="relative flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-m3-primary/5 dark:bg-m3-primary-dark/10 border border-m3-primary/20 dark:border-m3-primary-dark/20 rounded-full cursor-pointer hover:bg-m3-primary/10 dark:hover:bg-m3-primary-dark/20 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.03] active:scale-95"
      >
        <span className="material-symbols-rounded text-[1.3rem] text-m3-primary dark:text-m3-primary-dark">
          account_circle
        </span>
        <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white max-w-[80px] md:max-w-[120px] lg:max-w-[180px] truncate">
          {email}
        </span>
        <span
          className={`material-symbols-rounded text-sm text-gray-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>

        {/* MD3 Expressive Numeric Notification Badge */}
        {totalNotificationCount > 0 && (
          <span
            aria-label={`${totalNotificationCount} notifications`}
            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-m3-error text-white dark:bg-m3-error dark:text-white text-[10px] font-black leading-none flex items-center justify-center border-2 border-m3-surface dark:border-m3-surface-dark select-none animate-page-enter tracking-tight"
            style={{ fontVariationSettings: '"wght" 900' }}
          >
            {totalNotificationCount > 99 ? "99+" : totalNotificationCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-m3-surface-high-dark p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 z-50 animate-modal-enter space-y-2.5">
          {/* User Header */}
          <div className="px-2.5 py-1.5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[0.7rem] font-bold uppercase tracking-wider text-m3-secondary dark:text-m3-secondary-dark">
                Signed in as
              </span>
              <span className={`px-2 py-0.5 text-[0.65rem] font-bold rounded-full uppercase tracking-wider ${
                effectiveRole === "admin" 
                  ? "bg-m3-primary/10 text-m3-primary dark:bg-m3-primary-dark/20 dark:text-m3-primary-dark" 
                  : effectiveRole === "contributor"
                  ? "bg-m3-tertiary/10 text-m3-tertiary dark:bg-m3-tertiary-dark/20 dark:text-m3-tertiary-dark"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}>
                {effectiveRole === "admin" ? "Admin" : effectiveRole === "contributor" ? "Contributor" : "Viewer"}
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate" title={email}>
              {email}
            </p>
          </div>

          {/* Admin Pending Requests Notification Card */}
          {adminPendingCount > 0 && (
            <Link
              href="/editor"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-m3-error/10 dark:bg-m3-error-dark/15 border border-m3-error/25 dark:border-m3-error-dark/30 text-m3-error dark:text-m3-error-dark hover:bg-m3-error/15 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-rounded text-lg shrink-0">notifications_active</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight">
                    {adminPendingCount} Pending Request{adminPendingCount === 1 ? "" : "s"}
                  </p>
                  <p className="text-[10px] text-m3-error/80 dark:text-m3-error-dark/80 mt-0.5">
                    Submissions awaiting review
                  </p>
                </div>
              </div>
              <span className="material-symbols-rounded text-sm shrink-0">chevron_right</span>
            </Link>
          )}

          {/* User Approved Contributions Notification Card */}
          {unseenApprovedCount > 0 && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <span className="material-symbols-rounded text-base text-emerald-600 dark:text-emerald-400">task_alt</span>
                  {unseenApprovedCount} {unseenApprovedCount === 1 ? "Contribution" : "Contributions"} Approved!
                </span>
                <button
                  type="button"
                  onClick={handleDismissApproved}
                  className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline px-1 py-0.5 rounded cursor-pointer"
                  title="Dismiss notification"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 truncate">
                {unseenApproved.map((i) => i.title).join(", ")}
              </p>
            </div>
          )}

          {/* Action Links */}
          <div className="flex flex-col gap-1.5 pt-1">
            {canAccessDashboard ? (
              <Link
                href="/editor"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-m3-primary/10 hover:bg-m3-primary/20 dark:bg-m3-primary-dark/10 dark:hover:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 whitespace-nowrap"
                onClick={() => setIsOpen(false)}
              >
                <span className="material-symbols-rounded text-[1.25rem]">dashboard</span>
                <span>Editor Dashboard</span>
              </Link>
            ) : (
              <a 
                href="https://forms.gle/taJagb1bbn6iarQV6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-m3-primary/10 hover:bg-m3-primary/20 dark:bg-m3-primary-dark/10 dark:hover:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 whitespace-nowrap"
              >
                <span className="material-symbols-rounded text-[1.25rem]">edit_document</span>
                <span>Become a Contributor</span>
              </a>
            )}
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  );
}
