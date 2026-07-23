/**
 * Configuração das camadas L0 opcionais (fase 11 do plano de performance).
 */

/** Entradas máximas no LRU / IndexedDB / Service Worker. */
export const ESTUDAR_L0_MAX_ENTRIES = 20;

/** TTL alinhado ao cache server-side de questão por usuário (120 s). */
export const ESTUDAR_L0_TTL_MS = 120_000;

/** IndexedDB L0 — habilitado por padrão; desligar com NEXT_PUBLIC_ESTUDAR_IDB_L0=0 */
export function isEstudarIdbL0Enabled(): boolean {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_ESTUDAR_IDB_L0 !== '0';
  }
  return process.env.NEXT_PUBLIC_ESTUDAR_IDB_L0 !== '0';
}

/**
 * Intercepting route @modal — opt-in via NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE=1.
 * Mobile: questão sobre a vitrine; desktop: player no shell (sidebar visível).
 */
export function isEstudarModalRouteEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE === '1';
}

/** Service Worker cache L0 para GET /api/estudar/questao — habilitado por padrão. */
export function isEstudarSwL0Enabled(): boolean {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_ESTUDAR_SW_L0 !== '0';
  }
  return process.env.NEXT_PUBLIC_ESTUDAR_SW_L0 !== '0';
}

export const ESTUDAR_IDB_DB_NAME = 'avant-estudar-l0';
export const ESTUDAR_IDB_STORE_NAME = 'questao-payloads';
/** Bump invalida entradas legadas (ex.: chave com `disciplina` e suffix vazio → SINCRONIZANDO). */
export const ESTUDAR_IDB_DB_VERSION = 3;

export const ESTUDAR_SW_CACHE_NAME = 'avant-estudar-questao-l0-v3';
export const ESTUDAR_SW_QUESTAO_API_PATH = '/api/estudar/questao';
