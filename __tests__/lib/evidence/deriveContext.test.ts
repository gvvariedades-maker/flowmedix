import {
  deriveContextPhase1,
  evaluateClientContextAsPhase1Emit,
  resolvePersistedContext,
} from '@/lib/evidence/deriveContext';
import { EVIDENCE_ATTEMPT_CONTEXTS_RESERVED } from '@/lib/evidence/types';

describe('deriveContextPhase1', () => {
  it('registrar_tentativa → regular_practice', () => {
    expect(deriveContextPhase1({ route: 'registrar_tentativa' })).toBe(
      'regular_practice',
    );
    // session_kind ignorado nesta rota
    expect(
      deriveContextPhase1({
        route: 'registrar_tentativa',
        session_kind: 'diagnostico',
      }),
    ).toBe('regular_practice');
  });

  it('simulado_responder + diagnostico → diagnostic', () => {
    expect(
      deriveContextPhase1({
        route: 'simulado_responder',
        session_kind: 'diagnostico',
      }),
    ).toBe('diagnostic');
  });

  it('simulado_responder + livre → simulation', () => {
    expect(
      deriveContextPhase1({
        route: 'simulado_responder',
        session_kind: 'livre',
      }),
    ).toBe('simulation');
  });

  it('simulado_responder + weekly → simulation', () => {
    expect(
      deriveContextPhase1({
        route: 'simulado_responder',
        session_kind: 'weekly',
      }),
    ).toBe('simulation');
  });

  it('simulado_responder sem kind → simulation', () => {
    expect(deriveContextPhase1({ route: 'simulado_responder' })).toBe('simulation');
    expect(
      deriveContextPhase1({ route: 'simulado_responder', session_kind: null }),
    ).toBe('simulation');
  });
});

describe('evaluateClientContextAsPhase1Emit', () => {
  it.each(EVIDENCE_ATTEMPT_CONTEXTS_RESERVED)(
    'rejeita context reservado como emit: %s',
    (context) => {
      const result = evaluateClientContextAsPhase1Emit(context);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe('reserved_context');
    },
  );

  it('rejeita context futuro/inválido', () => {
    const result = evaluateClientContextAsPhase1Emit('future_context');
    expect(result).toMatchObject({ ok: false, code: 'invalid_context' });
  });

  it('aceita Phase1 como emit (ainda assim persistência deriva da rota)', () => {
    expect(evaluateClientContextAsPhase1Emit('regular_practice')).toEqual({
      ok: true,
      context: 'regular_practice',
    });
  });
});

describe('resolvePersistedContext', () => {
  it('nunca persiste context do cliente — sobrescreve com derivação da rota', () => {
    const result = resolvePersistedContext({
      route: 'registrar_tentativa',
      client_context: 'simulation',
    });
    expect(result.context).toBe('regular_practice');
    expect(result.client_emit).toEqual({
      ok: true,
      context: 'simulation',
    });
  });

  it('context reservado no body → client_emit rejeitado; persistido = derivado', () => {
    const result = resolvePersistedContext({
      route: 'simulado_responder',
      session_kind: 'diagnostico',
      client_context: 'immediate_transfer',
    });
    expect(result.context).toBe('diagnostic');
    expect(result.client_emit).toMatchObject({
      ok: false,
      code: 'reserved_context',
    });
  });

  it('sem client_context → client_emit null', () => {
    const result = resolvePersistedContext({
      route: 'simulado_responder',
      session_kind: 'livre',
    });
    expect(result.context).toBe('simulation');
    expect(result.client_emit).toBeNull();
  });
});
