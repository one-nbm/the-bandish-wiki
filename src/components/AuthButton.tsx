import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getUserRole } from "@/app/actions";
import UserAccountMenu, { ContributionNotification } from "./UserAccountMenu";
import SignInModal from "./SignInModal";

export default async function AuthButton() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <SignInModal />;
  }

  const role = await getUserRole();

  let pendingRequestsCount = 0;
  let contributionNotifications: ContributionNotification[] = [];

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // If user is Admin: fetch total pending requests count
  if (role === "admin") {
    const { count } = await supabaseAdmin
      .from("contributions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    pendingRequestsCount = count || 0;
  }

  // Fetch approved or deleted contributions for this user's email
  if (user.email) {
    const { data: notifs } = await supabaseAdmin
      .from("contributions")
      .select("id, title, type, status, reviewer_notes, reviewed_at")
      .eq("contributor_email", user.email)
      .in("status", ["approved", "deleted"])
      .order("reviewed_at", { ascending: false })
      .limit(15);
    contributionNotifications = (notifs as ContributionNotification[]) || [];
  }

  return (
    <UserAccountMenu
      email={user.email || "User"}
      role={role}
      pendingRequestsCount={pendingRequestsCount}
      contributionNotifications={contributionNotifications}
    />
  );
}
