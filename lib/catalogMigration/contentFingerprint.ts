/**
 * RC-004 — fingerprint estável do conteúdo pedagógico servido.
 * Exclui metadados de aprovação (efficacy_contract, anchor_100_approval).
 */
import { createHash } from 'node:crypto';
import { unwrapCatalogPayload } from '@/lib/catalogMigration/unwrapCatalogPayload';

export const CONTENT_FINGERPRINT_ALGORITHM_VERSION = 'rc004-v1-sha256-pedagogical-excl-approval-meta';

export function normalizePayloadForContentFingerprint(raw: unknown): unknown {
  const unwrapped = unwrapCatalogPayload(raw);
  if (!unwrapped || typeof unwrapped !== 'object' || Array.isArray(unwrapped)) {
    return unwrapped;
  }

  const clone = JSON.parse(JSON.stringify(unwrapped)) as Record<string, unknown>;
  const meta = clone.meta;
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) {
    return clone;
  }

  const metaObj = meta as Record<string, unknown>;
  if (metaObj.efficacy_contract && typeof metaObj.efficacy_contract === 'object') {
    delete metaObj.efficacy_contract;
  }
  if (metaObj.anchor_100_approval && typeof metaObj.anchor_100_approval === 'object') {
    delete metaObj.anchor_100_approval;
  }

  return clone;
}

export function fingerprintConteudoJson(raw: unknown): string {
  const normalized = normalizePayloadForContentFingerprint(raw);
  return createHash('sha256').update(JSON.stringify(normalized ?? null)).digest('hex');
}
