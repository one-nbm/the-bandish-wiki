import { checkIsAdmin } from "@/app/actions";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import EditorDashboard from "./EditorDashboard";

export default async function EditorPage() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const contributorName = user?.user_metadata?.contributor_name || "Anonymous";

  // Fetch counts
  const { count: bandishCount } = await supabase
    .from("bandishes")
    .select("*", { count: "exact", head: true })
    .eq("contributor", contributorName);
    
  const { count: raagCount } = await supabase
    .from("raags")
    .select("*", { count: "exact", head: true })
    .eq("contributor", contributorName);

  return (
    <main className="min-h-screen bg-transparent relative transition-colors duration-500">
      
      {/* Ambient Background Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-m3-primary/20 dark:bg-m3-primary-dark/10 blur-[100px] rounded-full pointer-events-none opacity-50" />

      <div className="max-w-5xl mx-auto mt-4 md:mt-8 p-6 md:p-12 relative z-10">
        
        {/* Editor Header */}
        <div className="mb-12">
          <h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight"
            style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}
          >
            Editor Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Manage your contributions and settings
          </p>
        </div>

      <EditorDashboard 
        initialName={contributorName} 
        bandishCount={bandishCount || 0} 
        raagCount={raagCount || 0} 
      />
      </div>
    </main>
  );
}

