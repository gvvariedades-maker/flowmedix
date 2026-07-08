#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g43 (1 slug SHORT LOTE vitals_temperatura final).
 * Cluster Temperatura — vias e febre (33 slugs — g39=8, g40=8, g41=8, g42=8, g43=1).
 *
 *   npm run handcraft:sinais-vitais-g43
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g43';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN',
  title: 'Temperatura corporal — trauma, estresse e termorregulação',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'ansiedade → taquicardia (ativação simpática)',
    'trauma grave → hipotermia (tríade letal)',
    'politrauma não implica febre automática',
    'taquipneia >30 irpm = sinal de alerta em trauma',
    'fratura exposta ≠ pulso ausente obrigatório',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: {
    instruction: string;
    text_fragment?: string;
    options: { id: string; text: string; is_correct: boolean }[];
  };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo';
  guideline: string;
  exam_vs_current?: string;
  roi_error: string;
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: 'vitals_temperatura',
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      roi_error: pack.roi_error,
    },
    sources: [SV_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779344089179-7': {
    family: 'protocolo',
    guideline:
      'MS/ATLS — ansiedade → FC aumenta · politrauma → hipotermia (não elevação automática) · FR >30 irpm = alerta · fratura exposta ≠ pulso ausente obrigatório',
    roi_error: 'trauma_sv_temperatura_ansiedade',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV no trauma — o que a banca cobra',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Completar afirmativa correta sobre sinais vitais em paciente vítima de trauma.',
            icon: 'Target',
          },
          {
            label: 'Ansiedade × FC',
            detail: 'Estresse/ansiedade ativam simpático → frequência cardíaca tende a subir.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — temperatura no trauma',
            detail: 'Letra C sugere febre em politrauma — trauma grave costuma hipotermia.',
            icon: 'Snowflake',
          },
          {
            label: 'Pegadinha — FR >30',
            detail: 'Letra D nega risco com taquipneia — FR elevada é sinal de gravidade.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — pulso na fratura',
            detail: 'Letra E generaliza ausência de pulso — nem toda fratura exposta isquemia.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Trauma mistura SV — leia cada alternativa isolada',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre SV em paciente vítima de trauma.',
          'Testar A — ansiedade aumenta FC: ativação simpática → taquicardia leve → verdadeiro.',
          'Testar B — alcoolizados e PA diastólica “zerar”: exagero absoluto → eliminar.',
          'Testar C — politraumatizados e temperatura subir: trauma grave cursa com hipotermia, não febre automática → eliminar.',
          'Testar D — FR >30 rpm sem risco: taquipneia é sinal de alerta em trauma → eliminar.',
          'Testar E — fratura exposta e pulso ausente: nem toda fratura exposta perde pulso distal → eliminar.',
          'Marcar A.',
        ],
        footer_rule: 'Gabarito VUNESP = ansiedade eleva FC',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — trauma × SV',
        meta: slideMeta,
        content: 'TRAUMA NÃO ELEVA TEMPERATURA POR PADRÃO',
        rows: [
          { label: 'Estresse/ansiedade', value: 'Ativação simpática → FC tende a subir', sv_kind: 'fc', badge: 'ok' },
          { label: 'Politrauma', value: 'Risco de hipotermia — não febre automática', sv_kind: 'temp', badge: 'hot' },
          { label: 'FR >30 irpm', value: 'Taquipneia — sinal de alerta', sv_kind: 'fr', badge: 'warn' },
          { label: 'Fratura exposta', value: 'Avaliar pulso — ausência não é regra fixa', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Letra C inverte termorregulação no trauma',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SV TRAUMA VUNESP',
        items: [
          {
            label: 'Letra B — alcoolizados',
            detail: 'Alcoolizados, a pressão diastólica tende a zerar.',
            correct:
              'Álcool pode alterar PA, mas diastólica “zerar” é exagero absoluto — não é afirmativa correta de SV.',
          },
          {
            label: 'Letra C — politraumatizados',
            detail: 'Politraumatizados, a temperatura corporal tende a se elevar.',
            correct:
              'Trauma grave expõe à hipotermia (tríade: acidose, coagulopatia, hipotermia) — elevação térmica não é regra.',
          },
          {
            label: 'Letra D — FR >30 rpm',
            detail: 'Com frequência respiratória superior a 30 rpm, não há risco.',
            correct:
              'Taquipneia >30 irpm em trauma indica instabilidade respiratória — há risco, não “ausência de risco”.',
          },
          {
            label: 'Letra E — fratura exposta',
            detail: 'Com fratura exposta, o pulso no membro afetado estará ausente.',
            correct:
              'Fratura exposta exige avaliar perfusão, mas pulso ausente não é consequência obrigatória em todos os casos.',
          },
        ],
        footer_rule: 'Só A fecha ansiedade → taquicardia',
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
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sv-g43] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g43] total=${ok}`);
}

main();
