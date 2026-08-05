#!/usr/bin/env tsx
/**
 * Checklist Âncoras 100% — gates + assinatura por risco.
 *
 *   npm run audit:anchor-100 -- --file=examples/questao-premium-….json
 *   npm run audit:anchor-100 -- --file=… --sign-agent
 *   npm run audit:anchor-100 -- --file=… --sign-human=PC --write-meta
 *   npm run audit:anchor-100 -- --file=… --require-visual
 *   npm run audit:anchor-100 -- --file=… --reviewer-file=artifacts/anchor-reviewer-b.json
 *
 * Exit: 0 = gates_pass (e se --sign-*, approval pass);
 *       1 = gates fail;
 *       2 = human_required sem --sign-human.
 *
 * @see docs/ANCHOR_CHECKLIST_100.md
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

loadEnvConfig(process.cwd());

import {
  ANCHOR_CHECKLIST_VERSION,
  applyAnchor100ApprovalToPayload,
  auditAnchorChecklist100,
  formatAnchorChecklistLine,
  type AnchorChecklist100Result,
} from '@/lib/catalogMigration/anchorChecklist100';
import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';

type ReviewerFile = {
  teach_once?: { pass: boolean; evidence?: string; reviewer?: string };
  gesture_g2?: { pass: boolean; evidence?: string; reviewer?: string };
};

function loadReviewerOverlay(): ReviewerFile | undefined {
  const pathArg = parseArg('reviewer-file');
  if (!pathArg) return undefined;
  const path = resolve(process.cwd(), pathArg);
  if (!existsSync(path)) {
    throw new Error(`--reviewer-file não encontrado: ${path}`);
  }
  return JSON.parse(readFileSync(path, 'utf8')) as ReviewerFile;
}

function writeArtifact(result: AnchorChecklist100Result): string {
  const abs = resolve(process.cwd(), result.artifact_relpath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, JSON.stringify(result, null, 2), 'utf8');
  return abs;
}

function main(): void {
  const file = parseArg('file');
  if (!file) {
    console.error('[audit:anchor-100] Informe --file=<path.json>');
    process.exitCode = 1;
    return;
  }

  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) {
    console.error(`[audit:anchor-100] Arquivo não encontrado: ${path}`);
    process.exitCode = 1;
    return;
  }

  const payload = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  const signAgent = hasFlag('sign-agent');
  const signHuman = parseArg('sign-human') ?? undefined;
  const requireVisual = hasFlag('require-visual');
  const writeMeta = hasFlag('write-meta');
  const jsonOnly = hasFlag('json');

  let result = auditAnchorChecklist100(payload, {
    filePath: file.replace(/\\/g, '/'),
    requireVisual,
    reviewerOverlay: loadReviewerOverlay(),
    signAgent,
    signHuman,
  });

  // --sign-agent sem agent_may_sign → human_required (já no lib); reforça mensagem
  if (signAgent && !result.agent_may_sign && result.approval.status !== 'pass') {
    if (!jsonOnly) {
      console.error(
        '[audit:anchor-100] --sign-agent bloqueado (risk alto ou gates fail). Use --sign-human=Nome.',
      );
    }
  }

  if (writeMeta && result.approval.status === 'pass') {
    const next = applyAnchor100ApprovalToPayload(payload, result.approval);
    writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
    if (!jsonOnly) {
      console.log(`[audit:anchor-100] meta.anchor_100_approval gravado em ${file}`);
    }
  } else if (writeMeta && result.approval.status !== 'pass') {
    console.error(
      '[audit:anchor-100] --write-meta exige approval.status=pass (use --sign-agent ou --sign-human=).',
    );
    process.exitCode = 1;
  }

  const outPath = writeArtifact(result);

  if (!jsonOnly) {
    console.log(formatAnchorChecklistLine(result));
    for (const check of Object.values(result.checks)) {
      const mark = check.pass ? '✓' : '✗';
      console.log(`  ${mark} ${check.id} [${check.source}] ${check.detail ?? ''}`);
      if (check.fails?.length) {
        for (const f of check.fails.slice(0, 5)) console.log(`      - ${f}`);
      }
    }
    console.log(
      `[audit:anchor-100] version=${ANCHOR_CHECKLIST_VERSION} artifact=${outPath}`,
    );
    if (result.approval.status === 'pending' && result.gates_pass) {
      console.log(
        '[audit:anchor-100] gates OK — assine com --sign-agent (risco baixo/médio) ou --sign-human=',
      );
    }
  } else {
    console.log(outPath);
  }

  if (!result.gates_pass) {
    process.exitCode = 1;
  } else if (result.verdict === 'human_required') {
    process.exitCode = 2;
  } else {
    process.exitCode = 0;
  }
}

try {
  main();
} catch (err) {
  console.error('[audit:anchor-100]', err);
  process.exitCode = 1;
}
