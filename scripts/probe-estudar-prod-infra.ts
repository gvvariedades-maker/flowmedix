#!/usr/bin/env tsx
/**
 * Probe de produção: TTFB + x-vercel-id de GET /estudar autenticado.
 * Não altera Vercel. Não imprime e-mail nem tokens.
 *
 *   npx tsx scripts/probe-estudar-prod-infra.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import { createChunks, stringToBase64URL } from '@supabase/ssr';
import { loadEnvConfig } from '@next/env';
import { isAdminSessionEmail } from '@/lib/constants';

loadEnvConfig(process.cwd());

const BASE = 'https://www.avant.enf.br';
const SAMPLES = Number(process.argv.find((a) => a.startsWith('--samples='))?.split('=')[1] ?? 3);
const OUT = resolve(process.cwd(), 'artifacts', 'infra-estudar-prod-probe.json');

async function resolveNonAdminUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const forcedEmail = process.env.PERF_BASELINE_EMAIL?.trim().toLowerCase();
  if (forcedEmail) {
    const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const match = listData.users.find((u) => u.email?.toLowerCase() === forcedEmail);
    if (!match?.id) throw new Error('PERF_BASELINE_EMAIL não encontrado');
    if (isAdminSessionEmail(match.email)) throw new Error('PERF_BASELINE_EMAIL é admin');
    return { userId: match.id, email: match.email ?? forcedEmail, source: 'perf_baseline_email' };
  }
  const { data: rows, error } = await admin
    .from('concurso_matriculas')
    .select('user_id')
    .eq('status', 'ativo')
    .order('created_at', { ascending: false })
    .limit(40);
  if (error) throw error;
  for (const row of rows ?? []) {
    const userId = (row as { user_id: string }).user_id;
    const { data } = await admin.auth.admin.getUserById(userId);
    const email = data.user?.email ?? null;
    if (email && !isAdminSessionEmail(email)) {
      return { userId, email, source: 'matricula_nao_admin' };
    }
  }
  throw new Error('Nenhum usuário não-admin com matrícula ativa');
}

async function createSessionForEmail(email: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const anon = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (linkError) throw linkError;
  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) throw new Error('generateLink sem hashed_token');
  const { data: verifyData, error: verifyError } = await anon.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'email',
  });
  if (verifyError) throw verifyError;
  if (!verifyData.session?.access_token) throw new Error('verifyOtp sem session');
  return verifyData.session;
}

function cookieHeader(session: {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
  user: unknown;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const ref = new URL(supabaseUrl).hostname.split('.')[0] ?? 'project';
  const cookieName = `sb-${ref}-auth-token`;
  const payload = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type ?? 'bearer',
    user: session.user,
  });
  const encoded = `base64-${stringToBase64URL(payload)}`;
  return createChunks(cookieName, encoded)
    .map((chunk) => `${chunk.name}=${chunk.value}`)
    .join('; ');
}

type Sample = {
  index: number;
  startedAt: string;
  httpCode: number;
  ttfbMs: number;
  totalMs: number;
  namelookupMs: number;
  connectMs: number;
  appconnectMs: number;
  vercelId: string;
  vercelCache: string;
  serverTiming: string;
  requestId: string;
  edgeRegion: string;
  functionRegion: string;
  looksAuthenticated: boolean;
  looksLoginRedirect: boolean;
};

function probeOnce(cookies: string, index: number): Sample {
  const headerFile = resolve(process.cwd(), 'artifacts', `infra-estudar-headers-${index}.txt`);
  const bodyFile = resolve(process.cwd(), 'artifacts', `infra-estudar-body-${index}.html`);
  const startedAt = new Date().toISOString();
  const result = spawnSync(
    'curl.exe',
    [
      '-sS',
      '-o',
      bodyFile,
      '-D',
      headerFile,
      '-w',
      JSON.stringify({
        http_code: '%{http_code}',
        time_namelookup: '%{time_namelookup}',
        time_connect: '%{time_connect}',
        time_appconnect: '%{time_appconnect}',
        time_starttransfer: '%{time_starttransfer}',
        time_total: '%{time_total}',
      }),
      '--max-time',
      '90',
      '-H',
      `Cookie: ${cookies}`,
      '-H',
      'Accept: text/html,application/xhtml+xml',
      '-H',
      'User-Agent: AVANT-infra-probe/1',
      `${BASE}/estudar`,
    ],
    { encoding: 'utf8', maxBuffer: 2_000_000 },
  );
  if (result.status !== 0) {
    throw new Error(`curl falhou (status=${result.status}): ${result.stderr || result.stdout}`);
  }
  const timing = JSON.parse(result.stdout.trim()) as {
    http_code: string;
    time_namelookup: string;
    time_connect: string;
    time_appconnect: string;
    time_starttransfer: string;
    time_total: string;
  };
  const headers = require('node:fs').readFileSync(headerFile, 'utf8') as string;
  const body = require('node:fs').readFileSync(bodyFile, 'utf8') as string;
  const headerMap: Record<string, string> = {};
  for (const line of headers.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx > 0) headerMap[line.slice(0, idx).toLowerCase()] = line.slice(idx + 1).trim();
  }
  const vercelId = headerMap['x-vercel-id'] ?? '';
  const parts = vercelId.split('::');
  require('node:fs').unlinkSync(bodyFile);
  require('node:fs').unlinkSync(headerFile);
  return {
    index,
    startedAt,
    httpCode: Number(timing.http_code),
    ttfbMs: Math.round(Number(timing.time_starttransfer) * 1000),
    totalMs: Math.round(Number(timing.time_total) * 1000),
    namelookupMs: Math.round(Number(timing.time_namelookup) * 1000),
    connectMs: Math.round(Number(timing.time_connect) * 1000),
    appconnectMs: Math.round(Number(timing.time_appconnect) * 1000),
    vercelId,
    vercelCache: headerMap['x-vercel-cache'] ?? '',
    serverTiming: headerMap['server-timing'] ?? '',
    requestId: parts[2] ?? vercelId,
    edgeRegion: parts[0] ?? '',
    functionRegion: parts[1] ?? '',
    looksAuthenticated: /estudar|vitrine|caderno/i.test(body) && !/NEXT_REDIRECT[\s\S]{0,80}\/login/.test(body),
    looksLoginRedirect: /NEXT_REDIRECT/.test(body) && /\/login/.test(body),
  };
}

async function main() {
  mkdirSync(resolve(process.cwd(), 'artifacts'), { recursive: true });
  const user = await resolveNonAdminUser();
  const session = await createSessionForEmail(user.email);
  const cookies = cookieHeader(session);
  const samples: Sample[] = [];
  for (let i = 1; i <= SAMPLES; i += 1) {
    const sample = probeOnce(cookies, i);
    samples.push(sample);
    console.log(
      JSON.stringify({
        index: sample.index,
        ttfbMs: sample.ttfbMs,
        totalMs: sample.totalMs,
        httpCode: sample.httpCode,
        edgeRegion: sample.edgeRegion,
        functionRegion: sample.functionRegion,
        requestId: sample.requestId,
        vercelCache: sample.vercelCache,
        looksAuthenticated: sample.looksAuthenticated,
        looksLoginRedirect: sample.looksLoginRedirect,
        serverTiming: sample.serverTiming,
      }),
    );
  }
  const report = {
    measuredAt: new Date().toISOString(),
    base: `${BASE}/estudar`,
    deployHint: 'production www.avant.enf.br',
    userSource: user.source,
    userIdPrefix: user.userId.slice(0, 8),
    samples,
    meanTtfbMs: Math.round(samples.reduce((a, s) => a + s.ttfbMs, 0) / samples.length),
  };
  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(`wrote ${OUT}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
