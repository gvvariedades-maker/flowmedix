#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — calculo-de-administracao-de-medicamentos-e-infusoes-g02 (8 slugs).
 *
 *   npx tsx scripts/handcraft-calculo-de-administracao-de-medicamentos-e-infusoes-g02.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'calculo-de-administracao-de-medicamentos-e-infusoes-g02';
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
    '1 mL = 20 gotas',
    'concentração mg/mL',
    'infusão mL/h',
    'percentual p/v',
    'microgotas fator 60',
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
  'avancasp-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056292978-2': {
    family: 'calc',
    guideline: 'Regra de três — dose mg ÷ concentração mg/mL = volume mL (Tramadol 60 mg)',
    roi_error: 'multiplicar_em_vez_de_dividir_mg_por_mgml',
    exam_vs_current: 'conta da prova — 60 mg prescritos, ampola 25 mg/mL → 2,4 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tramadol — dose em mililitros',
        meta: slideMeta,
        items: [
          {
            label: 'Dose prescrita',
            detail: '60 mg de tramadol — massa em miligramas a administrar.',
            icon: 'FileText',
          },
          {
            label: 'Apresentação da ampola',
            detail: '3 mL com 25 mg/mL — concentração para a regra de três.',
            icon: 'FlaskConical',
          },
          {
            label: 'Fórmula direta',
            detail: 'mL = dose (mg) ÷ mg/mL — dividir, não multiplicar.',
            icon: 'Calculator',
          },
          {
            label: 'Conta fechada',
            detail: '60 mg ÷ 25 mg/mL = 2,4 mL na seringa.',
            icon: 'Equal',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Multiplicar 60 × 25 ou usar volume total da ampola (3 mL).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão AVANÇASP neste tema',
            detail: 'Prescrição em mg + apresentação mg/mL → volume em mL.',
            icon: 'Target',
          },
        ],
        footer_rule: 'mg prescritos ÷ mg/mL = mL a aspirar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: dose em mg com apresentação mg/mL — resposta em mL.',
          'Fixar concentração: ampola 25 mg/mL (3 mL totais na ampola).',
          'Aplicar regra de três: 60 mg ── X mL | 25 mg ── 1 mL → X = 60 ÷ 25 = 2,4 mL.',
          'Eliminar B (3,5 mL): superestima — multiplica ou soma volume da ampola.',
          'Eliminar C (4,5 mL) e D (5,0 mL): erros de escala na divisão mg/mL.',
          'Eliminar E (6,3 mL): inverte a conta (60 × 0,105) ou usa dose diária errada.',
          'Localizar alternativa A = 2,4 mL.',
          'Marcar A.',
          'Fixação: dose (mg) ÷ concentração (mg/mL) = volume (mL) — sempre dividir.',
        ],
        footer_rule: 'Roteiro: 60 mg ÷ 25 mg/mL = 2,4 mL → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — mg para mL',
        meta: slideMeta,
        content: 'dose ÷ mg/mL = mL',
        rows: [
          { label: 'Fórmula', value: 'mL = dose (mg) ÷ mg/mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Regra de três', value: 'dose mg ── mL | mg/mL ── 1 mL', badge: 'ok' },
          { label: 'Tramadol — dose', value: '60 mg prescritos', badge: 'info' },
          { label: 'Tramadol — apresentação', value: '25 mg/mL', badge: 'info' },
          { label: 'Tramadol — volume', value: '60 ÷ 25 = 2,4 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 3,5 mL', value: 'multiplica mg × fator ou soma 3 mL da ampola', badge: 'warn' },
          { label: 'Conferência', value: 'mg com mg, mL com mL — unidade coerente', badge: 'ok' },
        ],
        footer_rule: 'Prescrição em mg + ampola mg/mL → divida para obter mL',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TRAMADOL 60 mg',
        items: [
          {
            label: 'Letra B — 3,5 mL',
            detail: 'Soma volume da ampola (3 mL) com fração da dose — sem base na concentração.',
            correct: '60 mg ÷ 25 mg/mL = 2,4 mL — não 3,5 mL.',
          },
          {
            label: 'Letra C — 4,5 mL',
            detail: 'Divide 60 por ~13 ou usa concentração invertida (mL/mg).',
            correct: 'Com 25 mg/mL, 60 mg rendem 2,4 mL — não 4,5 mL.',
          },
          {
            label: 'Letra D — 5,0 mL',
            detail: 'Aproxima dose dobrada — erro de escala decimal.',
            correct: '2,4 mL é exato: 60 ÷ 25 sem arredondar cedo.',
          },
          {
            label: 'Letra E — 6,3 mL',
            detail: 'Multiplica 60 × 0,105 ou confunde mg totais da ampola (75 mg) com dose.',
            correct: 'Ampola tem 75 mg em 3 mL, mas a prescrição pede só 60 mg = 2,4 mL.',
          },
          {
            label: 'Em outra banca — ampola fracionada',
            detail: 'Mesmo trilho vale para qualquer mg com apresentação mg/mL.',
            correct: 'Sempre: dose prescrita ÷ concentração = mL a aspirar.',
          },
        ],
        footer_rule: 'mg ÷ mg/mL = mL — nunca multiplique dose pela concentração',
      },
    ],
  },

  'avancasp-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056292978-7': {
    family: 'calc',
    guideline: 'Gentamicina IM — regra de três mg/mL + volume máximo por sítio muscular',
    roi_error: 'site_muscular_inadequado_para_volume',
    exam_vs_current: 'enunciado 80 mg/2L — leitura técnica 80 mg/2 mL → 5 mL dorsoglúteo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gentamicina IM — mL e sítio',
        meta: slideMeta,
        items: [
          {
            label: 'Dose prescrita',
            detail: '200 mg de gentamicina (garamicina) por via intramuscular.',
            icon: 'FileText',
          },
          {
            label: 'Apresentação',
            detail: '80 mg/2 mL — concentração 40 mg/mL (enunciado com typo 2L).',
            icon: 'FlaskConical',
          },
          {
            label: 'Volume calculado',
            detail: '200 mg ÷ 40 mg/mL = 5 mL — acima do limite do deltoide.',
            icon: 'Calculator',
          },
          {
            label: 'Sítio deltoide',
            detail: 'Máximo ~2 mL em adulto — 5 mL excede capacidade segura.',
            icon: 'Activity',
          },
          {
            label: 'Sítio dorsoglúteo',
            detail: 'Aceita volumes maiores (até ~5 mL) — escolha correta para 5 mL.',
            icon: 'Target',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Acertar 5 mL mas marcar deltoide — volume correto, sítio errado.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Calcule mL E escolha músculo compatível com o volume',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: dose em mg + apresentação + volume em mL E sítio IM.',
          'Interpretar apresentação: 80 mg em 2 mL → 40 mg/mL (2L no enunciado = erro tipográfico).',
          'Calcular volume: 200 mg ÷ 40 mg/mL = 5 mL.',
          'Avaliar sítio: 5 mL excede deltoide (~2 mL) — descartar A, B e C.',
          'Eliminar A (3,5 mL deltoide) e B (4,0 mL deltoide): subdose e sítio inadequado.',
          'Eliminar C (4,5 mL deltoide): volume e local incorretos.',
          'Eliminar E (6,0 mL dorsoglúteo): superestima dose — 240 mg em vez de 200 mg.',
          'Localizar alternativa D = 5,0 mL no dorsoglúteo.',
          'Marcar D.',
          'Fixação: em IM, feche mL pela regra de três e depois valide o músculo pelo volume.',
        ],
        footer_rule: 'Roteiro: 200 ÷ 40 = 5 mL → dorsoglúteo → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — IM: dose + sítio',
        meta: slideMeta,
        content: 'mg ÷ mg/mL · músculo',
        rows: [
          { label: 'Concentração', value: '80 mg ÷ 2 mL = 40 mg/mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Volume', value: '200 mg ÷ 40 = 5 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Deltoide — limite', value: 'máx. ~2 mL (adulto)', badge: 'warn' },
          { label: 'Dorsoglúteo — limite', value: 'até ~5 mL — adequado aqui', badge: 'ok' },
          { label: 'Erro 4,0 mL deltoide', value: 'subdose (160 mg) + sítio ok para volume menor', badge: 'warn' },
          { label: 'Erro 6,0 mL', value: '240 mg — 20% acima da prescrição', badge: 'warn' },
          { label: 'Conferência', value: 'mL correto + músculo compatível com volume', badge: 'ok' },
        ],
        footer_rule: 'IM: calcule mL e escolha sítio que suporte o volume',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GENTAMICINA 200 mg IM',
        items: [
          {
            label: 'Letra A — 3,5 mL deltoide',
            detail: 'Subdose (140 mg) e volume ainda alto para deltoide.',
            correct: '200 mg exigem 5 mL — 3,5 mL administra só 140 mg.',
          },
          {
            label: 'Letra B — 4,0 mL deltoide',
            detail: '160 mg calculados — subdose com sítio inadequado para 4 mL.',
            correct: '5 mL no dorsoglúteo é o par volume + local correto.',
          },
          {
            label: 'Letra C — 4,5 mL deltoide',
            detail: '180 mg — quase a dose, mas deltoide não comporta 4,5 mL com segurança.',
            correct: 'Volume correto é 5 mL — local deve ser dorsoglúteo.',
          },
          {
            label: 'Letra E — 6,0 mL dorsoglúteo',
            detail: 'Superestima: 6 × 40 = 240 mg — 20% acima dos 200 mg prescritos.',
            correct: '200 mg ÷ 40 mg/mL = 5 mL exatos — não 6 mL.',
          },
          {
            label: 'Em outra banca — volume IM',
            detail: 'Prova pode cobrar só mL ou só sítio — aqui cobra os dois.',
            correct: 'Sempre: regra de três primeiro, depois limite anatômico do músculo.',
          },
        ],
        footer_rule: '5 mL IM → dorsoglúteo; deltoide só para volumes menores',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056256294-8': {
    family: 'calc',
    guideline: 'Percentual p/v — 50% glicose em 20 mL = 10 g = 10.000 mg',
    roi_error: 'confundir_percentual_com_gramas_totais_ampola',
    exam_vs_current: 'conta da prova — ampola 50% com 20 mL → 10.000 mg',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Glicose 50% — mg na ampola',
        meta: slideMeta,
        items: [
          {
            label: 'Concentração 50%',
            detail: '50 g de glicose em 100 mL de solução (p/v).',
            icon: 'Percent',
          },
          {
            label: 'Volume da ampola',
            detail: '20 mL — fração da solução hipertônica a quantificar.',
            icon: 'Droplets',
          },
          {
            label: 'Proporção',
            detail: '20 mL = 1/5 de 100 mL → 1/5 de 50 g = 10 g.',
            icon: 'Calculator',
          },
          {
            label: 'Conversão para mg',
            detail: '10 g = 10.000 mg — resposta pedida em miligramas.',
            icon: 'ArrowLeftRight',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Responder 50 g (concentração) ou 50.000 mg (multiplica por 1000 errado).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão CEBRASPE neste tema',
            detail: 'Percentual + volume → gramas → converter para mg se pedido.',
            icon: 'Target',
          },
        ],
        footer_rule: '50% em 20 mL = 10 g = 10.000 mg',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: quantidade de glicose em ampola 50% com 20 mL — resposta em mg.',
          'Decodificar 50%: 50 g de soluto em 100 mL de solução.',
          'Proporcionar ao volume: 20 mL é 1/5 de 100 mL → 50 g ÷ 5 = 10 g.',
          'Converter: 10 g × 1.000 = 10.000 mg.',
          'Eliminar A (50 g): é a concentração por 100 mL, não a massa em 20 mL.',
          'Eliminar B (1.000 g): escala decimal errada — divide por 10 em vez de 5.',
          'Eliminar C (50.000 mg): confunde 50 g/100 mL com massa total na ampola de 20 mL.',
          'Localizar alternativa D = 10.000 miligramas.',
          'Marcar D.',
          'Fixação: percentual sempre refere a gramas em 100 mL — proporcione ao volume real.',
        ],
        footer_rule: 'Roteiro: 50% → 50g/100mL → 20mL = 10g → 10.000 mg → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — percentual p/v',
        meta: slideMeta,
        content: '% → g/100mL → mg',
        rows: [
          { label: 'Definição 50%', value: '50 g em 100 mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Regra rápida', value: 'mg/mL = % × 10 → 50% = 500 mg/mL', badge: 'ok' },
          { label: '20 mL de 50%', value: '10 g de glicose', badge: 'info' },
          { label: 'Em miligramas', value: '10 g = 10.000 mg', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 50 g', value: 'massa em 100 mL, não em 20 mL', badge: 'warn' },
          { label: 'Erro 50.000 mg', value: '50 g sem proporcionar ao volume de 20 mL', badge: 'warn' },
          { label: 'Conferência', value: 'proporcione % ao mL da ampola antes de converter', badge: 'ok' },
        ],
        footer_rule: 'Percentual: gramas em 100 mL — ajuste ao volume da ampola',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GLICOSE 50% / 20 mL',
        items: [
          {
            label: 'Letra A — 50 gramas',
            detail: 'É a definição de 50% (por 100 mL), não a massa em 20 mL.',
            correct: 'Em 20 mL há 10 g (10.000 mg), não 50 g.',
          },
          {
            label: 'Letra B — 1.000 gramas',
            detail: 'Escala errada — divide 50 por 50 em vez de por 5.',
            correct: '20 mL = 1/5 de 100 mL → 50 g ÷ 5 = 10 g.',
          },
          {
            label: 'Letra C — 50.000 miligramas',
            detail: 'Usa 50 g direto como massa na ampola sem proporcionar ao volume.',
            correct: '50 g é por 100 mL; em 20 mL a massa é 10 g = 10.000 mg.',
          },
          {
            label: 'Marcar sem converter unidade',
            detail: 'Prova pede miligramas — converter gramas × 1.000.',
            correct: '10 g × 1.000 = 10.000 mg — alternativa D.',
          },
          {
            label: 'Em outra banca — SG hipertônico',
            detail: 'Mesma lógica para qualquer %: proporcione ao mL e converta unidade.',
            correct: '50% = 50 g/100 mL — ajuste ao volume real da ampola.',
          },
        ],
        footer_rule: '50% em 20 mL ≠ 50 g — proporcione e converta para mg',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056318806-4': {
    family: 'calc',
    guideline: 'Vancomicina — 250 mg de frasco 500 mg/3 mL = 1,5 mL (não 1,4 mL)',
    roi_error: 'arredondamento_precoce_ou_regra_tres_invertida',
    exam_vs_current: 'assertiva 1,4 mL para 250 mg — cálculo correto é 1,5 mL → Errado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vancomicina — julgar o volume aspirado',
        meta: slideMeta,
        items: [
          {
            label: 'Prescrição',
            detail: '250 mg de vancomicina — dose a extrair do frasco.',
            icon: 'FileText',
          },
          {
            label: 'Frasco disponível',
            detail: '500 mg diluídos em 3 mL → 166,67 mg/mL.',
            icon: 'FlaskConical',
          },
          {
            label: 'Regra de três',
            detail: '250 mg ── X mL | 500 mg ── 3 mL → X = 1,5 mL.',
            icon: 'Calculator',
          },
          {
            label: 'Assertiva da prova',
            detail: 'Afirma aspirar 1,4 mL — valor inferior ao calculado.',
            icon: 'XCircle',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Arredondar 1,5 para 1,4 ou inverter numerador/denominador.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão CEBRASPE neste tema',
            detail: 'C/E com cálculo embutido — feche a conta antes de julgar.',
            icon: 'Target',
          },
        ],
        footer_rule: '250 mg de 500 mg/3 mL = 1,5 mL — assertiva 1,4 mL está errada',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: Certo/Errado com dose prescrita e volume aspirado na assertiva.',
          'Calcular concentração: 500 mg ÷ 3 mL = 166,67 mg/mL.',
          'Aplicar regra de três: 250 mg ── X mL | 500 mg ── 3 mL → X = (250 × 3) ÷ 500 = 1,5 mL.',
          'Confrontar assertiva: afirma 1,4 mL — subdose de ~6,7% em relação a 1,5 mL.',
          '1,4 mL × 166,67 mg/mL ≈ 233 mg — não atende os 250 mg prescritos.',
          'Conclusão: assertiva está incorreta.',
          'Localizar alternativa B = Errado.',
          'Marcar B.',
          'Fixação: em C/E de cálculo, sempre feche a conta — não aceite arredondamento sem base.',
        ],
        footer_rule: 'Roteiro: 250 mg → 1,5 mL → assertiva 1,4 mL → Errado → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vancomicina fracionada',
        meta: slideMeta,
        content: '250 mg · 500 mg/3 mL',
        rows: [
          { label: 'Concentração', value: '500 mg ÷ 3 mL = 166,67 mg/mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Regra de três', value: '250 mg ── X mL | 500 mg ── 3 mL', badge: 'ok' },
          { label: 'Volume correto', value: '(250 × 3) ÷ 500 = 1,5 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Assertiva (1,4 mL)', value: '≈ 233 mg — subdose', badge: 'warn' },
          { label: 'Diferença', value: '1,5 − 1,4 = 0,1 mL ≈ 17 mg a menos', badge: 'warn' },
          { label: 'Julgamento', value: 'não atende prescrição → Errado', badge: 'hot' },
          { label: 'Conferência', value: 'mg prescritos = mg aspirados — recalcule se divergir', badge: 'ok' },
        ],
        footer_rule: '250 mg de 500 mg/3 mL = 1,5 mL — 1,4 mL é subdose',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VANCOMICINA C/E',
        items: [
          {
            label: 'Marcar Certo sem calcular',
            detail: 'Aceita 1,4 mL por parecer “próximo” de 1,5 mL.',
            correct: '1,4 mL ≈ 233 mg — não cumpre 250 mg prescritos → Errado.',
          },
          {
            label: 'Arredondar 1,5 para 1,4',
            detail: 'Arredondamento para baixo sem critério clínico ou de prova.',
            correct: 'Regra de três exata: 1,5 mL — assertiva diverge.',
          },
          {
            label: 'Inverter regra de três',
            detail: '(500 × 3) ÷ 250 = 6 mL — escala absurda, mas elimina Certo.',
            correct: 'Dose menor que frasco → volume menor que 3 mL → 1,5 mL.',
          },
          {
            label: 'Usar 250 mg/3 mL direto',
            detail: 'Confunde dose prescrita com concentração do frasco.',
            correct: 'Concentração é 500 mg/3 mL — proporcione para 250 mg.',
          },
          {
            label: 'Em outra banca — antibiótico EV',
            detail: 'Mesmo trilho para qualquer frasco fracionado mg/mL.',
            correct: 'Sempre: mg prescritos ÷ mg/mL do frasco = mL a aspirar.',
          },
        ],
        footer_rule: 'C/E de cálculo: feche a conta antes de julgar Certo/Errado',
      },
    ],
  },

  'cetrede-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056301382-4': {
    family: 'calc',
    guideline: 'Dipirona VO — mg → mL → gotas (20 mg/mL, 1 mL = 20 gotas)',
    roi_error: 'confundir_mg_com_gotas_sem_converter_ml',
    exam_vs_current: 'conta da prova — 80 mg, frasco 20 mg/mL → 4 mL = 80 gotas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dipirona — gotas no frasco-gotas',
        meta: slideMeta,
        items: [
          {
            label: 'Dose prescrita',
            detail: '80 mg de dipirona VO se dor — massa em miligramas.',
            icon: 'FileText',
          },
          {
            label: 'Apresentação',
            detail: 'Frasco-gotas 20 mg/mL — concentração líquida.',
            icon: 'FlaskConical',
          },
          {
            label: 'Volume necessário',
            detail: '80 mg ÷ 20 mg/mL = 4 mL de solução.',
            icon: 'Calculator',
          },
          {
            label: 'Conversão em gotas',
            detail: '4 mL × 20 gotas/mL = 80 gotas — resposta da prova.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Responder 20 ou 40 gotas — pula etapa mg → mL ou usa metade do volume.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão CETREDE neste tema',
            detail: 'Prescrição mg + frasco mg/mL → mL → gotas (×20).',
            icon: 'Target',
          },
        ],
        footer_rule: 'mg → mL (÷ mg/mL) → gotas (× 20)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: dose em mg, frasco mg/mL, resposta em gotas.',
          'Calcular volume: 80 mg ÷ 20 mg/mL = 4 mL.',
          'Converter em gotas: 4 mL × 20 gotas/mL = 80 gotas.',
          'Eliminar A (20 gotas): equivale a 1 mL — só 20 mg administrados.',
          'Eliminar B (10 gotas): 0,5 mL — subdose grave (10 mg).',
          'Eliminar D (50 gotas) e E (40 gotas): erros intermediários na conversão mL→gotas.',
          'Localizar alternativa C = 80 gotas.',
          'Marcar C.',
          'Fixação: frasco-gotas exige duas etapas — mg para mL, depois mL para gotas.',
        ],
        footer_rule: 'Roteiro: 80 mg → 4 mL → 80 gotas → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — mg para gotas',
        meta: slideMeta,
        content: 'mg → mL → gotas',
        rows: [
          { label: 'Etapa 1', value: 'mL = dose (mg) ÷ mg/mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Etapa 2', value: 'gotas = mL × 20', badge: 'hot' },
          { label: 'Dipirona — volume', value: '80 ÷ 20 = 4 mL', badge: 'info' },
          { label: 'Dipirona — gotas', value: '4 × 20 = 80 gotas', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 20 gotas', value: '1 mL = 20 mg — metade da dose', badge: 'warn' },
          { label: 'Erro 40 gotas', value: '2 mL = 40 mg — metade do volume correto', badge: 'warn' },
          { label: 'Conferência', value: '80 gotas ÷ 20 = 4 mL = 80 mg', badge: 'ok' },
        ],
        footer_rule: 'Frasco-gotas: sempre converta mg → mL antes de contar gotas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DIPIRONA 80 mg',
        items: [
          {
            label: 'Letra A — 20 gotas',
            detail: 'Confunde 20 mg/mL com 1 mL inteiro — administra só 20 mg.',
            correct: '80 mg exigem 4 mL = 80 gotas — não 20 gotas.',
          },
          {
            label: 'Letra B — 10 gotas',
            detail: '0,5 mL — subdose de 10 mg, erro grave de escala.',
            correct: 'Metade de 20 gotas não corresponde a 80 mg.',
          },
          {
            label: 'Letra D — 50 gotas',
            detail: '2,5 mL — 50 mg, subdose intermediária.',
            correct: '80 mg em 20 mg/mL = 4 mL = 80 gotas exatas.',
          },
          {
            label: 'Letra E — 40 gotas',
            detail: '2 mL — exatamente metade da dose (40 mg).',
            correct: '40 gotas = 40 mg — prescrição pede 80 mg = 80 gotas.',
          },
          {
            label: 'Em outra banca — xarope mg/mL',
            detail: 'Mesmo trilho quando a resposta pede mL em vez de gotas.',
            correct: 'Primeiro mg → mL; se pedir gotas, multiplique mL × 20.',
          },
        ],
        footer_rule: 'Não responda gotas direto de mg — passe por mL',
      },
    ],
  },

  'cetrede-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056309743-7': {
    family: 'calc',
    guideline: 'KCl diluído — volume total 200 mL, (V×20)÷40 min = 100 gts/min',
    roi_error: 'esquecer_diluente_ou_usar_só_ampola',
    exam_vs_current: 'conta da prova — 10 mL KCl + 190 mL SF, 40 min → 100 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'KCl — infusão em gts/min',
        meta: slideMeta,
        items: [
          {
            label: 'Ampola de KCl',
            detail: '10 mL de cloreto de potássio — entra no volume total.',
            icon: 'FlaskConical',
          },
          {
            label: 'Diluente SF 0,9%',
            detail: '190 mL acrescentados — somar antes da fórmula.',
            icon: 'Droplets',
          },
          {
            label: 'Volume total',
            detail: '10 + 190 = 200 mL a infundir.',
            icon: 'Calculator',
          },
          {
            label: 'Tempo',
            detail: '40 minutos — já em minutos, pronto para a fórmula.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Usar só 10 mL ou só 190 mL — cai em 5 ou 95 gts/min.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão CETREDE neste tema',
            detail: 'Diluição + infusão: some mL, depois (V×20)÷min.',
            icon: 'Target',
          },
        ],
        footer_rule: 'Volume total = ampola + diluente | gts/min = (200×20)÷40',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: ampola diluída em SF com tempo em minutos — resposta em gts/min.',
          'Somar volumes: 10 mL (KCl) + 190 mL (SF) = 200 mL totais.',
          'Fixar fator macrogotas: 1 mL = 20 gotas.',
          'Aplicar fórmula: gts/min = (200 × 20) ÷ 40 = 4.000 ÷ 40 = 100.',
          'Eliminar A (98): arredondamento ou volume ~196 mL na conta.',
          'Eliminar C (10) e D (20): usa só ampola (10 mL) ou metade do volume.',
          'Eliminar E (200): multiplica em vez de dividir ou ignora o tempo.',
          'Localizar alternativa B = 100 gotas por minuto.',
          'Marcar B.',
          'Fixação: toda diluição exige somar ampola + diluente antes do gotejamento.',
        ],
        footer_rule: 'Roteiro: 200 mL → (×20)÷40 → 100 gts/min → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — KCl diluído gts/min',
        meta: slideMeta,
        content: '(200 × 20) ÷ 40',
        rows: [
          { label: 'Volume total', value: '10 + 190 = 200 mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator', value: '20 gotas/mL (macrogotas)', badge: 'ok' },
          { label: 'Tempo', value: '40 minutos', badge: 'info' },
          { label: 'Fórmula', value: 'gts/min = (V × 20) ÷ min', badge: 'hot' },
          { label: 'Conta', value: '(200 × 20) ÷ 40 = 100 gts/min', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 10 gts/min', value: 'usa só 10 mL da ampola', badge: 'warn' },
          { label: 'Erro 98 gts/min', value: 'volume ~196 mL — esquece 4 mL do diluente', badge: 'warn' },
        ],
        footer_rule: 'KCl diluído: some mL, multiplique por 20, divida pelos minutos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — KCl 10 mL + 190 mL SF',
        items: [
          {
            label: 'Letra A — 98 gotas/min',
            detail: 'Volume ~196 mL — quase certo, mas esquece 4 mL na soma.',
            correct: '10 + 190 = 200 mL exatos → 100 gts/min — não 98.',
          },
          {
            label: 'Letra C — 10 gotas/min',
            detail: 'Usa só 10 mL da ampola — ignora os 190 mL de SF.',
            correct: 'Volume total é 200 mL — (200×20)÷40 = 100 gts/min.',
          },
          {
            label: 'Letra D — 20 gotas/min',
            detail: 'Metade do fluxo — usa ~20 mL ou tempo dobrado.',
            correct: 'Com 200 mL em 40 min, o fluxo é 100 gts/min.',
          },
          {
            label: 'Letra E — 200 gotas/min',
            detail: 'Divide mal — resultado igual ao volume em mL sem fator/tempo.',
            correct: 'Fórmula completa: (200×20)÷40 = 100 — não 200.',
          },
          {
            label: 'Em outra banca — KCl concentrado',
            detail: 'Diluição é obrigatória — nunca infundir ampola pura.',
            correct: 'Some ampola + diluente; velocidade segue volume total diluído.',
          },
        ],
        footer_rule: 'Diluição: ampola + SF = volume total para gts/min',
      },
    ],
  },

  'cetrede-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056318806-1': {
    family: 'calc',
    guideline: 'KCl diluído — volume total 200 mL, (V×20)÷40 min = 100 gts/min (card espelho)',
    roi_error: 'esquecer_diluente_ou_usar_só_ampola',
    exam_vs_current: 'conta idêntica ao card -7 — 10 mL + 190 mL SF, 40 min → 100 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'KCl diluído — mapa do gotejamento',
        meta: slideMeta,
        items: [
          {
            label: 'Cloreto de potássio',
            detail: 'Ampola 10 mL — nunca infundir sem diluir em SF.',
            icon: 'FlaskConical',
          },
          {
            label: 'Solução fisiológica',
            detail: '190 mL de SF 0,9% — diluente que completa o volume.',
            icon: 'Droplets',
          },
          {
            label: 'Soma obrigatória',
            detail: '200 mL totais — base da fórmula de gotejamento.',
            icon: 'Calculator',
          },
          {
            label: 'Macrogotas',
            detail: 'Fator 20 — padrão quando equipo não é microgotas.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Calcular com 10 mL ou 190 mL isolados — fluxo 10 ou 95 gts/min.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão CETREDE neste tema',
            detail: 'Mesmo enunciado do card -7: diluição + tempo em minutos.',
            icon: 'Target',
          },
        ],
        footer_rule: '200 mL em 40 min com fator 20 → 100 gts/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: KCl diluído em SF — infusão em minutos, resposta gts/min.',
          'Somar: 10 mL + 190 mL = 200 mL de solução final.',
          'Converter para gotas totais: 200 × 20 = 4.000 gotas no equipo.',
          'Distribuir no tempo: 4.000 gotas ÷ 40 min = 100 gts/min.',
          'Eliminar A (98): volume ligeiramente subestimado na soma.',
          'Eliminar C (10): conta só a ampola de 10 mL.',
          'Eliminar D (20): metade do fluxo — volume ou tempo errado.',
          'Eliminar E (200): confunde mL com gts/min sem aplicar fórmula.',
          'Localizar alternativa B = 100 gotas por minuto.',
          'Marcar B.',
          'Fixação: diluição de KCl sempre soma ampola + diluente antes de calcular fluxo.',
        ],
        footer_rule: 'Roteiro: 10+190=200 mL → (×20)÷40 → 100 → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — infusão KCl diluído',
        meta: slideMeta,
        content: 'ampola + SF · gts/min',
        rows: [
          { label: 'Volume ampola', value: '10 mL KCl', badge: 'info' },
          { label: 'Volume diluente', value: '190 mL SF 0,9%', badge: 'info' },
          { label: 'Volume total', value: '200 mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Gotejamento', value: '(200 × 20) ÷ 40 = 100 gts/min', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 10 gts/min', value: 'só ampola — ignora 190 mL de SF', badge: 'warn' },
          { label: 'Erro 20 gts/min', value: 'metade do fluxo correto', badge: 'warn' },
          { label: 'Segurança KCl', value: 'diluir antes de infundir — nunca bolus', badge: 'ok' },
        ],
        footer_rule: 'KCl: diluir → somar mL → (V×20)÷minutos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — KCl DILUÍDO (CARD ESPELHO)',
        items: [
          {
            label: 'Letra A — 98 gotas/min',
            detail: 'Soma 196 mL em vez de 200 — erro de 4 mL no diluente.',
            correct: '10 + 190 = 200 mL → 100 gts/min — não 98.',
          },
          {
            label: 'Letra C — 10 gotas/min',
            detail: 'Fluxo de 10 mL puros — ignora diluição obrigatória.',
            correct: 'Volume infundido é 200 mL diluídos → 100 gts/min.',
          },
          {
            label: 'Letra D — 20 gotas/min',
            detail: 'Usa 40 mL efetivos ou 80 min de tempo na fórmula.',
            correct: '(200×20)÷40 = 100 gts/min exatos.',
          },
          {
            label: 'Letra E — 200 gotas/min',
            detail: 'Resultado igual ao volume em mL — pula fator e tempo.',
            correct: '200 mL ≠ 200 gts/min — aplique (V×20)÷min.',
          },
          {
            label: 'Em outra banca — microgotas',
            detail: 'Se equipo for microgotas, troque fator 20 por 60.',
            correct: 'Identifique o equipo: macro 20 | micro 60 gotas/mL.',
          },
        ],
        footer_rule: 'Infusão diluída: volume total = ampola + diluente',
      },
    ],
  },

  'cogeps-unioeste-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056301382-2': {
    family: 'calc',
    guideline: 'SG 500 mL em 8 h — microgotas (V×60)÷minutos ≈ 63 gts/min',
    roi_error: 'usar_fator_20_em_microgotas',
    exam_vs_current: 'conta da prova — 500 mL em 8 h, microgotas ≈ 63/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SG 5% — microgotas por minuto',
        meta: slideMeta,
        items: [
          {
            label: 'Solução prescrita',
            detail: 'Soro glicosado 5% — 500 mL para infundir.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo',
            detail: '8 horas → 8 × 60 = 480 minutos.',
            icon: 'Clock',
          },
          {
            label: 'Equipo microgotas',
            detail: 'Enunciado pede microgotas — fator 60 (1 mL = 60 microgotas).',
            icon: 'Gauge',
          },
          {
            label: 'Fórmula',
            detail: 'gts/min = (volume × 60) ÷ tempo em minutos.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Usar fator 20 (macrogotas) → ~21 gts/min — não é o pedido.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão COGEPS neste tema',
            detail: 'Microgotas explícitas: fator 60, arredondar ≈63.',
            icon: 'Target',
          },
        ],
        footer_rule: 'Microgotas: (500 × 60) ÷ 480 ≈ 63 gts/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: volume + tempo em horas + resposta em microgotas/min.',
          'Converter tempo: 8 h × 60 = 480 minutos.',
          'Fixar fator microgotas: 1 mL = 60 microgotas (não 20).',
          'Aplicar fórmula: gts/min = (500 × 60) ÷ 480 = 30.000 ÷ 480 = 62,5.',
          'Arredondar: 62,5 → alternativa mais próxima E = 63 microgotas/min.',
          'Eliminar A (28): usa fator 20 ou tempo superestimado (~1070 min).',
          'Eliminar B (167): divide 500 por 3 ou ignora conversão horas→minutos.',
          'Eliminar C (84) e D (21): fator 20 (macrogotas) ou tempo errado.',
          'Localizar alternativa E = 63 microgotas por minuto.',
          'Marcar E.',
          'Fixação: leia “microgotas” no enunciado — fator 60, não 20.',
        ],
        footer_rule: 'Roteiro: 8h→480min → (500×60)/480≈63 → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — microgotas SG',
        meta: slideMeta,
        content: '60 · 480 · 63',
        rows: [
          { label: 'Volume', value: '500 mL SG 5%', badge: 'ok' },
          { label: 'Tempo', value: '8 h = 480 min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator microgotas', value: '60 microgotas/mL', badge: 'hot' },
          { label: 'Fórmula', value: 'gts/min = (V × 60) ÷ min', badge: 'ok' },
          { label: 'Conta', value: '(500 × 60) ÷ 480 = 62,5 ≈ 63', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 21 gts/min', value: 'fator 20 (macrogotas) em vez de 60', badge: 'warn' },
          { label: 'Erro 167 gts/min', value: 'divide volume por horas sem ×60 nem fator', badge: 'warn' },
        ],
        footer_rule: 'Microgotas: fator 60 — macrogotas usa fator 20',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SG 500 mL / 8 h MICROGOTAS',
        items: [
          {
            label: 'Letra A — 28 microgotas/min',
            detail: 'Tempo superestimado ou fator errado — fluxo muito baixo.',
            correct: '(500×60)÷480 = 62,5 ≈ 63 — não 28.',
          },
          {
            label: 'Letra B — 167 microgotas/min',
            detail: 'Divide 500 por 3 ou ignora os 480 minutos.',
            correct: 'Fórmula completa com fator 60 rende ≈63 gts/min.',
          },
          {
            label: 'Letra C — 84 microgotas/min',
            detail: 'Metade entre macro e micro — fator ou tempo híbrido errado.',
            correct: 'Com fator 60 e 480 min, o fluxo é 62,5 ≈ 63.',
          },
          {
            label: 'Letra D — 21 microgotas/min',
            detail: 'Usa macrogotas (fator 20): (500×20)÷480 ≈ 21 — equipo errado.',
            correct: 'Enunciado pede microgotas — fator 60 → ≈63.',
          },
          {
            label: 'Em outra banca — macrogotas',
            detail: 'Se não disser microgotas, use fator 20 por padrão BR.',
            correct: 'Leia o equipo: microgota = 60 | macrogota = 20 por mL.',
          },
        ],
        footer_rule: 'Microgotas explícitas → fator 60, nunca 20',
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
    console.log(`[handcraft:calculo-g02] OK ${slug}`);
  }
  console.log(`[handcraft:calculo-g02] total=${ok}`);
}

main();
