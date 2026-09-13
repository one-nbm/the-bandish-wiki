"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 transition-colors duration-500">
      <div className="w-full max-w-md bg-m3-surface-high dark:bg-m3-surface-high-dark rounded-[2.5rem] p-6 sm:p-8 md:p-10 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative scale-100 hover:scale-[1.02]">
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 bg-m3-surface-container dark:bg-m3-surface-container-dark hover:bg-m3-surface-container-high dark:hover:bg-m3-surface-high-dark text-m3-primary dark:text-m3-primary-dark rounded-full mb-4 transition-all duration-300 hover:-translate-x-1">
            <span className="material-symbols-rounded">arrow_back</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}>Welcome Back</h1>
          <p className="text-m3-secondary dark:text-m3-secondary-dark mt-2 font-medium">Sign in to manage the Wiki.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-m3-error/10 dark:bg-m3-error-dark/10 text-m3-error dark:text-m3-error-dark rounded-[1rem] text-sm font-bold flex items-start gap-2 animate-modal-enter">
            <span className="material-symbols-rounded text-[1.2rem]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              autoCapitalize="none"
              autoCorrect="off"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-5 sm:px-6 py-3.5 sm:py-4 rounded-[1.5rem] text-base focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark transition-all duration-300 placeholder-gray-500" 
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-5 sm:px-6 py-3.5 sm:py-4 rounded-[1.5rem] text-base focus:outline-none focus:ring-2 focus:ring-m3-primary dark:focus:ring-m3-primary-dark transition-all duration-300 placeholder-gray-500" 
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-2 bg-m3-primary hover:bg-m3-primary/90 dark:bg-m3-primary-dark dark:hover:bg-m3-primary-dark/90 text-white dark:text-gray-900 px-8 py-4 rounded-[1.5rem] font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <span className="material-symbols-rounded animate-spin">refresh</span>
            ) : (
              <span className="material-symbols-rounded">login</span>
            )}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200 dark:border-m3-surface-container-dark"></div>
          <span className="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">or</span>
          <div className="flex-1 border-t border-gray-200 dark:border-m3-surface-container-dark"></div>
        </div>

        <button 
          type="button" 
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-m3-surface-container-dark hover:bg-gray-50 dark:hover:bg-m3-surface-high-dark text-gray-900 dark:text-white border border-gray-200 dark:border-transparent px-8 py-4 rounded-[1.5rem] font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {googleLoading ? "Connecting..." : "Sign in with Google"}
        </button>

      </div>
    </main>
  );
}

