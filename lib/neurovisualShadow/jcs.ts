import { createHash } from 'node:crypto';
import type { JsonValue } from './model';

function assertValidUnicode(value: string, path: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const unit = value.charCodeAt(index);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new Error(`Unpaired high surrogate at ${path}`);
      }
      index += 1;
    } else if (unit >= 0xdc00 && unit <= 0xdfff) {
      throw new Error(`Unpaired low surrogate at ${path}`);
    }
  }
}

function canonicalizeValue(value: JsonValue, path: string): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    if (typeof value === 'string') assertValidUnicode(value, path);
    return JSON.stringify(value);
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`Non-finite number at ${path}`);
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry, index) => canonicalizeValue(entry, `${path}/${index}`)).join(',')}]`;
  }

  const keys = Object.keys(value).sort();
  return `{${keys
    .map((key) => {
      assertValidUnicode(key, `${path}/<key>`);
      return `${JSON.stringify(key)}:${canonicalizeValue(value[key], `${path}/${key}`)}`;
    })
    .join(',')}}`;
}

/** RFC 8785/JCS for parsed I-JSON values. Arrays retain source order; strings are not normalized. */
export function canonicalizeJcs(value: JsonValue): string {
  return canonicalizeValue(value, '');
}

export function sha256Jcs(value: JsonValue): string {
  const bytes = Buffer.from(canonicalizeJcs(value), 'utf8');
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}
