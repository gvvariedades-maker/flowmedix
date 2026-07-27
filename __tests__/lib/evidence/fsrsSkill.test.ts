import {
  EvidenceEngineGateError,
  computeNextIntervalDays,
  createInitialFsrsSkillState,
  updateFsrsSkillState,
  type FsrsReviewInput,
} from '@/lib/evidence/fsrsSkill';

function makeReview(overrides: Partial<FsrsReviewInput> = {}): FsrsReviewInput {
  return {
    context: 'scheduled_review',
    reviewed_before_explanation: true,
    outcome: 'good',
    reviewed_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('updateFsrsSkillState — gate rct1UpliftConfirmed (ADR §12, §25, §27)', () => {
  it('lança EvidenceEngineGateError quando rct1UpliftConfirmed !== true', () => {
    const state = createInitialFsrsSkillState();
    expect(() => updateFsrsSkillState(state, makeReview(), false)).toThrow(
      EvidenceEngineGateError,
    );
  });

  it('lança mesmo se rct1UpliftConfirmed for omitido/undefined implicitamente falso', () => {
    const state = createInitialFsrsSkillState();
    // @ts-expect-error — testando runtime guard mesmo com tipo forçado
    expect(() => updateFsrsSkillState(state, makeReview(), undefined)).toThrow(
      EvidenceEngineGateError,
    );
  });

  it('permite update quando rct1UpliftConfirmed === true e review é elegível', () => {
    const state = createInitialFsrsSkillState();
    const next = updateFsrsSkillState(state, makeReview(), true);
    expect(next.reps).toBe(1);
    expect(next.stability_days).toBeGreaterThan(state.stability_days);
  });
});

describe('updateFsrsSkillState — T1 nunca atualiza FSRS (ADR §13)', () => {
  it('rejeita context diferente de scheduled_review mesmo com gate satisfeito', () => {
    const state = createInitialFsrsSkillState();
    const invalidReview = {
      ...makeReview(),
      context: 'immediate_transfer' as unknown as 'scheduled_review',
    };
    expect(() => updateFsrsSkillState(state, invalidReview, true)).toThrow(/scheduled_review/);
  });

  it('rejeita revisão respondida depois da explicação', () => {
    const state = createInitialFsrsSkillState();
    expect(() =>
      updateFsrsSkillState(state, makeReview({ reviewed_before_explanation: false }), true),
    ).toThrow(/reviewed_before_explanation/);
  });
});

describe('updateFsrsSkillState — comportamento determinístico', () => {
  it('outcome "again" aumenta lapses e reduz estabilidade relativa', () => {
    const state = createInitialFsrsSkillState();
    const next = updateFsrsSkillState(state, makeReview({ outcome: 'again' }), true);
    expect(next.lapses).toBe(1);
    expect(next.stability_days).toBeLessThanOrEqual(state.stability_days);
  });

  it('outcome "easy" reduz difficulty (piso em 1)', () => {
    const state = { ...createInitialFsrsSkillState(), difficulty: 1 };
    const next = updateFsrsSkillState(state, makeReview({ outcome: 'easy' }), true);
    expect(next.difficulty).toBe(1);
  });

  it('mesmo input produz mesmo resultado (puro)', () => {
    const state = createInitialFsrsSkillState();
    const review = makeReview();
    expect(updateFsrsSkillState(state, review, true)).toEqual(
      updateFsrsSkillState(state, review, true),
    );
  });

  it('computeNextIntervalDays deriva do stability_days sem exigir gate', () => {
    const state = createInitialFsrsSkillState();
    expect(computeNextIntervalDays(state)).toBe(1);
  });
});
