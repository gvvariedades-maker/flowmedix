import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertPoolBoundToApprovedStaging,
  type ApprovedStagingTarget,
} from '@/lib/scale/authenticatedHarness/approvedStagingTarget';
import type { SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

export function loadSyntheticUserPool(
  filePath: string,
  approved: ApprovedStagingTarget,
): SyntheticUserPoolFile {
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

  assertPoolBoundToApprovedStaging(parsed, approved);
  return parsed;
}
