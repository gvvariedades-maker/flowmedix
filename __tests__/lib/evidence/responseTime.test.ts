import {
  EVIDENCE_RESPONSE_TIME_CLOCK_SKEW_TOLERANCE_MS,
  EVIDENCE_RESPONSE_TIME_PLAUSIBLE_MAX_MS,
  classifyResponseTime,
  freshStartedAtAfterReload,
  parseEvidenceTimestampMs,
  resolveAttemptLifecycle,
} from '@/lib/evidence/responseTime';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const T0 = 1_700_000_000_000; // instante fixo injetado

describe('EVIDENCE_RESPONSE_TIME_* constants (provisórias)', () => {
  it('exporta máximo plausível e tolerância de skew documentados', () => {
    expect(EVIDENCE_RESPONSE_TIME_PLAUSIBLE_MAX_MS).toBe(2 * 60 * 60 * 1000);
    expect(EVIDENCE_RESPONSE_TIME_CLOCK_SKEW_TOLERANCE_MS).toBe(5_000);
  });
});

describe('classifyResponseTime', () => {
  it('delta plausível → valid + ms truncado', () => {
    const result = classifyResponseTime({
      started_at_ms: T0,
      answered_at_ms: T0 + 4_250.7,
    });
    expect(result).toEqual({
      response_time_ms: 4250,
      response_time_status: 'valid',
      response_time_invalid_reason: null,
    });
  });

  it('delta negativo fora da tolerância → invalid + negative_delta', () => {
    const result = classifyResponseTime({
      started_at_ms: T0 + 10_000,
      answered_at_ms: T0,
    });
    expect(result.response_time_status).toBe('invalid');
    expect(result.response_time_invalid_reason).toBe('negative_delta');
    expect(result.response_time_ms).toBeNull();
  });

  it('delta negativo dentro da tolerância de skew → clock_skew', () => {
    const result = classifyResponseTime({
      started_at_ms: T0 + 100,
      answered_at_ms: T0,
      clock_skew_tolerance_ms: 5_000,
    });
    expect(result).toMatchObject({
      response_time_status: 'invalid',
      response_time_invalid_reason: 'clock_skew',
    });
  });

  it('não finito → invalid + non_finite_delta', () => {
    expect(
      classifyResponseTime({
        started_at_ms: Number.NaN,
        answered_at_ms: T0,
      }).response_time_invalid_reason,
    ).toBe('non_finite_delta');

    expect(
      classifyResponseTime({
        started_at_ms: T0,
        answered_at_ms: Number.POSITIVE_INFINITY,
      }).response_time_invalid_reason,
    ).toBe('non_finite_delta');
  });

  it('excede máximo provisório → exceeds_plausible_max', () => {
    const result = classifyResponseTime({
      started_at_ms: T0,
      answered_at_ms: T0 + EVIDENCE_RESPONSE_TIME_PLAUSIBLE_MAX_MS + 1,
    });
    expect(result.response_time_status).toBe('invalid');
    expect(result.response_time_invalid_reason).toBe('exceeds_plausible_max');
    expect(result.response_time_ms).toBe(EVIDENCE_RESPONSE_TIME_PLAUSIBLE_MAX_MS + 1);
  });

  it('missing started_at → invalid + missing_started_at', () => {
    const result = classifyResponseTime({
      started_at_ms: null,
      answered_at_ms: T0,
    });
    expect(result).toEqual({
      response_time_ms: null,
      response_time_status: 'invalid',
      response_time_invalid_reason: 'missing_started_at',
    });
  });

  it('missing answered_at → unknown (não calculável)', () => {
    const result = classifyResponseTime({
      started_at_ms: T0,
      answered_at_ms: null,
    });
    expect(result).toEqual({
      response_time_ms: null,
      response_time_status: 'unknown',
      response_time_invalid_reason: null,
    });
  });

  it('tab_backgrounded detectável → invalid + tab_backgrounded', () => {
    const result = classifyResponseTime({
      started_at_ms: T0,
      answered_at_ms: T0 + 1_000,
      tab_backgrounded: true,
    });
    expect(result).toMatchObject({
      response_time_status: 'invalid',
      response_time_invalid_reason: 'tab_backgrounded',
    });
  });

  it('background não detectável → unknown', () => {
    const result = classifyResponseTime({
      started_at_ms: T0,
      answered_at_ms: T0 + 1_000,
      visibility_suspected_undetectable: true,
    });
    expect(result).toMatchObject({
      response_time_status: 'unknown',
      response_time_invalid_reason: null,
    });
  });

  it('page_reloaded com started_at obsoleto → page_reload', () => {
    const result = classifyResponseTime({
      started_at_ms: T0,
      answered_at_ms: T0 + 5_000,
      page_reloaded_stale_started_at: true,
    });
    expect(result).toMatchObject({
      response_time_status: 'invalid',
      response_time_invalid_reason: 'page_reload',
    });
  });

  it('answered_at à frente de reference_now além da tolerância → clock_skew', () => {
    const result = classifyResponseTime({
      started_at_ms: T0,
      answered_at_ms: T0 + 60_000,
      reference_now_ms: T0 + 1_000,
      clock_skew_tolerance_ms: 5_000,
    });
    expect(result.response_time_invalid_reason).toBe('clock_skew');
  });
});

