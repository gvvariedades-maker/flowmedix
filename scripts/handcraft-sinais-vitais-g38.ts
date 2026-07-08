#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g38 (8 slugs P1 vitals_fr_faixas batch 2).
 * Fecha cluster FR e padrão respiratório (16 slugs — g37=8, g38=8).
 *
 *   npm run handcraft:sinais-vitais-g38
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g38';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN / SBP',
  title: 'Faixas de sinais vitais — repouso (adulto e pediátrico)',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'FR adulto 12–20 irpm',
    'taquipneia >20 irpm',
    'bradipneia <12 irpm',
    'Kussmaul · Cheyne-Stokes · Biot',
    'eupneia · apneia · dispneia',
    'FC adulto 60–100 bpm',
    'TEP pós-TVP — monitorar padrão respiratório',
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
    pedagogical_branch: 'vitals_fr_faixas',
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

const KUSSMAUL_SLIDES = [
  {
    type: 'concept_map',
    slide_title: 'Ritmo Kussmaul — acidose metabólica',
    meta: slideMeta,
    items: [
      {
        label: 'Comando da prova',
        detail:
          'Ritmo com aumento da frequência e da profundidade, causado por acidose metabólica (ex.: cetoacidose diabética).',
        icon: 'Target',
      },
      {
        label: 'Freq. + profundidade',
        detail:
          'Respiração rápida e profunda — compensação respiratória da acidose (eliminar CO₂).',
        icon: 'Wind',
      },
      {
        label: 'Kussmaul',
        detail:
          'Padrão clássico na CAD/DM descompensada — não confundir com taquipneia superficial.',
        icon: 'Activity',
      },
      {
        label: 'Pegadinha — taquipneia',
        detail: 'Letra D: FR alta sem especificar profundidade nem causa metabólica.',
        icon: 'Ban',
      },
      {
        label: 'Pegadinha — Cheyne-Stokes',
        detail: 'Letra E: ciclos crescente/decrescente com apneia — não é o caso.',
        icon: 'AlertTriangle',
      },
    ],
    footer_rule: 'Acidose metabólica + rápida e profunda = Kussmaul',
  },
  {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta,
    steps: [
      'Comando: ritmo com FR e profundidade aumentadas por acidose metabólica (ex. CAD).',
      'Decodificar: compensação respiratória — eliminar CO₂ na acidose.',
      'Testar A — hiperventilação: termo genérico; prova pede nome do ritmo (Kussmaul) → eliminar.',
      'Testar B — Biot: respiração irregular com pausas (neurológica) → eliminar.',
      'Testar D — taquipneia: só FR alta; não descreve profundidade nem acidose → eliminar.',
      'Testar E — Cheyne-Stokes: ciclos com apneia central → eliminar.',
      'Testar C — Kussmaul: rápida, profunda, acidose metabólica → candidata.',
      'Marcar C.',
    ],
    footer_rule: 'Kussmaul → letra C',
  },
  {
    type: 'golden_rule',
    slide_title: 'Referência — ritmos respiratórios',
    meta: slideMeta,
    content: 'PADRÕES ESPECIAIS × FR NUMÉRICA',
    rows: [
      { label: 'Kussmaul', value: 'Rápida + profunda · acidose metabólica', sv_kind: 'fr', badge: 'hot' },
      { label: 'Cheyne-Stokes', value: 'Ciclos crescente/decrescente + apneia', sv_kind: 'fr', badge: 'ok' },
      { label: 'Biot', value: 'Irregular com pausas (lesão neurológica)', sv_kind: 'fr', badge: 'warn' },
      { label: 'Taquipneia', value: 'FR > 20 irpm (adulto)', sv_kind: 'fr', badge: 'ok' },
      { label: 'FR adulto normal', value: '12 a 20 irpm — eupneia', sv_kind: 'fr', badge: 'ok' },
    ],
    footer_rule: 'Nome do ritmo ≠ só contar irpm',
  },
  {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta,
    content: 'PEGADINHAS — KUSSMAUL IDIB',
    items: [
      {
        label: 'Letra A — hiperventilação',
        detail: 'Termo amplo para ventilação aumentada.',
        correct:
          'Hiperventilação é genérica — o enunciado ancora acidose metabólica e pede o ritmo específico Kussmaul.',
      },
      {
        label: 'Letra B — Biot',
        detail: 'Respiração atáxica com pausas irregulares.',
        correct:
          'Biot associa-se a lesão do tronco cerebral — não à compensação da acidose metabólica descrita.',
      },
      {
        label: 'Letra D — taquipneia',
        detail: 'Apenas frequência respiratória elevada.',
        correct:
          'Taquipneia é FR >20 irpm sem exigir profundidade nem vínculo com acidose — Kussmaul une os três elementos.',
      },
      {
        label: 'Letra E — Cheyne-Stokes',
        detail: 'Padrão periódico com apneia central.',
        correct:
          'Cheyne-Stokes alterna hiperpneia e apneia em ciclos — diferente do ritmo profundo contínuo da acidose.',
      },
    ],
    footer_rule: 'Só Kussmaul fecha acidose + profunda',
  },
];

