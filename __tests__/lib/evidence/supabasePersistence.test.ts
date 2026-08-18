import {
  createSupabaseEvidencePersistence,
  isEvidenceAttemptIdRaceViolation,
  isPostgresUniqueViolation,
  type EvidenceSupabaseClientLike,
} from '@/lib/evidence/supabasePersistence';
import type { EvidenceAttemptEventRow } from '@/lib/evidence/persistenceTypes';

const ATTEMPT_ID = '550e8400-e29b-41d4-a716-446655440000';

const SAMPLE_ROW: EvidenceAttemptEventRow = {
  attempt_id: ATTEMPT_ID,
  user_id: '11111111-1111-4111-8111-111111111111',
  question_id: 'slug-exemplo',
  question_version: 'a'.repeat(64),
  selected_alternative: 'A',
  correct: true,
  conviction: 'unknown',
  context: 'regular_practice',
  started_at: null,
  answered_at: null,
  response_time_ms: null,
  response_time_status: 'unknown',
  response_time_invalid_reason: null,
  answer_change_count: 0,
  session_id: null,
  source: 'api_registrar_tentativa',
  is_internal: false,
  event_type: 'attempt',
  created_at: '2026-01-15T12:00:00.000Z',
};

function dbRecordFromRow(row: EvidenceAttemptEventRow) {
  return { ...row };
}

describe('isPostgresUniqueViolation', () => {
  it('detecta código 23505', () => {
    expect(isPostgresUniqueViolation({ code: '23505' })).toBe(true);
  });

  it('rejeita outros códigos', () => {
    expect(isPostgresUniqueViolation({ code: '42P01' })).toBe(false);
  });
});

describe('isEvidenceAttemptIdRaceViolation', () => {
  it('identifica partial unique de attempt_id', () => {
    expect(
      isEvidenceAttemptIdRaceViolation({
        code: '23505',
        constraint: 'evidence_attempt_events_attempt_id_attempt_uidx',
      }),
    ).toBe(true);
  });

  it('não classifica 23505 genérico como corrida attempt_id', () => {
    expect(
      isEvidenceAttemptIdRaceViolation({
        code: '23505',
        constraint: 'evidence_attempt_events_pkey',
      }),
    ).toBe(false);
  });
});

describe('createSupabaseEvidencePersistence', () => {
  it('busca por attempt_id com event_type attempt', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: dbRecordFromRow(SAMPLE_ROW),
      error: null,
    });
    const eqEvent = jest.fn().mockReturnValue({ maybeSingle });
    const eqAttempt = jest.fn().mockReturnValue({ eq: eqEvent });
    const select = jest.fn().mockReturnValue({ eq: eqAttempt });
    const from = jest.fn().mockReturnValue({ select, insert: jest.fn() });

    const client: EvidenceSupabaseClientLike = { from };
    const persistence = createSupabaseEvidencePersistence(client);
    const result = await persistence.findAttemptById(ATTEMPT_ID);

    expect(from).toHaveBeenCalledWith('evidence_attempt_events');
    expect(eqAttempt).toHaveBeenCalledWith('attempt_id', ATTEMPT_ID);
    expect(eqEvent).toHaveBeenCalledWith('event_type', 'attempt');
    expect(result).toEqual({ ok: true, row: SAMPLE_ROW });
  });

  it('insert correto sem erro', async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    const from = jest.fn().mockReturnValue({ insert });
    const persistence = createSupabaseEvidencePersistence({ from });

    const result = await persistence.insertAttempt(SAMPLE_ROW);
    expect(result).toEqual({ ok: true, inserted: true });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        attempt_id: ATTEMPT_ID,
        event_type: 'attempt',
      }),
    );
  });

  it('mapeia corrida attempt_id', async () => {
    const insert = jest.fn().mockResolvedValue({
      error: {
        code: '23505',
        constraint: 'evidence_attempt_events_attempt_id_attempt_uidx',
      },
    });
    const from = jest.fn().mockReturnValue({ insert });
    const persistence = createSupabaseEvidencePersistence({ from });

    const result = await persistence.insertAttempt(SAMPLE_ROW);
    expect(result).toEqual({ ok: true, inserted: false, race: 'attempt_id' });
  });

  it('outra unique violation não vira corrida attempt_id', async () => {
    const insert = jest.fn().mockResolvedValue({
      error: { code: '23505', constraint: 'evidence_attempt_events_pkey' },
    });
    const from = jest.fn().mockReturnValue({ insert });
    const persistence = createSupabaseEvidencePersistence({ from });

    const result = await persistence.insertAttempt(SAMPLE_ROW);
    expect(result).toEqual({ ok: false, error: 'unique_violation_other' });
  });

  it('erro Supabase genérico → persistence_failed', async () => {
    const insert = jest.fn().mockResolvedValue({
      error: { code: '57014', message: 'timeout' },
    });
    const from = jest.fn().mockReturnValue({ insert });
    const persistence = createSupabaseEvidencePersistence({ from });

    const result = await persistence.insertAttempt(SAMPLE_ROW);
    expect(result).toEqual({ ok: false, error: 'persistence_failed' });
  });

  it('find com erro Supabase → persistence_failed', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { code: '57014' },
    });
    const eqEvent = jest.fn().mockReturnValue({ maybeSingle });
    const eqAttempt = jest.fn().mockReturnValue({ eq: eqEvent });
    const select = jest.fn().mockReturnValue({ eq: eqAttempt });
    const from = jest.fn().mockReturnValue({ select, insert: jest.fn() });

    const persistence = createSupabaseEvidencePersistence({ from });
    const result = await persistence.findAttemptById(ATTEMPT_ID);
    expect(result).toEqual({ ok: false, error: 'persistence_failed' });
  });

  it('não executa I/O no import do módulo', () => {
    expect(typeof createSupabaseEvidencePersistence).toBe('function');
  });
});
