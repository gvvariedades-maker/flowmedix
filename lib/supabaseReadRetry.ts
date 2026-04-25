import { DataServiceUnavailableError } from '@/lib/dataServiceError';
import { logger } from '@/lib/logger';

const DEFAULT_RETRIES = 3;
const RETRY_DELAYS_MS = [0, 150, 400] as const;

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

type PostgrestErrorLike = { message: string; code?: string } | null;

function errorMeta(e: PostgrestErrorLike) {
  if (!e) return {};
  return { code: e.code ?? '', message: (e.message ?? '').slice(0, 500) };
}

/**
 * Lê o Supabase com retentativas. Em falha persistente, **lança** (não grava falso
 * vazio no `unstable_cache`).
 */
export async function withPostgrestReadRetry<T>(
  label: string,
  execute: () => PromiseLike<{
    data: T;
    error: PostgrestErrorLike;
  }>,
  options?: { retries?: number; userMessage?: string },
): Promise<T> {
  const retries = options?.retries ?? DEFAULT_RETRIES;
  const userMessage = options?.userMessage;

  let last: PostgrestErrorLike = null;
  for (let i = 0; i < retries; i++) {
    if (i > 0) {
      const delay = RETRY_DELAYS_MS[i] ?? 400;
      await sleep(delay);
    }
    const { data, error } = await execute();
    if (!error) return data;
    last = error;
    const level = i + 1 >= retries ? 'warn' : 'debug';
    const msg = `[${label}] leitura falhou, tentativa ${i + 1}/${retries}`;
    if (level === 'debug') {
      logger.debug(msg, errorMeta(error));
    } else {
      logger.warn(msg, errorMeta(error));
    }
  }
  logger.error(`[${label}] leitura esgotou retentativas`, errorMeta(last));
  if (userMessage) {
    throw new DataServiceUnavailableError(userMessage);
  }
  throw new DataServiceUnavailableError();
}
