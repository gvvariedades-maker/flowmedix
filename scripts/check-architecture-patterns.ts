/**
 * Guardrails de arquitetura (CLAUDE.md §2 + §10).
 *
 * Loop de melhoria: reincidência do mesmo anti-padrão 2× → novo check aqui
 * (não só parágrafo em doc). Procedimento + changelog:
 * docs/ENG_CONVERSA.md § Loop de melhoria contínua.
 *
 * Checks atuais:
 * - Um único createBrowserClient (lib/supabase/client.ts)
 * - RSC (app page.tsx without use client) must not query modulos_estudo outside lib/cache.ts
 * - Sem console.* solto em app/components/lib (usar logger)
 * - Sem service role / createServerSupabase em client components
 * - Sem .auth.getUser() em RSC (usar getServerSession / getServerUser via lib/supabase/server-auth)
 * - Novas process.env.* devem passar por lib/env.ts (Zod)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const ALLOWED_BROWSER_CLIENT = 'lib/supabase/client.ts';

/** Consulta diagnóstica de entitlement — não substitui lib/cache.ts para payload do player. */
const MODULOS_ESTUDO_RSC_ALLOWLIST = new Set([
  'app/(dashboard)/(authenticated)/estudar/[slug]/page.tsx',
]);

const ARCH_CHECK_SCOPES = ['app/', 'components/', 'lib/'] as const;

/** Testes, e2e, scripts e goldens de referência (não são runtime da app). */
const SKIP_PREFIXES = ['__tests__/', 'e2e/', 'scripts/', 'examples/'];

/** Implementação do logger ou saída CLI de audits — console permitido. */
const CONSOLE_ALLOWLIST = new Set([
  'lib/logger.ts',
  'lib/env.ts',
  'lib/catalogMigration/taxonomyGate.ts',
  'lib/catalogMigration/subtopicoInventory.ts',
  'lib/catalogMigration/pipelineOrchestrator.ts',
  'lib/catalogMigration/goldenAnchorGate.ts',
  'lib/catalogMigration/premiumCatalogAudit.ts',
  'lib/slides/l3MoldGapAudit.ts',
  'app/layout.tsx',
]);

/** Únicos lugares que podem chamar .auth.getUser() fora de client components. */
const GET_USER_ALLOWLIST = new Set([
  'proxy.ts',
  'lib/supabase/server-auth.ts',
  'lib/supabase/api-request-user.ts',
  'lib/admin/requireAdmin.ts',
  'lib/supabase/client.ts',
]);

/** Variáveis de ambiente legadas ainda não migradas para lib/env.ts (EnvSchema). */
const LEGACY_ENV_ALLOWLIST = new Set([
  'ADMIN_MATRICULAS_CONCURSO_ID',
  'GOOGLE_GEMINI_MODEL',
  'GOOGLE_GEMINI_SLIDES_MODEL',
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_E2E_DASHBOARD_BYPASS',
  'NEXT_PUBLIC_ESTUDAR_IDB_L0',
  'NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE',
  'NEXT_PUBLIC_ESTUDAR_NAV_TELEMETRY',
  'NEXT_PUBLIC_ESTUDAR_SW_L0',
  'NEXT_PUBLIC_SIMULADO_ANALYTICS_TELEMETRY',
  'NEXT_PUBLIC_SIMULADO_PREFETCH_TELEMETRY',
  'QUALITY_VITRINE_GATE',
  'PERF_BASE_URL',
  'PERF_ENV_FILE',
  'PERF_TARGET',
  'VERCEL_AUTOMATION_BYPASS_SECRET',
  'VERCEL_PROTECTION_BYPASS',
]);

/** Plataforma / Node — não exigem entrada em lib/env.ts. */
const PLATFORM_ENV_ALLOWLIST = new Set(['NODE_ENV', 'VERCEL_ENV', 'CI', 'NEXT_RUNTIME']);

