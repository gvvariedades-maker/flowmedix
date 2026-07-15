#!/usr/bin/env tsx
/**
 * Onda 2 pedagógica Vias — A4 substantivo:
 * - Humano: family=calc, exam_vs_current≠none, !agentA4Eligible, alto, amostra 20% só tier medio
 * - Remove quota artificial 20% do pacote (v1 nota-10)
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
const LOTES = Array.from({ length: 26 }, (_, i) =>
  `vias-de-administracao-g${String(i + 1).padStart(2, '0')}`,
);

type Payload = Record<string, unknown> & {
  meta?: Record<string, unknown> & {
    family?: string;
    content_review?: { exam_vs_current?: string };
    efficacy_contract?: Record<string, unknown>;
  };
};

function slugFromPath(path: string): string {
  return path.split(/[/\\]/).pop()?.replace(/\.json$/, '') ?? path;
}

function hasExamDivergence(payload: Payload): boolean {
  const ev = String(payload.meta?.content_review?.exam_vs_current ?? 'none').trim();
  return ev !== '' && ev !== 'none';
}

function humanReason(payload: Payload, slug: string, audit: ReturnType<typeof auditA4Minimo>): string | null {
  if (String(payload.meta?.family ?? '') === 'calc') return 'family=calc';
  if (hasExamDivergence(payload)) return `exam_vs_current=${payload.meta?.content_review?.exam_vs_current}`;

  const base = scoreQuestaoRisk(payload as never, { productionReady: true, autoApprovalEnabled: true });
  const risk = applyA4MinimoMitigation(VIAS_A4_MINIMO_CONFIG, base, audit, {
    autoApprovalEnabled: true,
  });

  if (risk.risk_tier === 'alto' || risk.approval_mode === 'human_required') {
    return `risk_${risk.risk_tier}`;
  }
  if (!audit.agentA4Eligible) {
    return audit.blockers.slice(0, 3).join('; ') || 'agent_ineligible';
  }
  if (
    risk.risk_tier === 'medio' &&
    shouldSampleForHumanReview('medio', DEFAULT_AUTO_APPROVAL_POLICY, slug)
  ) {
    return 'amostra_20pct_medio';
  }
  return null;
}

function stampHuman(path: string, payload: Payload, note: string): void {
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
      a4_human_notes: `Onda 2 pedagógica Vias — ${note}.`,
      sampled: true,
      a4_reviewed: true,
      auto_approved_at: ISO,
    },
  };
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function stampAgent(path: string, payload: Payload): void {
  const base = scoreQuestaoRisk(payload as never, { productionReady: true, autoApprovalEnabled: true });
  const audit = auditA4Minimo(VIAS_A4_MINIMO_CONFIG, payload as never);
  const risk = applyA4MinimoMitigation(VIAS_A4_MINIMO_CONFIG, base, audit, {
    autoApprovalEnabled: true,
  });
  const contract = buildA4MinimoEfficacyContract(VIAS_A4_MINIMO_CONFIG, risk, audit, {
    isoDate: ISO,
    sampled: false,
  });
  if (!contract) return;

  payload.meta = {
    ...(payload.meta ?? {}),
    efficacy_contract: contract,
  };
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

let human = 0;
let agent = 0;
let medioSample = 0;
let blockerHuman = 0;

for (const lote of LOTES) {
  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) continue;

  for (const name of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
    const path = join(dir, name);
    const payload = JSON.parse(readFileSync(path, 'utf8')) as Payload;
    const slug = slugFromPath(path);
    const audit = auditA4Minimo(VIAS_A4_MINIMO_CONFIG, payload as never);
    const reason = humanReason(payload, slug, audit);

    if (reason) {
      stampHuman(path, payload, reason);
      human++;
      if (reason === 'amostra_20pct_medio') medioSample++;
      else blockerHuman++;
    } else {
      stampAgent(path, payload);
      agent++;
    }
  }
}

const medioTotal = agent + human;
console.log(
  `[stamp-vias-a4-v2] human=${human} agent=${agent} medio_sample=${medioSample} blocker_human=${blockerHuman} total=${medioTotal}`,
);
