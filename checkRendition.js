const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim().replace(/\"/g, '');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim().replace(/\"/g, '');

fetch(url + '/rest/v1/bandishes?select=title,youtube_renditions', {
  headers: {
    apikey: key,
    Authorization: 'Bearer ' + key
  }
})
  .then(res => res.json())
  .then(data => {
    const withRenditions = data.filter(d => d.youtube_renditions && d.youtube_renditions.length > 0);
    console.log(JSON.stringify(withRenditions.slice(0, 2), null, 2));
  })
  .catch(console.error);
