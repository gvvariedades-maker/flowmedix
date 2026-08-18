/**
 * Snapshot estável das constantes da baseline G0.4 — espelha
 * lib/neurocanvas/editorialQueueBaselineG04.ts (fonte de verdade no código).
 */
import { EDITORIAL_QUEUE_BASELINE_G04 } from '@/lib/neurocanvas/editorialQueueBaselineG04';

describe('editorialQueueBaselineG04', () => {
  it('congela as contagens medidas em main pós-manifest L1 (#61)', () => {
    expect(EDITORIAL_QUEUE_BASELINE_G04.baseline_id).toBe('G0.4');
    expect(EDITORIAL_QUEUE_BASELINE_G04.total_cases).toBe(339);
    expect(EDITORIAL_QUEUE_BASELINE_G04.cluster_count).toBe(104);
    expect(EDITORIAL_QUEUE_BASELINE_G04.official_lane_count).toBe(11);
    expect(EDITORIAL_QUEUE_BASELINE_G04.manifest_conflict_lane_count).toBe(0);
    expect(EDITORIAL_QUEUE_BASELINE_G04.unresolved).toBe(339);
  });

  it('mantém fila NOT_READY / Fase 0B fechada; AMEOSC A4 ok; IDECAN encerrado', () => {
    expect(EDITORIAL_QUEUE_BASELINE_G04.editorial_readiness).toBe('NOT_READY');
    expect(EDITORIAL_QUEUE_BASELINE_G04.phase_0b_ready).toBe(false);
    expect(EDITORIAL_QUEUE_BASELINE_G04.production_approvals.ameosc).toBe(true);
    expect(EDITORIAL_QUEUE_BASELINE_G04.production_approvals.educa).toBe(false);
    expect(EDITORIAL_QUEUE_BASELINE_G04.idecan_status).toBe(
      'official_provenance_confirmed',
    );
  });
});
