/**
 * Snapshot estável das constantes da baseline G0.4 — espelha
 * lib/neurocanvas/editorialQueueBaselineG04.ts (fonte de verdade no código).
 */
import { EDITORIAL_QUEUE_BASELINE_G04 } from '@/lib/neurocanvas/editorialQueueBaselineG04';

describe('editorialQueueBaselineG04', () => {
  it('congela as contagens medidas em main limpo pós-#55', () => {
    expect(EDITORIAL_QUEUE_BASELINE_G04.baseline_id).toBe('G0.4');
    expect(EDITORIAL_QUEUE_BASELINE_G04.total_cases).toBe(347);
    expect(EDITORIAL_QUEUE_BASELINE_G04.cluster_count).toBe(111);
    expect(EDITORIAL_QUEUE_BASELINE_G04.official_lane_count).toBe(18);
    expect(EDITORIAL_QUEUE_BASELINE_G04.manifest_conflict_lane_count).toBe(6);
    expect(EDITORIAL_QUEUE_BASELINE_G04.unresolved).toBe(347);
  });

  it('mantém fila NOT_READY / Fase 0B fechada; AMEOSC A4 ok; EDUCA ainda bloqueado', () => {
    expect(EDITORIAL_QUEUE_BASELINE_G04.editorial_readiness).toBe('NOT_READY');
    expect(EDITORIAL_QUEUE_BASELINE_G04.phase_0b_ready).toBe(false);
    expect(EDITORIAL_QUEUE_BASELINE_G04.production_approvals.ameosc).toBe(true);
    expect(EDITORIAL_QUEUE_BASELINE_G04.production_approvals.educa).toBe(false);
    expect(EDITORIAL_QUEUE_BASELINE_G04.idecan_status).toBe(
      'defer_official_provenance_pending',
    );
  });
});
