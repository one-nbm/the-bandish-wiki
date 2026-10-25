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

const raagAbhogi = {
  id: '0044',
  slug: 'abhogi',
  name: 'Abhogi',
  thaat: 'Kafi',
  samay: 'Late Evening / Night (9 PM – 12 AM)',
  aaroh: "S R g m D S'",
  avaroh: "S' D m g R S",
  vadi: 'Madhyam (m)',
  samvadi: 'Shadaj (S)',
  description: "Raag Abhogi (also known as Abhogi Kanada) is an Audav-Audav (pentatonic) raga adopted into the Hindustani classical tradition from Carnatic music. Belonging to Kafi Thaat, it completely omits Pancham (P) and Nishad (N), utilizing Shuddha Rishabh (R), Komal Gandhar (g), Shuddha Madhyam (m), and Shuddha Dhaivat (D). It evokes a deeply meditative, serene, and majestic mood during the second prahar of the night. In the Hindustani tradition, artists frequently weave Kanada nuances through slow oscillation (andolan) on Komal Gandhar ('(m)g~R S') and graceful melodic sweeps between Dhaivat and Madhyam ('D - m').",
  contributor: 'Neil Lote'
};

const bandishAbhogi = {
  id: '9699',
  title: 'Laaj Rakho Mori',
  raag: 'Abhogi',
  taal: 'Ektaal',
  composer: 'Traditional',
  lay: ['Dhrut'],
  lyrics: {
    devanagari: "स्थाई:\nलाज रखो मोरी तुम तो दाता\nमोरी लाज रखो दाता तुम तो दाता\n\nअंतरा:\nहम गरीब तुम दाता\nतुम तो गरीब नवाज\nलाज रखो मोरी दाता",
    english: "Sthai:\nLaaj rakho mori tum to daata\nMori laaj rakho daata tum to daata\n\nAntara:\nHum gareeb tum daata\nTum to gareeb nawaaz\nLaaj rakho mori daata"
  },
  youtube_renditions: [
    {
      url: "https://www.youtube.com/watch?v=F0Kq_Y62y_s",
      year: "1975",
      artist: "Pandit Bhimsen Joshi",
      isVideo: false,
      bandishes: ["Laaj Rakho Mori"]
    }
  ],
  contributor: 'Neil Lote',
  tradition: 'Kirana Gharana'
};

async function insertAbhogi() {
  console.log("Checking if Raag Abhogi already exists in 'raags' table...");

  const checkRaagRes = await fetch(`${supabaseUrl}/rest/v1/raags?slug=eq.abhogi`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  });

  const existingRaags = await checkRaagRes.json();
  if (Array.isArray(existingRaags) && existingRaags.length > 0) {
    console.log("Raag Abhogi already exists with ID:", existingRaags[0].id);
  } else {
    console.log("Inserting Raag Abhogi into 'raags' table...");
    const insertRaagRes = await fetch(`${supabaseUrl}/rest/v1/raags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'return=representation'
      },
      body: JSON.stringify(raagAbhogi)
    });

    if (!insertRaagRes.ok) {
      const errorText = await insertRaagRes.text();
      console.error("Failed to insert Raag Abhogi:", insertRaagRes.status, errorText);
      process.exit(1);
    }

    const insertedRaag = await insertRaagRes.json();
    console.log("Successfully inserted Raag Abhogi:", insertedRaag);
  }

  // Check bandish
  console.log("Checking if bandish 'Laaj Rakho Mori' already exists in 'bandishes' table...");
  const checkBandishRes = await fetch(`${supabaseUrl}/rest/v1/bandishes?id=eq.9699`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  });

  const existingBandishes = await checkBandishRes.json();
  if (Array.isArray(existingBandishes) && existingBandishes.length > 0) {
    console.log("Bandish already exists with ID:", existingBandishes[0].id);
  } else {
    console.log("Inserting bandish 'Laaj Rakho Mori' into 'bandishes' table...");
    const insertBandishRes = await fetch(`${supabaseUrl}/rest/v1/bandishes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'return=representation'
      },
      body: JSON.stringify(bandishAbhogi)
    });

    if (!insertBandishRes.ok) {
      const errorText = await insertBandishRes.text();
      console.error("Failed to insert Bandish:", insertBandishRes.status, errorText);
    } else {
      const insertedBandish = await insertBandishRes.json();
      console.log("Successfully inserted Bandish:", insertedBandish);
    }
  }

  // Ping IndexNow
  try {
    const host = "bandish-wiki.vercel.app";
    const key = "8f7b3c21a4e54823b190f898317d65ac";
    const keyLocation = `https://${host}/${key}.txt`;
    const urls = [
      `https://${host}/raag/abhogi`,
      `https://${host}/raags`,
      `https://${host}/bandish/9699`
    ];

    console.log("Submitting URLs to IndexNow:", urls);
    const indexNowRes = await fetch("https://www.bing.com/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, keyLocation, urlList: urls }),
    });

    console.log(`IndexNow status: ${indexNowRes.status} ${indexNowRes.statusText}`);
  } catch (err) {
    console.error("IndexNow ping failed:", err);
  }

  console.log("All operations completed successfully!");
}

insertAbhogi().catch(err => {
  console.error("Error executing insertion:", err);
  process.exit(1);
});
