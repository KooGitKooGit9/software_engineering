import fs from 'fs';
import path from 'path';

const imagesDir = path.resolve('public/images');
const outFile = path.resolve('src/data/imageManifest.js');
const files = fs.readdirSync(imagesDir).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f));

const byBase = new Map();
for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  const base = file.slice(0, -ext.length).toLowerCase();
  const entry = { file, ext };
  if (!byBase.has(base)) {
    byBase.set(base, entry);
    continue;
  }
  const existing = byBase.get(base);
  const rank = (e) => (e.ext === '.jpg' || e.ext === '.jpeg' ? 0 : e.ext === '.png' ? 1 : 2);
  if (rank(entry) < rank(existing)) byBase.set(base, entry);
}

const lines = [
  '// public/images 폴더 기준 자동 생성 — npm run generate:image-manifest',
  'export const IMAGE_MANIFEST = {',
  ...[...byBase.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([base, { file }]) => `  '${base.replace(/'/g, "\\'")}': 'images/${file.replace(/'/g, "\\'")}',`),
  '};',
  '',
];

fs.writeFileSync(outFile, lines.join('\n'));
console.log(`Wrote ${byBase.size} entries to ${outFile}`);
