/**

 * Núcleo server-side de ingestão — Evidence Engine Fase 1 (Lote 4).

 * Sem wire em rotas públicas; persistência injetada (Supabase nos Lotes 5–6).

 *

 * Spec: §1.3, §1.7, §1.8, §1.14, §4.5 · plano Lote 4.

 *

 * Contrato caller (session_kind, e2e_instrumentation): @see ingestCallerContract.ts

 * Falhas de persistência retornam `persistence_failed` — nunca lançam (§1.14 handoff L5).

 */



import {

  deriveEventSource,

  resolvePersistedContext,

  type EvidenceIngestRoute,

  type EvidenceSimuladoSessionKindStub,

} from '@/lib/evidence/deriveContext';

import { classifyIdempotency } from '@/lib/evidence/idempotency';

import { resolveIsInternalForAttempt } from '@/lib/evidence/isInternalCohort';

import {

  logEvidenceIngestConflict,

  logEvidenceIngestPersistenceFailed,

  recordEvidenceAttemptIdInvalid,

  recordEvidenceConflict,

  recordEvidenceContextRejected,

  recordEvidenceIdempotentReplay,

  recordEvidenceIngestLatencyMs,

  recordEvidenceIngestTotal,

  recordEvidenceInvalidClientFields,

  recordEvidencePersistenceFailed,

  recordEvidenceQuestionVersionFailed,

} from '@/lib/evidence/metrics';

import {

  isUuidV4,

  parseClientFields,

  type ParseClientFieldsErrorCode,

} from '@/lib/evidence/parseClientFields';

import type {

  EvidenceAttemptEventRow,

  EvidenceEventPersistence,

} from '@/lib/evidence/persistenceTypes';

import {

  computeQuestionVersion,

  type EvidenceQuestionVersionInput,

  type EvidenceQuestionVersionOption,

} from '@/lib/evidence/questionVersion';

import {

  classifyResponseTime,

  parseEvidenceTimestampMs,

} from '@/lib/evidence/responseTime';

import type {

  EvidenceAttemptClientFieldsInput,

  EvidenceAttemptContextPhase1,

  EvidenceConviction,

  EvidenceEventSource,

  EvidenceResponseTimeStatus,

  EvidenceSemanticFingerprintFields,

} from '@/lib/evidence/types';

import { isEvidenceV1InstrumentationEnabled } from '@/lib/env';



export type { EvidenceAttemptEventRow, EvidenceEventPersistence } from '@/lib/evidence/persistenceTypes';



export type IngestAttemptEventInput = {

  route: EvidenceIngestRoute;

  /** JWT validado na rota — nunca do body (ingestCallerContract.ts). */

  user_id: string;

  user_email?: string | null;

  question_id: string;

  selected_alternative: string;

  /** Derivado de resolveQuestionAttempt na rota — nunca do body EE. */

  correct: boolean;

  /** Snapshot do catálogo carregado na rota — nunca confiar em body cru. */

  conteudo_json: unknown;

  client_body: EvidenceAttemptClientFieldsInput;

  session_id?: string | null;

  /**

   * Somente Lote 6: derivar de `resolveSimuladoSessionKind(session.filtros)`.

   * Nunca repassar do body do cliente.

   */

  session_kind?: EvidenceSimuladoSessionKindStub | null;

  /**

   * Somente Lote 5: true apenas quando bypass E2E server-side (`isE2eBypassEnabled`).

   * Nunca do body/header.

   */

  e2e_instrumentation?: boolean;

  tab_backgrounded?: boolean;

  page_reloaded_stale_started_at?: boolean;

  /** Epoch ms server-side — sem Date.now() implícito no núcleo. */

  now_ms: number;

  persistence: EvidenceEventPersistence;

  /** Override para testes; default = env EE_V1_INSTRUMENTATION */

  instrumentation_enabled?: boolean;

};



export type IngestAttemptEventResult =

  | { status: 'disabled' }

  | {

      status: 'skipped';

      reason:

        | 'missing_attempt_id'

        | 'invalid_attempt_id'

        | 'invalid_client_fields'

        | 'question_version_failed';

      attempt_id?: string;

    }

  | { status: 'created'; attempt_id: string }

  | { status: 'duplicate'; attempt_id: string }

  | { status: 'conflict'; attempt_id: string }

  | {

      status: 'persistence_failed';

      phase: 'find' | 'insert' | 'reload_after_race';

      attempt_id?: string;

    };



function rowToSemantic(row: EvidenceAttemptEventRow): EvidenceSemanticFingerprintFields {

  return {

    answer_change_count: row.answer_change_count,

    context: row.context,

    conviction: row.conviction,

    correct: row.correct,

    question_id: row.question_id,

    question_version: row.question_version,

    selected_alternative: row.selected_alternative,

    user_id: row.user_id,

  };

}



