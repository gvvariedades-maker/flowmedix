/**
 * Baseline da fila editorial NeuroCanvas após proveniência oficial IDECAN (PR #59).
 *
 * Contagens medidas em main limpo @ 11561b7b após neurocanvas:g04-apply-local.
 * Esta baseline NÃO fecha o gate editorial completo e NÃO autoriza Fase 0B.
 */
import { G04_PRODUCTION_APPROVAL_FLAGS } from '@/lib/neurocanvas/g04ProductionApprovals';

export const EDITORIAL_QUEUE_BASELINE_G04 = {
  /** Identificador da baseline de contagens (não confundir com o gate de fila G0.3A). */
  baseline_id: 'G0.4',
  measured_at: '2026-07-27',
  measured_from_commit: '11561b7bc2d195574d146b2701013a233b613267',
  catalog_scope: 'data/catalog-migration/**/questions/ (local, gitignored) + payloads do aplicador versionado',
  total_cases: 345,
  cluster_count: 110,
  official_lane_count: 16,
  manifest_conflict_lane_count: 6,
  /** Precedente G0.3A (congelado em 68c48d49) — histórico, não mais o esperado do validador. */
  previous_g03a: {
    total_cases: 676,
    cluster_count: 301,
    official_lane_count: 122,
    manifest_conflict_lane_count: 6,
  },
  /** Baseline anterior (pós-#55, pré-IDECAN) — histórico. */
  previous_g04_pre_idecan: {
    measured_from_commit: '7633118b27ca1c452568a13f50c49554967bf8dc',
    total_cases: 347,
    cluster_count: 111,
    official_lane_count: 18,
    manifest_conflict_lane_count: 6,
    idecan_status: 'defer_official_provenance_pending' as const,
  },
  editorial_readiness: 'NOT_READY' as const,
  phase_0b_ready: false,
  production_approvals: G04_PRODUCTION_APPROVAL_FLAGS,
  idecan_status: 'official_provenance_confirmed' as const,
  unresolved: 345,
  rationale:
    'Baseline alinhada a main @ 11561b7b após proveniência oficial IDECAN UFBA 2022 (PR #59): 2 slugs coleta materializados com fonte tier A. unresolved 347→345; official lane 18→16. IDECAN encerrado. AMEOSC A4 aprovado; EDUCA bloqueado. Gate editorial geral ainda aberto.',
  next_order: [
    'processar casos restantes nas lanes official (16), pedagogical, metadata e residual',
    'reexecutar auditoria até unresolved = 0',
    'gerar baseline final de fechamento editorial',
    'só então reavaliar e autorizar explicitamente a Fase 0B',
  ],
  explicitly_not_authorized: [
    'UI',
    'renderer',
    'piloto',
    'Supabase apply',
    'promote production_ready',
    'Fase 0B',
  ],
} as const;

export type EditorialQueueBaselineG04 = typeof EDITORIAL_QUEUE_BASELINE_G04;
