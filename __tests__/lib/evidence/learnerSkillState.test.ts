import {
  replayLearnerSkillEvents,
  transitionLearnerSkillState,
  violatesSingleT1MasteryInvariant,
  type LearnerSkillEvent,
} from '@/lib/evidence/learnerSkillState';

describe('transitionLearnerSkillState (ADR §12)', () => {
  it('acertou_com_chute leva a em_consolidacao', () => {
    expect(
      transitionLearnerSkillState('desconhecido', { type: 'acertou_com_chute' }),
    ).toBe('em_consolidacao');
  });

  it('errou_com_certeza leva a desconhecido (misconception forte)', () => {
    expect(
      transitionLearnerSkillState('adquirido', { type: 'errou_com_certeza' }),
    ).toBe('desconhecido');
  });

  it('acertou_transferencia_imediata leva a adquirido', () => {
    expect(
      transitionLearnerSkillState('desconhecido', {
        type: 'acertou_transferencia_imediata',
      }),
    ).toBe('adquirido');
  });

  it('errou_transferencia_imediata leva a em_consolidacao', () => {
    expect(
      transitionLearnerSkillState('adquirido', {
        type: 'errou_transferencia_imediata',
      }),
    ).toBe('em_consolidacao');
  });

  it('acertou_revisao_inedita leva a em_consolidacao', () => {
    expect(
      transitionLearnerSkillState('adquirido', { type: 'acertou_revisao_inedita' }),
    ).toBe('em_consolidacao');
  });

  it('nova_evidencia_segura_separada_no_tempo leva a dominado', () => {
    expect(
      transitionLearnerSkillState('em_consolidacao', {
        type: 'nova_evidencia_segura_separada_no_tempo',
      }),
    ).toBe('dominado');
  });

  it('erro_apos_dominio_ou_consolidacao leva a em_risco', () => {
    expect(
      transitionLearnerSkillState('dominado', {
        type: 'erro_apos_dominio_ou_consolidacao',
      }),
    ).toBe('em_risco');
  });

  it('concluiu_neuroslides nunca altera o estado (content_consumed, ADR §13)', () => {
    for (const state of ['desconhecido', 'adquirido', 'em_consolidacao', 'dominado', 'em_risco'] as const) {
      expect(transitionLearnerSkillState(state, { type: 'concluiu_neuroslides' })).toBe(state);
    }
  });

  it('medicao_holdout nunca altera o estado (outcome neutro, ADR §13, §15, §18)', () => {
    for (const state of ['desconhecido', 'adquirido', 'em_consolidacao', 'dominado', 'em_risco'] as const) {
      expect(transitionLearnerSkillState(state, { type: 'medicao_holdout' })).toBe(state);
    }
  });

  it('é puro e determinístico', () => {
    const event: LearnerSkillEvent = { type: 'acertou_com_chute' };
    expect(transitionLearnerSkillState('desconhecido', event)).toBe(
      transitionLearnerSkillState('desconhecido', event),
    );
  });
});

describe('replayLearnerSkillEvents', () => {
  it('aplica eventos em sequência e retorna o estado final', () => {
    const final = replayLearnerSkillEvents('desconhecido', [
      { type: 'acertou_transferencia_imediata' },
      { type: 'concluiu_neuroslides' },
      { type: 'acertou_revisao_inedita' },
      { type: 'nova_evidencia_segura_separada_no_tempo' },
    ]);
    expect(final).toBe('dominado');
  });

  it('sequência vazia mantém o estado inicial', () => {
    expect(replayLearnerSkillEvents('em_consolidacao', [])).toBe('em_consolidacao');
  });
});

describe('violatesSingleT1MasteryInvariant (ADR §12 — T1 sozinho nunca basta)', () => {
  it('detecta violação: uma única transferência correta não pode produzir dominado', () => {
    const events: LearnerSkillEvent[] = [{ type: 'acertou_transferencia_imediata' }];
    expect(violatesSingleT1MasteryInvariant(events, 'dominado')).toBe(true);
  });

  it('não viola quando há evidência adicional de aquisição', () => {
    const events: LearnerSkillEvent[] = [
      { type: 'acertou_transferencia_imediata' },
      { type: 'acertou_revisao_inedita' },
      { type: 'nova_evidencia_segura_separada_no_tempo' },
    ];
    expect(violatesSingleT1MasteryInvariant(events, 'dominado')).toBe(false);
  });

  it('não viola quando o estado final não é dominado', () => {
    const events: LearnerSkillEvent[] = [{ type: 'acertou_transferencia_imediata' }];
    expect(violatesSingleT1MasteryInvariant(events, 'adquirido')).toBe(false);
  });
});
