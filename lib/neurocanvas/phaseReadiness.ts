import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildCanonicalCatalog } from '@/lib/neurocanvas/canonicalCatalog';
import type { LiveReconciliationReport } from '@/lib/neurocanvas/liveReconciliation';
import {
  gradeSlideReadiness,
} from '@/lib/neurocanvas/readiness';
import { buildResolverAuditReport } from '@/lib/neurocanvas/resolverAudit';
import type { ResolverReconciliationReport } from '@/lib/neurocanvas/resolverReconciliation';
import { normalizeReverseStudySlide } from '@/lib/reverseStudySlidesNormalize';
import { sortReverseStudySlides } from '@/lib/reverseStudySlideOrder';
import { readQuestionJsonFile } from '@/lib/neurocanvas/canonicalCatalog';

export type PhaseVerdict = 'READY' | 'READY COM RESTRIÇÕES' | 'NOT READY';

export type PhaseReadinessReport = {
  generated_at: string;
  gate: 'G0.2';
  phases: {
    phase_0a: { verdict: PhaseVerdict; rationale: string[]; blockers: string[] };
    phase_0b: { verdict: PhaseVerdict; rationale: string[]; blockers: string[] };
    phase_2: { verdict: PhaseVerdict; rationale: string[]; blockers: string[] };
  };
  cohort: {
    pilot_count: number;
    control_count: number;
    representative: boolean;
    note: string;
    generic_a_count: number;
    generic_by_type: Record<string, number>;
    generic_by_subtopico: { subtopico: string; count: number }[];
    /** Sempre null no G0.2 — genéricos A estão na baseline canônica, fora do escopo live dos 676 blockers. */
    generic_operational_live_match: null;
    generic_operational_live_scope_note: string;
    generic_editorial_documented: number;
  };
  live_access: boolean;
  unresolved_blockers: number;
};

function buildGenericCohortStats(
  catalog: ReturnType<typeof buildCanonicalCatalog>,
  resolverRows: ReturnType<typeof buildResolverAuditReport>['rows'],
): PhaseReadinessReport['cohort'] {
  const pilotPath = resolve('artifacts/neurocanvas-pilot-cohort.json');
  const pilot = existsSync(pilotPath)
    ? (JSON.parse(readFileSync(pilotPath, 'utf8')) as { pilot_count: number; control_count: number })
    : { pilot_count: 0, control_count: 0 };

  const genericRows = resolverRows.filter((r) => r.decision === 'generic_semantic');
  const genericA = genericRows.filter((r) => {
    const sel = catalog.selections.get(r.slug);
    if (!sel) return false;
    const q = readQuestionJsonFile(sel.path) as { reverse_study_slides?: unknown[] };
    const slides = sortReverseStudySlides(
      (q.reverse_study_slides ?? []).map((s) => normalizeReverseStudySlide(s)) as { type?: string }[],
    ) as Record<string, unknown>[];
    const slide = slides[r.slide_index];
    return slide && gradeSlideReadiness(slide) === 'A';
  });

  const byType: Record<string, number> = {};
  const bySub = new Map<string, number>();
  for (const r of genericA) {
    byType[r.slide_type] = (byType[r.slide_type] ?? 0) + 1;
    const sub = r.subtopico ?? '(sem subtopico)';
    bySub.set(sub, (bySub.get(sub) ?? 0) + 1);
  }

  const documented = genericA.filter((r) => {
    const sel = catalog.selections.get(r.slug);
    return Boolean(sel?.reason && sel.reason !== 'only_copy');
  }).length;

  return {
    pilot_count: pilot.pilot_count,
    control_count: pilot.control_count,
    representative: false,
    note:
      'Fixture técnica (41 pilotos + 41 controles) — não é coorte experimental representativa do catálogo nem dos 676 blockers.',
    generic_a_count: genericA.length,
    generic_by_type: byType,
    generic_by_subtopico: [...bySub.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([subtopico, count]) => ({ subtopico, count })),
    generic_operational_live_match: null,
    generic_operational_live_scope_note:
      'Não avaliado no G0.2 — os 1.907 genéricos grade A pertencem à baseline canônica (4.975 slugs), fora do escopo da consulta live dos 676 blockers.',
    generic_editorial_documented: documented,
  };
}