const SPECS: Record<string, Pack> = {
  'idib-enfermagem-verificacao-de-sinais-vitais-1778934863952-8': {
    family: 'protocolo',
    guideline:
      'Potter/MS — Kussmaul: respiração rápida e profunda na acidose metabólica · taquipneia >20 irpm · Cheyne-Stokes com apneia',
    roi_error: 'interpretacao_sv_errada',
    slides: KUSSMAUL_SLIDES,
  },

  'idib-enfermagem-verificacao-de-sinais-vitais-1779344105099-3': {
    family: 'protocolo',
    guideline:
      'Potter/MS — Kussmaul: respiração rápida e profunda na acidose metabólica (CAD) · taquipneia >20 · bradipneia <12',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        ...KUSSMAUL_SLIDES[0],
        slide_title: 'Kussmaul — cetoacidose diabética',
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Ritmo respiratório com aumento de frequência e profundidade por acidose metabólica — exemplo CAD.',
            icon: 'Target',
          },
          {
            label: 'Acidose metabólica',
            detail: 'Organismo compensa aumentando ventilação alveolar para excretar CO₂.',
            icon: 'FlaskConical',
          },
          {
            label: 'Kussmaul',
            detail: 'Respiração profunda tipo “suspiro” — padrão clássico na CAD.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — hiperventilação',
            detail: 'Letra A: termo genérico sem nomear o ritmo de prova.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — taquipneia',
            detail: 'Letra D: só elevação numérica da FR.',
            icon: 'AlertTriangle',
          },
        ],
      },
      KUSSMAUL_SLIDES[1],
      KUSSMAUL_SLIDES[2],
      {
        ...KUSSMAUL_SLIDES[3],
        content: 'PEGADINHAS — KUSSMAUL CAD',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779344089179-8': {
    family: 'protocolo',
    guideline:
      'MS/Potter — Kussmaul: respirações rápidas, profundas, sem pausa, tipo suspiro · taquipneia >20 · Cheyne-Stokes cíclico',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Padrão Kussmaul — caso clínico',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Respirações anormalmente rápidas e profundas, sem pausa, forçadas, tipo suspiro — classificar o padrão.',
            icon: 'Target',
          },
          {
            label: 'Rápida + profunda',
            detail: 'Sem pausa entre ciclos — hiperventilação alveolar compensatória.',
            icon: 'Wind',
          },
          {
            label: 'Tipo suspiro',
            detail: 'Amplitude aumentada — marca registrada do ritmo de Kussmaul.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — taquipneia',
            detail: 'Letra B: só frequência alta; não descreve profundidade nem suspiro.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — Cheyne-Stokes',
            detail: 'Letra D: alternância com apneia — ausente no caso.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Rápida + profunda + suspiro = Kussmaul',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar respiração rápida, profunda, sem pausa, tipo suspiro.',
          'Testar A — hiperpneia: volume aumentado isolado; caso traz ritmo completo → eliminar.',
          'Testar B — taquipneia: FR >20 sem profundidade obrigatória → eliminar.',
          'Testar D — Cheyne-Stokes: ciclos com apneia → eliminar.',
          'Testar C — respiração Kussmaul: rápida, profunda, contínua, suspiro → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'Kussmaul → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Kussmaul × taquipneia',
        meta: slideMeta,
        content: 'RITMO × FREQUÊNCIA',
        rows: [
          { label: 'Kussmaul', value: 'Rápida + profunda + sem pausa (suspiro)', sv_kind: 'fr', badge: 'hot' },
          { label: 'Taquipneia', value: 'FR > 20 irpm (adulto)', sv_kind: 'fr', badge: 'ok' },
          { label: 'Hiperpneia', value: 'Volume respiratório aumentado', sv_kind: 'fr', badge: 'warn' },
          { label: 'Cheyne-Stokes', value: 'Ciclos com apneia central', sv_kind: 'fr', badge: 'ok' },
          { label: 'FR normal adulto', value: '12 a 20 irpm', sv_kind: 'fr', badge: 'ok' },
        ],
        footer_rule: 'Descreva ritmo antes de rotular só taqui',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONSULPLAN KUSSMAUL',
        items: [
          {
            label: 'Letra A — hiperpneia',
            detail: 'Aumento isolado do volume respiratório.',
            correct:
              'Hiperpneia foca amplitude — o caso descreve ritmo rápido, profundo e contínuo típico de Kussmaul.',
          },
          {
            label: 'Letra B — taquipneia',
            detail: 'Frequência respiratória acima do normal.',
            correct:
              'Taquipneia é FR >20 irpm sem exigir profundidade nem padrão de suspiro — insuficiente para o quadro completo.',
          },
          {
            label: 'Letra D — Cheyne-Stokes',
            detail: 'Respiração periódica com apneia.',
            correct:
              'Cheyne-Stokes apresenta pausas apneicas entre ciclos — enunciado explicita respiração sem pausa.',
          },
        ],
        footer_rule: 'Só Kussmaul fecha o caso',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779344122526-2': {
    family: 'conceito',
    guideline:
      'MS — FC adulto 60–100 bpm normocárdico · taquicardia >100 · FR adulto 12–20 irpm · taquipneia >20 · bradipneia <12',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC × termo — não misturar',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Completar: frequência cardíaca de ___ bpm está ___. Par número + classificação correta.',
            icon: 'Target',
          },
          {
            label: 'Primeiro campo = FC',
            detail: 'Valor em batimentos por minuto — comparar com faixa 60–100.',
            icon: 'HeartPulse',
          },
          {
            label: 'Segundo campo = ritmo cardíaco',
            detail: 'Normocárdico, taquicárdico ou bradicárdico — não termos de FR.',
            icon: 'Activity',
          },
          {
            label: 'Gabarito D',
            detail: '80 bpm dentro de 60–100 → normocárdico.',
            icon: 'CheckCircle',
          },
          {
            label: 'Pegadinha — termos de FR',
            detail: 'Letras A e B usam taquipneico/bradipneico para valores de FC/FR misturados.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'FC com termo cardíaco · FR com termo respiratório',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: completar FC (bpm) + classificação coerente.',
          'Lembrar: taquipneia/bradipneia são de FR; normocárdico/taquicárdico são de FC.',
          'Testar A — par com termo respiratório (taquipneico) na lacuna de FC → eliminar.',
          'Testar B — par incoerente: valor de FR alta com bradipneia → eliminar.',
          'Testar C — FC na faixa normal rotulada como taquicárdico → eliminar.',
          'Testar D — 80 bpm na faixa cardíaca normal → normocárdico → candidata.',
          'Marcar D.',
        ],
        footer_rule: '80 bpm normocárdico → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FC e FR adulto',
        meta: slideMeta,
        content: 'NÃO TROQUE CARDÍACO × RESPIRATÓRIO',
        rows: [
          { label: 'FC normal', value: '60 a 100 bpm — normocárdico', sv_kind: 'fc', badge: 'hot' },
          { label: 'Taquicardia', value: 'FC > 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR normal', value: '12 a 20 irpm — eupneia', sv_kind: 'fr', badge: 'ok' },
          { label: 'Taquipneia', value: 'FR > 20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Bradipneia', value: 'FR < 12 irpm', sv_kind: 'fr', badge: 'ok' },
        ],
        footer_rule: 'Leia se o enunciado pede FC ou FR',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FC + TERMO ERRADO',
        items: [
          {
            label: 'Letra A — taquipneico na lacuna de FC',
            detail: 'Termo respiratório no lugar da classificação cardíaca.',
            correct:
              'Taquipneico classifica FR — enunciado pede completar frequência cardíaca com termo de ritmo cardíaco.',
          },
          {
            label: 'Letra B — bradipneico com valor alto',
            detail: 'Bradipneia com número incoerente para FR.',
            correct:
              'Bradipneia é FR <12 irpm — par da letra B mistura valor de FR com termo respiratório na lacuna de FC.',
          },
          {
            label: 'Letra C — taquicárdico com FC normal',
            detail: 'FC dentro da faixa normal rotulada como taquicardia.',
            correct:
              'FC entre 60–100 bpm é normocárdico — taquicardia exige FC >100 bpm.',
          },
        ],
        footer_rule: 'Só D pareia número e termo certos',
      },
    ],
  },

  'isba-enfermagem-verificacao-de-sinais-vitais-1779344253939-2': {
    family: 'conceito',
    guideline: 'MS — eupneia: FR 12–20 irpm ritmo regular · taquipneia >20 · bradipneia <12 · apneia = ausência de respiração',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Eupneia — respiração normal',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Paciente com respiração dentro dos parâmetros normais — qual termo?',
            icon: 'Target',
          },
          {
            label: 'Parâmetros normais',
            detail: 'Adulto: FR 12–20 irpm, ritmo regular, sem esforço.',
            icon: 'Wind',
          },
          {
            label: 'Eupneico',
            detail: 'Eu- (bom) + -pneia: respiração adequada e confortável.',
            icon: 'CheckCircle',
          },
          {
            label: 'Pegadinha — taquipneia',
            detail: 'Letra A: FR acima do normal (>20 irpm).',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — dispneia',
            detail: 'Letra D: sensação subjetiva de falta de ar — não é sinônimo de normal.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Dentro da faixa = eupneico',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: respiração dentro dos parâmetros normais.',
          'Referência MS: adulto 12–20 irpm, ritmo regular → eupneia.',
          'Testar A — taquipneico: FR elevada → eliminar.',
          'Testar B — apneico: sem respiração → eliminar.',
          'Testar D — dispneico: falta de ar subjetiva → eliminar.',
          'Testar E — bradipneico: FR baixa (<12) → eliminar.',
          'Testar C — eupneico: respiração normal → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'Normal → eupneico → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação FR',
        meta: slideMeta,
        content: 'ADULTO — DECORE',
        rows: [
          { label: 'Eupneia', value: 'FR 12 a 20 irpm · ritmo regular', sv_kind: 'fr', badge: 'hot' },
          { label: 'Taquipneia', value: 'FR > 20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Bradipneia', value: 'FR < 12 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Apneia', value: 'Ausência de movimentos respiratórios', sv_kind: 'fr', badge: 'warn' },
          { label: 'Dispneia', value: 'Dificuldade respiratória subjetiva', sv_kind: 'fr', badge: 'warn' },
        ],
        footer_rule: 'Eupneia = número + conforto',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EUPNEIA ISBA',
        items: [
          {
            label: 'Letra A — taquipneico',
            detail: 'Frequência respiratória acelerada.',
            correct:
              'Taquipneia é FR >20 irpm — oposto de “dentro dos parâmetros normais” do enunciado.',
          },
          {
            label: 'Letra B — apneico',
            detail: 'Ausência de respiração.',
            correct:
              'Apneia é parada respiratória — paciente do comando respira normalmente.',
          },
          {
            label: 'Letra D — dispneico',
            detail: 'Sensação de falta de ar.',
            correct:
              'Dispneia é subjetiva (desconforto) — não define FR numérica normal; eupneia fecha o parâmetro objetivo.',
          },
          {
            label: 'Letra E — bradipneico',
            detail: 'Frequência respiratória abaixo do normal.',
            correct:
              'Bradipneia é FR <12 irpm — não corresponde a respiração dentro da faixa normal adulta.',
          },
        ],
        footer_rule: 'Só eupneico fecha normal',
      },
    ],
  },

  'omni-enfermagem-verificacao-de-sinais-vitais-1779344253939-1': {
    family: 'conceito',
    guideline: 'MS — bradipneia: FR < 12 irpm · taquipneia >20 · apneia = parada · ortopneia = dispneia ao deitar',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Bradipneia — FR baixa',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Alternativa correspondente à frequência respiratória abaixo do normal.',
            icon: 'Target',
          },
          {
            label: 'Abaixo do normal',
            detail: 'Adulto: FR < 12 irpm — bradipneia.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — apneia',
            detail: 'Letra A: ausência total de respiração — mais grave que bradi.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — taquipneia',
            detail: 'Letra D: FR acima do normal — oposto do comando.',
            icon: 'XCircle',
          },
          {
            label: 'Pegadinha — ortopneia',
            detail: 'Letra C: dispneia em decúbito — não é classificação numérica.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'FR < 12 irpm = bradipneia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: FR abaixo do normal no adulto.',
          'Referência: <12 irpm = bradipneia.',
          'Testar A — apneia: parada respiratória → eliminar.',
          'Testar C — ortopneia: dispneia ao deitar → eliminar.',
          'Testar D — taquipneia: FR alta → eliminar.',
          'Testar B — bradipneia: FR abaixo do normal → candidata.',
          'Marcar B.',
        ],
        footer_rule: 'Abaixo do normal → bradipneia → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FR adulto',
        meta: slideMeta,
        content: 'LIMITES NUMÉRICOS',
        rows: [
          { label: 'Bradipneia', value: 'FR < 12 irpm', sv_kind: 'fr', badge: 'hot' },
          { label: 'Eupneia', value: 'FR 12 a 20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Taquipneia', value: 'FR > 20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Apneia', value: '0 irpm — sem movimento respiratório', sv_kind: 'fr', badge: 'warn' },
          { label: 'Ortopneia', value: 'Dispneia ao deitar', sv_kind: 'fr', badge: 'warn' },
        ],
        footer_rule: 'Conte antes de rotular',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BRADIPNEIA OMNI',
        items: [
          {
            label: 'Letra A — apneia',
            detail: 'Ausência de movimentos respiratórios.',
            correct:
              'Apneia é FR zero — bradipneia ainda há respiração, só abaixo de 12 irpm.',
          },
          {
            label: 'Letra C — ortopneia',
            detail: 'Dispneia em posição deitada.',
            correct:
              'Ortopneia descreve sintoma postural — não responde a “FR abaixo do normal”.',
          },
          {
            label: 'Letra D — taquipneia',
            detail: 'Frequência respiratória acima de 20 irpm.',
            correct:
              'Taquipneia é FR elevada — oposto direto do comando “abaixo do normal”.',
          },
        ],
        footer_rule: 'Só bradipneia fecha FR baixa',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1778969729218-6': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — TVP: risco de TEP · monitorar dispneia, taquipneia, dor torácica, hemoptise · FR adulto 12–20 irpm',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TVP — vigilar TEP',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Prescrição: observar padrão respiratório e informar dispneia/cianose em paciente com TVP — qual o propósito?',
            icon: 'Target',
          },
          {
            label: 'TVP',
            detail: 'Trombose venosa profunda — trombo em membro pode embolizar.',
            icon: 'Activity',
          },
          {
            label: 'Risco de TEP',
            detail: 'Tromboembolia pulmonar — manifesta-se com alteração respiratória aguda.',
            icon: 'Wind',
          },
          {
            label: 'Sinais de alerta',
            detail: 'Dispneia, taquipneia, dor torácica, cianose — comunicar imediatamente.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — fisioterapia brônquica',
            detail: 'Letra A: trombo não é “reabsorvido pela árvore brônquica”.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'TVP → monitorar respiração por risco de TEP',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: paciente com TVP — prescrição de observar padrão respiratório + dispneia/cianose.',
          'Raciocínio clínico: embolia pulmonar é complicação grave da TVP.',
          'Testar A — fisioterapia para migrar trombo à árvore brônquica: absurdo fisiopatológico → eliminar.',
          'Testar B — evitar teste de perfusão: não explica monitorização respiratória → eliminar.',
          'Testar C — Bandl/Bancroft horário: teste de TVP, não propósito da prescrição respiratória → eliminar.',
          'Testar E — cianose em MMII pela escala de Braden: Braden é risco de lesão por pressão → eliminar.',
          'Testar D — verificar padrão respiratório pelo risco de TEP → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Monitorar FR por risco de TEP → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — TVP × TEP',
        meta: slideMeta,
        content: 'CUIDADO DE ENFERMAGEM',
        rows: [
          { label: 'TVP', value: 'Trombose venosa profunda — membro', sv_kind: 'meta', badge: 'ok' },
          { label: 'TEP', value: 'Embolia pulmonar — emergência respiratória', sv_kind: 'fr', badge: 'hot' },
          { label: 'Monitorar', value: 'Padrão respiratório · dispneia · cianose', sv_kind: 'fr', badge: 'hot' },
          { label: 'FR adulto', value: '12 a 20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Comunicar', value: 'Alteração respiratória aguda ao enfermeiro', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Respiração muda → pensar em TEP pós-TVP',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TVP VUNESP',
        items: [
          {
            label: 'Letra A — fisioterapia brônquica',
            detail: 'Migrar trombo para reabsorção brônquica.',
            correct:
              'Trombo venoso não é eliminado pela árvore brônquica — prescrição visa detectar TEP, não “fisioterapia de migração”.',
          },
          {
            label: 'Letra B — evitar perfusão',
            detail: 'Não testar enchimento capilar.',
            correct:
              'Evitar perfusão não justifica monitorar padrão respiratório — foco da prescrição é embolia pulmonar.',
          },
          {
            label: 'Letra C — Bandeira e Bancroft',
            detail: 'Teste de TVP a cada hora.',
            correct:
              'Bandl/Bancroft avaliam refluxo venoso — prescrição trata de sinais respiratórios de TEP, não diagnóstico de TVP.',
          },
          {
            label: 'Letra E — Braden nos MMII',
            detail: 'Cianose em membros pela escala de Braden.',
            correct:
              'Braden mede risco de LPP — não substitui vigilância respiratória por TEP em paciente com TVP.',
          },
        ],
        footer_rule: 'Só D fecha o propósito clínico',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1778969760552-8': {
    family: 'conceito',
    guideline:
      'MS — apneia = 0 irpm · bradipneia <12 · eupneia 12–20 · taquipneia >20 · dispneia subjetiva',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Três momentos — classificar FR',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Adulto: momento 1 = 0 rpm · momento 2 = 10 rpm · momento 3 = 20 rpm — sequência correta de termos.',
            icon: 'Target',
          },
          {
            label: 'Momento 1 — 0 rpm',
            detail: 'Ausência de movimentos respiratórios → apneia.',
            icon: 'Ban',
          },
          {
            label: 'Momento 2 — 10 rpm',
            detail: 'Abaixo de 12 irpm → bradipneia.',
            icon: 'Wind',
          },
          {
            label: 'Momento 3 — 20 rpm',
            detail: 'Limite superior da eupneia (12–20) → eupneia.',
            icon: 'CheckCircle',
          },
          {
            label: 'Pegadinha — taquipneia no 3º',
            detail: '20 irpm ainda é eupneia; taquipneia exige >20.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '0 → apneia · 10 → bradi · 20 → eupneia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar três aferições sequenciais de FR em adulto.',
          'Momento 1: 0 rpm → apneia.',
          'Momento 2: 10 rpm → abaixo de 12 → bradipneia.',
          'Momento 3: 20 rpm → dentro de 12–20 → eupneia (limite superior, não taquipneia).',
          'Sequência correta: apneia, bradipneia, eupneia.',
          'Testar A/B/C/E — combinações com dispneia, taquipneia ou eupneia no momento 1 → eliminar.',
          'Testar D — apneia, bradipneia, eupneia → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'D = apneia · bradipneia · eupneia',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — limites FR adulto',
        meta: slideMeta,
        content: 'CONTE E ROTULE CADA MOMENTO',
        rows: [
          { label: 'Apneia', value: '0 irpm — sem respiração', sv_kind: 'fr', badge: 'hot' },
          { label: 'Bradipneia', value: 'FR < 12 irpm', sv_kind: 'fr', badge: 'hot' },
          { label: 'Eupneia', value: 'FR 12 a 20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Taquipneia', value: 'FR > 20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Caso — 0 · 10 · 20', value: 'Apneia · bradipneia · eupneia', sv_kind: 'meta', badge: 'hot' },
        ],
        footer_rule: '20 irpm ainda é eupneia no adulto',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TRÊS MOMENTOS VUNESP',
        items: [
          {
            label: 'Letra A — dispneia no 1º momento',
            detail: 'Sequência dispneia, apneia, bradipneia.',
            correct:
              '0 rpm é apneia objetiva — dispneia é subjetiva e não descreve parada respiratória no momento 1.',
          },
          {
            label: 'Letra B — eupneia no momento 1',
            detail: 'Sequência eupneia, apneia, taquipneia.',
            correct:
              'Momento 1 com 0 rpm não pode ser eupneia — há apneia antes da bradicardia respiratória do momento 2.',
          },
          {
            label: 'Letra C — dispneia com eupneia no 3º',
            detail: 'Dispneia, bradipneia, eupneia — erra o 1º momento.',
            correct:
              'Primeiro valor é 0 irpm (apneia) — dispneia no início não fecha a tríade numérica da prova.',
          },
          {
            label: 'Letra E — taquipneia no 1º',
            detail: 'Taquipneia, dispneia, apneia — inverte toda a sequência.',
            correct:
              '0 rpm é apneia, não taquipneia; 20 rpm no 3º momento é eupneia, não apneia.',
          },
        ],
        footer_rule: 'Só D fecha os três números',
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
    console.log(`[handcraft:sv-g38] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g38] total=${ok}`);
}

main();
