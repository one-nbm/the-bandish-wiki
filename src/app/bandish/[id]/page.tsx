import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import AddRenditionModal from "./AddRenditionModal";
import EditRenditionModal from "./EditRenditionModal";
import CopyButton from "@/components/CopyButton";

import type { Metadata } from "next";
import { checkIsEditor } from "@/app/actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: bandish } = await supabase.from("bandishes").select("*").eq("id", id).single();

  if (!bandish) return { title: "Not Found | The Bandish Wiki" };

  return {
    title: `${bandish.title} - ${bandish.raag} | The Bandish Wiki`,
    description: `Learn the ${bandish.taal} bandish composed by ${bandish.composer}. ${bandish.lyrics?.english?.substring(0, 100) || ""}...`,
  };
}

export default async function BandishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: bandish, error } = await supabase
    .from("bandishes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !bandish) {
    notFound();
  }

  // Helper to create clean URLs
  const raagSlug = bandish.raag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const isAdmin = await checkIsEditor();

  // Fetch IDs for rendition bandish tags
  const allRenditionTitles = bandish.youtube_renditions
    ? Array.from(new Set(bandish.youtube_renditions.flatMap((r: any) => r.bandishes || [])))
    : [];

  let titleToIdMap: Record<string, string> = {};
  if (allRenditionTitles.length > 0) {
    const { data: relatedBandishes } = await supabase
      .from('bandishes')
      .select('id, title')
      .in('title', allRenditionTitles);

    if (relatedBandishes) {
      relatedBandishes.forEach((b: any) => {
        titleToIdMap[b.title] = b.id;
      });
    }
  }

  return (
    <main className="min-h-screen bg-transparent relative">

      {/* Ambient Background Glow (Pulled up to bleed behind the transparent navbar) */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-m3-primary/20 dark:bg-m3-primary-dark/10 blur-[100px] rounded-full pointer-events-none opacity-50" />

      <div className="max-w-5xl mx-auto p-6 md:p-12 relative z-10 mt-4 md:mt-8">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-m3-primary dark:text-m3-primary-dark font-bold mb-10 hover:opacity-80 transition-opacity animate-page-enter"
        >
          <span className="material-symbols-rounded text-[1.2rem]">arrow_back</span>
          Back to Wiki
        </Link>

        {/* Title & Tags */}
        <div className="mb-12 animate-page-enter animate-page-delay-1">
          <h1
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight"
            style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}
          >
            {bandish.title}
          </h1>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/raag/${raagSlug}`}
              className="group flex items-center gap-1.5 bg-m3-secondary/10 hover:bg-m3-secondary/20 dark:bg-m3-secondary-dark/10 dark:hover:bg-m3-secondary-dark/20 text-m3-secondary dark:text-m3-secondary-dark px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300"
            >
              {bandish.raag}
              <span className="material-symbols-rounded text-[1rem] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">arrow_outward</span>
            </Link>

            <span className="flex items-center bg-m3-surface-container dark:bg-m3-surface-dark px-5 py-2.5 rounded-full text-sm font-bold tracking-wide text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              {bandish.taal}
            </span>
            <span className="flex items-center bg-m3-tertiary/10 dark:bg-m3-tertiary-dark/10 text-m3-tertiary dark:text-m3-tertiary-dark px-5 py-2.5 rounded-full text-sm font-bold tracking-wide">
              {bandish.composer}
            </span>
            <span className="flex items-center bg-m3-surface-high dark:bg-m3-surface-high-dark text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded-full text-sm font-bold tracking-wide">
              {bandish.tradition || "N/A"}
            </span>
          </div>
        </div>

        {/* Lyrics Section */}
        <div className="space-y-12 max-w-4xl mt-12 animate-page-enter animate-page-delay-2">
          {bandish.lyrics.devanagari && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-widest opacity-80">Devanagari</h3>
                <CopyButton textToCopy={bandish.lyrics.devanagari} />
              </div>
              <p className="text-gray-900 dark:text-white text-2xl md:text-3xl leading-[1.8] whitespace-pre-wrap font-medium">
                {bandish.lyrics.devanagari}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-widest opacity-80">Transliteration</h3>
              <CopyButton textToCopy={bandish.lyrics.english} />
            </div>
            <p className="text-gray-900 dark:text-white text-2xl md:text-3xl leading-[1.8] whitespace-pre-wrap font-medium">
              {bandish.lyrics.english}
            </p>
          </div>
        </div>

        {/* NEW: YouTube Renditions Section */}
        <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800 animate-page-enter animate-page-delay-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="material-symbols-rounded text-rose-400 text-[1.8rem]">play_circle</span>
              Notable Renditions
            </h3>
            {isAdmin && <AddRenditionModal bandish={bandish} />}
          </div>

          {bandish.youtube_renditions && bandish.youtube_renditions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bandish.youtube_renditions.map((video: { artist: string; url: string; title?: string; year?: string; isVideo?: boolean; bandishes?: string[] }, index: number) => {
                const videoIdMatch = video.url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([^"&?\/\s]{11})/i);
                const videoId = videoIdMatch ? videoIdMatch[1] : null;

                return (
                  <div
                    key={index}
                    className="group relative bg-white dark:bg-m3-surface-container-dark rounded-[2rem] overflow-hidden border border-m3-surface-high dark:border-m3-surface-high-dark transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:scale-[1.02] flex items-stretch min-h-[7.5rem]"
                  >
                    {/* Full-bleed thumbnail */}
                    {videoId && (
                      <Image
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                        alt=""
                        aria-hidden="true"
                        fill
                        className="object-cover brightness-100 opacity-60 dark:brightness-70 dark:opacity-90"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    )}

                    {/* Gradient: 20% opacity on left, 80% opacity on right */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/70 to-white/50 dark:from-m3-surface-container-dark/50 dark:via-m3-surface-container-dark/90 dark:to-m3-surface-container-dark/100 pointer-events-none" />

                    {/* Full Card Click Target */}
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 z-[5]"
                      aria-label={`Watch ${video.artist} performance`}
                    />

                    {/* Play button */}
                    <div
                      className="relative z-10 w-20 sm:w-24 shrink-0 flex items-center justify-center pointer-events-none"
                    >
                      <span className="material-symbols-rounded text-m3-primary dark:text-white text-[1.6rem] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125">play_arrow</span>
                    </div>

                    {/* Text */}
                    <div
                      className="relative z-10 flex flex-col justify-center flex-1 min-w-0 py-5 pl-2 pr-4 pointer-events-none"
                    >
                      <div className="flex flex-col gap-2">
                        <h4 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg line-clamp-1 leading-snug">
                          {video.artist}
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-1 pointer-events-auto">
                          {video.year && (
                            <span className="bg-m3-surface-high dark:bg-m3-surface-high-dark text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide flex items-center">
                              {video.year}
                            </span>
                          )}
                          {video.isVideo && (
                            <span className="bg-m3-primary/10 dark:bg-m3-primary-dark/10 text-m3-primary dark:text-m3-primary-dark px-2.5 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1">
                              <span className="material-symbols-rounded text-[1rem]">videocam</span>
                              Video
                            </span>
                          )}
                          {video.bandishes && video.bandishes.length > 0 ? (
                            video.bandishes.map((b, idx) => {
                              const relatedId = titleToIdMap[b];
                              if (relatedId) {
                                return (
                                  <Link key={idx} href={`/bandish/${relatedId}`} className="bg-m3-surface-container dark:bg-m3-surface-high-dark border border-m3-surface-high dark:border-m3-surface-high-dark hover:bg-m3-surface-high dark:hover:bg-m3-surface-container-dark text-m3-secondary dark:text-m3-secondary-dark px-2.5 py-1 rounded-full text-xs font-bold tracking-wide flex items-center max-w-full transition-colors z-20">
                                    <span className="truncate">{b}</span>
                                  </Link>
                                );
                              }
                              return (
                                <span key={idx} className="bg-m3-surface-container dark:bg-m3-surface-high-dark border border-m3-surface-high dark:border-m3-surface-high-dark text-m3-secondary dark:text-m3-secondary-dark px-2.5 py-1 rounded-full text-xs font-bold tracking-wide flex items-center max-w-full">
                                  <span className="truncate">{b}</span>
                                </span>
                              );
                            })
                          ) : video.title && (
                            <span className="bg-m3-surface-container dark:bg-m3-surface-high-dark border border-m3-surface-high dark:border-m3-surface-high-dark text-m3-secondary dark:text-m3-secondary-dark px-2.5 py-1 rounded-full text-xs font-bold tracking-wide flex items-center max-w-full">
                              <span className="truncate">{video.title}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="relative z-20 flex flex-col items-center justify-center gap-1 px-2 shrink-0">
                      {isAdmin && <EditRenditionModal bandish={bandish} index={index} />}
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-2.5 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 hover:text-m3-primary dark:hover:text-white hover:bg-m3-primary/10 dark:hover:bg-white/10 rounded-full transition-all duration-300"
                      >
                        <span className="material-symbols-rounded text-[1.1rem]">open_in_new</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic">No renditions added yet. Be the first to add one!</p>
          )}
        </div>

        {/* Contributor Footer */}
        <div className="mt-16 pt-8 text-center border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
            Contributed by: {bandish.contributor || "Anonymous"}
          </p>
        </div>

      </div>
    </main>
  );
}