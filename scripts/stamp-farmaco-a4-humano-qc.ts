#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'node:fs';

import {
  applyA4MinimoMitigation,
  auditA4Minimo,
  buildA4MinimoEfficacyContract,
} from '@/lib/catalogMigration/a4MinimoCore';
import { FARMACO_A4_MINIMO_CONFIG } from '@/lib/catalogMigration/farmacoA4Minimo';
import { buildEfficacyContractFromRisk, scoreQuestaoRisk } from '@/lib/catalogMigration/riskScoring';

const paths = [
  'data/catalog-migration/farmacodinamica-e-farmacocinetica-completo/questions/idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-6.json',
  'data/catalog-migration/farmacodinamica-e-farmacocinetica-completo/questions/idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-7.json',
  'data/catalog-migration/farmacodinamica-e-farmacocinetica-completo/questions/quadrix-enfermagem-cuidados-na-administracao-de-medicamentos-1778969018962-1.json',
  'data/catalog-migration/farmacodinamica-e-farmacocinetica-g01/questions/idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-6.json',
  'data/catalog-migration/farmacodinamica-e-farmacocinetica-g01/questions/idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-7.json',
  'data/catalog-migration/farmacodinamica-e-farmacocinetica-g01/questions/quadrix-enfermagem-cuidados-na-administracao-de-medicamentos-1778969018962-1.json',
];

for (const path of paths) {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  const base = scoreQuestaoRisk(raw as never, { productionReady: true, autoApprovalEnabled: true });
  const audit = auditA4Minimo(FARMACO_A4_MINIMO_CONFIG, raw as never);
  const risk = applyA4MinimoMitigation(FARMACO_A4_MINIMO_CONFIG, base, audit, {
    autoApprovalEnabled: true,
  });
  const agentContract = buildA4MinimoEfficacyContract(FARMACO_A4_MINIMO_CONFIG, risk, audit, {
    isoDate: '2026-07-14',
  });
  const humanBase = buildEfficacyContractFromRisk(risk, {
    reviewerAgent: 'handcraft-qc',
    sampled: true,
    isoDate: '2026-07-14',
  });
  const meta = { ...(raw.meta as Record<string, unknown>) };
  meta.efficacy_contract = {
    ...humanBase,
    ...(agentContract ?? {}),
    a4_reviewer: 'handcraft-qc',
    sampled: true,
    a4_reviewed: true,
    auto_approved_at: '2026-07-14',
  };
  raw.meta = meta;
  writeFileSync(path, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
  console.log(`[stamp-farmaco-a4-humano-qc] ${path}`);
}
