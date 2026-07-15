#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — calculo-de-administracao-de-medicamentos-e-infusoes-g03 (8 slugs).
 *
 *   npx tsx scripts/handcraft-calculo-de-administracao-de-medicamentos-e-infusoes-g03.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'calculo-de-administracao-de-medicamentos-e-infusoes-g03';
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
    'insulina U-100',
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
  'cogeps-unioeste-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056301382-2': {
    family: 'calc',
    guideline: 'Infusão microgotas — (V×60)÷minutos; 500 mL em 8 h ≈ 63 microgts/min',
    roi_error: 'usar_fator_20_macrogotas',
    exam_vs_current: 'conta da prova — SG 5% 500 mL, 8 horas, microgotas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SG 5% — infusão em microgotas',
        meta: slideMeta,
        items: [
          {
            label: 'Volume prescrito',
            detail: '500 mL de soro glicosado 5% — numerador da fórmula de gotejamento.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo em horas',
            detail: '8 horas → converter em 480 minutos antes de dividir.',
            icon: 'Clock',
          },
          {
            label: 'Equipo microgotas',
            detail: 'Fator 60 — 1 mL = 60 microgotas; enunciado pede microgotas/min.',
            icon: 'Gauge',
          },
          {
            label: 'Fórmula microgotas',
            detail: 'microgts/min = (volume × 60) ÷ tempo em minutos.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Aplicar fator 20 (macrogotas) ou dividir por 8 horas sem ×60.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão COGEPS neste tema',
            detail: 'Infusão simples com resposta em microgotas — fator 60 obrigatório.',
            icon: 'Target',
          },
        ],
        footer_rule: 'Microgotas: 8 h = 480 min | (500 × 60) ÷ 480 ≈ 63',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: infusão IV com resposta em microgotas por minuto.',
          'Converter tempo: 8 h × 60 = 480 minutos.',
          'Fixar fator microgotas: 1 mL = 60 microgotas.',
          'Aplicar fórmula: microgts/min = (500 × 60) ÷ 480 = 30.000 ÷ 480 = 62,5.',
          'Arredondar para alternativa mais próxima: E = 63 microgotas por minuto.',
          'Eliminar A (28): fluxo muito baixo — possível uso de macrogotas ou tempo inflado.',
          'Eliminar B (167) e C (84): superestimam fluxo — fator ou divisor errado.',
          'Eliminar D (21): valor típico de macrogotas (fator 20) — não microgotas.',
          'Marcar E.',
          'Fixação: microgotas = fator 60; macrogotas = fator 20 — leia o equipo no enunciado.',
        ],
        footer_rule: 'Roteiro: 480 min → (500×60)/480 ≈ 63 → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — microgotas/min',
        meta: slideMeta,
        content: '(V × 60) ÷ min',
        rows: [
          { label: 'Fator microgotas', value: '60 microgotas/mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator macrogotas', value: '20 gotas/mL (não usar aqui)', badge: 'warn' },
          { label: 'Tempo', value: '8 h = 480 min', badge: 'ok' },
          { label: 'Fórmula', value: 'microgts/min = (V × 60) ÷ min', badge: 'hot' },
          { label: 'SG 5% — conta', value: '(500 × 60) ÷ 480 = 62,5 ≈ 63', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 21', value: '(500×20)/480 ≈ 21 — macrogotas', badge: 'warn' },
          { label: 'Arredondamento', value: '62,5 → 63 microgts/min', badge: 'info' },
        ],
        footer_rule: 'Microgotas: multiplique volume por 60, divida pelos minutos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 500 mL / 8 H (MICROGOTAS)',
        items: [
          {
            label: 'Letra A — 28 microgts/min',
            detail: 'Fluxo baixo — divisor ou fator superestimado (~1.070 min efetivos).',
            correct: 'Com fator 60 e 480 min, o fluxo aproxima 63 — não 28.',
          },
          {
            label: 'Letra B — 167 microgts/min',
            detail: 'Quase o triplo do correto — divide por minutos em vez de multiplicar fator.',
            correct: '(500×60)/480 = 62,5 — B superestima o fluxo.',
          },
          {
            label: 'Letra C — 84 microgts/min',
            detail: 'Metade entre macrogotas e microgotas — fator híbrido inventado.',
            correct: 'Microgotas puras com fator 60 rendem ~63/min.',
          },
          {
            label: 'Letra D — 21 microgts/min',
            detail: 'Valor de macrogotas (fator 20) aplicado ao enunciado de microgotas.',
            correct: '(500×20)/480 ≈ 21 gts/min — aqui pede microgotas: 63.',
          },
          {
            label: 'Em outra banca — macrogotas',
            detail: 'Se o enunciado pedir gotas/min sem “micro”, use fator 20.',
            correct: 'Leia o equipo: microgota 60 | macrogota 20 por mL.',
          },
        ],
        footer_rule: 'Microgotas: fator 60 — não confunda com macrogotas (20)',
      },
    ],
  },

  'cogeps-unioeste-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056301382-3': {
    family: 'calc',
    guideline: 'Keflin 600 mg — frasco 1 g diluído em 5 mL → 200 mg/mL → 3 mL',
    roi_error: 'nao_converter_g_para_mg',
    exam_vs_current: 'conta da prova — 600 mg de 1 g liofilizado em 5 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Keflin — regra de três mg/mL',
        meta: slideMeta,
        items: [
          {
            label: 'Dose prescrita',
            detail: '600 mg de Keflin — alvo da regra de três.',
            icon: 'Pill',
          },
          {
            label: 'Frasco-ampola',
            detail: '1 g liofilizado = 1.000 mg — converter gramas antes da conta.',
            icon: 'FlaskConical',
          },
          {
            label: 'Diluente',
            detail: '5 mL de água para injeção — volume final total da solução.',
            icon: 'Droplets',
          },
          {
            label: 'Concentração final',
            detail: '1.000 mg ÷ 5 mL = 200 mg/mL após reconstituição.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Dividir 600 por 5 sem converter 1 g → resposta em g/mL.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão COGEPS neste tema',
            detail: 'Liofilizado 1 g + 5 mL → aspirar mL pela regra de três com 600 mg.',
            icon: 'Target',
          },
        ],
        footer_rule: '1 g = 1.000 mg | 600 mg em solução 200 mg/mL = 3 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: dose em mg com resposta em mL após diluição do frasco-ampola.',
          'Converter massa: 1 g de Keflin = 1.000 mg na ampola liofilizada.',
          'Calcular concentração: 1.000 mg ÷ 5 mL = 200 mg/mL.',
          'Regra de três: 600 mg ── X mL | 1.000 mg ── 5 mL → X = (600 × 5) ÷ 1.000 = 3 mL.',
          'Eliminar B (1,5 mL): metade da dose — divide mg ou volume pela metade.',
          'Eliminar C (1,0 mL), D (2,5 mL) e E (0,5 mL): erros de escala ou conversão g→mg.',
          'Localizar alternativa A = 3,0 mL.',
          'Marcar A.',
          'Fixação: frasco em gramas → ×1.000 → mg/mL → regra de três com dose prescrita.',
        ],
        footer_rule: 'Roteiro: 1 g → 200 mg/mL → 600 mg = 3 mL → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Keflin 600 mg',
        meta: slideMeta,
        content: 'g → mg → mg/mL → mL',
        rows: [
          { label: 'Conversão', value: '1 g = 1.000 mg', badge: 'hot', emphasis: 'highlight' },
          { label: 'Concentração', value: '1.000 mg ÷ 5 mL = 200 mg/mL', badge: 'ok' },
          { label: 'Regra de três', value: '600 mg ── X mL | 1.000 mg ── 5 mL', badge: 'hot' },
          { label: 'Volume', value: '(600 × 5) ÷ 1.000 = 3 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 1,5 mL', value: '300 mg — metade da dose', badge: 'warn' },
          { label: 'Erro 0,5 mL', value: '100 mg — divide por 10 sem base', badge: 'warn' },
          { label: 'Conferência', value: '3 mL × 200 mg/mL = 600 mg', badge: 'ok' },
        ],
        footer_rule: 'Liofilizado: converta g, calcule mg/mL, aplique regra de três',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — KEFLIN 600 mg',
        items: [
          {
            label: 'Letra B — 1,5 mL',
            detail: 'Metade de 3 mL — erro ao dividir dose ou concentração.',
            correct: '600 mg em solução 200 mg/mL = 3 mL — não 1,5 mL.',
          },
          {
            label: 'Letra C — 1,0 mL',
            detail: 'Corresponde a 200 mg — confunde mg/mL com dose total.',
            correct: '1 mL × 200 mg/mL = 200 mg — prescrito 600 mg.',
          },
          {
            label: 'Letra D — 2,5 mL',
            detail: '500 mg — quase a dose certa mas arredonda cedo.',
            correct: 'Regra de três exata: 3,0 mL para 600 mg.',
          },
          {
            label: 'Letra E — 0,5 mL',
            detail: '100 mg — subdose grave por escala decimal errada.',
            correct: '600 mg ÷ 200 mg/mL = 3 mL.',
          },
          {
            label: 'Em outra banca — ampola em mg',
            detail: 'Se vier 500 mg/2 mL, pule conversão de gramas.',
            correct: 'Sempre: mg totais ÷ mg/mL = mL a aspirar.',
          },
        ],
        footer_rule: '600 mg de solução 200 mg/mL = 3 mL — conferir com multiplicação inversa',
      },
    ],
  },

  'coseac-uff-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056330579-3': {
    family: 'calc',
    guideline: 'Gentamicina 50 mg IM — ampola 80 mg/2 mL → regra de três → 1,25 mL',
    roi_error: 'inverter_proporcao_mg_ml',
    exam_vs_current: 'conta da prova — 50 mg de ampola 80 mg/2 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gentamicina IM — regra de três',
        meta: slideMeta,
        items: [
          {
            label: 'Dose prescrita',
            detail: '50 mg de gentamicina intramuscular — numerador da proporção.',
            icon: 'Syringe',
          },
          {
            label: 'Apresentação disponível',
            detail: 'Ampola 80 mg em 2 mL — par mg/mL para a regra de três.',
            icon: 'FlaskConical',
          },
          {
            label: 'Concentração implícita',
            detail: '80 mg ÷ 2 mL = 40 mg/mL — atalho para conferência.',
            icon: 'Calculator',
          },
          {
            label: 'Via intramuscular',
            detail: 'Volume aspirado da ampola — não rediluir salvo prescrição.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Dividir 50 por 80 ou 2 por 80 sem cruzar mg com mL corretamente.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão COSEAC neste tema',
            detail: 'Dose mg + ampola mg/mL → regra de três direta → mL.',
            icon: 'Target',
          },
        ],
        footer_rule: '50 mg ── X mL | 80 mg ── 2 mL → X = 1,25 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: dose em mg com resposta em mL da ampola.',
          'Montar proporção: 50 mg prescritos ── X mL | 80 mg ── 2 mL disponíveis.',
          'Calcular: X = (50 × 2) ÷ 80 = 100 ÷ 80 = 1,25 mL.',
          'Conferir concentração: 1,25 mL × 40 mg/mL = 50 mg.',
          'Eliminar A (1 mL): 40 mg — subdose de 10 mg.',
          'Eliminar B (1,025 mL), C (1,20 mL) e E (1,30 mL): arredondamentos sem base proporcional.',
          'Localizar alternativa D = 1,25 mL.',
          'Marcar D.',
          'Fixação: regra de três — dose prescrita no numerador, apresentação completa no denominador.',
        ],
        footer_rule: 'Roteiro: (50×2)/80 = 1,25 mL → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — gentamicina 50 mg',
        meta: slideMeta,
        content: 'mg ── mL | mg ── mL',
        rows: [
          { label: 'Proporção', value: '50 mg ── X mL | 80 mg ── 2 mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Cálculo', value: 'X = (50 × 2) ÷ 80 = 1,25 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Concentração', value: '80 mg/2 mL = 40 mg/mL', badge: 'info' },
          { label: 'Conferência', value: '1,25 × 40 = 50 mg', badge: 'ok' },
          { label: 'Erro 1 mL', value: '40 mg — 10 mg a menos', badge: 'warn' },
          { label: 'Erro 1,5 mL', value: '60 mg — 10 mg a mais', badge: 'warn' },
        ],
        footer_rule: 'Gentamicina 50 mg: cruzar mg com mg e mL com mL na ampola 80 mg/2 mL',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GENTAMICINA 50 mg IM',
        items: [
          {
            label: 'Letra A — 1 mL',
            detail: 'Entrega 40 mg — subdose de 10 mg em relação aos 50 mg prescritos.',
            correct: '50 mg exigem 1,25 mL da ampola 80 mg/2 mL.',
          },
          {
            label: 'Letra B — 1,025 mL',
            detail: 'Interpolação decimal sem cruzar a proporção correta.',
            correct: '(50×2)/80 = 1,25 mL exatos.',
          },
          {
            label: 'Letra C — 1,20 mL',
            detail: '48 mg — quase 50 mg mas arredonda antes de fechar a regra.',
            correct: '1,20 × 40 = 48 mg — faltam 2 mg.',
          },
          {
            label: 'Letra E — 1,30 mL',
            detail: '52 mg — superestima volume em 0,05 mL.',
            correct: '1,30 × 40 = 52 mg — 2 mg acima do prescrito.',
          },
          {
            label: 'Em outra banca — ampola fracionada',
            detail: 'Mesmo trilho para qualquer mg/mL — proporção direta.',
            correct: 'Dose (mg) × mL da ampola ÷ mg da ampola = mL.',
          },
        ],
        footer_rule: '50 mg de 80 mg/2 mL = 1,25 mL — conferir mg × concentração',
      },
    ],
  },

  'coseac-uff-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056330579-4': {
    family: 'calc',
    branch: 'calc_dose_equivalencia',
    guideline: 'Rocefin 750 mg EV — 1 g em 10 mL AD → 100 mg/mL → aspirar 7,5 mL',
    roi_error: 'volume_diluicao_errado_ou_dose_incompleta',
    exam_vs_current: 'conta da prova — 750 mg de frasco 1 g; procedimento com 10 mL AD',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Rocefin — reconstituição EV',
        meta: slideMeta,
        items: [
          {
            label: 'Dose prescrita',
            detail: '750 mg de ceftriaxona (Rocefin) endovenoso — 75% do frasco 1 g.',
            icon: 'Pill',
          },
          {
            label: 'Frasco disponível',
            detail: '1 g em pó — requer diluição antes da aspiração.',
            icon: 'FlaskConical',
          },
          {
            label: 'Volume de diluição',
            detail: '10 mL AD → 1.000 mg em 10 mL = 100 mg/mL.',
            icon: 'Droplets',
          },
          {
            label: 'Volume a aspirar',
            detail: '750 mg ÷ 100 mg/mL = 7,5 mL da solução reconstituída.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Diluir em 5 mL (200 mg/mL) ou aspirar 3,5 mL — subdose.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão COSEAC neste tema',
            detail: 'Pó 1 g + 10 mL AD → aspirar 7,5 mL para 750 mg.',
            icon: 'Target',
          },
        ],
        footer_rule: '1 g + 10 mL = 100 mg/mL → 750 mg = 7,5 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: antibiótico em pó — escolher procedimento de diluição e aspiração.',
          'Calcular fração da dose: 750 mg de 1.000 mg = 75% do frasco.',
          'Após diluir 1 g em 10 mL AD: concentração = 100 mg/mL.',
          'Volume necessário: 750 mg ÷ 100 mg/mL = 7,5 mL a aspirar.',
          'Eliminar B (20 mL diluição): mesmo 7,5 mL aspirados, mas volume de diluição atípico — A é padrão.',
          'Eliminar C (SF + 7 mL): 7 mL ≠ 7,5 mL — subdose de 50 mg.',
          'Eliminar D (5 mL diluição + 3,5 mL): 3,5 × 200 mg/mL = 700 mg — subdose.',
          'Eliminar E (15 mL diluição): concentração menor, mas 7,5 mL ainda correto — A é procedimento padrão COSEAC.',
          'Localizar alternativa A = diluir em 10 mL AD e aspirar 7,5 mL.',
          'Marcar A.',
          'Fixação: pó 1 g → diluir → mg/mL → mL = dose ÷ concentração.',
        ],
        footer_rule: 'Roteiro: 10 mL AD → 100 mg/mL → 7,5 mL = 750 mg → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Rocefin 750 mg',
        meta: slideMeta,
        content: '1 g · 10 mL · 7,5 mL',
        rows: [
          { label: 'Reconstituição', value: '1 g + 10 mL AD = 100 mg/mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Dose', value: '750 mg = 75% do frasco', badge: 'info' },
          { label: 'Volume a aspirar', value: '750 ÷ 100 = 7,5 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 3,5 mL', value: '5 mL diluição → 200 mg/mL → 700 mg', badge: 'warn' },
          { label: 'Erro 7 mL', value: '700 mg — 50 mg a menos', badge: 'warn' },
          { label: 'Conferência', value: '7,5 mL × 100 mg/mL = 750 mg', badge: 'ok' },
        ],
        footer_rule: 'Ceftriaxona 1 g + 10 mL → aspirar 7,5 mL para 750 mg',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ROCEFIN 750 mg EV',
        items: [
          {
            label: 'Letra B — 20 mL AD + 7,5 mL',
            detail: 'Volume correto aspirado, mas diluição em 20 mL é atípica — concentração 50 mg/mL.',
            correct: '750 mg exige 7,5 mL; diluição padrão COSEAC: 10 mL AD.',
          },
          {
            label: 'Letra C — SF + 7 mL',
            detail: 'Aspirar 7 mL em solução 100 mg/mL = 700 mg — subdose de 50 mg.',
            correct: '750 mg ÷ 100 mg/mL = 7,5 mL — não 7 mL.',
          },
          {
            label: 'Letra D — 5 mL AD + 3,5 mL',
            detail: 'Concentração 200 mg/mL → 3,5 × 200 = 700 mg.',
            correct: '750 mg precisam de 7,5 mL após diluição em 10 mL.',
          },
          {
            label: 'Letra E — 15 mL AD + 7,5 mL',
            detail: '7,5 mL corretos, mas diluição em 15 mL reduz concentração — procedimento não padrão.',
            correct: 'A combina 10 mL AD + 7,5 mL — par oficial desta prova.',
          },
          {
            label: 'Em outra banca — ceftriaxona',
            detail: 'Volume de diluição pode variar — sempre recalcule mg/mL.',
            correct: 'Dose (mg) ÷ mg/mL após reconstituição = mL a aspirar.',
          },
        ],
        footer_rule: '750 mg de 1 g/10 mL = aspirar 7,5 mL — conferir mg/mL',
      },
    ],
  },

  'coseac-uff-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056330579-5': {
    family: 'calc',
    guideline: 'Vancomicina 30 mL / 40 min — macrogotas 15 + microgotas 45 por minuto',
    roi_error: 'calcular_só_um_fator_ou_volume_errado',
    exam_vs_current: 'conta da prova — SG 5% 30 mL, 40 min, gotas e microgotas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vancomicina — gotas e microgotas',
        meta: slideMeta,
        items: [
          {
            label: 'Volume total',
            detail: '30 mL (vancomicina + SG 5%) — numerador das duas fórmulas.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo de infusão',
            detail: '40 minutos — já em minutos, pronto para dividir.',
            icon: 'Clock',
          },
          {
            label: 'Macrogotas',
            detail: 'Fator 20 → gts/min = (30 × 20) ÷ 40 = 15.',
            icon: 'Gauge',
          },
          {
            label: 'Microgotas',
            detail: 'Fator 60 → microgts/min = (30 × 60) ÷ 40 = 45.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Calcular só macrogotas ou trocar 20 por 60 na mesma linha.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão COSEAC neste tema',
            detail: 'Enunciado pede par gotas + microgotas — duas contas com mesmo volume/tempo.',
            icon: 'Target',
          },
        ],
        footer_rule: '30 mL / 40 min → 15 gts/min e 45 microgts/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: vancomicina 500 mg em infusão — resposta dupla gotas e microgotas/min.',
          'Fixar volume: 30 mL totais (500 mg + soro glicosado 5%).',
          'Fixar tempo: 40 minutos para infundir a dose.',
          'Macrogotas: (30 × 20) ÷ 40 = 600 ÷ 40 = 15 gotas/min.',
          'Microgotas: (30 × 60) ÷ 40 = 1.800 ÷ 40 = 45 microgotas/min.',
          'Eliminar A (22/67), C (18/67) e D (36/79): um ou ambos os valores fora da dupla 15/45.',
          'Eliminar E (14/45): microgotas corretas, macrogotas erradas.',
          'Localizar alternativa B = 15 gotas e 45 microgotas por minuto.',
          'Marcar B.',
          'Fixação: mesmo volume e tempo — fator 20 para gotas, fator 60 para microgotas.',
        ],
        footer_rule: 'Roteiro: (30×20)/40=15 | (30×60)/40=45 → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — par gotas/microgotas',
        meta: slideMeta,
        content: '15 · 45 · 30 mL',
        rows: [
          { label: 'Volume', value: '30 mL', badge: 'ok' },
          { label: 'Tempo', value: '40 min', badge: 'ok' },
          { label: 'Macrogotas', value: '(30×20)÷40 = 15 gts/min', badge: 'hot', emphasis: 'success' },
          { label: 'Microgotas', value: '(30×60)÷40 = 45 microgts/min', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 22/67', value: 'volume ~44 mL ou fator híbrido', badge: 'warn' },
          { label: 'Erro 36/79', value: 'dobra macrogotas — tempo pela metade', badge: 'warn' },
          { label: 'Conferência', value: '15×2 ≈ 45/3 — proporção 20:60', badge: 'info' },
        ],
        footer_rule: 'Dupla conta: fator 20 → gotas | fator 60 → microgotas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VANCOMICINA 30 mL / 40 min',
        items: [
          {
            label: 'Letra A — 22 e 67',
            detail: 'Macrogotas superestimadas — volume efetivo ~44 mL na conta.',
            correct: '(30×20)/40 = 15 gts/min — não 22.',
          },
          {
            label: 'Letra C — 18 e 67',
            detail: 'Microgotas infladas (67) — possível fator 90 ou volume ~45 mL.',
            correct: 'Microgotas corretas: (30×60)/40 = 45/min.',
          },
          {
            label: 'Letra D — 36 e 79',
            detail: 'Quase dobra ambos — divide tempo por 2 ou usa fator errado.',
            correct: '30 mL em 40 min → 15 gts e 45 microgts/min.',
          },
          {
            label: 'Letra E — 14 e 45',
            detail: 'Microgotas certas, macrogotas 1 unidade abaixo — arredondamento ou volume 28 mL.',
            correct: 'Par exato: 15 gotas + 45 microgotas/min.',
          },
          {
            label: 'Em outra banca — só gotas',
            detail: 'Se pedir apenas um tipo, use o fator correspondente.',
            correct: 'Macrogota 20 | microgota 60 — nunca misture na mesma fórmula.',
          },
        ],
        footer_rule: 'Vancomicina 30 mL/40 min = 15 gts + 45 microgts/min',
      },
    ],
  },

  'cotec-fadenor-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056265348-1': {
    family: 'calc',
    guideline: 'Insulina U-100 — 100 UI = 1 mL → 15 UI = 0,15 mL SC',
    roi_error: 'confundir_ui_com_ml_direto',
    exam_vs_current: 'conta da prova — 15 UI com seringa graduada em mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Insulina U-100 — UI para mL',
        meta: slideMeta,
        items: [
          {
            label: 'Manoel — insulinodependente',
            detail: 'Paciente domiciliar — UBS fornece insulina e seringas em UI.',
            icon: 'User',
          },
          {
            label: 'Apresentação U-100',
            detail: '100 unidades internacionais em 1 mL — decore para uso domiciliar.',
            icon: 'Pill',
          },
          {
            label: 'Dose prescrita',
            detail: '15 UI por via subcutânea — converter para mL na seringa de 3 mL.',
            icon: 'Syringe',
          },
          {
            label: 'Seringa disponível',
            detail: 'Graduada em mL (não em UI) — exige conversão antes da aspiração.',
            icon: 'Ruler',
          },
          {
            label: 'Proporção',
            detail: '15 UI ── X mL | 100 UI ── 1 mL → X = 0,15 mL.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Aspirar 15 mL ou 0,3 mL — confunde UI com mL ou dobra a dose.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão COTEC neste tema',
            detail: 'Enunciado explicita 100 UI = 1 mL — regra de três direta.',
            icon: 'Target',
          },
        ],
        footer_rule: 'DECORE: 15 UI ÷ 100 = 0,15 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: Manoel insulinodependente — seringa em mL, dose em UI subcutânea.',
          'Recuperar equivalência do enunciado: 100 UI = 1 mL na insulina U-100.',
          'Montar proporção: 15 UI ── X mL | 100 UI ── 1 mL — aspiração domiciliar.',
          'Calcular: X = 15 ÷ 100 = 0,15 mL na seringa de 3 mL.',
          'Eliminar B (0,3 mL): dobra a dose — 30 UI.',
          'Eliminar C (0,5 mL): 50 UI — escala decimal errada.',
          'Eliminar D (15 mL) e E (20 mL): confunde UI com mL diretamente.',
          'Localizar alternativa A = 0,15 mL.',
          'Marcar A.',
          'Fixação: insulina U-100 — divida UI por 100 para obter mL.',
        ],
        footer_rule: 'Roteiro: 15 UI ÷ 100 = 0,15 mL → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — insulina U-100',
        meta: slideMeta,
        content: '100 UI = 1 mL',
        rows: [
          { label: 'U-100', value: '100 UI em 1 mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fórmula', value: 'mL = UI ÷ 100', badge: 'hot' },
          { label: '15 UI', value: '15 ÷ 100 = 0,15 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 0,3 mL', value: '30 UI — dobro da dose', badge: 'warn' },
          { label: 'Erro 15 mL', value: '1.500 UI — confunde UI com mL', badge: 'warn' },
          { label: 'Conferência', value: '0,15 mL × 100 UI/mL = 15 UI', badge: 'ok' },
        ],
        footer_rule: 'Insulina U-100: UI ÷ 100 = mL na seringa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INSULINA 15 UI',
        items: [
          {
            label: 'Letra B — 0,3 mL',
            detail: '30 UI — dobro de 15 UI por erro de escala.',
            correct: '15 UI ÷ 100 = 0,15 mL — não 0,3 mL.',
          },
          {
            label: 'Letra C — 0,5 mL',
            detail: '50 UI — superestima dose em mais de 3×.',
            correct: '0,5 mL × 100 = 50 UI — prescrito 15 UI.',
          },
          {
            label: 'Letra D — 15 mL',
            detail: 'Lê 15 UI como 15 mL — erro catastrófico de unidade.',
            correct: 'UI ≠ mL — converter pela proporção 100:1.',
          },
          {
            label: 'Letra E — 20 mL',
            detail: '2.000 UI — volume impossível na seringa de 3 mL.',
            correct: '15 UI = 0,15 mL — cabe na seringa de insulina comum.',
          },
          {
            label: 'Em outra banca — U-500',
            detail: 'Insulina U-500: 500 UI em 1 mL — proporção muda.',
            correct: 'Identifique a concentração: U-100 → ÷100 | U-500 → ÷500.',
          },
        ],
        footer_rule: 'Nunca aspirar UI como mL — U-100: divida por 100',
      },
    ],
  },

  'cotec-fadenor-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056301382-1': {
    family: 'calc',
    guideline: 'Infusão 1000 mL / 12 h — equipo 15 gts/mL → (V×15)÷720 ≈ 21 gts/min',
    roi_error: 'usar_fator_20_padrao',
    exam_vs_current: 'conta da prova — equipo 15 gotas/mL (não 20)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Infusão IV — equipo 15 gts/mL',
        meta: slideMeta,
        items: [
          {
            label: 'Prescrição intravenosa',
            detail: '1.000 mL glicose 5% em cloreto de sódio 0,45% — administração intravenosa.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo',
            detail: '12 horas de infusão → 720 minutos antes da equação de gotejamento.',
            icon: 'Clock',
          },
          {
            label: 'Equipo especial',
            detail: 'Libera 15 gotas por mililitro — fator citado na observação da prova.',
            icon: 'Gauge',
          },
          {
            label: 'Velocidade de gotejamento',
            detail: 'Fórmula Reichmann: (mL totais × fator) ÷ minutos = gotas/min.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Usar fator 20 — cai em ~31 gts/min em vez de ~21.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão COTEC neste tema',
            detail: 'Enunciado cita equipo 15 gts/mL — ler fator antes de calcular.',
            icon: 'Target',
          },
        ],
        footer_rule: 'Fator 15 (não 20) | (1000×15)/720 ≈ 21 gts/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: prescrição intravenosa — glicose 5% + cloreto 0,45%, 12 horas.',
          'Converter tempo: 12 h × 60 = 720 minutos para velocidade de gotejamento.',
          'Usar fator do equipo: 15 gotas/mL — observação da prova, não o padrão 20.',
          'Aplicar equação: gts/min = (1.000 mL × 15) ÷ 720 = 15.000 ÷ 720 = 20,83.',
          'Arredondar: alternativa mais próxima = C = 21 gotas/min.',
          'Eliminar A (11): metade do fluxo — possível fator 20 com tempo dobrado.',
          'Eliminar B (16) e D (26): fator ou tempo intermediários.',
          'Eliminar E (31): típico de fator 20 → (1000×20)/720 ≈ 28–31.',
          'Marcar C.',
          'Fixação: leia o fator do equipo no enunciado — 15, 20 ou 60 muda o resultado.',
        ],
        footer_rule: 'Roteiro: 720 min, fator 15 → 20,83 ≈ 21 → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — equipo 15 gts/mL',
        meta: slideMeta,
        content: '(1000 × 15) ÷ 720',
        rows: [
          { label: 'Volume', value: '1.000 mL', badge: 'ok' },
          { label: 'Tempo', value: '12 h = 720 min', badge: 'ok' },
          { label: 'Fator (enunciado)', value: '15 gotas/mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fórmula', value: 'gts/min = (V × fator) ÷ min', badge: 'hot' },
          { label: 'Conta', value: '(1000×15)/720 = 20,83 ≈ 21', badge: 'hot', emphasis: 'success' },
          { label: 'Erro fator 20', value: '(1000×20)/720 ≈ 28 gts/min', badge: 'warn' },
          { label: 'Arredondamento', value: '20,83 → 21 gotas/min', badge: 'info' },
        ],
        footer_rule: 'Equipo 15 gts/mL: multiplique por 15, não por 20',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 1000 mL / 12 h (FATOR 15)',
        items: [
          {
            label: 'Letra A — 11 gts/min',
            detail: 'Metade de ~21 — divide tempo ou volume pela metade.',
            correct: 'Com fator 15 e 720 min, fluxo ≈ 21 gts/min.',
          },
          {
            label: 'Letra B — 16 gts/min',
            detail: 'Subestima — possível fator 12 ou tempo 900 min.',
            correct: '(1000×15)/720 = 20,83 → arredonda 21.',
          },
          {
            label: 'Letra D — 26 gts/min',
            detail: 'Entre fator 15 e 20 — híbrido sem base no enunciado.',
            correct: 'Fator explícito: 15 gts/mL → 21 gts/min.',
          },
          {
            label: 'Letra E — 31 gts/min',
            detail: 'Típico de fator 20: (1000×20)/720 ≈ 28–31.',
            correct: 'Enunciado cita 15 gts/mL — resultado ≈ 21, não 31.',
          },
          {
            label: 'Em outra banca — fórmula do livro',
            detail: 'Algumas fontes escrevem a equação de forma confusa — use (V×fator)/min.',
            correct: 'Padrão clínico: gts/min = (mL × gotas/mL) ÷ minutos.',
          },
        ],
        footer_rule: 'Leia o fator do equipo: aqui 15 gts/mL → ≈21 gts/min',
      },
    ],
  },

  'fau-unicentro-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056309743-0': {
    family: 'calc',
    guideline: 'Oxacilina 140 mg — 500 mg/5 mL → regra de três → 1,4 mL',
    roi_error: 'confundir_mg_prescritos_com_mg_ampola',
    exam_vs_current: 'conta da prova — 140 mg de oxacilina 500 mg diluída em 5 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Oxacilina — regra de três mg/mL',
        meta: slideMeta,
        items: [
          {
            label: 'Dose por administração',
            detail: '140 mg de oxacilina — duas vezes ao dia, cada horário separado.',
            icon: 'Pill',
          },
          {
            label: 'Apresentação disponível',
            detail: '500 mg + 5 mL AD — frasco reconstituído na unidade.',
            icon: 'FlaskConical',
          },
          {
            label: 'Concentração',
            detail: '500 mg ÷ 5 mL = 100 mg/mL após diluição.',
            icon: 'Calculator',
          },
          {
            label: 'Volume por dose',
            detail: '140 mg ── X mL | 500 mg ── 5 mL → X = 1,4 mL.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Aspirar 2,5 mL (metade do frasco) ou 1,0 mL (100 mg) — ignora 140 mg.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão FAU UNICENTRO neste tema',
            detail: 'Dose mg + ampola mg/mL → regra de três → mL por horário.',
            icon: 'Target',
          },
        ],
        footer_rule: '140 mg de solução 100 mg/mL = 1,4 mL por dose',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: dose em mg com resposta em mL aspirados por administração.',
          'Calcular concentração: 500 mg ÷ 5 mL = 100 mg/mL.',
          'Montar proporção: 140 mg ── X mL | 500 mg ── 5 mL.',
          'Calcular: X = (140 × 5) ÷ 500 = 700 ÷ 500 = 1,4 mL.',
          'Eliminar A (1,0 mL): 100 mg — subdose de 40 mg.',
          'Eliminar B (1,2 mL): 120 mg — 20 mg abaixo do prescrito.',
          'Eliminar D (1,6 mL) e E (1,8 mL): 160 mg e 180 mg — superestimam volume.',
          'Localizar alternativa C = 1,4 mL.',
          'Marcar C.',
          'Fixação: “duas vezes ao dia” não muda o mL por dose — calcule cada horário.',
        ],
        footer_rule: 'Roteiro: (140×5)/500 = 1,4 mL → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — oxacilina 140 mg',
        meta: slideMeta,
        content: '500 mg/5 mL → 1,4 mL',
        rows: [
          { label: 'Concentração', value: '500 mg ÷ 5 mL = 100 mg/mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Proporção', value: '140 mg ── X mL | 500 mg ── 5 mL', badge: 'ok' },
          { label: 'Volume', value: '(140 × 5) ÷ 500 = 1,4 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 1,0 mL', value: '100 mg — 40 mg a menos', badge: 'warn' },
          { label: 'Erro 2,5 mL', value: '250 mg — metade do frasco, não a dose', badge: 'warn' },
          { label: 'Conferência', value: '1,4 mL × 100 mg/mL = 140 mg', badge: 'ok' },
        ],
        footer_rule: '140 mg em solução 100 mg/mL = 1,4 mL por administração',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — OXACILINA 140 mg',
        items: [
          {
            label: 'Letra A — 1,0 mL',
            detail: '100 mg — subdose de 40 mg em relação aos 140 mg prescritos.',
            correct: '140 mg exigem 1,4 mL da solução 500 mg/5 mL.',
          },
          {
            label: 'Letra B — 1,2 mL',
            detail: '120 mg — 20 mg abaixo — arredondamento precoce.',
            correct: '1,2 × 100 = 120 mg — faltam 20 mg.',
          },
          {
            label: 'Letra D — 1,6 mL',
            detail: '160 mg — 20 mg acima do prescrito.',
            correct: '1,6 × 100 = 160 mg — 20 mg a mais.',
          },
          {
            label: 'Letra E — 1,8 mL',
            detail: '180 mg — superestima volume em 0,4 mL.',
            correct: '1,8 × 100 = 180 mg — dose quase 30% maior.',
          },
          {
            label: 'Em outra banca — BID',
            detail: '“Duas vezes ao dia” repete 1,4 mL a cada 12 h — não divide o volume.',
            correct: 'Calcule mL por dose; frequência não altera o volume unitário.',
          },
        ],
        footer_rule: '140 mg de 500 mg/5 mL = 1,4 mL — conferir mg × concentração',
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
    console.log(`[handcraft:calculo-g03] OK ${slug}`);
  }
  console.log(`[handcraft:calculo-g03] total=${ok}`);
}

main();
