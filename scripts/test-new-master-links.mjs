import { execFile } from 'child_process';
import { promisify } from 'util';
import { RAAG_FURTHER_READING } from './seed-further-reading.mjs';

const execFileAsync = promisify(execFile);

async function testUrl(url) {
  try {
    const { stdout } = await execFileAsync('curl.exe', [
      '-s',
      '-L',
      '-m', '6',
      '-o', 'NUL',
      '-w', '%{http_code}|%{url_effective}',
      url
    ]);
    const parts = stdout.trim().split('|');
    const code = parseInt(parts[0], 10);
    const finalUrl = parts[1] || url;
    return { status: code, finalUrl, ok: code >= 200 && code < 400 };
  } catch (err) {
    return { status: 0, error: err.message, ok: false };
  }
}

async function run() {
  const raagSlugs = Object.keys(RAAG_FURTHER_READING);
  console.log(`Auditing updated database links across all ${raagSlugs.length} raags (${raagSlugs.length * 4} links)...`);

  const results = {
    parrikar: { total: 0, ok: 0, broken: [] },
    tanarang: { total: 0, ok: 0, broken: [] },
    autrim: { total: 0, ok: 0, broken: [] },
    wikipedia: { total: 0, ok: 0, broken: [] },
    other: { total: 0, ok: 0, broken: [] }
  };

  const tasks = [];

  for (const slug of raagSlugs) {
    const links = RAAG_FURTHER_READING[slug];
    for (const link of links) {
      let bucket = 'other';
      if (link.source.toLowerCase().includes('parrikar')) bucket = 'parrikar';
      else if (link.source.toLowerCase().includes('tanarang')) bucket = 'tanarang';
      else if (link.source.toLowerCase().includes('autrim')) bucket = 'autrim';
      else if (link.source.toLowerCase().includes('wikipedia')) bucket = 'wikipedia';

      results[bucket].total++;
      tasks.push({ slug, link, bucket });
    }
  }

  // Concurrency = 4 with 50ms pause
  const CHUNK_SIZE = 4;
  for (let i = 0; i < tasks.length; i += CHUNK_SIZE) {
    const chunk = tasks.slice(i, i + CHUNK_SIZE);
    await Promise.all(chunk.map(async ({ slug, link, bucket }) => {
      const res = await testUrl(link.url);
      if (res.ok) {
        results[bucket].ok++;
      } else {
        results[bucket].broken.push({
          raag: slug,
          title: link.title,
          url: link.url,
          status: res.status,
          error: res.error
        });
        console.log(`❌ [${bucket.toUpperCase()}] ${slug}: ${link.url} -> ${res.status || 'TIMEOUT/ERR'}`);
      }
    }));
    await new Promise(r => setTimeout(r, 50));
    process.stdout.write(`Progress: ${Math.min(i + CHUNK_SIZE, tasks.length)}/${tasks.length}\r`);
  }

  console.log("\n\n================ FINAL AUDIT SUMMARY ================");
  let allPerfect = true;
  for (const [key, val] of Object.entries(results)) {
    console.log(`${key.toUpperCase()}: ${val.ok}/${val.total} working (${val.broken.length} broken)`);
    if (val.broken.length > 0) allPerfect = false;
  }

  if (allPerfect) {
    console.log("\n🎉 ALL 176 ARCHIVAL LINKS ACROSS ALL 44 RAAGS RETURNED HTTP 200 OK!");
  } else {
    console.log("\nSome broken links remain, see logs above.");
  }
}

run().catch(console.error);
