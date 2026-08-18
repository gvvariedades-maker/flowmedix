/**
 * Classificação pura de tempo de resposta (spec §1.6).
 * Instantes entram por parâmetro — **sem** `Date.now()` no núcleo.
 *
 * Constantes numéricas abaixo são **provisórias** (engenharia Lote 1).
 * Limiares de go/no-go operacional ficam em
 * `artifacts/evidence-fase1-operational-plan.md` (spec §1.16) — não inventados aqui.
 */

import type {
  EvidenceResponseTimeInvalidReason,
  EvidenceResponseTimeStatus,
} from '@/lib/evidence/types';

/**
 * Máximo provisório para delta `answered_at - started_at` ainda considerado
 * calculável como `valid`. Acima → `invalid` + `exceeds_plausible_max`.
 *
 * **Provisório** — substituir pelo valor do artefato operacional §1.16 após baseline.
 * Não usar como limiar de rollout / go-no-go de coorte.
 */
export const EVIDENCE_RESPONSE_TIME_PLAUSIBLE_MAX_MS = 2 * 60 * 60 * 1000; // 2h

/**
 * Tolerância provisória para skew de relógio cliente vs referência injetada.
 * Delta negativo dentro da tolerância → `invalid` + `clock_skew` (não `negative_delta`).
 * `answered_at` à frente de `reference_now_ms` além da tolerância → idem.
 *
 * **Provisório** — não é limiar operacional de produto.
 */
export const EVIDENCE_RESPONSE_TIME_CLOCK_SKEW_TOLERANCE_MS = 5_000; // 5s

export type ClassifyResponseTimeInput = {
  /** Epoch ms do início da exposição (injetado; null = ausente). */
  started_at_ms: number | null;
  /** Epoch ms do Confirmar (injetado; null = ausente). */
  answered_at_ms: number | null;
  /**
   * Cliente detectou aba em background / suspensão durante o intervalo.
   * Spec §1.6: `invalid` + `tab_backgrounded` quando detectável.
   */
  tab_backgrounded?: boolean;
  /**
   * Suspeita de background sem API de visibility (não detectável).
   * Spec §1.6: `unknown` (sem reason obrigatório de invalid).
   */
  visibility_suspected_undetectable?: boolean;
  /**
   * Reload/remount com `started_at` obsoleto (não resetado).
   * Contrato correto: novo `started_at` após reload — ver `freshStartedAtAfterReload`.
   * Flag `true` → `invalid` + `page_reload`.
   */
  page_reloaded_stale_started_at?: boolean;
  /**
   * Relógio de referência injetado (ex. instante do servidor).
   * Opcional; quando omitido, não aplica checagem de skew vs "agora".
   */
  reference_now_ms?: number | null;
  /** Override de teste; default = constante provisória. */
  plausible_max_ms?: number;
  /** Override de teste; default = constante provisória. */
  clock_skew_tolerance_ms?: number;
};

export type ClassifyResponseTimeResult = {
  response_time_ms: number | null;
  response_time_status: EvidenceResponseTimeStatus;
  response_time_invalid_reason: EvidenceResponseTimeInvalidReason | null;
};

function invalid(
  reason: EvidenceResponseTimeInvalidReason,
  ms: number | null = null,
): ClassifyResponseTimeResult {
  return {
    response_time_ms: ms,
    response_time_status: 'invalid',
    response_time_invalid_reason: reason,
  };
}

function unknown(ms: number | null = null): ClassifyResponseTimeResult {
  return {
    response_time_ms: ms,
    response_time_status: 'unknown',
    response_time_invalid_reason: null,
  };
}

function valid(ms: number): ClassifyResponseTimeResult {
  return {
    response_time_ms: ms,
    response_time_status: 'valid',
    response_time_invalid_reason: null,
  };
}

/**
 * Classifica `response_time_*` a partir de instantes injetados.
 * Não lê relógio do sistema.
 */
