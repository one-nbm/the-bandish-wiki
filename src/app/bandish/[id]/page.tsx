import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddRenditionModal from "./AddRenditionModal";
import EditRenditionModal from "./EditRenditionModal";
import CopyButton from "@/components/CopyButton";

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
  const raagSlug = bandish.raag.toLowerCase().replace(/\s+/g, '-');
  const { data: { user } } = await supabase.auth.getUser();
  const isSignedIn = !!user;

  return (
    <main className="min-h-screen bg-transparent relative">
      
      {/* Ambient Background Glow (Pulled up to bleed behind the transparent navbar) */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-m3-primary/20 dark:bg-m3-primary-dark/10 blur-[100px] rounded-full pointer-events-none opacity-50" />

      <div className="max-w-5xl mx-auto p-6 md:p-12 relative z-10 mt-4 md:mt-8">
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-m3-primary dark:text-m3-primary-dark font-bold mb-10 hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-rounded text-[1.2rem]">arrow_back</span>
          Back to Wiki
        </Link>

        {/* Title & Tags */}
        <div className="mb-12">
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
          </div>
        </div>

        {/* Lyrics Section */}
        <div className="space-y-12 max-w-4xl mt-12">
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
        <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="material-symbols-rounded text-rose-400 text-[1.8rem]">play_circle</span>
              Notable Renditions
            </h3>
            {isSignedIn && <AddRenditionModal bandish={bandish} />}
          </div>
          
          {bandish.youtube_renditions && bandish.youtube_renditions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bandish.youtube_renditions.map((video: { artist: string; url: string; title?: string }, index: number) => {
                const videoIdMatch = video.url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([^"&?\/\s]{11})/i);
                const videoId = videoIdMatch ? videoIdMatch[1] : null;

                return (
                  <div
                    key={index}
                    className="group relative bg-m3-surface-container dark:bg-m3-surface-container-dark rounded-3xl overflow-hidden dark:ring-1 dark:ring-white/15 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:scale-[1.02] flex items-stretch min-h-[5rem]"
                  >
                    {/* Full-bleed thumbnail */}
                    {videoId && (
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover brightness-110 opacity-55 dark:brightness-75 dark:opacity-75"
                      />
                    )}

                    {/* Gradient: white wash left in light mode (lightens thumbnail), transparent in dark; fades to card bg on right */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/55 dark:from-transparent via-m3-surface-container/95 dark:via-m3-surface-container-dark/95 via-[45%] to-m3-surface-container dark:to-m3-surface-container-dark" />

                    {/* Play button */}
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 w-20 sm:w-24 shrink-0 flex items-center justify-center"
                    >
                      <span className="material-symbols-rounded text-m3-primary dark:text-white text-[1.6rem] drop-shadow-lg transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125">play_arrow</span>
                    </a>

                    {/* Text */}
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 flex flex-col justify-center flex-1 min-w-0 py-3 pl-1 pr-2"
                    >
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-1 leading-snug">
                        {video.artist}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 leading-snug">
                        {video.title || "Watch on YouTube"}
                      </p>
                    </a>

                    {/* Action buttons */}
                    <div className="relative z-10 flex flex-col items-center justify-center gap-1 px-2 shrink-0">
                      {isSignedIn && <EditRenditionModal bandish={bandish} index={index} />}
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