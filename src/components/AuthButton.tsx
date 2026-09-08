import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import UserAccountMenu from "./UserAccountMenu";

export default async function AuthButton() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link 
        href="/login" 
        className="flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:px-5 sm:py-2.5 bg-m3-primary hover:bg-m3-primary/90 dark:bg-m3-primary-dark dark:hover:bg-m3-primary-dark/90 text-white dark:text-gray-900 rounded-full font-bold text-sm sm:text-base transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-95 shrink-0"
      >
        <span className="material-symbols-rounded text-[1.15rem] sm:text-[1.25rem]">login</span>
        <span>Sign In</span>
      </Link>
    );
  }

  return <UserAccountMenu email={user.email || "User"} />;
}