const ENV_KEYS_FROM_SCHEMA = new Set<string>([
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'GOOGLE_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_PRICE_ID_PRO',
  'CRON_SECRET',
  'WEBHOOK_SECRET',
  'METRICS_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_EMAILS',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
  'NEXT_PUBLIC_WHATSAPP_NUMBER',
  'SENTRY_DSN',
  'NEXT_PUBLIC_SENTRY_DSN',
  'NEXT_PUBLIC_REVERSE_STUDY_SLIDE_ORDER',
  'SENTRY_AUTH_TOKEN',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
  'CURSOR_API_KEY',
  'CURSOR_ORCHESTRATOR_MODEL',
  'EE_V1_INSTRUMENTATION',
  'EE_V1_INTERNAL_EMAILS',
]);

type Violation = { file: string; rule: string; detail: string };

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(ROOT, full).replace(/\\/g, '/');
    if (rel.includes('node_modules') || rel.startsWith('.next/')) continue;
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx)$/.test(entry)) acc.push(full);
  }
  return acc;
}

function relPath(file: string): string {
  return relative(ROOT, file).replace(/\\/g, '/');
}

function isSkippablePath(rel: string): boolean {
  return SKIP_PREFIXES.some((prefix) => rel.startsWith(prefix));
}

function isArchScope(rel: string): boolean {
  return ARCH_CHECK_SCOPES.some((scope) => rel.startsWith(scope));
}

