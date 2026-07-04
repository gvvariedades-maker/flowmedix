/**
 * Cruza vias-de-administracao-completo com lotes g01–g26 + repair Consulpam.
 * Saída: artifacts/vias-handcraft-remaining-slugs.json + resumo no stdout.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const root = join(process.cwd(), 'data/catalog-migration');

const completo = JSON.parse(
  readFileSync(join(root, 'vias-de-administracao-completo/manifest.json'), 'utf8'),
) as { slugs: string[] };

const completoSlugs = new Set(completo.slugs.filter((s) => s.includes('vias-de-administracao')));

const handcraft = new Set<string>();
const byLote: Record<string, number> = {};

for (let i = 1; i <= 26; i++) {
  const lote = `vias-de-administracao-g${String(i).padStart(2, '0')}`;
  const mf = join(root, lote, 'manifest.json');
  if (!existsSync(mf)) continue;
  const slugs = (JSON.parse(readFileSync(mf, 'utf8')) as { slugs?: string[] }).slugs ?? [];
  byLote[lote] = slugs.length;
  for (const s of slugs) handcraft.add(s);
}

const repairMf = join(root, 'vias-de-administracao-consulpam-repair/manifest.json');
if (existsSync(repairMf)) {
  const repair = JSON.parse(readFileSync(repairMf, 'utf8')) as { slugs: string[] };
  for (const s of repair.slugs) handcraft.add(s);
}

const missing = [...completoSlugs].filter((s) => !handcraft.has(s)).sort();
const extra = [...handcraft].filter((s) => !completoSlugs.has(s)).sort();

const registryEstimate = 251;

console.log('=== RESUMO Vias de Administração — handcraft restante ===');
console.log(`Completo export (slugs vias-only):     ${completoSlugs.size}`);
console.log(`Completo export (total no manifest): ${completo.slugs.length}`);
console.log(`Registry estimate (governança):      ${registryEstimate}`);
console.log(`Handcraft alocado (g01–g26 + repair): ${handcraft.size}`);
console.log(`Faltam (vs export vias-only):        ${missing.length}`);
console.log(`Faltam (vs registry 251):            ${registryEstimate - handcraft.size}`);
console.log(`Lotes restantes (~8 slugs):          ${Math.ceil(missing.length / 8)}`);
console.log('');
console.log('Slugs por lote:', JSON.stringify(byLote, null, 2));

const out = {
  generated_at: new Date().toISOString(),
  completo_vias_slugs: completoSlugs.size,
  completo_total_slugs: completo.slugs.length,
  registry_estimate: registryEstimate,
  handcraft_slugs: handcraft.size,
  missing_vs_export: missing.length,
  missing_vs_registry: registryEstimate - handcraft.size,
  missing_slugs: missing,
  extra_in_handcraft: extra,
  by_lote: byLote,
};

mkdirSync(join(process.cwd(), 'artifacts'), { recursive: true });
const outPath = join(process.cwd(), 'artifacts/vias-handcraft-remaining-slugs.json');
writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log('');
console.log(`Salvo: ${outPath}`);
console.log('');
console.log(`=== FALTAM (${missing.length}) ===`);
for (const s of missing) console.log(s);
if (extra.length) {
  console.log('');
  console.log(`=== EXTRA em handcraft, fora do export (${extra.length}) ===`);
  for (const s of extra) console.log(s);
}
