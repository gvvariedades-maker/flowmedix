import {
  FSRS_MVP_REVIEW_UNIT_PREFIX,
} from './defaults';
import type {
  FsrsMvpResolveReviewUnitInput,
  FsrsMvpResolveReviewUnitResult,
} from './types';

const GENERIC_SUBTOPICOS = new Set(['', 'geral', 'general']);

/**
 * Normalização determinística: trim, espaços colapsados, lowercase, Unicode NFC.
 */
export function normalizeReviewUnitToken(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toLowerCase().normalize('NFC');
}

/**
 * Escapa tokens para o namespace `key=value` (evita colisão por `:` / `=` / `%`).
 */
export function escapeReviewUnitToken(normalized: string): string {
  return encodeURIComponent(normalized);
}

function buildUnitId(
  kind: 'cluster' | 'subtopico',
  disciplineEscaped: string,
  valueEscaped: string,
): string {
  return `${FSRS_MVP_REVIEW_UNIT_PREFIX}:discipline=${disciplineEscaped}:${kind}=${valueEscaped}`;
}

/**
 * Resolve `review_unit_id` versionado e namespaced por disciplina.
 *
 * Formato:
 * - `fsrs:v1:discipline=<esc>:cluster=<esc>`
 * - `fsrs:v1:discipline=<esc>:subtopico=<esc>`
 *
 * Cluster só com `clusterInventoryConfirmed === true` + id não vazio.
 * Sem consulta a inventário/banco — confirmação é do caller (R3/R4).
 */
export function resolveReviewUnitId(
  input: FsrsMvpResolveReviewUnitInput,
): FsrsMvpResolveReviewUnitResult {
  if (typeof input.discipline !== 'string') {
    return { ok: false, reason: 'missing_discipline' };
  }
  const disciplineNorm = normalizeReviewUnitToken(input.discipline);
  if (!disciplineNorm) {
    return { ok: false, reason: 'invalid_discipline' };
  }
  const disciplineEsc = escapeReviewUnitToken(disciplineNorm);

  const clusterRaw =
    typeof input.knowledgeClusterId === 'string' ? input.knowledgeClusterId : '';
  const clusterConfirmed = input.clusterInventoryConfirmed === true;
  const clusterNorm = clusterRaw ? normalizeReviewUnitToken(clusterRaw) : '';

  if (clusterConfirmed) {
    if (!clusterNorm) {
      return { ok: false, reason: 'invalid_cluster_id' };
    }
    return {
      ok: true,
      reviewUnitKind: 'cluster',
      reviewUnitId: buildUnitId(
        'cluster',
        disciplineEsc,
        escapeReviewUnitToken(clusterNorm),
      ),
    };
  }

  if (typeof input.subtopico !== 'string' && input.subtopico != null) {
    return { ok: false, reason: 'invalid_subtopico' };
  }
  const subRaw = typeof input.subtopico === 'string' ? input.subtopico : '';
  const subNorm = normalizeReviewUnitToken(subRaw);
  if (!subNorm) {
    return { ok: false, reason: 'missing_subtopico' };
  }
  if (GENERIC_SUBTOPICOS.has(subNorm)) {
    return { ok: false, reason: 'generic_subtopico' };
  }

  return {
    ok: true,
    reviewUnitKind: 'subtopico',
    reviewUnitId: buildUnitId(
      'subtopico',
      disciplineEsc,
      escapeReviewUnitToken(subNorm),
    ),
  };
}
