import type { SyntheticUserCredentials } from '@/lib/scale/authenticatedHarness/types';

/** Estado mutável por VU (somente em memória durante execução). */
export type VuRuntimeState = {
  poolUser: SyntheticUserCredentials;
  access_token: string;
  supabase_refresh_token?: string;
  cookie_header?: string;
  simulado_session_id?: string;
  simulado_modulo_slug?: string;
};

export function createVuRuntimeState(user: SyntheticUserCredentials): VuRuntimeState {
  return {
    poolUser: user,
    access_token: user.access_token,
    supabase_refresh_token: user.supabase_refresh_token,
    cookie_header: user.cookie_header,
    simulado_session_id: user.simulado_session_id,
    simulado_modulo_slug: user.simulado_modulo_slug,
  };
}

export function toMaterializeUser(state: VuRuntimeState): SyntheticUserCredentials {
  return {
    ...state.poolUser,
    access_token: state.access_token,
    supabase_refresh_token: state.supabase_refresh_token,
    cookie_header: state.cookie_header,
    simulado_session_id: state.simulado_session_id,
    simulado_modulo_slug: state.simulado_modulo_slug,
  };
}

export function applySupabaseRefreshResponse(
  state: VuRuntimeState,
  body: { access_token?: string; refresh_token?: string },
): void {
  if (body.access_token?.trim()) state.access_token = body.access_token.trim();
  if (body.refresh_token?.trim()) state.supabase_refresh_token = body.refresh_token.trim();
}
