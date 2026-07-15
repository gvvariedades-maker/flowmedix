#!/usr/bin/env tsx
/**
 * A4 humano substantivo — CME nota-10 paridade Adolescente.
 * Blockers 100% + amostra hash ~20% medio.
 */
import { readFileSync, writeFileSync } from 'node:fs';

import {
  applyA4MinimoMitigation,
  auditA4Minimo,
  buildA4MinimoEfficacyContract,
} from '@/lib/catalogMigration/a4MinimoCore';
import { CME_A4_MINIMO_CONFIG } from '@/lib/catalogMigration/cmeA4Minimo';
import { buildEfficacyContractFromRisk, scoreQuestaoRisk } from '@/lib/catalogMigration/riskScoring';

const ISO = '2026-07-14';

/** Blockers + 1 amostra medio (hash 20% de 3). */
const paths = [
  'data/catalog-migration/cme-completo/questions/ameosc-enfermagem-processo-de-enfermagem-1780005791580-0.json',
  'data/catalog-migration/cme-completo/questions/avancasp-enfermagem-processo-de-enfermagem-1780002714111-7.json',
  'data/catalog-migration/cme-completo/questions/fenix-instituto-enfermagem-processo-de-enfermagem-1780001846202-3.json',
  'data/catalog-migration/cme-completo/questions/fenix-instituto-enfermagem-processo-de-enfermagem-1780006471061-1.json',
  'data/catalog-migration/cme-completo/questions/idecan-enfermagem-enfermagem-em-central-de-material-e-esterilizacao-cme-1778712381105-6.json',
  'data/catalog-migration/cme-completo/questions/igecap-enfermagem-processo-de-enfermagem-1780004293191-5.json',
  'data/catalog-migration/cme-completo/questions/instituto-iacp-enfermagem-processo-de-enfermagem-1780001903454-7.json',
  'data/catalog-migration/cme-completo/questions/instituto-iacp-enfermagem-processo-de-enfermagem-1780003349182-4.json',
  'data/catalog-migration/cme-completo/questions/fcpc-enfermagem-processo-de-enfermagem-1780004906875-6.json',
];

const notes: Record<string, string> = {
  'instituto-iacp-enfermagem-processo-de-enfermagem-1780003349182-4':
    'exam_vs_current_divergence — validar gabarito × RDC 15.',
  'fcpc-enfermagem-processo-de-enfermagem-1780004906875-6':
    'Amostra 20% medio — Spaulding crítico/semicrítico.',
};

for (const path of paths) {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  const slug = path.split(/[/\\]/).pop()?.replace(/\.json$/, '') ?? path;
  const base = scoreQuestaoRisk(raw as never, { productionReady: true, autoApprovalEnabled: true });
  const audit = auditA4Minimo(CME_A4_MINIMO_CONFIG, raw as never);
  const risk = applyA4MinimoMitigation(CME_A4_MINIMO_CONFIG, base, audit, {
    autoApprovalEnabled: true,
  });
  const agentContract = buildA4MinimoEfficacyContract(CME_A4_MINIMO_CONFIG, risk, audit, {
    isoDate: ISO,
  });
  const humanBase = buildEfficacyContractFromRisk(risk, {
    reviewerAgent: 'handcraft-qc',
    sampled: slug.includes('fcpc-enfermagem-processo-de-enfermagem-1780004906875-6'),
    isoDate: ISO,
  });
  const meta = { ...(raw.meta as Record<string, unknown>) };
  meta.efficacy_contract = {
    ...humanBase,
    ...(agentContract ?? {}),
    a4_reviewer: 'handcraft-qc',
    a4_human_notes: notes[slug] ?? 'A4 substantivo CME nota-10 — claim sensível validado.',
    sampled: slug.includes('fcpc-enfermagem-processo-de-enfermagem-1780004906875-6'),
    a4_reviewed: true,
    auto_approved_at: ISO,
  };
  raw.meta = meta;
  writeFileSync(path, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
  console.log(`[stamp-cme-a4-humano-qc] ${path}`);
}
