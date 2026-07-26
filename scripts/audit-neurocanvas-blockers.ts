#!/usr/bin/env tsx
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  buildBlockerAnalysisReport,
  selectStratifiedBlockerSamples,
} from '@/lib/neurocanvas/blockerAnalysis';
import { portableizeAuditArtifact } from '@/lib/neurocanvas/portablePath';

function renderClustersMd(report: ReturnType<typeof buildBlockerAnalysisReport>): string {
  const lines = [
    '# NeuroCanvas — clusters de blockers (baseline determinística)',
    '',
    `Gerado em: ${report.generated_at}`,
    '',
    `Blockers: **${report.blockers.length}** · Clusters: **${report.clusters.length}**`,
    '',
    '## Partição exaustiva de slugs',
    '',
    `| Categoria | Count |`,
    `|-----------|------:|`,
    ...Object.entries(report.partition.by_category).map(([k, v]) => `| ${k} | ${v} |`),
    '',
    `**Reconciliação:** ${report.partition.reconciliation.baseline_selections} + ${report.partition.reconciliation.unresolved_blockers} + ${report.partition.reconciliation.invalid_slugs} = ${report.partition.total_disk_slugs}`,
    '',
    report.partition.reconciliation.note,
    '',
    `**Grupos divergentes:** ${report.partition.divergent_groups.total} = ${report.partition.divergent_groups.resolved} resolvidos + ${report.partition.divergent_groups.unresolved} unresolved`,
    '',
    report.partition.divergent_groups.off_by_one_explanation,
    '',
    '## Severidade S0–S4',
    '',
    ...(['S0', 'S1', 'S2', 'S3', 'S4'] as const).map(
      (s) => `- **${s}**: ${report.severity_distribution[s]}`,
    ),
    '',
    `Divergência de gabarito detectada: **${report.has_answer_key_divergence ? 'sim' : 'não'}**`,
    '',
    '## Top clusters (cobertura acumulada)',
    '',
    '| cluster_id | count | cum% | severity | evidence |',
    '|------------|------:|-----:|----------|----------|',
    ...report.clusters.slice(0, 25).map(
      (c) =>
        `| ${c.cluster_id.slice(0, 60)} | ${c.count} | ${c.cumulative_pct}% | ${c.severity_max} | ${c.evidence_pattern} |`,
    ),
    '',
    '## Campos divergentes mais frequentes',
    '',
    '| field | count | kind |',
    '|-------|------:|------|',
    ...report.field_frequency.slice(0, 25).map((f) => `| ${f.field} | ${f.count} | ${f.kind} |`),
    '',
    '## Potencial de resolução por contrato',
    '',
    '| cluster | slugs | risco | contrato necessário |',
    '|---------|------:|-------|---------------------|',
    ...report.resolution_potential.slice(0, 15).map(
      (r) => `| ${r.cluster_id.slice(0, 40)} | ${r.slug_count} | ${r.risk} | ${r.contract_rule_needed.slice(0, 80)} |`,
    ),
    '',
    `Decisões de contrato estimadas (mínimo): **${report.min_contract_decisions_estimate}** (uma por cluster).`,
    '',
  ];
  return lines.join('\n');
}

function renderSamplesMd(samples: ReturnType<typeof selectStratifiedBlockerSamples>): string {
  const lines = [
    '# NeuroCanvas — amostra estratificada de blockers (20)',
    '',
    `Exemplos: ${samples.length}`,
    '',
  ];
  for (const s of samples) {
    lines.push(
      `## ${s.slug}`,
      '',
      `- **Severidade:** ${s.severity}`,
      `- **Pacote:** ${s.pacote}`,
      `- **Assinatura paths:** ${s.path_signature}`,
      `- **Lotes:** ${s.lotes.join(', ')}`,
      `- **Manifest documentado:** ${s.documented_paths_count} cópia(s)`,
      `- **Hashes semânticos:** ${s.semantic_hashes.length} distintos`,
      `- **Campos:** ${s.differing_fields.slice(0, 10).join(', ') || 'n/d'}`,
      `- **Resumo:** ${s.safe_summary}`,
      `- **Por que unresolved:** ${s.resolution_reason}`,
      `- **Decisão humana:** ${s.human_decision}`,
      '',
      'Paths:',
      ...s.paths.map((p) => `  - ${p}`),
      '',
    );
  }
  return lines.join('\n');
}

async function main() {
  const repoRoot = process.cwd();
  const report = buildBlockerAnalysisReport({ repoRoot });
  const samples = selectStratifiedBlockerSamples(report, 20);

  const dir = resolve(repoRoot, 'artifacts');
  mkdirSync(dir, { recursive: true });

  const portableReport = portableizeAuditArtifact(report, repoRoot);
  const portableSamples = portableizeAuditArtifact({ generated_at: report.generated_at, samples }, repoRoot);

  writeFileSync(resolve(dir, 'neurocanvas-blocker-clusters.json'), JSON.stringify(portableReport, null, 2), 'utf8');
  writeFileSync(resolve(dir, 'neurocanvas-blocker-clusters.md'), renderClustersMd(report), 'utf8');
  writeFileSync(
    resolve(dir, 'neurocanvas-blocker-samples-20.json'),
    JSON.stringify(portableSamples, null, 2),
    'utf8',
  );
  writeFileSync(
    resolve(dir, 'neurocanvas-blocker-samples-20.md'),
    renderSamplesMd(portableSamples.samples),
    'utf8',
  );

  console.log('[audit:neurocanvas-blockers] clusters:', report.clusters.length);
  console.log('[audit:neurocanvas-blockers] blockers:', report.blockers.length);
  console.log('[audit:neurocanvas-blockers] S3+answer:', report.has_answer_key_divergence);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