function isoFromNowMs(now_ms: number): string {

  return new Date(now_ms).toISOString();

}



function stripClientContext(body: EvidenceAttemptClientFieldsInput): {

  for_parse: EvidenceAttemptClientFieldsInput;

  client_context?: unknown;

} {

  const raw = body ?? {};

  const { context, ...rest } = raw;

  return {

    for_parse: rest,

    client_context: context,

  };

}



function recordAttemptIdInvalidMetric(

  route: EvidenceIngestRoute,

  code: ParseClientFieldsErrorCode,

  rawAttemptId: unknown,

): void {

  if (code === 'missing_attempt_id') {

    recordEvidenceAttemptIdInvalid(route, 'missing');

    return;

  }

  if (code === 'invalid_attempt_id') {

    if (typeof rawAttemptId === 'string' && rawAttemptId.trim().length > 0) {

      recordEvidenceAttemptIdInvalid(route, 'wrong_version');

    } else {

      recordEvidenceAttemptIdInvalid(route, 'malformed');

    }

  }

}



function persistenceFailedResult(input: {

  phase: 'find' | 'insert' | 'reload_after_race';

  attempt_id?: string;

  user_id: string;

  question_id: string;

}): IngestAttemptEventResult {

  recordEvidencePersistenceFailed(input.phase);

  logEvidenceIngestPersistenceFailed({

    phase: input.phase,

    attempt_id: input.attempt_id,

    user_id: input.user_id,

    question_id: input.question_id,

  });

  return {

    status: 'persistence_failed',

    phase: input.phase,

    attempt_id: input.attempt_id,

  };

}



async function safeFindAttemptById(

  persistence: EvidenceEventPersistence,

  attempt_id: string,

): Promise<

  | { ok: true; row: EvidenceAttemptEventRow | null }

  | { ok: false; phase: 'find' | 'reload_after_race' }

> {

  try {

    const result = await persistence.findAttemptById(attempt_id);

    if (!result.ok) {

      return { ok: false, phase: 'find' };

    }

    return { ok: true, row: result.row };

  } catch {

    return { ok: false, phase: 'find' };

  }

}



/**

 * Projeta `conteudo_json` do catálogo para input de `question_version` (§1.8).

 */

export function extractQuestionVersionInputFromConteudo(

  conteudo_json: unknown,

  modulo_slug: string,

): EvidenceQuestionVersionInput | null {

  if (!conteudo_json || typeof conteudo_json !== 'object') {

    return null;

  }

  const root = conteudo_json as Record<string, unknown>;

  const questionData = root.question_data;

  if (!questionData || typeof questionData !== 'object') {

    return null;

  }

  const qd = questionData as Record<string, unknown>;

  const instruction = qd.instruction;

  if (typeof instruction !== 'string' || instruction.trim() === '') {

    return null;

  }

  const optionsRaw = qd.options;

  if (!Array.isArray(optionsRaw) || optionsRaw.length === 0) {

    return null;

  }

  const options: EvidenceQuestionVersionOption[] = [];

  for (const item of optionsRaw) {

    if (!item || typeof item !== 'object') {

      return null;

    }

    const opt = item as Record<string, unknown>;

    if (typeof opt.id !== 'string' || typeof opt.text !== 'string') {

      return null;

    }

    if (typeof opt.is_correct !== 'boolean') {

      return null;

    }

    options.push({

      id: opt.id,

      text: opt.text,

      is_correct: opt.is_correct,

    });

  }

  const meta =

    root.meta && typeof root.meta === 'object'

      ? (root.meta as Record<string, unknown>)

      : null;

  return {

    modulo_slug,

    instruction,

    options,

    meta_evidence_relevant: {

      content_standard:

        typeof meta?.content_standard === 'string' ? meta.content_standard : null,

      family: typeof meta?.family === 'string' ? meta.family : null,

      pedagogical_branch:

        typeof meta?.pedagogical_branch === 'string' ? meta.pedagogical_branch : null,

    },

  };

}



function resolveResponseTimeFields(input: {

  client_started_at: string | null;

  client_answered_at: string | null;

  client_response_time_ms: number | null;

  tab_backgrounded?: boolean;

  page_reloaded_stale_started_at?: boolean;

  reference_now_ms: number;

}): Pick<

  EvidenceAttemptEventRow,

  'response_time_ms' | 'response_time_status' | 'response_time_invalid_reason'

