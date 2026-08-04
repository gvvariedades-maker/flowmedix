import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { detectUnifiedPedagogy } from '@/lib/catalogMigration/unifiedPedagogyDetector';

const packs = [
  'data/catalog-migration/imunizacao-completo/questions',
  'data/catalog-migration/vias-de-administracao-completo/questions',
  'data/catalog-migration/saude-adolescente-completo/questions',
  'data/catalog-migration/farmacodinamica-e-farmacocinetica-completo/questions',
];

const out: Record<string, { by_slide: Record<string, number>; by_key: Record<string, number>; n: number; sample: unknown[] }> = {};

for (const dir of packs) {
  const name = dir.split('/')[2];
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  const bySlide: Record<string, number> = {};
  const byKey: Record<string, number> = {};
  let samples: unknown[] = [];
  for (const f of files) {
    const q = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    for (const finding of detectUnifiedPedagogy(q)) {
      if (finding.code !== 'pedagogy_letter_spoiler') continue;
      bySlide[finding.slide] = (bySlide[finding.slide] ?? 0) + 1;
      byKey[finding.key ?? '(none)'] = (byKey[finding.key ?? '(none)'] ?? 0) + 1;
      if (samples.length < 3) {
        samples.push({ slug: f, slide: finding.slide, key: finding.key, evidence: finding.evidence, path: finding.path });
      }
    }
  }
  out[name] = { n: files.length, by_slide: bySlide, by_key: byKey, sample: samples };
}

writeFileSync('artifacts/pedagogy-letter-spoiler-surfaces.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
