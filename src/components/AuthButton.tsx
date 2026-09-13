import { createClient } from "@/utils/supabase/server";
import UserAccountMenu from "./UserAccountMenu";
import SignInModal from "./SignInModal";

export default async function AuthButton() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <SignInModal />;
  }

  return <UserAccountMenu email={user.email || "User"} />;
}

