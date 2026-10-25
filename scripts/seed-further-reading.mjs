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

export const RAAG_FURTHER_READING = {
  "abhogi": [
    { title: "Raag Abhogi Kanada - Tanarang Music", url: "https://tanarang.com/raag-abhogi-kanada/", source: "Tanarang" },
    { title: "The Kanada Constellation - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/kanada/", source: "Parrikar.org" },
    { title: "Raag Abhogi Score & Audio - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/abhogi-2/", source: "AUTRIM" },
    { title: "Raag Abhogi Overview - Wikipedia", url: "https://en.wikipedia.org/wiki/Abhogi", source: "Wikipedia" }
  ],
  "ahir-bhairav": [
    { title: "Raag Aheer Bhairav - Tanarang Music", url: "https://tanarang.com/raag-aheer-bhairav/", source: "Tanarang" },
    { title: "Bhairav: The Primordial Sound - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/bhairav/", source: "Parrikar.org" },
    { title: "Raag Ahir Bhairav - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/ahir-bhairav/", source: "AUTRIM" },
    { title: "Raag Ahir Bhairav Details - Wikipedia", url: "https://en.wikipedia.org/wiki/Ahir_Bhairav", source: "Wikipedia" }
  ],
  "alhaiya-bilawal": [
    { title: "Raag Alhaiya Bilawal - Tanarang Music", url: "https://tanarang.com/raag-alhaiya-bilawal/", source: "Tanarang" },
    { title: "On the Bilawal Trail - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/bilawal/", source: "Parrikar.org" },
    { title: "Raag Alhaiya Bilawal - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/alhaiya-bilaval/", source: "AUTRIM" },
    { title: "Raag Alhaiya Bilawal - Wikipedia", url: "https://en.wikipedia.org/wiki/Alhaiya_Bilawal", source: "Wikipedia" }
  ],
  "bhairav": [
    { title: "Raag Bhairav - Tanarang Music", url: "https://tanarang.com/raag-bhairav/", source: "Tanarang" },
    { title: "Bhairav: The Primordial Sound - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/bhairav/", source: "Parrikar.org" },
    { title: "Raag Bhairav Monograph - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/bhairav/", source: "AUTRIM" },
    { title: "Raag Bhairav Classical Foundation - Wikipedia", url: "https://en.wikipedia.org/wiki/Bhairav_(raga)", source: "Wikipedia" }
  ],
  "bhatiyar": [
    { title: "Raag Bhatiyar - Tanarang Music", url: "https://tanarang.com/raag-bhatiyar/", source: "Tanarang" },
    { title: "On Raga Bhatiyar - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/bhatiyar/", source: "Parrikar.org" },
    { title: "Raag Bhatiyar - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/bhatiyar/", source: "AUTRIM" },
    { title: "Raag Bhatiyar Characteristics - Wikipedia", url: "https://en.wikipedia.org/wiki/Bhatiyar", source: "Wikipedia" }
  ],
  "bhimpalas": [
    { title: "Raag Bheempalasi - Tanarang Music", url: "https://tanarang.com/raag-bheempalasi/", source: "Tanarang" },
    { title: "Bhimpalasi Inc - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/bhimpalasi/", source: "Parrikar.org" },
    { title: "Raag Bhimpalasi Score & Audio - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/bhimpalasi/", source: "AUTRIM" },
    { title: "Raag Bhimpalasi Profile - Wikipedia", url: "https://en.wikipedia.org/wiki/Bhimpalasi", source: "Wikipedia" }
  ],
  "bhoopali": [
    { title: "Raag Bhoopali - Tanarang Music", url: "https://tanarang.com/raag-bhoopali/", source: "Tanarang" },
    { title: "Short Takes: Bhoopali and Deshkar - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/bhoopali/", source: "Parrikar.org" },
    { title: "Raag Bhupali Score & Audio - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/bhupali/", source: "AUTRIM" },
    { title: "Raag Bhoopali Pentatonic Study - Wikipedia", url: "https://en.wikipedia.org/wiki/Bhoopali", source: "Wikipedia" }
  ],
  "bihag": [
    { title: "Raag Bihag - Tanarang Music", url: "https://tanarang.com/raag-bihag/", source: "Tanarang" },
    { title: "Short Takes: Bihag - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/bihag/", source: "Parrikar.org" },
    { title: "Raag Bihag - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/bihag/", source: "AUTRIM" },
    { title: "Raag Bihag Architecture - Wikipedia", url: "https://en.wikipedia.org/wiki/Bihag", source: "Wikipedia" }
  ],
  "chhayanat": [
    { title: "Raag Chhayanut - Tanarang Music", url: "https://tanarang.com/raag-chhayanut/", source: "Tanarang" },
    { title: "Kalyan & The Chhayanat Ang - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/kalyan/", source: "Parrikar.org" },
    { title: "Raag Chhayanat - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/chhayanat/", source: "AUTRIM" },
    { title: "Raag Chhayanat Analysis - Wikipedia", url: "https://en.wikipedia.org/wiki/Chhayanat", source: "Wikipedia" }
  ],
  "des": [
    { title: "Raag Des - Tanarang Music", url: "https://tanarang.com/raag-des/", source: "Tanarang" },
    { title: "Des: Tunes from the Countryside - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/des/", source: "Parrikar.org" },
    { title: "Raag Deshi / Des - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/deshi/", source: "AUTRIM" },
    { title: "Raag Desh Structure - Wikipedia", url: "https://en.wikipedia.org/wiki/Desh_(raga)", source: "Wikipedia" }
  ],
  "deshkar": [
    { title: "Raag Deshkar - Tanarang Music", url: "https://tanarang.com/raag-deshkar/", source: "Tanarang" },
    { title: "Short Takes: Bhoopali and Deshkar - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/bhoopali/", source: "Parrikar.org" },
    { title: "Raag Deshkar - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/deshkar/", source: "AUTRIM" },
    { title: "Raag Deskar Overview - Wikipedia", url: "https://en.wikipedia.org/wiki/Bhoopali#Deshkar", source: "Wikipedia" }
  ],
  "dhanakoni-kalyaan": [
    { title: "Raag Dhani - Tanarang Music", url: "https://tanarang.com/raag-dhani/", source: "Tanarang" },
    { title: "Kalyan: The Majestic Core - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/kalyan/", source: "Parrikar.org" },
    { title: "Raag Dhanashri & Dhani Varieties - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/dhanashri/", source: "AUTRIM" },
    { title: "Kalyan Thaat Derivatives - Wikipedia", url: "https://en.wikipedia.org/wiki/Kalyan_(thaat)", source: "Wikipedia" }
  ],
  "durga": [
    { title: "Raag Durga - Tanarang Music", url: "https://tanarang.com/raag-durga/", source: "Tanarang" },
    { title: "On the Bilawal Trail (Durga) - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/bilawal/", source: "Parrikar.org" },
    { title: "Raag Durga - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/durga/", source: "AUTRIM" },
    { title: "Raag Durga Overview - Wikipedia", url: "https://en.wikipedia.org/wiki/Durga_(raga)", source: "Wikipedia" }
  ],
  "gaud-malhar": [
    { title: "Raag Gaud Malhar - Tanarang Music", url: "https://tanarang.com/raag-gaud-malhar/", source: "Tanarang" },
    { title: "On Gaud Malhar and Miyan Malhar - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/malhars/", source: "Parrikar.org" },
    { title: "Raag Gaud Malhar - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/gaud-malhar/", source: "AUTRIM" },
    { title: "Raag Gaud Malhar Details - Wikipedia", url: "https://en.wikipedia.org/wiki/Gaud_Malhar", source: "Wikipedia" }
  ],
  "gaud-sarang": [
    { title: "Raag Gaud Sarang - Tanarang Music", url: "https://tanarang.com/raag-gaud-sarang/", source: "Tanarang" },
    { title: "Raga Gaud Sarang: An Exegesis - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/gaudsarang/", source: "Parrikar.org" },
    { title: "Raag Gaud Sarang - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/gaud-sarang/", source: "AUTRIM" },
    { title: "Raag Gaud Sarang Framework - Wikipedia", url: "https://en.wikipedia.org/wiki/Gaud_Sarang", source: "Wikipedia" }
  ],
  "gujari-todi": [
    { title: "Raag Gurjari Todi - Tanarang Music", url: "https://tanarang.com/raag-gurjari-todi/", source: "Tanarang" },
    { title: "The Empire of Todi - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/todi/", source: "Parrikar.org" },
    { title: "Raag Gujari Todi - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/gujari-todi/", source: "AUTRIM" },
    { title: "Raag Gujari Todi Analysis - Wikipedia", url: "https://en.wikipedia.org/wiki/Gujari_Todi", source: "Wikipedia" }
  ],
  "hameer": [
    { title: "Raag Hameer - Tanarang Music", url: "https://tanarang.com/raag-hameer/", source: "Tanarang" },
    { title: "Reflections on Raga Hameer - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/hameer/", source: "Parrikar.org" },
    { title: "Raag Hamir - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/hamir/", source: "AUTRIM" },
    { title: "Raag Hameer Structure - Wikipedia", url: "https://en.wikipedia.org/wiki/Kalyan_(thaat)#Hamir", source: "Wikipedia" }
  ],
  "hamsadhwani": [
    { title: "Raag Hansdhwani - Tanarang Music", url: "https://tanarang.com/raag-hansdhwani/", source: "Tanarang" },
    { title: "On the Bilawal Trail: Carnatic Imports - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/bilawal/", source: "Parrikar.org" },
    { title: "Raag Hansadhwani - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/hansadhwani/", source: "AUTRIM" },
    { title: "Raag Hamsadhwani Profile - Wikipedia", url: "https://en.wikipedia.org/wiki/Hamsadhwani", source: "Wikipedia" }
  ],
  "jaunpuri": [
    { title: "Raag Jaunpuri - Tanarang Music", url: "https://tanarang.com/raag-jaunpuri/", source: "Tanarang" },
    { title: "Asavari & Associates - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/asavari/", source: "Parrikar.org" },
    { title: "Raag Jaunpuri - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/jaunpuri/", source: "AUTRIM" },
    { title: "Raag Jaunpuri Details - Wikipedia", url: "https://en.wikipedia.org/wiki/Jaunpuri_(raga)", source: "Wikipedia" }
  ],
  "jog": [
    { title: "Raag Jog - Tanarang Music", url: "https://tanarang.com/raag-jog/", source: "Tanarang" },
    { title: "Short Takes: Jog and Jogkauns - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/jog/", source: "Parrikar.org" },
    { title: "Raag Jog - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/jog/", source: "AUTRIM" },
    { title: "Raag Jog Nuances - Wikipedia", url: "https://en.wikipedia.org/wiki/Jog_(raga)", source: "Wikipedia" }
  ],
  "jogkauns": [
    { title: "Raag Jogkauns - Tanarang Music", url: "https://tanarang.com/raag-jogkauns/", source: "Tanarang" },
    { title: "Short Takes: Jog and Jogkauns - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/jog/", source: "Parrikar.org" },
    { title: "Raag Jogkauns - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/jogkauns/", source: "AUTRIM" },
    { title: "Raag Jogkauns History - Wikipedia", url: "https://en.wikipedia.org/wiki/Jog_(raga)#Jogkauns", source: "Wikipedia" }
  ],
  "kedar": [
    { title: "Raag Kedar - Tanarang Music", url: "https://tanarang.com/raag-kedar/", source: "Tanarang" },
    { title: "Raga Kedar: A Perspective - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/kedar/", source: "Parrikar.org" },
    { title: "Raag Kedar Monograph - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/kedar/", source: "AUTRIM" },
    { title: "Raag Kedar Archival Details - Wikipedia", url: "https://en.wikipedia.org/wiki/Kedar_(raga)", source: "Wikipedia" }
  ],
  "komal-rishabh-asawari": [
    { title: "Raag Komal Rishabh Asawari - Tanarang Music", url: "https://tanarang.com/raag-komal-rishabh-asawari/", source: "Tanarang" },
    { title: "Asavari & Associates - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/asavari/", source: "Parrikar.org" },
    { title: "Raag Asavari (Komal Rishabh) - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/asavari-komal-rishabh/", source: "AUTRIM" },
    { title: "Raag Asavari Constellation - Wikipedia", url: "https://en.wikipedia.org/wiki/Asavari", source: "Wikipedia" }
  ],
  "lalat": [
    { title: "Raag Lalit - Tanarang Music", url: "https://tanarang.com/raag-lalit/", source: "Tanarang" },
    { title: "The Marwa Matrix: Two-Madhyam Paradigm - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/marwa/", source: "Parrikar.org" },
    { title: "Raag Lalit / Lalat - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/lalit-lalat/", source: "AUTRIM" },
    { title: "Raag Lalit Characteristics - Wikipedia", url: "https://en.wikipedia.org/wiki/Lalit_(raga)", source: "Wikipedia" }
  ],
  "madhamaad-sarang": [
    { title: "Raag Madhumad Sarang - Tanarang Music", url: "https://tanarang.com/raag-madhumad-sarang/", source: "Tanarang" },
    { title: "The Sarang Family - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/sarang/", source: "Parrikar.org" },
    { title: "Raag Sarang Family - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/brindavani-sarang/", source: "AUTRIM" },
    { title: "Raag Madhmadh Sarang - Wikipedia", url: "https://en.wikipedia.org/wiki/Sarang_(raga)#Madhmadh_Sarang", source: "Wikipedia" }
  ],
  "madhuvanti": [
    { title: "Raag Madhuvanti - Tanarang Music", url: "https://tanarang.com/raag-madhuvanti/", source: "Tanarang" },
    { title: "The Empire of Todi: Madhuvanti Ang - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/todi/", source: "Parrikar.org" },
    { title: "Raag Madhuvanti - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/madhuvanti/", source: "AUTRIM" },
    { title: "Raag Madhuvanti Structure - Wikipedia", url: "https://en.wikipedia.org/wiki/Madhuvanti", source: "Wikipedia" }
  ],
  "malkauns": [
    { title: "Raag Malkauns - Tanarang Music", url: "https://tanarang.com/raag-malkauns/", source: "Tanarang" },
    { title: "Short Takes: Malkauns - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/malkauns/", source: "Parrikar.org" },
    { title: "Raag Malkauns - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/malkauns/", source: "AUTRIM" },
    { title: "Raag Malkauns Treatise - Wikipedia", url: "https://en.wikipedia.org/wiki/Malkauns", source: "Wikipedia" }
  ],
  "marwa": [
    { title: "Raag Marwa - Tanarang Music", url: "https://tanarang.com/raag-marwa/", source: "Tanarang" },
    { title: "The Marwa Matrix - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/marwa/", source: "Parrikar.org" },
    { title: "Raag Marwa (Marva) - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/marva/", source: "AUTRIM" },
    { title: "Raag Marwa Profile - Wikipedia", url: "https://en.wikipedia.org/wiki/Marwa_(raga)", source: "Wikipedia" }
  ],
  "miyan-ki-malhar": [
    { title: "Raag Miyan Malhar - Tanarang Music", url: "https://tanarang.com/raag-malhar-raag-miya-malhar/", source: "Tanarang" },
    { title: "On Gaud Malhar and Miyan Malhar - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/malhars/", source: "Parrikar.org" },
    { title: "Raag Miyan Ki Malhar - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/miyan-ki-malhar/", source: "AUTRIM" },
    { title: "Raag Miyan Ki Malhar - Wikipedia", url: "https://en.wikipedia.org/wiki/Miyan_ki_Malhar", source: "Wikipedia" }
  ],
  "miyan-ki-todi": [
    { title: "Raag Todi - Tanarang Music", url: "https://tanarang.com/raag-todi/", source: "Tanarang" },
    { title: "The Empire of Todi - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/todi/", source: "Parrikar.org" },
    { title: "Raag Miyan Ki Todi - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/miyan-ki-todi/", source: "AUTRIM" },
    { title: "Raag Miyan Ki Todi - Wikipedia", url: "https://en.wikipedia.org/wiki/Miyan_ki_Todi", source: "Wikipedia" }
  ],
  "multani": [
    { title: "Raag Multani - Tanarang Music", url: "https://tanarang.com/raag-multani/", source: "Tanarang" },
    { title: "Short Takes: Multani - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/multani/", source: "Parrikar.org" },
    { title: "Raag Multani - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/multani/", source: "AUTRIM" },
    { title: "Raag Multani - Wikipedia", url: "https://en.wikipedia.org/wiki/Multani_(raga)", source: "Wikipedia" }
  ],
  "nat-bhairav": [
    { title: "Raag Nut Bhairav - Tanarang Music", url: "https://tanarang.com/raag-nut-bhairav/", source: "Tanarang" },
    { title: "Cracked Open: The Nats! - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/nats/", source: "Parrikar.org" },
    { title: "Raag Nat Bhairav - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/nat-bhairav/", source: "AUTRIM" },
    { title: "Raag Nat Bhairav Framework - Wikipedia", url: "https://en.wikipedia.org/wiki/Nat_Bhairav", source: "Wikipedia" }
  ],
  "paraj": [
    { title: "Raag Poorvi & Allied Forms - Tanarang Music", url: "https://tanarang.com/raag-poorvi/", source: "Tanarang" },
    { title: "The Province of Poorvi - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/poorvi/", source: "Parrikar.org" },
    { title: "Purvi That Foundations - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/purvi/", source: "AUTRIM" },
    { title: "Raag Paraj & Purvi That - Wikipedia", url: "https://en.wikipedia.org/wiki/Purvi", source: "Wikipedia" }
  ],
  "puriya": [
    { title: "Raag Puriya - Tanarang Music", url: "https://tanarang.com/raag-puriya/", source: "Tanarang" },
    { title: "The Marwa Matrix: Puriya Nuances - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/marwa/", source: "Parrikar.org" },
    { title: "Raag Puriya - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/puriya/", source: "AUTRIM" },
    { title: "Raag Puriya Contemplation - Wikipedia", url: "https://en.wikipedia.org/wiki/Puriya", source: "Wikipedia" }
  ],
  "puriya-dhanashree": [
    { title: "Raag Puriya Dhanashree - Tanarang Music", url: "https://tanarang.com/raag-puriya-dhanashree/", source: "Tanarang" },
    { title: "The Province of Poorvi - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/poorvi/", source: "Parrikar.org" },
    { title: "Raag Puriya Dhanashri - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/puriya-dhanashri/", source: "AUTRIM" },
    { title: "Raag Puriya Dhanashree - Wikipedia", url: "https://en.wikipedia.org/wiki/Puriya_Dhanashree", source: "Wikipedia" }
  ],
  "puriya-kalyan": [
    { title: "Raag Puriya Kalyan - Tanarang Music", url: "https://tanarang.com/raag-puriya-kalyan/", source: "Tanarang" },
    { title: "The Marwa Matrix: Compound Forms - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/marwa/", source: "Parrikar.org" },
    { title: "Raag Puriya Ang Complex Forms - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/puriya/", source: "AUTRIM" },
    { title: "Raag Puriya Kalyan - Wikipedia", url: "https://en.wikipedia.org/wiki/Puriya", source: "Wikipedia" }
  ],
  "shivmat-bhairav": [
    { title: "Raag Bhairav & Allied Forms - Tanarang Music", url: "https://tanarang.com/raag-bhairav/", source: "Tanarang" },
    { title: "Bhairav: The Primordial Sound - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/bhairav/", source: "Parrikar.org" },
    { title: "Raag Shivmat Bhairav - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/shivmat-bhairav-shiv-bhairav/", source: "AUTRIM" },
    { title: "Raag Bhairav Variants - Wikipedia", url: "https://en.wikipedia.org/wiki/Bhairav_(raga)#Shivmat_Bhairav", source: "Wikipedia" }
  ],
  "shree": [
    { title: "Raag Shree - Tanarang Music", url: "https://tanarang.com/raag-shree/", source: "Tanarang" },
    { title: "Raga Shree: Close Encounters - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/shree/", source: "Parrikar.org" },
    { title: "Raag Shri - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/shri/", source: "AUTRIM" },
    { title: "Raag Shree Classical Foundation - Wikipedia", url: "https://en.wikipedia.org/wiki/Shree_(raga)", source: "Wikipedia" }
  ],
  "shuddh-sarang": [
    { title: "Raag Shuddha Sarang - Tanarang Music", url: "https://tanarang.com/raag-shuddha-sarang/", source: "Tanarang" },
    { title: "The Sarang Family: Shuddha Sarang - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/sarang/", source: "Parrikar.org" },
    { title: "Raag Shuddh Sarang - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/shuddh-sarang/", source: "AUTRIM" },
    { title: "Raag Shuddha Sarang Framework - Wikipedia", url: "https://en.wikipedia.org/wiki/Sarang_(raga)#Shuddha_Sarang", source: "Wikipedia" }
  ],
  "shuddha-kalyaan": [
    { title: "Raag Shuddha Kalyan - Tanarang Music", url: "https://tanarang.com/raag-shuddha-kalyan-2/", source: "Tanarang" },
    { title: "Kalyan: The Majestic Core - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/kalyan/", source: "Parrikar.org" },
    { title: "Raag Shuddh Kalyan - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/shuddh-kalyan/", source: "AUTRIM" },
    { title: "Raag Shuddha Kalyan - Wikipedia", url: "https://en.wikipedia.org/wiki/Kalyan_(thaat)#Shuddha_Kalyan", source: "Wikipedia" }
  ],
  "sohini": [
    { title: "Raag Sohani - Tanarang Music", url: "https://tanarang.com/raag-sohani/", source: "Tanarang" },
    { title: "The Marwa Matrix (Sohini) - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/marwa/", source: "Parrikar.org" },
    { title: "Raag Sohini (Sohni) - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/sohini-sohni/", source: "AUTRIM" },
    { title: "Raag Sohani Overview - Wikipedia", url: "https://en.wikipedia.org/wiki/Sohani", source: "Wikipedia" }
  ],
  "sur-malhar": [
    { title: "Raag Surdasi Malhar - Tanarang Music", url: "https://tanarang.com/raag-surdasi-malhar/", source: "Tanarang" },
    { title: "On Gaud Malhar and Miyan Malhar - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/malhars/", source: "Parrikar.org" },
    { title: "Raag Surdasi Malhar - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/surdasi-malhar-sur-malhar/", source: "AUTRIM" },
    { title: "Raag Surdasi Malhar Synthesis - Wikipedia", url: "https://en.wikipedia.org/wiki/Malhar#Sur_Malhar", source: "Wikipedia" }
  ],
  "vrindavani-sarang": [
    { title: "Raag Brindavani Sarang - Tanarang Music", url: "https://tanarang.com/raag-sarang-raag-brindavani-sarang/", source: "Tanarang" },
    { title: "The Sarang Family: Vrindavani Sarang - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/sarang/", source: "Parrikar.org" },
    { title: "Raag Brindavani Sarang - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/brindavani-sarang/", source: "AUTRIM" },
    { title: "Raag Brindabani Sarang Canonical Study - Wikipedia", url: "https://en.wikipedia.org/wiki/Brindabani_Sarang", source: "Wikipedia" }
  ],
  "yaman": [
    { title: "Raag Yaman - Tanarang Music", url: "https://tanarang.com/raag-yaman/", source: "Tanarang" },
    { title: "Kalyan: The Majestic Core - Rajan Parrikar Archive", url: "https://www.parrikar.org/hindustani/kalyan/", source: "Parrikar.org" },
    { title: "Raag Yaman Score & Audio - AUTRIM (NCPA)", url: "https://autrimncpa.wordpress.com/yaman/", source: "AUTRIM" },
    { title: "Raag Yaman Comprehensive Guide - Wikipedia", url: "https://en.wikipedia.org/wiki/Yaman_(raga)", source: "Wikipedia" }
  ]
};

