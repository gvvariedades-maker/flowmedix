#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — calculo-de-administracao-de-medicamentos-e-infusoes-g05 (8 slugs).
 *
 *   npx tsx scripts/handcraft-calculo-de-administracao-de-medicamentos-e-infusoes-g05.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'calculo-de-administracao-de-medicamentos-e-infusoes-g05';
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
    'porcentagem g/100 mL',
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
  'fepese-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056318806-3': {
    family: 'calc',
    guideline: 'Amoxicilina VO — 500 mg com frasco 250 mg/5 mL → 10 mL por dose',
    roi_error: 'dividir_por_5_sem_regra_de_tres',
    exam_vs_current: 'conta da prova — 500 mg, 250 mg/5 mL → 10 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Amoxicilina suspensão — mg para mL',
        meta: slideMeta,
        items: [
          { label: 'Paciente Sr. João', detail: '65 anos — Amoxicilina suspensão por via oral de 8/8 horas.', icon: 'User' },
          { label: 'Dose por tomada', detail: '500 mg administrados em cada dose — alvo da regra de três.', icon: 'Pill' },
          { label: 'Apresentação', detail: '250 mg em cada 5 mL — suspensão oral da Amoxicilina.', icon: 'FlaskConical' },
          { label: 'Regra de três', detail: '500 mg ── X mL | 250 mg ── 5 mL → X = 10 mL.', icon: 'Calculator' },
          { label: 'Atalho concentração', detail: '500 mg ÷ 50 mg/mL = 10 mL por tomada.', icon: 'Zap' },
          { label: 'Pegadinha clássica', detail: 'Responder 5 mL (metade da dose) ou 2,5 mL (divide 500 por 200).', icon: 'AlertTriangle' },
          { label: 'Padrão FEPESE neste tema', detail: 'Antibiótico VO em suspensão: derive mg/mL antes da dose.', icon: 'Target' },
        ],
        footer_rule: '250 mg/5 mL = 50 mg/mL | 500 mg = 10 mL por dose',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler o caso: Senhor João, 65 anos — Amoxicilina suspensão VO de 8/8 h, 500 mg por dose.',
          'Identificar apresentação: 250 mg em cada 5 mL — suspensão oral da farmácia.',
          'Calcular concentração: 250 mg ÷ 5 mL = 50 mg/mL.',
          'Aplicar regra de três: 500 mg ── X mL | 250 mg ── 5 mL.',
          'Resolver: X = (500 × 5) ÷ 250 = 10 mL.',
          'Eliminar A (1 mL), B (2,5 mL), C (4 mL) e D (5 mL): subdoses sem fechar 500 mg.',
          'Localizar alternativa E = 10 mL.',
          'Marcar E.',
          'Fixação: suspensão VO — mg prescritos ÷ mg/mL = mL por dose.',
        ],
        footer_rule: 'Roteiro: 250/5 = 50 mg/mL → 500 mg = 10 mL → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Amoxicilina 500 mg',
        meta: slideMeta,
        content: '500 mg ÷ 50 mg/mL',
        rows: [
          { label: 'Prescrito', value: '500 mg por dose', badge: 'hot', emphasis: 'highlight' },
          { label: 'Apresentação', value: '250 mg em 5 mL', badge: 'ok' },
          { label: 'Concentração', value: '250 ÷ 5 = 50 mg/mL', badge: 'info' },
          { label: 'Volume', value: '500 ÷ 50 = 10 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 5 mL', value: '250 mg — metade da dose', badge: 'warn' },
          { label: 'Erro 2,5 mL', value: '125 mg — divide 500 por 200 sem base', badge: 'warn' },
        ],
        footer_rule: 'Suspensão: mg/mL primeiro, depois dose ÷ concentração',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AMOXICILINA 500 mg',
        items: [
          { label: 'Letra A — 1,0 mL', detail: 'Subdose — 50 mg, muito abaixo dos 500 mg.', correct: '500 mg exigem 10 mL na concentração 50 mg/mL.' },
          { label: 'Letra B — 2,5 mL', detail: '125 mg — divide 500 por 200 sem regra de três.', correct: '250 mg/5 mL → 500 mg = 10 mL.' },
          { label: 'Letra C — 4 mL', detail: '200 mg — ainda 300 mg abaixo do prescrito.', correct: '10 mL entregam exatamente 500 mg.' },
          { label: 'Letra D — 5 mL', detail: '250 mg — metade da dose prescrita.', correct: 'Dose completa: 10 mL, não 5 mL.' },
          { label: 'Em outra banca — 8/8 h', detail: 'O intervalo não altera o volume por tomada.', correct: 'Cada dose de 500 mg = 10 mL da suspensão.' },
        ],
        footer_rule: '500 mg com 250 mg/5 mL = 10 mL por dose',
      },
    ],
  },

  'fepese-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056318806-5': {
    family: 'calc',
    guideline: 'Medicação genérica — 200 mg com frasco 500 mg/5 mL → 2 mL',
    roi_error: 'dividir_por_5_sem_calcular_mg_mL',
    exam_vs_current: 'conta da prova — 200 mg, 500 mg/5 mL → 2 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: '200 mg — regra de três mg/mL',
        meta: slideMeta,
        items: [
          { label: 'Paciente no posto', detail: 'Precisa receber 200 mg — unidade só dispõe frascos de 500 mg em 5 mL.', icon: 'User' },
          { label: 'Dose prescrita', detail: '200 mg da medicação — alvo da conta.', icon: 'Syringe' },
          { label: 'Estoque do posto', detail: 'Frascos de 500 mg em 5 mL — única apresentação na unidade.', icon: 'FlaskConical' },
          { label: 'Concentração', detail: '500 mg ÷ 5 mL = 100 mg/mL.', icon: 'Calculator' },
          { label: 'Volume', detail: '200 mg ÷ 100 mg/mL = 2 mL.', icon: 'Droplets' },
          { label: 'Pegadinha clássica', detail: 'Responder 5 mL (frasco inteiro) ou 2,5 mL (divide 200 por 80).', icon: 'AlertTriangle' },
          { label: 'Padrão FEPESE neste tema', detail: 'Regra de três direta quando só há frasco mg/mL no posto.', icon: 'Target' },
        ],
        footer_rule: '500 mg/5 mL = 100 mg/mL | 200 mg = 2 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler o caso: paciente precisa receber 200 mg — na unidade só há frascos de 500 mg em 5 mL.',
          'Identificar formato: dose em mg, frasco 500 mg/5 mL, resposta em mL.',
          'Derivar concentração: 500 ÷ 5 = 100 mg/mL.',
          'Montar regra de três: 200 mg ── X mL | 500 mg ── 5 mL.',
          'Calcular: X = (200 × 5) ÷ 500 = 2 mL.',
          'Eliminar B (2,5 mL), C (3 mL), D (5 mL) e E (5,5 mL): superestimam ou arredondam sem base.',
          'Localizar alternativa A = 2 mL.',
          'Marcar A.',
          'Fixação: mg prescritos ÷ (mg totais ÷ mL do frasco) = mL na seringa.',
        ],
        footer_rule: 'Roteiro: 500/5 = 100 mg/mL → 200 mg = 2 mL → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 200 mg / 500 mg/5 mL',
        meta: slideMeta,
        content: '200 mg ÷ 100 mg/mL',
        rows: [
          { label: 'Prescrito', value: '200 mg', badge: 'hot', emphasis: 'highlight' },
          { label: 'Frasco', value: '500 mg em 5 mL', badge: 'ok' },
          { label: 'Concentração', value: '100 mg/mL', badge: 'info' },
          { label: 'Volume', value: '200 ÷ 100 = 2 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 5 mL', value: '500 mg — frasco inteiro, dose 2,5× maior', badge: 'warn' },
          { label: 'Erro 2,5 mL', value: '250 mg — 50 mg a mais sem fechar conta', badge: 'warn' },
        ],
        footer_rule: 'Frasco mg/mL: concentração = mg ÷ mL, depois dose ÷ concentração',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 200 mg / 500 mg/5 mL',
        items: [
          { label: 'Letra B — 2,5 mL', detail: '250 mg — 50 mg a mais que o prescrito.', correct: '200 mg exigem 2 mL na concentração 100 mg/mL.' },
          { label: 'Letra C — 3 mL', detail: '300 mg — superestima em 100 mg.', correct: 'Regra de três fecha em 2 mL exatos.' },
          { label: 'Letra D — 5 mL', detail: 'Frasco inteiro — 500 mg, dose dobrada.', correct: '200 mg = 2 mL, não 5 mL.' },
          { label: 'Letra E — 5,5 mL', detail: '550 mg — volume sem relação com 100 mg/mL.', correct: '2 mL × 100 mg/mL = 200 mg prescritos.' },
          { label: 'Em outra banca — ampola única', detail: 'Se só houver um frasco, ainda fraciona pelo mg/mL.', correct: 'Não aspirar 5 mL quando a prescrição é 200 mg.' },
        ],
        footer_rule: '200 mg ÷ 100 mg/mL = 2 mL — única resposta coerente',
      },
    ],
  },

  'fepese-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056318806-6': {
    family: 'calc',
    guideline: 'SG 500 mL em 12 h — macrogotas (V×20)÷720 min ≈14',
    roi_error: 'tempo_ou_fator_errado',
    exam_vs_current: 'conta da prova — 500 mL SG 5% em 12 h ≈14 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SG 500 mL — 12 horas',
        meta: slideMeta,
        items: [
          { label: 'Volume prescrito', detail: '500 mL de soro glicosado a 5% — numerador da fórmula.', icon: 'Droplets' },
          { label: 'Tempo', detail: '12 horas = 720 minutos — converter antes de dividir.', icon: 'Clock' },
          { label: 'Macrogotas', detail: 'Fator 20 — padrão quando o equipo não é microgotas.', icon: 'Gauge' },
          { label: 'Conta', detail: '(500 × 20) ÷ 720 = 13,89 ≈ 14 gotas/min.', icon: 'Calculator' },
          { label: 'Pegadinha clássica', detail: 'Responder 28 gts/min (dobra fluxo) ou 24 gts/min (divide por 10 h).', icon: 'AlertTriangle' },
          { label: 'Padrão FEPESE neste tema', detail: 'SG 5% não altera gts/min — só volume e tempo importam.', icon: 'Target' },
        ],
        footer_rule: '500 mL / 12 h = (500×20)/720 ≈ 14 gts/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 500 mL de SG 5% em 12 horas — gts/min aproximado.',
          'Converter tempo: 12 h × 60 = 720 minutos.',
          'Aplicar macrogotas: gts/min = (500 × 20) ÷ 720.',
          'Calcular: 10.000 ÷ 720 = 13,89 gotas por minuto.',
          'Arredondar: C = aproximadamente 14 gotas por minuto.',
          'Eliminar A (5), B (12), D (24) e E (28): fluxos incoerentes com 500 mL/12 h.',
          'Localizar alternativa C = aproximadamente 14 gotas por minuto.',
          'Marcar C.',
          'Fixação: metade de 1.000 mL no mesmo tempo ≈ metade do fluxo (~14 vs ~28).',
        ],
        footer_rule: 'Roteiro: 12 h → 720 min → (500×20)/720 ≈ 14 → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 500 mL SG / 12 h',
        meta: slideMeta,
        content: '(500 × 20) ÷ 720',
        rows: [
          { label: 'Volume', value: '500 mL SG 5%', badge: 'ok' },
          { label: 'Tempo', value: '12 h = 720 min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator', value: '20 gotas/mL', badge: 'ok' },
          { label: 'Conta', value: '(500×20)÷720 = 13,89 ≈ 14', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 28 gts/min', value: '1.000 mL ou 6 h — dobra o fluxo', badge: 'warn' },
          { label: 'Erro 5 gts/min', value: 'tempo ~2.160 min — triplica o prescrito', badge: 'warn' },
        ],
        footer_rule: '500 mL/12 h ≈ 14 | 1.000 mL/12 h ≈ 28',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SG 500 mL / 12 HORAS',
        items: [
          { label: 'Letra A — 5 gotas/min', detail: 'Fluxo muito baixo — tempo superestimado ou volume ~180 mL.', correct: '500 mL em 720 min com fator 20 ≈ 14 gts/min.' },
          { label: 'Letra B — 12 gotas/min', detail: 'Tempo ~900 min (15 h) ou volume ~432 mL na conta.', correct: 'Com 720 min e 500 mL, o fluxo aproxima 14.' },
          { label: 'Letra D — 24 gotas/min', detail: 'Dobra o fluxo — usa 6 h ou 1.000 mL em vez de 500.', correct: '500 mL rende ~14 gts/min, não 24.' },
          { label: 'Letra E — 28 gotas/min', detail: 'Fluxo de 1.000 mL/12 h — volume dobrado.', correct: 'Metade do volume = metade do fluxo: ~14 gts/min.' },
          { label: 'Em outra banca — SG 5%', detail: 'O percentual de glicose não entra na fórmula de gts/min.', correct: 'Gotejamento depende de mL e tempo, não do tipo de soro.' },
        ],
        footer_rule: 'Horas × 60 = minutos — depois (V × 20) ÷ min',
      },
    ],
  },

  'fgv-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056284398-5': {
    family: 'calc',
    guideline: 'Ampola 10 mL — 5 mg/mL → 20 mg prescritos = 4 mL',
    roi_error: 'confundir_mg_com_mL_direto',
    exam_vs_current: 'conta da prova — 20 mg, 5 mg/mL → 4 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: '20 mg — ampola 5 mg/mL',
        meta: slideMeta,
        items: [
          { label: 'Prescrição', detail: '20 mg da medicação — dose-alvo da aspiração.', icon: 'Syringe' },
          { label: 'Apresentação', detail: 'Ampola de 10 mL com 5 mg/mL — concentração explícita.', icon: 'FlaskConical' },
          { label: 'Regra de três', detail: '20 mg ── X mL | 5 mg ── 1 mL → X = 4 mL.', icon: 'Calculator' },
          { label: 'Atalho', detail: '20 mg ÷ 5 mg/mL = 4 mL na seringa.', icon: 'Zap' },
          { label: 'Pegadinha clássica', detail: 'Responder 2 mL (metade) ou 5 mL (ampola quase inteira).', icon: 'AlertTriangle' },
          { label: 'Padrão FGV neste tema', detail: 'Ampola mg/mL: dividir mg prescritos pela concentração.', icon: 'Target' },
        ],
        footer_rule: '20 mg ÷ 5 mg/mL = 4 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: dose em mg, ampola 5 mg/mL, resposta em mL a aspirar.',
          'Fixar concentração: 5 mg/mL (dado no enunciado).',
          'Calcular volume: 20 mg ÷ 5 mg/mL = 4 mL.',
          'Eliminar A (2 mL): subdose — 10 mg, metade do prescrito.',
          'Eliminar B (3 mL) e C (2,5 mL): volumes intermediários sem base na concentração.',
          'Eliminar E (5 mL): superestima — 25 mg na ampola de 5 mg/mL.',
          'Localizar alternativa D = 4,0 mL.',
          'Marcar D.',
          'Fixação: mg prescritos ÷ mg/mL = mL a aspirar.',
        ],
        footer_rule: 'Roteiro: 20 ÷ 5 = 4 mL → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 20 mg / 5 mg/mL',
        meta: slideMeta,
        content: 'mg ÷ (mg/mL) = mL',
        rows: [
          { label: 'Prescrito', value: '20 mg', badge: 'hot', emphasis: 'highlight' },
          { label: 'Ampola', value: '10 mL — 5 mg/mL', badge: 'ok' },
          { label: 'Volume', value: '20 ÷ 5 = 4 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 2 mL', value: '10 mg — metade da dose', badge: 'warn' },
          { label: 'Erro 5 mL', value: '25 mg — superestima em 5 mg', badge: 'warn' },
        ],
        footer_rule: 'Ampola mg/mL: dose ÷ concentração = mL',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 20 mg / 5 mg/mL',
        items: [
          { label: 'Letra A — 2,0 mL', detail: '10 mg — metade dos 20 mg prescritos.', correct: '20 mg exigem 4 mL na concentração 5 mg/mL.' },
          { label: 'Letra B — 3,0 mL', detail: '15 mg — 5 mg a menos que o prescrito.', correct: '4 mL entregam exatamente 20 mg.' },
          { label: 'Letra C — 2,5 mL', detail: '12,5 mg — arredondamento sem fechar 20 mg.', correct: '20 ÷ 5 = 4 mL — conta exata.' },
          { label: 'Letra E — 5,0 mL', detail: '25 mg — superestima em 5 mg.', correct: '4 mL × 5 mg/mL = 20 mg prescritos.' },
          { label: 'Em outra banca — ampola 10 mL', detail: 'O volume total da ampola não é a resposta — fraciona pela concentração.', correct: 'Aspirar 4 mL, não 10 mL inteiros.' },
        ],
        footer_rule: '20 mg com 5 mg/mL = 4 mL na seringa',
      },
    ],
  },

  'fgv-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056284398-6': {
    family: 'calc',
    guideline: 'Mesma ampola 5 mg/mL — 20 mg = 4 mL (variante FGV)',
    roi_error: 'usar_volume_ampola_em_vez_de_concentracao',
    exam_vs_current: 'conta da prova — 20 mg, ampola 10 mL 5 mg/mL → 4 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Aspiração — 20 mg em 5 mg/mL',
        meta: slideMeta,
        items: [
          { label: 'Comando da prova', detail: 'Médico prescreveu 20 mg — ampola 10 mL – 5 mg/mL; profissional aspira mL.', icon: 'FileText' },
          { label: 'Apresentação ampola', detail: 'Ampola de 10 mL com 5 mg/mL — concentração após o travessão.', icon: 'FlaskConical' },
          { label: 'Cálculo direto', detail: '20 mg ÷ 5 mg/mL = 4 mL — quatro quintos da ampola.', icon: 'Calculator' },
          { label: 'Segurança', detail: 'Conferir mg/mL antes de aspirar — erro de volume = erro de dose.', icon: 'Shield' },
          { label: 'Pegadinha clássica', detail: 'Responder 2 mL (10 mg) por dividir 20 por 10 (mL da ampola).', icon: 'AlertTriangle' },
          { label: 'Padrão FGV neste tema', detail: 'Enunciado curto: concentração mg/mL é o dado decisivo.', icon: 'Target' },
        ],
        footer_rule: 'Dose (mg) ÷ mg/mL = mL — ignore os 10 mL da ampola como resposta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler prescrição: médico prescreveu 20 mg — ampola de 10 mL com 5 mg/mL; profissional aspira mL.',
          'Identificar formato: 20 mg prescritos, ampola 10 mL com 5 mg/mL.',
          'Isolar concentração: 5 mg/mL — dado explícito após o travessão na apresentação.',
          'Calcular: 20 mg ÷ 5 mg/mL = 4 mL.',
          'Eliminar A (2 mL): 10 mg — confunde mg prescritos com metade da ampola.',
          'Eliminar B (3 mL) e C (2,5 mL): subdoses sem relação com 5 mg/mL.',
          'Eliminar E (5 mL): 25 mg — 5 mg acima do prescrito.',
          'Localizar alternativa D = 4,0 mL.',
          'Marcar D.',
          'Fixação: travessão “10 mL – 5 mg/mL” = volume total E concentração — use mg/mL na conta.',
        ],
        footer_rule: 'Roteiro: 5 mg/mL → 20 mg = 4 mL → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ampola FGV',
        meta: slideMeta,
        content: '20 mg ÷ 5 mg/mL',
        rows: [
          { label: 'Prescrito', value: '20 mg', badge: 'hot', emphasis: 'highlight' },
          { label: 'Concentração', value: '5 mg/mL', badge: 'hot' },
          { label: 'Volume ampola', value: '10 mL (capacidade, não resposta)', badge: 'info' },
          { label: 'Aspirar', value: '20 ÷ 5 = 4 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 2 mL', value: 'divide 20 por 10 (mL ampola) — lógica errada', badge: 'warn' },
        ],
        footer_rule: 'mg/mL na conta — volume da ampola só limita o máximo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AMPOLA 10 mL / 5 mg/mL',
        items: [
          { label: 'Letra A — 2,0 mL', detail: '10 mg — metade da dose ou 20÷10 (mL da ampola).', correct: '20 mg com 5 mg/mL = 4 mL.' },
          { label: 'Letra B — 3,0 mL', detail: '15 mg — falta 5 mg para fechar prescrição.', correct: '4 mL × 5 mg/mL = 20 mg exatos.' },
          { label: 'Letra C — 2,5 mL', detail: '12,5 mg — arredondamento precoce.', correct: 'Divisão exata: 20 ÷ 5 = 4 mL.' },
          { label: 'Letra E — 5,0 mL', detail: '25 mg — 5 mg a mais que o prescrito.', correct: 'Aspirar 4 mL, não 5 mL.' },
          { label: 'Em outra banca — ampola 2 mL', detail: 'Muda capacidade, não a conta mg ÷ mg/mL.', correct: 'Concentração 5 mg/mL → 20 mg = 4 mL em qualquer ampola.' },
        ],
        footer_rule: 'Não use mL da ampola como divisor — use mg/mL',
      },
    ],
  },

  'fgv-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056301382-0': {
    family: 'calc',
    branch: 'calc_dose_equivalencia',
    guideline: 'SG 5% — 5 g/100 mL; 250 mL contém 12,5 g de glicose',
    roi_error: 'confundir_porcentagem_com_gramas_totais',
    exam_vs_current: 'conta da prova — 5% em 250 mL = 12,5 g glicose',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Solução 5% — gramas de glicose',
        meta: slideMeta,
        items: [
          { label: 'Significado de 5%', detail: '5 gramas de soluto (glicose) em cada 100 mL de solução.', icon: 'Percent' },
          { label: 'Frasco glicosado', detail: '250 mL de solução glicosada a 5% — escala proporcional a 100 mL.', icon: 'Droplets' },
          { label: 'Proporção', detail: '250 mL ÷ 100 mL = 2,5 — multiplicador de gramas.', icon: 'Calculator' },
          { label: 'Conta', detail: '5 g × 2,5 = 12,5 gramas de glicose no frasco.', icon: 'Scale' },
          { label: 'Pegadinha clássica', detail: 'Responder 5 g (só o percentual) ou 25 g (5% de 250 sem regra).', icon: 'AlertTriangle' },
          { label: 'Padrão FGV neste tema', detail: 'Porcentagem massa/volume: sempre gramas por 100 mL.', icon: 'Target' },
        ],
        footer_rule: '5% = 5 g/100 mL | 250 mL → 5 g × 2,5 = 12,5 g',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: quantidade de glicose em frasco de 250 mL SG 5%.',
          'Interpretar 5%: 5 gramas de glicose por 100 mL de solução.',
          'Calcular fator de escala: 250 mL ÷ 100 mL = 2,5.',
          'Multiplicar: 5 g × 2,5 = 12,5 gramas de glicose.',
          'Eliminar A (2,5 g), B (5 g), C (10,5 g) e E (25 g): não fecham a regra 5 g/100 mL.',
          'Localizar alternativa D = 12,5 gramas.',
          'Marcar D.',
          'Fixação: X% = X gramas por 100 mL — escale pelo volume real.',
        ],
        footer_rule: 'Roteiro: 5% → 5 g/100 mL → ×2,5 = 12,5 g → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — porcentagem g/100 mL',
        meta: slideMeta,
        content: '5 g × (250 ÷ 100)',
        rows: [
          { label: 'Concentração', value: '5% = 5 g/100 mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Volume', value: '250 mL', badge: 'ok' },
          { label: 'Fator', value: '250 ÷ 100 = 2,5', badge: 'info' },
          { label: 'Glicose', value: '5 × 2,5 = 12,5 g', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 5 g', value: 'só o percentual — ignora os 250 mL', badge: 'warn' },
          { label: 'Erro 25 g', value: '5% × 250 sem dividir por 100', badge: 'warn' },
        ],
        footer_rule: 'X% = X g por 100 mL — escale pelo volume',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SG 5% EM 250 mL',
        items: [
          { label: 'Letra A — 2,5 gramas', detail: 'Metade de 5 g — volume 50 mL, não 250 mL.', correct: '250 mL de 5% = 12,5 g de glicose.' },
          { label: 'Letra B — 5,0 gramas', detail: 'Só o numerador do 5% — ignora escala do volume.', correct: '5 g vale para 100 mL; 250 mL = 12,5 g.' },
          { label: 'Letra C — 10,5 gramas', detail: 'Escala ~2,1 em vez de 2,5 — aritmética errada.', correct: '250/100 = 2,5 → 5 × 2,5 = 12,5 g.' },
          { label: 'Letra E — 25 gramas', detail: 'Multiplica 5% × 250 direto — esquece “por 100 mL”.', correct: '5% = 5 g/100 mL, não 5 g por 1 mL.' },
          { label: 'Em outra banca — SG 10%', detail: '10% = 10 g/100 mL — recalcule o fator.', correct: 'Sempre: X% → X gramas por 100 mL de solução.' },
        ],
        footer_rule: '5% em 250 mL = 12,5 g — regra dos 100 mL',
      },
    ],
  },

  'fundatec-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056265348-6': {
    family: 'calc',
    guideline: 'SG 500 mL / 12 h — arredondamento padrão Fundatec ≈14 gts/min',
    roi_error: 'arredondar_para_baixo_13',
    exam_vs_current: 'conta da prova — 500 mL SG 5% em 12 h, arredondamento → 14 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Fundatec — 500 mL / 12 h',
        meta: slideMeta,
        items: [
          { label: 'Prescrição', detail: '500 mL de soro glicosado a 5% em 12 horas.', icon: 'Droplets' },
          { label: 'Arredondamento', detail: 'Fundatec pede “arredondamento padrão” — 13,89 → 14 gts/min.', icon: 'Target' },
          { label: 'Fórmula', detail: 'gts/min = (500 × 20) ÷ 720 = 13,89.', icon: 'Calculator' },
          { label: 'Macrogotas', detail: 'Fator 20 — equipo padrão em provas Fundatec.', icon: 'Gauge' },
          { label: 'Pegadinha clássica', detail: 'Marcar 13 (arredonda para baixo) ou 12 (tempo superestimado).', icon: 'AlertTriangle' },
          { label: 'Padrão Fundatec', detail: 'Infusão simples: converter h→min, arredondar para inteiro mais próximo.', icon: 'ClipboardCheck' },
        ],
        footer_rule: '(500×20)/720 = 13,89 → arredondamento padrão = 14 gts/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 500 mL SG 5% em 12 h — gts/min com arredondamento padrão.',
          'Converter: 12 h = 720 minutos.',
          'Calcular: (500 × 20) ÷ 720 = 13,89 gotas/min.',
          'Arredondar para inteiro mais próximo: 14 gts/min.',
          'Eliminar A (10): fluxo subestimado — volume ~360 mL na conta.',
          'Eliminar C (13): arredonda para baixo — Fundatec usa padrão matemático.',
          'Eliminar D (12): tempo ~840 min ou volume ~432 mL.',
          'Localizar alternativa B = 14 gotas/min.',
          'Marcar B.',
          'Fixação: 13,89 ≈ 14 — não 13 quando a banca pede arredondamento padrão.',
        ],
        footer_rule: 'Roteiro: 13,89 → 14 gts/min → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — arredondamento Fundatec',
        meta: slideMeta,
        content: '(500 × 20) ÷ 720',
        rows: [
          { label: 'Conta exata', value: '13,89 gts/min', badge: 'info' },
          { label: 'Arredondamento', value: '14 gts/min (mais próximo)', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 13', value: 'arredonda para baixo sem critério da banca', badge: 'warn' },
          { label: 'Erro 12', value: 'tempo ou volume incorretos', badge: 'warn' },
          { label: 'Erro 10', value: 'fluxo muito baixo — escala errada', badge: 'warn' },
        ],
        footer_rule: '13,89 → 14 (arredondamento padrão)',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FUNDATEC 500 mL / 12 H',
        items: [
          { label: 'Letra A — 10 gotas/min', detail: 'Fluxo ~36% menor — volume ~360 mL ou tempo maior.', correct: '500 mL em 720 min ≈ 14 gts/min.' },
          { label: 'Letra C — 13 gotas/min', detail: 'Arredonda 13,89 para baixo — banca usa inteiro mais próximo.', correct: '13,89 ≈ 14 gts/min — letra B.' },
          { label: 'Letra D — 12 gotas/min', detail: 'Tempo ~840 min (14 h) na conta invertida.', correct: '12 h = 720 min — resultado ~14.' },
          { label: 'Em outra banca — sem arredondar', detail: 'Algumas aceitam 13,8 — Fundatec pede padrão explícito.', correct: 'Com “arredondamento padrão”, 13,89 → 14.' },
        ],
        footer_rule: 'Fundatec: 13,89 → 14 gts/min (B)',
      },
    ],
  },

  'fundatec-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056265348-7': {
    family: 'calc',
    guideline: 'Tramadol 60 mg — ampola 25 mg/mL (3 mL) → 2,4 mL',
    roi_error: 'aspirar_ampola_inteira_3_mL',
    exam_vs_current: 'conta da prova — 60 mg, 25 mg/mL → 2,4 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tramadol — 60 mg em 25 mg/mL',
        meta: slideMeta,
        items: [
          { label: 'Prescrição', detail: 'Tramadol 60 mg — dose-alvo da aspiração.', icon: 'Syringe' },
          { label: 'Ampola', detail: '3 mL com 25 mg/mL — concentração explícita no enunciado.', icon: 'FlaskConical' },
          { label: 'Cálculo', detail: '60 mg ÷ 25 mg/mL = 2,4 mL.', icon: 'Calculator' },
          { label: 'Capacidade', detail: 'Ampola tem 3 mL (75 mg) — 2,4 mL cabe, sobra 0,6 mL.', icon: 'Droplets' },
          { label: 'Pegadinha clássica', detail: 'Responder 3 mL (ampola inteira = 75 mg) ou 2 mL (50 mg).', icon: 'AlertTriangle' },
          { label: 'Padrão Fundatec', detail: 'Opioides: mg ÷ mg/mL, conferir se cabe na ampola.', icon: 'Target' },
        ],
        footer_rule: '60 mg ÷ 25 mg/mL = 2,4 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: Tramadol 60 mg, ampola 3 mL (25 mg/mL).',
          'Fixar concentração: 25 mg/mL.',
          'Calcular volume: 60 mg ÷ 25 mg/mL = 2,4 mL.',
          'Eliminar A (3 mL): ampola inteira — 75 mg, 15 mg a mais.',
          'Eliminar B (6,4 mL): excede capacidade da ampola (3 mL).',
          'Eliminar D (2 mL): 50 mg — subdose de 10 mg.',
          'Localizar alternativa C = 2,4 mL.',
          'Marcar C.',
          'Fixação: 60 mg não é ampola inteira — fraciona em 2,4 mL.',
        ],
        footer_rule: 'Roteiro: 60 ÷ 25 = 2,4 mL → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Tramadol 60 mg',
        meta: slideMeta,
        content: '60 mg ÷ 25 mg/mL',
        rows: [
          { label: 'Prescrito', value: '60 mg', badge: 'hot', emphasis: 'highlight' },
          { label: 'Concentração', value: '25 mg/mL', badge: 'ok' },
          { label: 'Volume', value: '60 ÷ 25 = 2,4 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Ampola 3 mL', value: '75 mg máximo — 2,4 mL cabe', badge: 'info' },
          { label: 'Erro 3 mL', value: '75 mg — 15 mg acima do prescrito', badge: 'warn' },
          { label: 'Erro 2 mL', value: '50 mg — subdose de 10 mg', badge: 'warn' },
        ],
        footer_rule: '60 mg com 25 mg/mL = 2,4 mL — não aspirar 3 mL inteiros',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TRAMADOL 60 mg',
        items: [
          { label: 'Letra A — 3,0 mL', detail: 'Ampola inteira — 75 mg, 15 mg a mais.', correct: '60 mg exigem 2,4 mL na concentração 25 mg/mL.' },
          { label: 'Letra B — 6,4 mL', detail: 'Impossível — ampola só tem 3 mL.', correct: '2,4 mL < 3 mL — volume cabe na ampola.' },
          { label: 'Letra D — 2,0 mL', detail: '50 mg — faltam 10 mg para 60 mg.', correct: '60 ÷ 25 = 2,4 mL exatos.' },
          { label: 'Em outra banca — 50 mg/mL', detail: 'Recalcule mg/mL se a concentração mudar.', correct: 'Aqui: 25 mg/mL → 2,4 mL.' },
        ],
        footer_rule: 'Tramadol 60 mg = 2,4 mL (25 mg/mL)',
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
    console.log(`[handcraft:calculo-g05] OK ${slug}`);
  }
  console.log(`[handcraft:calculo-g05] total=${ok}`);
}

main();
