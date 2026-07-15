#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — calculo-de-administracao-de-medicamentos-e-infusoes-g10 (8 slugs).
 *
 *   npx tsx scripts/handcraft-calculo-de-administracao-de-medicamentos-e-infusoes-g10.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'calculo-de-administracao-de-medicamentos-e-infusoes-g10';
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
    'UI/mL heparina',
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
  'objetiva-concursos-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056284398-1': {
    family: 'calc',
    guideline: '320 mL / 3 h — microgotas (V×60)÷180 min ≈ 107',
    roi_error: 'usar_fator_20_ou_dividir_por_horas_sem_converter',
    exam_vs_current: 'conta da prova — 320 mL em 3 h, microgotas ≈ 107/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: '320 mL — microgotas em 3 horas',
        meta: slideMeta,
        items: [
          {
            label: 'Volume prescrito',
            detail: '320 mL de reposição hídrica e eletrólitos — numerador da fórmula.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo de infusão',
            detail: '3 horas → converter em 180 minutos antes de dividir.',
            icon: 'Clock',
          },
          {
            label: 'Equipo microgotas',
            detail: 'Enunciado pede microgotas — fator 60 (1 mL = 60 microgotas).',
            icon: 'Gauge',
          },
          {
            label: 'Fórmula canônica',
            detail: 'microgts/min = (volume × 60) ÷ tempo em minutos.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Usar fator 20 (macrogotas) ou dividir 320 por 3 sem converter minutos.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão Objetiva neste tema',
            detail: 'Emergência + desidratação: microgotas com fator 60 e arredondamento aproximado.',
            icon: 'Target',
          },
        ],
        footer_rule: '3 h = 180 min | microgts/min = (320 × 60) ÷ 180 ≈ 107',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 320 mL para infundir em 3 horas — resposta em microgotas/min.',
          'Converter tempo: 3 h × 60 = 180 minutos.',
          'Fixar fator microgotas: 1 mL = 60 microgotas (não 20).',
          'Aplicar fórmula: microgts/min = (320 × 60) ÷ 180.',
          'Calcular: 19.200 ÷ 180 = 106,67 microgotas por minuto.',
          'Arredondar para alternativa mais próxima: D = 107 microgotas/min.',
          'Eliminar A (35): fluxo ~305 min — superestima duração em quase 2×.',
          'Eliminar B (46): tempo ~417 min — quase 7 h de infusão.',
          'Eliminar C (96): tempo ~200 min — subestima as 3 h prescritas.',
          'Localizar alternativa D = 107 microgotas por minuto.',
          'Marcar D.',
          'Fixação: microgotas = fator 60; converta horas em minutos antes de dividir.',
        ],
        footer_rule: 'Roteiro: 3 h → 180 min → (320×60)/180 ≈ 107 → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 320 mL / 3 h microgotas',
        meta: slideMeta,
        content: '(320 × 60) ÷ 180',
        rows: [
          { label: 'Volume', value: '320 mL', badge: 'ok' },
          { label: 'Tempo', value: '3 h = 180 min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator microgotas', value: '60 microgotas/mL', badge: 'hot' },
          { label: 'Fórmula', value: 'microgts/min = (V × 60) ÷ min', badge: 'hot' },
          { label: 'Conta', value: '(320 × 60) ÷ 180 = 106,67 ≈ 107', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 96/min', value: 'tempo ~200 min — só 3,3 h', badge: 'warn' },
          { label: 'Erro 46/min', value: 'tempo ~417 min — quase 7 h', badge: 'warn' },
        ],
        footer_rule: 'Microgotas: (mL × 60) ÷ minutos, arredonde',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 320 mL / 3 H MICROGOTAS',
        items: [
          {
            label: 'Letra A — 35 microgotas/min',
            detail: 'Fluxo muito baixo — tempo efetivo ~549 min (≈9 h).',
            correct: '(320×60)÷180 ≈ 107 microgotas/min — não 35.',
          },
          {
            label: 'Letra B — 46 microgotas/min',
            detail: 'Tempo ~417 min — quase 7 h em vez de 3 h.',
            correct: '3 h = 180 min — usar esse tempo com fator 60.',
          },
          {
            label: 'Letra C — 96 microgotas/min',
            detail: 'Tempo ~200 min — subestima as 180 min prescritas.',
            correct: '106,67 arredonda para 107 — alternativa mais próxima na prova.',
          },
          {
            label: 'Em outra banca — macrogotas',
            detail: 'Sem “microgotas” no enunciado, use fator 20 por padrão BR.',
            correct: 'Objetiva pede microgotas — fator 60 obrigatório.',
          },
        ],
        footer_rule: 'Leia “microgotas” — fator 60, não 20',
      },
    ],
  },

  'objetiva-concursos-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056284398-7': {
    family: 'calc',
    guideline: 'Heparina 8.000 UI — apresentação 10.000 UI/mL → 0,8 mL',
    roi_error: 'multiplicar_ui_por_ml_ou_confundir_ui_com_ml',
    exam_vs_current: 'conta da prova — 8.000 UI, 10.000 UI/mL → 0,8 mL SC',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Heparina — UI para mL',
        meta: slideMeta,
        items: [
          {
            label: 'Dose prescrita',
            detail: '8.000 UI de heparina sódica SC de 12/12 h — alvo em unidades internacionais.',
            icon: 'Syringe',
          },
          {
            label: 'Apresentação disponível',
            detail: '10.000 UI/mL — concentração do frasco no estoque da unidade.',
            icon: 'FlaskConical',
          },
          {
            label: 'Regra de três',
            detail: '8.000 UI ── X mL | 10.000 UI ── 1 mL → X = 0,8 mL.',
            icon: 'Calculator',
          },
          {
            label: 'Atalho direto',
            detail: '8.000 UI ÷ 10.000 UI/mL = 0,8 mL — dose ÷ concentração.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Multiplicar 8.000 × 10.000 ou responder 8 mL (confunde UI com mL).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão Objetiva neste tema',
            detail: 'Anticoagulante SC: UI prescritas ÷ UI/mL = volume na seringa de insulina.',
            icon: 'Target',
          },
        ],
        footer_rule: '8.000 UI ÷ 10.000 UI/mL = 0,8 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: heparina prescrita em UI — apresentação 10.000 UI/mL — resposta em mL.',
          'Fixar dados: prescritos 8.000 UI SC | frasco 10.000 UI/mL.',
          'Montar regra de três: 8.000 UI ── X mL | 10.000 UI ── 1 mL.',
          'Calcular: X = 8.000 ÷ 10.000 = 0,8 mL.',
          'Eliminar A (0,6 mL): 6.000 UI — subdose de 2.000 UI.',
          'Eliminar C (0,10 mL): 1.000 UI — subdose de 7.000 UI.',
          'Eliminar D (0,16 mL): 1.600 UI — subdose de 6.400 UI.',
          'Localizar alternativa B = 0,8 mL.',
          'Marcar B.',
          'Fixação: UI prescritas ÷ UI/mL = volume em mL — posologia 12/12 h não altera a conta.',
        ],
        footer_rule: 'Roteiro: 8.000 ÷ 10.000 = 0,8 mL → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — heparina 8.000 UI',
        meta: slideMeta,
        content: '8.000 UI ÷ 10.000 UI/mL',
        rows: [
          { label: 'Prescrito', value: '8.000 UI SC 12/12 h', badge: 'hot', emphasis: 'highlight' },
          { label: 'Apresentação', value: '10.000 UI/mL', badge: 'ok' },
          { label: 'Regra de três', value: '8.000 UI ── X mL | 10.000 UI ── 1 mL', badge: 'hot' },
          { label: 'Volume', value: '8.000 ÷ 10.000 = 0,8 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 0,6 mL', value: '6.000 UI — faltam 2.000 UI', badge: 'warn' },
          { label: 'Erro 0,10 mL', value: '1.000 UI — subdose grave', badge: 'warn' },
          { label: 'Erro 0,16 mL', value: '1.600 UI — faltam 6.400 UI', badge: 'warn' },
        ],
        footer_rule: 'UI prescritas ÷ UI/mL = mL na seringa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HEPARINA 8.000 UI',
        items: [
          {
            label: 'Letra A — 0,6 mL',
            detail: '0,6 × 10.000 = 6.000 UI — faltam 2.000 UI do prescrito.',
            correct: '8.000 UI exigem 0,8 mL na concentração 10.000 UI/mL.',
          },
          {
            label: 'Letra C — 0,10 mL',
            detail: '1.000 UI — subdose de 7.000 UI; confunde ordem de grandeza.',
            correct: '8.000 ÷ 10.000 = 0,8 mL — não 0,10 mL.',
          },
          {
            label: 'Letra D — 0,16 mL',
            detail: '1.600 UI — ainda 6.400 UI abaixo da prescrição.',
            correct: '0,8 mL entrega exatamente 8.000 UI na apresentação 10.000 UI/mL.',
          },
          {
            label: 'Em outra banca — 12/12 h',
            detail: 'Intervalo posológico não entra na conta de volume por dose.',
            correct: 'Calcule só a dose da administração: UI ÷ UI/mL = mL.',
          },
        ],
        footer_rule: 'UI ÷ UI/mL = mL — posologia não altera volume por dose',
      },
    ],
  },

  'omni-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056318806-8': {
    family: 'calc',
    guideline: 'Ceftriaxone 1.250 mg q4h — amp 500 mg → 2,5 amp/dose × 6 doses = 15 ampolas/dia',
    roi_error: 'esquecer_multiplicar_por_doses_diarias_ou_arredondar_ampolas',
    exam_vs_current: 'conta da prova — 1.250 mg q4h, amp 500 mg → 15 ampolas/24 h',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ceftriaxone — ampolas nas 24 h',
        meta: slideMeta,
        items: [
          {
            label: 'Dose por administração',
            detail: '1.250 mg de ceftriaxone IV a cada 4 horas — alvo por dose.',
            icon: 'Syringe',
          },
          {
            label: 'Apresentação disponível',
            detail: 'Ampolas de 500 mg — estoque limitado da farmácia.',
            icon: 'FlaskConical',
          },
          {
            label: 'Ampolas por dose',
            detail: '1.250 ÷ 500 = 2,5 ampolas por administração.',
            icon: 'Calculator',
          },
          {
            label: 'Doses em 24 h',
            detail: '24 h ÷ 4 h = 6 administrações no dia.',
            icon: 'Clock',
          },
          {
            label: 'Total diário',
            detail: '2,5 × 6 = 15 ampolas para cobrir as 24 h.',
            icon: 'Package',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Parar em 2,5 ou 3 ampolas (só uma dose) ou usar 24 h ÷ 500 mg direto.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '2,5 amp/dose × 6 doses/dia = 15 ampolas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: infecção pélvica — ceftriaxone 1.250 mg intravenoso a cada 4 horas; farmácia só tem ampolas de 500 mg.',
          'Identificar formato: dose q4h + ampolas de 500 mg — pede total para 24 h.',
          'Calcular ampolas por dose: 1.250 mg ÷ 500 mg = 2,5 ampolas.',
          'Calcular doses no dia: 24 h ÷ 4 h = 6 administrações.',
          'Multiplicar: 2,5 × 6 = 15 ampolas nas 24 h.',
          'Eliminar A (10 ampolas): cobre ~4 doses — faltam 2 administrações.',
          'Eliminar B (12 ampolas): 12 ÷ 2,5 = 4,8 doses — subestima o dia.',
          'Eliminar D (17 ampolas): 17 ÷ 2,5 = 6,8 doses — superestima estoque.',
          'Localizar alternativa C = 15 ampolas.',
          'Marcar C.',
          'Fixação: amp/dose × doses/dia = ampolas totais — não pare na dose única.',
        ],
        footer_rule: 'Roteiro: 1.250/500 = 2,5 | 24/4 = 6 | 2,5×6 = 15 → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ceftriaxone 24 h',
        meta: slideMeta,
        content: '2,5 amp/dose × 6 doses',
        rows: [
          { label: 'Dose', value: '1.250 mg q4h IV', badge: 'hot', emphasis: 'highlight' },
          { label: 'Ampola', value: '500 mg', badge: 'ok' },
          { label: 'Amp/dose', value: '1.250 ÷ 500 = 2,5', badge: 'hot' },
          { label: 'Doses/dia', value: '24 ÷ 4 = 6', badge: 'hot' },
          { label: 'Total', value: '2,5 × 6 = 15 ampolas', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 10 amp', value: '~4 doses — faltam 2 no dia', badge: 'warn' },
          { label: 'Erro 12 amp', value: '4,8 doses — subestima 24 h', badge: 'warn' },
        ],
        footer_rule: 'Amp/dose × doses/dia = estoque diário',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CEFTRIAXONE 1.250 mg q4h',
        items: [
          {
            label: 'Letra A — 10 ampolas',
            detail: '10 ÷ 2,5 = 4 doses — cobre só 16 h do dia.',
            correct: '6 doses × 2,5 amp = 15 ampolas para 24 h completas.',
          },
          {
            label: 'Letra B — 12 ampolas',
            detail: '12 ÷ 2,5 = 4,8 doses — faltam 1,2 administrações.',
            correct: '24 h com intervalo 4 h = 6 doses → 15 ampolas.',
          },
          {
            label: 'Letra D — 17 ampolas',
            detail: '17 ÷ 2,5 = 6,8 doses — sobram ampolas sem base na posologia.',
            correct: '2,5 ampolas por dose × 6 = 15 ampolas exatas.',
          },
          {
            label: 'Em outra banca — arredondar 2,5',
            detail: '1.250 mg exige 2 ampolas inteiras + metade — total fracionado por dose.',
            correct: 'Mantenha 2,5 amp/dose antes de multiplicar pelas 6 administrações.',
          },
        ],
        footer_rule: 'Calcule amp/dose E doses/dia — não pare na primeira dose',
      },
    ],
  },

  'omni-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056330579-0': {
    family: 'calc',
    guideline: '10 mg em 50 mL — infundir 32 mL → (10÷50)×32 = 6,4 mg',
    roi_error: 'multiplicar_mg_por_ml_sem_calcular_concentracao',
    exam_vs_current: 'conta da prova — 10 mg/50 mL, infundir 32 mL → 6,4 mg',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dexametasona diluída — fração infundida',
        meta: slideMeta,
        items: [
          {
            label: 'Dose total diluída',
            detail: '10 mg de dexametasona em 50 mL de SF — massa distribuída no volume.',
            icon: 'FlaskConical',
          },
          {
            label: 'Volume administrado',
            detail: 'Prescrição pede infundir apenas 32 mL da solução preparada.',
            icon: 'Droplets',
          },
          {
            label: 'Concentração',
            detail: '10 mg ÷ 50 mL = 0,2 mg/mL — passo intermediário obrigatório.',
            icon: 'Calculator',
          },
          {
            label: 'Dose recebida',
            detail: '32 mL × 0,2 mg/mL = 6,4 mg de dexametasona.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Responder 32 mg (confunde mL com mg) ou 0,8 mg (proporção invertida).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão Omni neste tema',
            detail: 'Diluição parcial: calcule mg/mL, depois multiplique pelo mL infundido.',
            icon: 'Target',
          },
        ],
        footer_rule: '10 mg/50 mL = 0,2 mg/mL | 32 mL = 6,4 mg',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: medicamento diluído — pergunta mg recebidos ao infundir fração do volume.',
          'Calcular concentração: 10 mg ÷ 50 mL = 0,2 mg/mL.',
          'Aplicar regra de três: 10 mg ── 32 mL | 50 mL ── X mg → X = 6,4 mg.',
          'Ou: 32 mL × 0,2 mg/mL = 6,4 mg.',
          'Eliminar A (0,8 mg): 4 mL infundidos — subestima volume em 8×.',
          'Eliminar B (4,5 mg): volume ~22,5 mL — não corresponde aos 32 mL.',
          'Eliminar D (32 mg): confunde mililitros infundidos com miligramas.',
          'Localizar alternativa C = 6,4 mg.',
          'Marcar C.',
          'Fixação: mg totais ÷ mL totais × mL administrados = dose recebida.',
        ],
        footer_rule: 'Roteiro: 10/50 = 0,2 mg/mL → 32×0,2 = 6,4 mg → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — dexametasona 32 mL',
        meta: slideMeta,
        content: '(10 ÷ 50) × 32',
        rows: [
          { label: 'Diluição', value: '10 mg em 50 mL SF', badge: 'ok' },
          { label: 'Concentração', value: '10 ÷ 50 = 0,2 mg/mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Volume infundido', value: '32 mL', badge: 'hot' },
          { label: 'Dose recebida', value: '32 × 0,2 = 6,4 mg', badge: 'hot', emphasis: 'success' },
          { label: 'Regra de três', value: '10 mg ── 32 mL | 50 mL ── 6,4 mg', badge: 'ok' },
          { label: 'Erro 32 mg', value: 'Confunde mL com mg — dose impossível', badge: 'warn' },
          { label: 'Erro 0,8 mg', value: '4 mL — volume 8× menor que prescrito', badge: 'warn' },
        ],
        footer_rule: 'mg/mL × mL infundidos = mg administrados',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEXAMETASONA 10 mg / 50 mL',
        items: [
          {
            label: 'Letra A — 0,8 mg',
            detail: 'Equivale a 4 mL da solução — subestima os 32 mL infundidos.',
            correct: '32 mL × 0,2 mg/mL = 6,4 mg — não 0,8 mg.',
          },
          {
            label: 'Letra B — 4,5 mg',
            detail: 'Volume ~22,5 mL na conta — não bate com 32 mL prescritos.',
            correct: 'Proporção 10 mg/50 mL aplicada a 32 mL = 6,4 mg.',
          },
          {
            label: 'Letra D — 32 mg',
            detail: 'Confunde mL infundidos (32) com miligramas administrados.',
            correct: 'Só 6,4 mg de dexametasona estão nos 32 mL da solução.',
          },
          {
            label: 'Em outra banca — volume total',
            detail: 'Responder 10 mg porque a ampola tinha 10 mg — ignora fração infundida.',
            correct: 'Paciente recebe só 32 mL de 50 mL → 6,4 mg.',
          },
        ],
        footer_rule: 'Calcule concentração antes de aplicar ao mL infundido',
      },
    ],
  },

  'omni-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056330579-1': {
    family: 'conceito',
    branch: 'calc_dose_equivalencia',
    guideline: 'Preparo seguro — calcular dose exata e unidade métrica (COFEN / boas práticas)',
    roi_error: 'confundir_preparo_com_administracao_ou_identificacao',
    exam_vs_current: 'conceito de prova — preparo seguro = cálculo de dose exata',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preparo seguro — o que a prova cobra',
        meta: slideMeta,
        items: [
          {
            label: 'Fase do medicamento',
            detail: 'Preparo = calcular, medir e montar a dose antes de administrar.',
            icon: 'Calculator',
          },
          {
            label: 'Cálculo de dose',
            detail: 'Saber converter prescrição em volume/mg/UI com unidade métrica correta.',
            icon: 'Scale',
          },
          {
            label: 'Identificação do paciente',
            detail: 'Checar nome na pulseira × etiqueta — etapa de administração, não preparo.',
            icon: 'UserCheck',
          },
          {
            label: 'Via de acesso',
            detail: 'Verificar condições da via (oral, IM, IV) — momento pré-administração.',
            icon: 'Activity',
          },
          {
            label: 'Desinfecção de conexões',
            detail: 'Fricção com álcool antes de acessar — técnica asséptica na administração.',
            icon: 'Shield',
          },
          {
            label: 'Padrão Omni neste tema',
            detail: 'Questão transversal: qual medida pertence especificamente ao preparo seguro.',
            icon: 'Target',
          },
        ],
        footer_rule: 'Preparo = dose exata + unidade métrica | demais = administração',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: qual medida é indicada para preparo seguro do medicamento.',
          'Delimitar “preparo”: calcular, medir e montar a dose — antes de chegar ao leito.',
          'Avaliar A: checar nome pulseira × etiqueta — identificação na administração.',
          'Avaliar B: verificar via de acesso — condição pré-administração, não preparo.',
          'Avaliar C: calcular dose exata e unidade métrica — núcleo do preparo seguro.',
          'Avaliar D: desinfecção de conexões — técnica asséptica na administração IV.',
          'Eliminar A, B e D — medidas válidas, mas da fase de administrar, não preparar.',
          'Localizar alternativa C = saber calcular dose exata e unidade métrica.',
          'Marcar C.',
          'Fixação: preparo = matemática da dose; identificação e via = administração.',
        ],
        footer_rule: 'Roteiro: preparo → cálculo dose exata → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — preparo × administração',
        meta: slideMeta,
        content: 'Preparo = dose exata + unidade métrica',
        rows: [
          { label: 'Preparo seguro', value: 'Calcular dose exata + sistema métrico', badge: 'hot', emphasis: 'success' },
          { label: 'Identificação', value: 'Pulseira × etiqueta — na administração', badge: 'info' },
          { label: 'Via de acesso', value: 'Conferir condições — pré-administração', badge: 'info' },
          { label: 'Desinfecção', value: 'Conexões IV — técnica asséptica ao administrar', badge: 'info' },
          { label: 'Erro comum', value: 'Marcar identificação — é segurança, mas não é preparo', badge: 'warn' },
          { label: 'Erro comum', value: 'Marcar desinfecção — asséptica na administração', badge: 'warn' },
          { label: 'Contexto Omni', value: 'Cálculo de medicamentos — ramo calc_conceito', badge: 'ok' },
        ],
        footer_rule: 'Preparo = calcular | Administrar = identificar + via + técnica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PREPARO SEGURO DO MEDICAMENTO',
        items: [
          {
            label: 'Letra A — checar pulseira × etiqueta',
            detail: 'Medida essencial de segurança — mas ocorre na administração, não no preparo.',
            correct: 'Preparo exige calcular dose exata e unidade métrica — letra C.',
          },
          {
            label: 'Letra B — verificar via de acesso',
            detail: 'Conferir oral, IM, IV periférica/central — etapa pré-administração.',
            correct: 'Preparo = montar a dose correta; via se avalia antes de aplicar.',
          },
          {
            label: 'Letra D — desinfecção de conexões',
            detail: 'Fricção com álcool (≥3 movimentos) — técnica asséptica ao acessar dispositivo.',
            correct: 'Desinfecção protege na administração — preparo foca no cálculo da dose.',
          },
          {
            label: 'Em outra banca — “todas são corretas”',
            detail: 'Todas são boas práticas, mas a prova pede a medida do preparo especificamente.',
            correct: 'Cálculo de dose exata + unidade métrica = núcleo do preparo seguro.',
          },
        ],
        footer_rule: 'Todas são segurança — só C é preparo (cálculo da dose)',
      },
    ],
  },

  'quadrix-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056274291-7': {
    family: 'calc',
    guideline: 'SG 10% de SG 5% 500 mL + glicose 50% — descartar 50 mL, add 55 mL em 450 mL (E)',
    roi_error: 'nao_desprezar_volume_ou_errar_ml_glicose_50',
    exam_vs_current: 'conta da prova — SG 10%: descartar 50 mL + 55 mL glicose 50% em 450 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SG 5% → SG 10% — preparo farmácia',
        meta: slideMeta,
        items: [
          {
            label: 'Prescrição',
            detail: '500 mL de SG a 10% — alvo de concentração (50 g glicose/500 mL).',
            icon: 'Target',
          },
          {
            label: 'Disponível',
            detail: 'Frasco 500 mL SG 5% (25 g) + ampolas 20 mL glicose 50%.',
            icon: 'FlaskConical',
          },
          {
            label: 'Déficit de glicose',
            detail: '10% exige 50 g — frasco 5% traz 25 g → faltam 25 g.',
            icon: 'Calculator',
          },
          {
            label: 'Desprezar volume',
            detail: 'Ao adicionar hipertônico, retirar mL do frasco para não hiperdiluir errado.',
            icon: 'Droplets',
          },
          {
            label: 'Procedimento correto',
            detail: 'Desprezar 50 mL + acrescentar 55 mL glicose 50% em 450 mL SG 5%.',
            icon: 'CheckCircle',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Alternativas A/B/C dizem “não desprezar” — erro ao adicionar hipertônico.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Descartar 50 mL | +55 mL glicose 50% em 450 mL SG 5% → SG 10%',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: preparar 500 mL SG 10% a partir de SG 5% + ampolas glicose 50%.',
          'Fixar meta: SG 10% = 50 g glicose em 500 mL | SG 5% traz 25 g.',
          'Reconhecer: adicionar glicose 50% exige desprezar volume do frasco (hipertônico).',
          'Eliminar A, B e C: “não se deve desprezar” — incorreto ao acrescentar hipertônico.',
          'Eliminar A (55 mL sem descartar): volume final >500 mL — diluição errada.',
          'Eliminar B (75 mL): volume de glicose superestimado.',
          'Eliminar C (25 mL): glicose insuficiente para atingir 10%.',
          'Eliminar D (descartar 80 + add 80): volumes incoerentes com a concentração-alvo.',
          'Localizar alternativa E = desprezar 50 mL + 55 mL glicose 50% em 450 mL.',
          'Marcar E.',
          'Fixação: preparo de SG hipertônico = retirar volume + adicionar glicose 50% calculada.',
        ],
        footer_rule: 'Roteiro: descartar 50 mL + 55 mL glicose 50% → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — SG 10% a partir de 5%',
        meta: slideMeta,
        content: 'Descartar 50 mL + 55 mL glicose 50%',
        rows: [
          { label: 'Prescrito', value: '500 mL SG 10%', badge: 'hot', emphasis: 'highlight' },
          { label: 'Disponível', value: '500 mL SG 5% + amp glicose 50%', badge: 'ok' },
          { label: 'Glicose-alvo', value: '50 g em 500 mL', badge: 'info' },
          { label: 'Glicose no 5%', value: '25 g (500 mL × 5%)', badge: 'ok' },
          { label: 'Procedimento', value: 'Desprezar 50 mL + add 55 mL glicose 50%', badge: 'hot', emphasis: 'success' },
          { label: 'Base final', value: '450 mL SG 5% + 55 mL hipertônico', badge: 'info' },
          { label: 'Erro A/B/C', value: '“Não desprezar” — invalida preparo com hipertônico', badge: 'warn' },
        ],
        footer_rule: 'Hipertônico exige desprezar volume do frasco base',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PREPARO SG 10%',
        items: [
          {
            label: 'Letra A — não desprezar + 55 mL',
            detail: 'Acrescenta hipertônico sem retirar volume — altera concentração final.',
            correct: 'Preparo correto despreza 50 mL antes de adicionar 55 mL glicose 50%.',
          },
          {
            label: 'Letra B — não desprezar + 75 mL',
            detail: '75 mL de glicose 50% superestima — e ainda ignora desprezar volume.',
            correct: '55 mL glicose 50% com desprezo de 50 mL fecha SG 10% na prova.',
          },
          {
            label: 'Letra C — não desprezar + 25 mL',
            detail: '25 mL insuficiente para elevar 5% → 10% — e não despreza volume.',
            correct: 'Alternativa E: desprezar 50 mL + 55 mL em 450 mL SG 5%.',
          },
          {
            label: 'Letra D — desprezar 80 + add 80 mL',
            detail: '80 mL descartados e 80 mL adicionados — escala incoerente com 500 mL-alvo.',
            correct: 'Quadrix: desprezar 50 mL e acrescentar 55 mL glicose 50%.',
          },
        ],
        footer_rule: 'Não desprezar = pegadinha | E = 50 mL out + 55 mL in',
      },
    ],
  },

  'quadrix-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1780000237780-2': {
    family: 'calc',
    guideline: 'Tramadol 2 amp em 100 mL SF 2 h — macrogotas (100×20)÷120 min ≈ 17 gts/min',
    roi_error: 'usar_volume_ampolas_em_vez_de_ml_final_ou_microgotas',
    exam_vs_current: 'conta da prova — 100 mL SF 2 h, macrogotas ≈ 17 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tramadol EV — 100 mL em 2 h',
        meta: slideMeta,
        items: [
          {
            label: 'Caso clínico',
            detail: 'PA 198×110, FC 179, HGT 552 — crise hipertensiva com náusea e tontura.',
            icon: 'Activity',
          },
          {
            label: 'Prescrição',
            detail: 'Tramadol 50 mg — 2 ampolas IV diluídas em 100 mL SF 0,9%, correr em 2 h.',
            icon: 'Syringe',
          },
          {
            label: 'Volume para gotejamento',
            detail: '100 mL de solução final — numerador da fórmula (não 2 mL das ampolas).',
            icon: 'Droplets',
          },
          {
            label: 'Tempo',
            detail: '2 horas → 120 minutos antes de dividir.',
            icon: 'Clock',
          },
          {
            label: 'Equipo macrogotas',
            detail: 'Fator 20 — padrão BR quando não especifica microgotas.',
            icon: 'Gauge',
          },
          {
            label: 'Fórmula',
            detail: 'gts/min = (100 × 20) ÷ 120 = 16,67 ≈ 17.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Usar 2 mL (volume das ampolas) ou 2 h sem converter em 120 min.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '100 mL / 2 h | (100×20)/120 ≈ 17 gts/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler caso clínico: tramadol 50 mg — 2 ampolas diluídas em SF 0,9% 100 mL, correr em 2 horas.',
          'Identificar formato: prescrição tramadol — tempo de gotejamento em gts/min (macrogotas).',
          'Extrair dados: 100 mL SF diluído, correr em 2 horas — macrogotas (fator 20).',
          'Converter tempo: 2 h × 60 = 120 minutos.',
          'Aplicar fórmula: gts/min = (100 × 20) ÷ 120.',
          'Calcular: 2.000 ÷ 120 = 16,67 gotas por minuto.',
          'Arredondar: D = 17 gotas por minuto.',
          'Eliminar A (0,3 gts/min): tempo ~6.667 min — superestima duração.',
          'Eliminar B (2 gts/min): tempo ~1.000 min — infusão de ~16 h.',
          'Eliminar C (12 gts/min): tempo ~167 min — subestima 2 h.',
          'Eliminar E (20 gts/min): tempo ~100 min — só 1 h40 de infusão.',
          'Localizar alternativa D = 17 gotas por minuto.',
          'Marcar D.',
          'Fixação: gotejamento usa mL final diluído (100), não volume das ampolas (2 mL).',
        ],
        footer_rule: 'Roteiro: 100 mL / 120 min → (100×20)/120 ≈ 17 → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — tramadol 100 mL / 2 h',
        meta: slideMeta,
        content: '(100 × 20) ÷ 120',
        rows: [
          { label: 'Volume infusão', value: '100 mL SF (solução final)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Tempo', value: '2 h = 120 min', badge: 'hot' },
          { label: 'Fator', value: '20 gotas/mL (macrogotas)', badge: 'ok' },
          { label: 'Conta', value: '(100×20)÷120 = 16,67 ≈ 17', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 20 gts/min', value: 'tempo ~100 min — infusão mais rápida', badge: 'warn' },
          { label: 'Erro 12 gts/min', value: 'tempo ~167 min — excede 2 h', badge: 'warn' },
          { label: 'Pegadinha', value: 'Usar 2 mL das ampolas em vez de 100 mL diluídos', badge: 'warn' },
        ],
        footer_rule: 'Macrogotas: mL final × 20 ÷ minutos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TRAMADOL 100 mL / 2 H',
        items: [
          {
            label: 'Letra A — 0,3 gotas/min',
            detail: 'Fluxo irreal — tempo efetivo de milhares de minutos.',
            correct: '100 mL em 120 min com fator 20 ≈ 17 gts/min — não 0,3.',
          },
          {
            label: 'Letra B — 2 gotas/min',
            detail: 'Tempo ~1.000 min — infusão de ~16 h em vez de 2 h.',
            correct: 'Use 100 mL diluídos e 120 min na fórmula padrão.',
          },
          {
            label: 'Letra C — 12 gotas/min',
            detail: 'Tempo ~167 min — infusão mais lenta que as 2 h prescritas.',
            correct: '16,67 arredonda para 17 gts/min — alternativa D.',
          },
          {
            label: 'Letra E — 20 gotas/min',
            detail: 'Tempo ~100 min (1 h40) — subestima as 2 h de infusão lenta.',
            correct: 'Tramadol EV lento: 100 mL em 2 h ≈ 17 gts/min.',
          },
        ],
        footer_rule: 'Volume = mL diluídos (100) | Tempo = 120 min | Fator 20',
      },
    ],
  },

  'unifil-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056274291-0': {
    family: 'calc',
    guideline: 'Penicilina 3M UI — frasco 5M UI/10 mL → 3.000.000÷500.000 = 6 mL',
    roi_error: 'usar_volume_diluente_8ml_em_vez_de_volume_final_10ml',
    exam_vs_current: 'conta da prova — 3M UI, 5M UI reconstituído em 10 mL → 6 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Penicilina cristalina — UI para mL',
        meta: slideMeta,
        items: [
          {
            label: 'Paciente',
            detail: 'Idosa 67 anos, internada na clínica médica — infecção do trato respiratório.',
            icon: 'User',
          },
          {
            label: 'Dose prescrita',
            detail: '3.000.000 UI de penicilina cristalina de 12/12 h — alvo em UI.',
            icon: 'Syringe',
          },
          {
            label: 'Frasco disponível',
            detail: '5.000.000 UI reconstituído em 8 mL AD → volume final 10 mL.',
            icon: 'FlaskConical',
          },
          {
            label: 'Concentração final',
            detail: '5.000.000 UI ÷ 10 mL = 500.000 UI/mL — usar volume final, não só 8 mL.',
            icon: 'Calculator',
          },
          {
            label: 'Volume a aspirar',
            detail: '3.000.000 UI ÷ 500.000 UI/mL = 6 mL.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Dividir por 8 mL (diluente) ou usar 5M UI = 10 mL direto (superestima).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão Unifil neste tema',
            detail: 'Antibiótico reconstituído: concentração = UI totais ÷ volume final após AD.',
            icon: 'Target',
          },
        ],
        footer_rule: '5M UI / 10 mL = 500.000 UI/mL | 3M UI = 6 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: penicilina em UI — frasco reconstituído — resposta em mL.',
          'Fixar volume final: 8 mL AD + pó = 10 mL total após reconstituição.',
          'Calcular concentração: 5.000.000 UI ÷ 10 mL = 500.000 UI/mL.',
          'Montar regra de três: 3.000.000 UI ── X mL | 5.000.000 UI ── 10 mL.',
          'Resolver: X = (3.000.000 × 10) ÷ 5.000.000 = 6 mL.',
          'Ou: 3.000.000 ÷ 500.000 = 6 mL.',
          'Eliminar A (5 mL): 2.500.000 UI — subdose de 500.000 UI.',
          'Eliminar B (6,5 mL): 3.250.000 UI — 250.000 UI acima do prescrito.',
          'Eliminar D (4 mL): 2.000.000 UI — subdose de 1.000.000 UI.',
          'Localizar alternativa C = 6 mL.',
          'Marcar C.',
          'Fixação: reconstituição → UI totais ÷ volume final (10 mL), não volume do diluente (8 mL).',
        ],
        footer_rule: 'Roteiro: 5M UI/10 mL → 3M UI = 6 mL → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — penicilina 3M UI',
        meta: slideMeta,
        content: '3.000.000 UI ÷ 500.000 UI/mL',
        rows: [
          { label: 'Prescrito', value: '3.000.000 UI', badge: 'hot', emphasis: 'highlight' },
          { label: 'Frasco', value: '5.000.000 UI + 8 mL AD = 10 mL', badge: 'ok' },
          { label: 'Concentração', value: '5.000.000 ÷ 10 = 500.000 UI/mL', badge: 'hot' },
          { label: 'Volume', value: '3.000.000 ÷ 500.000 = 6 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 5 mL', value: '2.500.000 UI — faltam 500.000 UI', badge: 'warn' },
          { label: 'Erro 4 mL', value: '2.000.000 UI — subdose de 1M UI', badge: 'warn' },
          { label: 'Erro 6,5 mL', value: '3.250.000 UI — 250.000 UI a mais', badge: 'warn' },
        ],
        footer_rule: 'UI totais ÷ volume final pós-reconstituição = UI/mL',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PENICILINA 3M UI',
        items: [
          {
            label: 'Letra A — 5 mL',
            detail: '5 × 500.000 = 2.500.000 UI — faltam 500.000 UI do prescrito.',
            correct: '3.000.000 UI exigem 6 mL na concentração 500.000 UI/mL.',
          },
          {
            label: 'Letra B — 6,5 mL',
            detail: '3.250.000 UI — 250.000 UI acima da prescrição.',
            correct: '3.000.000 ÷ 500.000 = 6 mL exatos — não 6,5 mL.',
          },
          {
            label: 'Letra D — 4 mL',
            detail: '2.000.000 UI — subdose de 1.000.000 UI (1M UI a menos).',
            correct: 'Regra de três com volume final 10 mL fecha em 6 mL.',
          },
          {
            label: 'Em outra banca — 8 mL diluente',
            detail: 'Usar 8 mL em vez de 10 mL final — concentração fica 625.000 UI/mL.',
            correct: 'Volume final após reconstituição = 10 mL (8 mL AD + pó).',
          },
        ],
        footer_rule: 'Concentração = UI do frasco ÷ volume final — não só diluente',
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
    console.log(`[handcraft:calculo-g10] OK ${slug}`);
  }
  console.log(`[handcraft:calculo-g10] total=${ok}`);
}

main();
