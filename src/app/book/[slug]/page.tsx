import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { getUserRole } from "@/app/actions";
import { getBookBySlug, getAllKnownBookSlugs, slugifyBookTitle, getBookGlowColor } from "@/data/books";
import { Book3D } from "@/components/Book3D";
import { BookCatalogueView } from "./BookCatalogueView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const knownSlugs = getAllKnownBookSlugs();

  // Also pre-render any additional books present in Supabase
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase.from("bandishes").select("book");
    if (data) {
      const dbSlugs = data
        .map((b) => b.book && slugifyBookTitle(b.book))
        .filter(Boolean) as string[];
      return Array.from(new Set([...knownSlugs, ...dbSlugs])).map((slug) => ({ slug }));
    }
  } catch {}

  return knownSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) return { title: "Book Not Found | The Bandish Wiki" };

  const canonicalUrl = `https://bandish-wiki.vercel.app/book/${slug}`;
  const authorsText = book.authors.join(", ");
  const description = `${book.title} (${book.originalTitleDevanagari || ""}): ${book.description.slice(0, 160)}... Explore classical compositions, swar notations, and authentic Hindustani bandishes.`;

  return {
    title: `${book.title} - Classical Music Book & Bandishes | The Bandish Wiki`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${book.title} | The Bandish Wiki`,
      description,
      url: canonicalUrl,
      type: "article",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const role = await getUserRole();
  const isAdmin = role === "admin";

  const book = getBookBySlug(slug);

  // Query all bandishes matching this book in Supabase to determine the true statistics
  const { data: allBandishesData } = await supabase
    .from("bandishes")
    .select("id, title, raag, taal, composer, tradition, lyrics, youtube_renditions, is_published, lay, book")
    .ilike("book", book.title);

  const allBandishes = allBandishesData || [];

  // If there are no bandishes and it's not a known curated book, trigger 404
  const isKnownCurated = Boolean(getAllKnownBookSlugs().includes(slugifyBookTitle(slug)));
  if (!isKnownCurated && allBandishes.length === 0) {
    notFound();
  }

  // Count breakdown for admin vs public
  const publishedBandishes = allBandishes.filter((b) => b.is_published !== false);
  const privateBandishes = allBandishes.filter((b) => b.is_published === false);
  const publishedCount = publishedBandishes.length;
  const privateCount = privateBandishes.length;
  const totalBandishes = allBandishes.length;

  // Pass bandishes to BookCatalogueView; BookCatalogueView strictly filters and displays
  // unpublished drafts only when an authorized admin role is verified.
  const clientBandishes = allBandishes;

  // True statistics of the book across all its compositions in the wiki
  const uniqueRaags = Array.from(new Set(allBandishes.map((b) => b.raag).filter(Boolean)));
  const uniqueTaals = Array.from(new Set(allBandishes.map((b) => b.taal).filter(Boolean)));
  const composerCounts: Record<string, number> = {};
  allBandishes.forEach((b) => {
    if (b.composer && b.composer.toLowerCase() !== "unknown") {
      composerCounts[b.composer] = (composerCounts[b.composer] || 0) + 1;
    }
  });
  const topComposers = Object.entries(composerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name]) => name);

  // Schema.org Structured Data
  const bookJsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "alternateName": book.originalTitleDevanagari,
    "author": book.authors.map((a) => ({ "@type": "Person", "name": a })),
    "publisher": { "@type": "Organization", "name": book.publisher || "Hindustani Classical Music Publication" },
    "datePublished": book.publicationYear ? String(book.publicationYear) : undefined,
    "inLanguage": book.language,
    "description": book.description,
    "mainEntityOfPage": `https://bandish-wiki.vercel.app/book/${slug}`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://bandish-wiki.vercel.app",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Books",
        "item": "https://bandish-wiki.vercel.app/#books",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": book.title,
        "item": `https://bandish-wiki.vercel.app/book/${slug}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-transparent relative transition-colors duration-500 animate-book-page-fade">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Ambient Atmospheric Glow (Strictly flat: diffuse blur, no box-shadows, deintensified in light mode) */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[420px] blur-[120px] rounded-full pointer-events-none opacity-[0.08] dark:opacity-[0.25] z-0 transition-colors duration-700"
        style={{ background: getBookGlowColor(book) }}
      />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-12 relative z-10 mt-2 md:mt-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-m3-primary dark:text-m3-primary-dark font-bold text-sm hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-rounded text-lg">arrow_back</span>
            Back to Wiki
          </Link>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Books
          </span>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
            {book.title}
          </span>
        </div>

        {/* ================= HERO SECTION (BALANCED 3D & CORE METADATA) ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: 3D Interactive Model */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <Book3D book={book} />
          </div>

          {/* Right Column: Book Intel, Stats, Authors & Purchase Hub */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Badges Bar */}
            {book.notationSystem && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-m3-surface-high dark:bg-m3-surface-high-dark text-gray-700 dark:text-gray-300 text-xs font-semibold">
                  <span className="material-symbols-rounded text-xs">music_note</span>
                  {book.notationSystem}
                </span>
                {book.edition && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                    <span className="material-symbols-rounded text-xs">auto_stories</span>
                    {book.edition}
                  </span>
                )}
              </div>
            )}

            {/* Title & Devanagari Script */}
            <div>
              <h1
                className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight"
                style={{ fontVariationSettings: '"wght" 900, "wdth" 140, "ROND" 40' }}
              >
                {book.title}
              </h1>
              {book.originalTitleDevanagari && (
                <p className="text-xl sm:text-2xl font-bold text-m3-primary dark:text-m3-primary-dark mt-1">
                  {book.originalTitleDevanagari}
                </p>
              )}
            </div>

            {/* Author & Publisher Credits */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-rounded text-base text-m3-primary dark:text-m3-primary-dark">
                  person
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {book.authors.join(", ")}
                </span>
              </div>
              {book.publisher && (
                <>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-rounded text-sm">domain</span>
                    <span>{book.publisher}</span>
                  </div>
                </>
              )}
              {book.publicationYear && (
                <>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Est. {book.publicationYear}
                  </span>
                </>
              )}
            </div>

            {/* Dynamic Live Statistics Pill Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark">
              <div className="px-3 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">
                  Bandishes
                </span>
                <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {totalBandishes}
                </span>
                {isAdmin && privateCount > 0 ? (
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 block mt-0.5 whitespace-nowrap">
                    {publishedCount} public · {privateCount} private
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 block mt-0.5 whitespace-nowrap">
                    {publishedCount} catalogued public
                  </span>
                )}
              </div>

              <div className="px-3 py-1.5 border-l border-m3-surface-high/60 dark:border-m3-surface-high-dark/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">
                  Raags
                </span>
                <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {uniqueRaags.length}
                </span>
              </div>

              <div className="px-3 py-1.5 border-l border-m3-surface-high/60 dark:border-m3-surface-high-dark/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">
                  Taals
                </span>
                <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {uniqueTaals.length}
                </span>
              </div>

              <div className="px-3 py-1.5 border-l border-m3-surface-high/60 dark:border-m3-surface-high-dark/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">
                  Composers
                </span>
                <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {Object.keys(composerCounts).length}
                </span>
              </div>
            </div>

            {/* Purchase & Acquisition Hub (Rendered only when valid reference/purchase links exist) */}
            {book.purchaseLinks && book.purchaseLinks.length > 0 && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-rounded text-sm">shopping_bag</span>
                  Purchase & Reference Copies
                </span>
                <div className="flex flex-wrap gap-2">
                  {book.purchaseLinks.map((link, idx) => (
                    <a
                      key={`purchase-${idx}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 hover:border-m3-primary dark:hover:border-m3-primary-dark hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-rounded text-base text-amber-500 dark:text-amber-400">
                        open_in_new
                      </span>
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= FULL-WIDTH EDITORIAL CONTEXT ================= */}
        <section className="w-full mt-10 space-y-6">
          {/* Factual Description */}
          <p className="w-full text-base sm:text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-normal">
            {book.description}
          </p>

          {/* Historical Quote Callout */}
          {book.historicalSignificance && (
            <div className="w-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-m3-surface-container-dark border border-m3-surface-high dark:border-m3-surface-high-dark text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex items-start gap-4">
              <span className="material-symbols-rounded text-2xl text-amber-500 shrink-0 mt-0.5">
                format_quote
              </span>
              <div className="flex flex-col gap-1.5 flex-1">
                <p className="italic text-sm sm:text-base">
                  &ldquo;{book.historicalSignificance}&rdquo;
                </p>
                {book.citation && (
                  <p className="text-[11px] sm:text-xs font-bold tracking-wide text-gray-400 dark:text-gray-500 mt-0.5">
                    — {book.citation}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Featured Composers in this book */}
          {topComposers.length > 0 && (
            <div className="w-full">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2.5">
                Featured Composers in this Collection
              </span>
              <div className="flex flex-wrap gap-2">
                {topComposers.map((composer) => (
                  <span
                    key={composer}
                    className="px-3.5 py-1.5 rounded-full bg-m3-tertiary/10 dark:bg-m3-tertiary-dark/10 text-m3-tertiary dark:text-m3-tertiary-dark text-xs font-bold"
                  >
                    {composer} ({composerCounts[composer]})
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ================= BOTTOM CATALOGUE SECTION ================= */}
        <BookCatalogueView
          initialBandishes={clientBandishes}
          bookTitle={book.title}
          userRole={role}
          publishedCount={publishedCount}
          privateCount={privateCount}
          totalCount={totalBandishes}
        />
      </div>
    </main>
  );
}
