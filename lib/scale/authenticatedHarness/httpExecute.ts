import type { MaterializedHttpRequest } from '@/lib/scale/authenticatedHarness/materializeRequest';
import type { SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';
import {
  createHarnessFetch,
  mergeVercelProtectionHeadersForAppUrl,
  type HarnessHttpTransportOptions,
} from '@/lib/scale/authenticatedHarness/vercelProtectionHarness';
import { applySupabaseRefreshResponse, type VuRuntimeState } from '@/lib/scale/authenticatedHarness/vuRuntime';

export type { HarnessHttpTransportOptions };

export type HttpExecuteOutcome = {
  ok: boolean;
  status: number;
  latency_ms: number;
  error_kind?: 'http_error' | 'redirect' | 'network' | 'parse';
  final_url?: string;
};

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

function buildFetchInit(
  req: MaterializedHttpRequest,
  pool: SyntheticUserPoolFile,
  state: VuRuntimeState,
  requestUrl: string,
  transport?: HarnessHttpTransportOptions,
): RequestInit {
  const headers: Record<string, string> = {
    Accept: 'application/json, text/html;q=0.9',
  };

  if (req.auth_mode === 'bearer') {
    headers.Authorization = `Bearer ${state.access_token}`;
  } else if (req.auth_mode === 'cookie_session_rsc') {
    headers.Cookie = state.cookie_header ?? '';
  } else if (req.auth_mode === 'supabase_auth_refresh') {
    headers.apikey = pool.supabase_anon_key ?? '';
    headers['Content-Type'] = 'application/json';
  }

  const redirect: RequestRedirect = req.auth_mode === 'cookie_session_rsc' ? 'manual' : 'follow';
  const init: RequestInit = { method: req.method, headers, redirect };

  if (req.body && req.method !== 'GET') {
    if (req.auth_mode === 'supabase_auth_refresh') {
      init.body = JSON.stringify({
        ...req.body,
        refresh_token: state.supabase_refresh_token,
      });
    } else {
      init.body = JSON.stringify(req.body);
      headers['Content-Type'] = 'application/json';
    }
  }

  if (req.auth_mode !== 'supabase_auth_refresh' && transport) {
    mergeVercelProtectionHeadersForAppUrl(requestUrl, headers, transport);
  }
  return init;
}

export function resolveRequestUrl(pool: SyntheticUserPoolFile, req: MaterializedHttpRequest): string {
  if (req.auth_mode === 'supabase_auth_refresh') {
    const base = pool.supabase_url?.replace(/\/$/, '') ?? '';
    return `${base}/auth/v1/token?grant_type=refresh_token`;
  }
  const base = pool.base_url.replace(/\/$/, '');
  const path = req.url_path.startsWith('/') ? req.url_path : `/${req.url_path}`;
  return `${base}${path}`;
}

function isRedirectStatus(status: number): boolean {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

function isHttpSuccess(status: number, authMode: MaterializedHttpRequest['auth_mode']): boolean {
  if (authMode === 'cookie_session_rsc') {
    return status >= 200 && status < 300;
  }
  return status >= 200 && status < 300;
}

export async function executeMaterializedRequest(
  pool: SyntheticUserPoolFile,
  state: VuRuntimeState,
  req: MaterializedHttpRequest,
  fetchImpl: FetchLike = fetch,
  transport?: HarnessHttpTransportOptions,
): Promise<HttpExecuteOutcome> {
  const started = Date.now();
  const url = resolveRequestUrl(pool, req);
  const effectiveFetch = createHarnessFetch(fetchImpl, transport);
  try {
    const response = await effectiveFetch(url, buildFetchInit(req, pool, state, url, transport));
    const latency_ms = Date.now() - started;

    if (req.auth_mode === 'cookie_session_rsc' && isRedirectStatus(response.status)) {
      return {
        ok: false,
        status: response.status,
        latency_ms,
        error_kind: 'redirect',
        final_url: response.headers.get('location') ?? undefined,
      };
    }

    const ok = isHttpSuccess(response.status, req.auth_mode);

    if (ok && req.auth_mode === 'supabase_auth_refresh') {
      try {
        const json = (await response.json()) as { access_token?: string; refresh_token?: string };
        applySupabaseRefreshResponse(state, json);
      } catch {
        return { ok: false, status: response.status, latency_ms, error_kind: 'parse' };
      }
    }

    return { ok, status: response.status, latency_ms, final_url: response.url };
  } catch {
    return { ok: false, status: 0, latency_ms: Date.now() - started, error_kind: 'network' };
  }
}
