import { EvidenceEngineGateError } from '@/lib/evidence/fsrsSkill';
import { computeArmAssignmentId } from '@/lib/evidence/rct1';
import {
  assignRct2Arm,
  computeReviewsPerConsolidatedSkillStub,
  computeRetentionPerMinuteStudiedStub,
  resolveSchedulingPolicy,
} from '@/lib/evidence/rct2';

describe('assignRct2Arm — nova randomização, novo experiment_id (ADR §25)', () => {
  it('é determinístico para o mesmo (user, experiment)', () => {
    const first = assignRct2Arm('user-1', 'exp-rct2');
    const second = assignRct2Arm('user-1', 'exp-rct2');
    expect(first).toEqual(second);
  });

  it('produz um arm_assignment_id diferente do RCT-1 para o mesmo usuário (experiment_id distinto)', () => {
    const rct1Id = computeArmAssignmentId('user-1', 'exp-rct1');
    const rct2 = assignRct2Arm('user-1', 'exp-rct2');
    expect(rct2.arm_assignment_id).not.toBe(rct1Id);
  });

  it('treatmentRatioPercent=100 sempre atribui treatment_fsrs', () => {
    expect(assignRct2Arm('user-x', 'exp-rct2', 100).arm).toBe('treatment_fsrs');
  });
});

describe('resolveSchedulingPolicy', () => {
  it('só o braço treatment_fsrs usa FSRS', () => {
    expect(resolveSchedulingPolicy('control_fixed_intervals').uses_fsrs).toBe(false);
    expect(resolveSchedulingPolicy('treatment_fsrs').uses_fsrs).toBe(true);
  });
});

describe('métricas stub — gate rct1UpliftConfirmed', () => {
  it('computeRetentionPerMinuteStudiedStub lança sem gate confirmado', () => {
    expect(() =>
      computeRetentionPerMinuteStudiedStub({ correctUneditedAttempts: 10, minutesStudied: 5 }, false),
    ).toThrow(EvidenceEngineGateError);
  });

  it('computeRetentionPerMinuteStudiedStub calcula com gate confirmado', () => {
    const result = computeRetentionPerMinuteStudiedStub(
      { correctUneditedAttempts: 10, minutesStudied: 5 },
      true,
    );
    expect(result).toBe(2);
  });

  it('computeReviewsPerConsolidatedSkillStub lança sem gate confirmado', () => {
    expect(() => computeReviewsPerConsolidatedSkillStub(20, 4, false)).toThrow(
      EvidenceEngineGateError,
    );
  });

  it('computeReviewsPerConsolidatedSkillStub calcula com gate confirmado', () => {
    expect(computeReviewsPerConsolidatedSkillStub(20, 4, true)).toBe(5);
  });
});
