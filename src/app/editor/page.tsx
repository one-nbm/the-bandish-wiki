import { getUserRole, getPendingContributions, getMyContributions } from "@/app/actions";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import EditorDashboard from "./EditorDashboard";

export default async function EditorPage() {
  const role = await getUserRole();
  if (role === "viewer") {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const contributorName = user?.user_metadata?.contributor_name || "Anonymous";

  // Fetch user records, full database records, and queue records in parallel
  const [
    userBandishesRes, 
    userRaagsRes, 
    allBandishesRes, 
    allRaagsRes,
    pendingContributionsRes,
    myContributionsRes
  ] = await Promise.all([
    supabase
      .from("bandishes")
      .select("id, title, raag, taal, composer, lay, tradition", { count: "exact" })
      .eq("contributor", contributorName)
      .order("title", { ascending: true }),
    supabase
      .from("raags")
      .select("id, name, slug, thaat, samay, vadi, samvadi", { count: "exact" })
      .eq("contributor", contributorName)
      .order("name", { ascending: true }),
    supabase
      .from("bandishes")
      .select("id, title, raag, taal, composer, lay, tradition", { count: "exact" })
      .order("title", { ascending: true }),
    supabase
      .from("raags")
      .select("id, name, slug, thaat, samay, vadi, samvadi", { count: "exact" })
      .order("name", { ascending: true }),
    role === "admin" ? getPendingContributions() : Promise.resolve({ success: true, data: [] }),
    role === "contributor" ? getMyContributions() : Promise.resolve({ success: true, data: [] })
  ]);

  const userBandishes = userBandishesRes.data || [];
  const bandishCount = userBandishesRes.count || 0;
  const userRaags = userRaagsRes.data || [];
  const raagCount = userRaagsRes.count || 0;

  const allBandishes = allBandishesRes.data || [];
  const allRaags = allRaagsRes.data || [];

  const pendingContributions = (pendingContributionsRes as any).data || [];
  const myContributions = (myContributionsRes as any).data || [];

  return (
    <main className="min-h-screen bg-transparent relative transition-colors duration-500">
      
      {/* Ambient Background Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-m3-primary/20 dark:bg-m3-primary-dark/10 blur-[100px] rounded-full pointer-events-none opacity-50" />

      <div className="max-w-5xl mx-auto mt-4 md:mt-8 p-6 md:p-12 relative z-10">
        
        {/* Editor Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${
              role === "admin"
                ? "bg-m3-primary/10 text-m3-primary dark:bg-m3-primary-dark/20 dark:text-m3-primary-dark border border-m3-primary/20"
                : "bg-m3-tertiary/10 text-m3-tertiary dark:bg-m3-tertiary-dark/20 dark:text-m3-tertiary-dark border border-m3-tertiary/20"
            }`}>
              {role === "admin" ? "Administrator Access" : "Community Contributor"}
            </span>
          </div>
          <h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight"
            style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}
          >
            Editor Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Manage your compositions, theoretical contributions, and community submissions
          </p>
        </div>

        <EditorDashboard 
          initialName={contributorName} 
          userRole={role}
          bandishCount={bandishCount} 
          raagCount={raagCount} 
          userBandishes={userBandishes}
          userRaags={userRaags}
          allBandishes={allBandishes}
          allRaags={allRaags}
          pendingContributions={pendingContributions}
          myContributions={myContributions}
        />
      </div>
    </main>
  );
}
