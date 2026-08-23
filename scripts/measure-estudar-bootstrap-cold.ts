#!/usr/bin/env tsx
/**
 * Cold TTFB de `/estudar` autenticado em `next start` (sem E2E bypass).
 *
 *   npx tsx scripts/measure-estudar-bootstrap-cold.ts --label=patch --samples=3
 *
 * Sobe `next start` por amostra (processo novo + wipe de `.next/cache`).
 * Não faz `next build` — rode `npm run build` antes.
 */
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  createChunks,
  DEFAULT_COOKIE_OPTIONS,
  stringToBase64URL,
} from '@supabase/ssr';
import { loadEnvConfig } from '@next/env';
import { chromium } from 'playwright';
import { isAdminSessionEmail } from '@/lib/constants';

loadEnvConfig(process.cwd());

const SAMPLES = Number(process.argv.find((a) => a.startsWith('--samples='))?.split('=')[1] ?? 3);
const LABEL = process.argv.find((a) => a.startsWith('--label='))?.split('=')[1] ?? 'run';
const PORT = Number(process.env.AVANT_MEASURE_PORT ?? 3017);
const BASE = `http://127.0.0.1:${PORT}`;
const TRACE_FILE = resolve(process.cwd(), 'artifacts', `estudar-bootstrap-fetch-trace-${LABEL}.json`);
const OUT_FILE = resolve(process.cwd(), 'artifacts', `estudar-bootstrap-cold-${LABEL}.json`);

type Sample = {
  index: number;
  ttfbMs: number;
  responseStartMs: number;
  status: number;
  finalPath: string;
  authUser: number;
  concursoMatriculas: number;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer(url: string, timeoutMs: number) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status > 0) return;
    } catch {
      /* still booting */
    }
    await sleep(400);
  }
  throw new Error(`Servidor não respondeu em ${url} (${timeoutMs}ms)`);
}

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
    if (isAdminSessionEmail(match.email)) {
      throw new Error('PERF_BASELINE_EMAIL é admin — o gate de matrícula seria pulado');
    }
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
  throw new Error('Nenhum usuário não-admin com matrícula ativa para o cold /estudar');
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

function sessionCookies(session: {
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
  return createChunks(cookieName, encoded).map((chunk) => ({
    name: chunk.name,
    value: chunk.value,
    domain: '127.0.0.1',
    path: '/',
    httpOnly: DEFAULT_COOKIE_OPTIONS.httpOnly ?? false,
    secure: false,
    sameSite: 'Lax' as const,
  }));
}

async function startNext(): Promise<ChildProcess> {
  const cacheDir = resolve(process.cwd(), '.next/cache');
  if (existsSync(cacheDir)) {
    rmSync(cacheDir, { recursive: true, force: true });
  }
  if (existsSync(TRACE_FILE)) {
    rmSync(TRACE_FILE, { force: true });
  }

  const nextBin = resolve(process.cwd(), 'node_modules/next/dist/bin/next');
  const child = spawn(
    process.execPath,
    [nextBin, 'start', '-H', '127.0.0.1', '-p', String(PORT)],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: String(PORT),
        E2E_DASHBOARD_BYPASS: '',
        NEXT_PUBLIC_E2E_DASHBOARD_BYPASS: '',
        CI: '',
        AVANT_FETCH_TRACE_FILE: TRACE_FILE,
        NODE_OPTIONS: `--require ${resolve(process.cwd(), 'scripts/trace-supabase-outbound.cjs').replace(/\\/g, '/')}`,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    },
  );

  child.stdout?.on('data', (buf: Buffer) => {
    process.stdout.write(buf);
  });
  child.stderr?.on('data', (buf: Buffer) => {
    process.stderr.write(buf);
  });

  await Promise.race([
    waitForServer(`${BASE}/robots.txt`, 90_000),
    new Promise<never>((_, reject) => {
      child.once('exit', (code) => {
        reject(new Error(`next start saiu antes de ficar pronto (code=${code})`));
      });
    }),
  ]);
  return child;
}

async function stopNext(child: ChildProcess) {
  if (child.pid) {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      child.kill('SIGTERM');
    }
  }
  const t0 = Date.now();
  while (child.exitCode === null && Date.now() - t0 < 10_000) {
    await sleep(200);
  }
  if (child.exitCode === null && child.pid) {
    try {
      process.kill(child.pid, 'SIGKILL');
    } catch {
      /* already gone */
    }
  }
}

function readTrace(): { authUser: number; concursoMatriculas: number } {
  if (!existsSync(TRACE_FILE)) return { authUser: 0, concursoMatriculas: 0 };
  try {
    const parsed = JSON.parse(require('node:fs').readFileSync(TRACE_FILE, 'utf8')) as {
      authUser?: number;
      concursoMatriculas?: number;
    };
    return {
      authUser: parsed.authUser ?? 0,
      concursoMatriculas: parsed.concursoMatriculas ?? 0,
    };
  } catch {
    return { authUser: 0, concursoMatriculas: 0 };
  }
}

async function measureOnce(
  cookies: ReturnType<typeof sessionCookies>,
): Promise<Omit<Sample, 'index'>> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies(cookies);
  const page = await context.newPage();
  const response = await page.goto(`${BASE}/estudar`, {
    waitUntil: 'commit',
    timeout: 120_000,
  });
  if (!response) {
    await browser.close();
    throw new Error('goto /estudar sem response');
  }
  await sleep(350);
  const trace = readTrace();
  const requestTiming = response.request().timing();
  const ttfbMs = Math.round(requestTiming.responseStart);
  await page.waitForURL(/\/estudar(\?|$)/, { timeout: 30_000 }).catch(() => undefined);
  const finalPath = new URL(page.url()).pathname;
  const status = response.status();
  await browser.close();
  return {
    ttfbMs,
    responseStartMs: ttfbMs,
    status,
    finalPath,
    authUser: trace.authUser,
    concursoMatriculas: trace.concursoMatriculas,
  };
}

async function main() {
  if (!existsSync(resolve(process.cwd(), '.next/BUILD_ID'))) {
    throw new Error('Sem build de produção. Rode `npm run build` antes.');
  }
  mkdirSync(resolve(process.cwd(), 'artifacts'), { recursive: true });

  const user = await resolveNonAdminUser();
  const session = await createSessionForEmail(user.email);
  const cookies = sessionCookies(session);

  const samples: Sample[] = [];
  for (let i = 1; i <= SAMPLES; i += 1) {
    console.log(`\n--- amostra ${i}/${SAMPLES} (${LABEL}) ---`);
    const child = await startNext();
    try {
      const measured = await measureOnce(cookies);
      if (measured.finalPath !== '/estudar') {
        throw new Error(`Não ficou em /estudar (path=${measured.finalPath}, status=${measured.status})`);
      }
      samples.push({ index: i, ...measured });
      console.log(JSON.stringify(samples[samples.length - 1], null, 2));
    } finally {
      await stopNext(child);
      await sleep(1000);
    }
  }

  const ttfbs = samples.map((s) => s.ttfbMs);
  const mean = Math.round(ttfbs.reduce((a, b) => a + b, 0) / ttfbs.length);
  const report = {
    label: LABEL,
    measuredAt: new Date().toISOString(),
    base: BASE,
    userSource: user.source,
    samples,
    meanTtfbMs: mean,
    authUser: samples.map((s) => s.authUser),
    concursoMatriculas: samples.map((s) => s.concursoMatriculas),
  };
  writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${OUT_FILE}`);
  console.log(`mean TTFB ${mean} ms`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
