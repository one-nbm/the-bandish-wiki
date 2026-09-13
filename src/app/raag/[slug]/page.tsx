import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditRaagModal from "./EditRaagModal";
import { checkIsEditor } from "@/app/actions";

export default async function RaagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch the Raag details
  const { data: raag, error: raagError } = await supabase
    .from("raags")
    .select("*")
    .eq("slug", slug)
    .single();

  if (raagError || !raag) {
    notFound();
  }

  // 2. Fetch all Bandishes associated with this Raag
  const { data: associatedBandishes } = await supabase
    .from("bandishes")
    .select("id, title, taal, composer")
    .eq("raag", raag.name);

  const isAdmin = await checkIsEditor();

  return (
    <main className="min-h-screen bg-transparent relative transition-colors duration-500">
      
      {/* Ambient Background Glow (Pulled up to bleed behind the transparent navbar) */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-m3-primary/20 dark:bg-m3-primary-dark/10 blur-[100px] rounded-full pointer-events-none opacity-50" />

      <div className="max-w-5xl mx-auto mt-4 md:mt-8 p-6 md:p-12 relative z-10">
        
        <div className="flex items-center justify-between mb-10">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-m3-primary dark:text-m3-primary-dark font-bold hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-rounded text-[1.2rem]">arrow_back</span>
            Back to Wiki
          </Link>
          {isAdmin && <EditRaagModal raag={raag} />}
        </div>

        {/* Raag Header */}
        <div className="mb-12">
          <h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight"
            style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}
          >
            Raag {raag.name}
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-m3-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase mb-1">Thaat</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{raag.thaat || "Unknown"}</div>
            </div>
            <div className="bg-white dark:bg-m3-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase mb-1">Samay (Time)</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{raag.samay || "Unknown"}</div>
            </div>
            <div className="bg-white dark:bg-m3-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase mb-1">Vadi</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{raag.vadi || "Unknown"}</div>
            </div>
            <div className="bg-white dark:bg-m3-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase mb-1">Samvadi</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{raag.samvadi || "Unknown"}</div>
            </div>
          </div>
        </div>

        {/* Aaroh / Avaroh */}
        <div className="bg-m3-secondary/10 dark:bg-m3-secondary-dark/10 p-6 md:p-8 rounded-3xl mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-m3-secondary dark:text-m3-secondary-dark uppercase tracking-widest mb-3">Aaroh (Ascent)</h3>
              <p className="text-2xl font-medium text-gray-900 dark:text-white">{raag.aaroh || "Not documented"}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-m3-secondary dark:text-m3-secondary-dark uppercase tracking-widest mb-3">Avaroh (Descent)</h3>
              <p className="text-2xl font-medium text-gray-900 dark:text-white">{raag.avaroh || "Not documented"}</p>
            </div>
          </div>
        </div>

        {/* Description Section */}
        {raag.description && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this Raag</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {raag.description}
            </p>
          </div>
        )}

        {/* Associated Bandishes Hub */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Bandishes in {raag.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {associatedBandishes && associatedBandishes.length > 0 ? (
              associatedBandishes.map((b) => (
                <Link 
                  href={`/bandish/${b.id}`} 
                  key={b.id}
                  className="group bg-white dark:bg-m3-surface-dark p-5 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-m3-primary dark:hover:border-m3-primary-dark transition-colors flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{b.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{b.taal} • {b.composer}</p>
                  </div>
                  <span className="material-symbols-rounded text-gray-400 group-hover:text-m3-primary transition-colors">chevron_right</span>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 italic">No bandishes logged for this raag yet.</p>
            )}
          </div>
        </div>

        {/* Contributor Footer */}
        <div className="mt-16 pt-8 text-center border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
            Contributed by: {raag.contributor || "Anonymous"}
          </p>
        </div>

      </div>
    </main>
  );
}