import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600; // Refresh directory every hour

export const metadata: Metadata = {
  title: "All Raags Directory | The Bandish Wiki",
  description: "Comprehensive catalogue of Hindustani classical raags, their Thaats, performance times (Samay), Vadi-Samvadi, and traditional bandishes.",
  alternates: {
    canonical: "https://bandish-wiki.vercel.app/raags",
  },
  openGraph: {
    title: "All Raags Directory | The Bandish Wiki",
    description: "Explore all Hindustani classical raags, their Thaats, Samay, and bandishes.",
    url: "https://bandish-wiki.vercel.app/raags",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RaagsDirectoryPage() {
  const supabase = await createClient();

  const [{ data: raags }, { data: bandishes }] = await Promise.all([
    supabase.from("raags").select("*").order("name"),
    supabase.from("bandishes").select("raag"),
  ]);

  const countsByRaag: Record<string, number> = {};
  if (bandishes) {
    for (const b of bandishes) {
      if (b.raag) {
        countsByRaag[b.raag] = (countsByRaag[b.raag] || 0) + 1;
      }
    }
  }

  const allRaags = raags || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "All Raags Directory",
    "description": "Comprehensive catalogue of Hindustani classical raags and their melodic structures.",
    "url": "https://bandish-wiki.vercel.app/raags",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": allRaags.length,
      "itemListElement": allRaags.map((r, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": r.name,
        "url": `https://bandish-wiki.vercel.app/raag/${r.slug}`,
      })),
    },
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
        "name": "All Raags",
        "item": "https://bandish-wiki.vercel.app/raags",
      },
    ],
  };

  return (
    <main className="min-h-screen bg-transparent relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-m3-primary dark:text-m3-primary-dark font-bold hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-rounded text-[1.2rem]">arrow_back</span>
            Back to Wiki
          </Link>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {allRaags.length} Raags Logged
          </span>
        </div>

        <div className="mb-10 text-left">
          <h1
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight leading-tight"
            style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}
          >
            Raag Directory
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
            Browse through all documented Hindustani classical raags, their parent Thaats, performance times, and associated bandish compositions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {allRaags.map((raag) => {
            const count = countsByRaag[raag.name] || 0;
            return (
              <Link
                key={raag.id || raag.slug}
                href={`/raag/${raag.slug}`}
                className="group p-5 bg-white dark:bg-m3-surface-container-dark hover:bg-white dark:hover:bg-m3-surface-high-dark rounded-3xl border border-gray-200/80 dark:border-gray-800 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-m3-primary dark:group-hover:text-m3-primary-dark transition-colors">
                      {raag.name}
                    </h2>
                    <span className="material-symbols-rounded text-gray-400 group-hover:text-m3-primary dark:group-hover:text-m3-primary-dark transition-colors shrink-0 text-[1.2rem]">
                      arrow_outward
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {raag.thaat && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-m3-secondary/10 text-m3-secondary dark:text-m3-secondary-dark">
                        {raag.thaat} Thaat
                      </span>
                    )}
                    {raag.samay && (
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-m3-surface-high dark:bg-m3-surface-high-dark text-gray-700 dark:text-gray-300">
                        {raag.samay}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                  <span>{count} bandish{count !== 1 ? "es" : ""}</span>
                  {raag.vadi && raag.samvadi && (
                    <span className="truncate max-w-[120px]">
                      V: {raag.vadi} · S: {raag.samvadi}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
