import {
  runSimuladoQuestaoSlimPayloadScenario,
  runSimuladoResponderPatchScenario,
  runSimuladoSession50PayloadScenario,
} from '@/lib/simulado/perfSmokeScenarios';

describe('perfSmokeScenarios (simulado)', () => {
  it('simulado_session_50 permanece abaixo de 80 KB', () => {
    const result = runSimuladoSession50PayloadScenario();
    expect(result.failureCount).toBe(0);
    expect(result.bytes).toBeLessThan(result.budgetBytes);
    expect(result.bytes).toBeLessThan(80_000);
  });

  it('simulado_questao_slim permanece abaixo de 5 KB', () => {
    const result = runSimuladoQuestaoSlimPayloadScenario();
    expect(result.failureCount).toBe(0);
    expect(result.bytes).toBeLessThan(5_000);
  });

  it('simulado_responder_patch permanece compacto', () => {
    const result = runSimuladoResponderPatchScenario();
    expect(result.failureCount).toBe(0);
    expect(result.bytes).toBeLessThan(4_000);
  });
});
