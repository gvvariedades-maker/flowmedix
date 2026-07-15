#!/usr/bin/env tsx
/** A4 humano handcraft-qc — Saúde Mental (paridade Adolescente). */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  applyA4MinimoMitigation,
  auditA4Minimo,
  buildA4MinimoEfficacyContract,
} from '@/lib/catalogMigration/a4MinimoCore';
import { SAUDE_MENTAL_A4_MINIMO_CONFIG } from '@/lib/catalogMigration/saudeMentalA4Minimo';
import { buildEfficacyContractFromRisk, scoreQuestaoRisk } from '@/lib/catalogMigration/riskScoring';

const ISO = '2026-07-15';

const HUMAN_SLUGS: { slug: string; sampled: boolean; note: string }[] = [
  {
    slug: 'cpcon-uepb-enfermagem-atencao-basica-saude-da-familia-1778968207422-7',
    sampled: true,
    note: 'amostra 20% medio — RAPS/CAPS fluxo TM graves',
  },
  {
    slug: 'fgv-enfermagem-dependencia-quimica-1778967935713-2',
    sampled: true,
    note: 'amostra 20% medio — PNCT/tabagismo',
  },
  {
    slug: 'cev-urca-enfermagem-processo-de-enfermagem-1780006494066-8',
    sampled: true,
    note: 'amostra 20% medio — crise/condução',
  },
  {
    slug: 'ameosc-enfermagem-curativos-e-manejo-de-feridas-1779563517223-0',
    sampled: false,
    note: 'depressão idoso GDS — fonte tier A MS adicionada',
  },
  {
    slug: 'idecan-enfermagem-saude-mental-1780067024707-2',
    sampled: true,
    note: 'amostra 20% medio — crise psiquiátrica',
  },
  {
    slug: 'instituto-aocp-enfermagem-processo-de-enfermagem-1780004272097-2',
    sampled: false,
    note: 'psicofármacos/esquizofrenia — whitelist extrapiramidais',
  },
  {
    slug: 'legalle-enfermagem-processo-de-enfermagem-1780011967989-0',
    sampled: false,
    note: 'crise/epilepsia vs saúde mental — fonte tier A MS crise aguda',
  },
  {
    slug: 'fafipa-enfermagem-processo-de-enfermagem-1780009386446-4',
    sampled: false,
    note: 'VF sinais de alerta APS — whitelist acolhimento',
  },
];

const LOTES = [
  'saude-mental-micro-01-goldens',
  'saude-mental-micro-02-goldens',
  'saude-mental-micro-04-goldens',
  'saude-mental-micro-06-goldens',
  'saude-mental-micro-07-goldens',
  'saude-mental-completo',
];

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
    const audit = auditA4Minimo(SAUDE_MENTAL_A4_MINIMO_CONFIG, raw as never);
    const risk = applyA4MinimoMitigation(SAUDE_MENTAL_A4_MINIMO_CONFIG, base, audit, {
      autoApprovalEnabled: true,
    });
    const agentContract = buildA4MinimoEfficacyContract(SAUDE_MENTAL_A4_MINIMO_CONFIG, risk, audit, {
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
    console.log(`[stamp-saude-mental-a4-humano-qc] ${path}`);
  }
}

console.log('[stamp-saude-mental-a4-humano-qc] done');
