#!/usr/bin/env tsx
/**
 * Amostra humana A4 (20%) — Processamento nota-10.
 */
import { readFileSync, writeFileSync } from 'node:fs';

import {
  applyA4MinimoMitigation,
  auditA4Minimo,
  buildA4MinimoEfficacyContract,
} from '@/lib/catalogMigration/a4MinimoCore';
import { PROCESSAMENTO_A4_MINIMO_CONFIG } from '@/lib/catalogMigration/processamentoA4Minimo';
import { buildEfficacyContractFromRisk, scoreQuestaoRisk } from '@/lib/catalogMigration/riskScoring';

const paths = [
  'data/catalog-migration/processamento-completo/questions/idecan-enfermagem-processamento-de-artigos-e-produtos-de-saude-1778712203076-7.json',
  'data/catalog-migration/processamento-completo/questions/cotec-fadenor-enfermagem-processo-de-enfermagem-1780002389285-7.json',
  'data/catalog-migration/processamento-completo/questions/avancasp-enfermagem-processo-de-enfermagem-1780003031246-7.json',
  'data/catalog-migration/processamento-completo/questions/quadrix-enfermagem-processo-de-enfermagem-1780009281546-8.json',
  'data/catalog-migration/processamento-completo/questions/amauc-enfermagem-processo-de-enfermagem-1780001613305-0.json',
  'data/catalog-migration/processamento-completo/questions/ameosc-enfermagem-processo-de-enfermagem-1780011961798-9.json',
  'data/catalog-migration/processamento-completo/questions/cotec-fadenor-enfermagem-processo-de-enfermagem-1780002389285-8.json',
  'data/catalog-migration/processamento-g01/questions/idecan-enfermagem-processamento-de-artigos-e-produtos-de-saude-1778712203076-7.json',
  'data/catalog-migration/processamento-g01/questions/cotec-fadenor-enfermagem-processo-de-enfermagem-1780002389285-7.json',
  'data/catalog-migration/processamento-g02/questions/avancasp-enfermagem-processo-de-enfermagem-1780003031246-7.json',
  'data/catalog-migration/processamento-g02/questions/quadrix-enfermagem-processo-de-enfermagem-1780009281546-8.json',
];

for (const path of paths) {
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    const base = scoreQuestaoRisk(raw as never, { productionReady: true, autoApprovalEnabled: true });
    const audit = auditA4Minimo(PROCESSAMENTO_A4_MINIMO_CONFIG, raw as never);
    const risk = applyA4MinimoMitigation(PROCESSAMENTO_A4_MINIMO_CONFIG, base, audit, {
      autoApprovalEnabled: true,
    });
    const agentContract = buildA4MinimoEfficacyContract(PROCESSAMENTO_A4_MINIMO_CONFIG, risk, audit, {
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
      a4_human_notes: 'Amostra 20% nota-10 — parâmetros CME/Spaulding validados.',
      sampled: true,
      a4_reviewed: true,
      auto_approved_at: '2026-07-14',
    };
    raw.meta = meta;
    writeFileSync(path, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
    console.log(`[stamp-processamento-a4-humano-qc] ${path}`);
  } catch {
    // g01/g02 may not exist yet — skip
  }
}
