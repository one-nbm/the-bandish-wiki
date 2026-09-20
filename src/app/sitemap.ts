import { MetadataRoute } from 'next';
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch all bandishes
  const { data: bandishes } = await supabase.from("bandishes").select("id, updated_at");
  
  // Fetch all raags
  const { data: raags } = await supabase.from("raags").select("slug, updated_at");

  const baseUrl = 'https://bandish-wiki.vercel.app';

  const bandishUrls = (bandishes || []).map((bandish) => ({
    url: `${baseUrl}/bandish/${bandish.id}`,
    lastModified: bandish.updated_at ? new Date(bandish.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const raagUrls = (raags || []).map((raag) => ({
    url: `${baseUrl}/raag/${raag.slug}`,
    lastModified: raag.updated_at ? new Date(raag.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...raagUrls,
    ...bandishUrls,
  ];
}
