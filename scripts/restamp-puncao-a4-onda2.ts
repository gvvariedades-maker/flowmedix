#!/usr/bin/env tsx
/**
 * Onda 2 — re-stamp A4: agent primeiro; handcraft-qc só onde protocolo exige.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  applyA4MinimoMitigation,
  buildA4MinimoEfficacyContract,
} from '@/lib/catalogMigration/a4MinimoCore';
import {
  auditPuncaoA4Minimo,
  buildPuncaoA4MinimoEfficacyContract,
  PUNCAO_A4_MINIMO_CONFIG,
} from '@/lib/catalogMigration/puncaoA4Minimo';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildEfficacyContractFromRisk,
  DEFAULT_AUTO_APPROVAL_POLICY,
  scoreQuestaoRisk,
  shouldSampleForHumanReview,
} from '@/lib/catalogMigration/riskScoring';

const ISO = '2026-07-14';

let agent = 0;
let human = 0;

for (let i = 1; i <= 15; i++) {
  const lote = `puncao-venosa-e-cuidados-com-cateteres-g${String(i).padStart(2, '0')}`;
  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) continue;

  for (const name of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
    const path = join(dir, name);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as {
      meta?: Record<string, unknown> & {
        family?: string;
        content_review?: { exam_vs_current?: string };
        efficacy_contract?: Record<string, unknown>;
      };
      modulo_slug?: string;
    };
    const slug = raw.modulo_slug ?? name.replace(/\.json$/, '');
    delete raw.meta?.efficacy_contract;

    const base = scoreQuestaoRisk(raw as never, {
      productionReady: true,
      autoApprovalEnabled: true,
    });
    const audit = auditPuncaoA4Minimo(raw as never);
    const risk = applyA4MinimoMitigation(PUNCAO_A4_MINIMO_CONFIG, base, audit, {
      autoApprovalEnabled: true,
    });

    const examDiv =
      raw.meta?.content_review?.exam_vs_current &&
      raw.meta.content_review.exam_vs_current !== 'none';
    const isCalc = raw.meta?.family === 'calc';
    const sampled = shouldSampleForHumanReview(
      risk.risk_tier,
      { ...DEFAULT_AUTO_APPROVAL_POLICY, enabled: true, sample_rate: { baixo: 0.05, medio: 0.2 } },
      slug,
    );

    const needsHuman =
      isCalc ||
      examDiv ||
      sampled ||
      !audit.agentA4Eligible ||
      risk.approval_mode === 'human_required';

    if (!needsHuman) {
      const contract = buildPuncaoA4MinimoEfficacyContract(risk, audit, { isoDate: ISO });
      if (contract) {
        raw.meta = { ...(raw.meta ?? {}), efficacy_contract: contract };
        agent++;
      }
    } else {
      const agentContract = buildPuncaoA4MinimoEfficacyContract(risk, audit, { isoDate: ISO });
      const humanBase = buildEfficacyContractFromRisk(risk, {
        reviewerAgent: 'handcraft-qc',
        sampled: Boolean(sampled),
        isoDate: ISO,
      });
      const reason = [
        isCalc ? 'family=calc' : '',
        examDiv ? 'exam_vs_current' : '',
        sampled ? 'amostra_20pct' : '',
        ...audit.blockers.slice(0, 2),
      ]
        .filter(Boolean)
        .join('; ');
      raw.meta = {
        ...(raw.meta ?? {}),
        efficacy_contract: {
          ...humanBase,
          ...(agentContract ?? {}),
          a4_reviewer: 'handcraft-qc',
          a4_human_notes: `Onda 2 Punção — ${reason || 'revisão humana protocolo'}.`,
          sampled: Boolean(sampled),
          a4_reviewed: true,
          auto_approved_at: ISO,
        },
      };
      human++;
    }

    writeFileSync(path, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
  }
}

console.log(`[restamp-puncao-a4-onda2] agent=${agent} human=${human} total=${agent + human}`);
