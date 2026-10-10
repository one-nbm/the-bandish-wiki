"use server";

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

export type UserRole = 'viewer' | 'contributor' | 'admin';

// ─── Role Resolution & Authorization Helpers ──────────────────────────────

export async function getUserRole(): Promise<UserRole> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) return 'viewer';

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin
    .from('editors')
    .select('role')
    .eq('email', user.email)
    .single();

  if (error || !data) return 'viewer';
  return (data.role as UserRole) || 'viewer';
}

// Backwards-compatible check: returns true if user is contributor or admin
export async function checkIsEditor(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin' || role === 'contributor';
}

// Specific check for Level 3 Admin
export async function checkIsAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

async function getAuthenticatedUserWithRole() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return { user: null, role: 'viewer' as UserRole, supabaseAdmin: null, error: "Not authenticated." };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabaseAdmin
    .from('editors')
    .select('role')
    .eq('email', user.email)
    .single();

  const role = (data?.role as UserRole) || 'viewer';
  return { user, role, supabaseAdmin, error: null };
}

async function authorizeAdmin() {
  const auth = await getAuthenticatedUserWithRole();
  if (!auth.user || auth.role !== 'admin' || !auth.supabaseAdmin) {
    return { authorized: false, error: auth.error || "Unauthorized: Administrator privileges required.", supabaseAdmin: null, user: null };
  }
  return { authorized: true, error: null, supabaseAdmin: auth.supabaseAdmin, user: auth.user };
}

async function authorizeContributorOrAdmin() {
  const auth = await getAuthenticatedUserWithRole();
  if (!auth.user || (auth.role !== 'admin' && auth.role !== 'contributor') || !auth.supabaseAdmin) {
    return { authorized: false, error: auth.error || "Unauthorized: Contributor privileges required.", supabaseAdmin: null, user: null, role: auth.role };
  }
  return { authorized: true, error: null, supabaseAdmin: auth.supabaseAdmin, user: auth.user, role: auth.role };
}

// ─── Raag Actions (Direct Admin Mutations) ─────────────────────────────────

