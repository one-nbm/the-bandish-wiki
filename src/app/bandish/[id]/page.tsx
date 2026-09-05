import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddRenditionModal from "./AddRenditionModal";
import EditRenditionModal from "./EditRenditionModal";

export default async function BandishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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

  return (
    <main className="min-h-screen bg-m3-surface dark:bg-m3-surface-container-dark transition-colors duration-500 relative overflow-hidden">
      
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-m3-primary/20 dark:bg-m3-primary-dark/10 blur-[100px] rounded-full pointer-events-none opacity-50" />

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
            className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight"
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
              <h3 className="text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-widest mb-5 opacity-80">Devanagari</h3>
              <p className="text-gray-900 dark:text-white text-2xl md:text-3xl leading-[1.8] whitespace-pre-wrap font-medium">
                {bandish.lyrics.devanagari}
              </p>
            </div>
          )}
          
          <div>
            <h3 className="text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-widest mb-5 opacity-80">Transliteration</h3>
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
            <AddRenditionModal bandish={bandish} />
          </div>
          
          {bandish.youtube_renditions && bandish.youtube_renditions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bandish.youtube_renditions.map((video: { artist: string; url: string; title?: string }, index: number) => {
                // Extract the 11-character YouTube video ID from standard or shortened URLs
                const videoIdMatch = video.url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([^"&?\/\s]{11})/i);
                const videoId = videoIdMatch ? videoIdMatch[1] : null;

                return (
                  <div 
                    key={index}
                    className="group relative bg-white dark:bg-m3-surface-dark p-3 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-rose-300 dark:hover:border-rose-900/50 transition-colors flex items-center justify-between"
                  >
                    <a 
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 flex-1 min-w-0"
                    >
                      {/* Thumbnail Container */}
                      <div className="relative w-28 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {videoId ? (
                          <img 
                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
                            alt={`${video.artist} rendition`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-rose-50 dark:bg-rose-900/10">
                            <span className="material-symbols-rounded text-rose-300">music_note</span>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                           <span className="material-symbols-rounded text-white drop-shadow-md">play_arrow</span>
                        </div>
                      </div>
                      
                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                          {video.artist}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate pr-2">
                          {video.title || "Watch on YouTube"}
                        </p>
                      </div>
                    </a>
                    
                    <div className="flex items-center gap-1">
                      <EditRenditionModal bandish={bandish} index={index} />
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-2 text-gray-300 dark:text-gray-600 group-hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors duration-200">
                        <span className="material-symbols-rounded text-[1.2rem]">open_in_new</span>
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

      </div>
    </main>
  );
}