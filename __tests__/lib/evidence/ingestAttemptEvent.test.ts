import { loadEvidenceFixture } from './fixtures/loadFixture';
import {
  createInMemoryEvidencePersistence,
  extractQuestionVersionInputFromConteudo,
  ingestAttemptEvent,
  type IngestAttemptEventInput,
} from '@/lib/evidence/ingestAttemptEvent';
import type { EvidenceEventPersistence } from '@/lib/evidence/persistenceTypes';
import {
  getEvidenceMetricCount,
  resetEvidenceMetricsForTest,
} from '@/lib/evidence/metrics';
import type { EvidenceQuestionVersionInput } from '@/lib/evidence/questionVersion';

const ATTEMPT_A = '550e8400-e29b-41d4-a716-446655440000';
const ATTEMPT_B = '6ba7b810-9dad-4d4a-a716-446655440001';
const USER_ID = '11111111-1111-4111-8111-111111111111';
const NOW_MS = 1_700_000_000_000;

const VERSION_BASE = loadEvidenceFixture<EvidenceQuestionVersionInput>(
  'question-version-base.json',
);

function buildConteudoFromVersionInput(input: EvidenceQuestionVersionInput) {
  return {
    meta: {
      content_standard: input.meta_evidence_relevant?.content_standard ?? null,
      family: input.meta_evidence_relevant?.family ?? null,
      pedagogical_branch: input.meta_evidence_relevant?.pedagogical_branch ?? null,
    },
    question_data: {
      instruction: input.instruction,
      options: input.options,
    },
  };
}

function baseInput(
  overrides: Partial<IngestAttemptEventInput> & {
    persistence?: EvidenceEventPersistence;
  } = {},
): IngestAttemptEventInput {
  const persistence = overrides.persistence ?? createInMemoryEvidencePersistence();
  return {
    route: 'registrar_tentativa',
    user_id: USER_ID,
    user_email: 'aluno@exemplo.com',
    question_id: VERSION_BASE.modulo_slug,
    selected_alternative: 'A',
    correct: true,
    conteudo_json: buildConteudoFromVersionInput(VERSION_BASE),
    client_body: {
      attempt_id: ATTEMPT_A,
      started_at: '2026-01-15T12:00:00.000Z',
      answered_at: '2026-01-15T12:00:30.000Z',
      conviction: 'unknown',
      answer_change_count: 0,
    },
    now_ms: NOW_MS,
    persistence,
    instrumentation_enabled: true,
    ...overrides,
  };
}

describe('extractQuestionVersionInputFromConteudo', () => {
  it('projeta conteudo_json do catálogo', () => {
    const conteudo = buildConteudoFromVersionInput(VERSION_BASE);
    expect(
      extractQuestionVersionInputFromConteudo(conteudo, VERSION_BASE.modulo_slug),
    ).toEqual(VERSION_BASE);
  });
});