> {

  const startedParsed = parseEvidenceTimestampMs(input.client_started_at);

  const answeredParsed = parseEvidenceTimestampMs(input.client_answered_at);

  const startedMs = startedParsed.ok ? startedParsed.ms : null;

  const answeredMs = answeredParsed.ok ? answeredParsed.ms : null;



  const classified = classifyResponseTime({

    started_at_ms: startedMs,

    answered_at_ms: answeredMs,

    tab_backgrounded: input.tab_backgrounded,

    page_reloaded_stale_started_at: input.page_reloaded_stale_started_at,

    reference_now_ms: input.reference_now_ms,

  });



  if (

    input.client_response_time_ms !== null &&

    classified.response_time_status === 'valid' &&

    classified.response_time_ms === null

  ) {

    return {

      response_time_ms: input.client_response_time_ms,

      response_time_status: 'valid',

      response_time_invalid_reason: null,

    };

  }



  return {

    response_time_ms: classified.response_time_ms,

    response_time_status: classified.response_time_status,

    response_time_invalid_reason: classified.response_time_invalid_reason,

  };

}



async function finalizeIdempotencyAfterRace(

  input: IngestAttemptEventInput,

  incoming: EvidenceSemanticFingerprintFields,

  attempt_id: string,

  source: EvidenceEventSource,

  context: EvidenceAttemptContextPhase1,

): Promise<IngestAttemptEventResult> {

  const found = await safeFindAttemptById(input.persistence, attempt_id);

  if (!found.ok) {

    return persistenceFailedResult({

      phase: 'reload_after_race',

      attempt_id,

      user_id: input.user_id,

      question_id: input.question_id,

    });

  }



  const existing = found.row ? rowToSemantic(found.row) : null;

  const classification = classifyIdempotency({ existing, incoming });



  if (classification === 'novo') {

    return persistenceFailedResult({

      phase: 'reload_after_race',

      attempt_id,

      user_id: input.user_id,

      question_id: input.question_id,

    });

  }



  recordEvidenceIngestTotal({

    context,

    source,

    status: classification === 'duplicado_equivalente' ? 'duplicate' : 'conflict',

  });



  if (classification === 'duplicado_equivalente') {

    recordEvidenceIdempotentReplay();

    return { status: 'duplicate', attempt_id };

  }



  recordEvidenceConflict();

  logEvidenceIngestConflict({

    attempt_id,

    user_id: input.user_id,

    question_id: input.question_id,

  });

  return { status: 'conflict', attempt_id };

}



/**

 * Ingere evento `attempt` quando instrumentação está ligada.

 * Soft-skip em falhas de cliente/version — não lança para rotas (§1.14).

 * Falhas de persistência → `persistence_failed` (nunca `created`/`duplicate` falsos).

 */

