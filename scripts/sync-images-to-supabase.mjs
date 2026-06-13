import 'dotenv/config';
import fs from 'fs';
import { IMAGE_MANIFEST } from '../src/data/imageManifest.js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_* variants) are required.');
  process.exit(1);
}

const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function fetchWords() {
  const res = await fetch(`${supabaseUrl}/rest/v1/words?select=word,image_url`, { headers });
  if (!res.ok) throw new Error(`Failed to fetch words: ${res.status} ${await res.text()}`);
  return res.json();
}

async function updateWordImage(word, image_url) {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/words?word=eq.${encodeURIComponent(word)}`,
    { method: 'PATCH', headers, body: JSON.stringify({ image_url }) }
  );
  if (!res.ok) throw new Error(`Failed to update ${word}: ${res.status} ${await res.text()}`);
}

async function main() {
  const words = await fetchWords();
  let updated = 0;
  let skipped = 0;

  for (const { word, image_url: currentUrl } of words) {
    const key = word.toLowerCase();
    const resolved = IMAGE_MANIFEST[key];
    if (!resolved) {
      skipped++;
      continue;
    }
    if (currentUrl === resolved) continue;

    await updateWordImage(word, resolved);
    console.log(`Updated ${word}: ${currentUrl || '(none)'} -> ${resolved}`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated}, skipped ${skipped} (no image file), unchanged ${words.length - updated - skipped}.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
