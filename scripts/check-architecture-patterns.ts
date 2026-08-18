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
 * - Sem valor arbitrário Tailwind com espaço em rgba() (parser não gera CSS)
 * - Hex de marca (#F26522 / #166534 / #22c55e) só em lib/brand/ (+ debt allowlist transitória)
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

/**
 * Hex de marca ainda em TSX legado — remover entrada ao migrar para tokens CSS.
 * Permitidos de forma permanente: `lib/brand/**` (e `globals.css`, fora do walk .ts/.tsx).
 * Fonte: baseline Fase 0 visual vitrine/dashboard (2026-08-09).
 */
const BRAND_HEX_DEBT_ALLOWLIST = new Set([
  'app/(admin)/admin/convites/page.tsx',
  'app/(admin)/admin/landings/page.tsx',
  'app/(admin)/admin/page.tsx',
  'app/(dashboard)/(authenticated)/conta/assinatura/AssinaturaClient.tsx',
  'app/(dashboard)/(authenticated)/simulados/[id]/loading.tsx',
  'app/(dashboard)/DashboardShell.tsx',
  'app/(dashboard)/ajuda/estudo-reverso/estudoReversoComponents.tsx',
  'app/_components/LPConcurso.client.tsx',
  'app/_components/LPConcurso.tsx',
  'app/assinar-pro/page.tsx',
  'app/blog/[slug]/page.tsx',
  'app/checkout/sucesso/page.tsx',
  'app/esqueci-senha/page.tsx',
  'app/login/page.tsx',
  'app/planos/page.tsx',
  'app/redefinir-senha/page.tsx',
  'app/register/page.tsx',
  'app/simulados/campina-grande/page.tsx',
  'components/admin/lp/LpPageEditor.tsx',
  'components/blog/BlogIndexClient.tsx',
  'components/blog/BlogPostCtaFinal.tsx',
  'components/blog/StudyCtaInline.tsx',
  'components/blog/mdx-components.tsx',
  'components/dashboard/BackToVitrineLink.tsx',
  'components/dashboard/cadernos/CadernoReverseStudyBadge.tsx',
  'components/dashboard/cadernos/CadernosEmptyState.tsx',
  'components/dashboard/cadernos/NovoCadernoClient.tsx',
  'components/dashboard/cadernos/SearchPanelToggle.tsx',
  'components/dashboard/performance/contribution-heatmap.tsx',
  'components/freemium/PaywallModal.tsx',
  'components/landing/CompareAvantCarousel.tsx',
  'components/landing/DemoInterativa.tsx',
  'components/landing/LandingHomeClient.tsx',
  'components/landing/LandingMetodoSteps.tsx',
  'components/landing/LandingPricingSplit.tsx',
  'components/landing/lp-ui.tsx',
  'components/landing/sections/LandingAutoridade.tsx',
  'components/landing/sections/LandingComparativo.tsx',
  'components/landing/sections/LandingCtaFinal.tsx',
  'components/landing/sections/LandingHero.tsx',
  'components/landing/sections/LandingNeuroSlides.tsx',
  'components/landing/sections/LandingRecursos.tsx',
  'components/layout/AuthAtmosphericBackdrop.tsx',
  'components/layout/PublicDarkAuthHeader.tsx',
  'components/layout/PublicDarkSiteHeader.tsx',
  'components/layout/PublicLightAuthHeader.tsx',
  'components/lesson/QuestaoFiguresBlock.tsx',
  'components/lp/campina/LPCampinaV2.tsx',
  'components/marketing/LandingNeuroSlideCarousel.tsx',
  'components/marketing/LandingProgressoPreview.tsx',
  'components/marketing/LandingQuestionPreview.tsx',
  'components/marketing/NeuroSlideCarousel.tsx',
  'components/onboarding/CadernoOnboardingBanner.tsx',
  'components/onboarding/EstudoReversoWelcomeModal.tsx',
  'components/pro/ProSubscribeNavButton.tsx',
  'components/public-simulado/PublicSimuladoRunner.tsx',
  'components/pwa/PwaInstallPanel.tsx',
  'components/questao-filter/QuestaoFilterDesktopFacetPopover.tsx',
  'components/questao-filter/QuestaoMobileFilterSheet.tsx',
  'components/simulados/SimuladoProvaInstrucoes.tsx',
  'components/simulados/SimuladoRunnerClient.tsx',
  'components/simulados/SimuladosAnalyticsDashboard.tsx',
  'components/simulados/SimuladosSetupClient.tsx',
  'components/simulados/WeeklyMissionFreemiumPanel.tsx',
  'components/slides/preview/opcaoB/OpcaoBPreviewClient.tsx',
  'components/ui/MultiCheckboxFilter.tsx',
  'components/ui/neon-badge.tsx',
  'components/ui/score-card.tsx',
]);

const BRAND_HEX_PATTERN = /#(?:F26522|166534|22c55e)\b/gi;
/** Tailwind arbitrary: `bg-[rgba(34, 197, 94,0.12)]` — espaço quebra o parser. */
const TAILWIND_RGBA_SPACE_PATTERN = /-\[(?:[^\]]*rgba\(\s*\d+\s*,\s+)/;

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
  'NEXT_PUBLIC_LESSON_PROJECTION',
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
    if (
      rel.includes('node_modules') ||
      rel.startsWith('.next/') ||
      rel === 'test-results' ||
      rel.startsWith('test-results/') ||
      rel === 'playwright-report' ||
      rel.startsWith('playwright-report/')
    ) {
      continue;
    }
    let st: ReturnType<typeof statSync>;
    try {
      st = statSync(full);
    } catch {
      // Junction/symlink órfão (ex.: test-results removido no Windows) — ignorar.
      continue;
    }
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

function stripTsComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[\s;{}])\/\/[^\n]*/g, '$1');
}

