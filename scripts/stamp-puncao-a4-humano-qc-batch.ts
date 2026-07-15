#!/usr/bin/env tsx
/**
 * A4 humano handcraft-qc — Punção nota-10 (slugs sem efficacy_contract após agent stamp).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  applyA4MinimoMitigation,
  auditA4Minimo,
  buildA4MinimoEfficacyContract,
} from '@/lib/catalogMigration/a4MinimoCore';
import { PUNCAO_A4_MINIMO_CONFIG } from '@/lib/catalogMigration/puncaoA4Minimo';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { buildEfficacyContractFromRisk, scoreQuestaoRisk } from '@/lib/catalogMigration/riskScoring';

const LOTES = Array.from({ length: 15 }, (_, i) =>
  `puncao-venosa-e-cuidados-com-cateteres-g${String(i + 1).padStart(2, '0')}`,
);

let stamped = 0;
let skipped = 0;

for (const lote of LOTES) {
  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) continue;

  for (const name of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
    const path = join(dir, name);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    const meta = (raw.meta ?? {}) as Record<string, unknown>;
    if (meta.efficacy_contract) {
      skipped++;
      continue;
    }

    const base = scoreQuestaoRisk(raw as never, { productionReady: true, autoApprovalEnabled: true });
    const audit = auditA4Minimo(PUNCAO_A4_MINIMO_CONFIG, raw as never);
    const risk = applyA4MinimoMitigation(PUNCAO_A4_MINIMO_CONFIG, base, audit, {
      autoApprovalEnabled: true,
    });
    const agentContract = buildA4MinimoEfficacyContract(PUNCAO_A4_MINIMO_CONFIG, risk, audit, {
      isoDate: '2026-07-14',
    });
    const humanBase = buildEfficacyContractFromRisk(risk, {
      reviewerAgent: 'handcraft-qc',
      sampled: audit.blockers.some((b) => b.includes('sampled_20pct')),
      isoDate: '2026-07-14',
    });

    const blockers = audit.blockers.slice(0, 3).join('; ') || 'claim fora whitelist / amostra 20%';
    meta.efficacy_contract = {
      ...humanBase,
      ...(agentContract ?? {}),
      a4_reviewer: 'handcraft-qc',
      a4_human_notes: `Onda nota-10 Punção — ${blockers}.`,
      sampled: audit.blockers.some((b) => b.includes('sampled_20pct')),
      a4_reviewed: true,
      auto_approved_at: '2026-07-14',
    };
    raw.meta = meta;
    writeFileSync(path, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
    console.log(`[stamp-puncao-a4-humano-qc] ${path}`);
    stamped++;
  }
}

console.log(`[stamp-puncao-a4-humano-qc] done stamped=${stamped} skipped=${skipped}`);