function isClientComponent(source: string): boolean {
  const head = source.slice(0, 800);
  return /^\s*['"]use client['"]\s*;?/m.test(head);
}

function isApiRoute(rel: string): boolean {
  return rel.startsWith('app/api/');
}

function checkCreateBrowserClient(files: string[]): Violation[] {
  const hits: string[] = [];
  const usagePattern = /createBrowserClient\s*\(/;

  for (const file of files) {
    const rel = relPath(file);
    if (!/\.(ts|tsx)$/.test(rel)) continue;
    if (isSkippablePath(rel)) continue;
    const src = readFileSync(file, 'utf8');
    if (!usagePattern.test(src)) continue;
    if (rel === ALLOWED_BROWSER_CLIENT) continue;
    hits.push(rel);
  }
  if (hits.length === 0) return [];
  return hits.map((file) => ({
    file,
    rule: 'single-createBrowserClient',
    detail: 'createBrowserClient só em lib/supabase/client.ts',
  }));
}

function checkModulosEstudoInRsc(files: string[]): Violation[] {
  const violations: Violation[] = [];
  const pattern = /\.from\s*\(\s*['"]modulos_estudo['"]\s*\)/;

  for (const file of files) {
    const rel = relPath(file);
    if (!rel.startsWith('app/') || !rel.endsWith('/page.tsx')) continue;

    const src = readFileSync(file, 'utf8');
    if (isClientComponent(src)) continue;
    if (!pattern.test(src)) continue;
    if (MODULOS_ESTUDO_RSC_ALLOWLIST.has(rel)) continue;

    violations.push({
      file: rel,
      rule: 'rsc-modulos-estudo-via-cache',
      detail:
        'Server Component page.tsx não deve consultar modulos_estudo diretamente — use lib/cache.ts',
    });
  }

  return violations;
}

function checkNoConsoleInApp(files: string[]): Violation[] {
  const violations: Violation[] = [];
  const pattern = /\bconsole\.(log|error|warn|debug|info)\s*\(/;

  for (const file of files) {
    const rel = relPath(file);
    if (!isArchScope(rel)) continue;
    if (isSkippablePath(rel)) continue;
    if (CONSOLE_ALLOWLIST.has(rel)) continue;

    const src = readFileSync(file, 'utf8');
    if (!pattern.test(src)) continue;

    violations.push({
      file: rel,
      rule: 'no-console-in-app',
      detail: 'Use logger de lib/logger.ts em vez de console.* em app/components/lib',
    });
  }

  return violations;
}

function checkNoServiceRoleInClient(files: string[]): Violation[] {
  const violations: Violation[] = [];
  const patterns = [
    { re: /\bcreateServerSupabase\b/, label: 'createServerSupabase' },
    { re: /\bSUPABASE_SERVICE_ROLE_KEY\b/, label: 'SUPABASE_SERVICE_ROLE_KEY' },
  ];

  for (const file of files) {
    const rel = relPath(file);
    if (!rel.startsWith('app/') && !rel.startsWith('components/')) continue;
    if (isSkippablePath(rel)) continue;
    if (isApiRoute(rel)) continue;

    const src = readFileSync(file, 'utf8');
    if (!isClientComponent(src)) continue;

    for (const { re, label } of patterns) {
      if (!re.test(src)) continue;
      violations.push({
        file: rel,
        rule: 'no-service-role-in-client',
        detail: `${label} não pode aparecer em client component — use API route + fetchWithAuth`,
      });
      break;
    }
  }

  return violations;
}

function checkNoGetUserInRsc(files: string[]): Violation[] {
  const violations: Violation[] = [];
  const pattern = /\.auth\.getUser\s*\(/;

  for (const file of files) {
    const rel = relPath(file);
    if (!isArchScope(rel)) continue;
    if (isSkippablePath(rel)) continue;
    if (GET_USER_ALLOWLIST.has(rel)) continue;
    if (isApiRoute(rel)) continue;

    const src = readFileSync(file, 'utf8');
    if (isClientComponent(src)) continue;
    if (!pattern.test(src)) continue;

    violations.push({
      file: rel,
      rule: 'no-getuser-in-rsc',
      detail:
        'Não chame .auth.getUser() em Server Component — use getServerSession() ou getServerUser() de lib/supabase/server-auth (proxy.ts renova na borda)',
    });
  }

  return violations;
}

function isAllowedEnvKey(key: string): boolean {
  if (PLATFORM_ENV_ALLOWLIST.has(key)) return true;
  if (ENV_KEYS_FROM_SCHEMA.has(key)) return true;
  if (LEGACY_ENV_ALLOWLIST.has(key)) return true;
  return false;
}

function checkNoNewEnvWithoutZod(files: string[]): Violation[] {
  const violations: Violation[] = [];
  const pattern = /process\.env\.([A-Z][A-Z0-9_]*)/g;

  for (const file of files) {
    const rel = relPath(file);
    if (!isArchScope(rel)) continue;
    if (isSkippablePath(rel)) continue;
    if (rel === 'lib/env.ts') continue;

    const src = readFileSync(file, 'utf8');
    const unknownKeys = new Set<string>();

    for (const match of src.matchAll(pattern)) {
      const key = match[1];
      if (!isAllowedEnvKey(key)) unknownKeys.add(key);
    }

    if (unknownKeys.size === 0) continue;

    const keys = [...unknownKeys].sort().join(', ');
    violations.push({
      file: rel,
      rule: 'no-new-env-without-zod',
      detail: `process.env fora de lib/env.ts (${keys}) — adicione ao EnvSchema em lib/env.ts ou à LEGACY_ENV_ALLOWLIST em check-architecture-patterns.ts`,
    });
  }

  return violations;
}

function main(): void {
  const files = walk(ROOT);
  const violations = [
    ...checkCreateBrowserClient(files),
    ...checkModulosEstudoInRsc(files),
    ...checkNoConsoleInApp(files),
    ...checkNoServiceRoleInClient(files),
    ...checkNoGetUserInRsc(files),
    ...checkNoNewEnvWithoutZod(files),
  ];

  if (violations.length === 0) {
    console.log('✅ Padrões de arquitetura Supabase/cache OK');
    return;
  }

  console.error('❌ Violações de arquitetura:\n');
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}`);
    console.error(`    ${v.detail}\n`);
  }
  process.exit(1);
}

main();