export async function ingestAttemptEvent(

  input: IngestAttemptEventInput,

): Promise<IngestAttemptEventResult> {

  const started = input.now_ms;

  const instrumentationEnabled =

    input.instrumentation_enabled ?? isEvidenceV1InstrumentationEnabled();



  if (!instrumentationEnabled) {

    return { status: 'disabled' };

  }



  const source = deriveEventSource(input.route);

  const { for_parse, client_context } = stripClientContext(input.client_body);

  const rawAttemptId = input.client_body?.attempt_id;



  const parsed = parseClientFields(for_parse);

  if (!parsed.ok) {

    if (

      parsed.error.code === 'missing_attempt_id' ||

      parsed.error.code === 'invalid_attempt_id'

    ) {

      recordAttemptIdInvalidMetric(input.route, parsed.error.code, rawAttemptId);

      recordEvidenceIngestTotal({

        context: 'unknown',

        source,

        status: 'skipped',

      });

      return {

        status: 'skipped',

        reason: parsed.error.code,

        attempt_id:

          typeof rawAttemptId === 'string' && isUuidV4(rawAttemptId.trim())

            ? rawAttemptId.trim()

            : undefined,

      };

    }

    recordEvidenceInvalidClientFields();

    recordEvidenceIngestTotal({ context: 'unknown', source, status: 'skipped' });

    return { status: 'skipped', reason: 'invalid_client_fields' };

  }



  const { context, client_emit } = resolvePersistedContext({

    route: input.route,

    session_kind: input.session_kind,

    client_context,

  });



  if (client_emit && !client_emit.ok) {

    recordEvidenceContextRejected();

  }



  const versionInput = extractQuestionVersionInputFromConteudo(

    input.conteudo_json,

    input.question_id,

  );

  if (!versionInput) {

    recordEvidenceQuestionVersionFailed();

    recordEvidenceIngestTotal({ context, source, status: 'skipped' });

    return {

      status: 'skipped',

      reason: 'question_version_failed',

      attempt_id: parsed.value.attempt_id,

    };

  }



  const question_version = computeQuestionVersion(versionInput);

  const is_internal = resolveIsInternalForAttempt({

    user_email: input.user_email,

    e2e_instrumentation: input.e2e_instrumentation,

  });



  const responseTime = resolveResponseTimeFields({

    client_started_at: parsed.value.started_at,

    client_answered_at: parsed.value.answered_at,

    client_response_time_ms: parsed.value.response_time_ms,

    tab_backgrounded: input.tab_backgrounded,

    page_reloaded_stale_started_at: input.page_reloaded_stale_started_at,

    reference_now_ms: input.now_ms,

  });



  const incomingSemantic: EvidenceSemanticFingerprintFields = {

    answer_change_count: parsed.value.answer_change_count,

    context,

    conviction: parsed.value.conviction,

    correct: input.correct,

    question_id: input.question_id,

    question_version,

    selected_alternative: input.selected_alternative,

    user_id: input.user_id,

  };



  const initialFind = await safeFindAttemptById(

    input.persistence,

    parsed.value.attempt_id,

  );

  if (!initialFind.ok) {

    return persistenceFailedResult({

      phase: initialFind.phase,

      attempt_id: parsed.value.attempt_id,

      user_id: input.user_id,

      question_id: input.question_id,

    });

  }



  const preInsert = classifyIdempotency({

    existing: initialFind.row ? rowToSemantic(initialFind.row) : null,

    incoming: incomingSemantic,

  });



  if (preInsert === 'duplicado_equivalente') {

    recordEvidenceIngestTotal({ context, source, status: 'duplicate' });

    recordEvidenceIdempotentReplay();

    recordEvidenceIngestLatencyMs(input.now_ms - started);

    return { status: 'duplicate', attempt_id: parsed.value.attempt_id };

  }



  if (preInsert === 'conflito') {

    recordEvidenceIngestTotal({ context, source, status: 'conflict' });

    recordEvidenceConflict();

    logEvidenceIngestConflict({

      attempt_id: parsed.value.attempt_id,

      user_id: input.user_id,

      question_id: input.question_id,

    });

    recordEvidenceIngestLatencyMs(input.now_ms - started);

    return { status: 'conflict', attempt_id: parsed.value.attempt_id };

  }



  const row: EvidenceAttemptEventRow = {

    attempt_id: parsed.value.attempt_id,

    user_id: input.user_id,

    question_id: input.question_id,

    question_version,

    selected_alternative: input.selected_alternative,

    correct: input.correct,

    conviction: parsed.value.conviction,

    context,

    started_at: parsed.value.started_at,

    answered_at: parsed.value.answered_at,

    ...responseTime,

    answer_change_count: parsed.value.answer_change_count,

    session_id: input.session_id ?? null,

    source,

    is_internal,

    event_type: 'attempt',

    created_at: isoFromNowMs(input.now_ms),

  };



  let insertResult;

  try {

    insertResult = await input.persistence.insertAttempt(row);

  } catch {

    recordEvidenceIngestLatencyMs(input.now_ms - started);

    return persistenceFailedResult({

      phase: 'insert',

      attempt_id: parsed.value.attempt_id,

      user_id: input.user_id,

      question_id: input.question_id,

    });

  }



  if (!insertResult.ok) {

    recordEvidenceIngestLatencyMs(input.now_ms - started);

    if (insertResult.error === 'unique_violation_other') {

      recordEvidenceIngestTotal({ context, source, status: 'persistence_failed' });

    }

    return persistenceFailedResult({

      phase: 'insert',

      attempt_id: parsed.value.attempt_id,

      user_id: input.user_id,

      question_id: input.question_id,

    });

  }



  if (insertResult.inserted) {

    recordEvidenceIngestTotal({ context, source, status: 'created' });

    recordEvidenceIngestLatencyMs(input.now_ms - started);

    return { status: 'created', attempt_id: parsed.value.attempt_id };

  }



  const afterRace = await finalizeIdempotencyAfterRace(

    input,

    incomingSemantic,

    parsed.value.attempt_id,

    source,

    context,

  );

  recordEvidenceIngestLatencyMs(input.now_ms - started);

  return afterRace;

}



/** Mock de persistência para testes e reconciliação futura (Lote 9). */

export function createInMemoryEvidencePersistence(): EvidenceEventPersistence & {

  readonly rows: Map<string, EvidenceAttemptEventRow>;

} {

  const rows = new Map<string, EvidenceAttemptEventRow>();

  return {

    rows,

    async findAttemptById(attempt_id: string) {

      return { ok: true as const, row: rows.get(attempt_id) ?? null };

    },

    async insertAttempt(row: EvidenceAttemptEventRow) {

      if (rows.has(row.attempt_id)) {

        return { ok: true as const, inserted: false as const, race: 'attempt_id' as const };

      }

      rows.set(row.attempt_id, { ...row });

      return { ok: true as const, inserted: true as const };

    },

  };

}


