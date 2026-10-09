import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:/Users/neill/bandish-wiki/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  const { data: bandishes, error } = await supabase.from('bandishes').select('id, taal');
  if (error) {
    console.error("Error fetching bandishes:", error);
    return;
  }

  for (const b of bandishes) {
    let t = b.taal;
    let lay = [];

    // Normalize known typo
    t = t.replace('Madhalay', 'Madhyalay');
    
    // Check for " / " which means multiple lays
    if (t.includes(' / ')) {
      const parts = t.split(' ');
      const taalName = parts[0]; // e.g., Tintal
      lay = parts.slice(1).filter(p => p !== '/'); // e.g. ["Madhyalay", "Dhrut"]
      t = taalName;
    } else {
      const parts = t.split(' ');
      if (parts.length > 1) {
        const lastPart = parts[parts.length - 1];
        if (["Vilambit", "Madhyalay", "Dhrut", "Drut", "Ati Drut", "Madhya"].includes(lastPart)) {
          lay = [lastPart];
          t = parts.slice(0, parts.length - 1).join(' ');
        } else {
          t = parts.join(' ');
        }
      }
    }

    console.log(`ID ${b.id} | Original: ${b.taal} -> Taal: ${t}, Lay:`, lay);

    const { error: updateError } = await supabase
      .from('bandishes')
      .update({ taal: t, lay: lay })
      .eq('id', b.id);
    
    if (updateError) {
      console.error("Update error for ID", b.id, updateError);
    }
  }

  console.log("Migration complete!");
}

migrateData();
