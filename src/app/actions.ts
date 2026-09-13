"use server";

import { createClient } from '@supabase/supabase-js';

export async function deleteRaagSecurely(slug: string, userPasscode: string) {
  if (userPasscode !== process.env.ADMIN_PASSCODE) {
    return { success: false, error: "Incorrect admin passcode." };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('raags')
    .delete()
    .eq('slug', slug);

  if (error) {
    console.error("Delete error:", error);
    return { success: false, error: "Failed to delete from database." };
  }

  return { success: true };
}

export async function updateRaagSecurely(slug: string, updatedRaag: any, userPasscode: string) {
  if (userPasscode !== process.env.ADMIN_PASSCODE) {
    return { success: false, error: "Incorrect admin passcode." };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('raags')
    .update(updatedRaag)
    .eq('slug', slug);

  if (error) {
    console.error("Database error:", error);
    return { success: false, error: "Failed to update database." };
  }

  return { success: true };
}

export async function addRaagSecurely(newRaag: any, userPasscode: string) {
  if (userPasscode !== process.env.ADMIN_PASSCODE) {
    return { success: false, error: "Incorrect admin passcode." };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('raags')
    .insert([newRaag]);

  if (error) {
    console.error("Database error:", error);
    if (error.code === '23505') {
      return { success: false, error: "A Raag with this name/slug already exists." };
    }
    return { success: false, error: "Failed to save to database." };
  }

  return { success: true };
}

export async function addBandishSecurely(newBandish: any, userPasscode: string) {
  if (userPasscode !== process.env.ADMIN_PASSCODE) {
    return { success: false, error: "Incorrect admin passcode." };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin
    .from('bandishes')
    .insert([newBandish])
    .select();

  if (error) {
    console.error("Database error:", error);
    return { success: false, error: "Failed to save to database." };
  }

  return { success: true, data };
}

export async function updateBandishSecurely(id: string, updatedBandish: any, userPasscode: string) {
  if (userPasscode !== process.env.ADMIN_PASSCODE) {
    return { success: false, error: "Incorrect admin passcode." };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin
    .from('bandishes')
    .update(updatedBandish)
    .eq('id', id)
    .select();

  if (error) {
    console.error("Database error:", error);
    return { success: false, error: "Failed to update database." };
  }

  return { success: true, data };
}

export async function deleteBandishSecurely(id: string, userPasscode: string) {
  if (userPasscode !== process.env.ADMIN_PASSCODE) {
    return { success: false, error: "Incorrect admin passcode." };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('bandishes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Delete error:", error);
    return { success: false, error: "Failed to delete from database." };
  }

  return { success: true };
}

export async function bulkAddBandishesSecurely(bandishesArray: any[], userPasscode: string) {
  // 1. Check the password
  if (userPasscode !== process.env.ADMIN_PASSCODE) {
    return { success: false, error: "Incorrect admin passcode." };
  }

  // 2. Create the ADMIN client
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 3. Insert the entire array at once!
  const { error } = await supabaseAdmin
    .from('bandishes')
    .insert(bandishesArray);

  if (error) {
    console.error("Bulk insert error:", error);
    return { success: false, error: "Failed to bulk upload to database." };
  }

  return { success: true };
}
import { createClient as createServerClient } from '@/utils/supabase/server';

export async function checkIsAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const adminEmailsString = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "";
  const adminEmails = adminEmailsString.split(',').map(e => e.trim().toLowerCase()).filter(e => e !== "");
  
  if (adminEmails.length === 0) return false;
  return adminEmails.includes(user.email?.toLowerCase() || "");
}
