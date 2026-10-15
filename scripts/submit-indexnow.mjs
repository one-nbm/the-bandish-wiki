import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kllhxydnmkbnfvqtovvb.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_pu7A9S-A3IdHP56RQQFPlw_RtbbJZ22";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const host = "bandish-wiki.vercel.app";
  const key = "8f7b3c21a4e54823b190f898317d65ac";
  const keyLocation = `https://${host}/${key}.txt`;

  const [{ data: bandishes }, { data: raags }] = await Promise.all([
    supabase.from("bandishes").select("id"),
    supabase.from("raags").select("slug"),
  ]);

  const urls = [
    `https://${host}`,
    `https://${host}/raags`,
    ...(raags || []).map((r) => `https://${host}/raag/${r.slug}`),
    ...(bandishes || []).map((b) => `https://${host}/bandish/${b.id}`),
  ];

  console.log(`Submitting ${urls.length} URLs to IndexNow via Bing...`);

  const response = await fetch("https://www.bing.com/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key,
      keyLocation,
      urlList: urls,
    }),
  });

  console.log(`IndexNow status: ${response.status} ${response.statusText}`);
  if (response.status === 200 || response.status === 202) {
    console.log("Successfully submitted all 201 URLs to IndexNow! Microsoft Bing and partner search engines are now processing your archive.");
  } else {
    const text = await response.text();
    console.log("Response:", text);
  }
}

run().catch(console.error);
