import type { SimuladoHubOpenSession, SimuladoHubSessionItem } from '@/lib/simulado/hubLoad';

/** Delay do stream P1 no bypass — o P0 precisa ficar observável no Playwright. */
export const E2E_SIMULADOS_P1_DELAY_MS = 1_200;

export const E2E_SIMULADOS_OPEN_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
export const E2E_SIMULADOS_RECENT_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
export const E2E_SIMULADOS_OPEN_TITLE = 'Prova E2E hub';
export const E2E_SIMULADOS_RECENT_TITLE = 'Prova E2E recente';

export const E2E_SIMULADOS_OPEN_SESSION: SimuladoHubOpenSession = {
  id: E2E_SIMULADOS_OPEN_ID,
  total_questoes: 10,
  modo: 'prova',
  titulo: E2E_SIMULADOS_OPEN_TITLE,
  created_at: '2026-08-01T00:00:00.000Z',
  session_kind: 'livre',
};

export const E2E_SIMULADOS_RECENT_SESSION: SimuladoHubSessionItem = {
  id: E2E_SIMULADOS_RECENT_ID,
  status: 'concluido',
  modo: 'prova',
  titulo: E2E_SIMULADOS_RECENT_TITLE,
  total_questoes: 20,
  percentual_acerto: 75,
  created_at: '2026-07-31T10:00:00.000Z',
  concluida_em: '2026-07-31T11:00:00.000Z',
  session_kind: 'livre',
};

export function e2eSimuladosContinueHref(sessionId: string): string {
  return `/simulados/${sessionId}`;
}
