#!/usr/bin/env tsx
/**
 * Stamp efficacy_contract A4-mínimo (Punção, História, …).
 *
 *   npm run stamp:a4-minimo -- --file=data/.../slug.json
 *   npm run stamp:a4-minimo -- --lote=historia-enfermagem-g01
 *   npm run stamp:a4-minimo -- --lote=... --dry-run
 *   npm run stamp:puncao-a4-minimo -- ...  (alias)
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  applyA4MinimoMitigation,
  auditA4Minimo,
  buildA4MinimoEfficacyContract,
} from '@/lib/catalogMigration/a4MinimoCore';
import { resolveA4MinimoConfig } from '@/lib/catalogMigration/a4MinimoRegistry';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  scoreQuestaoRisk,
  shouldSampleForHumanReview,
  DEFAULT_AUTO_APPROVAL_POLICY,
} from '@/lib/catalogMigration/riskScoring';

function parseArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

type Payload = {
  meta?: Record<string, unknown> & {
    subtopico?: string;
    efficacy_contract?: Record<string, unknown>;
  };
  [k: string]: unknown;
};

function stampFile(path: string, dryRun: boolean): {
  path: string;
  status: 'stamped' | 'skipped' | 'human_required' | 'failed';
  detail: string;
} {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as Payload;
  const slug = path.split(/[/\\]/).pop()?.replace(/\.json$/, '') ?? path;
  const sub = String(raw.meta?.subtopico ?? '');
  const cfg = resolveA4MinimoConfig(sub);
  if (!cfg) {
    return { path, status: 'skipped', detail: 'no_a4_minimo_package' };
  }

  const base = scoreQuestaoRisk(raw as never, {
    productionReady: true,
    autoApprovalEnabled: true,
  });
  const audit = auditA4Minimo(cfg, raw as never);
  const risk = applyA4MinimoMitigation(cfg, base, audit, {
    autoApprovalEnabled: true,
  });

  if (!audit.applicable) {
    return { path, status: 'skipped', detail: `not_${cfg.packageId}` };
  }
  if (!audit.agentA4Eligible) {
    return {
      path,
      status: 'human_required',
      detail: audit.blockers.slice(0, 4).join('; '),
    };
  }
  if (risk.approval_mode === 'human_required') {
    return {
      path,
      status: 'human_required',
      detail: `risk_still_alto [${risk.risk_factors.join(',')}]`,
    };
  }

  const sampled = shouldSampleForHumanReview(
    risk.risk_tier,
    {
      ...DEFAULT_AUTO_APPROVAL_POLICY,
      enabled: true,
      sample_rate: { baixo: 0.05, medio: 0.2 },
    },
    slug,
  );

  const contract = buildA4MinimoEfficacyContract(cfg, risk, audit, {
    sampled,
    isoDate: new Date().toISOString().slice(0, 10),
  });
  if (!contract) {
    return { path, status: 'failed', detail: 'contract_null' };
  }

  if (sampled) {
    return {
      path,
      status: 'human_required',
      detail: `sampled_20pct — olho humano 30s (${cfg.label})`,
    };
  }

  if (!dryRun) {
    raw.meta = {
      ...(raw.meta ?? {}),
      efficacy_contract: contract,
    };
    writeFileSync(path, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
  }

  return {
    path,
    status: 'stamped',
    detail: `${cfg.packageId} ${risk.risk_tier}/${risk.approval_mode} claims=${audit.matched.map((m) => m.claimId).join(',')}`,
  };
}

function main() {
  const dryRun = hasFlag('dry-run');
  const file = parseArg('file');
  const lote = parseArg('lote');
  const paths: string[] = [];

  if (file) paths.push(file);
  if (lote) {
    const dir = loteQuestionsDir(lote);
    for (const name of readdirSync(dir)) {
      if (name.endsWith('.json')) paths.push(join(dir, name));
    }
  }
  if (paths.length === 0) {
    console.error('Uso: --file=<path> ou --lote=<lote> [--dry-run]');
    process.exit(1);
  }

  let stamped = 0;
  let human = 0;
  let skipped = 0;
  for (const p of paths) {
    const r = stampFile(p, dryRun);
    console.log(`[stamp:a4-minimo] ${r.status.toUpperCase()} ${p} — ${r.detail}`);
    if (r.status === 'stamped') stamped++;
    else if (r.status === 'human_required') human++;
    else skipped++;
  }
  console.log(
    `[stamp:a4-minimo] done stamped=${stamped} human_required=${human} skipped=${skipped} dryRun=${dryRun}`,
  );
}

main();
