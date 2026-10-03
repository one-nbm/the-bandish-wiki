const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim().replace(/\"/g, '');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim().replace(/\"/g, '');

fetch(url + '/rest/v1/raags?limit=1', { headers: { apikey: key, Authorization: 'Bearer ' + key } })
  .then(res => res.json())
  .then(console.log);
