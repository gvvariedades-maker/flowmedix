import {
  G04_AMEOSC_SLUG,
  G04_EDUCA_SLUG,
  G04_PRODUCTION_APPROVAL_FLAGS,
  assertG04SlugMayEnterProduction,
  isG04SlugProductionApproved,
  isG04SlugProductionBlocked,
  listG04ProductionBlockedSlugs,
} from '@/lib/neurocanvas/g04ProductionApprovals';
import { EDITORIAL_QUEUE_BASELINE_G04 } from '@/lib/neurocanvas/editorialQueueBaselineG04';

describe('g04ProductionApprovals', () => {
  it('aprova somente AMEOSC', () => {
    expect(isG04SlugProductionApproved(G04_AMEOSC_SLUG)).toBe(true);
    expect(isG04SlugProductionApproved(G04_EDUCA_SLUG)).toBe(false);
    expect(G04_PRODUCTION_APPROVAL_FLAGS).toEqual({
      ameosc: true,
      educa: false,
      fenix_package_production_status: 'none',
    });
    expect(EDITORIAL_QUEUE_BASELINE_G04.production_approvals.ameosc).toBe(true);
    expect(EDITORIAL_QUEUE_BASELINE_G04.production_approvals.educa).toBe(false);
  });

  it('bloqueia EDUCA de forma efetiva (assert lança)', () => {
    expect(isG04SlugProductionBlocked(G04_EDUCA_SLUG)).toBe(true);
    expect(listG04ProductionBlockedSlugs()).toEqual([G04_EDUCA_SLUG]);
    expect(() => assertG04SlugMayEnterProduction(G04_EDUCA_SLUG)).toThrow(
      /bloqueado para produção/,
    );
    expect(() => assertG04SlugMayEnterProduction(G04_AMEOSC_SLUG)).not.toThrow();
  });

  it('não altera contagens nem Fase 0B', () => {
    expect(EDITORIAL_QUEUE_BASELINE_G04.unresolved).toBe(347);
    expect(EDITORIAL_QUEUE_BASELINE_G04.phase_0b_ready).toBe(false);
    expect(EDITORIAL_QUEUE_BASELINE_G04.editorial_readiness).toBe('NOT_READY');
  });
});
