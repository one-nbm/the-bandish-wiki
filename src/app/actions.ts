"use server";

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

// Helper: check if currently-authenticated user is in the editors table
async function authorizeEditor() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return { authorized: false, error: "Not authenticated." };
  }

  // Use service-role client to query editors table (bypasses any RLS on that table)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin
    .from('editors')
    .select('email')
    .eq('email', user.email)
    .single();

  if (error || !data) {
    return { authorized: false, error: "Unauthorized: you are not an editor." };
  }

  return { authorized: true, error: null, supabaseAdmin };
}

// ─── Raag actions ──────────────────────────────────────────────────────────

export async function deleteRaagSecurely(slug: string) {
  const { authorized, error, supabaseAdmin } = await authorizeEditor();
  if (!authorized || !supabaseAdmin) return { success: false, error: error ?? "Unauthorized" };

  const { error: dbError } = await supabaseAdmin
    .from('raags')
    .delete()
    .eq('slug', slug);

  if (dbError) {
    console.error("Delete error:", dbError);
    return { success: false, error: "Failed to delete from database." };
  }

  return { success: true };
}

export async function updateRaagSecurely(slug: string, updatedRaag: any) {
  const { authorized, error, supabaseAdmin } = await authorizeEditor();
  if (!authorized || !supabaseAdmin) return { success: false, error: error ?? "Unauthorized" };

  const { error: dbError } = await supabaseAdmin
    .from('raags')
    .update(updatedRaag)
    .eq('slug', slug);

  if (dbError) {
    console.error("Database error:", dbError);
    return { success: false, error: "Failed to update database." };
  }

  return { success: true };
}

export async function addRaagSecurely(newRaag: any) {
  const { authorized, error, supabaseAdmin } = await authorizeEditor();
  if (!authorized || !supabaseAdmin) return { success: false, error: error ?? "Unauthorized" };

  const raagToInsert = { ...newRaag };

  // If no ID is provided, calculate the next sequential 4-digit ID securely on the server
  if (!raagToInsert.id) {
    const { data: existingRaags, error: fetchError } = await supabaseAdmin
      .from("raags")
      .select("id");

    if (fetchError) {
      console.error("Fetch raags error:", fetchError);
      return { success: false, error: "Failed to allocate Raag ID." };
    }

    const currentIds = (existingRaags || [])
      .map((r: any) => parseInt(r.id, 10))
      .filter((n: number) => !isNaN(n));
    const maxId = currentIds.length > 0 ? Math.max(...currentIds) : 0;
    raagToInsert.id = String(maxId + 1).padStart(4, "0");
  }

  const { error: dbError } = await supabaseAdmin
    .from('raags')
    .insert([raagToInsert]);

  if (dbError) {
    console.error("Database error:", dbError);
    if (dbError.code === '23505') {
      return { success: false, error: "A Raag with this name/slug already exists." };
    }
    return { success: false, error: "Failed to save to database." };
  }

  return { success: true, id: raagToInsert.id };
}

// ─── Bandish actions ───────────────────────────────────────────────────────

export async function addBandishSecurely(newBandish: any) {
  const { authorized, error, supabaseAdmin } = await authorizeEditor();
  if (!authorized || !supabaseAdmin) return { success: false, error: error ?? "Unauthorized", data: null };

  const { data, error: dbError } = await supabaseAdmin
    .from('bandishes')
    .insert([newBandish])
    .select();

  if (dbError) {
    console.error("Database error:", dbError);
    return { success: false, error: "Failed to save to database.", data: null };
  }

  return { success: true, data };
}

export async function updateBandishSecurely(id: string, updatedBandish: any) {
  const { authorized, error, supabaseAdmin } = await authorizeEditor();
  if (!authorized || !supabaseAdmin) return { success: false, error: error ?? "Unauthorized", data: null };

  const { data, error: dbError } = await supabaseAdmin
    .from('bandishes')
    .update(updatedBandish)
    .eq('id', id)
    .select();

  if (dbError) {
    console.error("Database error:", dbError);
    return { success: false, error: "Failed to update database.", data: null };
  }

  return { success: true, data };
}

export async function deleteBandishSecurely(id: string) {
  const { authorized, error, supabaseAdmin } = await authorizeEditor();
  if (!authorized || !supabaseAdmin) return { success: false, error: error ?? "Unauthorized" };

  const { error: dbError } = await supabaseAdmin
    .from('bandishes')
    .delete()
    .eq('id', id);

  if (dbError) {
    console.error("Delete error:", dbError);
    return { success: false, error: "Failed to delete from database." };
  }

  return { success: true };
}

