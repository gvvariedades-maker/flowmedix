'use client';

import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import {
  ESTUDAR_L0_GEN_STORAGE_KEY,
  ESTUDAR_L0_SW_CLEAR_MESSAGE,
  type EstudarL0Meta,
} from '@/lib/estudar/l0Invalidation';
import { isEstudarSwL0Enabled } from '@/lib/estudar/estudarL0Config';
import {
  clearAllQuestaoIdb,
  deleteQuestaoFromIdbBySlug,
} from '@/lib/estudar/questaoIdbCache';

export type InvalidateQuestaoL0Options = {
  slugs?: string[];
  clearAll?: boolean;
};

function postClearQuestaoL0ToServiceWorker(slugs?: string[]): void {
  if (typeof navigator === 'undefined' || !isEstudarSwL0Enabled()) return;
  if (!('serviceWorker' in navigator)) return;

  const message = { type: ESTUDAR_L0_SW_CLEAR_MESSAGE, slugs: slugs ?? null };
  const controller = navigator.serviceWorker.controller;
  if (controller) {
    controller.postMessage(message);
    return;
  }

  void navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage(message);
  });
}

/** Limpa LRU em memória não é responsabilidade deste módulo — caller deve resetar se necessário. */
export async function invalidateQuestaoL0Client(
  options: InvalidateQuestaoL0Options = {},
): Promise<void> {
  const { clearAll = false, slugs } = options;

  if (clearAll || !slugs?.length) {
    await clearAllQuestaoIdb();
    postClearQuestaoL0ToServiceWorker();
    return;
  }

  await Promise.all(slugs.map((slug) => deleteQuestaoFromIdbBySlug(slug)));
  postClearQuestaoL0ToServiceWorker(slugs);
}

/**
 * Compara fingerprint do servidor com localStorage; purge L0 se divergir.
 * @returns true se houve invalidação local.
 */
export async function syncEstudarL0Generation(serverGeneration: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const stored = localStorage.getItem(ESTUDAR_L0_GEN_STORAGE_KEY);
  if (stored === serverGeneration) return false;

  await invalidateQuestaoL0Client({ clearAll: true });
  localStorage.setItem(ESTUDAR_L0_GEN_STORAGE_KEY, serverGeneration);
  return true;
}

/** Busca `/api/estudar/l0-meta` e sincroniza IDB/SW se o catálogo mudou. */
export async function fetchAndSyncEstudarL0Meta(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const res = await fetchWithAuth('/api/estudar/l0-meta');
    if (!res.ok) return false;
    const body = (await res.json()) as EstudarL0Meta;
    if (typeof body.generation !== 'string' || !body.generation) return false;
    return syncEstudarL0Generation(body.generation);
  } catch {
    return false;
  }
}
