"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookMetadata } from "@/data/books";
import { useBookTransition } from "./BookTransitionContext";

interface BookLinkButtonProps {
  bookTitle: string;
  book: BookMetadata;
}

export function BookLinkButton({ bookTitle, book }: BookLinkButtonProps) {
  const router = useRouter();
  const { startBookTransition, isTransitioning } = useBookTransition();
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const [isClicked, setIsClicked] = useState(false);

  const bookUrl = `/book/${book.slug}`;

  // Prefetch the book page in the background for instant, zero-latency navigation
  useEffect(() => {
    try {
      router.prefetch(bookUrl);
    } catch {}
  }, [bookUrl, router]);

  const handleClick = (e: React.MouseEvent) => {
    // Standard modifier key clicks open in new tab without interception
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    e.preventDefault();
    if (isTransitioning || isClicked) return;

    if (thumbnailRef.current) {
      const rect = thumbnailRef.current.getBoundingClientRect();
      setIsClicked(true);
      startBookTransition({
        book,
        startRect: rect,
        url: bookUrl,
      });
    } else {
      router.push(bookUrl);
    }
  };

  return (
    <a
      href={bookUrl}
      onClick={handleClick}
      className="group inline-flex items-center gap-3.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark hover:border-m3-primary/60 dark:hover:border-m3-primary-dark/60 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer relative"
      title={`Explore ${bookTitle}`}
    >
      {/* Miniature Real Book Cover Thumbnail (matched to 230:330 aspect ratio) */}
      <div
        ref={thumbnailRef}
        className={`relative w-[36px] h-[52px] rounded-[3px] overflow-hidden border border-black/15 dark:border-white/10 shrink-0 bg-m3-surface-high dark:bg-m3-surface-high-dark transition-all duration-300 group-hover:scale-105 ${
          isClicked ? "opacity-0" : "opacity-100"
        }`}
        style={{ willChange: "transform, opacity" }}
      >
        {book.coverImage ? (
          <Image
            src={book.coverImage}
            alt={book.title}
            fill
            sizes="80px"
            className="object-cover object-center pointer-events-none"
          />
        ) : (
          <div
            className="w-full h-full relative flex flex-col items-center justify-center p-1 text-center overflow-hidden"
            style={{ background: book.coverTheme.primaryBg }}
          >
            {/* Inset Gold Foil Trim on Miniature Volume */}
            <div
              className="absolute inset-0.5 rounded-[1px] border opacity-60 pointer-events-none"
              style={{ borderColor: book.coverTheme.goldTrim }}
            />
            <span
              className="material-symbols-rounded text-xs relative z-10"
              style={{ color: book.coverTheme.goldTrim }}
            >
              auto_stories
            </span>
          </div>
        )}

        {/* Spine crease texture on miniature thumbnail */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/50 via-black/15 to-transparent pointer-events-none" />
        {/* Subtle lighting sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/15 pointer-events-none" />
      </div>

      {/* Text Credits */}
      <div className="text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
          Found In
        </span>
        <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
          <span>{bookTitle}</span>
          <span className="material-symbols-rounded text-base text-gray-400 dark:text-gray-500 group-hover:text-m3-primary dark:group-hover:text-m3-primary-dark group-hover:translate-x-1 transition-all">
            arrow_forward
          </span>
        </span>
      </div>
    </a>
  );
}