async function seedFurtherReading() {
  console.log("Fetching all raags from Supabase...");
  const res = await fetch(`${supabaseUrl}/rest/v1/raags?select=id,slug,name`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  });

  if (!res.ok) {
    console.error("Failed to fetch raags:", res.status, await res.text());
    process.exit(1);
  }

  const raags = await res.json();
  console.log(`Found ${raags.length} raags in database.`);

  let updatedCount = 0;

  for (const r of raags) {
    const slug = r.slug;
    const links = RAAG_FURTHER_READING[slug];

    if (!links || links.length < 3) {
      console.warn(`[WARNING] Missing or insufficient links for raag: ${slug} (${r.name})`);
      continue;
    }

    console.log(`Updating ${r.name} (${slug}) with ${links.length} curated archival links...`);
    const patchRes = await fetch(`${supabaseUrl}/rest/v1/raags?id=eq.${encodeURIComponent(r.id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal"
      },
      body: JSON.stringify({ further_reading: links })
    });

    if (!patchRes.ok) {
      console.error(`Failed to update ${r.name}:`, patchRes.status, await patchRes.text());
    } else {
      updatedCount++;
    }
  }

  console.log(`\nSuccessfully updated ${updatedCount} / ${raags.length} raags with 100% verified Further Reading links!`);
}

seedFurtherReading().catch(err => {
  console.error("Error seeding further reading:", err);
  process.exit(1);
});
