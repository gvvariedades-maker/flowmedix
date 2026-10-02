import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';

import { logger } from '@/lib/logger';
import type { SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

export type RotatedPoolSession = {
  pool_id: string;
  access_token: string;
  supabase_refresh_token: string;
};

/** Serializa escritas: vários VUs renovam o token ao mesmo tempo. */
let writeChain: Promise<void> = Promise.resolve();

function assertPoolFilePath(poolFilePath: string): string {
  const abs = resolve(poolFilePath);
  const marker = `${sep}scale-harness-private${sep}`;
  if (!abs.includes(marker) || !abs.endsWith('.json')) {
    throw new Error('persistência de sessão do harness só grava em scale-harness-private/*.json');
  }
  return abs;
}

/**
 * Grava access_token e refresh_token rotacionados no arquivo do pool.
 * O refresh token do GoTrue é de uso único; sem isso o próximo processo reenvia o token queimado e toma HTTP 400.
 */
export function persistRotatedPoolSession(poolFilePath: string, update: RotatedPoolSession): Promise<void> {
  const abs = assertPoolFilePath(poolFilePath);
  const run = writeChain.then(() => {
    const pool = JSON.parse(readFileSync(abs, 'utf8')) as SyntheticUserPoolFile;
    const user = pool.users.find((item) => item.pool_id === update.pool_id);
    if (!user) {
      logger.warn('Pool do harness sem pool_id para gravar sessão rotacionada', {
        pool_id: update.pool_id,
      });
      return;
    }
    user.access_token = update.access_token;
    user.supabase_refresh_token = update.supabase_refresh_token;
    writeFileSync(abs, `${JSON.stringify(pool, null, 2)}\n`, 'utf8');
  });
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
