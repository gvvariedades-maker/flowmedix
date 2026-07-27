/**
 * Derivação pura de `context` Phase1 (spec §1.7).
 * Stubs Lote 1 — sem I/O, sem confiar no body do cliente para persistência.
 *
 * Rotas:
 * - `registrar_tentativa` → `regular_practice`
 * - `simulado_responder` + kind `diagnostico` → `diagnostic`
 * - `simulado_responder` (demais) → `simulation`
 */

import {
  isEvidenceAttemptContextPhase1,
  isEvidenceAttemptContextReserved,
  type EvidenceAttemptContextPhase1,
  type EvidenceEventSource,
} from '@/lib/evidence/types';

/** Rotas de ingestão instrumentáveis na Fase 1 (stubs). */
export const EVIDENCE_INGEST_ROUTES = [
  'registrar_tentativa',
  'simulado_responder',
] as const;
export type EvidenceIngestRoute = (typeof EVIDENCE_INGEST_ROUTES)[number];

/**
 * Kind de sessão de simulado (espelha `SimuladoSessionKind` sem importar
 * `lib/simulado` — stub puro do Lote 1).
 */
export const EVIDENCE_SIMULADO_SESSION_KINDS = [
  'diagnostico',
  'livre',
  'weekly',
] as const;
export type EvidenceSimuladoSessionKindStub =
  (typeof EVIDENCE_SIMULADO_SESSION_KINDS)[number];

export type DeriveContextInput = {
  route: EvidenceIngestRoute;
  /**
   * Obrigatório na prática para `simulado_responder`.
   * Ignorado em `registrar_tentativa`.
   * Ausente / null em simulado → trata como não-diagnóstico → `simulation`.
   */
  session_kind?: EvidenceSimuladoSessionKindStub | null;
};

/**
 * Deriva o `context` persistido a partir da rota / kind.
 * **Ignora** qualquer `context` enviado pelo cliente (spec §1.7).
 */
export function deriveContextPhase1(input: DeriveContextInput): EvidenceAttemptContextPhase1 {
  if (input.route === 'registrar_tentativa') {
    return 'regular_practice';
  }
  // simulado_responder
  if (input.session_kind === 'diagnostico') {
    return 'diagnostic';
  }
  return 'simulation';
}

/** `source` persistido por rota (spec §4.3). */
export function deriveEventSource(route: EvidenceIngestRoute): EvidenceEventSource {
  return route === 'registrar_tentativa'
    ? 'api_registrar_tentativa'
    : 'api_simulado_responder';
}

export type ClientContextEmitEvaluation =
  | { ok: true; context: EvidenceAttemptContextPhase1 }
  | {
      ok: false;
      code: 'reserved_context' | 'invalid_context';
      message: string;
    };

/**
 * Avalia um `context` pretendido como **emit** Phase1.
 * Reservados / futuros → rejeição (parser/ingest usam isto; persistência
 * continua com `deriveContextPhase1` da rota).
 */
export function evaluateClientContextAsPhase1Emit(
  context: unknown,
): ClientContextEmitEvaluation {
  if (context === undefined || context === null) {
    return {
      ok: false,
      code: 'invalid_context',
      message: 'context is required when evaluating emit',
    };
  }
  if (isEvidenceAttemptContextReserved(context)) {
    return {
      ok: false,
      code: 'reserved_context',
      message: `context '${context}' is reserved and not emitível in Phase 1`,
    };
  }
  if (!isEvidenceAttemptContextPhase1(context)) {
    return {
      ok: false,
      code: 'invalid_context',
      message: 'context must be diagnostic | regular_practice | simulation in Phase 1',
    };
  }
  return { ok: true, context };
}

/**
 * Resolve o context a persistir: sempre derivado da rota.
 * `client_context` é avaliado só para telemetria/rejeição; **nunca** sobrescreve.
 */
export function resolvePersistedContext(input: {
  route: EvidenceIngestRoute;
  session_kind?: EvidenceSimuladoSessionKindStub | null;
  /** Body do cliente — ignorado na persistência */
  client_context?: unknown;
}): {
  context: EvidenceAttemptContextPhase1;
  client_emit: ClientContextEmitEvaluation | null;
} {
  const context = deriveContextPhase1({
    route: input.route,
    session_kind: input.session_kind,
  });

  let client_emit: ClientContextEmitEvaluation | null = null;
  if (input.client_context !== undefined && input.client_context !== null) {
    client_emit = evaluateClientContextAsPhase1Emit(input.client_context);
  }

  return { context, client_emit };
}
