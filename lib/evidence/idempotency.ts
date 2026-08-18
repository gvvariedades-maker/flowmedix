/**
 * Idempotência pura do Evidence Engine (spec §1.3.1).
 * Classifica `novo` | `duplicado_equivalente` | `conflito` — sem DB, sem overwrite.
 *
 * Fingerprint compara somente: selected_alternative, correct, question_version,
 * context, conviction, answer_change_count, question_id, user_id.
 * Fora do fingerprint: started_at, answered_at, response_time_*, session_id,
 * source, created_at, is_internal.
 */

import { canonicalJson } from '@/lib/evidence/questionVersion';
import type {
  EvidenceIdempotencyClassification,
  EvidenceSemanticFingerprintFields,
} from '@/lib/evidence/types';

/**
 * Fingerprint semântico estável (JSON canônico das 8 chaves §1.3.1).
 * Ordem de inserção das keys no objeto de entrada é irrelevante.
 */
export function computeSemanticFingerprint(
  fields: EvidenceSemanticFingerprintFields,
): string {
  // Montagem explícita garante o conjunto fechado (ignora props extras).
  const closed: EvidenceSemanticFingerprintFields = {
    answer_change_count: fields.answer_change_count,
    context: fields.context,
    conviction: fields.conviction,
    correct: fields.correct,
    question_id: fields.question_id,
    question_version: fields.question_version,
    selected_alternative: fields.selected_alternative,
    user_id: fields.user_id,
  };
  return canonicalJson(closed);
}

export type ClassifyIdempotencyInput = {
  /**
   * Evento prévio com o mesmo `attempt_id`, ou `null` se ainda não existe.
   * Caller só passa `existing` quando o lookup por `attempt_id` achou linha.
   */
  existing: EvidenceSemanticFingerprintFields | null;
  incoming: EvidenceSemanticFingerprintFields;
};

/**
 * Classificação pura (sem resolver nem sobrescrever conflito):
 * - sem evento prévio → `novo`
 * - fingerprint igual → `duplicado_equivalente`
 * - fingerprint ≠ → `conflito`
 */
export function classifyIdempotency(
  input: ClassifyIdempotencyInput,
): EvidenceIdempotencyClassification {
  if (input.existing === null) {
    return 'novo';
  }
  const prev = computeSemanticFingerprint(input.existing);
  const next = computeSemanticFingerprint(input.incoming);
  if (prev === next) {
    return 'duplicado_equivalente';
  }
  return 'conflito';
}

/**
 * Compara dois conjuntos semânticos §1.3.1 (equivalência de replay).
 */
export function semanticFingerprintsEqual(
  a: EvidenceSemanticFingerprintFields,
  b: EvidenceSemanticFingerprintFields,
): boolean {
  return computeSemanticFingerprint(a) === computeSemanticFingerprint(b);
}
