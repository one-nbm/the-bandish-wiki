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

  const { error: dbError } = await supabaseAdmin
    .from('raags')
    .insert([newRaag]);

  if (dbError) {
    console.error("Database error:", dbError);
    if (dbError.code === '23505') {
      return { success: false, error: "A Raag with this name/slug already exists." };
    }
    return { success: false, error: "Failed to save to database." };
  }

  return { success: true };
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

export async function bulkAddBandishesSecurely(bandishesArray: any[]) {
  const { authorized, error, supabaseAdmin } = await authorizeEditor();
  if (!authorized || !supabaseAdmin) return { success: false, error: error ?? "Unauthorized" };

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

// Keep the old name as an alias so existing callers don't break during migration
export { checkIsEditor as checkIsAdmin };
