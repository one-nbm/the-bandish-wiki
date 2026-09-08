"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <header className="relative w-full z-30 bg-m3-surface dark:bg-m3-surface-dark transition-colors duration-500">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="The Bandish Wiki Home"
          className="inline-flex items-center hover:opacity-85 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 active:scale-95 shrink-0"
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

        {!isLoginPage && (
          <div className="flex items-center gap-2 shrink-0">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