describe('ingestAttemptEvent', () => {
  beforeEach(() => {
    resetEvidenceMetricsForTest();
  });

  it('retorna disabled quando instrumentação off', async () => {
    const result = await ingestAttemptEvent(
      baseInput({ instrumentation_enabled: false }),
    );
    expect(result).toEqual({ status: 'disabled' });
    expect(getEvidenceMetricCount('evidence_event_ingest_total')).toBe(0);
  });

  it('soft-skip missing attempt_id + métrica', async () => {
    const result = await ingestAttemptEvent(
      baseInput({ client_body: { conviction: 'unknown' } }),
    );
    expect(result).toEqual({ status: 'skipped', reason: 'missing_attempt_id' });
    expect(
      getEvidenceMetricCount('evidence_attempt_id_invalid_total', {
        route: 'registrar_tentativa',
        reason: 'missing',
      }),
    ).toBe(1);
  });

  it('soft-skip attempt_id inválido + métrica wrong_version', async () => {
    const result = await ingestAttemptEvent(
      baseInput({
        client_body: { attempt_id: 'not-a-uuid', conviction: 'unknown' },
      }),
    );
    expect(result).toEqual({ status: 'skipped', reason: 'invalid_attempt_id' });
    expect(
      getEvidenceMetricCount('evidence_attempt_id_invalid_total', {
        route: 'registrar_tentativa',
        reason: 'wrong_version',
      }),
    ).toBe(1);
  });

  it('soft-skip invalid_client_fields + métrica dedicada', async () => {
    const result = await ingestAttemptEvent(
      baseInput({
        client_body: {
          attempt_id: ATTEMPT_A,
          conviction: 'not_a_conviction',
        },
      }),
    );
    expect(result).toEqual({ status: 'skipped', reason: 'invalid_client_fields' });
    expect(getEvidenceMetricCount('evidence_event_invalid_client_fields_total')).toBe(1);
  });

  it('cria evento novo', async () => {
    const persistence = createInMemoryEvidencePersistence();
    const result = await ingestAttemptEvent(baseInput({ persistence }));
    expect(result).toEqual({ status: 'created', attempt_id: ATTEMPT_A });
    expect(persistence.rows.size).toBe(1);
    const row = persistence.rows.get(ATTEMPT_A)!;
    expect(row.context).toBe('regular_practice');
    expect(row.source).toBe('api_registrar_tentativa');
    expect(row.is_internal).toBe(false);
  });

  it('replay idempotente sem segundo insert', async () => {
    const persistence = createInMemoryEvidencePersistence();
    const input = baseInput({ persistence });
    await ingestAttemptEvent(input);
    const second = await ingestAttemptEvent(input);
    expect(second).toEqual({ status: 'duplicate', attempt_id: ATTEMPT_A });
    expect(persistence.rows.size).toBe(1);
    expect(getEvidenceMetricCount('evidence_event_idempotent_replay_total')).toBe(1);
  });

  it('conflito sem overwrite do evento existente', async () => {
    const persistence = createInMemoryEvidencePersistence();
    await ingestAttemptEvent(baseInput({ persistence, correct: true }));
    const conflict = await ingestAttemptEvent(
      baseInput({
        persistence,
        correct: false,
        client_body: {
          attempt_id: ATTEMPT_A,
          conviction: 'unknown',
          answer_change_count: 0,
        },
      }),
    );
    expect(conflict).toEqual({ status: 'conflict', attempt_id: ATTEMPT_A });
    expect(persistence.rows.get(ATTEMPT_A)?.correct).toBe(true);
    expect(getEvidenceMetricCount('evidence_event_conflict_total')).toBe(1);
  });

  it('deriva context diagnostic com session_kind diagnostico', async () => {
    const persistence = createInMemoryEvidencePersistence();
    await ingestAttemptEvent(
      baseInput({
        persistence,
        route: 'simulado_responder',
        session_kind: 'diagnostico',
        client_body: {
          attempt_id: ATTEMPT_B,
          conviction: 'unknown',
          answer_change_count: 0,
        },
      }),
    );
    expect(persistence.rows.get(ATTEMPT_B)?.context).toBe('diagnostic');
  });

  it('deriva context simulation e ignora body', async () => {
    const persistence = createInMemoryEvidencePersistence();
    await ingestAttemptEvent(
      baseInput({
        persistence,
        route: 'simulado_responder',
        session_kind: 'livre',
        client_body: {
          attempt_id: ATTEMPT_B,
          conviction: 'entre_duas',
          answer_change_count: 1,
          context: 'regular_practice',
        },
      }),
    );
    expect(persistence.rows.get(ATTEMPT_B)?.context).toBe('simulation');
  });

  it('métrica context_rejected quando body envia context reservado', async () => {
    const persistence = createInMemoryEvidencePersistence();
    await ingestAttemptEvent(
      baseInput({
        persistence,
        client_body: {
          attempt_id: ATTEMPT_A,
          conviction: 'unknown',
          context: 'immediate_transfer',
        },
      }),
    );
    expect(getEvidenceMetricCount('evidence_event_context_rejected_total')).toBe(1);
    expect(persistence.rows.get(ATTEMPT_A)?.context).toBe('regular_practice');
  });

  it('is_internal derivado no servidor — body não forja false', async () => {
    const persistence = createInMemoryEvidencePersistence();
    await ingestAttemptEvent(
      baseInput({
        persistence,
        e2e_instrumentation: true,
        client_body: {
          attempt_id: ATTEMPT_A,
          conviction: 'unknown',
          // @ts-expect-error spoof
          is_internal: false,
        },
      }),
    );
    expect(persistence.rows.get(ATTEMPT_A)?.is_internal).toBe(true);
  });

  it('correct do input prevalece — body não altera gabarito', async () => {
    const persistence = createInMemoryEvidencePersistence();
    await ingestAttemptEvent(
      baseInput({
        persistence,
        correct: true,
        client_body: {
          attempt_id: ATTEMPT_A,
          conviction: 'unknown',
          // @ts-expect-error spoof
          correct: false,
        },
      }),
    );
    expect(persistence.rows.get(ATTEMPT_A)?.correct).toBe(true);
  });

  it('soft-skip question_version_failed', async () => {
    const result = await ingestAttemptEvent(
      baseInput({ conteudo_json: { broken: true } }),
    );
    expect(result).toEqual({
      status: 'skipped',
      reason: 'question_version_failed',
      attempt_id: ATTEMPT_A,
    });
    expect(getEvidenceMetricCount('evidence_event_question_version_failed_total')).toBe(1);
  });

  it('race duplicate: unique violation + fingerprint igual', async () => {
    const seed = createInMemoryEvidencePersistence();
    const input = baseInput({ persistence: seed });
    await ingestAttemptEvent(input);
    const row = seed.rows.get(ATTEMPT_A)!;

    const racing = {
      async findAttemptById(attempt_id: string) {
        return { ok: true as const, row: attempt_id === ATTEMPT_A ? row : null };
      },
      async insertAttempt() {
        return { ok: true as const, inserted: false as const, race: 'attempt_id' as const };
      },
    };

    const result = await ingestAttemptEvent({ ...input, persistence: racing });
    expect(result.status).toBe('duplicate');
  });

  it('race conflict: unique violation + fingerprint divergente', async () => {
    const seed = createInMemoryEvidencePersistence();
    const input = baseInput({ persistence: seed, correct: true });
    await ingestAttemptEvent(input);
    const divergent = { ...seed.rows.get(ATTEMPT_A)!, correct: false };

    const racing = {
      async findAttemptById(attempt_id: string) {
        return { ok: true as const, row: attempt_id === ATTEMPT_A ? divergent : null };
      },
      async insertAttempt() {
        return { ok: true as const, inserted: false as const, race: 'attempt_id' as const };
      },
    };

    const result = await ingestAttemptEvent({ ...input, persistence: racing });
    expect(result).toEqual({ status: 'conflict', attempt_id: ATTEMPT_A });
    expect(getEvidenceMetricCount('evidence_event_conflict_total')).toBe(1);
  });

  it('reload_after_race sem linha → persistence_failed', async () => {
    const persistence = {
      async findAttemptById() {
        return { ok: true as const, row: null };
      },
      async insertAttempt() {
        return { ok: true as const, inserted: false as const, race: 'attempt_id' as const };
      },
    };
    const result = await ingestAttemptEvent(baseInput({ persistence }));
    expect(result).toEqual({
      status: 'persistence_failed',
      phase: 'reload_after_race',
      attempt_id: ATTEMPT_A,
    });
    expect(
      getEvidenceMetricCount('evidence_event_persistence_failed_total', {
        phase: 'reload_after_race',
      }),
    ).toBe(1);
  });

  it('falha na leitura inicial → persistence_failed', async () => {
    const persistence = {
      async findAttemptById() {
        return { ok: false as const, error: 'persistence_failed' as const };
      },
      async insertAttempt() {
        return { ok: true as const, inserted: true as const };
      },
    };
    const result = await ingestAttemptEvent(baseInput({ persistence }));
    expect(result).toEqual({
      status: 'persistence_failed',
      phase: 'find',
      attempt_id: ATTEMPT_A,
    });
  });

  it('falha no insert → persistence_failed', async () => {
    const persistence = {
      async findAttemptById() {
        return { ok: true as const, row: null };
      },
      async insertAttempt() {
        return { ok: false as const, error: 'persistence_failed' as const };
      },
    };
    const result = await ingestAttemptEvent(baseInput({ persistence }));
    expect(result).toEqual({
      status: 'persistence_failed',
      phase: 'insert',
      attempt_id: ATTEMPT_A,
    });
  });

  it('outra unique violation no insert → persistence_failed', async () => {
    const persistence = {
      async findAttemptById() {
        return { ok: true as const, row: null };
      },
      async insertAttempt() {
        return { ok: false as const, error: 'unique_violation_other' as const };
      },
    };
    const result = await ingestAttemptEvent(baseInput({ persistence }));
    expect(result.status).toBe('persistence_failed');
    expect(result).toMatchObject({ phase: 'insert' });
  });

  it('exceção no insert → persistence_failed', async () => {
    const persistence = {
      async findAttemptById() {
        return { ok: true as const, row: null };
      },
      async insertAttempt() {
        throw new Error('db timeout');
      },
    };
    const result = await ingestAttemptEvent(baseInput({ persistence }));
    expect(result).toMatchObject({ status: 'persistence_failed', phase: 'insert' });
  });
});
