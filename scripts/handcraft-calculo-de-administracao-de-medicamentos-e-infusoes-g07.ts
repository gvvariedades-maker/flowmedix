#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — calculo-de-administracao-de-medicamentos-e-infusoes-g07 (8 slugs).
 *
 *   npx tsx scripts/handcraft-calculo-de-administracao-de-medicamentos-e-infusoes-g07.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'calculo-de-administracao-de-medicamentos-e-infusoes-g07';
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
    'insulina U-100',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'calc' | 'conceito' | 'certo_errado';
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
  'ibade-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056301382-8': {
    family: 'calc',
    guideline: 'Decadron 12 mg EV — frasco 4 mg/mL → 12 ÷ 4 = 3,0 mL',
    roi_error: 'usar_volume_total_frasco_em_vez_de_dose',
    exam_vs_current: 'conta da prova — 12 mg prescritos, 4 mg/mL → 3,0 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Decadron 12 mg — mg para mL',
        meta: slideMeta,
        items: [
          {
            label: 'Prescrição',
            detail: 'Decadron (dexametasona) 12 mg via endovenosa — dose-alvo em miligramas.',
            icon: 'Syringe',
          },
          {
            label: 'Estoque da farmácia',
            detail: 'Frasco 4 mg/mL com 2,5 mL totais — concentração para a regra de três.',
            icon: 'FlaskConical',
          },
          {
            label: 'Fórmula direta',
            detail: 'mL = dose (mg) ÷ mg/mL — 12 mg ÷ 4 mg/mL = 3,0 mL.',
            icon: 'Calculator',
          },
          {
            label: 'Volume do frasco',
            detail: '2,5 mL cabem 10 mg — a dose de 12 mg exige aspirar 3,0 mL (ou dois frascos).',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Aspirar 2,5 mL (frasco inteiro = 10 mg) ou 2,0 mL (8 mg) — subdose.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão IBADE neste tema',
            detail: 'Corticóide EV: mg prescritos ÷ concentração mg/mL = volume na seringa.',
            icon: 'Target',
          },
        ],
        footer_rule: '12 mg ÷ 4 mg/mL = 3,0 mL na seringa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: decadron 12 mg EV com frasco 4 mg/mL — resposta em mL.',
          'Fixar concentração: 4 mg em cada 1 mL de solução.',
          'Aplicar regra de três: 12 mg ── X mL | 4 mg ── 1 mL → X = 12 ÷ 4 = 3,0 mL.',
          'Eliminar B (2,0 mL): subdose — 2 mL × 4 mg/mL = 8 mg, faltam 4 mg.',
          'Eliminar C (1,5 mL): 6 mg — menos da metade do prescrito.',
          'Eliminar D (3,5 mL): 14 mg — superestima dose em 2 mg.',
          'Eliminar E (4,5 mL): 18 mg — escala decimal errada.',
          'Localizar alternativa A = 3,0 mL.',
          'Marcar A.',
          'Fixação: dose (mg) ÷ concentração (mg/mL) = volume (mL) — não use o volume total do frasco.',
        ],
        footer_rule: 'Roteiro: 12 mg ÷ 4 mg/mL = 3,0 mL → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — decadron mg/mL',
        meta: slideMeta,
        content: '12 mg ÷ 4 mg/mL',
        rows: [
          { label: 'Prescrito', value: '12 mg EV', badge: 'hot', emphasis: 'highlight' },
          { label: 'Apresentação', value: '4 mg/mL (frasco 2,5 mL)', badge: 'ok' },
          { label: 'Fórmula', value: 'mL = mg ÷ (mg/mL)', badge: 'hot' },
          { label: 'Volume', value: '12 ÷ 4 = 3,0 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 2,0 mL', value: '8 mg — subdose de 4 mg', badge: 'warn' },
          { label: 'Erro 2,5 mL', value: '10 mg — frasco inteiro, ainda faltam 2 mg', badge: 'warn' },
          { label: 'Conferência', value: '3,0 mL × 4 mg/mL = 12 mg', badge: 'ok' },
        ],
        footer_rule: 'mg prescritos ÷ mg/mL = mL — ignore volume total do frasco',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DECADRON 12 mg',
        items: [
          {
            label: 'Letra B — 2,0 mL',
            detail: 'Subdose — 2 mL × 4 mg/mL = 8 mg, faltam 4 mg.',
            correct: '12 mg exigem 3,0 mL na concentração 4 mg/mL — não 2,0 mL.',
          },
          {
            label: 'Letra C — 1,5 mL',
            detail: '6 mg — menos da metade da dose prescrita.',
            correct: '12 mg ÷ 4 mg/mL = 3,0 mL — não 1,5 mL.',
          },
          {
            label: 'Letra D — 3,5 mL',
            detail: '14 mg — 2 mg a mais que o prescrito.',
            correct: '3,0 mL entrega exatamente 12 mg na concentração 4 mg/mL.',
          },
          {
            label: 'Letra E — 4,5 mL',
            detail: '18 mg — escala errada ou multiplica mg × mL.',
            correct: '4,5 mL × 4 = 18 mg — overdose de 6 mg.',
          },
          {
            label: 'Em outra banca — frasco inteiro',
            detail: 'Aspirar 2,5 mL porque é o volume do frasco — ignora a dose.',
            correct: 'Calcule pela prescrição: 12 mg ÷ 4 mg/mL = 3,0 mL.',
          },
        ],
        footer_rule: 'Dose prescrita manda — não o volume do frasco',
      },
    ],
  },

  'ibgp-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056330579-2': {
    family: 'calc',
    guideline: 'Dexametasona diluída — (mg total ÷ mL final) × mL administrados = dose',
    roi_error: 'usar_mg_ampola_sem_proporcionar_diluicao',
    exam_vs_current: 'conta da prova — 10 mg/25 mL, administrar 4 mL → 1,6 mg',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dexametasona diluída — dose parcial',
        meta: slideMeta,
        items: [
          {
            label: 'Ampola original',
            detail: 'Dexametasona 10 mg diluída em SF 0,9% — massa total na solução.',
            icon: 'FlaskConical',
          },
          {
            label: 'Volume final',
            detail: '25 mL após diluição — denominador da concentração.',
            icon: 'Droplets',
          },
          {
            label: 'Volume administrado',
            detail: 'Prescrição solicita 4 mL da solução diluída — fração aspirada.',
            icon: 'Syringe',
          },
          {
            label: 'Concentração',
            detail: '10 mg ÷ 25 mL = 0,4 mg/mL — mg em cada mililitro da bolsa.',
            icon: 'Calculator',
          },
          {
            label: 'Dose no paciente',
            detail: '0,4 mg/mL × 4 mL = 1,6 mg de dexametasona.',
            icon: 'Equal',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Responder 4 mg (metade de 10) ou 10 mg (ampola inteira) — ignora diluição.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão IBGP neste tema',
            detail: 'Diluição: concentração pós-diluição × mL administrados = mg recebidos.',
            icon: 'Target',
          },
        ],
        footer_rule: '(10 mg ÷ 25 mL) × 4 mL = 1,6 mg',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: ampola diluída — calcular mg na fração administrada (4 mL).',
          'Fixar massa total: 10 mg de dexametasona em 25 mL de solução final.',
          'Calcular concentração: 10 mg ÷ 25 mL = 0,4 mg/mL.',
          'Aplicar à fração: 0,4 mg/mL × 4 mL = 1,6 mg.',
          'Eliminar A (0,8 mg): metade de 1,6 — usa 2 mL em vez de 4 mL.',
          'Eliminar B (1,2 mg): proporção 3:5 sem fechar a diluição correta.',
          'Eliminar D (1,9 mg): arredondamento ou divisor 21 mL.',
          'Localizar alternativa C = 1,6 mg.',
          'Marcar C.',
          'Fixação: diluição → mg/mL pós-diluição × mL administrados = dose em mg.',
        ],
        footer_rule: 'Roteiro: 10/25 = 0,4 mg/mL → ×4 mL = 1,6 mg → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — dose após diluição',
        meta: slideMeta,
        content: '(mg total ÷ mL final) × mL admin',
        rows: [
          { label: 'Massa total', value: '10 mg em 25 mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Concentração', value: '10 ÷ 25 = 0,4 mg/mL', badge: 'hot' },
          { label: 'Volume admin', value: '4 mL da solução diluída', badge: 'ok' },
          { label: 'Dose', value: '0,4 × 4 = 1,6 mg', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 0,8 mg', value: '2 mL administrados — metade da fração', badge: 'warn' },
          { label: 'Erro 4 mg', value: '10 mg × (4/10) — ignora diluição em 25 mL', badge: 'warn' },
          { label: 'Regra de três', value: '10 mg ── 1,6 mg | 25 mL ── 4 mL', badge: 'info' },
        ],
        footer_rule: 'Diluído: concentração × mL aspirados = mg administrados',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEXAMETASONA 10 mg / 25 mL',
        items: [
          {
            label: 'Letra A — 0,8 mg',
            detail: 'Metade de 1,6 mg — administraria 2 mL, não 4 mL.',
            correct: '4 mL da solução 0,4 mg/mL = 1,6 mg — não 0,8 mg.',
          },
          {
            label: 'Letra B — 1,2 mg',
            detail: 'Proporção intermediária — não fecha 10 mg em 25 mL.',
            correct: '10 mg ÷ 25 mL × 4 mL = 1,6 mg exatos.',
          },
          {
            label: 'Letra D — 1,9 mg',
            detail: 'Arredondamento para cima ou volume ~4,75 mL na conta.',
            correct: 'Com 4 mL de 0,4 mg/mL, a dose é 1,6 mg — não 1,9 mg.',
          },
          {
            label: 'Em outra banca — ampola inteira',
            detail: 'Responder 10 mg porque a ampola tinha 10 mg — ignora os 4 mL.',
            correct: 'Paciente recebe só a fração: (10/25) × 4 = 1,6 mg.',
          },
          {
            label: 'Em outra banca — 4 mg direto',
            detail: 'Divide 10 mg por 2,5 sem usar o volume final de 25 mL.',
            correct: 'Diluição distribui 10 mg em 25 mL — concentração 0,4 mg/mL.',
          },
        ],
        footer_rule: 'Sempre: mg totais ÷ mL finais × mL administrados',
      },
    ],
  },

  'idecan-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056318806-0': {
    family: 'conceito',
    branch: 'calc_dose_equivalencia',
    guideline: 'Equivalências BR — 20 gotas/mL, 60 microgts/mL, 1 gota = 3 microgotas, U-100 = 100 UI/mL',
    roi_error: 'confundir_u100_com_10_ui_ml_ou_microgotas_35',
    exam_vs_current: 'conta da prova — alternativa correta: 1 mL = 20 gotas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Equivalências IDECAN — decore 20-60-3',
        meta: slideMeta,
        items: [
          {
            label: 'Macrogotas',
            detail: '1 mL = 20 gotas — padrão brasileiro em provas de técnico.',
            icon: 'Droplets',
          },
          {
            label: 'Microgotas',
            detail: '1 mL = 60 microgotas — equipo pediátrico ou microgotejamento.',
            icon: 'Gauge',
          },
          {
            label: 'Relação gota × microgota',
            detail: '1 gota (macrogota) = 3 microgotas — fator de conversão fixo.',
            icon: 'ArrowLeftRight',
          },
          {
            label: 'Insulina U-100',
            detail: '100 unidades internacionais em 1 mL — não 10 UI/mL.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha U-100',
            detail: 'Alternativa diz 10 UI em 1 mL — confunde com escala da seringa de insulina.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão IDECAN neste tema',
            detail: 'Convenções BR: assinale a equivalência correta entre as alternativas.',
            icon: 'Target',
          },
        ],
        footer_rule: 'DECORE: 20 · 60 · 3 | U-100 = 100 UI/mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: equivalências de medidas adotadas no Brasil — assinalar a correta.',
          'Testar A: U-100 com 10 UI em 1 mL — ERRADO (U-100 = 100 UI/mL).',
          'Testar B: 1 mL corresponde a 20 gotas — CORRETO (macrogotas padrão BR).',
          'Testar C: 1 gota possui 35 microgotas — ERRADO (relação é 1:3, não 1:35).',
          'Testar D: 1 macrogota equivale a 10 microgotas — ERRADO (são 3 microgotas).',
          'Eliminar A, C e D — violam decore 20-60-3 ou U-100.',
          'Localizar alternativa B = 1 mL corresponde a 20 gotas.',
          'Marcar B.',
          'Fixação: macrogota 20 | microgota 60 | 1 gota = 3 microgotas | U-100 = 100 UI/mL.',
        ],
        footer_rule: 'Roteiro: só B fecha 1 mL = 20 gotas → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — equivalências BR',
        meta: slideMeta,
        content: '20 · 60 · 3',
        rows: [
          { label: '1 mL', value: '20 gotas (macrogota)', badge: 'hot', emphasis: 'highlight' },
          { label: '1 mL', value: '60 microgotas', badge: 'ok' },
          { label: '1 gota', value: '3 microgotas', badge: 'ok' },
          { label: 'U-100', value: '100 UI em 1 mL', badge: 'hot' },
          { label: 'Erro 10 UI/mL', value: 'U-100 não é 10 UI — é 100 UI por mL', badge: 'warn' },
          { label: 'Erro 35 microgts/gota', value: '1 gota = 3 microgotas — não 35', badge: 'warn' },
          { label: 'Erro 10 microgts/gota', value: '1 macrogota = 3 microgotas — não 10', badge: 'warn' },
        ],
        footer_rule: 'Macrogota 20 | microgota 60 | 1:3 | U-100 = 100 UI/mL',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EQUIVALÊNCIAS IDECAN',
        items: [
          {
            label: 'Letra A — 10 UI em 1 mL',
            detail: 'Confunde U-100 com escala de 10 — insulina comercial é 100 UI/mL.',
            correct: 'U-100 significa 100 unidades internacionais em cada 1 mL — não 10.',
          },
          {
            label: 'Letra C — 35 microgotas por gota',
            detail: 'Inventa relação 1:35 — padrão BR é 1 gota = 3 microgotas.',
            correct: '60 microgotas/mL ÷ 20 gotas/mL = 3 microgotas por gota.',
          },
          {
            label: 'Letra D — 10 microgotas por macrogota',
            detail: 'Superestima relação — seriam 200 microgotas/mL, não 60.',
            correct: '1 macrogota = 3 microgotas — decore 20-60-3.',
          },
          {
            label: 'Em outra banca — fator 30',
            detail: 'Algumas referências antigas citam 30 gotas/mL — IDECAN usa 20.',
            correct: 'Prova técnica BR: 1 mL = 20 gotas (macrogotas).',
          },
        ],
        footer_rule: 'Só 1 mL = 20 gotas fecha — demais alternativas erram decore',
      },
    ],
  },

  'idecan-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1778712108887-0': {
    family: 'calc',
    guideline: 'Ringer Lactato 2.000 mL / 8 h — macrogotas (V×20)÷480 min ≈ 83 gts/min',
    roi_error: 'tempo_em_horas_sem_converter_minutos',
    exam_vs_current: 'conta da prova — 2.000 mL em 8 h, macrogotas ≈ 83 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: '2.000 mL Ringer — 8 horas',
        meta: slideMeta,
        items: [
          {
            label: 'Volume prescrito',
            detail: '2.000 mL de Ringer Lactato — paciente em unidade de queimados.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo de infusão',
            detail: '8 horas → converter em 480 minutos antes de dividir.',
            icon: 'Clock',
          },
          {
            label: 'Equipo macrogotas',
            detail: 'Fator 20 — 1 mL = 20 gotas; padrão quando não há microgotas.',
            icon: 'Gauge',
          },
          {
            label: 'Fórmula canônica',
            detail: 'gts/min = (volume × 20) ÷ tempo em minutos.',
            icon: 'Calculator',
          },
          {
            label: 'Conta fechada',
            detail: '(2.000 × 20) ÷ 480 = 83,33 ≈ 83 gotas por minuto.',
            icon: 'Equal',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Dividir por 8 (horas) em vez de 480 (minutos) — ou arredondar para 93–94.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão IDECAN neste tema',
            detail: 'Grande volume + tempo em horas: converter h→min, arredondar para alternativa mais próxima.',
            icon: 'Target',
          },
        ],
        footer_rule: '8 h = 480 min | (2.000×20)/480 ≈ 83 gts/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 2.000 mL de Ringer Lactato em 8 horas — gts/min.',
          'Converter tempo: 8 h × 60 = 480 minutos.',
          'Aplicar macrogotas: gts/min = (2.000 × 20) ÷ 480.',
          'Calcular: 40.000 ÷ 480 = 83,33 gotas por minuto.',
          'Arredondar para alternativa mais próxima: C = 83 gotas por minuto.',
          'Eliminar A (93): tempo ~430 min ou volume superestimado na conta.',
          'Eliminar B (94): arredondamento para cima sem base — divisor ~426 min.',
          'Eliminar D (84): um gota a mais — arredondamento precoce de 83,33.',
          'Localizar alternativa C = 83 gotas por minuto.',
          'Marcar C.',
          'Fixação: 2.000 mL em 8 h com fator 20 rende ~83 gts/min — não 93 ou 94.',
        ],
        footer_rule: 'Roteiro: 8 h → 480 min → (2.000×20)/480 ≈ 83 → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 2.000 mL / 8 h',
        meta: slideMeta,
        content: '(2.000 × 20) ÷ 480',
        rows: [
          { label: 'Volume', value: '2.000 mL Ringer Lactato', badge: 'ok' },
          { label: 'Tempo', value: '8 h = 480 min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator', value: '20 gotas/mL (macrogotas)', badge: 'ok' },
          { label: 'Fórmula', value: 'gts/min = (V × 20) ÷ min', badge: 'hot' },
          { label: 'Conta', value: '(2.000×20)÷480 = 83,33 ≈ 83', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 93 gts/min', value: 'tempo ~430 min — subestima duração', badge: 'warn' },
          { label: 'Erro 94 gts/min', value: 'divisor ~426 min — arredondamento invertido', badge: 'warn' },
        ],
        footer_rule: 'Macrogotas: (mL × 20) ÷ minutos, arredonde',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 2.000 mL / 8 HORAS',
        items: [
          {
            label: 'Letra A — 93 gotas/min',
            detail: 'Fluxo maior — tempo efetivo ~430 min ou volume reduzido na regra.',
            correct: '2.000 mL em 480 min com fator 20 ≈ 83 gts/min — não 93.',
          },
          {
            label: 'Letra B — 94 gotas/min',
            detail: 'Arredonda para cima sem base — divisor ainda menor (~426 min).',
            correct: '83,33 gotas/min arredonda para 83 — alternativa C.',
          },
          {
            label: 'Letra D — 84 gotas/min',
            detail: 'Um gota a mais — arredondamento precoce ou tempo 475 min.',
            correct: '40.000 ÷ 480 = 83,33 — mais próximo de 83 que de 84.',
          },
          {
            label: 'Em outra banca — dividir por 8',
            detail: 'Usa 8 horas direto na fórmula sem converter em minutos.',
            correct: 'Sempre: horas × 60 = minutos → depois (V×20)÷min.',
          },
        ],
        footer_rule: 'Horas × 60 = minutos — depois (2.000 × 20) ÷ 480 ≈ 83',
      },
    ],
  },

  'idecan-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1778712108887-1': {
    family: 'conceito',
    branch: 'calc_dose_equivalencia',
    guideline: 'Equivalências BR — 20 gotas/mL, 60 microgts/mL, 1 gota = 3 microgotas, U-100 = 100 UI/mL',
    roi_error: 'confundir_u100_com_10_ui_ml_ou_microgotas_35',
    exam_vs_current: 'conta da prova — alternativa correta: 1 mL = 20 gotas (item duplicado)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Equivalências IDECAN — decore 20-60-3',
        meta: slideMeta,
        items: [
          {
            label: 'Macrogotas',
            detail: '1 mL = 20 gotas — convenção adotada em provas IDECAN de enfermagem.',
            icon: 'Droplets',
          },
          {
            label: 'Microgotas',
            detail: '1 mL = 60 microgotas — equipo de microgotejamento.',
            icon: 'Gauge',
          },
          {
            label: 'Relação 1:3',
            detail: 'Cada macrogota equivale a 3 microgotas — 60 ÷ 20 = 3.',
            icon: 'ArrowLeftRight',
          },
          {
            label: 'Insulina U-100',
            detail: '100 UI por 1 mL — seringa graduada em unidades, não em 10 UI/mL.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha microgotas',
            detail: 'Alternativas citam 35 ou 10 microgotas por gota — números inventados.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão IDECAN neste tema',
            detail: 'Item recorrente: assinale a equivalência correta entre medidas BR.',
            icon: 'Target',
          },
        ],
        footer_rule: 'DECORE: 20 · 60 · 3 | U-100 = 100 UI/mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: convenções de medidas e equivalências no Brasil — alternativa correta.',
          'Eliminar A: U-100 com 10 UI em 1 mL — U-100 = 100 UI/mL, não 10.',
          'Testar B: 1 mL corresponde a 20 gotas — fecha o padrão macrogotas BR.',
          'Eliminar C: 1 gota = 35 microgotas — relação correta é 1:3.',
          'Eliminar D: 1 macrogota = 10 microgotas — superestima (seriam 200 microgts/mL).',
          'Localizar alternativa B = 1 mL corresponde a 20 gotas.',
          'Marcar B.',
          'Fixação: decore 20-60-3 e U-100 = 100 UI/mL — item clássico IDECAN.',
        ],
        footer_rule: 'Roteiro: equivalência correta = 1 mL = 20 gotas → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — equivalências BR',
        meta: slideMeta,
        content: '20 · 60 · 3',
        rows: [
          { label: '1 mL', value: '20 gotas (macrogota)', badge: 'hot', emphasis: 'highlight' },
          { label: '1 mL', value: '60 microgotas', badge: 'ok' },
          { label: '1 gota', value: '3 microgotas', badge: 'ok' },
          { label: 'U-100', value: '100 UI em 1 mL', badge: 'hot' },
          { label: 'Erro 10 UI/mL', value: 'U-100 não equivale a 10 UI por mL', badge: 'warn' },
          { label: 'Erro 35 microgts', value: '1 gota = 3 microgotas — não 35', badge: 'warn' },
          { label: 'Erro 10 microgts', value: '1 macrogota = 3 microgotas — não 10', badge: 'warn' },
        ],
        footer_rule: 'Macrogota 20 | microgota 60 | 1:3 | U-100 = 100 UI/mL',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EQUIVALÊNCIAS IDECAN (DUPLICATA)',
        items: [
          {
            label: 'Letra A — 10 UI em 1 mL',
            detail: 'Troca U-100 por escala de dezena — insulina padrão tem 100 UI/mL.',
            correct: 'U-100: cem unidades internacionais em cada mililitro.',
          },
          {
            label: 'Letra C — 35 microgotas por gota',
            detail: 'Número aleatório — não deriva de 60÷20.',
            correct: '60 microgotas/mL ÷ 20 gotas/mL = 3 microgotas por gota.',
          },
          {
            label: 'Letra D — 10 microgotas por macrogota',
            detail: 'Relação 1:10 geraria 200 microgotas/mL — inconsistente com 60.',
            correct: 'Padrão BR: 1 macrogota = 3 microgotas.',
          },
          {
            label: 'Em outra banca — item repetido',
            detail: 'Mesma questão em outra prova IDECAN — mesma resposta.',
            correct: '1 mL = 20 gotas permanece a equivalência correta.',
          },
        ],
        footer_rule: 'Item duplicado — mesma lógica: B = 1 mL = 20 gotas',
      },
    ],
  },

  'idecan-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1778712122855-9': {
    family: 'calc',
    guideline: 'VF equivalências — 1 mL ≠ 30 gotas ≠ 90 microgotas; padrão BR é 20/60',
    roi_error: 'usar_fator_30_ou_relacao_1_3_invertida',
    exam_vs_current: 'conta da prova — afirmativa ERRADA: padrão é 20 gotas/mL e 60 microgts/mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'VF — equivalências 30/90',
        meta: slideMeta,
        items: [
          {
            label: 'Afirmativa da prova',
            detail: '1 mL = 30 gotas = 90 microgotas — item Certo/Errado IDECAN.',
            icon: 'FileText',
          },
          {
            label: 'Padrão macrogotas BR',
            detail: '1 mL = 20 gotas — não 30 gotas por mililitro.',
            icon: 'Droplets',
          },
          {
            label: 'Padrão microgotas BR',
            detail: '1 mL = 60 microgotas — não 90 microgotas por mililitro.',
            icon: 'Gauge',
          },
          {
            label: 'Relação correta',
            detail: '20 gotas × 3 microgotas = 60 microgotas/mL — decore 20-60-3.',
            icon: 'ArrowLeftRight',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Aceitar 30/90 porque “soa proporcional” — multiplica 20×1,5 e 60×1,5.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão IDECAN neste tema',
            detail: 'C/E de equivalências: confrontar com decore 20-60-3.',
            icon: 'Target',
          },
        ],
        footer_rule: 'Padrão BR: 20 gotas/mL e 60 microgts/mL — não 30/90',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Item C/E de equivalências: 1 mL é igual a 30 gotas, que é igual a 90 microgotas.',
          'Recuperar equivalências padrão BR: 1 mL = 20 gotas = 60 microgotas (regra de três 20-60-3).',
          'Confrontar macrogotas: padrão BR = 20 gotas/mL — não 30.',
          'Confrontar microgotas: padrão BR = 60 microgotas/mL — não 90.',
          'Verificar proporção: 30 gotas × 3 = 90 microgotas seria coerente internamente, mas a base 30 está errada.',
          'A afirmativa viola decore 20-60-3 em ambos os fatores.',
          'Eliminar A (Certo): números 30 e 90 não correspondem ao padrão brasileiro.',
          'Localizar alternativa B = Errado.',
          'Marcar B.',
          'Fixação: 1 mL = 20 gotas = 60 microgotas (não 30/90).',
        ],
        footer_rule: 'Roteiro: 30/90 ≠ padrão BR → Errado → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — padrão vs afirmativa',
        meta: slideMeta,
        content: '20 · 60 · 3',
        rows: [
          { label: 'Padrão 1 mL', value: '20 gotas (macrogota)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Padrão 1 mL', value: '60 microgotas', badge: 'ok' },
          { label: 'Afirmativa prova', value: '30 gotas = 90 microgotas', badge: 'warn' },
          { label: 'Macrogotas', value: '30 ≠ 20 — primeiro fator errado', badge: 'warn' },
          { label: 'Microgotas', value: '90 ≠ 60 — segundo fator errado', badge: 'warn' },
          { label: 'Relação 1:3', value: '20 gotas × 3 = 60 microgotas/mL', badge: 'info' },
        ],
        footer_rule: 'BR: 20 gotas e 60 microgotas por mL — não 30/90',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — C/E 30 GOTAS / 90 MICROGOTAS',
        items: [
          {
            label: 'Marcar Certo (A)',
            detail: 'Aceita 30/90 porque a proporção interna 1:3 parece coerente.',
            correct: 'A base está errada: 1 mL = 20 gotas e 60 microgotas — afirmativa é falsa.',
          },
          {
            label: 'Confundir com fator 30',
            detail: 'Algumas referências antigas citam 30 gotas/mL — IDECAN cobra 20.',
            correct: 'Prova técnica BR: macrogotas = 20 gotas/mL.',
          },
          {
            label: 'Multiplicar 20 × 1,5',
            detail: 'Deriva 30 e 90 multiplicando o padrão por 1,5 — sem base normativa.',
            correct: 'Decore fixo: 20-60-3 — não escale por 1,5.',
          },
        ],
        footer_rule: 'Errado — padrão é 20 gotas/mL e 60 microgts/mL',
      },
    ],
  },

  'idecan-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1780066909125-6': {
    family: 'calc',
    guideline: 'SF 750 mL / 2 h — macrogotas (V×20)÷120 min = 125 gts/min',
    roi_error: 'tempo_em_horas_sem_converter_minutos',
    exam_vs_current: 'conta da prova — 750 mL SF 0,9% em 2 h = 125 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SF 750 mL — 2 horas',
        meta: slideMeta,
        items: [
          {
            label: 'Solução prescrita',
            detail: '750 mL de soro fisiológico 0,9% — volume do enunciado.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo de infusão',
            detail: '2 horas = 120 minutos — converter antes da fórmula.',
            icon: 'Clock',
          },
          {
            label: 'Equipo macrogotas',
            detail: 'Fator 20 — 1 mL = 20 gotas; padrão quando não especifica microgotas.',
            icon: 'Gauge',
          },
          {
            label: 'Fórmula',
            detail: 'gts/min = (750 × 20) ÷ 120 = 125 gotas por minuto.',
            icon: 'Calculator',
          },
          {
            label: 'Conta exata',
            detail: '15.000 gotas ÷ 120 min = 125 gts/min — sem arredondamento.',
            icon: 'Equal',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Dividir por 2 (horas) em vez de 120 (minutos) — ou errar fator 20.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão IDECAN neste tema',
            detail: 'Infusão simples: volume + tempo em horas → converter e aplicar fator 20.',
            icon: 'Target',
          },
        ],
        footer_rule: '2 h = 120 min | (750×20)/120 = 125 gts/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 750 mL de SF 0,9% para correr em 2 horas — gts/min.',
          'Converter tempo: 2 h × 60 = 120 minutos.',
          'Aplicar macrogotas: gts/min = (750 × 20) ÷ 120.',
          'Calcular: 15.000 ÷ 120 = 125 gotas por minuto.',
          'Eliminar A (120 gts/min): tempo 125 min ou volume 720 mL na conta.',
          'Eliminar C (130 gts/min): tempo ~115 min — subestima duração.',
          'Eliminar D (135 gts/min): divide por ~111 min ou usa fator 22.',
          'Localizar alternativa B = 125 gotas por minuto.',
          'Marcar B.',
          'Fixação: 750 mL em 2 h com fator 20 fecha exatamente em 125 gts/min.',
        ],
        footer_rule: 'Roteiro: 2 h → 120 min → (750×20)/120 = 125 → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 750 mL / 2 h',
        meta: slideMeta,
        content: '(750 × 20) ÷ 120',
        rows: [
          { label: 'Volume', value: '750 mL SF 0,9%', badge: 'ok' },
          { label: 'Tempo', value: '2 h = 120 min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator', value: '20 gotas/mL', badge: 'ok' },
          { label: 'Conta', value: '(750×20)÷120 = 125 gts/min', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 120 gts/min', value: 'tempo 125 min — 5 min a mais', badge: 'warn' },
          { label: 'Erro 130 gts/min', value: 'tempo ~115 min — infusão mais rápida', badge: 'warn' },
          { label: 'SF 0,9%', value: 'Tipo de soro não altera gts/min — só mL e tempo', badge: 'info' },
        ],
        footer_rule: 'Macrogotas: (mL × 20) ÷ minutos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SF 750 mL / 2 HORAS',
        items: [
          {
            label: 'Letra A — 120 gotas/min',
            detail: '5 gts/min a menos — tempo efetivo 125 min em vez de 120.',
            correct: '750 mL em 120 min com fator 20 = 125 gts/min — não 120.',
          },
          {
            label: 'Letra C — 130 gotas/min',
            detail: 'Infusão mais rápida — tempo ~115 min na regra inversa.',
            correct: '15.000 gotas ÷ 120 min = 125 exatos.',
          },
          {
            label: 'Letra D — 135 gotas/min',
            detail: 'Divide por ~111 min ou aplica fator diferente de 20.',
            correct: 'Com 120 min e fator 20, o fluxo é 125 gts/min.',
          },
          {
            label: 'Em outra banca — dividir por 2',
            detail: 'Usa 2 horas direto: (750×20)/2 = 7.500 — escala absurda.',
            correct: 'Converter horas em minutos (×60) antes de dividir.',
          },
        ],
        footer_rule: '2 h = 120 min — (750 × 20) ÷ 120 = 125',
      },
    ],
  },

  'idecan-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1780066909125-7': {
    family: 'conceito',
    branch: 'calc_dose_equivalencia',
    guideline: 'Insulina U-100 — 100 unidades internacionais em cada 1 mL de solução',
    roi_error: 'confundir_u100_com_10_ml_ou_0_1_ml',
    exam_vs_current: 'conta da prova — lacuna = 1 mL (U-100 = 100 UI/mL)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Insulina U-100 — lacuna',
        meta: slideMeta,
        items: [
          {
            label: 'Concentração U-100',
            detail: 'Preparações de insulina no Brasil: 100 UI em cada 1 mL.',
            icon: 'Pill',
          },
          {
            label: 'Lacuna do enunciado',
            detail: '“Em cada ___ de solução há 100 unidades” — completar o volume.',
            icon: 'FileText',
          },
          {
            label: 'Resposta',
            detail: '1 mL — a letra “U” significa unidades por mililitro (U-100).',
            icon: 'Droplets',
          },
          {
            label: 'Seringa de insulina',
            detail: 'Graduada em unidades — mas a concentração do frasco é UI/mL.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Responder 10 mL ou 0,1 mL — confunde escala ou inverte a proporção.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão IDECAN neste tema',
            detail: 'Conceito U-100: decore 100 UI = 1 mL — item de completar frase.',
            icon: 'Target',
          },
        ],
        footer_rule: 'U-100 = 100 UI em 1 mL de solução',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: completar frase sobre insulina U-100 — volume com 100 UI.',
          'Recuperar definição: U-100 = 100 unidades internacionais por mililitro.',
          'Eliminar B (10 mL): 10 mL teriam 1.000 UI — escala decimal errada.',
          'Eliminar C (0,1 mL): 0,1 mL = 10 UI — um décimo da concentração U-100.',
          'Eliminar D (0,10 mL): equivalente a 0,1 mL — mesma subdose de 10 UI.',
          'Localizar alternativa A = 1 mL.',
          'Marcar A.',
          'Fixação: U-100 → 100 UI em 1 mL — não confunda com seringa de 10 UI ou 0,1 mL.',
        ],
        footer_rule: 'Roteiro: U-100 → 100 UI em 1 mL → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — insulina U-100',
        meta: slideMeta,
        content: '100 UI = 1 mL',
        rows: [
          { label: 'U-100', value: '100 UI em 1 mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Definição', value: '“U” = unidades por mililitro', badge: 'ok' },
          { label: 'Lacuna', value: 'Em cada 1 mL há 100 unidades', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 10 mL', value: '1.000 UI — escala ×10', badge: 'warn' },
          { label: 'Erro 0,1 mL', value: '10 UI — escala ÷10', badge: 'warn' },
          { label: 'Seringa UI', value: 'Graduação em unidades — frasco mantém 100 UI/mL', badge: 'info' },
        ],
        footer_rule: 'Insulina U-100: 100 unidades por mililitro',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — U-100 LACUNA',
        items: [
          {
            label: 'Letra B — 10 mL',
            detail: 'Confunde U-100 com “10” na escala — 10 mL = 1.000 UI.',
            correct: 'U-100 significa 100 UI em 1 mL — não em 10 mL.',
          },
          {
            label: 'Letra C — 0,1 mL',
            detail: 'Inverte: 0,1 mL contém 10 UI, não 100 UI.',
            correct: '100 UI ocupam 1 mL na concentração U-100.',
          },
          {
            label: 'Letra D — 0,10 mL',
            detail: 'Mesmo erro de C com notação decimal — 10 UI, não 100.',
            correct: '0,1 mL × 100 UI/mL = 10 UI — um décimo do frasco U-100.',
          },
          {
            label: 'Em outra banca — U-500',
            detail: 'Insulina U-500: 500 UI em 1 mL — concentração diferente.',
            correct: 'Enunciado fixa U-100 → 100 UI = 1 mL.',
          },
        ],
        footer_rule: 'U-100 = 1 mL com 100 UI — não 10 mL nem 0,1 mL',
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
    console.log(`[handcraft:calculo-g07] OK ${slug}`);
  }
  console.log(`[handcraft:calculo-g07] total=${ok}`);
}

main();
