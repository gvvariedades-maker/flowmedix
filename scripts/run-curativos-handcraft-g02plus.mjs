#!/usr/bin/env node
/**
 * Pipeline g02+ — plan → config → specs → handcraft → validate → dry-run
 * node scripts/run-curativos-handcraft-g02plus.mjs
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const steps = [
  ['npx', 'tsx', 'scripts/plan-curativos-lotes.ts'],
  ['node', 'scripts/generate-curativos-handcraft-config.mjs'],
  ['node', 'scripts/generate-curativos-handcraft-specs.mjs'],
  ['npx', 'tsx', 'scripts/handcraft-curativos-e-manejo-de-feridas-core.ts', '--all'],
];

for (const cmd of steps) {
  console.log('\n>>', cmd.join(' '));
  execSync(cmd.join(' '), { stdio: 'inherit', cwd: process.cwd() });
}

const { LOTE_SLUGS } = await import('../scripts/curativos-handcraft-config.ts');
const lotes = Object.keys(LOTE_SLUGS);
const report = [];

for (const lote of lotes) {
  console.log(`\n>> validate ${lote}`);
  try {
    execSync(`npm run validate:goldens -- --lote=${lote} --strict`, { stdio: 'pipe' });
    const audit = execSync(
      `npm run audit:questao-readiness -- --lote=${lote} --strict-v2-pedagogy`,
      { encoding: 'utf8' },
    );
    const passMatch = audit.match(/READY.*?(\d+)/g);
    const readyCount = (audit.match(/\[READY\]/g) ?? []).length;
    execSync(`npm run catalog:apply-lote -- --lote=${lote} --dry-run`, { stdio: 'pipe' });
    const slugs = LOTE_SLUGS[lote];
    const branches = [...new Set(slugs.map((s) => {
      const plan = JSON.parse(readFileSync('artifacts/curativos-lote-plan.json', 'utf8'));
      return plan.rows.find((r) => r.slug === s)?.branch ?? '?';
    }))];
    report.push({ lote, slugs: slugs.length, branch_mix: branches.join('+'), ready: readyCount, dry_run: 'PASS' });
    console.log(`[OK] ${lote} ready=${readyCount}/${slugs.length}`);
  } catch (e) {
    const slugs = LOTE_SLUGS[lote];
    report.push({ lote, slugs: slugs.length, branch_mix: '?', ready: 0, dry_run: 'FAIL', error: String(e.message).slice(0, 200) });
    console.error(`[FAIL] ${lote}`, e.message);
  }
}

const g01 = JSON.parse(
  readFileSync('data/catalog-migration/curativos-e-manejo-de-feridas-g01/manifest.json', 'utf8'),
).slugs.length;

const handcraftApplied = g01 + report.reduce((a, r) => a + r.ready, 0);
writeFileSync(join(process.cwd(), 'artifacts/curativos-handcraft-g02plus-report.json'), JSON.stringify({ report, handcraft_applied_estimate: handcraftApplied, total: 94 }, null, 2));
console.log('\n=== REPORT ===');
console.table(report);
console.log(`handcraft_applied estimate: ${handcraftApplied}/94`);
