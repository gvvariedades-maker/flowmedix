#!/usr/bin/env tsx
/**
 * Exporta lista completa de questões que falham no premium gate.
 *
 * Uso:
 *   npx tsx scripts/export-premium-needs-upgrade.ts
 *
 * Entrada: artifacts/premium-supabase-audit.json, artifacts/premium-catalog-audit.json
 * Saída:   artifacts/premium-needs-upgrade-supabase.{json,csv}
 *          artifacts/premium-needs-upgrade-local.{json,csv}
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type AuditRow = {
  slug: string;
  subtopico?: string;
  lote?: string;
  issues: { code: string; severity: string }[];
};

type ExportRow = {
  source: 'supabase' | 'local';
  slug: string;
  subtopico: string;
  lote: string;
  issue_codes: string;
};

function flatten(source: 'supabase' | 'local', auditPath: string): ExportRow[] {
  const report = JSON.parse(readFileSync(auditPath, 'utf8')) as { rows: AuditRow[] };
  return report.rows
    .filter((r) => r.issues.some((i) => i.severity === 'error'))
    .map((r) => ({
      source,
      slug: r.slug,
      subtopico: r.subtopico ?? '',
      lote: r.lote ?? '',
      issue_codes: [
        ...new Set(
          r.issues.filter((i) => i.severity === 'error').map((i) => i.code),
        ),
      ].join(';'),
    }));
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function toCsv(rows: ExportRow[]): string {
  const header = 'source,slug,subtopico,lote,issue_codes';
  const lines = rows.map((r) =>
    [r.source, r.slug, r.subtopico, r.lote, r.issue_codes].map(csvEscape).join(','),
  );
  return [header, ...lines].join('\n');
}

function countBySubtopico(rows: ExportRow[]): [string, number][] {
  const map: Record<string, number> = {};
  for (const row of rows) {
    const key = row.subtopico || '(sem subtópico)';
    map[key] = (map[key] ?? 0) + 1;
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function main() {
  const root = process.cwd();
  const artifacts = resolve(root, 'artifacts');

  const supabase = flatten('supabase', resolve(artifacts, 'premium-supabase-audit.json'));
  const local = flatten('local', resolve(artifacts, 'premium-catalog-audit.json'));

  const stamp = new Date().toISOString();

  writeFileSync(
    resolve(artifacts, 'premium-needs-upgrade-supabase.json'),
    JSON.stringify({ generated_at: stamp, total: supabase.length, rows: supabase }, null, 2),
    'utf8',
  );
  writeFileSync(
    resolve(artifacts, 'premium-needs-upgrade-local.json'),
    JSON.stringify({ generated_at: stamp, total: local.length, rows: local }, null, 2),
    'utf8',
  );
  writeFileSync(
    resolve(artifacts, 'premium-needs-upgrade-supabase.csv'),
    toCsv(supabase),
    'utf8',
  );
  writeFileSync(resolve(artifacts, 'premium-needs-upgrade-local.csv'), toCsv(local), 'utf8');

  console.log(`[export] supabase=${supabase.length} → artifacts/premium-needs-upgrade-supabase.{json,csv}`);
  console.log(`[export] local=${local.length} → artifacts/premium-needs-upgrade-local.{json,csv}`);
  console.log('[export] supabase por subtópico (top 15):');
  for (const [subtopico, count] of countBySubtopico(supabase).slice(0, 15)) {
    console.log(`  ${count}\t${subtopico}`);
  }
}

main();
