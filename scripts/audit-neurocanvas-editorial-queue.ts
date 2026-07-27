#!/usr/bin/env tsx
/**
 * Gate G0.3A — Fila de reconciliação editorial NeuroCanvas.
 * Exige catálogo local; não entra no test:unit; não consulta Supabase por padrão.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  buildEditorialQueue,
  toPortableCatalogPath,
  validateEditorialQueueReport,
  type EditorialQueueReport,
  type ReviewPackCase,
} from '@/lib/neurocanvas/editorialQueue';
import type { LiveReconciliationReport } from '@/lib/neurocanvas/liveReconciliation';
import { portableizeAuditArtifact, scanPortableArtifactText } from '@/lib/neurocanvas/portablePath';

function loadLiveArtifact(artifactsDir: string, repoRoot: string): LiveReconciliationReport | null {
  const livePath = resolve(artifactsDir, 'neurocanvas-live-reconciliation.json');
  if (!existsSync(livePath)) return null;
  const raw = JSON.parse(readFileSync(livePath, 'utf8')) as LiveReconciliationReport;
  return {
    ...raw,
    slugs: raw.slugs.map((s) => ({
      ...s,
      matched_candidate_paths: (s.matched_candidate_paths ?? []).map((p) => toPortableCatalogPath(p, repoRoot)),
      documented_editorial_path: s.documented_editorial_path
        ? toPortableCatalogPath(s.documented_editorial_path, repoRoot)
        : null,
    })),
  };
}

function renderQueueMarkdown(report: EditorialQueueReport): string {
  const laneRows = report.lanes.map(
    (l) => `| ${l.lane} | ${l.count} | ${l.description.slice(0, 90)} |`,
  );

  return [
    '# NeuroCanvas — fila editorial G0.3A',
    '',
    `Gate: **${report.gate}** · schema v${report.schema_version} · dedupe v${report.dedupe_schema_version}`,
    '',
    '## Reconciliação',
    '',
    `| Métrica | Valor |`,
    `|---------|------:|`,
    `| Casos (slugs unresolved) | ${report.reconciliation.total_cases} |`,
    `| Clusters | ${report.reconciliation.cluster_count} |`,
    `| Todos pending | ${report.reconciliation.all_pending ? 'sim' : 'não'} |`,
    `| Official lane | ${report.reconciliation.official_lane_count} |`,
    `| Manifest conflict lane | ${report.reconciliation.manifest_conflict_lane_count} |`,
    `| Pedagogical lane | ${report.reconciliation.pedagogical_lane_count} |`,
    `| Metadata lane | ${report.reconciliation.metadata_lane_count} |`,
    '',
    report.lane_overlap_note,
    '',
    '## Trilhos de revisão',
    '',
    '| lane | count | descrição |',
    '|------|------:|-----------|',
    ...laneRows,
    '',
    '## Autoridade',
    '',
    report.authority_note,
    '',
    `Live artifact consumido: **${report.source.live_artifact_consumed ? 'sim' : 'não'}**`,
    '',
    '## Amostra estratificada (20 case_ids)',
    '',
    ...report.review_pack.stratified_sample_case_ids.map((id) => `- \`${id}\``),
    '',
    '## Proibido nesta fase',
    '',
    '- Nenhum candidato selecionado automaticamente',
    '- Nenhuma alteração em manifests, registry ou JSON de questões',
    '- Live = evidência operacional apenas',
    '',
  ].join('\n');
}

function renderReviewPackMarkdown(report: EditorialQueueReport): string {
  const sampleIds = new Set(report.review_pack.stratified_sample_case_ids);
  const samples = report.review_pack.cases.filter((c) => sampleIds.has(c.case_id));

  const lines = [
    '# NeuroCanvas — review pack G0.3A (amostra 20)',
    '',
    'Pacote compacto para revisão humana. **Não** contém recomendação de vencedor.',
    '',
  ];

  for (const c of samples) {
    lines.push(...renderCaseSection(c));
  }

  return lines.join('\n');
}

function renderCaseSection(c: ReviewPackCase): string[] {
  const lines = [
    `## ${c.slug}`,
    '',
    `- **case_id:** \`${c.case_id}\``,
    `- **cluster:** \`${c.cluster_id}\` (${c.cluster_size} slug(s))`,
    `- **severity:** ${c.severity}`,
    `- **lanes:** ${c.lanes.join(', ') || '(nenhum trilho específico)'}`,
    `- **live_status:** ${c.live_status}`,
    `- **manifest_conflict:** ${c.manifest_conflict}`,
    `- **official_review_required:** ${c.official_review_required}`,
    `- **editorial_status:** ${c.editorial_status}`,
    '',
  ];

  if (c.official_source_alert) {
    lines.push(`> **Alerta fonte oficial:** ${c.official_source_alert}`, '');
  }

  lines.push(`*${c.live_evidence_note}*`, '', '### Candidatos', '', '| path | semantic_sha256 | live_match | documented |', '|------|-----------------|------------|------------|');

  for (const cand of c.candidates) {
    const hash = cand.semantic_sha256?.slice(0, 12) ?? 'n/d';
    lines.push(
      `| ${cand.path} | ${hash}… | ${cand.matches_live_operational ? 'sim (operacional)' : 'não'} | ${cand.documented ? 'sim' : 'não'} |`,
    );
  }

  lines.push('', '### Campos divergentes', '', c.differing_fields.length ? c.differing_fields.map((f) => `- ${f}`).join('\n') : '- (nenhum)', '');

  if (c.pedagogical_diffs.length) {
    lines.push('### Diff pedagógico (NeuroSlides)', '');
    for (const diff of c.pedagogical_diffs) {
      lines.push(`**${diff.field}** (${diff.kind})`);
      for (const [path, summary] of Object.entries(diff.summaries_by_path)) {
        lines.push(`- \`${path}\`: ${summary}`);
      }
      lines.push('');
    }
  }

  lines.push('### Ações permitidas', '', ...c.permitted_actions.map((a) => `- ${a}`), '', '---', '');
  return lines;
}

async function main() {
  const repoRoot = process.cwd();
  const artifactsDir = resolve(repoRoot, 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });

  const liveReport = loadLiveArtifact(artifactsDir, repoRoot);
  if (liveReport) {
    console.log('[G0.3A] Consumindo artifact live existente (sem Supabase).');
  } else {
    console.log('[G0.3A] Artifact live ausente — fila sem evidência operacional.');
  }

  console.log('[G0.3A] Construindo fila editorial…');
  const report = buildEditorialQueue({ repoRoot, liveReport });

  const validationErrors = validateEditorialQueueReport(report);
  if (validationErrors.length) {
    console.error('[G0.3A] Validação falhou:');
    for (const e of validationErrors) console.error(`  - ${e}`);
    process.exitCode = 1;
  } else {
    console.log(
      `[G0.3A] Validação OK (baseline G0.4): ${report.reconciliation.total_cases} casos, ${report.reconciliation.cluster_count} clusters, ${report.reconciliation.official_lane_count} official, ${report.reconciliation.manifest_conflict_lane_count} manifest conflict.`,
    );
  }

  const portable = portableizeAuditArtifact(report, repoRoot);
  const jsonPath = resolve(artifactsDir, 'neurocanvas-editorial-queue.json');
  const reviewJsonPath = resolve(artifactsDir, 'neurocanvas-editorial-review-pack.json');
  const mdPath = resolve(artifactsDir, 'neurocanvas-editorial-queue.md');
  const reviewMdPath = resolve(artifactsDir, 'neurocanvas-editorial-review-pack.md');

  const jsonText = JSON.stringify(portable, null, 2);
  const portableIssues = scanPortableArtifactText(jsonText);
  if (portableIssues.length) {
    console.error('[G0.3A] Artifact não portável:', portableIssues.join(', '));
    process.exitCode = 1;
  }

  writeFileSync(jsonPath, jsonText, 'utf8');
  writeFileSync(
    reviewJsonPath,
    JSON.stringify(
      {
        gate: report.gate,
        stratified_sample_case_ids: report.review_pack.stratified_sample_case_ids,
        cases: report.review_pack.cases.filter((c) =>
          report.review_pack.stratified_sample_case_ids.includes(c.case_id),
        ),
      },
      null,
      2,
    ),
    'utf8',
  );
  writeFileSync(mdPath, renderQueueMarkdown(report), 'utf8');
  writeFileSync(reviewMdPath, renderReviewPackMarkdown(report), 'utf8');

  console.log('[G0.3A] Artifacts escritos em artifacts/neurocanvas-editorial-*.json|md');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
