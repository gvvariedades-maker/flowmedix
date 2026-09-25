#!/usr/bin/env tsx
/**
 * Regenerates docs/independent-verify/* with UTF-8 patches (no mojibake).
 * Usage: npx tsx scripts/write-independent-verify-bundle.ts [baseSha]
 */
import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const cwd = process.cwd();
const baseSha = process.argv[2] ?? 'ecb6d6810d2a36b1dc2af3df6c2f3c6d9145c2ff';
const outDir = resolve(cwd, 'docs/independent-verify');

function git(args: string): string {
  return execSync(`git ${args}`, { cwd, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
}

mkdirSync(outDir, { recursive: true });

const status = git('status --short');
const diffCheck = git(`diff --check ${baseSha}`).trim();
const diffStat = git(`diff --stat ${baseSha}`).trim();
const nameStatus = git(`diff --name-status ${baseSha}`).trim();
const implementationPatch = git(`diff ${baseSha}`);
const packagePatch = git(`diff ${baseSha} -- package.json`);
const d9Patch = git(`diff ${baseSha} -- e2e/mobile-drawer.spec.ts`);

writeFileSync(resolve(outDir, 'implementation.patch'), implementationPatch, 'utf8');
writeFileSync(resolve(outDir, 'package.json.patch'), packagePatch, 'utf8');
writeFileSync(resolve(outDir, 'mobile-drawer.spec.patch'), d9Patch, 'utf8');

const newFiles = [
  '.gitattributes',
  'lib/e2e/captureMode.ts',
  'lib/e2e/localRunnerEnv.ts',
  'lib/harness/assertPortFree.ts',
  'lib/harness/captureFreshOutput.ts',
  'lib/harness/ciPlaceholders.ts',
  'lib/perf/sanitizeHarnessEnv.ts',
  'e2e/helpers/captureModeGate.ts',
  'scripts/run-perf-smoke-local.ts',
  'scripts/run-e2e-local.ts',
  'scripts/capture-hero-mockups.ts',
  'scripts/capture-t3-vitrine.ts',
  'scripts/capture-desempenho-hub.ts',
  'scripts/capture-questao-review.ts',
  'scripts/write-independent-verify-bundle.ts',
  '__tests__/lib/captureMode.test.ts',
  '__tests__/lib/harness/captureFreshOutput.test.ts',
  '__tests__/lib/perf/sanitizeHarnessEnv.test.ts',
  '__tests__/lib/e2eLocalRunnerEnv.test.ts',
  'docs/HARNESS_DETERMINISM.md',
];

let newFilesMd = '# Section 6 — new/untracked implementation files\n\n';
for (const rel of newFiles) {
  const abs = resolve(cwd, rel);
  newFilesMd += `\n### ${rel}\n\`\`\`\n`;
  newFilesMd += readFileSync(abs, 'utf8');
  newFilesMd += '\n```\n';
}
writeFileSync(resolve(outDir, 'NEW-IMPLEMENTATION-FILES.md'), newFilesMd, 'utf8');

const review = `# EWU-HARNESS-DETERMINISM-001 — Independent Verify Bundle (UTF-8)

BASE: ${baseSha}
HEAD: ${git('rev-parse HEAD').trim()}
Generated: ${new Date().toISOString()}
Encoding: UTF-8 (patches via git encoding=utf8)

## 1. git status --short
\`\`\`
${status.trimEnd()}
\`\`\`

## 2. git diff --check
\`\`\`
${diffCheck || '(clean)'}
\`\`\`

## 3. git diff --stat
\`\`\`
${diffStat}
\`\`\`

## 4. git diff --name-status
\`\`\`
${nameStatus}
\`\`\`

## 5–8. See implementation.patch, NEW-IMPLEMENTATION-FILES.md, package.json.patch, mobile-drawer.spec.patch

D9 note: \`expect(...).toPass()\` uses Playwright built-in retry (PLAYWRIGHT_TO_PASS_RETRY=YES); CUSTOM_RETRY_LOOP=NO.
`;

writeFileSync(resolve(outDir, 'REVIEW-BUNDLE.md'), review, 'utf8');

console.log('[write-independent-verify-bundle] wrote', outDir);
console.log('[write-independent-verify-bundle] files:', readdirSync(outDir).join(', '));
