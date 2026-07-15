#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — calculo-de-administracao-de-medicamentos-e-infusoes-g06 (8 slugs).
 *
 *   npx tsx scripts/handcraft-calculo-de-administracao-de-medicamentos-e-infusoes-g06.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'calculo-de-administracao-de-medicamentos-e-infusoes-g06';
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
    'gts/min fator 20',
    'mL/h conversão',
    'UI/mL insulina',
    'tempo de infusão inversa',
    'diluição pós-mistura',
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
  'fundatec-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056274291-8': {
    family: 'calc',
    guideline: '40 gts/min macrogotas → mL/h = gts/min × 3 = 120 mL/h',
    roi_error: 'nao_converter_gts_min_para_ml_h',
    exam_vs_current: 'conta da prova — 40 gts/min em macrogotas = 120 mL/h na bomba',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Bomba ml/h — converter gts/min',
        meta: slideMeta,
        items: [
          { label: 'Transporte SAMU', detail: 'Serviço de Atendimento Médico de Urgência — paciente crítico entre hospitais.', icon: 'Ambulance' },
          { label: 'Prescrição EV', detail: 'Água destilada 900 mL + bicarbonato 100 mL — infundir a 40 gotas/min.', icon: 'Droplets' },
          { label: 'Pronto-Atendimento', detail: 'Paciente 62 anos internado — bomba programada em mL/h.', icon: 'Hospital' },
          { label: 'Equipo macrogotas', detail: 'Fator 20 — mL/h = gts/min × 3.', icon: 'Gauge' },
          { label: 'Conta', detail: '40 gts/min × 3 = 120 mL/h na bomba.', icon: 'Zap' },
          { label: 'Pegadinha clássica', detail: 'Responder 40 mL/h (copia gts/min) ou 80 mL/h (dobra sem base).', icon: 'AlertTriangle' },
          { label: 'Padrão Fundatec SAMU', detail: 'Transporte crítico: converter gotejamento para programação da bomba.', icon: 'Ambulance' },
        ],
        footer_rule: 'Macrogotas: mL/h = gts/min × 3 | 40 → 120 mL/h',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler cenário SAMU: transporte de paciente crítico — água destilada 900 mL + bicarbonato 100 mL a 40 gotas/min.',
          'Identificar formato: prescrição em gts/min, bomba de infusão programa em mL/h.',
          'Somar volume: 900 mL + 100 mL = 1.000 mL (não altera conversão de taxa).',
          'Fixar macrogotas: fator 20 → conversão mL/h = gts/min × 3.',
          'Aplicar: 40 gts/min × 3 = 120 mL/h.',
          'Eliminar A (40 mL/h): copia o gts/min sem converter.',
          'Eliminar B (80 mL/h), C (90 mL/h) e D (100 mL/h): fatores intermediários sem fórmula.',
          'Localizar alternativa E = 120 mL/h.',
          'Marcar E.',
          'Fixação: gts/min → mL/h em macrogotas: multiplique por 3.',
        ],
        footer_rule: 'Roteiro: 40 gts/min × 3 = 120 mL/h → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — gts/min → mL/h',
        meta: slideMeta,
        content: 'mL/h = gts/min × 3',
        rows: [
          { label: 'Gotejamento', value: '40 gts/min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator macrogotas', value: '20 gotas/mL', badge: 'ok' },
          { label: 'Fórmula', value: '(gts/min × 60) ÷ 20 = gts/min × 3', badge: 'hot' },
          { label: 'Bomba', value: '40 × 3 = 120 mL/h', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 40 mL/h', value: 'copia gts/min — unidades diferentes', badge: 'warn' },
          { label: 'Volume 1.000 mL', value: 'não entra na conversão gts/min↔mL/h', badge: 'info' },
        ],
        footer_rule: 'Macrogotas: mL/h = gts/min × 3',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 40 GTS/MIN → BOMBA',
        items: [
          { label: 'Letra A — 40 ml/h', detail: 'Copia gts/min sem converter — unidade errada.', correct: '40 gts/min = 120 mL/h em macrogotas.' },
          { label: 'Letra B — 80 ml/h', detail: 'Dobra sem base — fator 2× incorreto.', correct: 'Fórmula canônica: ×3, não ×2.' },
          { label: 'Letra C — 90 ml/h', detail: 'Fator 2,25 — aritmética sem relação com fator 20.', correct: '40 × 3 = 120 mL/h.' },
          { label: 'Letra D — 100 ml/h', detail: 'Aproximação errada entre 80 e 120.', correct: 'Conversão exata: 120 mL/h.' },
          { label: 'Em outra banca — microgotas', detail: 'Fator 60: mL/h = gts/min (não ×3).', correct: 'Enunciado fixa macrogotas — use ×3.' },
        ],
        footer_rule: 'gts/min × 3 = mL/h (macrogotas)',
      },
    ],
  },

  'fundatec-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056284398-0': {
    family: 'calc',
    guideline: 'Insulina NPH 40 UI — padrão 100 UI/mL → 0,4 mL',
    roi_error: 'confundir_UI_com_mL_ou_seringa_3_mL',
    exam_vs_current: 'conta da prova — 40 UI, insulina 100 UI/mL → 0,4 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Insulina NPH — UI para mL',
        meta: slideMeta,
        items: [
          { label: 'Prescrição NPH', detail: 'Insulina NPH 40 UI por via subcutânea — posto de enfermagem.', icon: 'Syringe' },
          { label: 'Apresentação padrão', detail: 'Insulina humana 100 UI/mL — aspirar quantos mL cumprir prescrição.', icon: 'FlaskConical' },
          { label: 'Seringa disponível', detail: 'Seringa de 3 mL no posto — capacidade, não concentração.', icon: 'Droplets' },
          { label: 'Cálculo', detail: '40 UI ÷ 100 UI/mL = 0,4 mL.', icon: 'Calculator' },
          { label: 'Pegadinha clássica', detail: 'Responder 0,1 mL (10 UI) ou 1,2 mL (120 UI).', icon: 'AlertTriangle' },
          { label: 'Padrão Fundatec', detail: 'Insulina: UI ÷ UI/mL = mL — seringa de insulina em UI.', icon: 'Target' },
        ],
        footer_rule: '40 UI ÷ 100 UI/mL = 0,4 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler prescrição: Insulina NPH 40 UI por via subcutânea — posto dispõe seringa de 3 mL.',
          'Identificar formato: insulina em UI, resposta em mL a aspirar.',
          'Fixar concentração padrão: 100 UI/mL (insulina de prova).',
          'Calcular: 40 UI ÷ 100 UI/mL = 0,4 mL.',
          'Eliminar A (0,1 mL): 10 UI — subdose de 30 UI.',
          'Eliminar B (0,3 mL): 30 UI — ainda 10 UI abaixo.',
          'Eliminar D (1,2 mL) e E (2,5 mL): superestimam gravemente.',
          'Localizar alternativa C = 0,4 mL.',
          'Marcar C.',
          'Fixação: UI prescritas ÷ 100 = mL (insulina padrão).',
        ],
        footer_rule: 'Roteiro: 40 UI ÷ 100 = 0,4 mL → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — insulina UI/mL',
        meta: slideMeta,
        content: 'UI ÷ 100 = mL',
        rows: [
          { label: 'Prescrito', value: '40 UI NPH', badge: 'hot', emphasis: 'highlight' },
          { label: 'Concentração', value: '100 UI/mL (padrão)', badge: 'ok' },
          { label: 'Volume', value: '40 ÷ 100 = 0,4 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Seringa 3 mL', value: 'capacidade — não altera a conta', badge: 'info' },
          { label: 'Erro 0,1 mL', value: '10 UI — subdose', badge: 'warn' },
          { label: 'Erro 1,2 mL', value: '120 UI — overdose tripla', badge: 'warn' },
        ],
        footer_rule: 'Insulina: UI ÷ 100 UI/mL = mL',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INSULINA NPH 40 UI',
        items: [
          { label: 'Letra A — 0,1 mL', detail: '10 UI — subdose de 30 UI.', correct: '40 UI exigem 0,4 mL na concentração 100 UI/mL.' },
          { label: 'Letra B — 0,3 mL', detail: '30 UI — 10 UI abaixo do prescrito.', correct: '40 ÷ 100 = 0,4 mL exatos.' },
          { label: 'Letra D — 1,2 mL', detail: '120 UI — dose triplicada.', correct: '0,4 mL entregam exatamente 40 UI.' },
          { label: 'Letra E — 2,5 mL', detail: '250 UI — escala absurda, confunde seringa com dose.', correct: 'UI ÷ 100 = mL — 0,4 mL.' },
          { label: 'Em outra banca — U-500', detail: 'Insulina concentrada 500 UI/mL — recalcule.', correct: 'Prova técnica padrão: 100 UI/mL.' },
        ],
        footer_rule: '40 UI com 100 UI/mL = 0,4 mL',
      },
    ],
  },

  'fundatec-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056292978-6': {
    family: 'calc',
    guideline: 'Infusão inversa — 500 mL a 100 gts/min → tempo = 100 min = 1h40m',
    roi_error: 'inverter_formula_tempo_volume',
    exam_vs_current: 'conta da prova — 500 mL, 100 gts/min → 1h40min',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tempo de infusão — conta inversa',
        meta: slideMeta,
        items: [
          { label: 'Dado', detail: '500 mL infundidos a 100 gotas por minuto.', icon: 'Droplets' },
          { label: 'Total de gotas', detail: '500 mL × 20 gotas/mL = 10.000 gotas.', icon: 'Calculator' },
          { label: 'Tempo', detail: '10.000 gotas ÷ 100 gts/min = 100 minutos.', icon: 'Clock' },
          { label: 'Conversão', detail: '100 min = 1 hora e 40 minutos.', icon: 'Timer' },
          { label: 'Pegadinha clássica', detail: 'Responder 1h04m (divide 500 por 100) ou 40 min (esquece fator 20).', icon: 'AlertTriangle' },
          { label: 'Padrão Fundatec', detail: 'Prova inverte: dado fluxo, pede tempo — não confunda com gts/min direto.', icon: 'Target' },
        ],
        footer_rule: 'Tempo (min) = (mL × 20) ÷ gts/min | 500 mL / 100 = 100 min = 1h40m',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: volume e gts/min dados — pede tempo de infusão.',
          'Calcular gotas totais: 500 mL × 20 = 10.000 gotas.',
          'Dividir pelo fluxo: 10.000 ÷ 100 = 100 minutos.',
          'Converter: 100 min = 1 hora e 40 minutos.',
          'Eliminar B (1h04m): divide 500 por 100 sem fator 20.',
          'Eliminar C (1h20m), D (44 min) e E (40 min): tempos incoerentes.',
          'Localizar alternativa A = uma hora e quarenta minutos.',
          'Marcar A.',
          'Fixação: tempo = (volume × 20) ÷ gts/min — depois converta min em h+min.',
        ],
        footer_rule: 'Roteiro: 10.000÷100 = 100 min = 1h40m → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — tempo de infusão',
        meta: slideMeta,
        content: '(mL × 20) ÷ gts/min',
        rows: [
          { label: 'Volume', value: '500 mL', badge: 'ok' },
          { label: 'Gotas totais', value: '500 × 20 = 10.000', badge: 'info' },
          { label: 'Fluxo', value: '100 gts/min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Tempo', value: '10.000 ÷ 100 = 100 min', badge: 'hot' },
          { label: 'Resposta', value: '1 h e 40 min', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 1h04m', value: '500÷100 sem ×20 — ignora fator gotas', badge: 'warn' },
        ],
        footer_rule: 'Conta inversa: gotas totais ÷ gts/min = minutos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TEMPO 500 mL / 100 GTS/MIN',
        items: [
          { label: 'Letra B — 1h04min', detail: '500 ÷ 100 = 5 — confunde mL com gotas.', correct: '10.000 gotas ÷ 100 = 100 min = 1h40m.' },
          { label: 'Letra C — 1h20min', detail: '80 min — fluxo ~125 gts/min na conta invertida.', correct: 'Com 100 gts/min, o tempo é 100 min.' },
          { label: 'Letra D — 44 min', detail: 'Tempo ~44 min — escala sem fator 20.', correct: 'Sempre: mL × 20 = gotas totais primeiro.' },
          { label: 'Letra E — 40 min', detail: 'Esquece fator 20 — divide 500×2 por 100.', correct: '500 × 20 = 10.000 gotas → 100 min.' },
          { label: 'Em outra banca — microgotas', detail: 'Fator 60: gotas totais = mL × 60.', correct: 'Macrogotas: ×20 antes de dividir pelo fluxo.' },
        ],
        footer_rule: '(mL×20)÷gts/min = min → converta em h+min',
      },
    ],
  },

  'fundep-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056292978-3': {
    family: 'calc',
    guideline: 'Dexametasona 2 mg — frasco 4 mg/mL (2,5 mL) → 0,5 mL',
    roi_error: 'aspirar_frasco_inteiro_2_5_mL',
    exam_vs_current: 'conta da prova — 2 mg, 4 mg/mL → 0,5 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dexametasona EV — 2 mg',
        meta: slideMeta,
        items: [
          { label: 'Prescrição', detail: '2 mg de Dexametasona EV — dose fracionada.', icon: 'Syringe' },
          { label: 'Frasco', detail: '2,5 mL com 4 mg/mL — concentração explícita.', icon: 'FlaskConical' },
          { label: 'Cálculo', detail: '2 mg ÷ 4 mg/mL = 0,5 mL.', icon: 'Calculator' },
          { label: 'Capacidade', detail: 'Frasco 2,5 mL = 10 mg total — 0,5 mL cabe.', icon: 'Droplets' },
          { label: 'Pegadinha clássica', detail: 'Responder 2,5 mL (frasco inteiro) ou 0,4 mL (1,6 mg).', icon: 'AlertTriangle' },
          { label: 'Padrão Fundep', detail: 'Corticoides EV: mg ÷ mg/mL, fracionar frasco-ampola.', icon: 'Target' },
        ],
        footer_rule: '2 mg ÷ 4 mg/mL = 0,5 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 2 mg prescritos, frasco 2,5 mL (4 mg/mL).',
          'Fixar concentração: 4 mg/mL.',
          'Calcular: 2 mg ÷ 4 mg/mL = 0,5 mL.',
          'Eliminar A (2,5 mL): frasco inteiro — 10 mg, overdose.',
          'Eliminar C (0,4 mL): 1,6 mg — subdose de 0,4 mg.',
          'Eliminar D (1,5 mL): 6 mg — triplica a dose.',
          'Localizar alternativa B = 0,5 mL.',
          'Marcar B.',
          'Fixação: dose pequena em frasco concentrado — fraciona, não usa inteiro.',
        ],
        footer_rule: 'Roteiro: 2 ÷ 4 = 0,5 mL → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Dexametasona 2 mg',
        meta: slideMeta,
        content: '2 mg ÷ 4 mg/mL',
        rows: [
          { label: 'Prescrito', value: '2 mg EV', badge: 'hot', emphasis: 'highlight' },
          { label: 'Concentração', value: '4 mg/mL', badge: 'ok' },
          { label: 'Volume', value: '2 ÷ 4 = 0,5 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Frasco 2,5 mL', value: '10 mg total — fracionar', badge: 'info' },
          { label: 'Erro 2,5 mL', value: '10 mg — 5× a dose', badge: 'warn' },
          { label: 'Erro 0,4 mL', value: '1,6 mg — subdose', badge: 'warn' },
        ],
        footer_rule: '2 mg com 4 mg/mL = 0,5 mL',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEXAMETASONA 2 mg',
        items: [
          { label: 'Letra A — 2,5 mL', detail: 'Frasco inteiro — 10 mg, overdose 5×.', correct: '2 mg exigem 0,5 mL na concentração 4 mg/mL.' },
          { label: 'Letra C — 0,4 mL', detail: '1,6 mg — 0,4 mg abaixo do prescrito.', correct: '2 ÷ 4 = 0,5 mL exatos.' },
          { label: 'Letra D — 1,5 mL', detail: '6 mg — dose triplicada.', correct: '0,5 mL × 4 mg/mL = 2 mg prescritos.' },
          { label: 'Em outra banca — 8 mg/mL', detail: 'Recalcule se a concentração mudar.', correct: 'Aqui: 4 mg/mL → 0,5 mL.' },
        ],
        footer_rule: 'Dexametasona 2 mg = 0,5 mL (4 mg/mL)',
      },
    ],
  },

  'fundep-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056318806-7': {
    family: 'calc',
    guideline: '120 mL/h macrogotas → gts/min = (mL/h × 20) ÷ 60 = 40',
    roi_error: 'somar_volumes_em_vez_de_converter_taxa',
    exam_vs_current: 'conta da prova — 120 mL/h sem bomba = 40 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'mL/h → gts/min (sem bomba)',
        meta: slideMeta,
        items: [
          { label: 'Prescrição médica', detail: '1.000 mL solução de glicose 5% + 40 mL Nacl 20% + 10 mL Kcl 19,1% a 120 mL/h.', icon: 'FileText' },
          { label: 'Sem bomba', detail: 'Técnico comunica médico — instalar no equipo de macrogotas.', icon: 'Gauge' },
          { label: 'Taxa fixa', detail: '120 mL/h em bomba → converter para gotas/min no equipo.', icon: 'Calculator' },
          { label: 'Conta', detail: '120 mL/h ÷ 3 = 40 gts/min.', icon: 'Zap' },
          { label: 'Pegadinha clássica', detail: 'Somar volumes (1.050 mL) na conta ou responder 120 gts/min.', icon: 'AlertTriangle' },
          { label: 'Padrão Fundep', detail: 'Troca bomba→equipo: converte taxa mL/h, volume total não altera gts/min.', icon: 'Target' },
        ],
        footer_rule: 'gts/min = mL/h ÷ 3 (macrogotas) | 120 → 40',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler prescrição: 1.000 mL solução de glicose 5% + 40 mL Nacl 20% + 10 mL Kcl — infundir a 120 mL/h em bomba.',
          'Sem bomba disponível: médico mantém 120 mL/h no equipo de macrogotas.',
          'Fixar taxa prescrita: 120 mL/h — volume total 1.050 mL não altera conversão.',
          'Converter macrogotas: gts/min = (120 × 20) ÷ 60 = 40.',
          'Atalho: 120 ÷ 3 = 40 gts/min.',
          'Eliminar A (20), B (30) e D (80): fatores sem relação com 120 mL/h.',
          'Localizar alternativa C = 40 gts/min.',
          'Marcar C.',
          'Fixação: mL/h → gts/min: divida por 3 em macrogotas.',
        ],
        footer_rule: 'Roteiro: 120 mL/h ÷ 3 = 40 gts/min → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — mL/h → gts/min',
        meta: slideMeta,
        content: 'gts/min = mL/h ÷ 3',
        rows: [
          { label: 'Taxa', value: '120 mL/h', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fórmula', value: '(mL/h × 20) ÷ 60', badge: 'hot' },
          { label: 'Atalho', value: 'mL/h ÷ 3 = gts/min', badge: 'info' },
          { label: 'Gotejamento', value: '120 ÷ 3 = 40 gts/min', badge: 'hot', emphasis: 'success' },
          { label: 'Volume 1.050 mL', value: 'não entra na conversão de taxa', badge: 'info' },
          { label: 'Erro 80', value: 'dobra — divide por 1,5 em vez de 3', badge: 'warn' },
        ],
        footer_rule: 'Macrogotas: mL/h ÷ 3 = gts/min',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 120 mL/H → MACROGOTAS',
        items: [
          { label: 'Letra A — 20', detail: 'Taxa ~60 mL/h — divide por 6 sem base.', correct: '120 mL/h = 40 gts/min em macrogotas.' },
          { label: 'Letra B — 30', detail: 'Taxa ~90 mL/h — fator intermediário errado.', correct: '120 ÷ 3 = 40 gts/min.' },
          { label: 'Letra D — 80', detail: 'Dobra o correto — divide por 1,5.', correct: 'Fórmula canônica: mL/h ÷ 3.' },
          { label: 'Em outra banca — somar volumes', detail: '1.050 mL total não altera gts/min se taxa é 120 mL/h.', correct: 'Taxa prescrita define gts/min, não volume total.' },
        ],
        footer_rule: '120 mL/h = 40 gts/min (macrogotas)',
      },
    ],
  },

  'iaupe-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056265348-2': {
    family: 'calc',
    guideline: 'SF 1.000 mL em 16 h — (V×20)÷960 min ≈21 gts/min',
    roi_error: 'tempo_12h_em_vez_de_16h',
    exam_vs_current: 'conta da prova — 1.000 mL SF em 16 h ≈21 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SF 1.000 mL — 16 horas',
        meta: slideMeta,
        items: [
          { label: 'Prescrição', detail: '1.000 mL de soro fisiológico em 16 horas.', icon: 'Droplets' },
          { label: 'Tempo', detail: '16 h = 960 minutos — converter antes da fórmula.', icon: 'Clock' },
          { label: 'Macrogotas', detail: 'Fator 20 — padrão Iaupe em infusão hospitalar.', icon: 'Gauge' },
          { label: 'Conta', detail: '(1.000 × 20) ÷ 960 = 20,83 ≈ 21 gts/min.', icon: 'Calculator' },
          { label: 'Pegadinha clássica', detail: 'Responder 28 gts/min (12 h) ou 14 gts/min (500 mL).', icon: 'AlertTriangle' },
          { label: 'Padrão Iaupe', detail: 'Grande volume + tempo longo: confira 16 h, não 12 h ou 24 h.', icon: 'Target' },
        ],
        footer_rule: '1.000 mL / 16 h = (1.000×20)/960 ≈ 21 gts/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 1.000 mL SF em 16 horas — gts/min.',
          'Converter tempo: 16 h × 60 = 960 minutos.',
          'Aplicar fórmula: gts/min = (1.000 × 20) ÷ 960.',
          'Calcular: 20.000 ÷ 960 = 20,83 gotas por minuto.',
          'Arredondar: C = 21 gotas por minuto.',
          'Eliminar A (14), B (25), D (18) e E (28): tempos ou volumes incorretos.',
          'Localizar alternativa C = 21 gotas/min.',
          'Marcar C.',
          'Fixação: 16 h = 960 min — não use 720 min (12 h).',
        ],
        footer_rule: 'Roteiro: 16 h → 960 min → (1.000×20)/960 ≈ 21 → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 1.000 mL / 16 h',
        meta: slideMeta,
        content: '(1.000 × 20) ÷ 960',
        rows: [
          { label: 'Volume', value: '1.000 mL SF', badge: 'ok' },
          { label: 'Tempo', value: '16 h = 960 min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator', value: '20 gotas/mL', badge: 'ok' },
          { label: 'Conta', value: '20.000 ÷ 960 = 20,83 ≈ 21', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 28 gts/min', value: '12 h (720 min) em vez de 16 h', badge: 'warn' },
          { label: 'Erro 14 gts/min', value: '500 mL ou 32 h — escala errada', badge: 'warn' },
        ],
        footer_rule: '16 h = 960 min | 1.000 mL → ~21 gts/min',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SF 1.000 mL / 16 H',
        items: [
          { label: 'Letra A — 14 gotas/min', detail: 'Fluxo de 500 mL/12 h — volume ou tempo errado.', correct: '1.000 mL em 960 min ≈ 21 gts/min.' },
          { label: 'Letra B — 25 gotas/min', detail: 'Tempo ~720 min (12 h) na conta.', correct: 'Prescrição é 16 h = 960 min.' },
          { label: 'Letra D — 18 gotas/min', detail: 'Tempo ~1.111 min (~18,5 h).', correct: 'Com 960 min, o fluxo é ~21 gts/min.' },
          { label: 'Letra E — 28 gotas/min', detail: '1.000 mL em 12 h — tempo subestimado.', correct: '16 h, não 12 h — resultado ~21.' },
          { label: 'Em outra banca — SF 0,9%', detail: 'Tipo de soro não altera gts/min.', correct: 'Só volume e tempo entram na fórmula.' },
        ],
        footer_rule: '1.000 mL/16 h ≈ 21 gts/min — letra C',
      },
    ],
  },

  'ibade-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056301382-8': {
    family: 'calc',
    guideline: 'Decadron 12 mg — frasco 4 mg/mL (2,5 mL) → 3 mL',
    roi_error: 'usar_volume_frasco_2_5_mL_como_dose',
    exam_vs_current: 'conta da prova — 12 mg, 4 mg/mL → 3 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Decadron EV — 12 mg',
        meta: slideMeta,
        items: [
          { label: 'Prescrição UPA', detail: 'Decadron (dexametasona) 12 mg EV — dose de urgência.', icon: 'Syringe' },
          { label: 'Farmácia', detail: 'Frasco 4 mg/mL de 2,5 mL — 10 mg por frasco.', icon: 'FlaskConical' },
          { label: 'Cálculo', detail: '12 mg ÷ 4 mg/mL = 3 mL.', icon: 'Calculator' },
          { label: 'Atenção', detail: '3 mL > 2,5 mL de um frasco — pode precisar de 2 frascos na prática.', icon: 'AlertTriangle' },
          { label: 'Pegadinha clássica', detail: 'Responder 2,5 mL (frasco inteiro = 10 mg) ou 2 mL (8 mg).', icon: 'AlertTriangle' },
          { label: 'Padrão Ibade', detail: 'UPA: calcular mg/mL primeiro; prova aceita 3 mL como resposta matemática.', icon: 'Target' },
        ],
        footer_rule: '12 mg ÷ 4 mg/mL = 3 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 12 mg Decadron, frasco 4 mg/mL (2,5 mL).',
          'Fixar concentração: 4 mg/mL.',
          'Calcular: 12 mg ÷ 4 mg/mL = 3 mL.',
          'Eliminar B (2 mL): 8 mg — subdose de 4 mg.',
          'Eliminar C (1,5 mL): 6 mg — metade da dose.',
          'Eliminar D (3,5 mL) e E (4,5 mL): superestimam sem base.',
          'Localizar alternativa A = 3,0 mL.',
          'Marcar A.',
          'Fixação: 12 mg ÷ 4 = 3 mL — conta da prova, independente do frasco 2,5 mL.',
        ],
        footer_rule: 'Roteiro: 12 ÷ 4 = 3 mL → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Decadron 12 mg',
        meta: slideMeta,
        content: '12 mg ÷ 4 mg/mL',
        rows: [
          { label: 'Prescrito', value: '12 mg EV', badge: 'hot', emphasis: 'highlight' },
          { label: 'Concentração', value: '4 mg/mL', badge: 'ok' },
          { label: 'Volume', value: '12 ÷ 4 = 3 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Frasco 2,5 mL', value: '10 mg/frasco — prova pede conta, não estoque', badge: 'info' },
          { label: 'Erro 2,5 mL', value: '10 mg — subdose de 2 mg', badge: 'warn' },
          { label: 'Erro 2 mL', value: '8 mg — falta 4 mg', badge: 'warn' },
        ],
        footer_rule: '12 mg com 4 mg/mL = 3 mL',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DECADRON 12 mg UPA',
        items: [
          { label: 'Letra B — 2,0 mL', detail: '8 mg — subdose de 4 mg.', correct: '12 mg exigem 3 mL na concentração 4 mg/mL.' },
          { label: 'Letra C — 1,5 mL', detail: '6 mg — metade da dose prescrita.', correct: '12 ÷ 4 = 3 mL — dose completa.' },
          { label: 'Letra D — 3,5 mL', detail: '14 mg — 2 mg acima sem base.', correct: '3 mL × 4 mg/mL = 12 mg exatos.' },
          { label: 'Letra E — 4,5 mL', detail: '18 mg — superestima gravemente.', correct: 'Resposta matemática: 3 mL.' },
          { label: 'Em outra banca — 2 frascos', detail: 'Na prática 3 mL > 2,5 mL — prova cobra a conta mg/mL.', correct: 'Cálculo: 12 mg ÷ 4 mg/mL = 3 mL.' },
        ],
        footer_rule: 'Decadron 12 mg = 3 mL (4 mg/mL)',
      },
    ],
  },

  'ibgp-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056330579-2': {
    family: 'calc',
    guideline: 'Diluição — 10 mg/25 mL; administrar 4 mL → 1,6 mg dexametasona',
    roi_error: 'usar_dose_ampola_sem_proporcao_diluicao',
    exam_vs_current: 'conta da prova — 10 mg em 25 mL, 4 mL da solução → 1,6 mg',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pós-diluição — mg na alíquota',
        meta: slideMeta,
        items: [
          { label: 'Preparo', detail: 'Ampola 10 mg dexametasona diluída em SF até 25 mL final.', icon: 'FlaskConical' },
          { label: 'Concentração final', detail: '10 mg ÷ 25 mL = 0,4 mg/mL na solução diluída.', icon: 'Calculator' },
          { label: 'Alíquota', detail: 'Prescrição: administrar 4 mL da solução diluída.', icon: 'Syringe' },
          { label: 'Dose recebida', detail: '4 mL × 0,4 mg/mL = 1,6 mg de dexametasona.', icon: 'Pill' },
          { label: 'Pegadinha clássica', detail: 'Responder 0,8 mg (metade) ou 4 mg (confunde mL com mg).', icon: 'AlertTriangle' },
          { label: 'Padrão Ibgp', detail: 'Pós-diluição: derive mg/mL do volume final, depois × mL administrados.', icon: 'Target' },
        ],
        footer_rule: '10 mg/25 mL = 0,4 mg/mL | 4 mL → 1,6 mg',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler preparo: ampola de dexametasona 10 mg diluída em soro fisiológico 0,9% até 25 mL final.',
          'Identificar formato: droga diluída — prescrição pede 4 mL da solução; dose em mg.',
          'Calcular concentração final: 10 mg ÷ 25 mL = 0,4 mg/mL.',
          'Aplicar alíquota: 4 mL × 0,4 mg/mL = 1,6 mg.',
          'Eliminar A (0,8 mg): metade — usa 2 mL em vez de 4 mL.',
          'Eliminar B (1,2 mg): 3 mL na conta — volume intermediário.',
          'Eliminar D (1,9 mg): arredondamento sem base em 0,4 mg/mL.',
          'Localizar alternativa C = 1,6 mg.',
          'Marcar C.',
          'Fixação: pós-diluição — mg totais ÷ mL finais, depois × mL prescritos.',
        ],
        footer_rule: 'Roteiro: 10/25 = 0,4 mg/mL → 4 mL = 1,6 mg → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — diluição 10 mg/25 mL',
        meta: slideMeta,
        content: '(mg total ÷ mL final) × mL alíquota',
        rows: [
          { label: 'Droga total', value: '10 mg em 25 mL', badge: 'ok' },
          { label: 'Concentração', value: '0,4 mg/mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Alíquota', value: '4 mL prescritos', badge: 'info' },
          { label: 'Dose', value: '4 × 0,4 = 1,6 mg', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 0,8 mg', value: '2 mL — metade da alíquota', badge: 'warn' },
          { label: 'Erro 4 mg', value: 'confunde 4 mL com 4 mg', badge: 'warn' },
        ],
        footer_rule: 'Diluído: mg/mL final × mL administrados = mg recebidos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEXAMETASONA DILUÍDA 4 mL',
        items: [
          { label: 'Letra A — 0,8 mg', detail: '2 mL da solução — metade da alíquota.', correct: '4 mL × 0,4 mg/mL = 1,6 mg.' },
          { label: 'Letra B — 1,2 mg', detail: '3 mL na conta — não corresponde à prescrição de 4 mL.', correct: 'Com 4 mL, a dose é 1,6 mg.' },
          { label: 'Letra D — 1,9 mg', detail: 'Arredondamento errado — não fecha 0,4 mg/mL.', correct: '10 mg ÷ 25 mL = 0,4 mg/mL → 1,6 mg.' },
          { label: 'Em outra banca — ampola pura', detail: 'Sem diluição: 10 mg/mL direto — outra conta.', correct: 'Aqui houve diluição até 25 mL — use concentração final.' },
        ],
        footer_rule: '10 mg/25 mL, 4 mL administrados = 1,6 mg',
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
    console.log(`[handcraft:calculo-g06] OK ${slug}`);
  }
  console.log(`[handcraft:calculo-g06] total=${ok}`);
}

main();
