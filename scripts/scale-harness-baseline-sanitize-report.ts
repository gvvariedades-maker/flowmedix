#!/usr/bin/env tsx
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  buildSanitizedBaselineReport,
  extractExecuteResultFromHarnessLog,
  readHarnessLogText,
} from '@/lib/scale/authenticatedHarness/baselineReportSanitize';
import {
  loadCanonicalArtifactBinding,
  sha256HexOfWorktreeFile,
} from '@/lib/scale/authenticatedHarness/canonicalArtifacts';

function parseArg(name: string): string | undefined {
  const prefix = `${name}=`;
  return process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length);
}

function main() {
  const logPath =
    parseArg('--log') ?? 'scale-harness-private/execute-conservative-50-baseline.log';
  const outPath =
    parseArg('--out') ?? 'artifacts/scale-harness-baseline-50-conservative.v1.json';
  const harnessSha = parseArg('--harness-sha') ?? execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  const appSha =
    parseArg('--app-sha') ?? 'd1fe4a28d39b4ec193c7914e54e593ad5522d613';
  const deployId = parseArg('--deploy-id') ?? 'dpl_J6XTemp4MA8RZ2xTsfTHyN4cvHEV';
  const sweepPath =
    parseArg('--sweep') ?? 'artifacts/scale-harness-pool-sweep-estudar-questao.json';

  const raw = readHarnessLogText(resolve(process.cwd(), logPath));
  const executeResult = extractExecuteResultFromHarnessLog(raw);
  if (!executeResult) {
    console.error('Não encontrou JSON mode=execute no log');
    process.exit(1);
  }

  const canonical = loadCanonicalArtifactBinding('conservative');
  let postBaselineStudyReadSweep: ReturnType<typeof buildSanitizedBaselineReport>['post_baseline_study_read_sweep'];
  const sweepAbs = resolve(process.cwd(), sweepPath);
  if (existsSync(sweepAbs)) {
    const sweep = JSON.parse(readFileSync(sweepAbs, 'utf8')) as {
      http_403?: number;
      http_200?: number;
      slug_403_summary?: Array<{ default_questao_slug: string; vu_count: number }>;
      results?: Array<{ commercial_reason?: string | null; http_status?: number }>;
    };
    const reason =
      sweep.results?.find((r) => r.http_status === 403)?.commercial_reason ?? null;
    postBaselineStudyReadSweep = {
      source: sweepPath,
      http_403: sweep.http_403 ?? 0,
      http_200: sweep.http_200 ?? 0,
      slug_403_summary: sweep.slug_403_summary ?? [],
      commercial_reason_sample: reason,
    };
  }
  const report = buildSanitizedBaselineReport({
    harnessGitSha: harnessSha,
    executeResult,
    canonical,
    worktreeDigestsCrlf: {
      envelope_sha256: sha256HexOfWorktreeFile(canonical.envelope_relative_path),
      allowlist_sha256: sha256HexOfWorktreeFile(canonical.allowlist_relative_path),
    },
    appStagingGitSha: appSha,
    vercelDeployId: deployId,
    stagingAppHost: 'flowmedix-git-staging-gvvariedades-makers-projects.vercel.app',
    supabaseProjectRef: 'higsjzfigprqvldpxfwj',
    postBaselineStudyReadSweep,
  });

  const absOut = resolve(process.cwd(), outPath);
  mkdirSync(dirname(absOut), { recursive: true });
  writeFileSync(absOut, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ written: outPath, operations: report.operations.length }, null, 2));
}

main();
