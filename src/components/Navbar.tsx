"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Navbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [showTitle, setShowTitle] = useState(pathname !== "/");

  useEffect(() => {
    if (pathname !== "/") {
      setShowTitle(true);
      return;
    }
    
    setShowTitle(false);

    const handleStart = () => setShowTitle(true);
    const handleReset = () => setShowTitle(false);

    window.addEventListener("start-browsing", handleStart);
    window.addEventListener("reset-browsing", handleReset);

    return () => {
      window.removeEventListener("start-browsing", handleStart);
      window.removeEventListener("reset-browsing", handleReset);
    };
  }, [pathname]);

  return (
    <header className="relative w-full z-50 bg-transparent transition-colors duration-500">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-3 relative">
        <Link
          href="/"
          aria-label="The Bandish Wiki Home"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.dispatchEvent(new Event("reset-browsing"));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="inline-flex items-center gap-3 hover:opacity-85 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 active:scale-95 shrink-0 relative z-10"
        >
          <Image
            src="/icon.svg"
            alt="The Bandish Wiki"
            width={40}
            height={40}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full"
            priority
          />
        </Link>

        {/* Centered App Title for Layout Animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none hidden lg:flex">
          {showTitle && (
            <motion.h2 
              layoutId="app-title"
              className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight pointer-events-auto m-0" 
              style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}
            >
              The Bandish Wiki
            </motion.h2>
          )}
        </div>

        {!isLoginPage && (
          <div className="flex items-center gap-2 shrink-0 relative z-10">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
