"use client";

import { useState, useRef, useEffect } from "react";
import SignOutButton from "./SignOutButton";

interface UserAccountMenuProps {
  email: string;
}

export default function UserAccountMenu({ email }: UserAccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="User account menu"
        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-m3-surface-container/60 dark:bg-m3-surface-dark/50 border border-gray-200 dark:border-gray-700 rounded-full cursor-pointer hover:bg-m3-surface-container dark:hover:bg-m3-surface-high-dark transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.03] active:scale-95"
      >
        <span className="material-symbols-rounded text-[1.3rem] text-m3-primary dark:text-m3-primary-dark">account_circle</span>
        <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white max-w-[100px] xs:max-w-[130px] sm:max-w-[180px] truncate">
          {email}
        </span>
        <span
          className={`material-symbols-rounded text-sm text-gray-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-m3-surface-high-dark p-3 rounded-2xl border border-gray-100 dark:border-gray-700 z-50 animate-modal-enter">
          <div className="px-3 py-2 mb-2 border-b border-gray-100 dark:border-gray-800">
            <p className="text-[0.7rem] font-bold uppercase tracking-wider text-m3-secondary dark:text-m3-secondary-dark">
              Signed in as
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate" title={email}>
              {email}
            </p>
          </div>
          <SignOutButton />
        </div>
      )}
    </div>
  );
}
