/**
 * Guardrails de arquitetura (CLAUDE.md Fase 5):
 * - Um único createBrowserClient (lib/supabase/client.ts)
 * - RSC (app page.tsx without use client) must not query modulos_estudo outside lib/cache.ts
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const ALLOWED_BROWSER_CLIENT = 'lib/supabase/client.ts';

/** Consulta diagnóstica de entitlement — não substitui lib/cache.ts para payload do player. */
const MODULOS_ESTUDO_RSC_ALLOWLIST = new Set([
  'app/(dashboard)/(authenticated)/estudar/[slug]/page.tsx',
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

function isClientComponent(source: string): boolean {
  const head = source.slice(0, 800);
  return /^\s*['"]use client['"]\s*;?/m.test(head);
}

function checkCreateBrowserClient(files: string[]): Violation[] {
  const hits: string[] = [];
  const usagePattern = /createBrowserClient\s*\(/;

  for (const file of files) {
    const rel = relative(ROOT, file).replace(/\\/g, '/');
    if (!/\.(ts|tsx)$/.test(rel)) continue;
    if (rel.startsWith('__tests__/') || rel.startsWith('e2e/') || rel.startsWith('scripts/')) continue;
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
    const rel = relative(ROOT, file).replace(/\\/g, '/');
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

function main(): void {
  const files = walk(ROOT);
  const violations = [
    ...checkCreateBrowserClient(files),
    ...checkModulosEstudoInRsc(files),
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
