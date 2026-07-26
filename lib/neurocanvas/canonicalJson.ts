/**
 * JSON canônico para hashing determinístico (chaves lexicográficas, strings NFC).
 * Usado pela auditoria NeuroCanvas G0.2 — sem acoplamento ao Evidence Engine.
 */

function nfc(value: string): string {
  return value.normalize('NFC');
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

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value));
}
