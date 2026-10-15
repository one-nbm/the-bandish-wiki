import fs from 'fs';
import path from 'path';

// Read .env.local to get Supabase credentials
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim().replace(/['"]/g, '');
const supabaseKey = keyMatch[1].trim().replace(/['"]/g, '');

const surMalhar = {
  id: '0042',
  slug: 'sur-malhar',
  name: 'Sur Malhar',
  thaat: 'Kafi',
  samay: 'Monsoon Season (Midday / 12 PM - 3 PM)',
  aaroh: "S R m P N S'",
  avaroh: "S' n D P m D P m R 'N S",
  vadi: 'Madhyam (m)',
  samvadi: 'Shadaj (S)',
  description: 'Raag Sur Malhar (also widely known as Surdasi Malhar) is an evocative monsoon raga belonging to the Kafi Thaat. Attributed according to legend to the poet-saint Surdas, it represents an exquisite synthesis of Sarang ang and Malhar ang. It is Audav-Shadav in nature, completely omitting Gandhar (Ga) and omitting Dhaivat (Dha) in the ascent. The raga employs both natural and flat Nishad: Shuddha Nishad in the ascent (S R m P N S\') and Komal Nishad in the descent (S\' n D P). Characteristic melodic motifs revolve around emphatic movements around Taar Shadaj and gliding Malhar phrases like "m R P m D P", summoning the atmosphere of gathering monsoon clouds, lightning, and torrential rain.',
  contributor: 'Neil Lote'
};

async function insertSurMalhar() {
  console.log("Checking if Sur Malhar already exists in 'raags' table...");

  const checkRes = await fetch(`${supabaseUrl}/rest/v1/raags?slug=eq.sur-malhar`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  });

  const existing = await checkRes.json();
  if (Array.isArray(existing) && existing.length > 0) {
    console.log("Raag Sur Malhar already exists with ID:", existing[0].id);
    return existing[0];
  }

  console.log("Inserting Raag Sur Malhar into 'raags' table...");

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/raags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: 'return=representation'
    },
    body: JSON.stringify(surMalhar)
  });

  if (!insertRes.ok) {
    const errorText = await insertRes.text();
    console.error("Failed to insert Raag:", insertRes.status, errorText);
    process.exit(1);
  }

  const inserted = await insertRes.json();
  console.log("Successfully inserted Raag Sur Malhar:", inserted);
  return inserted;
}

insertSurMalhar().catch(err => {
  console.error("Error executing insertion:", err);
  process.exit(1);
});
