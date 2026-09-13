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
  
  const contributorName = user?.user_metadata?.contributor_name || "Neil Lote";

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
    <div className="w-full max-w-5xl mx-auto mt-4 md:mt-8 p-6 md:p-12 mb-16 rounded-3xl bg-transparent transition-colors duration-500 min-h-[60vh] relative">
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-m3-primary/10 dark:bg-m3-primary-dark/5 blur-[100px] rounded-full pointer-events-none transition-colors duration-500" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            Editor Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Manage your contributions and settings
          </p>
        </div>
      </div>

      <EditorDashboard 
        initialName={contributorName} 
        bandishCount={bandishCount || 0} 
        raagCount={raagCount || 0} 
      />
    </div>
  );
}