function checkNoTailwindArbitraryRgbaSpace(files: string[]): Violation[] {
  const violations: Violation[] = [];

  for (const file of files) {
    const rel = relPath(file);
    if (!isArchScope(rel)) continue;
    if (isSkippablePath(rel)) continue;

    const src = readFileSync(file, 'utf8');
    if (!TAILWIND_RGBA_SPACE_PATTERN.test(src)) continue;

    violations.push({
      file: rel,
      rule: 'no-tailwind-arbitrary-rgba-space',
      detail:
        'Valor arbitrário Tailwind com espaço em rgba() (ex. bg-[rgba(34, 197, 94,0.12)]) — o parser não gera CSS; use rgba(34,197,94,0.12) ou var(--token)',
    });
  }

  return violations;
}

function checkNoBrandHexOutsidePalette(files: string[]): Violation[] {
  const violations: Violation[] = [];

  for (const file of files) {
    const rel = relPath(file);
    if (!isArchScope(rel)) continue;
    if (isSkippablePath(rel)) continue;
    if (rel.startsWith('lib/brand/')) continue;
    if (BRAND_HEX_DEBT_ALLOWLIST.has(rel)) continue;

    const body = stripTsComments(readFileSync(file, 'utf8'));
    BRAND_HEX_PATTERN.lastIndex = 0;
    if (!BRAND_HEX_PATTERN.test(body)) continue;

    violations.push({
      file: rel,
      rule: 'no-brand-hex-outside-palette',
      detail:
        'Hex de marca (#F26522 / #166534 / #22c55e) fora de lib/brand/ — use tokens CSS (var(--color-brand*), var(--color-success*)) ou EDITORIAL_BRAND; se legado, adicione à BRAND_HEX_DEBT_ALLOWLIST só até migrar',
    });
  }

  return violations;
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
    ...checkNoTailwindArbitraryRgbaSpace(files),
    ...checkNoBrandHexOutsidePalette(files),
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

if (require.main === module) {
  main();
}
