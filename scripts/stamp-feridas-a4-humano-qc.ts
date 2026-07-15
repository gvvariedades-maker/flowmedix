#!/usr/bin/env tsx
/** A4 humano handcraft-qc — Feridas e Queimaduras (paridade Adolescente). */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  applyA4MinimoMitigation,
  auditA4Minimo,
  buildA4MinimoEfficacyContract,
} from '@/lib/catalogMigration/a4MinimoCore';
import { FERIDAS_A4_MINIMO_CONFIG } from '@/lib/catalogMigration/feridasA4Minimo';
import { buildEfficacyContractFromRisk, scoreQuestaoRisk } from '@/lib/catalogMigration/riskScoring';

const ISO = '2026-07-14';

const HUMAN_SLUGS: { slug: string; sampled: boolean; note: string }[] = [
  {
    slug: 'idib-enfermagem-feridas-e-queimaduras-1778934936220-2',
    sampled: false,
    note: 'family=calc — SCQ 45% Wallace',
  },
  {
    slug: 'idecan-enfermagem-feridas-e-queimaduras-1780067013432-7',
    sampled: false,
    note: 'tier B classificação feridas — alto',
  },
  {
    slug: 'idecan-enfermagem-feridas-e-queimaduras-1780067013432-8',
    sampled: false,
    note: 'tier B cicatrização — alto',
  },
  {
    slug: 'idecan-enfermagem-feridas-e-queimaduras-1780067013432-9',
    sampled: true,
    note: 'amostra medio curativo bioativo',
  },
];

const LOTES = ['feridas-e-queimaduras-g01', 'feridas-e-queimaduras-completo'];

for (const { slug, sampled, note } of HUMAN_SLUGS) {
  for (const lote of LOTES) {
    const path = join('data/catalog-migration', lote, 'questions', `${slug}.json`);
    try {
      readFileSync(path, 'utf8');
    } catch {
      continue;
    }
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    const base = scoreQuestaoRisk(raw as never, { productionReady: true, autoApprovalEnabled: true });
    const audit = auditA4Minimo(FERIDAS_A4_MINIMO_CONFIG, raw as never);
    const risk = applyA4MinimoMitigation(FERIDAS_A4_MINIMO_CONFIG, base, audit, {
      autoApprovalEnabled: true,
    });
    const agentContract = buildA4MinimoEfficacyContract(FERIDAS_A4_MINIMO_CONFIG, risk, audit, {
      isoDate: ISO,
    });
    const humanBase = buildEfficacyContractFromRisk(risk, {
      reviewerAgent: 'handcraft-qc',
      sampled,
      isoDate: ISO,
    });
    const meta = { ...(raw.meta as Record<string, unknown>) };
    meta.efficacy_contract = {
      ...humanBase,
      ...(agentContract ?? {}),
      a4_reviewer: 'handcraft-qc',
      sampled,
      a4_reviewed: true,
      auto_approved_at: ISO,
      a4_human_notes: note,
    };
    raw.meta = meta;
    writeFileSync(path, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
    console.log(`[stamp-feridas-a4-humano-qc] ${path}`);
  }
}

console.log('[stamp-feridas-a4-humano-qc] done');
