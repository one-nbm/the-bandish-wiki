"use server";

import { createClient } from '@supabase/supabase-js';

export async function addBandishSecurely(newBandish: any, userPasscode: string) {
  // 1. Check the password!
  if (userPasscode !== process.env.ADMIN_PASSCODE) {
    return { success: false, error: "Incorrect admin passcode." };
  }

  // 2. Create an ADMIN Supabase client using the secret service_role key
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 3. Insert the data (The admin key overrides RLS)
  const { error } = await supabaseAdmin
    .from('bandishes')
    .insert([newBandish]);

  if (error) {
    console.error("Database error:", error);
    return { success: false, error: "Failed to save to database." };
  }

  return { success: true };
}

export async function updateBandishSecurely(id: string, updatedBandish: any, userPasscode: string) {
  // 1. Check the password
  if (userPasscode !== process.env.ADMIN_PASSCODE) {
    return { success: false, error: "Incorrect admin passcode." };
  }

  // 2. Create the ADMIN client
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 3. Update the specific row that matches our ID
  const { error } = await supabaseAdmin
    .from('bandishes')
    .update(updatedBandish)
    .eq('id', id);

  if (error) {
    console.error("Database error:", error);
    return { success: false, error: "Failed to update database." };
  }

  return { success: true };
}