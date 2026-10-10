import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getUserRole } from "@/app/actions";
import UserAccountMenu, { ApprovedContributionNotification } from "./UserAccountMenu";
import SignInModal from "./SignInModal";

export default async function AuthButton() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <SignInModal />;
  }

  const role = await getUserRole();

  let pendingRequestsCount = 0;
  let approvedContributions: ApprovedContributionNotification[] = [];

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

  // Fetch approved contributions for this user's email
  if (user.email) {
    const { data: approved } = await supabaseAdmin
      .from("contributions")
      .select("id, title, type, reviewed_at")
      .eq("contributor_email", user.email)
      .eq("status", "approved")
      .order("reviewed_at", { ascending: false })
      .limit(10);
    approvedContributions = (approved as ApprovedContributionNotification[]) || [];
  }

  return (
    <UserAccountMenu
      email={user.email || "User"}
      role={role}
      pendingRequestsCount={pendingRequestsCount}
      approvedContributions={approvedContributions}
    />
  );
}
