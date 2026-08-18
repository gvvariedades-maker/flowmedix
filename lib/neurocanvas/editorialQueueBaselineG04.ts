/**
 * Baseline da fila editorial NeuroCanvas após manifest conflict L1 (PR #61).
 *
 * Contagens medidas em main @ cf840997 após neurocanvas:g04-manifest-l1 (idempotente).
 * Esta baseline NÃO fecha o gate editorial completo e NÃO autoriza Fase 0B.
 */
import { G04_PRODUCTION_APPROVAL_FLAGS } from '@/lib/neurocanvas/g04ProductionApprovals';

export const EDITORIAL_QUEUE_BASELINE_G04 = {
  /** Identificador da baseline de contagens (não confundir com o gate de fila G0.3A). */
  baseline_id: 'G0.4',
  measured_at: '2026-07-27',
  measured_from_commit: 'cf840997727a74edab13d38315b70e8c58c49943',
  catalog_scope:
    'data/catalog-migration/**/questions/ (local, gitignored) + neurocanvas:g04-manifest-l1',
  total_cases: 339,
  cluster_count: 104,
  official_lane_count: 11,
  manifest_conflict_lane_count: 0,
  /** Precedente G0.3A (congelado em 68c48d49) — histórico, não mais o esperado do validador. */
  previous_g03a: {
    total_cases: 676,
    cluster_count: 301,
    official_lane_count: 122,
    manifest_conflict_lane_count: 6,
  },
  /** Baseline anterior (pós-#60, pré-manifest L1) — histórico. */
  previous_g04_post_idecan: {
    measured_from_commit: '28bc667927a74edab13d38315b70e8c58c49943',
    total_cases: 345,
    cluster_count: 110,
    official_lane_count: 16,
    manifest_conflict_lane_count: 6,
    idecan_status: 'official_provenance_confirmed' as const,
  },
  editorial_readiness: 'NOT_READY' as const,
  phase_0b_ready: false,
  production_approvals: G04_PRODUCTION_APPROVAL_FLAGS,
  idecan_status: 'official_provenance_confirmed' as const,
  unresolved: 339,
  rationale:
    'Baseline alinhada a main @ cf840997 após manifest conflict L1 (PR #61): 6 casos reconciliados; manifest_conflict_lane 6→0. unresolved 345→339; official lane 16→11 (5 casos eram manifest+official). IDECAN encerrado. AMEOSC A4 aprovado; EDUCA bloqueado. Gate editorial geral ainda aberto.',
  next_order: [
    'processar official lane restante (11) por banca com proveniência',
    'partição exaustiva s2_non_slide (170) + pedagogical (84) + metadata (74)',
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
