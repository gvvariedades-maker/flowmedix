#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — calculo-de-administracao-de-medicamentos-e-infusoes-g08 (8 slugs).
 *
 *   npx tsx scripts/handcraft-calculo-de-administracao-de-medicamentos-e-infusoes-g08.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'calculo-de-administracao-de-medicamentos-e-infusoes-g08';
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
  'idecan-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1780066909125-8': {
    family: 'calc',
    guideline: 'Mebendazol 5 mL VO — equivalência doméstica colher de chá ≈ 5 mL',
    roi_error: 'confundir_colher_cha_com_sopa',
    exam_vs_current: 'conta da prova — 5 mL sem copinho → 1 colher de chá',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mebendazol 5 mL — medida doméstica',
        meta: slideMeta,
        items: [
          {
            label: 'Prescrição do médico',
            detail: '5 mL de suspensão de mebendazol via oral — volume-alvo da orientação.',
            icon: 'Pill',
          },
          {
            label: 'Sem copinho ou seringa',
            detail: 'Família não dispõe de copo medidor nem seringa graduada em casa.',
            icon: 'Home',
          },
          {
            label: 'Colher de chá',
            detail: 'Referência doméstica ≈ 5 mL — equivalência aceita em orientação de enfermagem.',
            icon: 'Utensils',
          },
          {
            label: 'Colher de sopa',
            detail: '≈ 15 mL — volume triplo; superestima a dose em 3×.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Trocar colher de chá por sopa ou dobrar a medida (2 colheres de chá = 10 mL).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão IDECAN neste tema',
            detail: 'Visita domiciliar: equivalências de utensílios quando falta material graduado.',
            icon: 'Target',
          },
        ],
        footer_rule: '5 mL ≈ 1 colher de chá | 1 colher de sopa ≈ 15 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: prescrição em mL sem copinho — orientar medida doméstica equivalente.',
          'Fixar volume-alvo: 5 mL de suspensão de mebendazol.',
          'Recuperar equivalência: 1 colher de chá ≈ 5 mL.',
          'Eliminar B (1 colher de sopa): ≈ 15 mL — dose triplicada.',
          'Eliminar C (½ colher de sopa): ≈ 7,5 mL — ainda acima dos 5 mL prescritos.',
          'Eliminar D (2 colheres de chá): ≈ 10 mL — dobra a dose.',
          'Localizar alternativa A = 1 colher de chá.',
          'Marcar A.',
          'Fixação: colher de chá ≈ 5 mL | colher de sopa ≈ 15 mL — memorize a proporção.',
        ],
        footer_rule: 'Roteiro: 5 mL → 1 colher de chá → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — equivalências domésticas',
        meta: slideMeta,
        content: '5 mL ≈ 1 colher de chá',
        rows: [
          { label: 'Prescrito', value: '5 mL de mebendazol', badge: 'hot', emphasis: 'highlight' },
          { label: 'Colher de chá', value: '≈ 5 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Colher de sopa', value: '≈ 15 mL (3× a dose)', badge: 'warn' },
          { label: '½ colher de sopa', value: '≈ 7,5 mL', badge: 'warn' },
          { label: '2 colheres de chá', value: '≈ 10 mL (2× a dose)', badge: 'warn' },
          { label: 'Material ideal', value: 'copinho ou seringa graduada — mais preciso', badge: 'info' },
          { label: 'Contexto', value: 'orientação domiciliar quando falta material', badge: 'ok' },
        ],
        footer_rule: '5 mL = 1 colher de chá | 15 mL = 1 colher de sopa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MEBENDAZOL 5 mL SEM COPINHO',
        items: [
          {
            label: 'Letra B — 1 colher de sopa',
            detail: 'Volume ≈ 15 mL — triplica a dose prescrita de 5 mL.',
            correct: '5 mL equivalem a 1 colher de chá — não 1 colher de sopa.',
          },
          {
            label: 'Letra C — ½ colher de sopa',
            detail: 'Volume ≈ 7,5 mL — 50% acima dos 5 mL prescritos.',
            correct: 'Meia colher de sopa ainda supera 5 mL — use colher de chá.',
          },
          {
            label: 'Letra D — 2 colheres de chá',
            detail: 'Volume ≈ 10 mL — dobra a dose de 5 mL.',
            correct: 'Uma colher de chá (≈5 mL) atende a prescrição — não duas.',
          },
          {
            label: 'Em outra banca — seringa graduada',
            detail: 'Com seringa de 5 mL, a medida é exata — sem equivalência doméstica.',
            correct: 'Sem material graduado, 1 colher de chá ≈ 5 mL é a orientação padrão.',
          },
        ],
        footer_rule: 'Chá ≈ 5 mL | Sopa ≈ 15 mL — não inverta',
      },
    ],
  },

  'idecan-geral-calculo-de-administracao-de-medicamentos-e-infusoes-1776056309743-8': {
    family: 'calc',
    guideline: 'Infusão 2.000 mL Ringer em 8 h — macrogotas (V×20)÷480 min ≈83',
    roi_error: 'tempo_em_horas_sem_converter_minutos',
    exam_vs_current: 'conta da prova — 2.000 mL Ringer 8 h, macrogotas ≈83 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: '2.000 mL Ringer — 8 horas',
        meta: slideMeta,
        items: [
          {
            label: 'Volume prescrito',
            detail: '2.000 mL de Ringer Lactato — numerador da fórmula de gotejamento.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo em horas',
            detail: '8 horas → converter em 480 minutos antes de dividir.',
            icon: 'Clock',
          },
          {
            label: 'Equipo macrogotas',
            detail: 'Fator 20 — 1 mL = 20 gotas; padrão quando não especifica microgotas.',
            icon: 'Gauge',
          },
          {
            label: 'Fórmula canônica',
            detail: 'gts/min = (volume × 20) ÷ tempo em minutos.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Dividir por 8 (horas) em vez de 480 (minutos) — reduz o fluxo em 60×.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão IDECAN neste tema',
            detail: 'Grande volume + tempo em horas: converter h→min, arredondar para alternativa mais próxima.',
            icon: 'Target',
          },
        ],
        footer_rule: '8 h = 480 min | gts/min = (2.000 × 20) ÷ 480 ≈ 83',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 2.000 mL de Ringer Lactato para correr em 8 horas.',
          'Converter tempo: 8 h × 60 = 480 minutos.',
          'Aplicar fórmula: gts/min = (2.000 × 20) ÷ 480.',
          'Calcular: 40.000 ÷ 480 = 83,33 gotas por minuto.',
          'Arredondar para alternativa mais próxima: C = 83 gotas por minuto.',
          'Eliminar A (93): tempo ~427 min ou volume superestimado na conta.',
          'Eliminar B (94): fluxo ligeiramente acima — divisor ~426 min.',
          'Eliminar D (84): tempo ~476 min ou arredondamento para baixo sem base.',
          'Localizar alternativa C = 83 gotas por minuto.',
          'Marcar C.',
          'Fixação: horas → minutos (×60) antes de (V×20)÷tempo.',
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
          { label: 'Conta', value: '(2.000 × 20) ÷ 480 = 83,33 ≈ 83', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 93 gts/min', value: 'tempo ~427 min — subestima duração', badge: 'warn' },
          { label: 'Comparar', value: '1.000 mL/8 h ≈ 42 | 2.000 mL/8 h ≈ 83 (dobro)', badge: 'info' },
        ],
        footer_rule: 'Macrogotas: (mL × 20) ÷ minutos, arredonde',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 2.000 mL RINGER / 8 HORAS',
        items: [
          {
            label: 'Letra A — 93 gotas/min',
            detail: 'Fluxo acima do esperado — tempo efetivo ~427 min em vez de 480.',
            correct: '(2.000×20)÷480 ≈ 83 gts/min — não 93.',
          },
          {
            label: 'Letra B — 94 gotas/min',
            detail: 'Um gota acima de A — divisor ainda menor que 480 min.',
            correct: 'Com 480 min e fator 20, o fluxo aproxima 83 — não 94.',
          },
          {
            label: 'Letra D — 84 gotas/min',
            detail: 'Arredondamento para baixo — ignora 83,33 e sobe para 84 sem critério.',
            correct: '83,33 arredonda para 83 — alternativa mais próxima na prova.',
          },
          {
            label: 'Em outra banca — Ringer vs SF',
            detail: 'O tipo de soro não altera gts/min — só volume e tempo.',
            correct: 'Ringer, SG ou SF: mesma fórmula (V×20)÷min.',
          },
        ],
        footer_rule: 'Horas × 60 = minutos — depois (V × 20) ÷ min',
      },
    ],
  },

  'idib-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1778934863952-5': {
    family: 'calc',
    guideline: 'Diclofenaco 60 mg — ampola 25 mg/mL → 60÷25 = 2,4 mL',
    roi_error: 'multiplicar_em_vez_de_dividir_mg_por_concentracao',
    exam_vs_current: 'conta da prova — 60 mg, ampola 25 mg/mL → 2,4 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Diclofenaco — mg para mL',
        meta: slideMeta,
        items: [
          {
            label: 'Dose prescrita',
            detail: '60 mg de diclofenaco de sódio — alvo da regra de três.',
            icon: 'Syringe',
          },
          {
            label: 'Ampola disponível',
            detail: '3 mL com 25 mg/mL — concentração fixa no estoque da unidade.',
            icon: 'FlaskConical',
          },
          {
            label: 'Regra de três',
            detail: '60 mg ── X mL | 25 mg ── 1 mL → X = 2,4 mL.',
            icon: 'Calculator',
          },
          {
            label: 'Atalho direto',
            detail: '60 mg ÷ 25 mg/mL = 2,4 mL — dose ÷ concentração.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Multiplicar 60 × 25 ou dividir por 3 mL (volume da ampola) em vez de mg/mL.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão IDIB neste tema',
            detail: 'Anti-inflamatório EV/IM: regra de três mg com apresentação mg/mL.',
            icon: 'Target',
          },
        ],
        footer_rule: '60 mg ÷ 25 mg/mL = 2,4 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: dose em mg com ampolas mg/mL — resposta em mL.',
          'Fixar dados: prescritos 60 mg | ampolas de 3 mL com 25 mg/mL.',
          'Montar regra de três: 60 mg ── X mL | 25 mg ── 1 mL.',
          'Calcular: X = 60 ÷ 25 = 2,4 mL.',
          'Eliminar A (2,8 mL): superestima — equivale a 70 mg.',
          'Eliminar C (1,5 mL): subdose — 1,5 × 25 = 37,5 mg.',
          'Eliminar D (2,0 mL): 50 mg — 10 mg a menos que o prescrito.',
          'Localizar alternativa B = 2,4 mL.',
          'Marcar B.',
          'Fixação: mg prescritos ÷ mg/mL = volume em mL.',
        ],
        footer_rule: 'Roteiro: 60 ÷ 25 = 2,4 mL → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — diclofenaco 60 mg',
        meta: slideMeta,
        content: '60 mg ÷ 25 mg/mL',
        rows: [
          { label: 'Prescrito', value: '60 mg', badge: 'hot', emphasis: 'highlight' },
          { label: 'Apresentação', value: '25 mg/mL (ampola 3 mL)', badge: 'ok' },
          { label: 'Regra de três', value: '60 mg ── X mL | 25 mg ── 1 mL', badge: 'hot' },
          { label: 'Volume', value: '60 ÷ 25 = 2,4 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 2,8 mL', value: '70 mg — 10 mg acima do prescrito', badge: 'warn' },
          { label: 'Erro 1,5 mL', value: '37,5 mg — subdose de 22,5 mg', badge: 'warn' },
          { label: 'Erro 2,0 mL', value: '50 mg — faltam 10 mg', badge: 'warn' },
        ],
        footer_rule: 'mg prescritos ÷ mg/mL = mL na seringa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DICLOFENACO 60 mg',
        items: [
          {
            label: 'Letra A — 2,8 mL',
            detail: 'Superestima — 2,8 × 25 = 70 mg, 10 mg acima do prescrito.',
            correct: '60 mg exigem 2,4 mL na concentração 25 mg/mL.',
          },
          {
            label: 'Letra C — 1,5 mL',
            detail: 'Subdose — 1,5 × 25 = 37,5 mg, faltam 22,5 mg.',
            correct: '60 mg ÷ 25 mg/mL = 2,4 mL — não 1,5 mL.',
          },
          {
            label: 'Letra D — 2,0 mL',
            detail: '50 mg — 10 mg a menos; arredonda para baixo sem base.',
            correct: '2,4 mL entrega exatamente 60 mg na concentração 25 mg/mL.',
          },
          {
            label: 'Em outra banca — ampola 3 mL',
            detail: 'O volume total da ampola (3 mL) não é a resposta — calcule pela dose.',
            correct: 'Resposta = mg prescritos ÷ mg/mL, não o tamanho da ampola.',
          },
        ],
        footer_rule: 'Dose ÷ concentração = mL — ignore volume total da ampola',
      },
    ],
  },

  'imparh-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056274291-1': {
    family: 'calc',
    guideline: 'Decadron 12 mg EV — frasco 4 mg/mL 2,5 mL → 3 mL + 2 frascos',
    roi_error: 'calcular_so_volume_ou_so_frascos',
    exam_vs_current: 'conta da prova — 12 mg, 4 mg/mL 2,5 mL → 3 mL / 2 frascos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Decadron — volume e frascos',
        meta: slideMeta,
        items: [
          {
            label: 'Dose prescrita',
            detail: '12 mg de Decadron (dexametasona) EV — alvo em miligramas.',
            icon: 'Syringe',
          },
          {
            label: 'Frasco disponível',
            detail: '4 mg/mL em frasco de 2,5 mL — cada frasco contém 10 mg.',
            icon: 'FlaskConical',
          },
          {
            label: 'Volume necessário',
            detail: '12 mg ÷ 4 mg/mL = 3 mL — volume total a aspirar.',
            icon: 'Droplets',
          },
          {
            label: 'Quantidade de frascos',
            detail: '1 frasco = 10 mg (2,5 mL) — para 12 mg, abrir 2 frascos.',
            icon: 'Package',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Responder 3 mL/1 frasco (frasco só tem 10 mg) ou 4 mL/1 frasco (superestima).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão IMPARH neste tema',
            detail: 'Resposta dupla: volume em mL E número de frascos a utilizar.',
            icon: 'Target',
          },
        ],
        footer_rule: '12 mg = 3 mL | 1 frasco = 10 mg → precisa de 2 frascos',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: dose em mg — resposta pede volume (mL) E quantidade de frascos.',
          'Calcular volume: 12 mg ÷ 4 mg/mL = 3 mL.',
          'Calcular mg por frasco: 4 mg/mL × 2,5 mL = 10 mg por frasco.',
          'Conferir frascos: 12 mg > 10 mg de 1 frasco → abrir 2 frascos.',
          'Eliminar A (3 mL/1 frasco): 1 frasco só rende 10 mg — faltam 2 mg.',
          'Eliminar C (4 mL/1 frasco): 4 mL = 16 mg — superestima e excede 1 frasco.',
          'Eliminar D (4 mL/4 frascos): volume e frascos incoerentes com a prescrição.',
          'Localizar alternativa B = 3 mL / 2 frascos.',
          'Marcar B.',
          'Fixação: calcule mL (dose÷concentração) e frascos (dose÷mg por frasco).',
        ],
        footer_rule: 'Roteiro: 12÷4 = 3 mL | 12 mg > 10 mg/frasco → 2 frascos → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Decadron 12 mg',
        meta: slideMeta,
        content: '3 mL + 2 frascos',
        rows: [
          { label: 'Prescrito', value: '12 mg EV', badge: 'hot', emphasis: 'highlight' },
          { label: 'Concentração', value: '4 mg/mL', badge: 'ok' },
          { label: 'Volume', value: '12 ÷ 4 = 3 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Mg por frasco', value: '4 × 2,5 = 10 mg', badge: 'info' },
          { label: 'Frascos', value: '12 mg > 10 mg → 2 frascos', badge: 'hot' },
          { label: 'Erro 3 mL/1 frasco', value: '1 frasco = 10 mg — subdose de 2 mg', badge: 'warn' },
          { label: 'Erro 4 mL/1 frasco', value: '16 mg em 1 frasco de 2,5 mL — impossível', badge: 'warn' },
        ],
        footer_rule: 'Volume = mg ÷ mg/mL | Frascos = teto(mg ÷ mg/frasco)',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DECADRON 12 mg / 4 mg/mL',
        items: [
          {
            label: 'Letra A — 3 mL / 1 frasco',
            detail: '1 frasco rende só 10 mg (2,5 mL) — faltam 2 mg para 12 mg.',
            correct: '12 mg exigem 3 mL e 2 frascos — 1 frasco não basta.',
          },
          {
            label: 'Letra C — 4 mL / 1 frasco',
            detail: '4 mL = 16 mg — superestima; 1 frasco só tem 2,5 mL.',
            correct: 'Volume correto é 3 mL (12 mg) com 2 frascos.',
          },
          {
            label: 'Letra D — 4 mL / 4 frascos',
            detail: '4 mL e 4 frascos — escala incoerente com 12 mg prescritos.',
            correct: '3 mL de 4 mg/mL = 12 mg — 2 frascos suficientes.',
          },
          {
            label: 'Em outra banca — só volume',
            detail: 'Algumas provas pedem só mL — aqui pede mL E frascos.',
            correct: 'Leia o comando: volume + quantidade de frascos a utilizar.',
          },
        ],
        footer_rule: 'Confira mg por frasco antes de contar quantos abrir',
      },
    ],
  },

  'imparh-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056274291-2': {
    family: 'calc',
    guideline: 'SG 1.000 mL 5% de 6 em 6 h — macrogotas (V×20)÷360 min ≈55',
    roi_error: 'confundir_intervalo_posologico_com_tempo_infusao',
    exam_vs_current: 'conta da prova — 1.000 mL SG 5% de 6 em 6 h ≈55 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SG 1.000 mL — de 6 em 6 h',
        meta: slideMeta,
        items: [
          {
            label: 'Volume prescrito',
            detail: '1.000 mL de soro glicosado 5% — numerador da fórmula.',
            icon: 'Droplets',
          },
          {
            label: 'De 6 em 6 horas',
            detail: 'Infusão corre em 6 horas — 360 minutos até a próxima dose.',
            icon: 'Clock',
          },
          {
            label: 'Equipo macrogotas',
            detail: 'Fator 20 — 1 mL = 20 gotas; padrão em provas IMPARH.',
            icon: 'Gauge',
          },
          {
            label: 'Fórmula',
            detail: 'gts/min = (1.000 × 20) ÷ 360 = 55,56 ≈ 55.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Usar 24 h (1.440 min) ou 12 h (720 min) em vez de 6 h — reduz fluxo.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão IMPARH neste tema',
            detail: '“De X em X horas” = tempo de infusão entre doses, não intervalo do relógio.',
            icon: 'Target',
          },
        ],
        footer_rule: '6 h = 360 min | (1.000×20)/360 ≈ 55 gts/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 1.000 mL de SG 5% “de 6 em 6 horas” — gts/min.',
          'Interpretar tempo: de 6 em 6 h = infusão em 6 h = 360 minutos.',
          'Aplicar fórmula: gts/min = (1.000 × 20) ÷ 360.',
          'Calcular: 20.000 ÷ 360 = 55,56 gotas por minuto.',
          'Arredondar: C = 55 gotas por minuto.',
          'Eliminar A (16 gts/min): tempo ~1.250 min — superestima duração.',
          'Eliminar B (27 gts/min): tempo ~740 min — quase o dobro de 6 h.',
          'Eliminar D (166 gts/min): tempo ~120 min (2 h) — subestima tempo.',
          'Localizar alternativa C = 55 gotas por minuto.',
          'Marcar C.',
          'Fixação: “de X em X h” na prescrição EV = tempo de infusão em horas.',
        ],
        footer_rule: 'Roteiro: 6 h → 360 min → (1.000×20)/360 ≈ 55 → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — SG 1.000 mL / 6 h',
        meta: slideMeta,
        content: '(1.000 × 20) ÷ 360',
        rows: [
          { label: 'Volume', value: '1.000 mL SG 5%', badge: 'ok' },
          { label: 'Tempo', value: '6 h = 360 min (de 6 em 6 h)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator', value: '20 gotas/mL', badge: 'ok' },
          { label: 'Conta', value: '(1.000×20)÷360 = 55,56 ≈ 55', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 16 gts/min', value: 'tempo ~1.250 min — 4× maior que 6 h', badge: 'warn' },
          { label: 'Erro 27 gts/min', value: 'tempo ~740 min — quase 12 h', badge: 'warn' },
          { label: 'Erro 166 gts/min', value: 'tempo ~120 min — só 2 h de infusão', badge: 'warn' },
        ],
        footer_rule: 'De 6 em 6 h = infundir em 6 h — depois (V×20)÷min',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SG 1.000 mL DE 6 EM 6 H',
        items: [
          {
            label: 'Letra A — 16 gotas/min',
            detail: 'Fluxo muito baixo — tempo efetivo ~1.250 min (≈21 h).',
            correct: '1.000 mL em 360 min com fator 20 ≈ 55 gts/min — não 16.',
          },
          {
            label: 'Letra B — 27 gotas/min',
            detail: 'Tempo ~740 min — quase o dobro das 6 h prescritas.',
            correct: '6 h = 360 min — usar esse tempo na fórmula padrão.',
          },
          {
            label: 'Letra D — 166 gotas/min',
            detail: 'Fluxo muito alto — tempo ~120 min (2 h) em vez de 6 h.',
            correct: 'De 6 em 6 h significa infusão em 6 h — 360 min.',
          },
          {
            label: 'Em outra banca — SG 5%',
            detail: 'A concentração 5% não altera gts/min — só volume e tempo.',
            correct: 'Gotejamento depende de mL e tempo, não do tipo de soro.',
          },
        ],
        footer_rule: '“De X em X h” = infusão em X horas — converta em minutos',
      },
    ],
  },

  'instituto-aocp-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056265348-3': {
    family: 'calc',
    guideline: 'Dipirona 0,2 mL — frasco 500 mg/mL → 0,2×500 = 100 mg prescritos',
    roi_error: 'dividir_em_vez_de_multiplicar_ml_por_concentracao',
    exam_vs_current: 'conta da prova — 0,2 mL dipirona 500 mg/mL → 100 mg prescritos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dipirona — mL para mg',
        meta: slideMeta,
        items: [
          {
            label: 'Volume prescrito',
            detail: '0,2 mL de dipirona sódica IM — dado de partida em mililitros.',
            icon: 'Syringe',
          },
          {
            label: 'Concentração do frasco',
            detail: '500 mg/mL — cada mL contém 500 miligramas.',
            icon: 'FlaskConical',
          },
          {
            label: 'Pergunta da prova',
            detail: 'Quantos miligramas foram prescritos — inverte o fluxo usual (mg→mL).',
            icon: 'HelpCircle',
          },
          {
            label: 'Cálculo direto',
            detail: '0,2 mL × 500 mg/mL = 100 mg prescritos.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Dividir 0,2 por 500 (0,0004) ou responder 50 mg (metade da concentração).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão AOCP neste tema',
            detail: 'Pediátrico: prova pede mg a partir de mL prescritos — multiplique mL × mg/mL.',
            icon: 'Target',
          },
        ],
        footer_rule: 'mL × mg/mL = mg | 0,2 × 500 = 100 mg',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: lactente 8 kg — prescrição em mL, pergunta pede miligramas prescritos.',
          'Fixar dados: 0,2 mL prescritos | ampola 500 mg/mL (frasco-ampola) | lactente 8 kg.',
          'Aplicar: mg = volume (mL) × concentração (mg/mL).',
          'Calcular: 0,2 × 500 = 100 mg.',
          'Eliminar A (50 mg): metade da conta — usa 0,1 mL ou divide por 2 sem base.',
          'Eliminar C (150 mg): superestima — equivale a 0,3 mL.',
          'Eliminar D (200 mg): 0,4 mL — dobra o volume prescrito.',
          'Eliminar E (250 mg): 0,5 mL — escala sem relação com 0,2 mL.',
          'Localizar alternativa B = 100 mg.',
          'Marcar B.',
          'Fixação: quando a prova pede mg a partir de mL → mL × mg/mL.',
        ],
        footer_rule: 'Roteiro: 0,2 × 500 = 100 mg → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — dipirona mL → mg',
        meta: slideMeta,
        content: '0,2 mL × 500 mg/mL',
        rows: [
          { label: 'Volume prescrito', value: '0,2 mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Concentração', value: '500 mg/mL', badge: 'ok' },
          { label: 'Fórmula', value: 'mg = mL × mg/mL', badge: 'hot' },
          { label: 'Dose em mg', value: '0,2 × 500 = 100 mg', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 50 mg', value: '0,1 mL — metade do volume prescrito', badge: 'warn' },
          { label: 'Erro 200 mg', value: '0,4 mL — dobra o volume', badge: 'warn' },
          { label: 'Inversão', value: 'mg→mL divide | mL→mg multiplica', badge: 'info' },
        ],
        footer_rule: 'mL × mg/mL = mg — inverta o fluxo quando a prova pedir',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DIPIRONA 0,2 mL / 500 mg/mL',
        items: [
          {
            label: 'Letra A — 50 mg',
            detail: 'Metade da dose — usa 0,1 mL em vez de 0,2 mL.',
            correct: '0,2 mL × 500 mg/mL = 100 mg — não 50 mg.',
          },
          {
            label: 'Letra C — 150 mg',
            detail: 'Equivale a 0,3 mL — 50% acima do volume prescrito.',
            correct: '0,2 mL rende exatamente 100 mg na concentração 500 mg/mL.',
          },
          {
            label: 'Letra D — 200 mg',
            detail: '0,4 mL × 500 — dobra o volume de 0,2 mL.',
            correct: 'Multiplique o mL prescrito (0,2) pela concentração (500).',
          },
          {
            label: 'Letra E — 250 mg',
            detail: '0,5 mL — volume sem relação com a prescrição de 0,2 mL.',
            correct: '100 mg é a única resposta coerente com 0,2 mL e 500 mg/mL.',
          },
          {
            label: 'Em outra banca — peso 8 kg',
            detail: 'O peso do lactente contextualiza, mas a conta é mL × mg/mL.',
            correct: 'Foque no volume prescrito (0,2 mL) e na concentração (500 mg/mL).',
          },
        ],
        footer_rule: 'mL × mg/mL = mg — não divida quando a prova pede mg',
      },
    ],
  },

  'instituto-aocp-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056265348-4': {
    family: 'calc',
    guideline: 'Keflex 100 mg VO — suspensão 250 mg/5 mL → 100÷50 = 2 mL',
    roi_error: 'dividir_por_5_sem_calcular_mg_mL',
    exam_vs_current: 'conta da prova — 100 mg Keflex, 250 mg/5 mL → 2 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Keflex — mg para mL VO',
        meta: slideMeta,
        items: [
          {
            label: 'Dose prescrita',
            detail: '100 mg de Keflex (cefalexina) via oral — alvo da regra de três.',
            icon: 'Pill',
          },
          {
            label: 'Suspensão disponível',
            detail: '250 mg em 5 mL — derivar concentração antes da conta.',
            icon: 'FlaskConical',
          },
          {
            label: 'Concentração',
            detail: '250 mg ÷ 5 mL = 50 mg/mL — passo intermediário obrigatório.',
            icon: 'Calculator',
          },
          {
            label: 'Volume necessário',
            detail: '100 mg ÷ 50 mg/mL = 2 mL.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Dividir 100 por 5 (20 mL) ou responder 1 mL (50 mg, metade da dose).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão AOCP neste tema',
            detail: 'Antibiótico VO suspensão: calcule mg/mL, depois dose ÷ concentração.',
            icon: 'Target',
          },
        ],
        footer_rule: '250 mg/5 mL = 50 mg/mL | 100 mg = 2 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: dose em mg com suspensão mg/mL — resposta em mL VO.',
          'Calcular concentração: 250 mg ÷ 5 mL = 50 mg/mL.',
          'Aplicar regra de três: 100 mg ── X mL | 250 mg ── 5 mL.',
          'Resolver: X = (100 × 5) ÷ 250 = 2 mL. Ou: 100 ÷ 50 = 2 mL.',
          'Eliminar A (1 mL): metade da dose — 50 mg, não 100 mg.',
          'Eliminar B (1,5 mL): 75 mg — 25 mg a menos.',
          'Eliminar D (2,5 mL): 125 mg — 25 mg a mais.',
          'Eliminar E (3 mL): 150 mg — dose 50% acima do prescrito.',
          'Localizar alternativa C = 2 mL.',
          'Marcar C.',
          'Fixação: derive mg/mL (250÷5=50) antes de converter a dose.',
        ],
        footer_rule: 'Roteiro: 250/5 = 50 mg/mL → 100 mg = 2 mL → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Keflex 100 mg',
        meta: slideMeta,
        content: '100 mg ÷ 50 mg/mL',
        rows: [
          { label: 'Prescrito', value: '100 mg VO', badge: 'hot', emphasis: 'highlight' },
          { label: 'Apresentação', value: '250 mg em 5 mL', badge: 'ok' },
          { label: 'Concentração', value: '250 ÷ 5 = 50 mg/mL', badge: 'info' },
          { label: 'Volume', value: '100 ÷ 50 = 2 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Regra de três', value: '100 mg ── 2 mL | 250 mg ── 5 mL', badge: 'ok' },
          { label: 'Erro 1 mL', value: '50 mg — metade da dose', badge: 'warn' },
          { label: 'Erro 3 mL', value: '150 mg — 50% acima do prescrito', badge: 'warn' },
        ],
        footer_rule: 'Suspensão: mg/mL = mg totais ÷ mL, depois dose ÷ concentração',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — KEFLEX 100 mg',
        items: [
          {
            label: 'Letra A — 1 mL',
            detail: 'Metade da dose — 1 mL × 50 mg/mL = 50 mg.',
            correct: '100 mg exigem 2 mL na concentração 50 mg/mL.',
          },
          {
            label: 'Letra B — 1,5 mL',
            detail: '75 mg — 25 mg a menos que os 100 mg prescritos.',
            correct: '100 mg ÷ 50 mg/mL = 2 mL — não 1,5 mL.',
          },
          {
            label: 'Letra D — 2,5 mL',
            detail: '125 mg — 25 mg acima do prescrito.',
            correct: 'Regra de três fecha em 2 mL exatos.',
          },
          {
            label: 'Letra E — 3 mL',
            detail: '150 mg — dose 50% maior que a prescrição.',
            correct: '2 mL entrega exatamente 100 mg na suspensão 250 mg/5 mL.',
          },
          {
            label: 'Em outra banca — 100 mg/5 mL',
            detail: 'Se a apresentação mudar, recalcule mg/mL antes da dose.',
            correct: 'Sempre derive concentração da apresentação do frasco.',
          },
        ],
        footer_rule: 'mg prescritos ÷ mg/mL = mL — conferir concentração primeiro',
      },
    ],
  },

  'instituto-aocp-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056265348-5': {
    family: 'calc',
    guideline: 'SG 5% 1.000 mL em 8 h — macrogotas (V×20)÷480 min ≈42',
    roi_error: 'tempo_em_horas_sem_converter_minutos',
    exam_vs_current: 'conta da prova — 1.000 mL SG 5% em 8 h ≈42 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SG 1.000 mL — 8 horas',
        meta: slideMeta,
        items: [
          {
            label: 'Volume prescrito',
            detail: '1.000 mL de soro glicosado 5% — numerador da fórmula.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo em horas',
            detail: '8 horas → converter em 480 minutos antes de dividir.',
            icon: 'Clock',
          },
          {
            label: 'Equipo macrogotas',
            detail: 'Fator 20 — 1 mL = 20 gotas; padrão quando não especifica microgotas.',
            icon: 'Gauge',
          },
          {
            label: 'Fórmula canônica',
            detail: 'gts/min = (volume × 20) ÷ tempo em minutos.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Dividir por 8 (horas) ou usar 125 gts/min (esquece converter minutos).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão AOCP neste tema',
            detail: 'Infusão SG: converter h→min, arredondar “aproximadamente”.',
            icon: 'Target',
          },
        ],
        footer_rule: '8 h = 480 min | gts/min = (1.000 × 20) ÷ 480 ≈ 42',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 1.000 mL de SG 5% para correr em 8 horas.',
          'Converter tempo: 8 h × 60 = 480 minutos.',
          'Aplicar fórmula: gts/min = (1.000 × 20) ÷ 480.',
          'Calcular: 20.000 ÷ 480 = 41,67 gotas por minuto.',
          'Arredondar para alternativa mais próxima: D = 42 gotas por minuto.',
          'Eliminar A (12,5 gts/min): tempo ~1.600 min — superestima duração.',
          'Eliminar B (125 gts/min): divide por 8 h sem converter em minutos.',
          'Eliminar C (30 gts/min): tempo ~667 min (~11 h) em vez de 8 h.',
          'Eliminar E (51 gts/min): tempo ~392 min (~6,5 h) — subestima tempo.',
          'Localizar alternativa D = 42 gotas por minuto.',
          'Marcar D.',
          'Fixação: horas → minutos (×60) antes de (V×20)÷tempo.',
        ],
        footer_rule: 'Roteiro: 8 h → 480 min → (1.000×20)/480 ≈ 42 → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 1.000 mL SG / 8 h',
        meta: slideMeta,
        content: '(1.000 × 20) ÷ 480',
        rows: [
          { label: 'Volume', value: '1.000 mL SG 5%', badge: 'ok' },
          { label: 'Tempo', value: '8 h = 480 min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator', value: '20 gotas/mL (macrogotas)', badge: 'ok' },
          { label: 'Fórmula', value: 'gts/min = (V × 20) ÷ min', badge: 'hot' },
          { label: 'Conta', value: '(1.000 × 20) ÷ 480 = 41,67 ≈ 42', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 125 gts/min', value: '20.000÷8 — divide por horas, não minutos', badge: 'warn' },
          { label: 'Erro 30 gts/min', value: 'tempo ~667 min — quase 11 h', badge: 'warn' },
        ],
        footer_rule: 'Macrogotas: (mL × 20) ÷ minutos, arredonde',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SG 1.000 mL / 8 HORAS',
        items: [
          {
            label: 'Letra A — 12,5 gotas/min',
            detail: 'Fluxo muito baixo — tempo efetivo ~1.600 min (≈27 h).',
            correct: '1.000 mL em 480 min com fator 20 ≈ 42 gts/min — não 12,5.',
          },
          {
            label: 'Letra B — 125 gotas/min',
            detail: 'Divide 20.000 por 8 (horas) em vez de 480 (minutos).',
            correct: '8 h = 480 min — converter antes de dividir.',
          },
          {
            label: 'Letra C — 30 gotas/min',
            detail: 'Tempo ~667 min — quase 11 h em vez de 8 h.',
            correct: 'Com 480 min e fator 20, o fluxo aproxima 42 gts/min.',
          },
          {
            label: 'Letra E — 51 gotas/min',
            detail: 'Tempo ~392 min (~6,5 h) — subestima as 8 h prescritas.',
            correct: '1.000 mL em 8 h com macrogotas rende ~42 gts/min.',
          },
          {
            label: 'Em outra banca — SG 5%',
            detail: 'A concentração 5% não altera gts/min — só volume e tempo.',
            correct: 'Gotejamento depende de mL e tempo, não do tipo de soro.',
          },
        ],
        footer_rule: 'Horas × 60 = minutos — depois (V × 20) ÷ min',
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
    console.log(`[handcraft:calculo-g08] OK ${slug}`);
  }
  console.log(`[handcraft:calculo-g08] total=${ok}`);
}

main();
