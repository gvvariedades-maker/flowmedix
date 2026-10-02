import type { HarnessOperationStep } from '@/lib/scale/authenticatedHarness/types';
import type { SyntheticUserCredentials, SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

/** Request executável (sem credenciais em serialização pública). */
export type MaterializedHttpRequest = {
  operation_id: string;
  phase: 'setup' | 'measured';
  method: string;
  /** Path + query (sem base_url). */
  url_path: string;
  body?: Record<string, unknown>;
  auth_mode: 'bearer' | 'cookie_session_rsc' | 'supabase_auth_refresh';
};

export function materializeOperation(
  op: HarnessOperationStep,
  pool: SyntheticUserPoolFile,
  user: SyntheticUserCredentials,
): MaterializedHttpRequest {
  const slug = user.default_questao_slug?.trim() ?? '';
  const moduloSlug = user.simulado_modulo_slug?.trim() || slug;

  switch (op.operation_id) {
    case 'api_vitrine_page':
      return {
        operation_id: op.operation_id,
        phase: op.phase,
        method: 'GET',
        url_path: '/api/vitrine?page=1&disciplina=enfermagem',
        auth_mode: 'bearer',
      };
    case 'rsc_estudar_slug':
      return {
        operation_id: op.operation_id,
        phase: op.phase,
        method: 'GET',
        url_path: `/estudar/${encodeURIComponent(slug)}`,
        auth_mode: 'cookie_session_rsc',
      };
    case 'api_estudar_questao':
      return {
        operation_id: op.operation_id,
        phase: op.phase,
        method: 'GET',
        url_path: `/api/estudar/questao?slug=${encodeURIComponent(slug)}&layers=core&disciplina=enfermagem`,
        auth_mode: 'bearer',
      };
    case 'api_registrar_tentativa':
      return {
        operation_id: op.operation_id,
        phase: op.phase,
        method: 'POST',
        url_path: '/api/registrar-tentativa',
        auth_mode: 'bearer',
        body: {
          modulo_slug: slug,
          opcao_id: user.default_opcao_id,
        },
      };
    case 'api_simulado_sessions_create':
      return {
        operation_id: op.operation_id,
        phase: 'setup',
        method: 'POST',
        url_path: '/api/simulado/sessions',
        auth_mode: 'bearer',
        body: {
          quantidade: 5,
          modo: 'treino',
          ritmo_meta: '3min',
          forcar_novo: true,
        },
      };
    case 'api_simulado_sessions':
      return {
        operation_id: op.operation_id,
        phase: op.phase,
        method: 'GET',
        url_path: '/api/simulado/sessions',
        auth_mode: 'bearer',
      };
    case 'api_simulado_questao':
      return {
        operation_id: op.operation_id,
        phase: op.phase,
        method: 'GET',
        url_path: `/api/simulado/questao?slug=${encodeURIComponent(moduloSlug)}`,
        auth_mode: 'bearer',
      };
    case 'api_simulado_responder':
      return {
        operation_id: op.operation_id,
        phase: op.phase,
        method: 'POST',
        url_path: '/api/simulado/responder',
        auth_mode: 'bearer',
        body: {
          session_id: user.simulado_session_id,
          modulo_slug: moduloSlug,
          opcao_id: user.default_opcao_id,
        },
      };
    case 'rsc_desempenho':
      return {
        operation_id: op.operation_id,
        phase: op.phase,
        method: 'GET',
        url_path: '/desempenho',
        auth_mode: 'cookie_session_rsc',
      };
    case 'rsc_cadernos':
      return {
        operation_id: op.operation_id,
        phase: op.phase,
        method: 'GET',
        url_path: '/cadernos',
        auth_mode: 'cookie_session_rsc',
      };
    case 'auth_session_refresh':
      return {
        operation_id: op.operation_id,
        phase: op.phase,
        method: 'POST',
        url_path: '/auth/v1/token?grant_type=refresh_token',
        auth_mode: 'supabase_auth_refresh',
        body: { grant_type: 'refresh_token' },
      };
    default:
      throw new Error(`Operação não materializada: ${op.operation_id}`);
  }
}

export function materializeSampleForUser(
  setupSteps: HarnessOperationStep[],
  measuredOps: HarnessOperationStep[],
  pool: SyntheticUserPoolFile,
  user: SyntheticUserCredentials,
): MaterializedHttpRequest[] {
  const setup = setupSteps.map((s) => materializeOperation(s, pool, user));
  const measured = measuredOps.map((m) => materializeOperation(m, pool, user));
  return [...setup, ...measured];
}
