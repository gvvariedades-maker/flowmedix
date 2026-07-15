#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — calculo-de-administracao-de-medicamentos-e-infusoes-g04 (8 slugs).
 *
 *   npx tsx scripts/handcraft-calculo-de-administracao-de-medicamentos-e-infusoes-g04.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'calculo-de-administracao-de-medicamentos-e-infusoes-g04';
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
  'fau-unicentro-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056309743-1': {
    family: 'calc',
    guideline: 'Infusão 1.000 mL em 12 h — macrogotas (V×20)÷minutos',
    roi_error: 'tempo_em_horas_sem_converter_minutos',
    exam_vs_current: 'conta da prova — 1.000 mL em 12 h, macrogotas ≈28 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: '1.000 mL em 12 h — macrogotas',
        meta: slideMeta,
        items: [
          {
            label: 'Volume prescrito',
            detail: '1.000 mL de solução — numerador da fórmula de gotejamento.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo em horas',
            detail: '12 horas → converter em 720 minutos antes de dividir.',
            icon: 'Clock',
          },
          {
            label: 'Equipo macrogotas',
            detail: 'Fator 20 — 1 mL = 20 gotas; único equipo disponível no enunciado.',
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
            label: 'Padrão FAU Unicentro',
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
          'Identificar formato: 1.000 mL para correr em 12 horas com equipo macrogotas.',
          'Converter tempo: 12 h × 60 = 720 minutos.',
          'Aplicar fórmula: gts/min = (1.000 × 20) ÷ 720.',
          'Calcular: 20.000 ÷ 720 = 27,78 gotas por minuto.',
          'Arredondar para alternativa mais próxima: B = 28 gotas por minuto.',
          'Eliminar A (20): fluxo subestimado — divide por 1.000 em vez de usar fator 20.',
          'Eliminar C (32), D (36) e E (42): tempo menor ou volume superestimado na conta.',
          'Localizar alternativa B = aproximadamente 28 gotas por minuto.',
          'Marcar B.',
          'Fixação: horas → minutos (×60) antes de (V×20)÷tempo.',
        ],
        footer_rule: 'Roteiro: 12 h → 720 min → (1.000×20)/720 ≈ 28 → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 1.000 mL / 12 h',
        meta: slideMeta,
        content: '(1.000 × 20) ÷ 720',
        rows: [
          { label: 'Volume', value: '1.000 mL', badge: 'ok' },
          { label: 'Tempo', value: '12 h = 720 min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator', value: '20 gotas/mL (macrogotas)', badge: 'ok' },
          { label: 'Fórmula', value: 'gts/min = (V × 20) ÷ min', badge: 'hot' },
          { label: 'Conta', value: '(1.000 × 20) ÷ 720 = 27,78 ≈ 28', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 20 gts/min', value: 'esquece fator 20 ou divide só por horas', badge: 'warn' },
          { label: 'Arredondamento', value: 'prova pede “aproximado” — 27,78 → 28', badge: 'info' },
        ],
        footer_rule: 'Macrogotas: (mL × 20) ÷ minutos, arredonde',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 1.000 mL / 12 HORAS',
        items: [
          {
            label: 'Letra A — 20 gotas/min',
            detail: 'Fluxo muito baixo — ignora fator 20 ou usa divisor 1.000 direto.',
            correct: '(1.000×20)÷720 ≈ 28 gts/min — não 20.',
          },
          {
            label: 'Letra C — 32 gotas/min',
            detail: 'Tempo efetivo menor (~675 min) ou volume reduzido na conta.',
            correct: 'Com 720 min e fator 20, o fluxo aproxima 28 — não 32.',
          },
          {
            label: 'Letra D — 36 gotas/min',
            detail: 'Divide por 10 horas em vez de 12 — tempo subestimado.',
            correct: '12 h = 720 min — usar minutos na fórmula padrão.',
          },
          {
            label: 'Letra E — 42 gotas/min',
            detail: 'Volume superestimado ou tempo em horas sem converter.',
            correct: '1.000 mL em 720 min com fator 20 rende ~28 gts/min.',
          },
          {
            label: 'Em outra banca — microgotas',
            detail: 'Se o equipo for microgotas, troque fator 20 por 60.',
            correct: 'Enunciado fixa macrogotas — use fator 20.',
          },
        ],
        footer_rule: 'Horas × 60 = minutos — depois (V × 20) ÷ min',
      },
    ],
  },

  'fau-unicentro-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056309743-2': {
    family: 'calc',
    guideline: 'Infusão pediátrica 500 mL em 20 h — microgotas fator 60',
    roi_error: 'usar_fator_20_em_microgotas',
    exam_vs_current: 'conta da prova — 500 mL em 20 h, microgotas = 25 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: '500 mL pediátrico — microgotas',
        meta: slideMeta,
        items: [
          {
            label: 'Volume prescrito',
            detail: '500 mL de solução para paciente pediátrico.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo prolongado',
            detail: '20 horas → 1.200 minutos — infusão lenta em pediatria.',
            icon: 'Clock',
          },
          {
            label: 'Equipo microgotas',
            detail: 'Fator 60 — 1 mL = 60 microgotas; setor dispõe só deste equipo.',
            icon: 'Gauge',
          },
          {
            label: 'Fórmula microgotas',
            detail: 'gts/min = (volume × 60) ÷ tempo em minutos.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Aplicar fator 20 (macrogotas) em equipo microgotas — triplica o erro.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão FAU Unicentro',
            detail: 'Pediatria + microgotas: fator 60 obrigatório quando o enunciado especifica.',
            icon: 'Target',
          },
        ],
        footer_rule: 'Microgotas: (V × 60) ÷ min | 500 mL / 20 h = 25 gts/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 500 mL em 20 horas com equipo microgotas (pediátrico).',
          'Converter tempo: 20 h × 60 = 1.200 minutos.',
          'Fixar fator microgotas: 1 mL = 60 microgotas → fator 60.',
          'Aplicar fórmula: gts/min = (500 × 60) ÷ 1.200.',
          'Calcular: 30.000 ÷ 1.200 = 25 microgotas por minuto.',
          'Eliminar A (21), B (22), C (23) e D (24): fluxos menores — fator 20 ou tempo errado.',
          'Localizar alternativa E = 25 microgotas por minuto.',
          'Marcar E.',
          'Fixação: microgotas = fator 60; macrogotas = fator 20 — leia o equipo no enunciado.',
        ],
        footer_rule: 'Roteiro: 20 h → 1.200 min → (500×60)/1.200 = 25 → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — microgotas pediátricas',
        meta: slideMeta,
        content: '(500 × 60) ÷ 1.200',
        rows: [
          { label: 'Volume', value: '500 mL', badge: 'ok' },
          { label: 'Tempo', value: '20 h = 1.200 min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator microgotas', value: '60 microgotas/mL', badge: 'hot' },
          { label: 'Fórmula', value: 'gts/min = (V × 60) ÷ min', badge: 'hot' },
          { label: 'Conta', value: '(500 × 60) ÷ 1.200 = 25 gts/min', badge: 'hot', emphasis: 'success' },
          { label: 'Erro com fator 20', value: '(500×20)/1.200 ≈ 8,3 — não é alternativa', badge: 'warn' },
          { label: 'Equivalência', value: '1 gota = 3 microgotas | 1 mL = 20 gotas = 60 microgotas', badge: 'info' },
        ],
        footer_rule: 'Microgotas: fator 60 — nunca use 20 neste equipo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 500 mL / 20 H / MICROGOTAS',
        items: [
          {
            label: 'Letra A — 21 microgotas/min',
            detail: 'Fluxo subestimado — usa fator 50 ou tempo superestimado.',
            correct: '(500×60)÷1.200 = 25 microgotas/min — não 21.',
          },
          {
            label: 'Letra B — 22 microgotas/min',
            detail: 'Erro intermediário — quase 25 mas fator ou tempo incorreto.',
            correct: 'Com fator 60 e 1.200 min, o fluxo exato é 25.',
          },
          {
            label: 'Letra C — 23 microgotas/min',
            detail: 'Aproximação errada entre 21 e 25 sem base na fórmula.',
            correct: '500 mL em 20 h com microgotas = 25 gts/min.',
          },
          {
            label: 'Letra D — 24 microgotas/min',
            detail: 'Um microgota a menos — arredondamento precoce ou divisor 1.250.',
            correct: '30.000 ÷ 1.200 = 25 exatos — não 24.',
          },
          {
            label: 'Em outra banca — macrogotas',
            detail: 'Se o equipo fosse macrogotas: (500×20)/1.200 ≈ 8 gts/min.',
            correct: 'Enunciado fixa microgotas — fator 60 obrigatório.',
          },
        ],
        footer_rule: 'Leia o equipo: microgota = 60 | macrogota = 20',
      },
    ],
  },

  'fau-unicentro-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056309743-5': {
    family: 'calc',
    guideline: 'Heparina — regra de três UI prescritas × mL disponível ÷ UI/mL',
    roi_error: 'confundir_UI_com_mL_direto',
    exam_vs_current: 'conta da prova — 3.500 UI, frasco 5.000 UI/mL → 0,7 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Heparina — regra de três em UI',
        meta: slideMeta,
        items: [
          {
            label: 'Prescrição do paciente',
            detail: 'Estão prescritos 3.500 UI de heparina para o paciente — dose-alvo da conta.',
            icon: 'Syringe',
          },
          {
            label: 'Frascos no posto',
            detail: 'No posto de enfermagem existem frascos de 5.000 UI/mL — estoque disponível.',
            icon: 'FlaskConical',
          },
          {
            label: 'Quantidade a administrar',
            detail: 'O comando pede a quantidade em mL a ser administrada — não a dose em UI.',
            icon: 'Calculator',
          },
          {
            label: 'Regra de três',
            detail: '3.500 UI ── X mL | 5.000 UI ── 1 mL → X = 0,7 mL.',
            icon: 'Calculator',
          },
          {
            label: 'Unidade UI',
            detail: 'UI ≠ mg — heparina é doseda em unidades internacionais, não miligramas.',
            icon: 'Pill',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Responder 3,5 mL (confunde UI com mL) ou 1,0 mL (arredonda para ampola inteira).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão FAU Unicentro',
            detail: 'Anticoagulante: regra de três com UI/mL — volume fracionado comum.',
            icon: 'Target',
          },
        ],
        footer_rule: 'Posto de enfermagem: frascos 5.000 UI/mL → quantidade administrada em mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: heparina prescrita em UI — frascos no posto de enfermagem em UI/mL.',
          'Fixar dados: prescritos 3.500 UI para o paciente | frascos de 5.000 UI/mL.',
          'Montar regra de três: 3.500 UI ── X mL | 5.000 UI ── 1 mL.',
          'Calcular: X = 3.500 ÷ 5.000 = 0,7 mL.',
          'Eliminar A (0,5 mL): subdose — equivale a 2.500 UI, não 3.500.',
          'Eliminar C (1,0 mL): superestima — 1 mL = 5.000 UI (dose excessiva).',
          'Eliminar D (3,5 mL) e E (4,0 mL): confundem UI prescritas com mL diretamente.',
          'Localizar alternativa B = 0,7 mL.',
          'Marcar B.',
          'Fixação: UI prescritas ÷ concentração (UI/mL) = volume em mL.',
        ],
        footer_rule: 'Roteiro: 3.500 UI ÷ 5.000 UI/mL = 0,7 mL → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — heparina UI/mL',
        meta: slideMeta,
        content: 'UI ÷ (UI/mL) = mL',
        rows: [
          { label: 'Prescrito', value: '3.500 UI', badge: 'hot', emphasis: 'highlight' },
          { label: 'Apresentação', value: '5.000 UI/mL', badge: 'ok' },
          { label: 'Regra de três', value: '3.500 UI ── X mL | 5.000 UI ── 1 mL', badge: 'hot' },
          { label: 'Volume', value: '3.500 ÷ 5.000 = 0,7 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 0,5 mL', value: '2.500 UI — subdose de 1.000 UI', badge: 'warn' },
          { label: 'Erro 1,0 mL', value: '5.000 UI — dose quase o dobro do prescrito', badge: 'warn' },
          { label: 'Erro 3,5 mL', value: 'confunde 3.500 UI com 3,5 mL sem dividir por 5.000', badge: 'warn' },
        ],
        footer_rule: 'Anticoagulante: UI prescritas ÷ UI/mL = mL na seringa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HEPARINA 3.500 UI',
        items: [
          {
            label: 'Letra A — 0,5 mL',
            detail: 'Subdose — 0,5 mL × 5.000 UI/mL = 2.500 UI, faltam 1.000 UI.',
            correct: '3.500 UI exigem 0,7 mL — não 0,5 mL.',
          },
          {
            label: 'Letra C — 1,0 mL',
            detail: 'Superestima — 1 mL inteiro = 5.000 UI (1.500 UI a mais).',
            correct: '0,7 mL entrega exatamente 3.500 UI na concentração 5.000 UI/mL.',
          },
          {
            label: 'Letra D — 3,5 mL',
            detail: 'Confunde 3.500 UI com 3,5 mL — ignora a concentração UI/mL.',
            correct: 'Volume = UI prescritas ÷ UI/mL = 0,7 mL.',
          },
          {
            label: 'Letra E — 4,0 mL',
            detail: 'Volume aleatório sem relação com 5.000 UI/mL.',
            correct: '4 mL × 5.000 = 20.000 UI — overdose grave.',
          },
          {
            label: 'Em outra banca — UI vs mg',
            detail: 'Heparina nunca é prescrita em mg em prova técnica — sempre UI.',
            correct: 'Mantenha UI com UI na regra de três; resposta em mL.',
          },
        ],
        footer_rule: 'UI prescritas ÷ UI/mL = mL — nunca confunda UI com mL',
      },
    ],
  },

  'fau-unicentro-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056309743-6': {
    family: 'calc',
    guideline: 'Infusão 5.000 mL em 24 h — macrogotas (V×20)÷1.440 min',
    roi_error: 'volume_ou_tempo_subestimado',
    exam_vs_current: 'conta da prova — 5.000 mL SG 5% em 24 h ≈ 69 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: '5.000 mL em 24 h — SG 5%',
        meta: slideMeta,
        items: [
          {
            label: 'Volume alto',
            detail: '5.000 mL de soro glicosado a 5% — infusão de manutenção prolongada.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo total',
            detail: '24 horas = 1.440 minutos — dia inteiro de infusão.',
            icon: 'Clock',
          },
          {
            label: 'Fator macrogotas',
            detail: '20 gotas/mL — padrão quando o equipo não é microgotas.',
            icon: 'Gauge',
          },
          {
            label: 'Fórmula',
            detail: 'gts/min = (5.000 × 20) ÷ 1.440 = 69,44 ≈ 69.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Usar 500 mL em vez de 5.000 mL — reduz fluxo em 10× (cai em 7 ou 15 gts/min).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão FAU Unicentro',
            detail: 'Grande volume + 24 h: conferir zeros do mL antes de multiplicar por 20.',
            icon: 'Target',
          },
        ],
        footer_rule: '5.000 mL / 24 h = (5.000×20)/1.440 ≈ 69 gts/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 5.000 mL de SG 5% para correr em 24 horas.',
          'Converter tempo: 24 h × 60 = 1.440 minutos.',
          'Aplicar macrogotas: gts/min = (5.000 × 20) ÷ 1.440.',
          'Calcular: 100.000 ÷ 1.440 = 69,44 gotas por minuto.',
          'Arredondar: D = 69 gotas por minuto.',
          'Eliminar A (15): usa 500 mL em vez de 5.000 mL — erro de escala.',
          'Eliminar B (27) e C (30): volume ~2.000 mL ou tempo superestimado.',
          'Eliminar E (50): divide por 12 h em vez de 24 h.',
          'Localizar alternativa D = 69 gotas por minuto.',
          'Marcar D.',
          'Fixação: em volumes altos, conte os zeros — 5.000 ≠ 500.',
        ],
        footer_rule: 'Roteiro: 5.000 mL → 1.440 min → (×20)/÷ = 69 → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 5.000 mL / 24 h',
        meta: slideMeta,
        content: '(5.000 × 20) ÷ 1.440',
        rows: [
          { label: 'Volume', value: '5.000 mL (não 500)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Tempo', value: '24 h = 1.440 min', badge: 'ok' },
          { label: 'Fator', value: '20 gotas/mL', badge: 'ok' },
          { label: 'Conta', value: '(5.000×20)÷1.440 = 69,44 ≈ 69', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 15 gts/min', value: '500 mL em vez de 5.000 — escala ÷10', badge: 'warn' },
          { label: 'Erro 50 gts/min', value: 'divide por 12 h (720 min) em vez de 24 h', badge: 'warn' },
          { label: 'Erro 30 gts/min', value: 'volume ~2.160 mL ou fator 10', badge: 'warn' },
        ],
        footer_rule: 'Grande volume: confira zeros antes de (V×20)÷min',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 5.000 mL / 24 HORAS',
        items: [
          {
            label: 'Letra A — 15 gotas/min',
            detail: 'Usa 500 mL — perde um zero no volume.',
            correct: '5.000 mL em 1.440 min com fator 20 = ~69 gts/min — não 15.',
          },
          {
            label: 'Letra B — 27 gotas/min',
            detail: 'Volume ~1.944 mL ou tempo ~2.667 min — escala intermediária errada.',
            correct: 'Com 5.000 mL e 24 h, o fluxo é 69 gts/min.',
          },
          {
            label: 'Letra C — 30 gotas/min',
            detail: 'Volume ~2.160 mL — ainda muito abaixo dos 5.000 mL reais.',
            correct: 'Repita: 5.000×20 = 100.000 gotas ÷ 1.440 min ≈ 69.',
          },
          {
            label: 'Letra E — 50 gotas/min',
            detail: 'Divide por 12 h (metade do tempo) — dobra o fluxo esperado.',
            correct: '24 h = 1.440 min — não 720 min.',
          },
          {
            label: 'Em outra banca — SG 5%',
            detail: 'A concentração 5% não altera o cálculo de gts/min — só o volume em mL.',
            correct: 'Gotejamento depende de mL e tempo, não do tipo de soro.',
          },
        ],
        footer_rule: '5.000 mL: confira zeros | 24 h = 1.440 min',
      },
    ],
  },

  'fauel-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056318806-2': {
    family: 'calc',
    guideline: 'Plasil VO — mg → mL (regra de três) → gotas (×20)',
    roi_error: 'pular_conversao_ml_para_gotas',
    exam_vs_current: 'conta da prova — 5 mg, 4 mg/mL, 20 gts/mL → 25 gotas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Metoclopramida VO — mg para gotas',
        meta: slideMeta,
        items: [
          {
            label: 'Dose prescrita',
            detail: '5 mg de cloridrato de metoclopramida (Plasil) via oral.',
            icon: 'Pill',
          },
          {
            label: 'Concentração do frasco',
            detail: '4 mg/mL — converter miligramas em mililitros primeiro.',
            icon: 'FlaskConical',
          },
          {
            label: 'Equivalência gotas',
            detail: '1 mL = 20 gotas — segunda etapa após obter mL.',
            icon: 'Droplets',
          },
          {
            label: 'Cadeia em dois passos',
            detail: '5 mg → mL (÷4) → gotas (×20) = 25 gotas.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Multiplicar 5 mg × 20 gotas sem converter para mL — resposta 100 gotas.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão FAUEL neste tema',
            detail: 'VO em gotas: sempre feche mL antes de aplicar fator 20.',
            icon: 'Target',
          },
        ],
        footer_rule: 'mg → mL (÷ mg/mL) → gotas (×20) | 5 mg / 4 mg/mL × 20 = 25',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: dose em mg, frasco em mg/mL, resposta em gotas VO.',
          'Converter mg em mL: 5 mg ÷ 4 mg/mL = 1,25 mL.',
          'Converter mL em gotas: 1,25 mL × 20 gotas/mL = 25 gotas.',
          'Eliminar A (20 gotas): usa 1,0 mL em vez de 1,25 mL.',
          'Eliminar B (22 gotas): arredondamento intermediário ou divisor 4,5.',
          'Eliminar D (27 gotas): superestima mL (~1,35 mL) ou multiplica mg×20.',
          'Localizar alternativa C = 25 gotas.',
          'Marcar C.',
          'Fixação: VO em gotas exige duas etapas — mg→mL, depois mL→gotas.',
        ],
        footer_rule: 'Roteiro: 5÷4 = 1,25 mL → ×20 = 25 gotas → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Plasil mg → gotas',
        meta: slideMeta,
        content: 'mg ÷ (mg/mL) × 20',
        rows: [
          { label: 'Dose', value: '5 mg prescritos', badge: 'hot', emphasis: 'highlight' },
          { label: 'Concentração', value: '4 mg/mL', badge: 'ok' },
          { label: 'Volume', value: '5 ÷ 4 = 1,25 mL', badge: 'info' },
          { label: 'Gotas', value: '1,25 × 20 = 25 gotas', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 20 gotas', value: '1,0 mL × 20 — subdose de 1 mg', badge: 'warn' },
          { label: 'Erro 100 gotas', value: '5 mg × 20 — pula conversão mg→mL', badge: 'warn' },
          { label: 'Equivalência', value: '1 mL = 20 gotas (macrogotas VO)', badge: 'ok' },
        ],
        footer_rule: 'Duas etapas: mg→mL, depois mL→gotas (×20)',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PLASIL 5 mg EM GOTAS',
        items: [
          {
            label: 'Letra A — 20 gotas',
            detail: 'Usa 1,0 mL em vez de 1,25 mL — subdose de 1 mg.',
            correct: '5 mg ÷ 4 mg/mL = 1,25 mL × 20 = 25 gotas — não 20.',
          },
          {
            label: 'Letra B — 22 gotas',
            detail: 'Arredondamento errado entre 20 e 25 — não fecha 1,25 mL.',
            correct: '1,25 mL × 20 = 25 gotas exatas.',
          },
          {
            label: 'Letra D — 27 gotas',
            detail: 'Superestima volume (~1,35 mL) ou aplica fator diferente de 20.',
            correct: 'Com 4 mg/mL, 5 mg = 1,25 mL = 25 gotas.',
          },
          {
            label: 'Em outra banca — gotas diretas',
            detail: 'Se a prescrição vier em gotas, inverta: gotas ÷ 20 = mL.',
            correct: 'Aqui a prescrição é em mg — converta mg→mL→gotas.',
          },
        ],
        footer_rule: 'mg → mL → gotas: nunca pule a etapa intermediária',
      },
    ],
  },

  'fepese-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056284398-3': {
    family: 'calc',
    guideline: 'SF 500 mL em 12 h — macrogotas (V×20)÷720 min ≈14',
    roi_error: 'tempo_ou_fator_errado',
    exam_vs_current: 'conta da prova — 500 mL SF 0,9% em 12 h ≈14 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SF 500 mL — 12 horas',
        meta: slideMeta,
        items: [
          {
            label: 'Solução fisiológica',
            detail: '500 mL de SF 0,9% — volume e tempo definem o gotejamento.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo prescrito',
            detail: '12 horas = 720 minutos — converter antes da fórmula.',
            icon: 'Clock',
          },
          {
            label: 'Macrogotas padrão',
            detail: 'Fator 20 — equipo habitual em provas FEPESE.',
            icon: 'Gauge',
          },
          {
            label: 'Conta',
            detail: '(500 × 20) ÷ 720 = 13,89 ≈ 14 gotas por minuto.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Responder 28 gts/min (dobra o fluxo) ou 4 gts/min (divide tempo por 3).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão FEPESE neste tema',
            detail: 'Infusão simples: volume único, tempo em horas, arredondar “aproximadamente”.',
            icon: 'Target',
          },
        ],
        footer_rule: '500 mL / 12 h = (500×20)/720 ≈ 14 gts/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 500 mL de SF em 12 horas — gts/min aproximado.',
          'Converter tempo: 12 h × 60 = 720 minutos.',
          'Aplicar fórmula: gts/min = (500 × 20) ÷ 720.',
          'Calcular: 10.000 ÷ 720 = 13,89 gotas por minuto.',
          'Arredondar: B = aproximadamente 14 gotas por minuto.',
          'Eliminar A (4): fluxo muito baixo — tempo superestimado ou fator errado.',
          'Eliminar C (28): dobra o fluxo — divide por 6 h em vez de 12 h.',
          'Eliminar D (30) e E (40): volume ou tempo incorretos na regra.',
          'Localizar alternativa B = aproximadamente 14 gotas por minuto.',
          'Marcar B.',
          'Fixação: 500 mL em 12 h com macrogotas rende ~14 gts/min — não 28.',
        ],
        footer_rule: 'Roteiro: 12 h → 720 min → (500×20)/720 ≈ 14 → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 500 mL / 12 h',
        meta: slideMeta,
        content: '(500 × 20) ÷ 720',
        rows: [
          { label: 'Volume', value: '500 mL SF 0,9%', badge: 'ok' },
          { label: 'Tempo', value: '12 h = 720 min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator', value: '20 gotas/mL', badge: 'ok' },
          { label: 'Conta', value: '(500×20)÷720 = 13,89 ≈ 14', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 28 gts/min', value: 'divide por 6 h (360 min) — metade do tempo', badge: 'warn' },
          { label: 'Erro 4 gts/min', value: 'tempo ~2.160 min ou volume ~144 mL', badge: 'warn' },
          { label: 'Comparar', value: '1.000 mL/12 h ≈ 28 | 500 mL/12 h ≈ 14 (metade)', badge: 'info' },
        ],
        footer_rule: 'Metade do volume = metade do fluxo (mesmo tempo)',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SF 500 mL / 12 HORAS',
        items: [
          {
            label: 'Letra A — 4 gotas/min',
            detail: 'Fluxo muito baixo — tempo 3× maior ou volume ~144 mL.',
            correct: '500 mL em 720 min com fator 20 ≈ 14 gts/min — não 4.',
          },
          {
            label: 'Letra C — 28 gotas/min',
            detail: 'Dobra o fluxo — usa 6 h em vez de 12 h ou 1.000 mL em vez de 500.',
            correct: '500 mL rende metade de 1.000 mL no mesmo tempo: ~14, não 28.',
          },
          {
            label: 'Letra D — 30 gotas/min',
            detail: 'Tempo ~480 min (8 h) ou volume ~540 mL na conta.',
            correct: 'Com 720 min e 500 mL, o fluxo é ~14 gts/min.',
          },
          {
            label: 'Letra E — 40 gotas/min',
            detail: 'Tempo ~360 min (6 h) — metade do prescrito.',
            correct: '12 h = 720 min — conferir conversão antes de dividir.',
          },
          {
            label: 'Em outra banca — SF 0,9%',
            detail: 'O tipo de soro não altera gts/min — só volume e tempo.',
            correct: 'SF, SG ou RL: mesma fórmula (V×20)÷min.',
          },
        ],
        footer_rule: '500 mL/12 h ≈ 14 | 1.000 mL/12 h ≈ 28 — memorize a proporção',
      },
    ],
  },

  'fepese-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056284398-4': {
    family: 'calc',
    guideline: 'Ampicilina — regra de três 200 mg com 500 mg/5 mL',
    roi_error: 'dividir_por_5_sem_calcular_mg_mL',
    exam_vs_current: 'conta da prova — 200 mg, frasco 500 mg/5 mL → 2 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ampicilina — mg para mL',
        meta: slideMeta,
        items: [
          {
            label: 'Dose prescrita',
            detail: '200 mg de ampicilina — alvo da regra de três.',
            icon: 'Syringe',
          },
          {
            label: 'Frasco-ampola',
            detail: '500 mg em 5 mL → concentração 100 mg/mL.',
            icon: 'FlaskConical',
          },
          {
            label: 'Regra de três',
            detail: '200 mg ── X mL | 500 mg ── 5 mL → X = 2 mL.',
            icon: 'Calculator',
          },
          {
            label: 'Atalho concentração',
            detail: '200 mg ÷ 100 mg/mL = 2 mL — após calcular mg/mL.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Responder 0,5 mL (divide 200 por 400) ou 4 mL (dose do frasco inteiro).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão FEPESE neste tema',
            detail: 'Antibiótico EV/IM: regra de três mg com apresentação mg/mL.',
            icon: 'Target',
          },
        ],
        footer_rule: '200 mg ÷ 100 mg/mL = 2 mL | ou 200 mg ── X | 500 mg ── 5 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: dose em mg com frasco-ampola mg/mL — resposta em mL.',
          'Calcular concentração: 500 mg ÷ 5 mL = 100 mg/mL.',
          'Aplicar regra de três: 200 mg ── X mL | 500 mg ── 5 mL.',
          'Resolver: X = (200 × 5) ÷ 500 = 2 mL. Ou: 200 ÷ 100 = 2 mL.',
          'Eliminar A (0,5 mL): subdose — equivale a 50 mg.',
          'Eliminar B (1 mL): metade da dose — 100 mg, não 200 mg.',
          'Eliminar D (4 mL) e E (3 mL): superestimam ou arredondam sem base.',
          'Localizar alternativa C = 2 mL.',
          'Marcar C.',
          'Fixação: calcule mg/mL (500÷5=100) antes da regra de três.',
        ],
        footer_rule: 'Roteiro: 500 mg/5 mL = 100 mg/mL → 200 mg = 2 mL → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ampicilina mg/mL',
        meta: slideMeta,
        content: 'mg ÷ (mg/mL) = mL',
        rows: [
          { label: 'Prescrito', value: '200 mg', badge: 'hot', emphasis: 'highlight' },
          { label: 'Apresentação', value: '500 mg em 5 mL', badge: 'ok' },
          { label: 'Concentração', value: '500 ÷ 5 = 100 mg/mL', badge: 'info' },
          { label: 'Volume', value: '200 ÷ 100 = 2 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Regra de três', value: '200 mg ── 2 mL | 500 mg ── 5 mL', badge: 'ok' },
          { label: 'Erro 0,5 mL', value: '50 mg — subdose de 150 mg', badge: 'warn' },
          { label: 'Erro 4 mL', value: '400 mg — dose dobrada', badge: 'warn' },
        ],
        footer_rule: 'Frasco mg/mL: concentração = mg totais ÷ mL, depois dose ÷ concentração',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AMPICILINA 200 mg',
        items: [
          {
            label: 'Letra A — 0,5 mL',
            detail: 'Subdose — 0,5 mL × 100 mg/mL = 50 mg, faltam 150 mg.',
            correct: '200 mg exigem 2 mL na concentração 100 mg/mL.',
          },
          {
            label: 'Letra B — 1 mL',
            detail: 'Metade da dose — 100 mg, não 200 mg prescritos.',
            correct: '1 mL = 100 mg — dobre para 2 mL e atinja 200 mg.',
          },
          {
            label: 'Letra D — 4 mL',
            detail: 'Superestima — 4 mL × 100 = 400 mg (dose dobrada).',
            correct: '200 mg ÷ 100 mg/mL = 2 mL — não 4 mL.',
          },
          {
            label: 'Letra E — 3 mL',
            detail: '300 mg — 100 mg a mais sem base na regra de três.',
            correct: 'Regra de três fecha em 2 mL exatos.',
          },
          {
            label: 'Em outra banca — frasco 1 g',
            detail: 'Se vier 1 g/5 mL, concentração = 200 mg/mL — recalcule.',
            correct: 'Sempre derive mg/mL da apresentação antes da conta.',
          },
        ],
        footer_rule: 'mg prescritos ÷ mg/mL = mL — conferir concentração primeiro',
      },
    ],
  },

  'fepese-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056309743-3': {
    family: 'calc',
    guideline: 'Cefalotina 500 mg — frasco 1 g/5 mL = 200 mg/mL → 2,5 mL',
    roi_error: 'nao_converter_grama_ou_usar_5_mL_inteiro',
    exam_vs_current: 'conta da prova — 500 mg, 1 g em 5 mL (200 mg/mL) → 2,5 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cefalotina — 500 mg em mL',
        meta: slideMeta,
        items: [
          {
            label: 'Dose prescrita',
            detail: '500 mg de cefalotina sódica — metade do frasco de 1 g.',
            icon: 'Syringe',
          },
          {
            label: 'Frasco-ampola',
            detail: '1 grama (1.000 mg) em 5 mL — enunciado confirma 200 mg/mL.',
            icon: 'FlaskConical',
          },
          {
            label: 'Concentração',
            detail: '1.000 mg ÷ 5 mL = 200 mg/mL — dado explícito no enunciado.',
            icon: 'Calculator',
          },
          {
            label: 'Volume necessário',
            detail: '500 mg ÷ 200 mg/mL = 2,5 mL.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Responder 5 mL (frasco inteiro = 1 g) ou 1 mL (200 mg, metade da dose).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão FEPESE neste tema',
            detail: 'Frasco em gramas: converter 1 g = 1.000 mg antes de derivar mg/mL.',
            icon: 'Target',
          },
        ],
        footer_rule: '1 g/5 mL = 200 mg/mL | 500 mg = 2,5 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: dose em mg com frasco 1 g/5 mL — resposta em mL.',
          'Converter massa: 1 g = 1.000 mg → concentração 200 mg/mL (dado no enunciado).',
          'Aplicar regra de três: 500 mg ── X mL | 1.000 mg ── 5 mL.',
          'Resolver: X = (500 × 5) ÷ 1.000 = 2,5 mL. Ou: 500 ÷ 200 = 2,5 mL.',
          'Eliminar A (1 mL): subdose — 200 mg, metade do prescrito.',
          'Eliminar B (2 mL): 400 mg — 100 mg a menos.',
          'Eliminar D (5 mL): frasco inteiro = 1 g (1.000 mg), dose dobrada.',
          'Eliminar E (25 mL): escala decimal errada — divide 500 por 20.',
          'Localizar alternativa C = 2,5 mL.',
          'Marcar C.',
          'Fixação: 500 mg é metade de 1 g — em 200 mg/mL, metade de 5 mL = 2,5 mL.',
        ],
        footer_rule: 'Roteiro: 1 g/5 mL = 200 mg/mL → 500 mg = 2,5 mL → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — cefalotina 500 mg',
        meta: slideMeta,
        content: '500 mg ÷ 200 mg/mL',
        rows: [
          { label: 'Frasco', value: '1 g (1.000 mg) em 5 mL', badge: 'ok' },
          { label: 'Concentração', value: '200 mg/mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Prescrito', value: '500 mg (metade do frasco)', badge: 'info' },
          { label: 'Volume', value: '500 ÷ 200 = 2,5 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Regra de três', value: '500 mg ── 2,5 mL | 1.000 mg ── 5 mL', badge: 'ok' },
          { label: 'Erro 1 mL', value: '200 mg — subdose de 300 mg', badge: 'warn' },
          { label: 'Erro 5 mL', value: '1.000 mg — frasco inteiro, dose dobrada', badge: 'warn' },
        ],
        footer_rule: 'Metade da dose = metade do volume (mesma concentração)',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CEFALOTINA 500 mg',
        items: [
          {
            label: 'Letra A — 1,0 mL',
            detail: 'Subdose — 1 mL × 200 mg/mL = 200 mg, faltam 300 mg.',
            correct: '500 mg exigem 2,5 mL na concentração 200 mg/mL.',
          },
          {
            label: 'Letra B — 2,0 mL',
            detail: '400 mg — 100 mg a menos que o prescrito.',
            correct: '500 mg ÷ 200 mg/mL = 2,5 mL — não 2 mL.',
          },
          {
            label: 'Letra D — 5,0 mL',
            detail: 'Frasco inteiro — 1 g (1.000 mg), dose dobrada.',
            correct: '500 mg é metade de 1 g → 2,5 mL, não 5 mL.',
          },
          {
            label: 'Letra E — 25 mL',
            detail: 'Escala errada — divide 500 por 20 ou confunde mg com mL.',
            correct: '500 mg em 200 mg/mL = 2,5 mL — única resposta coerente.',
          },
          {
            label: 'Em outra banca — 1 g/10 mL',
            detail: 'Se o volume final for 10 mL, concentração = 100 mg/mL — recalcule.',
            correct: 'Sempre derive mg/mL da apresentação antes da dose.',
          },
        ],
        footer_rule: '500 mg de 1 g/5 mL = 2,5 mL — metade do frasco',
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
    console.log(`[handcraft:calculo-g04] OK ${slug}`);
  }
  console.log(`[handcraft:calculo-g04] total=${ok}`);
}

main();
