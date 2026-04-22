import type { Session } from '@supabase/supabase-js';
import { combineChunks, stringFromBase64URL } from '@supabase/ssr';

const BASE64_PREFIX = 'base64-';

function supabaseAuthStorageKeyFromUrl(supabaseUrl: string): string {
  const host = new URL(supabaseUrl).hostname;
  const projectRef = host.split('.')[0];
  return `sb-${projectRef}-auth-token`;
}

/** Chaves `sb-…-auth-token` presentes nos cookies (incl. chunks `.0`, `.1`…). */
function discoverAuthStorageKeysFromCookieNames(
  names: string[],
): string[] {
  const bases = new Set<string>();
  for (const name of names) {
    const m = name.match(/^(sb-.+-auth-token)(?:\.\d+)?$/);
    if (m) bases.add(m[1]!);
  }
  return [...bases];
}

function isSessionRecord(x: unknown): x is Session {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.access_token === 'string' &&
    typeof o.refresh_token === 'string' &&
    o.user !== null &&
    typeof o.user === 'object'
  );
}

/**
 * Lê a sessão GoTrue serializada nos cookies **sem** instanciar o client nem
 * chamar `getSession()` — evita `POST .../token?grant_type=refresh_token` no
 * Node em paralelo com o `getUser()` do `proxy.ts`.
 */
export async function readSessionFromCookies(
  cookieStore: { getAll(): { name: string; value: string }[] },
  supabaseUrl: string,
): Promise<Session | null> {
  const all = cookieStore.getAll();
  const byName = new Map(all.map((c) => [c.name, c.value]));

  const keyFromUrl = supabaseAuthStorageKeyFromUrl(supabaseUrl);
  const tryKeys = [
    keyFromUrl,
    ...discoverAuthStorageKeysFromCookieNames(all.map((c) => c.name)).filter(
      (k) => k !== keyFromUrl,
    ),
  ];

  let raw: string | null = null;
  for (const key of tryKeys) {
    raw = await combineChunks(key, (name) => byName.get(name) ?? null);
    if (raw) break;
  }
  if (!raw) return null;

  let jsonString = raw;
  if (typeof raw === 'string' && raw.startsWith(BASE64_PREFIX)) {
    jsonString = stringFromBase64URL(raw.slice(BASE64_PREFIX.length));
  }

  try {
    const parsed: unknown = JSON.parse(jsonString);
    if (!isSessionRecord(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}
