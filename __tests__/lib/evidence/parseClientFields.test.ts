import {
  isUuidV4,
  parseClientFields,
} from '@/lib/evidence/parseClientFields';
import {
  EVIDENCE_ATTEMPT_CONTEXTS_PHASE1,
  EVIDENCE_ATTEMPT_CONTEXTS_RESERVED,
  EVIDENCE_CONVICTIONS,
  isEvidenceAttemptContextPhase1,
  isEvidenceConviction,
} from '@/lib/evidence/types';
import { loadEvidenceFixture } from './fixtures/loadFixture';

type ParseClientFixture = {
  valid_attempt_id: string;
  valid_attempt_id_alt: string;
  invalid_attempt_ids: string[];
  convictions_valid: string[];
  conviction_unknown_input: string;
  contexts_phase1: string[];
  contexts_reserved: string[];
  context_future: string;
  answer_change_count_valid: number;
  answer_change_count_negative: number;
  answer_change_count_non_integer: number;
  full_valid_payload: {
    attempt_id: string;
    started_at: string;
    answered_at: string;
    response_time_ms: number;
    conviction: string;
    answer_change_count: number;
    context: string;
  };
};

const FIX = loadEvidenceFixture<ParseClientFixture>('parse-client-cases.json');

describe('lib/evidence/types', () => {
  it('expõe enums de conviction e contexts Phase1/reservados', () => {
    expect(EVIDENCE_CONVICTIONS).toEqual(['chute', 'entre_duas', 'certeza', 'unknown']);
    expect(EVIDENCE_ATTEMPT_CONTEXTS_PHASE1).toEqual([
      'diagnostic',
      'regular_practice',
      'simulation',
    ]);
    expect(EVIDENCE_ATTEMPT_CONTEXTS_RESERVED).toEqual([
      'pre_explanation',
      'immediate_transfer',
      'scheduled_review',
      'measurement_holdout',
    ]);
  });

  it('type guards de conviction e Phase1', () => {
    expect(isEvidenceConviction('chute')).toBe(true);
    expect(isEvidenceConviction('talvez')).toBe(false);
    expect(isEvidenceAttemptContextPhase1('regular_practice')).toBe(true);
    expect(isEvidenceAttemptContextPhase1('pre_explanation')).toBe(false);
  });
});

describe('isUuidV4', () => {
  it('aceita UUID v4 (fixture)', () => {
    expect(isUuidV4(FIX.valid_attempt_id)).toBe(true);
    expect(isUuidV4(FIX.valid_attempt_id_alt)).toBe(true);
  });

  it('rejeita UUID de outra versão / formato', () => {
    for (const id of FIX.invalid_attempt_ids) {
      expect(isUuidV4(id)).toBe(false);
    }
    expect(isUuidV4(null)).toBe(false);
  });
});

describe('parseClientFields', () => {
  it('aceita payload mínimo com attempt_id UUID v4', () => {
    const result = parseClientFields({ attempt_id: FIX.valid_attempt_id });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({
      attempt_id: FIX.valid_attempt_id,
      started_at: null,
      answered_at: null,
      conviction: 'unknown',
      answer_change_count: 0,
      response_time_ms: null,
    });
  });

  it.each(FIX.convictions_valid)('aceita conviction válida: %s', (conviction) => {
    const result = parseClientFields({
      attempt_id: FIX.valid_attempt_id,
      conviction,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.conviction).toBe(conviction);
  });

  it('conviction ausente → unknown', () => {
    const result = parseClientFields({ attempt_id: FIX.valid_attempt_id });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.conviction).toBe('unknown');
  });

  it('conviction desconhecida → rejeição (sem fallback silencioso)', () => {
    const result = parseClientFields({
      attempt_id: FIX.valid_attempt_id,
      conviction: FIX.conviction_unknown_input,
    });
    expect(result).toEqual({
      ok: false,
      error: {
        code: 'invalid_conviction',
        message: expect.any(String),
      },
    });
  });

  it.each(FIX.contexts_phase1)('context Phase1 aceito: %s', (context) => {
    const result = parseClientFields({
      attempt_id: FIX.valid_attempt_id,
      context,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.client_context).toBe(context);
  });

  it.each(FIX.contexts_reserved)('context reservado rejeitado: %s', (context) => {
    const result = parseClientFields({
      attempt_id: FIX.valid_attempt_id,
      context,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('reserved_context');
  });

  it('context futuro/inválido → invalid_context', () => {
    const result = parseClientFields({
      attempt_id: FIX.valid_attempt_id,
      context: FIX.context_future,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('invalid_context');
  });

  it('answer_change_count ausente → 0', () => {
    const result = parseClientFields({ attempt_id: FIX.valid_attempt_id });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.answer_change_count).toBe(0);
  });

  it('answer_change_count inteiro ≥ 0 aceito', () => {
    const result = parseClientFields({
      attempt_id: FIX.valid_attempt_id,
      answer_change_count: FIX.answer_change_count_valid,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.answer_change_count).toBe(FIX.answer_change_count_valid);
  });

  it('answer_change_count negativo → rejeição', () => {
    const result = parseClientFields({
      attempt_id: FIX.valid_attempt_id,
      answer_change_count: FIX.answer_change_count_negative,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('invalid_answer_change_count');
  });

  it('answer_change_count não-inteiro → rejeição', () => {
    const result = parseClientFields({
      attempt_id: FIX.valid_attempt_id,
      answer_change_count: FIX.answer_change_count_non_integer,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('invalid_answer_change_count');
  });

  it('attempt_id ausente → missing_attempt_id (≠ inválido)', () => {
    const result = parseClientFields({});
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'missing_attempt_id' },
    });
  });

  it('attempt_id null → missing_attempt_id', () => {
    const result = parseClientFields({ attempt_id: null });
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'missing_attempt_id' },
    });
  });

  it('attempt_id inválido → invalid_attempt_id', () => {
    const result = parseClientFields({ attempt_id: FIX.invalid_attempt_ids[0] });
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'invalid_attempt_id' },
    });
  });

  it('attempt_id UUID não-v4 → invalid_attempt_id', () => {
    const result = parseClientFields({
      attempt_id: FIX.invalid_attempt_ids[1],
    });
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'invalid_attempt_id' },
    });
  });

  it('preserva timestamps e response_time_ms quando válidos (fixture full)', () => {
    const result = parseClientFields(FIX.full_valid_payload);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.started_at).toBe(FIX.full_valid_payload.started_at);
    expect(result.value.answered_at).toBe(FIX.full_valid_payload.answered_at);
    expect(result.value.response_time_ms).toBe(FIX.full_valid_payload.response_time_ms);
    expect(result.value.conviction).toBe(FIX.full_valid_payload.conviction);
    expect(result.value.answer_change_count).toBe(
      FIX.full_valid_payload.answer_change_count,
    );
    expect(result.client_context).toBe(FIX.full_valid_payload.context);
  });

  it('response_time_ms não-finito → rejeição', () => {
    const result = parseClientFields({
      attempt_id: FIX.valid_attempt_id,
      response_time_ms: Number.NaN,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('invalid_response_time_ms');
  });

  it('started_at não-string → rejeição', () => {
    const result = parseClientFields({
      attempt_id: FIX.valid_attempt_id,
      started_at: 12345,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('invalid_started_at');
  });
});