export async function deleteRaagSecurely(slug: string) {
  const { authorized, error, supabaseAdmin } = await authorizeAdmin();
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
  const { authorized, error, supabaseAdmin } = await authorizeAdmin();
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
  const { authorized, error, supabaseAdmin } = await authorizeAdmin();
  if (!authorized || !supabaseAdmin) return { success: false, error: error ?? "Unauthorized" };

  const raagToInsert = { ...newRaag };

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

// ─── Bandish Actions (Direct Admin Mutations) ──────────────────────────────

export async function addBandishSecurely(newBandish: any) {
  const { authorized, error, supabaseAdmin } = await authorizeAdmin();
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
  const { authorized, error, supabaseAdmin } = await authorizeAdmin();
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
  const { authorized, error, supabaseAdmin } = await authorizeAdmin();
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
  const { authorized, error, supabaseAdmin } = await authorizeAdmin();
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

// ─── Contributor Submissions (Approval Queue) ─────────────────────────────

export async function submitBandishContribution(bandishData: any, notes?: string) {
  const { authorized, error, supabaseAdmin, user } = await authorizeContributorOrAdmin();
  if (!authorized || !supabaseAdmin || !user) return { success: false, error: error ?? "Unauthorized" };

  const contributorName = user.user_metadata?.contributor_name || user.email?.split('@')[0] || "Anonymous";

  const { data, error: dbError } = await supabaseAdmin
    .from('contributions')
    .insert([{
      type: 'new_bandish',
      status: 'pending',
      title: bandishData.title || 'Untitled Bandish',
      data: { ...bandishData, contributor: contributorName },
      contributor_email: user.email!,
      contributor_name: contributorName,
      contributor_notes: notes || null
    }])
    .select()
    .single();

  if (dbError) {
    console.error("Contribution submission error:", dbError);
    return { success: false, error: "Failed to submit bandish for approval." };
  }

  return { success: true, data };
}

export async function submitBandishEdit(targetId: string, updatedData: any, originalData: any, notes?: string) {
  const { authorized, error, supabaseAdmin, user } = await authorizeContributorOrAdmin();
  if (!authorized || !supabaseAdmin || !user) return { success: false, error: error ?? "Unauthorized" };

  const contributorName = user.user_metadata?.contributor_name || user.email?.split('@')[0] || "Anonymous";

  const { data, error: dbError } = await supabaseAdmin
    .from('contributions')
    .insert([{
      type: 'edit_bandish',
      status: 'pending',
      target_id: targetId,
      title: updatedData.title || originalData?.title || 'Bandish Edit',
      data: updatedData,
      original_data: originalData || null,
      contributor_email: user.email!,
      contributor_name: contributorName,
      contributor_notes: notes || null
    }])
    .select()
    .single();

  if (dbError) {
    console.error("Edit submission error:", dbError);
    return { success: false, error: "Failed to submit edit for approval." };
  }

  return { success: true, data };
}

export async function submitRaagContribution(raagData: any, notes?: string) {
  const { authorized, error, supabaseAdmin, user } = await authorizeContributorOrAdmin();
  if (!authorized || !supabaseAdmin || !user) return { success: false, error: error ?? "Unauthorized" };

  const contributorName = user.user_metadata?.contributor_name || user.email?.split('@')[0] || "Anonymous";

  const { data, error: dbError } = await supabaseAdmin
    .from('contributions')
    .insert([{
      type: 'new_raag',
      status: 'pending',
      title: raagData.name || 'Untitled Raag',
      data: { ...raagData, contributor: contributorName },
      contributor_email: user.email!,
      contributor_name: contributorName,
      contributor_notes: notes || null
    }])
    .select()
    .single();

  if (dbError) {
    console.error("Raag contribution error:", dbError);
    return { success: false, error: "Failed to submit raag for approval." };
  }

  return { success: true, data };
}

export async function submitRaagEdit(targetSlug: string, updatedData: any, originalData: any, notes?: string) {
  const { authorized, error, supabaseAdmin, user } = await authorizeContributorOrAdmin();
  if (!authorized || !supabaseAdmin || !user) return { success: false, error: error ?? "Unauthorized" };

  const contributorName = user.user_metadata?.contributor_name || user.email?.split('@')[0] || "Anonymous";

  const { data, error: dbError } = await supabaseAdmin
    .from('contributions')
    .insert([{
      type: 'edit_raag',
      status: 'pending',
      target_id: targetSlug,
      title: updatedData.name || originalData?.name || 'Raag Edit',
      data: updatedData,
      original_data: originalData || null,
      contributor_email: user.email!,
      contributor_name: contributorName,
      contributor_notes: notes || null
    }])
    .select()
    .single();

  if (dbError) {
    console.error("Raag edit submission error:", dbError);
    return { success: false, error: "Failed to submit raag edit for approval." };
  }

  return { success: true, data };
}

export async function submitRenditionContribution(bandishId: string, renditionData: any, notes?: string) {
  const { authorized, error, supabaseAdmin, user } = await authorizeContributorOrAdmin();
  if (!authorized || !supabaseAdmin || !user) return { success: false, error: error ?? "Unauthorized" };

  const contributorName = user.user_metadata?.contributor_name || user.email?.split('@')[0] || "Anonymous";

  const { data, error: dbError } = await supabaseAdmin
    .from('contributions')
    .insert([{
      type: 'new_rendition',
      status: 'pending',
      target_id: bandishId,
      title: renditionData.title || renditionData.artist || 'New Rendition',
      data: renditionData,
      contributor_email: user.email!,
      contributor_name: contributorName,
      contributor_notes: notes || null
    }])
    .select()
    .single();

  if (dbError) {
    console.error("Rendition submission error:", dbError);
    return { success: false, error: "Failed to submit rendition for approval." };
  }

  return { success: true, data };
}

export async function getMyContributions() {
  const { authorized, error, supabaseAdmin, user } = await authorizeContributorOrAdmin();
  if (!authorized || !supabaseAdmin || !user) return { success: false, error: error ?? "Unauthorized", data: [] };

  const { data, error: dbError } = await supabaseAdmin
    .from('contributions')
    .select('*')
    .eq('contributor_email', user.email)
    .order('created_at', { ascending: false });

  if (dbError) {
    console.error("Fetch contributions error:", dbError);
    return { success: false, error: "Failed to fetch contributions.", data: [] };
  }

  return { success: true, data: data || [] };
}

// ─── Admin Review & Approval Queue Actions ────────────────────────────────

export async function getPendingContributions() {
  const { authorized, error, supabaseAdmin } = await authorizeAdmin();
  if (!authorized || !supabaseAdmin) return { success: false, error: error ?? "Unauthorized", data: [] };

  const { data, error: dbError } = await supabaseAdmin
    .from('contributions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (dbError) {
    console.error("Fetch pending contributions error:", dbError);
    return { success: false, error: "Failed to fetch pending contributions.", data: [] };
  }

  return { success: true, data: data || [] };
}

export async function approveContribution(contributionId: string) {
  const { authorized, error, supabaseAdmin, user } = await authorizeAdmin();
  if (!authorized || !supabaseAdmin || !user) return { success: false, error: error ?? "Unauthorized" };

  const { data: item, error: fetchError } = await supabaseAdmin
    .from('contributions')
    .select('*')
    .eq('id', contributionId)
    .single();

  if (fetchError || !item) {
    return { success: false, error: "Contribution not found." };
  }

  if (item.status !== 'pending') {
    return { success: false, error: `Contribution is already ${item.status}.` };
  }

  if (item.type === 'new_bandish') {
    const bandishToInsert = { ...item.data };
    if (!bandishToInsert.id) {
      const { data: existingBandishes } = await supabaseAdmin.from('bandishes').select('id');
      const currentIds = (existingBandishes || [])
        .map((b: any) => parseInt(b.id, 10))
        .filter((n: number) => !isNaN(n));
      const maxId = currentIds.length > 0 ? Math.max(...currentIds) : 0;
      bandishToInsert.id = String(maxId + 1);
    }
    const { error: insertErr } = await supabaseAdmin.from('bandishes').insert([bandishToInsert]);
    if (insertErr) {
      console.error("Approve insert bandish error:", insertErr);
      return { success: false, error: "Failed to publish bandish into library." };
    }
  } else if (item.type === 'edit_bandish') {
    const { error: updateErr } = await supabaseAdmin
      .from('bandishes')
      .update(item.data)
      .eq('id', item.target_id);
    if (updateErr) {
      console.error("Approve update bandish error:", updateErr);
      return { success: false, error: "Failed to update bandish in library." };
    }
  } else if (item.type === 'new_raag') {
    const raagToInsert = { ...item.data };
    if (!raagToInsert.id) {
      const { data: existingRaags } = await supabaseAdmin.from('raags').select('id');
      const currentIds = (existingRaags || [])
        .map((r: any) => parseInt(r.id, 10))
        .filter((n: number) => !isNaN(n));
      const maxId = currentIds.length > 0 ? Math.max(...currentIds) : 0;
      raagToInsert.id = String(maxId + 1).padStart(4, '0');
    }
    const { error: insertErr } = await supabaseAdmin.from('raags').insert([raagToInsert]);
    if (insertErr) {
      console.error("Approve insert raag error:", insertErr);
      return { success: false, error: "Failed to publish raag into library." };
    }
  } else if (item.type === 'edit_raag') {
    const { error: updateErr } = await supabaseAdmin
      .from('raags')
      .update(item.data)
      .eq('slug', item.target_id);
    if (updateErr) {
      console.error("Approve update raag error:", updateErr);
      return { success: false, error: "Failed to update raag in library." };
    }
  } else if (item.type === 'new_rendition') {
    const { data: targetBandish, error: targetErr } = await supabaseAdmin
      .from('bandishes')
      .select('youtube_renditions')
      .eq('id', item.target_id)
      .single();

    if (targetErr || !targetBandish) {
      return { success: false, error: "Target bandish not found for rendition." };
    }

    const currentRenditions = Array.isArray(targetBandish.youtube_renditions)
      ? [...targetBandish.youtube_renditions]
      : [];
    currentRenditions.push(item.data);

    const { error: renditionUpdateErr } = await supabaseAdmin
      .from('bandishes')
      .update({ youtube_renditions: currentRenditions })
      .eq('id', item.target_id);

    if (renditionUpdateErr) {
      console.error("Approve rendition error:", renditionUpdateErr);
      return { success: false, error: "Failed to add rendition to bandish." };
    }
  }

  const { error: updateStatusErr } = await supabaseAdmin
    .from('contributions')
    .update({
      status: 'approved',
      reviewer_email: user.email,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', contributionId);

  if (updateStatusErr) {
    console.error("Update contribution status error:", updateStatusErr);
  }

  return { success: true };
}

export async function denyContribution(contributionId: string, reason?: string) {
  const { authorized, error, supabaseAdmin, user } = await authorizeAdmin();
  if (!authorized || !supabaseAdmin || !user) return { success: false, error: error ?? "Unauthorized" };

  const { error: updateStatusErr } = await supabaseAdmin
    .from('contributions')
    .update({
      status: 'rejected',
      reviewer_email: user.email,
      reviewer_notes: reason || null,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', contributionId);

  if (updateStatusErr) {
    console.error("Deny contribution error:", updateStatusErr);
    return { success: false, error: "Failed to reject contribution." };
  }

  return { success: true };
}

// ─── Index Queue Actions ───────────────────────────────────────────────────

export async function getRenditionsToIndex() {
  const { authorized, error, supabaseAdmin } = await authorizeContributorOrAdmin();
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
  const { authorized, error, supabaseAdmin } = await authorizeContributorOrAdmin();
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
  const { authorized, error, supabaseAdmin } = await authorizeContributorOrAdmin();
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
  const { authorized, error, supabaseAdmin } = await authorizeContributorOrAdmin();
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
