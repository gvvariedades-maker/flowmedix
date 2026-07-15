#!/usr/bin/env tsx
/**
 * Repair handcraft golden-v1 — calculo g12-repair (3 slugs missing from batch union).
 *
 *   npx tsx scripts/handcraft-calculo-de-administracao-de-medicamentos-e-infusoes-g12-repair.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'calculo-de-administracao-de-medicamentos-e-infusoes-g12-repair';
const SUBTOPICO = 'Cálculo de Administração de Medicamentos e Infusões';
const BRANCH = 'calc_dose_equivalencia';
const REVIEWED = '2026-07-15';

const CALC_SOURCE = {
  id: 'calc-equivalencias-br',
  tier: 'A' as const,
  issuer: 'COFEN / referência técnica enfermagem',
  title: 'Cálculo de administração de medicamentos e infusões',
  year: 2021,
  url: 'https://www.cofen.gov.br/',
  covers: [
    'mg/kg',
    'regra de três',
    'diluição C₁V₁',
    'gts/min fator 20',
    'microgotas fator 60',
    '1 mL = 20 gotas',
    'concentração mg/mL',
    'reconstituição e rediluição',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'calc' | 'conceito';
  branch?: string;
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(
  q: Q,
  family: string,
  guideline: string,
  slug: string,
  branch: string,
  roiError?: string,
  examVsCurrent = 'none',
) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: branch,
    content_standard: 'golden-v1',
    family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: guideline,
      exam_vs_current: examVsCurrent,
      catalog_slug: slug,
      ...(roiError ? { roi_error: roiError } : {}),
    },
    sources: [CALC_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'fepese-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056309743-4': {
    family: 'calc',
    guideline: 'SF 1.000 mL / 12 h — macrogotas (V×20)÷720 ≈ 28 gts/min',
    roi_error: 'tempo_em_horas_sem_converter_minutos',
    exam_vs_current: 'conta da prova — 1.000 mL SF 0,9% em 12 h → ~28 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SF 1.000 mL — 12 horas',
        meta: slideMeta,
        items: [
          {
            label: 'Volume prescrito',
            detail: '1.000 mL de soro fisiológico 0,9% — numerador da fórmula de gotejamento.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo em horas',
            detail: '12 horas → converter em 720 minutos antes de dividir.',
            icon: 'Clock',
          },
          {
            label: 'Equipo macrogotas',
            detail: 'Fator 20 — 1 mL = 20 gotas; padrão quando não há microgotas no enunciado.',
            icon: 'Gauge',
          },
          {
            label: 'Fórmula canônica',
            detail: 'gts/min = (volume × 20) ÷ tempo em minutos.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Dividir por 12 (horas) em vez de 720 (minutos) — reduz o fluxo pela metade.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão FEPESE neste tema',
            detail: 'Infusão de grande volume: converter h→min, arredondar para alternativa mais próxima.',
            icon: 'Target',
          },
        ],
        footer_rule: '12 h = 720 min | gts/min = (1.000 × 20) ÷ 720 ≈ 28',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: SF 0,9% 1.000 mL para correr em 12 horas — gts/min aproximado.',
          'Converter tempo: 12 h × 60 = 720 minutos.',
          'Aplicar macrogotas: gts/min = (1.000 × 20) ÷ 720.',
          'Calcular: 20.000 ÷ 720 = 27,78 gotas por minuto.',
          'Arredondar para alternativa mais próxima: D = aproximadamente 28 gotas por minuto.',
          'Eliminar A (6): fluxo irreal — divide volume por horas sem fator 20 ou minutos.',
          'Eliminar B (12): metade do fluxo correto — tempo efetivo dobrado (~1.440 min).',
          'Eliminar C (24): tempo menor (~833 min) ou volume reduzido na conta.',
          'Eliminar E (48): tempo superestimado (~416 min) ou confunde microgotas parcialmente.',
          'Localizar alternativa D = aproximadamente 28 gotas por minuto.',
          'Marcar D.',
          'Fixação: horas → minutos (×60) antes de (V×20)÷tempo.',
        ],
        footer_rule: 'Roteiro: 12 h → 720 min → (1.000×20)/720 ≈ 28 → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — SF 1.000 mL / 12 h',
        meta: slideMeta,
        content: '(1.000 × 20) ÷ 720',
        rows: [
          { label: 'Volume', value: '1.000 mL SF 0,9%', badge: 'ok' },
          { label: 'Tempo', value: '12 h = 720 min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator', value: '20 gotas/mL (macrogotas)', badge: 'ok' },
          { label: 'Fórmula', value: 'gts/min = (V × 20) ÷ min', badge: 'hot' },
          { label: 'Conta', value: '(1.000 × 20) ÷ 720 = 27,78 ≈ 28', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 6 gts/min', value: 'esquece fator 20 ou divide só por horas', badge: 'warn' },
          { label: 'Arredondamento', value: 'prova pede “aproximado” — 27,78 → 28', badge: 'info' },
        ],
        footer_rule: 'Macrogotas: (mL × 20) ÷ minutos, arredonde',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SF 1.000 mL / 12 HORAS',
        items: [
          {
            label: 'Letra A — 6 gotas/min',
            detail: 'Fluxo irreal — divide 1.000 por horas sem converter em minutos nem aplicar fator 20.',
            correct: '(1.000×20)÷720 ≈ 28 gts/min — não 6.',
          },
          {
            label: 'Letra B — 12 gotas/min',
            detail: 'Metade do fluxo correto — equivale a usar ~1.440 min em vez de 720.',
            correct: 'Com 720 min e fator 20, o fluxo aproxima 28 — não 12.',
          },
          {
            label: 'Letra C — 24 gotas/min',
            detail: 'Tempo efetivo menor (~833 min) ou volume reduzido na equação.',
            correct: '1.000 mL em 720 min com fator 20 rende ~28 gts/min.',
          },
          {
            label: 'Letra E — 48 gotas/min',
            detail: 'Tempo superestimado (~416 min) — como se a infusão durasse ~7 h em vez de 12 h.',
            correct: '12 h = 720 min → (1.000×20)/720 ≈ 28 — não 48.',
          },
          {
            label: 'Em outra banca — microgotas',
            detail: 'Se o equipo for microgotas, troque fator 20 por 60.',
            correct: 'Enunciado não cita microgotas — use fator 20 (macrogotas).',
          },
        ],
        footer_rule: 'Horas × 60 = minutos — depois (V × 20) ÷ min',
      },
    ],
  },

  'instituto-aocp-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056284398-2': {
    family: 'calc',
    guideline: 'Dexametasona 6 mg — frasco 10 mg/2,5 mL = 4 mg/mL → 1,5 mL',
    roi_error: 'nao_derivar_mg_ml_ou_confundir_frasco_inteiro',
    exam_vs_current: 'conta da prova — 6 mg EV, ampola 10 mg/2,5 mL → 1,5 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dexametasona — 6 mg em mL',
        meta: slideMeta,
        items: [
          {
            label: 'Dose prescrita',
            detail: '6 mg de dexametasona EV — alvo em miligramas no setor pediátrico.',
            icon: 'Syringe',
          },
          {
            label: 'Frasco-ampola disponível',
            detail: '10 mg em 2,5 mL — apresentação comercial da farmácia.',
            icon: 'FlaskConical',
          },
          {
            label: 'Concentração',
            detail: '10 mg ÷ 2,5 mL = 4 mg/mL — derive antes da regra de três.',
            icon: 'Calculator',
          },
          {
            label: 'Volume necessário',
            detail: '6 mg ÷ 4 mg/mL = 1,5 mL a aspirar.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Aspirar 2,5 mL (frasco inteiro = 10 mg) ou confundir 10 mg/mL.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão AOCP neste tema',
            detail: 'Pediatria: frasco mg/mL — regra de três ou dose ÷ concentração.',
            icon: 'Target',
          },
        ],
        footer_rule: '10 mg/2,5 mL = 4 mg/mL | 6 mg = 1,5 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 6 mg dexametasona EV — frasco-ampola 10 mg/2,5 mL — resposta em mL.',
          'Conferir apresentação: ampola comercial 10 mg em 2,5 mL disponível na farmácia.',
          'Derivar concentração: 10 mg ÷ 2,5 mL = 4 mg/mL.',
          'Aplicar regra de três: 6 mg ── X mL | 10 mg ── 2,5 mL.',
          'Resolver: X = (6 × 2,5) ÷ 10 = 15 ÷ 10 = 1,5 mL. Ou: 6 ÷ 4 = 1,5 mL.',
          'Eliminar A (0,5 mL): subdose — 0,5 × 4 = 2 mg, faltam 4 mg.',
          'Eliminar B (3 mL): superestima — 3 × 4 = 12 mg (dose dobrada).',
          'Eliminar C (1,2 mL): 4,8 mg — usa concentração 5 mg/mL sem base.',
          'Eliminar D (0,2 mL): 0,8 mg — escala decimal errada.',
          'Localizar alternativa E = 1,5 mL.',
          'Marcar E.',
          'Fixação: sempre converta frasco mg/mL antes de calcular volume da dose.',
        ],
        footer_rule: 'Roteiro: 10/2,5 = 4 mg/mL → 6÷4 = 1,5 mL → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — dexametasona 6 mg',
        meta: slideMeta,
        content: '6 mg ÷ 4 mg/mL',
        rows: [
          { label: 'Frasco', value: '10 mg em 2,5 mL', badge: 'ok' },
          { label: 'Concentração', value: '4 mg/mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Prescrito', value: '6 mg EV', badge: 'info' },
          { label: 'Volume', value: '6 ÷ 4 = 1,5 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Regra de três', value: '6 mg ── 1,5 mL | 10 mg ── 2,5 mL', badge: 'ok' },
          { label: 'Erro 0,5 mL', value: '2 mg — subdose de 4 mg', badge: 'warn' },
          { label: 'Erro 3 mL', value: '12 mg — frasco quase inteiro, dose dobrada', badge: 'warn' },
        ],
        footer_rule: 'mg prescritos ÷ mg/mL = mL — conferir concentração primeiro',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEXAMETASONA 6 mg / 10 mg-2,5 mL',
        items: [
          {
            label: 'Letra A — 0,5 mL',
            detail: 'Subdose — 0,5 mL × 4 mg/mL = 2 mg, faltam 4 mg.',
            correct: '6 mg exigem 1,5 mL na concentração 4 mg/mL.',
          },
          {
            label: 'Letra B — 3 mL',
            detail: 'Superestima — 3 mL × 4 = 12 mg (dose dobrada).',
            correct: '6 mg ÷ 4 mg/mL = 1,5 mL — não 3 mL.',
          },
          {
            label: 'Letra C — 1,2 mL',
            detail: '4,8 mg — usa 5 mg/mL (10÷2) em vez de 4 mg/mL (10÷2,5).',
            correct: 'Concentração correta: 10 mg/2,5 mL = 4 mg/mL → 1,5 mL.',
          },
          {
            label: 'Letra D — 0,2 mL',
            detail: '0,8 mg — escala decimal errada ou divide 2,5 por 10 sem cruzar dose.',
            correct: 'Regra de três: (6×2,5)/10 = 1,5 mL — única resposta coerente.',
          },
          {
            label: 'Em outra banca — frasco inteiro',
            detail: 'Aspirar 2,5 mL entrega 10 mg — dose completa do frasco.',
            correct: '6 mg é 60% de 10 mg → 60% de 2,5 mL = 1,5 mL.',
          },
        ],
        footer_rule: '10 mg/2,5 mL = 4 mg/mL — 6 mg = 1,5 mL',
      },
    ],
  },

  'isba-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056265348-0': {
    family: 'calc',
    guideline: 'Equivalência mL→gotas — 5 mL × 20 = 100 gotas (macrogotas padrão BR)',
    roi_error: 'usar_fator_30_ou_60_em_vez_de_20',
    exam_vs_current: 'conta da prova — 5 mL em gotas (macrogotas) = 100',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Equivalente de 5 mL em gotas',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'O equivalente de 5 mL em gotas — conversão direta sem infusão.',
            icon: 'Droplets',
          },
          {
            label: 'Fator macrogotas',
            detail: '1 mL = 20 gotas — padrão brasileiro quando não há microgotas.',
            icon: 'Gauge',
          },
          {
            label: 'Fórmula',
            detail: 'gotas = volume (mL) × 20 gotas/mL.',
            icon: 'Calculator',
          },
          {
            label: 'Resultado',
            detail: '5 × 20 = 100 gotas.',
            icon: 'Equal',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Usar fator 30 (150) ou 40 (200) — fatores inventados sem base normativa.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão ISBA neste tema',
            detail: 'Decore de equivalência: mL × 20 = gotas (macrogotas).',
            icon: 'Target',
          },
        ],
        footer_rule: '5 mL × 20 gotas/mL = 100 gotas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: “O equivalente de 5 mL em gotas” — conversão direta mL → gotas.',
          'Recuperar constante: 1 mL = 20 gotas (macrogotas padrão BR).',
          'Aplicar: gotas = 5 mL × 20 gotas/mL = 100 gotas.',
          'Eliminar A (150): usa fator 30 gotas/mL — não é padrão técnico BR.',
          'Eliminar B (200): usa fator 40 — dobra o fator correto.',
          'Eliminar C (190): valor sem relação com 5 mL × fator padrão.',
          'Eliminar E (Nenhuma): 100 gotas está entre as alternativas — letra D fecha.',
          'Localizar alternativa D = 100.',
          'Marcar D.',
          'Fixação: mL → gotas multiplica por 20; gotas → mL divide por 20.',
        ],
        footer_rule: 'Roteiro: 5 × 20 = 100 gotas → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — equivalência mL/gotas',
        meta: slideMeta,
        content: '5 mL × 20',
        rows: [
          { label: 'Volume', value: '5 mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator macrogotas', value: '20 gotas/mL', badge: 'ok' },
          { label: 'Fórmula', value: 'gotas = mL × 20', badge: 'hot' },
          { label: 'Resultado', value: '5 × 20 = 100 gotas', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 150', value: 'fator 30 — não adotado em prova técnica BR', badge: 'warn' },
          { label: 'Erro 200', value: 'fator 40 — dobra o fator padrão', badge: 'warn' },
          { label: 'Microgotas', value: '1 mL = 60 microgotas — só se enunciado pedir', badge: 'info' },
        ],
        footer_rule: 'Macrogotas: mL × 20 = gotas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 5 mL EM GOTAS',
        items: [
          {
            label: 'Letra A — 150',
            detail: 'Usa fator 30 gotas/mL (5×30) — não é convenção padrão BR.',
            correct: 'Padrão técnico: 1 mL = 20 gotas → 5×20 = 100.',
          },
          {
            label: 'Letra B — 200',
            detail: 'Usa fator 40 (5×40) — dobra o fator macrogotas correto.',
            correct: '5 mL × 20 gotas/mL = 100 gotas — não 200.',
          },
          {
            label: 'Letra C — 190',
            detail: 'Valor intermediário sem base — não deriva de fator 20 nem 60.',
            correct: 'Conta fechada: 5 × 20 = 100 gotas exatas.',
          },
          {
            label: 'Letra E — Nenhuma das respostas',
            detail: 'Alternativa D (100) fecha a equivalência padrão — “nenhuma” é falsa.',
            correct: '100 gotas = 5 mL × 20 — marque letra D.',
          },
          {
            label: 'Em outra banca — microgotas',
            detail: 'Se pedir microgotas: 5 × 60 = 300 — fator diferente.',
            correct: 'Enunciado pede “gotas” sem micro — use fator 20.',
          },
        ],
        footer_rule: '5 mL × 20 = 100 gotas — macrogotas padrão BR',
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
      meta: metaBase(
        raw,
        pack.family,
        pack.guideline,
        slug,
        pack.branch ?? BRANCH,
        pack.roi_error,
        pack.exam_vs_current ?? 'none',
      ),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:calculo-g12-repair] OK ${slug}`);
  }
  console.log(`[handcraft:calculo-g12-repair] total=${ok}`);
}

main();