export async function bulkAddBandishesSecurely(bandishesArray: any[], passcode: string) {
  const { authorized, error, supabaseAdmin } = await authorizeEditor();
  if (!authorized || !supabaseAdmin) return { success: false, error: error ?? "Unauthorized" };

  if (passcode !== process.env.ADMIN_PASSCODE) {
    return { success: false, error: "Invalid Admin Passcode" };
  }

  const { error: dbError } = await supabaseAdmin
    .from('bandishes')
    .insert(bandishesArray);

  if (dbError) {
    console.error("Bulk insert error:", dbError);
    return { success: false, error: "Failed to bulk upload to database." };
  }

  return { success: true };
}

// ─── Authorization check (for UI) ─────────────────────────────────────────

export async function checkIsEditor(): Promise<boolean> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) return false;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin
    .from('editors')
    .select('email')
    .eq('email', user.email)
    .single();

  return !error && !!data;
}

// ─── Index queue actions ───────────────────────────────────────────────────

export async function getRenditionsToIndex() {
  const { authorized, error, supabaseAdmin } = await authorizeEditor();
  if (!authorized || !supabaseAdmin) return { success: false, error: error ?? "Unauthorized", data: null };

  const { data, error: dbError } = await supabaseAdmin
    .from('renditions_to_index')
    .select('*')
    .order('created_at', { ascending: false });

  if (dbError) {
    console.error("Fetch error:", dbError);
    return { success: false, error: "Failed to fetch list.", data: null };
  }

  return { success: true, data };
}

export async function addRenditionToIndex(title: string, url: string) {
  const { authorized, error, supabaseAdmin } = await authorizeEditor();
  if (!authorized || !supabaseAdmin) return { success: false, error: error ?? "Unauthorized" };

  const { error: dbError } = await supabaseAdmin
    .from('renditions_to_index')
    .insert([{ title, url }]);

  if (dbError) {
    console.error("Insert error:", dbError);
    return { success: false, error: "Failed to add rendition." };
  }

  return { success: true };
}

export async function deleteRenditionFromIndex(id: string) {
  const { authorized, error, supabaseAdmin } = await authorizeEditor();
  if (!authorized || !supabaseAdmin) return { success: false, error: error ?? "Unauthorized" };

  const { error: dbError } = await supabaseAdmin
    .from('renditions_to_index')
    .delete()
    .eq('id', id);

  if (dbError) {
    console.error("Delete error:", dbError);
    return { success: false, error: "Failed to delete rendition." };
  }

  return { success: true };
}

// ─── Rendition Sync & Autocomplete ─────────────────────────────────────────

export async function getAllBandishTitles() {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from('bandishes').select('title');
  if (error || !data) return { success: false, data: [] as string[] };
  return { success: true, data: data.map(b => b.title) };
}

export async function syncRenditionAcrossBandishes(
  oldRendition: any | null,
  newRendition: any | null
) {
  const { authorized, error, supabaseAdmin } = await authorizeEditor();
  if (!authorized || !supabaseAdmin) return { success: false, error: error ?? "Unauthorized" };

  const oldTitles = oldRendition?.bandishes || [];
  const newTitles = newRendition?.bandishes || [];
  const allAffectedTitles = Array.from(new Set([...oldTitles, ...newTitles]));

  if (allAffectedTitles.length === 0) return { success: true };

  const { data: bandishes, error: fetchError } = await supabaseAdmin
    .from('bandishes')
    .select('id, title, youtube_renditions')
    .in('title', allAffectedTitles);

  if (fetchError || !bandishes) {
    console.error("Fetch error:", fetchError);
    return { success: false, error: "Failed to fetch affected bandishes." };
  }

  const targetUrl = oldRendition ? oldRendition.url : newRendition?.url;

  for (const b of bandishes) {
    let renditions = Array.isArray(b.youtube_renditions) ? [...b.youtube_renditions] : [];
    const existingIndex = renditions.findIndex((r: any) => r.url === targetUrl);

    const shouldHaveRendition = newTitles.includes(b.title) && newRendition !== null;

    if (shouldHaveRendition) {
      if (existingIndex >= 0) {
        renditions[existingIndex] = newRendition;
      } else {
        renditions.push(newRendition);
      }
    } else {
      if (existingIndex >= 0) {
        renditions.splice(existingIndex, 1);
      }
    }

    await supabaseAdmin
      .from('bandishes')
      .update({ youtube_renditions: renditions })
      .eq('id', b.id);
  }

  return { success: true };
}
