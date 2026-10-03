const fs = require('fs');
const crypto = require('crypto');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim().replace(/\"/g, '');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim().replace(/\"/g, '');

const raags = [
  {
    id: crypto.randomUUID(),
    slug: 'deshkar',
    name: 'Deshkar',
    thaat: 'Bilawal',
    samay: 'Morning (6 AM - 9 AM)',
    aaroh: "S R G P D S'",
    avaroh: "S' D P D G P G R S",
    vadi: 'Dhaivat (D)',
    samvadi: 'Gandhar (G)',
    description: 'A beautiful morning raga belonging to the Bilawal Thaat. It is often compared to Raag Bhoopali because it shares the same five notes, but it is distinct in its mood, movement, and melodic emphasis. In Deshkar, Dhaivat is very strong and prominent, whereas in Bhoopali, Rishabh and Gandhar are given more focus.',
    contributor: 'Google Gemini'
  },
  {
    id: crypto.randomUUID(),
    slug: 'jaunpuri',
    name: 'Jaunpuri',
    thaat: 'Asawari',
    samay: 'Late Morning (9 AM - 12 PM)',
    aaroh: "S R m P d n S'",
    avaroh: "S' n d P m g R S",
    vadi: 'Dhaivat (d)',
    samvadi: 'Gandhar (g)',
    description: 'A popular and emotive raga created by Sultan Hussain Sharqi of Jaunpur in the 15th century. It is known for its soft, melodious, and tender quality. While it shares the same notes as Darbari Kanada and Asavari, it differs significantly in its Chalan and avoids the heavy, slow ornamentations characteristic of Darbari.',
    contributor: 'Google Gemini'
  },
  {
    id: crypto.randomUUID(),
    slug: 'puriya-kalyan',
    name: 'Puriya Kalyan',
    thaat: 'Marwa',
    samay: 'Evening (3 PM - 6 PM)',
    aaroh: "S r G M P D N S'",
    avaroh: "S' N D P M G r G r S",
    vadi: 'Shadaj (S)',
    samvadi: 'Pancham (P)',
    description: 'A beautiful and melodious sandhiprakash (twilight) raga that represents a blend of Raag Puriya and Raag Yaman. It effectively combines the poorvang (lower tetrachord) movements often associated with Puriya with the uttarang (upper tetrachord) sensibilities of Yaman, creating a mood that is serious, peaceful, and romantic.',
    contributor: 'Google Gemini'
  },
  {
    id: crypto.randomUUID(),
    slug: 'komal-rishabh-asawari',
    name: 'Komal Rishabh Asawari',
    thaat: 'Bhairavi',
    samay: 'Late Morning (9 AM - 12 PM)',
    aaroh: "S r m P d S'",
    avaroh: "S' n d P m g r S",
    vadi: 'Dhaivat (d)',
    samvadi: 'Gandhar (g)',
    description: 'A melodious and deep morning raga that is considered the original form of Raag Asawari. It is a Meend Pradhan raga (focused on gliding notes) known for its sweet, soothing, and devotional atmosphere. Because of its specific use of Komal Rishabh, it is sometimes referred to as Asawari Todi to distinguish it from the common versions of Asawari that use Shuddha Rishabh.',
    contributor: 'Google Gemini'
  }
];

fetch(url + '/rest/v1/raags', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    apikey: key,
    Authorization: 'Bearer ' + key
  },
  body: JSON.stringify(raags)
})
  .then(res => {
    if(res.ok) console.log("Success");
    else res.text().then(console.log);
  })
  .catch(console.error);
