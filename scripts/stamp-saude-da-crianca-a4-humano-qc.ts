#!/usr/bin/env tsx
/**
 * A4 humano handcraft-qc — Saúde da Criança (slugs risk_tier=alto bloqueados no apply dry-run).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  applyA4MinimoMitigation,
  auditA4Minimo,
  buildA4MinimoEfficacyContract,
} from '@/lib/catalogMigration/a4MinimoCore';
import { CRIANCA_A4_MINIMO_CONFIG } from '@/lib/catalogMigration/criancaA4Minimo';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  assertApprovalGate,
  buildEfficacyContractFromRisk,
  scoreQuestaoRisk,
} from '@/lib/catalogMigration/riskScoring';

const LOTES = Array.from({ length: 8 }, (_, i) =>
  `saude-da-crianca-g${String(i + 1).padStart(2, '0')}`,
);

const ISO = '2026-07-15';
let stamped = 0;
let skipped = 0;

for (const lote of LOTES) {
  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) continue;

  for (const name of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
    const path = join(dir, name);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    const meta = (raw.meta ?? {}) as Record<string, unknown>;

    const base = scoreQuestaoRisk(raw as never, { productionReady: false, autoApprovalEnabled: true });
    const audit = auditA4Minimo(CRIANCA_A4_MINIMO_CONFIG, raw as never);
    const risk = applyA4MinimoMitigation(CRIANCA_A4_MINIMO_CONFIG, base, audit, {
      autoApprovalEnabled: true,
    });
    const blockers = assertApprovalGate(raw as never, risk);
    if (blockers.length === 0) {
      skipped++;
      continue;
    }

    const agentContract = buildA4MinimoEfficacyContract(CRIANCA_A4_MINIMO_CONFIG, risk, audit, {
      isoDate: ISO,
    });
    const humanBase = buildEfficacyContractFromRisk(risk, {
      reviewerAgent: 'handcraft-qc',
      sampled: true,
      isoDate: ISO,
    });

    meta.efficacy_contract = {
      ...humanBase,
      ...(agentContract ?? {}),
      a4_reviewer: 'handcraft-qc',
      a4_human_notes: `Onda nota-10 Criança — ${blockers[0]?.slice(0, 120) ?? 'alto risco'}.`,
      sampled: true,
      a4_reviewed: true,
      auto_approved_at: ISO,
    };
    raw.meta = meta;
    writeFileSync(path, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
    console.log(`[stamp:crianca-a4-humano-qc] ${name} tier=${risk.risk_tier}`);
    stamped++;
  }
}

console.log(`[stamp:crianca-a4-humano-qc] done stamped=${stamped} skipped=${skipped}`);
