#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g09 (1 slug final · urgencias_rcp_sbv).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  metaBase,
  slideMeta,
  type Pack,
  type Q,
} from './lib/urgenciasRcpGolden';

const LOTE = 'urgencias-g09';
const REVIEWER = 'handcraft-urgencias-g09';

type Family = Pack['family'] | 'certo_errado';
type PackExt = Omit<Pack, 'family'> & { family: Family };

const SPECS: Record<string, PackExt> = {
  'igeduc-enfermagem-urgencias-e-emergencias-1777104070286-7': {
    family: 'certo_errado',
    guideline: 'Pós-VAA — compressões contínuas com ventilação a cada 6 s (não 1/2 s)',
    roi_error: 'rcp_vaa_ventilacao_6s',
    cluster: 'Certo ou errado — RCP com via aérea avançada confirmada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'RCP pós-intubação',
        meta: slideMeta,
        items: [
          {
            label: 'Via aérea avançada',
            detail: 'Tubo confirmado e fixado — RCP prossegue com compressões torácicas contínuas.',
            icon: 'Wind',
          },
          {
            label: 'Compressões',
            detail: 'Contínuas sem pausas prolongadas para ventilar.',
            icon: 'HeartPulse',
          },
          {
            label: 'Ventilação',
            detail: 'Aproximadamente uma a cada seis segundos — não a cada dois.',
            icon: 'Timer',
          },
          {
            label: 'Pegadinha — 1 ventilação/2 s',
            detail: 'Ritmo hiperventilatório após intubação — ERRADO.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Evitar hiperventilação pós-VAA',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Após via aérea avançada fixada: compressões contínuas + 1 ventilação a cada 2 s?',
          'Com VAA, ventilar ~a cada 6 s — não a cada 2 s.',
          'Hiperventilação prejudica retorno venoso e perfusão coronariana.',
          'Afirmativa falsa.',
          'Marcar B (Errado).',
        ],
        footer_rule: '6 s entre ventilações com VAA',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PÓS-VAA — ADULTO',
        rows: [
          { label: 'Compressões', value: 'Contínuas de alta qualidade', badge: 'hot' },
          { label: 'Ventilação', value: '~1 a cada 6 s — não 1/2 s', badge: 'warn' },
          { label: 'Sem VAA', value: '30:2 ou 30 compressões : 2 ventilações', badge: 'ok' },
        ],
        footer_rule: 'Confirmar tubo — depois ritmo ventilatório adequado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VAA E VENTILAÇÃO',
        items: [
          {
            label: 'Certo — ventilar a cada 2 s',
            detail: 'Uma ventilação a cada dois segundos após intubação.',
            correct: 'Errado — após via aérea avançada, ventilar aproximadamente a cada seis segundos.',
          },
          {
            label: 'Pegadinha — hiperventilar',
            detail: 'Parece agressivo e “oxigenar mais”.',
            correct: 'Compressões contínuas com ventilação espaçada — ritmo da prova é Errado.',
          },
        ],
        footer_rule: 'Gabarito B — Errado',
      },
    ],
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const meta = metaBase(
      raw,
      pack.family,
      pack.guideline,
      slug,
      pack.roi_error,
      pack.cluster,
      REVIEWER,
    );
    const out = {
      meta,
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g09] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g09] total=${ok}`);
}

main();
