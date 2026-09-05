import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

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

  // Helper to create clean URLs (e.g. "Miyan Ki Todi" -> "miyan-ki-todi")
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
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight"
            style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}
          >
            {bandish.title}
          </h1>

          <div className="flex flex-wrap gap-3">
            {/* Clickable Raag Link */}
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
      </div>
    </main>
  );
}