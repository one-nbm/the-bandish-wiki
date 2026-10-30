import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditRaagModal from "./EditRaagModal";
import type { Metadata } from "next";
import { getUserRole } from "@/app/actions";

export async function generateStaticParams() {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: raags } = await supabase.from("raags").select("slug");
  return (raags || []).filter((r) => r.slug).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: raag } = await supabase.from("raags").select("*").eq("slug", slug).single();
  
  if (!raag) return { title: "Not Found | The Bandish Wiki" };

  const canonicalUrl = `https://bandish-wiki.vercel.app/raag/${slug}`;
  const description = `Explore Raag ${raag.name}: Thaat (${raag.thaat || "N/A"}), Samay (${raag.samay || "N/A"}), Vadi (${raag.vadi || "N/A"}), Samvadi (${raag.samvadi || "N/A"}), Aaroh and Avaroh notations, and traditional compositions.`;

  return {
    title: `Raag ${raag.name} - Thaat, Samay, Aaroh & Bandishes | The Bandish Wiki`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Raag ${raag.name} | The Bandish Wiki`,
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

  const role = await getUserRole();
  const isAdmin = role === "admin";

  // 2. Fetch all Bandishes associated with this Raag (excluding unpublished for non-admins)
  let bandishesQuery = supabase
    .from("bandishes")
    .select("id, title, taal, composer, is_published")
    .eq("raag", raag.name);

  if (!isAdmin) {
    bandishesQuery = bandishesQuery.neq("is_published", false);
  }

  const { data: associatedBandishes } = await bandishesQuery;

  // Schema.org Structured Data
  const raagJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `Raag ${raag.name} - Hindustani Classical Music Analysis`,
    "description": `Comprehensive analysis of Raag ${raag.name}, including Thaat ${raag.thaat || ""}, Samay ${raag.samay || ""}, Vadi ${raag.vadi || ""}, Samvadi ${raag.samvadi || ""}, and musical notations.`,
    "about": {
      "@type": "Thing",
      "name": `Raag ${raag.name}`,
      "description": "A melodic framework in Hindustani classical music tradition.",
    },
    "mainEntityOfPage": `https://bandish-wiki.vercel.app/raag/${slug}`,
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
        "name": `Raag ${raag.name}`,
        "item": `https://bandish-wiki.vercel.app/raag/${slug}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-transparent relative transition-colors duration-500">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(raagJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      
      {/* Ambient Background Glow (Pulled up to bleed behind the transparent navbar) */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-m3-primary/20 dark:bg-m3-primary-dark/10 blur-[100px] rounded-full pointer-events-none opacity-50" />

      <div className="max-w-5xl mx-auto mt-4 md:mt-8 p-6 md:p-12 relative z-10">
        
        <div className="flex items-center justify-between mb-10 animate-page-enter">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-m3-primary dark:text-m3-primary-dark font-bold hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-rounded text-[1.2rem]">arrow_back</span>
            Back to Wiki
          </Link>
          {(role === "admin" || role === "contributor") && <EditRaagModal raag={raag} userRole={role} />}
        </div>

        {/* Raag Header */}
        <div className="mb-12 animate-page-enter animate-page-delay-1">
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
        <div className="bg-m3-secondary/10 dark:bg-m3-secondary-dark/10 p-6 md:p-8 rounded-3xl mb-12 animate-page-enter animate-page-delay-2">
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
          <div className="mb-16 animate-page-enter animate-page-delay-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this Raag</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {raag.description}
            </p>
          </div>
        )}

        {/* Further Reading & Archival Notes Section */}
        {raag.further_reading && Array.isArray(raag.further_reading) && raag.further_reading.length > 0 && (
          <div className="mb-16 animate-page-enter animate-page-delay-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="material-symbols-rounded text-m3-primary dark:text-m3-primary-dark text-2xl">auto_stories</span>
              Further Reading & Archival Notes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {raag.further_reading.map((link: any, idx: number) => (
                <a
                  key={`further-reading-${idx}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white dark:bg-m3-surface-dark p-5 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-m3-primary dark:hover:border-m3-primary-dark transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-m3-secondary/10 dark:bg-m3-secondary-dark/10 text-m3-secondary dark:text-m3-secondary-dark">
                        {link.source || "Archive"}
                      </span>
                      <span className="material-symbols-rounded text-gray-400 group-hover:text-m3-primary dark:group-hover:text-m3-primary-dark transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-lg">
                        arrow_outward
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg group-hover:text-m3-primary dark:group-hover:text-m3-primary-dark transition-colors line-clamp-2">
                      {link.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 truncate font-mono">
                    {link.url.replace(/^https?:\/\/(www\.)?/, '')}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Associated Bandishes Hub */}
        <div className="animate-page-enter animate-page-delay-3">
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{b.title}</h3>
                      {b.is_published === false && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-500/20 dark:border-amber-400/20 uppercase tracking-wider">
                          <span className="material-symbols-rounded text-[11px]">lock</span> Admin
                        </span>
                      )}
                    </div>
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