export function classifyResponseTime(
  input: ClassifyResponseTimeInput,
): ClassifyResponseTimeResult {
  const plausibleMax =
    input.plausible_max_ms ?? EVIDENCE_RESPONSE_TIME_PLAUSIBLE_MAX_MS;
  const skewTol =
    input.clock_skew_tolerance_ms ?? EVIDENCE_RESPONSE_TIME_CLOCK_SKEW_TOLERANCE_MS;

  // Lifecycle: reload com started_at obsoleto
  if (input.page_reloaded_stale_started_at === true) {
    return invalid('page_reload');
  }

  // Background detectável
  if (input.tab_backgrounded === true) {
    return invalid('tab_backgrounded');
  }

  // Background não detectável (só suspeita)
  if (input.visibility_suspected_undetectable === true) {
    return unknown();
  }

  const started = input.started_at_ms;
  const answered = input.answered_at_ms;

  if (started === null || started === undefined) {
    return invalid('missing_started_at');
  }
  if (!Number.isFinite(started)) {
    return invalid('non_finite_delta');
  }
  if (answered === null || answered === undefined) {
    // Sem answered_at não há delta — status unknown (spec: null quando não calculável)
    return unknown();
  }
  if (!Number.isFinite(answered)) {
    return invalid('non_finite_delta');
  }

  const delta = answered - started;

  if (!Number.isFinite(delta)) {
    return invalid('non_finite_delta');
  }

  // Negativo: dentro da tolerância de skew → clock_skew; senão negative_delta
  if (delta < 0) {
    if (Math.abs(delta) <= skewTol) {
      return invalid('clock_skew', null);
    }
    return invalid('negative_delta', null);
  }

  // Skew vs referência injetada (answered no futuro além da tolerância)
  const ref = input.reference_now_ms;
  if (ref !== null && ref !== undefined && Number.isFinite(ref)) {
    if (answered > ref + skewTol) {
      return invalid('clock_skew', null);
    }
  }

  if (delta > plausibleMax) {
    return invalid('exceeds_plausible_max', Math.trunc(delta));
  }

  return valid(Math.trunc(delta));
}

/**
 * Parse de instante ISO 8601 **com offset explícito** (preferência `Z`).
 * Sem offset → não calculável (`unknown` no classificador via ms null + caller).
 * Retorna epoch ms ou erro tipado — sem `Date.now()`.
 */
export type ParseEvidenceTimestampResult =
  | { ok: true; ms: number }
  | { ok: false; reason: 'missing' | 'ambiguous_no_offset' | 'unparseable' };

const HAS_EXPLICIT_OFFSET_RE = /(Z|[+-]\d{2}:?\d{2})$/i;

export function parseEvidenceTimestampMs(
  value: string | null | undefined,
): ParseEvidenceTimestampResult {
  if (value === null || value === undefined) {
    return { ok: false, reason: 'missing' };
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { ok: false, reason: 'missing' };
  }
  if (!HAS_EXPLICIT_OFFSET_RE.test(trimmed)) {
    return { ok: false, reason: 'ambiguous_no_offset' };
  }
  const ms = Date.parse(trimmed);
  if (!Number.isFinite(ms)) {
    return { ok: false, reason: 'unparseable' };
  }
  return { ok: true, ms };
}

/**
 * Contrato de ciclo de vida (spec §1.6) — sem I/O.
 * Abandono / troca de questão sem confirmar → **não** emitir evento de tentativa.
 */
export type AttemptLifecycleSignal =
  | { outcome: 'emit_attempt' }
  | { outcome: 'no_event'; reason: 'abandoned' | 'question_switched_unconfirmed' };

export function resolveAttemptLifecycle(input: {
  human_confirmed: boolean;
  question_switched_without_confirm?: boolean;
}): AttemptLifecycleSignal {
  if (input.question_switched_without_confirm === true) {
    return { outcome: 'no_event', reason: 'question_switched_unconfirmed' };
  }
  if (!input.human_confirmed) {
    return { outcome: 'no_event', reason: 'abandoned' };
  }
  return { outcome: 'emit_attempt' };
}

/**
 * Contrato de reload (spec §1.6): remount → **novo** `started_at`.
 * Helper puro para o caller montar o instante fresco (injetado).
 */
export function freshStartedAtAfterReload(reload_instant_ms: number): number {
  if (!Number.isFinite(reload_instant_ms)) {
    throw new TypeError('reload_instant_ms must be a finite number');
  }
  return reload_instant_ms;
}
