import {
  INTENTIONAL_POLARITY_NOTE,
  evaluateNeuroVisualPlanParityGate,
  type NeuroVisualPlanParityReport,
} from '@/lib/neurocanvas/neuroVisualPlanParity';

function emptyReport(
  overrides: Partial<NeuroVisualPlanParityReport> = {},
): NeuroVisualPlanParityReport {
  return {
    schema_version: 'neurovisual-plan-parity-v0',
    questions_processed: 1,
    slides_compared: 4,
    slides_equivalent: 4,
    mismatches: [],
    intentional_polarity: {
      danger_zone_slides: 1,
      slides_with_valid_conduct: 1,
      valid_conduct_items: 2,
      polarity_path_mismatches: 0,
      note: INTENTIONAL_POLARITY_NOTE,
    },
    canonical_unresolved_slugs: 0,
    limitations: [],
    ...overrides,
  };
}

describe('evaluateNeuroVisualPlanParityGate (F1 expectativa)', () => {
  it('passa com valid_conduct reportado (divergência intencional de chrome)', () => {
    const gate = evaluateNeuroVisualPlanParityGate(emptyReport());
    expect(gate.ok).toBe(true);
    expect(gate.presentationMismatchTotal).toBe(0);
    expect(gate.polarityPathMismatchTotal).toBe(0);
  });

  it('falha em mismatch presentation/theme', () => {
    const gate = evaluateNeuroVisualPlanParityGate(
      emptyReport({ slides_equivalent: 3 }),
    );
    expect(gate.ok).toBe(false);
    expect(gate.presentationMismatchTotal).toBe(1);
  });

  it('falha quando polaridade plano≠direto', () => {
    const gate = evaluateNeuroVisualPlanParityGate(
      emptyReport({
        intentional_polarity: {
          danger_zone_slides: 1,
          slides_with_valid_conduct: 1,
          valid_conduct_items: 2,
          polarity_path_mismatches: 1,
          note: INTENTIONAL_POLARITY_NOTE,
        },
      }),
    );
    expect(gate.ok).toBe(false);
    expect(gate.polarityPathMismatchTotal).toBe(1);
  });
});
