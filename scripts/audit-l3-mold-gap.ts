#!/usr/bin/env tsx
/**
 * Mapeamento L3: cluster/ramo × molde atual × molde ideal.
 *
 *   npm run audit:l3-mold-gap
 *   npm run audit:l3-mold-gap -- --lote=saude-adolescente-completo
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { buildL3MoldGapReport, printL3MoldGapSummary } from '@/lib/slides/l3MoldGapAudit';

function main() {
  const extraLote = parseArg('lote');
  const report = buildL3MoldGapReport({
    extraLotes: extraLote ? [extraLote] : undefined,
  });

  printL3MoldGapSummary(report);

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outJson = resolve(artifactsDir, 'l3-mold-gap-audit.json');
  writeFileSync(outJson, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n[audit:l3-mold-gap] relatório=${outJson}`);

  const md = renderMarkdownSummary(report);
  const outMd = resolve(artifactsDir, 'l3-mold-gap-audit.md');
  writeFileSync(outMd, md, 'utf8');
  console.log(`[audit:l3-mold-gap] resumo=${outMd}`);
}

function renderMarkdownSummary(report: ReturnType<typeof buildL3MoldGapReport>): string {
  const s = report.summary;
  const lines: string[] = [
    '# Auditoria L3 — gap de moldes',
    '',
    `Gerado em: ${report.generated_at}`,
    '',
    '## Resumo',
    '',
    `| Métrica | Valor |`,
    `|---------|-------|`,
    `| Clusters mapeados | ${s.cluster_rows} |`,
    `| Slugs auditados (local) | ${s.slug_rows} |`,
    `| ok_existente | ${s.by_decision.ok_existente} |`,
    `| ok_generico | ${s.by_decision.ok_generico} |`,
    `| ramo_novo | ${s.by_decision.ramo_novo} |`,
    `| molde_inedito | ${s.by_decision.molde_inedito} |`,
    `| Pacotes inéditos únicos | ${s.inedito_packages_proposed} |`,
    `| Slugs com mismatch L3 | ${s.slug_mismatch_total} |`,
    '',
  ];

  if (report.inedito_candidates.length > 0) {
    lines.push('## Candidatos a molde inédito (pacote de 4 variantes)', '');
    for (const c of report.inedito_candidates) {
      lines.push(`### ${c.subtopico} — ${c.cluster_label}`);
      lines.push(`- **Slugs:** ${c.slug_count} · **Ramo:** \`${c.branch_id}\``);
      lines.push(`- **Pacote proposto:** ${c.ideal_mold_package}`);
      lines.push(`- ${c.rationale}`, '');
    }
  }

  lines.push('## Matriz por cluster', '');
  lines.push('| Subtópico | Cluster | Slugs | % | Decisão | Ramo | Ideal |');
  lines.push('|-----------|---------|-------|---|---------|------|-------|');
  for (const r of report.clusters) {
    lines.push(
      `| ${r.subtopico} | ${r.cluster_label} | ${r.slug_count} | ${r.pct}% | ${r.decision} | \`${r.branch_id}\` | ${r.ideal_mold_package.slice(0, 60)}… |`,
    );
  }

  if (report.slugs.length > 0) {
    lines.push('', '## Slugs (amostra com branch inferido)', '');
    const byBranch: Record<string, number> = {};
    for (const row of report.slugs) {
      const b = row.inferred_branch ?? '—';
      byBranch[b] = (byBranch[b] ?? 0) + 1;
    }
    for (const [branch, count] of Object.entries(byBranch).sort((a, b) => b[1] - a[1])) {
      lines.push(`- \`${branch}\`: ${count} slug(s)`);
    }
  }

  return lines.join('\n');
}

main();
