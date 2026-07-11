#!/usr/bin/env tsx
/**
 * Verifica cobertura: cada slug do completo manifest aparece em exatamente um urgencias-gNN.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd(), 'data/catalog-migration');
const completo = JSON.parse(
  readFileSync(join(root, 'urgencias-e-emergencias-completo/manifest.json'), 'utf8'),
) as { slugs: string[] };
const completoSlugs = completo.slugs;
const loteRe = /^urgencias-g\d{2}$/;
const coverage = new Map<string, string[]>();

for (const name of readdirSync(root)) {
  if (!loteRe.test(name)) continue;
  const manifest = join(root, name, 'manifest.json');
  if (!existsSync(manifest)) continue;
  const m = JSON.parse(readFileSync(manifest, 'utf8')) as { slugs?: string[] };
  for (const s of m.slugs ?? []) {
    if (!coverage.has(s)) coverage.set(s, []);
    coverage.get(s)!.push(name);
  }
}

const missing = completoSlugs.filter((s) => !coverage.has(s));
const duplicates = [...coverage.entries()].filter(([, lotes]) => lotes.length > 1);
const extra = [...coverage.keys()].filter((s) => !completoSlugs.includes(s));

console.log(`[verify:urgencias-coverage] completo_manifest=${completoSlugs.length}`);
console.log(`[verify:urgencias-coverage] lote_union_unique=${coverage.size}`);
console.log(`[verify:urgencias-coverage] missing=${missing.length}`);
if (missing.length) console.log('  ', missing);
console.log(`[verify:urgencias-coverage] duplicates=${duplicates.length}`);
if (duplicates.length) {
  for (const [slug, lotes] of duplicates.slice(0, 10)) {
    console.log(`   ${slug} → ${lotes.join(', ')}`);
  }
}
console.log(`[verify:urgencias-coverage] extra_not_in_completo=${extra.length}`);
if (extra.length) console.log('  ', extra.slice(0, 10));

const pass =
  missing.length === 0 && duplicates.length === 0 && coverage.size === completoSlugs.length;
console.log(`[verify:urgencias-coverage] PASS=${pass}`);
process.exit(pass ? 0 : 1);