export function buildPhaseReadinessReport(
  resolverReconciliation: ResolverReconciliationReport,
  liveReport: LiveReconciliationReport,
): PhaseReadinessReport {
  const catalog = buildCanonicalCatalog();
  const resolver = buildResolverAuditReport({ mode: 'catalog', canonical: true });
  const unresolved = catalog.unresolved_slugs.length;
  const liveOk = liveReport.live_access.available;

  const phase0aBlockers: string[] = [];
  if (!liveOk) {
    phase0aBlockers.push('Live read-only indisponível — wrapper pode usar input runtime, mas evidência operacional não validada.');
  }
  const phase0aVerdict: PhaseVerdict =
    phase0aBlockers.length === 0 ? 'READY' : 'READY COM RESTRIÇÕES';

  const phase0bBlockers: string[] = [];
  if (unresolved > 0) phase0bBlockers.push(`${unresolved} slugs unresolved — fonte canônica editorial não reprodutível.`);
  if (!liveOk) phase0bBlockers.push('Comparação live não executada — questionHash baseline incompleta para blockers.');
  if (catalog.baseline_materially_affected) {
    phase0bBlockers.push('baseline_materially_affected=true — catálogo parcial.');
  }
  const phase0bVerdict: PhaseVerdict = phase0bBlockers.length === 0 ? 'READY' : 'NOT READY';

  const phase2Blockers: string[] = [];
  if (unresolved > 0) phase2Blockers.push(`Excluir ${unresolved} unresolved do piloto visual.`);
  const s3Count = liveReport.by_severity.S3.total;
  if (s3Count > 0) phase2Blockers.push(`${s3Count} blockers S3 exigem revisão oficial antes de composições visuais.`);
  const divergent = liveReport.slugs.filter((s) => s.live_match_class === 'live_matches_no_candidate').length;
  if (divergent > 0) phase2Blockers.push(`${divergent} slugs live sem match local.`);
  const phase2Verdict: PhaseVerdict = phase2Blockers.length === 0 ? 'READY' : 'NOT READY';

  const cohort = buildGenericCohortStats(catalog, resolver.rows);

  return {
    generated_at: new Date().toISOString(),
    gate: 'G0.2',
    phases: {
      phase_0a: {
        verdict: phase0aVerdict,
        rationale: [
          'NeuroVisualPlan wrapper interno sem cache persistente e sem diferença visual.',
          'Pode consumir input efetivo em runtime — não depende de escolha entre arquivos locais.',
        ],
        blockers: phase0aBlockers,
      },
      phase_0b: {
        verdict: phase0bVerdict,
        rationale: [
          'Cache por questionHash + baseline completa + testes de catálogo.',
          'Depende de fonte canônica reprodutível (manifest/registry).',
        ],
        blockers: phase0bBlockers,
      },
      phase_2: {
        verdict: phase2Verdict,
        rationale: [
          'Novas composições visuais no piloto.',
          'Exclui unresolved, S3 e divergentes até decisão editorial.',
        ],
        blockers: phase2Blockers,
      },
    },
    cohort,
    live_access: liveOk,
    unresolved_blockers: unresolved,
  };
}

export function renderPhaseReadinessMarkdown(report: PhaseReadinessReport): string {
  const renderPhase = (name: string, p: PhaseReadinessReport['phases']['phase_0a']) =>
    [
      `### ${name}`,
      '',
      `**Veredito: ${p.verdict}**`,
      '',
      ...p.rationale.map((r) => `- ${r}`),
      '',
      p.blockers.length ? `Blockers:\n\n${p.blockers.map((b) => `- ${b}`).join('\n')}` : 'Sem blockers.',
      '',
    ].join('\n');

  return [
    '# NeuroCanvas — phase readiness (G0.2)',
    '',
    `Gerado em: ${report.generated_at}`,
    '',
    `Unresolved blockers: **${report.unresolved_blockers}**`,
    `Live access: **${report.live_access ? 'sim' : 'não'}**`,
    '',
    '## Fases',
    '',
    renderPhase('Fase 0A — NeuroVisualPlan wrapper', report.phases.phase_0a),
    renderPhase('Fase 0B — Cache questionHash + baseline', report.phases.phase_0b),
    renderPhase('Fase 2 — Composições visuais piloto', report.phases.phase_2),
    '',
    '## Coorte (fixture técnica)',
    '',
    `Pilotos: ${report.cohort.pilot_count} · Controles: ${report.cohort.control_count}`,
    '',
    report.cohort.note,
    '',
    `Genéricos grade A: **${report.cohort.generic_a_count}**`,
    '',
    '### Por tipo',
    '',
    ...Object.entries(report.cohort.generic_by_type).map(([t, c]) => `- ${t}: ${c}`),
    '',
    '### Top subtópicos',
    '',
    ...report.cohort.generic_by_subtopico.map((r) => `- ${r.subtopico}: ${r.count}`),
    '',
    `Match operacional live (genéricos A): ${report.cohort.generic_operational_live_scope_note}`,
    `Canônico editorial documentado (genéricos A): ${report.cohort.generic_editorial_documented}`,
    '',
    '## Confirmações',
    '',
    '- Nenhuma escrita Supabase',
    '- Nenhuma alteração em manifests, registry, JSONs, player, resolver ou runtime',
    '- Nenhum commit, push, PR ou deploy',
    '',
  ].join('\n');
}
