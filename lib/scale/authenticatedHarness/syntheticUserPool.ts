import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

const FORBIDDEN_HOST_SUFFIXES = ['avant.enf.br'];

export function loadSyntheticUserPool(filePath: string): SyntheticUserPoolFile {
  const absolute = resolve(process.cwd(), filePath);
  const parsed = JSON.parse(readFileSync(absolute, 'utf8')) as SyntheticUserPoolFile;
  if (parsed.schema_version !== 1) {
    throw new Error(`Pool schema_version ${parsed.schema_version} não suportado (esperado 1)`);
  }
  if (!parsed.base_url?.trim()) {
    throw new Error('Pool base_url obrigatório');
  }
  if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
    throw new Error('Pool users[] deve ter pelo menos 1 entrada');
  }
  for (const user of parsed.users) {
    if (!user.pool_id?.trim() || !user.access_token?.trim()) {
      throw new Error(`Pool user inválido: pool_id e access_token obrigatórios (${user.pool_id ?? '?'})`);
    }
  }
  assertBaseUrlAllowedForHarness(parsed.base_url);
  return parsed;
}

export function assertBaseUrlAllowedForHarness(baseUrl: string): void {
  let host: string;
  try {
    host = new URL(baseUrl).hostname.toLowerCase();
  } catch {
    throw new Error(`base_url inválida: ${baseUrl}`);
  }
  for (const suffix of FORBIDDEN_HOST_SUFFIXES) {
    if (host === suffix || host.endsWith(`.${suffix}`)) {
      throw new Error(
        `base_url ${baseUrl} aponta para Production (${suffix}). Harness bloqueado até autorização explícita do Owner.`,
      );
    }
  }
}
