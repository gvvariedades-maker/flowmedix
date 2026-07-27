/**
 * `question_version` — fingerprint avaliativo (spec §1.8 / plano §11).
 * Somente servidor; cliente não chama em runtime neste lote.
 *
 * Hex SHA-256 64 chars via node:crypto (padrão webhookEventLedger).
 * Não usar lib/contentHash.ts (semântica/fallback diferentes).
 */

import { createHash } from 'node:crypto';

/** Opção no payload canônico (ordenado por `id` antes do hash). */
export type EvidenceQuestionVersionOption = {
  id: string;
  text: string;
  is_correct: boolean;
};

/**
 * Conteúdo avaliativo relevante para versionamento.
 * Slides, figuras, header_line e UI meta ficam **fora** deste input.
 */
export type EvidenceQuestionVersionInput = {
  modulo_slug: string;
  instruction: string;
  options: EvidenceQuestionVersionOption[];
  /**
   * Subconjunto de meta do catálogo. Ausentes → null no JSON canônico.
   * Chave no payload: `meta_evidence_relevant` (SPEC §1.8; não `meta` abreviado do plano §11).
   */
  meta_evidence_relevant?: {
    content_standard?: string | null;
    family?: string | null;
    pedagogical_branch?: string | null;
  } | null;
};

/** Payload intermediário com chaves lexicográficas e NFC aplicado. */
type CanonicalQuestionVersionPayload = {
  instruction: string;
  meta_evidence_relevant: {
    content_standard: string | null;
    family: string | null;
    pedagogical_branch: string | null;
  };
  modulo_slug: string;
  options: Array<{
    id: string;
    is_correct: boolean;
    text: string;
  }>;
};

function nfc(value: string): string {
  return value.normalize('NFC');
}

/**
 * JSON canônico: chaves lexicográficas em todos os níveis; strings NFC;
 * sem espaços insignificantes (`JSON.stringify` após ordenar).
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value));
}

function sortKeysDeep(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return typeof value === 'string' ? nfc(value) : value;
  }
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  const obj = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortKeysDeep(obj[key]);
  }
  return sorted;
}

function buildCanonicalPayload(
  input: EvidenceQuestionVersionInput,
): CanonicalQuestionVersionPayload {
  const meta = input.meta_evidence_relevant ?? null;
  const options = [...input.options]
    .map((opt) => ({
      id: nfc(opt.id),
      is_correct: Boolean(opt.is_correct),
      text: nfc(opt.text),
    }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  return {
    instruction: nfc(input.instruction),
    meta_evidence_relevant: {
      content_standard:
        meta?.content_standard == null ? null : nfc(meta.content_standard),
      family: meta?.family == null ? null : nfc(meta.family),
      pedagogical_branch:
        meta?.pedagogical_branch == null ? null : nfc(meta.pedagogical_branch),
    },
    modulo_slug: nfc(input.modulo_slug),
    options,
  };
}

/**
 * `question_version = sha256_hex(utf8_bytes(canonical_json(...)))`
 * Hex minúsculo, exatamente 64 caracteres.
 */
export function computeQuestionVersion(input: EvidenceQuestionVersionInput): string {
  const payload = buildCanonicalPayload(input);
  const json = canonicalJson(payload);
  return createHash('sha256').update(json, 'utf8').digest('hex');
}

/** Exporta o JSON canônico (útil em testes / debug; não é o hash). */
export function canonicalQuestionVersionJson(input: EvidenceQuestionVersionInput): string {
  return canonicalJson(buildCanonicalPayload(input));
}
