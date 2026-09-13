import { createClient } from "@/utils/supabase/server";
import { checkIsAdmin } from "@/app/actions";
import UserAccountMenu from "./UserAccountMenu";
import SignInModal from "./SignInModal";

export default async function AuthButton() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <SignInModal />;
  }

  const isAdmin = await checkIsAdmin();

  return <UserAccountMenu email={user.email || "User"} isAdmin={isAdmin} />;
}

