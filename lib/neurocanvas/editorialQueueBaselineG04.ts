/**
 * Baseline da fila editorial NeuroCanvas após o subgate de
 * reprodutibilidade/materialização G0.4 (PR #55 → main @ 7633118b).
 *
 * Esta baseline deixa a auditoria consistente com o catálogo pós-materialização.
 * Ela NÃO fecha o gate editorial completo e NÃO autoriza Fase 0B.
 */
import { G04_PRODUCTION_APPROVAL_FLAGS } from '@/lib/neurocanvas/g04ProductionApprovals';

export const EDITORIAL_QUEUE_BASELINE_G04 = {
  /** Identificador da baseline de contagens (não confundir com o gate de fila G0.3A). */
  baseline_id: 'G0.4',
  measured_at: '2026-07-27',
  measured_from_commit: '7633118b27ca1c452568a13f50c49554967bf8dc',
  catalog_scope: 'data/catalog-migration/**/questions/ (local, gitignored) + payloads do aplicador versionado',
  total_cases: 347,
  cluster_count: 111,
  official_lane_count: 18,
  manifest_conflict_lane_count: 6,
  /** Precedente G0.3A (congelado em 68c48d49) — histórico, não mais o esperado do validador. */
  previous_g03a: {
    total_cases: 676,
    cluster_count: 301,
    official_lane_count: 122,
    manifest_conflict_lane_count: 6,
  },
  editorial_readiness: 'NOT_READY' as const,
  phase_0b_ready: false,
  production_approvals: G04_PRODUCTION_APPROVAL_FLAGS,
  idecan_status: 'defer_official_provenance_pending' as const,
  unresolved: 347,
  rationale:
    'Baseline alinhada ao resultado de main limpo após materialização G0.4 (4 candidatos) e remoção de 2 colisões de Anatomia. Restam 347 unresolved. Aprovação de produção e resolução editorial da fila são gates diferentes. A4 parcial 2026-07-27: AMEOSC production_approved=true; EDUCA bloqueado (item defeituoso sem isolamento de métricas). Contagens da baseline permanecem 347/111/18/6. IDECAN reduz no máximo 2 unresolved.',
  next_order: [
    'obter e aplicar fontes oficiais dos 2 IDECAN (reduz no máximo 2 unresolved)',
    'processar demais casos nas lanes official, pedagogical, metadata e residual',
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
