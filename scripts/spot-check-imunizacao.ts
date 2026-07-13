import fs from 'node:fs';
import path from 'node:path';

import { hasPremiumStubMarkers } from '@/lib/catalogMigration/premiumStubMarkers';
import { QuestaoCompletaSchema } from '@/lib/validations';

const exclude = JSON.parse(
  fs.readFileSync('data/catalog-migration/imunizacao-exclude-done.json', 'utf8'),
) as { questoes: string[] };

const allSlugs = exclude.questoes.filter((s) => s.includes('imunizacao'));
const sampleSize = Math.max(5, Math.ceil(allSlugs.length * 0.05));
const step = Math.max(1, Math.floor(allSlugs.length / sampleSize));
const sample = Array.from({ length: sampleSize }, (_, i) =>
  allSlugs[Math.min(i * step, allSlugs.length - 1)],
);

const migRoot = 'data/catalog-migration';
const lotes = fs
  .readdirSync(migRoot)
  .filter((d) => d.startsWith('imunizacao') || d === 'cpcon-intervalos-golden');

function findJson(slug: string): string | null {
  for (const lote of lotes) {
    const p = path.join(migRoot, lote, 'questions', `${slug}.json`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

let ok = 0;
let fail = 0;
const issues: string[] = [];

for (const slug of sample) {
  const fp = findJson(slug);
  if (!fp) {
    issues.push(`${slug}: arquivo não encontrado`);
    fail += 1;
    continue;
  }
  const raw = JSON.parse(fs.readFileSync(fp, 'utf8')) as {
    conteudo_json?: unknown;
  };
  const payload = raw.conteudo_json ?? raw;
  const parsed = QuestaoCompletaSchema.safeParse(payload);
  if (!parsed.success) {
    issues.push(`${slug}: zod`);
    fail += 1;
    continue;
  }
  const slides = parsed.data.reverse_study_slides ?? parsed.data.study_slides ?? [];
  if (slides.length !== 4) {
    issues.push(`${slug}: slides=${slides.length}`);
    fail += 1;
    continue;
  }
  if (hasPremiumStubMarkers(slides)) {
    issues.push(`${slug}: stub`);
    fail += 1;
    continue;
  }
  const types = slides
    .map((s) => s.type)
    .sort()
    .join(',');
  if (types !== 'concept_map,danger_zone,golden_rule,logic_flow') {
    issues.push(`${slug}: types=${types}`);
    fail += 1;
    continue;
  }
  ok += 1;
}

for (const g of [
  'questao-premium-cpcon-imunizacao-intervalos-vf.json',
  'questao-premium-fundatec-meningococica-3meses.json',
]) {
  const payload = JSON.parse(fs.readFileSync(path.join('examples', g), 'utf8'));
  const p = QuestaoCompletaSchema.safeParse(payload);
  if (!p.success || hasPremiumStubMarkers(p.data.reverse_study_slides)) {
    issues.push(`golden ${g}`);
    fail += 1;
  } else {
    ok += 1;
  }
}

console.log('Spot-check Imunização (~5%)');
console.log(`Slugs imunização no exclude: ${allSlugs.length}`);
console.log(`Amostra: ${sampleSize} slugs + 2 goldens`);
console.log(`OK: ${ok}  FAIL: ${fail}`);
if (issues.length > 0) {
  console.log('Issues:\n' + issues.join('\n'));
  process.exit(1);
}
console.log('Todos os checks passaram.');
console.log('Amostra:', sample.join(', '));
