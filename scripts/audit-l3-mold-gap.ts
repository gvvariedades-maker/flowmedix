#!/usr/bin/env tsx
/**
 * Mapeamento L3: cluster/ramo × molde atual × molde ideal.
 *
 *   npm run audit:l3-mold-gap
 *   npm run audit:l3-mold-gap -- --lote=saude-adolescente-completo
 *   npm run audit:l3-mold-gap -- --from-supabase
 *   npm run audit:l3-mold-gap -- --from-supabase --subtopico=Adolescente
 *
 * Saídas:
 *   artifacts/l3-mold-gap-audit.json + .md (última execução — global)
 *   artifacts/l3-mold-gap-audit-<pacote_prefix>.json + .md (quando --subtopico resolve registry)
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import { findPacoteBySubtopico, loadHandcraftRegistry } from '@/lib/catalogMigration/handcraftRegistry';
import { buildL3MoldGapReport, printL3MoldGapSummary } from '@/lib/slides/l3MoldGapAudit';

async function main() {
  const extraLote = parseArg('lote');
  const subtopico = parseArg('subtopico');
  const report = await buildL3MoldGapReport({
    extraLotes: extraLote ? [extraLote] : undefined,
    fromSupabase: hasFlag('from-supabase'),
    subtopicoFilter: subtopico,
  });

  printL3MoldGapSummary(report);

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });

  const md = renderMarkdownSummary(report);

  const outJson = resolve(artifactsDir, 'l3-mold-gap-audit.json');
  writeFileSync(outJson, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n[audit:l3-mold-gap] relatório=${outJson}`);

  const outMd = resolve(artifactsDir, 'l3-mold-gap-audit.md');
  writeFileSync(outMd, md, 'utf8');
  console.log(`[audit:l3-mold-gap] resumo=${outMd}`);

  if (subtopico) {
    const registry = loadHandcraftRegistry();
    const hit = findPacoteBySubtopico(registry, subtopico);
    const pacotePrefix = hit?.pacote.pacote_prefix ?? slugifyPacotePrefix(subtopico);
    const scopedJson = resolve(artifactsDir, `l3-mold-gap-audit-${pacotePrefix}.json`);
    const scopedMd = resolve(artifactsDir, `l3-mold-gap-audit-${pacotePrefix}.md`);
    writeFileSync(scopedJson, JSON.stringify(report, null, 2), 'utf8');
    writeFileSync(scopedMd, md, 'utf8');
    console.log(`[audit:l3-mold-gap] escopo subtópico=${scopedJson}`);
  }
}

function slugifyPacotePrefix(subtopico: string): string {
  return subtopico
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function renderMarkdownSummary(report: Awaited<ReturnType<typeof buildL3MoldGapReport>>): string {
  const s = report.summary;
  const sourceLabel = s.source === 'supabase' ? 'Supabase (vivo)' : 'lotes locais';
  const lines: string[] = [
    '# Auditoria L3 — gap de moldes',
    '',
    `Gerado em: ${report.generated_at}`,
    '',
    '## Resumo',
    '',
    `| Métrica | Valor |`,
    `|---------|-------|`,
    `| Fonte slugs | ${sourceLabel} |`,
    `| Clusters mapeados | ${s.cluster_rows} |`,
    `| Slugs auditados | ${s.slug_rows} |`,
    `| ok_existente | ${s.by_decision.ok_existente} |`,
    `| ok_generico | ${s.by_decision.ok_generico} |`,
    `| ramo_novo | ${s.by_decision.ramo_novo} |`,
    `| molde_inedito | ${s.by_decision.molde_inedito} |`,
    `| molde_redesign | ${s.by_decision.molde_redesign} |`,
    `| Pacotes inéditos únicos | ${s.inedito_packages_proposed} |`,
    `| Slugs com mismatch L3 | ${s.slug_mismatch_total} |`,
    '',
  ];

  if (s.slug_mismatch_by_subtopico && Object.keys(s.slug_mismatch_by_subtopico).length > 0) {
    lines.push('## Mismatch por subtópico', '');
    lines.push('| Subtópico | Slugs com mismatch |');
    lines.push('|-----------|-------------------|');
    for (const [sub, count] of Object.entries(s.slug_mismatch_by_subtopico).sort(
      (a, b) => b[1] - a[1],
    )) {
      lines.push(`| ${sub} | ${count} |`);
    }
    lines.push('');
  }

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
      lines.push(`- \`${branch}\`: ${count}`);
    }
  }

  return lines.join('\n');
}

main().catch((err) => {
  console.error('[audit:l3-mold-gap]', err);
  process.exitCode = 1;
});
