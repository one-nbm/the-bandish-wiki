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

function normalizeTradition(val) {
  if (!val) return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  if (trimmed === "N/A" || trimmed === "None") return "N/A";

  const withCommas = trimmed.replace(/\//g, ",");
  const parts = withCommas
    .split(",")
    .map((p) => {
      const clean = p.replace(/\bgharana\b/gi, "").trim();
      return clean.replace(/\s+/g, " ");
    })
    .filter(Boolean);

  if (parts.length === 0) return null;

  const seen = new Set();
  const uniqueParts = [];
  for (const part of parts) {
    const lower = part.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      uniqueParts.push(part);
    }
  }

  if (uniqueParts.length === 1 && uniqueParts[0].toLowerCase() === "n/a") {
    return "N/A";
  }

  return uniqueParts.join(", ");
}

function normalizeLayItem(lay) {
  if (!lay) return "";
  const trimmed = lay.trim();
  if (trimmed.toLowerCase() === "madhyalay") {
    return "Madhyalay";
  }
  const cleaned = trimmed.replace(/\s+lay(a)?$/i, "").trim();
  return cleaned || trimmed;
}

function normalizeLayArray(lay) {
  if (!lay) return [];
  const rawList = Array.isArray(lay)
    ? lay.filter((item) => typeof item === "string")
    : typeof lay === "string"
    ? lay.split(",")
    : [];

  const cleaned = rawList.map(normalizeLayItem).filter(Boolean);
  return Array.from(new Set(cleaned));
}

function stripArtistTitles(name) {
  if (!name) return "";
  let cleaned = name.trim();
  const titlePrefixRegex = /^(?:(pandit|pt\.?|pnt\.?|ustad|ust\.?|vidushi|vid\.?|dr\.?|shri|smt\.?)\s+)+/gi;
  cleaned = cleaned.replace(titlePrefixRegex, "").trim();
  return cleaned;
}

async function runMigration() {
  console.log("Fetching all bandishes from Supabase...");
  const res = await fetch(`${supabaseUrl}/rest/v1/bandishes?select=id,title,tradition,lay,youtube_renditions`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  });

  if (!res.ok) {
    console.error("Failed to fetch bandishes:", res.status, await res.text());
    process.exit(1);
  }

  const bandishes = await res.json();
  console.log(`Fetched ${bandishes.length} bandishes. Analyzing discrepancies...`);

  let traditionUpdates = 0;
  let layUpdates = 0;
  let renditionUpdates = 0;
  let totalRowsUpdated = 0;

  for (const b of bandishes) {
    const patch = {};
    let rowChanged = false;

    // 1. Tradition normalization
    const originalTradition = b.tradition;
    const cleanTradition = normalizeTradition(originalTradition);
    if (cleanTradition !== originalTradition) {
      patch.tradition = cleanTradition;
      traditionUpdates++;
      rowChanged = true;
      console.log(`[Tradition Update] ${b.id} "${b.title}": "${originalTradition}" -> "${cleanTradition}"`);
    }

    // 2. Lay normalization
    const originalLay = b.lay;
    const cleanLay = normalizeLayArray(originalLay);
    if (JSON.stringify(cleanLay) !== JSON.stringify(originalLay)) {
      patch.lay = cleanLay;
      layUpdates++;
      rowChanged = true;
      console.log(`[Lay Update] ${b.id} "${b.title}":`, originalLay, "->", cleanLay);
    }

    // 3. YouTube Renditions artist titles
    if (Array.isArray(b.youtube_renditions) && b.youtube_renditions.length > 0) {
      let renditionsModified = false;
      const cleanRenditions = b.youtube_renditions.map((r) => {
        if (r && typeof r.artist === "string") {
          const stripped = stripArtistTitles(r.artist);
          if (stripped !== r.artist) {
            renditionsModified = true;
            console.log(`[Artist Title Stripped] ${b.id} "${b.title}": "${r.artist}" -> "${stripped}"`);
            return { ...r, artist: stripped };
          }
        }
        return r;
      });

      if (renditionsModified) {
        patch.youtube_renditions = cleanRenditions;
        renditionUpdates++;
        rowChanged = true;
      }
    }

    // Apply patch if changed
    if (rowChanged) {
      totalRowsUpdated++;
      const updateRes = await fetch(`${supabaseUrl}/rest/v1/bandishes?id=eq.${encodeURIComponent(b.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "return=minimal"
        },
        body: JSON.stringify(patch)
      });

      if (!updateRes.ok) {
        console.error(`Failed to update bandish ${b.id}:`, updateRes.status, await updateRes.text());
      }
    }
  }

  console.log("\n--- Migration Summary ---");
  console.log(`Total rows modified: ${totalRowsUpdated}`);
  console.log(`Tradition fields updated: ${traditionUpdates}`);
  console.log(`Lay fields updated: ${layUpdates}`);
  console.log(`Rendition artist fields updated: ${renditionUpdates}`);
  console.log("Migration complete!");
}

runMigration().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
