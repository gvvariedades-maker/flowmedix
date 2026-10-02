import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export type HarnessAuthSessionTokens = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
};

export async function createHarnessSessionForEmail(options: {
  supabaseUrl: string;
  serviceRoleKey: string;
  anonKey: string;
  email: string;
}): Promise<HarnessAuthSessionTokens> {
  const admin = createClient(options.supabaseUrl, options.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const anon = createClient(options.supabaseUrl, options.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: options.email,
  });
  if (linkError) throw linkError;

  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) throw new Error('generateLink sem hashed_token');

  const { data: verifyData, error: verifyError } = await anon.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'email',
  });
  if (verifyError) throw verifyError;
  if (!verifyData.session?.access_token || !verifyData.session.refresh_token) {
    throw new Error('verifyOtp sem session completa');
  }

  return {
    access_token: verifyData.session.access_token,
    refresh_token: verifyData.session.refresh_token,
    expires_in: verifyData.session.expires_in,
  };
}

export async function createHarnessSessionWithPassword(options: {
  supabaseUrl: string;
  anonKey: string;
  email: string;
  password: string;
}): Promise<HarnessAuthSessionTokens> {
  const anon = createClient(options.supabaseUrl, options.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await anon.auth.signInWithPassword({
    email: options.email,
    password: options.password,
  });
  if (error) throw error;
  if (!data.session?.access_token || !data.session.refresh_token) {
    throw new Error('signInWithPassword sem session');
  }
  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
  };
}

/** Cookie header no formato Supabase SSR (`sb-<ref>-auth-token`), para rotas RSC do harness. */
export async function buildSupabaseSsrCookieHeader(
  supabaseUrl: string,
  anonKey: string,
  tokens: HarnessAuthSessionTokens,
): Promise<string> {
  const jar: { name: string; value: string; options: CookieOptions }[] = [];
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll: () => [],
      setAll: (cookiesToSet) => {
        jar.push(...cookiesToSet);
      },
    },
  });

  const { error } = await supabase.auth.setSession({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });
  if (error) throw error;
  if (jar.length === 0) {
    throw new Error('setSession não emitiu cookies SSR');
  }
  return jar.map((c) => `${c.name}=${c.value}`).join('; ');
}

export function supabaseProjectRefFromUrl(supabaseUrl: string): string {
  return new URL(supabaseUrl).hostname.split('.')[0] ?? '';
}
