"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { signOutAction } from "@/app/actions";

export default function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      // 1. Purge client session (clears local cookies and storage immediately)
      await supabase.auth.signOut();
      // 2. Invoke server action to clear server-side session cookies and invalidate RSC layout cache
      await signOutAction();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      // 3. Immediately reset/redirect browser context. This flushes all React client state
      // and ensures the Server Component in layout.tsx (AuthButton) re-renders as unauthenticated.
      if (typeof window !== "undefined") {
        if (window.location.pathname === "/" && !window.location.search && !window.location.hash) {
          window.location.reload();
        } else {
          window.location.href = "/";
        }
      }
    }
  };

  return (
    <button 
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      aria-busy={isSigningOut}
      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-m3-error/10 hover:bg-m3-error/20 dark:bg-m3-error-dark/10 dark:hover:bg-m3-error-dark/20 text-m3-error dark:text-m3-error-dark rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap cursor-pointer" 
      title={isSigningOut ? "Signing out..." : "Sign Out"}
    >
      <span className={`material-symbols-rounded text-[1.25rem] ${isSigningOut ? "animate-spin" : ""}`}>
        {isSigningOut ? "progress_activity" : "logout"}
      </span>
      <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
    </button>
  );
}

