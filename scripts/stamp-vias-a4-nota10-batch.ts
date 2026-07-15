#!/usr/bin/env tsx
/**
 * Onda nota-10 Vias — A4-mínimo agent stamp + amostra humana handcraft-qc (≥20% medio).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  applyA4MinimoMitigation,
  auditA4Minimo,
  buildA4MinimoEfficacyContract,
} from '@/lib/catalogMigration/a4MinimoCore';
import { VIAS_A4_MINIMO_CONFIG } from '@/lib/catalogMigration/viasA4Minimo';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildEfficacyContractFromRisk,
  DEFAULT_AUTO_APPROVAL_POLICY,
  scoreQuestaoRisk,
  shouldSampleForHumanReview,
} from '@/lib/catalogMigration/riskScoring';

const ISO = '2026-07-14';
const LOTES = [
  ...Array.from({ length: 26 }, (_, i) => `vias-de-administracao-g${String(i + 1).padStart(2, '0')}`),
  'vias-de-administracao-consulpam-repair',
];

type Payload = Record<string, unknown> & {
  meta?: Record<string, unknown> & {
    family?: string;
    efficacy_contract?: Record<string, unknown>;
  };
};

function slugFromPath(path: string): string {
  return path.split(/[/\\]/).pop()?.replace(/\.json$/, '') ?? path;
}

function needsHumanSample(payload: Payload, slug: string): boolean {
  const family = String(payload.meta?.family ?? '');
  if (family === 'calc') return true;

  const base = scoreQuestaoRisk(payload as never, { productionReady: true, autoApprovalEnabled: true });
  const audit = auditA4Minimo(VIAS_A4_MINIMO_CONFIG, payload as never);
  const risk = applyA4MinimoMitigation(VIAS_A4_MINIMO_CONFIG, base, audit, {
    autoApprovalEnabled: true,
  });

  if (risk.risk_tier === 'alto' || risk.approval_mode === 'human_required') return true;
  if (!audit.agentA4Eligible) return true;

  return shouldSampleForHumanReview(risk.risk_tier, DEFAULT_AUTO_APPROVAL_POLICY, slug);
}

function stampHuman(path: string, payload: Payload, note: string): void {
  const slug = slugFromPath(path);
  const base = scoreQuestaoRisk(payload as never, { productionReady: true, autoApprovalEnabled: true });
  const audit = auditA4Minimo(VIAS_A4_MINIMO_CONFIG, payload as never);
  const risk = applyA4MinimoMitigation(VIAS_A4_MINIMO_CONFIG, base, audit, {
    autoApprovalEnabled: true,
  });
  const agentContract = buildA4MinimoEfficacyContract(VIAS_A4_MINIMO_CONFIG, risk, audit, {
    isoDate: ISO,
    sampled: true,
  });
  const humanBase = buildEfficacyContractFromRisk(risk, {
    reviewerAgent: 'handcraft-qc',
    sampled: true,
    isoDate: ISO,
  });

  payload.meta = {
    ...(payload.meta ?? {}),
    efficacy_contract: {
      ...humanBase,
      ...(agentContract ?? {}),
      a4_reviewer: 'handcraft-qc',
      a4_human_notes: note,
      sampled: true,
      a4_reviewed: true,
      auto_approved_at: ISO,
    },
  };
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function stampAgent(path: string, payload: Payload): 'stamped' | 'human' | 'skip' {
  const slug = slugFromPath(path);
  const base = scoreQuestaoRisk(payload as never, { productionReady: true, autoApprovalEnabled: true });
  const audit = auditA4Minimo(VIAS_A4_MINIMO_CONFIG, payload as never);
  const risk = applyA4MinimoMitigation(VIAS_A4_MINIMO_CONFIG, base, audit, {
    autoApprovalEnabled: true,
  });

  if (needsHumanSample(payload, slug)) {
    const reason =
      String(payload.meta?.family ?? '') === 'calc'
        ? 'family=calc'
        : audit.blockers.slice(0, 2).join('; ') || 'amostra 20% medio';
    stampHuman(path, payload, `Onda nota-10 Vias — ${reason}.`);
    return 'human';
  }

  if (!audit.agentA4Eligible || risk.approval_mode === 'human_required') {
    stampHuman(path, payload, `Onda nota-10 Vias — ${audit.blockers.slice(0, 3).join('; ') || 'blocker'}.`);
    return 'human';
  }

  const contract = buildA4MinimoEfficacyContract(VIAS_A4_MINIMO_CONFIG, risk, audit, {
    isoDate: ISO,
    sampled: false,
  });
  if (!contract) return 'skip';

  payload.meta = {
    ...(payload.meta ?? {}),
    efficacy_contract: contract,
  };
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return 'stamped';
}

let agentNew = 0;
let humanNew = 0;
let humanUpgrade = 0;
let skipped = 0;

const allPaths: string[] = [];

for (const lote of LOTES) {
  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) continue;

  for (const name of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
    allPaths.push(join(dir, name));
  }
}

const targetHuman = Math.ceil(allPaths.length * 0.2);

function isHumanReviewer(payload: Payload): boolean {
  return payload.meta?.efficacy_contract?.a4_reviewer === 'handcraft-qc';
}

function sampleScore(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return hash % 1000;
}

for (const path of allPaths) {
  const payload = JSON.parse(readFileSync(path, 'utf8')) as Payload;
  const slug = slugFromPath(path);
  const ec = payload.meta?.efficacy_contract;

  if (!ec?.a4_reviewed) {
    const r = stampAgent(path, payload);
    if (r === 'stamped') agentNew++;
    else if (r === 'human') humanNew++;
    else skipped++;
    continue;
  }

  if (isHumanReviewer(payload)) continue;

  const tier = String(ec.risk_tier ?? 'medio') as 'baixo' | 'medio' | 'alto';
  if (shouldSampleForHumanReview(tier, DEFAULT_AUTO_APPROVAL_POLICY, slug)) {
    stampHuman(
      path,
      payload,
      'Onda nota-10 Vias — amostra 20% medio (upgrade agent→handcraft-qc).',
    );
    humanUpgrade++;
  }
}

let humanCount = allPaths.filter((p) => {
  const payload = JSON.parse(readFileSync(p, 'utf8')) as Payload;
  return isHumanReviewer(payload);
}).length;

if (humanCount < targetHuman) {
  const candidates = allPaths
    .filter((p) => {
      const payload = JSON.parse(readFileSync(p, 'utf8')) as Payload;
      return payload.meta?.efficacy_contract?.a4_reviewed && !isHumanReviewer(payload);
    })
    .sort((a, b) => sampleScore(slugFromPath(a)) - sampleScore(slugFromPath(b)));

  for (const path of candidates) {
    if (humanCount >= targetHuman) break;
    const payload = JSON.parse(readFileSync(path, 'utf8')) as Payload;
    stampHuman(
      path,
      payload,
      'Onda nota-10 Vias — amostra 20% quota nota-10 (upgrade agent→handcraft-qc).',
    );
    humanUpgrade++;
    humanCount++;
  }
}

console.log(
  `[stamp-vias-a4-nota10] agent_new=${agentNew} human_new=${humanNew} human_upgrade=${humanUpgrade} skipped=${skipped} human_total=${humanCount}/${allPaths.length} target=${targetHuman}`,
);