describe('parseEvidenceTimestampMs', () => {
  it('aceita ISO com Z', () => {
    const result = parseEvidenceTimestampMs('2026-07-24T12:00:00.000Z');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.ms).toBe(Date.parse('2026-07-24T12:00:00.000Z'));
  });

  it('aceita offset explícito +03:00', () => {
    const result = parseEvidenceTimestampMs('2026-07-24T15:00:00.000+03:00');
    expect(result.ok).toBe(true);
  });

  it('sem offset → ambiguous_no_offset', () => {
    expect(parseEvidenceTimestampMs('2026-07-24T12:00:00')).toEqual({
      ok: false,
      reason: 'ambiguous_no_offset',
    });
  });

  it('ausente → missing', () => {
    expect(parseEvidenceTimestampMs(null)).toEqual({ ok: false, reason: 'missing' });
    expect(parseEvidenceTimestampMs(undefined)).toEqual({
      ok: false,
      reason: 'missing',
    });
  });
});

describe('ciclo de vida (reload / abandono) — contrato sem I/O', () => {
  it('abandono sem confirmar → no_event abandoned', () => {
    expect(resolveAttemptLifecycle({ human_confirmed: false })).toEqual({
      outcome: 'no_event',
      reason: 'abandoned',
    });
  });

  it('troca de questão sem confirmar → no_event', () => {
    expect(
      resolveAttemptLifecycle({
        human_confirmed: false,
        question_switched_without_confirm: true,
      }),
    ).toEqual({
      outcome: 'no_event',
      reason: 'question_switched_unconfirmed',
    });
  });

  it('confirmação humana → emit_attempt', () => {
    expect(resolveAttemptLifecycle({ human_confirmed: true })).toEqual({
      outcome: 'emit_attempt',
    });
  });

  it('reload → freshStartedAtAfterReload usa o instante injetado', () => {
    const reloadAt = T0 + 99_000;
    expect(freshStartedAtAfterReload(reloadAt)).toBe(reloadAt);
    // Contagem recomeça: classificar com o novo started_at
    const result = classifyResponseTime({
      started_at_ms: freshStartedAtAfterReload(reloadAt),
      answered_at_ms: reloadAt + 2_000,
    });
    expect(result).toEqual({
      response_time_ms: 2000,
      response_time_status: 'valid',
      response_time_invalid_reason: null,
    });
  });
});

describe('núcleo sem Date.now()', () => {
  it('responseTime.ts não chama Date.now (ignorando comentários)', () => {
    const src = readFileSync(
      join(process.cwd(), 'lib/evidence/responseTime.ts'),
      'utf8',
    );
    const withoutComments = src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    expect(withoutComments).not.toMatch(/Date\.now\s*\(/);
  });
});
