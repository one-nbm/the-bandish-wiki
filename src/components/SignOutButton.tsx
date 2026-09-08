"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <button 
      type="button"
      onClick={handleSignOut} 
      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-m3-error/10 hover:bg-m3-error/20 dark:bg-m3-error-dark/10 dark:hover:bg-m3-error-dark/20 text-m3-error dark:text-m3-error-dark rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 whitespace-nowrap" 
      title="Sign Out"
    >
      <span className="material-symbols-rounded text-[1.25rem]">logout</span>
      <span>Sign Out</span>
    </button>
  );
}

