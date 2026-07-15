#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — calculo-de-administracao-de-medicamentos-e-infusoes-g01 (8 slugs).
 *
 *   npx tsx scripts/handcraft-calculo-de-administracao-de-medicamentos-e-infusoes-g01.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'calculo-de-administracao-de-medicamentos-e-infusoes-g01';
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
  'amauc-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056265348-8': {
    family: 'calc',
    guideline: 'Dose mg/kg/dia → dividir tomadas → regra de três mg/mL (Gentamicina pediátrica)',
    roi_error: 'esquecer_divisao_tomadas',
    exam_vs_current: 'conta da prova — 7,5 mg/kg, 6 kg, 10 mg/mL, três tomadas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gentamicina pediátrica — mapa da conta',
        meta: slideMeta,
        items: [
          {
            label: 'Dado da prescrição',
            detail: '7,5 mg/kg/dia em três tomadas — dose diária total antes de fracionar.',
            icon: 'FileText',
          },
          {
            label: 'Peso da paciente',
            detail: '6 kg — multiplicador obrigatório em toda dose pediátrica mg/kg.',
            icon: 'Scale',
          },
          {
            label: 'Apresentação disponível',
            detail: '10 mg/mL — converter miligramas finais em mililitros na regra de três.',
            icon: 'FlaskConical',
          },
          {
            label: 'Trilho dose → volume',
            detail: 'mg/kg × peso → ÷ tomadas → regra de três com 10 mg/mL.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Administrar a dose diária inteira em mL sem dividir pelas três tomadas.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão AMAUC neste tema',
            detail: 'Cadeia mg/kg → dose por horário → mL — conferir unidade em cada degrau.',
            icon: 'Target',
          },
        ],
        footer_rule: 'Sempre: dose diária total → ÷ tomadas → converter mg em mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: dose pediátrica mg/kg/dia fracionada em três tomadas.',
          'Calcular dose diária: 7,5 mg/kg × 6 kg = 45 mg/dia.',
          'Dividir pelas tomadas: 45 mg ÷ 3 = 15 mg por horário.',
          'Converter em volume: ampola 10 mg/mL → 15 mg ── X mL | 10 mg ── 1 mL → X = 1,5 mL.',
          'Eliminar A (4,5 mL): equivale à dose diária inteira em mL sem dividir por 3.',
          'Eliminar C (2,5 mL), D (3,2 mL) e E (1,2 mL): erros intermediários de divisão ou regra de três.',
          'Localizar alternativa B = 1,5 mL.',
          'Marcar B.',
          'Fixação: em mg/kg com várias tomadas, nunca pule a divisão antes de converter em mL.',
        ],
        footer_rule: 'Roteiro: mg/kg × peso → ÷ tomadas → regra de três → 1,5 mL',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — dose pediátrica mg/kg',
        meta: slideMeta,
        content: 'mg/kg → dia → tomada → mL',
        rows: [
          { label: 'Dose diária', value: 'mg/kg × peso (kg)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Dose por tomada', value: 'dose diária ÷ nº de tomadas', badge: 'ok' },
          { label: 'Regra de três', value: 'dose (mg) ── mL | apresentação (mg) ── volume ampola', badge: 'ok' },
          { label: 'Gentamicina — diária', value: '7,5 × 6 kg = 45 mg/dia', badge: 'info' },
          { label: 'Gentamicina — por tomada', value: '45 ÷ 3 = 15 mg', badge: 'info' },
          { label: 'Gentamicina — volume', value: '15 mg ÷ 10 mg/mL = 1,5 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 4,5 mL', value: '45 mg ÷ 10 mg/mL sem dividir tomadas', badge: 'warn' },
          { label: 'Conferência', value: 'mg com mg, mL com mL — nunca misturar unidade', badge: 'ok' },
        ],
        footer_rule: 'Três degraus: dose diária → dose da tomada → mililitros',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GENTAMICINA mg/kg',
        items: [
          {
            label: 'Letra A — 4,5 mL',
            detail: 'Volume da dose diária inteira (45 mg) sem fracionar as três tomadas.',
            correct: '45 mg ÷ 10 mg/mL = 4,5 mL é a dose do DIA, não de cada horário.',
          },
          {
            label: 'Letra C — 2,5 mL',
            detail: 'Erro na regra de três ou divisão intermediária da dose por tomada.',
            correct: 'Após 15 mg por tomada, o volume correto é 1,5 mL — não 2,5 mL.',
          },
          {
            label: 'Letra D — 3,2 mL',
            detail: 'Arredondamento ou multiplicação errada entre mg/kg e mL.',
            correct: 'Repita: 7,5 × 6 = 45 → ÷ 3 = 15 mg → 1,5 mL.',
          },
          {
            label: 'Letra E — 1,2 mL',
            detail: 'Subdose por dividir duas vezes ou confundir mg com mL cedo demais.',
            correct: '15 mg em apresentação 10 mg/mL rende 1,5 mL — não 1,2 mL.',
          },
          {
            label: 'Em outra banca — antibiótico EV',
            detail: 'Mesmo trilho vale para qualquer mg/kg/dia com tomadas múltiplas.',
            correct: 'Sempre feche mg totais do horário antes de abrir a regra de três com mg/mL.',
          },
        ],
        footer_rule: 'mg/kg + várias tomadas: dividir ANTES de converter em mL',
      },
    ],
  },

  'amauc-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056274291-3': {
    family: 'calc',
    guideline: 'Infusão macrogotas — volume total × fator 20 ÷ tempo (min)',
    roi_error: 'volume_parcial_ou_fator_errado',
    exam_vs_current: 'conta da prova — 20 mL ampola + 160 mL SF, 40 minutos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sulfato ferroso — infusão em gts/min',
        meta: slideMeta,
        items: [
          {
            label: 'Volume da ampola',
            detail: '20 mL de sulfato ferroso — entra no volume total a infundir.',
            icon: 'FlaskConical',
          },
          {
            label: 'Diluente acrescentado',
            detail: '160 mL de SF 0,9% — somar ao volume da ampola antes da fórmula.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo prescrito',
            detail: '40 minutos — converter horas em minutos se o enunciado vier em horas.',
            icon: 'Clock',
          },
          {
            label: 'Equipo macrogotas',
            detail: 'Fator 20 — 1 mL = 20 gotas; base para gts/min em prova brasileira.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Usar só 20 mL ou só 160 mL — subestima o volume e cai em 30 ou 45 gts/min.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão AMAUC neste tema',
            detail: 'Soma ampola + diluente, depois (V × 20) ÷ minutos.',
            icon: 'Target',
          },
        ],
        footer_rule: 'Volume total = ampola + diluente | gts/min = (V × 20) ÷ min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: infusão IV com tempo em minutos e resposta em gts/min.',
          'Somar volumes: 20 mL (ampola) + 160 mL (SF) = 180 mL totais.',
          'Fixar fator macrogotas: 1 mL = 20 gotas → fator 20.',
          'Aplicar fórmula: gts/min = (180 × 20) ÷ 40 = 3.600 ÷ 40 = 90.',
          'Eliminar A (30): volume subestimado (~60 mL efetivo na conta errada).',
          'Eliminar C (45) e D (60): metade ou dois terços do fluxo correto.',
          'Eliminar E (108): volume superestimado (~216 mL na conta invertida).',
          'Localizar alternativa B = 90 gotas por minuto.',
          'Marcar B.',
          'Fixação: toda infusão começa somando TODOS os mL que vão para o equipo.',
        ],
        footer_rule: 'Roteiro: somar mL → fator 20 → ÷ minutos → 90 gts/min',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — gts/min macrogotas',
        meta: slideMeta,
        content: '(V × 20) ÷ min',
        rows: [
          { label: 'Volume total', value: 'ampola + diluente (mL)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator macrogotas', value: '20 gotas/mL', badge: 'ok' },
          { label: 'Tempo', value: 'sempre em minutos', badge: 'warn' },
          { label: 'Fórmula', value: 'gts/min = (volume × 20) ÷ tempo (min)', badge: 'hot' },
          { label: 'Sulfato ferroso — volume', value: '20 + 160 = 180 mL', badge: 'info' },
          { label: 'Sulfato ferroso — conta', value: '(180 × 20) ÷ 40 = 90 gts/min', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 30 gts/min', value: 'usar ~60 mL em vez de 180 mL', badge: 'warn' },
          { label: 'Erro 45 gts/min', value: 'metade do fluxo — volume ou tempo pela metade', badge: 'warn' },
        ],
        footer_rule: 'Macrogotas: some mL, multiplique por 20, divida pelos minutos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INFUSÃO SULFATO FERROSO',
        items: [
          {
            label: 'Letra A — 30 gotas/min',
            detail: 'Usa volume muito menor que 180 mL — ignora diluente ou ampola.',
            correct: '180 mL totais geram 90 gts/min em 40 min — não 30.',
          },
          {
            label: 'Letra C — 45 gotas/min',
            detail: 'Metade do fluxo correto — erro ao dividir tempo ou volume.',
            correct: '90 ÷ 2 = 45 — conferir se somou 20 + 160 mL antes da fórmula.',
          },
          {
            label: 'Letra D — 60 gotas/min',
            detail: 'Dois terços do gabarito — tempo ou volume incompleto na regra.',
            correct: 'Com 180 mL em 40 min e fator 20, o fluxo é 90 gts/min.',
          },
          {
            label: 'Letra E — 108 gotas/min',
            detail: 'Superestima volume (~216 mL) ou divide o tempo pela metade.',
            correct: '108 = (216 × 20) ÷ 40 — volume quase o dobro do real.',
          },
          {
            label: 'Em outra banca — microgotas',
            detail: 'Se o equipo for microgotas, o fator muda para 60.',
            correct: 'Identifique o equipo antes: macrogota = 20 | microgota = 60.',
          },
        ],
        footer_rule: 'Infusão: volume total em mL é o primeiro dado a fechar',
      },
    ],
  },

  'amauc-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056274291-4': {
    family: 'calc',
    guideline: 'Diluição em cadeia — concentração após mistura → dose no volume aplicado',
    roi_error: 'pular_diluicao_usar_concentracao_original',
    exam_vs_current: 'conta da prova — dexametasona 10 mg/2,5 mL, rediluída, via intramuscular',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dexametasona — diluição em cadeia',
        meta: slideMeta,
        items: [
          {
            label: 'Dexametasona — ampola',
            detail: '10 mg em 2,5 mL — Técnica aspirou 1,2 mL e diluiu em água destilada.',
            icon: 'FlaskConical',
          },
          {
            label: 'Volume aspirado',
            detail: '1,2 mL retirados — carrega 4,8 mg de dexametasona.',
            icon: 'Syringe',
          },
          {
            label: 'Primeira diluição',
            detail: '1,2 mL + 8,8 mL AD = 10 mL com 4,8 mg → 0,48 mg/mL.',
            icon: 'Beaker',
          },
          {
            label: 'Via intramuscular — idosa',
            detail: 'Aplicou 4,5 mL por via intramuscular na paciente idosa — dose em mg.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Multiplicar 4,5 mL pela concentração original (4 mg/mL) sem diluir.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão AMAUC neste tema',
            detail: 'Cada diluição altera mg/mL — recalcular antes da dose aplicada.',
            icon: 'Target',
          },
        ],
        footer_rule: 'Diluiu → nova concentração → dose = mL aplicados × mg/mL final',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: diluição sequencial com dose final em miligramas.',
          'Calcular concentração da ampola: 10 mg ÷ 2,5 mL = 4 mg/mL.',
          'Quantificar fármaco aspirado: 1,2 mL × 4 mg/mL = 4,8 mg.',
          'Após diluir em 8,8 mL: volume total 10 mL → 4,8 mg ÷ 10 = 0,48 mg/mL.',
          'Dose administrada: 4,5 mL × 0,48 mg/mL = 2,16 mg.',
          'Eliminar B (1,75 mg), C (2,03 mg), D (2,85 mg) e E (3,15 mg): pulam diluição ou arredondam errado.',
          'Localizar alternativa A = 2,16 mg.',
          'Marcar A.',
          'Fixação: em diluição em cadeia, a concentração muda a cada passo — nunca reutilize a da ampola.',
        ],
        footer_rule: 'Roteiro: mg/mL ampola → mg aspirados → diluir → mg na dose IM',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — diluição em cadeia',
        meta: slideMeta,
        content: 'mg preservados · mL somados',
        rows: [
          { label: 'Concentração inicial', value: 'mg da ampola ÷ mL da ampola', badge: 'ok' },
          { label: 'Mg no volume aspirado', value: 'mL aspirados × mg/mL inicial', badge: 'info' },
          { label: 'Após diluição', value: 'mg totais ÷ (mL aspirados + diluente)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Dose administrada', value: 'mL aplicados × mg/mL final', badge: 'hot', emphasis: 'success' },
          { label: 'Dexametasona — inicial', value: '10 mg/2,5 mL = 4 mg/mL', badge: 'info' },
          { label: 'Dexametasona — aspirado', value: '1,2 mL → 4,8 mg', badge: 'info' },
          { label: 'Dexametasona — diluída', value: '4,8 mg/10 mL = 0,48 mg/mL', badge: 'ok' },
          { label: 'Dexametasona — dose IM', value: '4,5 × 0,48 = 2,16 mg', badge: 'hot', emphasis: 'success' },
        ],
        footer_rule: 'Mg não desaparecem na diluição — só o volume total aumenta',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEXAMETASONA DILUÍDA',
        items: [
          {
            label: 'Letra B — 1,75 mg',
            detail: 'Erro na concentração intermediária ou arredondamento precoce.',
            correct: 'Com 0,48 mg/mL final, 4,5 mL rendem 2,16 mg — não 1,75 mg.',
          },
          {
            label: 'Letra C — 2,03 mg',
            detail: 'Aproximação incorreta entre 2,0 e 2,16 sem fechar a diluição.',
            correct: '4,8 mg em 10 mL × 4,5 mL = 2,16 mg exatos.',
          },
          {
            label: 'Letra D — 2,85 mg',
            detail: 'Usa concentração da ampola (4 mg/mL) no volume aplicado.',
            correct: '4,5 × 4 = 18 mg seria sem diluir — 2,85 mg ainda ignora os 10 mL finais.',
          },
          {
            label: 'Letra E — 3,15 mg',
            detail: 'Pula a rediluição e superestima mg/mL na seringa.',
            correct: 'Após 8,8 mL de AD, a concentração cai para 0,48 mg/mL.',
          },
          {
            label: 'Em outra banca — rediluição',
            detail: 'Cada “aspirou X e diluiu em Y” exige recalcular mg/mL.',
            correct: 'Fármaco total (mg) ÷ volume final (mL) = concentração para a dose.',
          },
        ],
        footer_rule: 'Diluição: mg fixos, mL crescem — concentração sempre recalculada',
      },
    ],
  },

  'amauc-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056274291-5': {
    family: 'calc',
    guideline: 'Omeprazol — diluição, aspiração parcial e dose no volume administrado',
    roi_error: 'confundir_volume_aspirado_com_dose',
    exam_vs_current: 'conta da prova — ampola omeprazol 20 mg, criança 3 anos, 4 mL aplicados',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Omeprazol — dose após rediluição',
        meta: slideMeta,
        items: [
          {
            label: 'Ampola inicial',
            detail: '20 mg omeprazol em 6 mL AD → 3,33 mg/mL na primeira diluição.',
            icon: 'FlaskConical',
          },
          {
            label: 'Aspirado parcial',
            detail: '2,4 mL retirados — contém 8 mg de omeprazol (2,4 × 20/6).',
            icon: 'Syringe',
          },
          {
            label: 'Segunda diluição',
            detail: '2,4 mL + 7,6 mL = 10 mL finais com 8 mg → 0,8 mg/mL.',
            icon: 'Beaker',
          },
          {
            label: 'Volume aplicado',
            detail: '4 mL na criança — multiplicar pela concentração final.',
            icon: 'Baby',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Responder com 20 mg da ampola ou dose do volume aspirado (8 mg) sem aplicar 4 mL.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão AMAUC neste tema',
            detail: 'Três etapas: diluir → aspirar fração → rediluir → dose no mL administrado.',
            icon: 'Target',
          },
        ],
        footer_rule: 'Dose recebida = mL administrados × mg/mL após última diluição',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: ampola de omeprazol diluída — aspiração parcial e dose em miligramas.',
          'Concentração inicial: 20 mg ÷ 6 mL = 3,33 mg/mL.',
          'Mg no aspirado: 2,4 mL × 3,33 mg/mL = 8 mg de omeprazol.',
          'Após rediluir em 7,6 mL: 8 mg em 10 mL → 0,8 mg/mL.',
          'Dose aplicada: 4 mL × 0,8 mg/mL = 3,2 mg.',
          'Eliminar B (0,8 mg): confunde mg/mL final com dose total administrada.',
          'Eliminar C (1,5 mg), D (2,9 mg) e E (4,0 mg): erros de etapa ou volume errado.',
          'Localizar alternativa A = 3,2 mg.',
          'Marcar A.',
          'Fixação: feche mg/mL após a ÚLTIMA diluição antes de multiplicar pelos mL aplicados.',
        ],
        footer_rule: 'Roteiro: 20 mg/6 mL → 8 mg → 0,8 mg/mL → 4 mL = 3,2 mg',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — omeprazol diluído',
        meta: slideMeta,
        content: 'aspirou · rediluiu · aplicou',
        rows: [
          { label: '1ª diluição', value: '20 mg ÷ 6 mL = 3,33 mg/mL', badge: 'info' },
          { label: 'Mg aspirados', value: '2,4 mL × 3,33 = 8 mg', badge: 'ok' },
          { label: '2ª diluição', value: '8 mg ÷ 10 mL = 0,8 mg/mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Dose administrada', value: '4 mL × 0,8 = 3,2 mg', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 0,8 mg', value: 'confunde concentração (mg/mL) com dose (mg)', badge: 'warn' },
          { label: 'Erro 20 mg', value: 'dose da ampola inteira — não o volume aplicado', badge: 'warn' },
          { label: 'Conferência', value: 'mg administrados = mL dados × mg/mL final', badge: 'ok' },
        ],
        footer_rule: 'Último passo: mL aplicados × concentração final em mg/mL',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — OMEPRAZOL PEDIÁTRICO',
        items: [
          {
            label: 'Letra B — 0,8 mg',
            detail: 'Lê 0,8 mg/mL como se fosse a dose total administrada.',
            correct: '0,8 mg/mL × 4 mL aplicados = 3,2 mg — não 0,8 mg.',
          },
          {
            label: 'Letra C — 1,5 mg',
            detail: 'Subdose por usar fração errada do aspirado ou do volume final.',
            correct: '8 mg em 10 mL, aplicando 4 mL, a dose é 3,2 mg.',
          },
          {
            label: 'Letra D — 2,9 mg',
            detail: 'Erro intermediário — quase 3,2 mg mas pula etapa de rediluição.',
            correct: 'Sem os 7,6 mL de AD, a concentração não cai para 0,8 mg/mL.',
          },
          {
            label: 'Letra E — 4,0 mg',
            detail: 'Metade dos 8 mg aspirados — ignora que só 4 mL foram aplicados.',
            correct: '4 mL de solução 0,8 mg/mL = 3,2 mg, não 4 mg.',
          },
          {
            label: 'Em outra banca — “dose prescrita”',
            detail: 'O comando pode pedir mg administrados, não mg da ampola.',
            correct: 'Sempre multiplique mL efetivamente aplicados pela concentração final.',
          },
        ],
        footer_rule: 'mg/mL ≠ mg administrados — multiplique pelo volume dado',
      },
    ],
  },

  'amauc-geral-calculo-de-administracao-de-medicamentos-e-infusoes-1776056274291-6': {
    family: 'calc',
    guideline: 'Mistura IV — somar volumes + atalho AMAUC V/(h×1,5) para gts/min',
    roi_error: 'nao_somar_aditivos_ou_formula_minutos',
    exam_vs_current: 'prova usa V/(horas×1,5)≈39; fórmula canônica (V×20)/(min)≈19',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mistura IV — volume total e gotejamento',
        meta: slideMeta,
        items: [
          {
            label: 'Soro base',
            detail: '300 mL SG 5% — volume principal da prescrição mista.',
            icon: 'Droplets',
          },
          {
            label: 'Aditivos na bolsa',
            detail: '20 + 10 + 10 + 10 mL (glicose, KCl, NaCl, vit C) — somar ao total.',
            icon: 'FlaskConical',
          },
          {
            label: 'Volume total',
            detail: '350 mL para infundir em 6 horas — dado central da conta.',
            icon: 'Calculator',
          },
          {
            label: 'Tempo em horas',
            detail: '6 horas — esta banca aplica atalho com horas, não só minutos.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Contar só 300 mL ou usar (V×20)/minutos sem o atalho esperado pela prova.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão AMAUC neste tema',
            detail: 'Soma todos os mL acrescidos; gts/min ≈ Volume ÷ (horas × 1,5).',
            icon: 'Target',
          },
        ],
        footer_rule: 'Mistura: some TODOS os mL | AMAUC: gts/min ≈ V ÷ (h × 1,5)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: prescrição mista com vários aditivos e infusão em horas.',
          'Somar volumes: 300 + 20 + 10 + 10 + 10 = 350 mL totais.',
          'Converter tempo: 6 horas prescritas — manter em horas para o atalho da banca.',
          'Aplicar atalho AMAUC: gts/min ≈ 350 ÷ (6 × 1,5) = 350 ÷ 9 ≈ 38,9.',
          'Arredondar para alternativa mais próxima: D = 39 gotas por minuto.',
          'Eliminar A (41), B (35) e C (47): volumes parciais ou fórmula com tempo errado.',
          'Eliminar E (50): superestima fluxo com volume ou divisor menores.',
          'Localizar alternativa D ≈ 39 gotas por minuto.',
          'Marcar D.',
          'Fixação: em misturas IV, some cada mL acrescido antes de qualquer fórmula de gotejamento.',
        ],
        footer_rule: 'Roteiro: 350 mL → ÷ (6×1,5) → ≈39 gts/min → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — mistura e gts/min',
        meta: slideMeta,
        content: '350 mL · 6 h · ≈39 gts',
        rows: [
          { label: 'Volume mistura', value: '300+20+10+10+10 = 350 mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Atalho AMAUC', value: 'gts/min ≈ Volume ÷ (horas × 1,5)', badge: 'hot' },
          { label: 'Conta desta prova', value: '350 ÷ 9 ≈ 38,9 → 39 gts/min', badge: 'hot', emphasis: 'success' },
          { label: 'Fórmula canônica', value: '(350×20)÷360 ≈ 19 gts/min (clínica)', badge: 'info' },
          { label: 'Erro 35 gts/min', value: 'volume ~320 mL ou divisor maior', badge: 'warn' },
          { label: 'Erro 41 gts/min', value: 'volume superestimado ~370 mL', badge: 'warn' },
          { label: 'Conferência', value: 'soma aditivos antes de converter tempo', badge: 'ok' },
        ],
        footer_rule: 'Prova AMAUC: some mL e use V÷(h×1,5) para aproximar gts/min',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MISTURA IV 6 HORAS',
        items: [
          {
            label: 'Letra A — 41 gotas/min',
            detail: 'Volume superestimado (~370 mL) ou divisor menor que 9.',
            correct: 'Com 350 mL e atalho V/(h×1,5), o fluxo aproxima 39 — não 41.',
          },
          {
            label: 'Letra B — 35 gotas/min',
            detail: 'Ignora aditivo de 10 mL (volume ~320 mL) ou arredonda cedo.',
            correct: '350 mL ÷ 9 ≈ 39 gts/min — B superestima o divisor.',
          },
          {
            label: 'Letra C — 47 gotas/min',
            detail: 'Usa só 300 mL com fórmula invertida ou tempo em minutos errado.',
            correct: 'Sem os 50 mL de aditivos, a taxa não fecha em 47.',
          },
          {
            label: 'Letra E — 50 gotas/min',
            detail: 'Fluxo alto — divide por horas sem o fator 1,5 ou volume menor.',
            correct: '350 mL em 6 h pelo atalho AMAUC rende ~39 gts/min.',
          },
          {
            label: 'Em outra banca — fórmula canônica',
            detail: 'Com (V×20)/minutos, 350 mL em 360 min ≈ 19 gts/min.',
            correct: 'Leia o padrão da banca: AMAUC usa atalho V/(h×1,5) neste card.',
          },
        ],
        footer_rule: 'Mistura IV: some aditivos; AMAUC ≈ V÷(horas×1,5)',
      },
    ],
  },

  'avancasp-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056284398-8': {
    family: 'calc',
    guideline: 'Infusão 250 mL em 4 h — (V×20)÷minutos com macrogotas',
    roi_error: 'tempo_em_horas_sem_converter_minutos',
    exam_vs_current: 'conta da prova — 250 mL em 4 horas, gts/min ≈ 21',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Infusão 250 mL — gts/min padrão',
        meta: slideMeta,
        items: [
          {
            label: 'Volume prescrito',
            detail: '250 mL de solução — numerador da fórmula de gotejamento.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo em horas',
            detail: '4 horas → converter em 240 minutos antes de dividir.',
            icon: 'Clock',
          },
          {
            label: 'Fator macrogotas',
            detail: '20 gotas/mL — padrão brasileiro quando o equipo não é microgotas.',
            icon: 'Gauge',
          },
          {
            label: 'Fórmula canônica',
            detail: 'gts/min = (volume × 20) ÷ tempo em minutos.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Dividir por 4 (horas) em vez de 240 (minutos) — dobra ou reduz o fluxo.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão AVANÇASP neste tema',
            detail: 'Infusão simples: volume único, tempo em horas, resposta ≈21 gts/min.',
            icon: 'Target',
          },
        ],
        footer_rule: '4 h = 240 min | gts/min = (250 × 20) ÷ 240 ≈ 21',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: volume único (250 mL) para correr em 4 horas.',
          'Converter tempo: 4 h × 60 = 240 minutos.',
          'Aplicar fórmula macrogotas: gts/min = (250 × 20) ÷ 240.',
          'Calcular: 5.000 ÷ 240 = 20,83 gotas por minuto.',
          'Arredondar para alternativa mais próxima: A = 21 gotas por minuto.',
          'Eliminar B (25), C (30) e D (37): tempo subestimado ou fator errado.',
          'Eliminar E (41): usa atalho V/(h×1,5) = 250/6 ≈ 42 — inadequado aqui.',
          'Localizar alternativa A = 21 gotas por minuto.',
          'Marcar A.',
          'Fixação: horas → minutos (×60) antes de aplicar (V×20)÷tempo.',
        ],
        footer_rule: 'Roteiro: 4 h → 240 min → (250×20)/240 ≈ 21 → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 250 mL em 4 h',
        meta: slideMeta,
        content: '(250 × 20) ÷ 240',
        rows: [
          { label: 'Volume', value: '250 mL', badge: 'ok' },
          { label: 'Tempo', value: '4 h = 240 min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator', value: '20 gotas/mL (macrogotas)', badge: 'ok' },
          { label: 'Fórmula', value: 'gts/min = (V × 20) ÷ min', badge: 'hot' },
          { label: 'Conta', value: '(250 × 20) ÷ 240 = 20,83 ≈ 21', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 41 gts/min', value: 'atalho V/(h×1,5) sem converter minutos', badge: 'warn' },
          { label: 'Arredondamento', value: 'prova pede “aproximado” — 20,83 → 21', badge: 'info' },
        ],
        footer_rule: 'Infusão simples AVANÇASP: (mL × 20) ÷ minutos, arredonde',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 250 mL / 4 HORAS',
        items: [
          {
            label: 'Letra B — 25 gotas/min',
            detail: 'Tempo efetivo menor (~200 min) ou volume reduzido na conta.',
            correct: '(250×20)÷240 ≈ 21 gts/min — não 25.',
          },
          {
            label: 'Letra C — 30 gotas/min',
            detail: 'Divide por 4 horas direto sem converter em minutos.',
            correct: '4 h = 240 min — usar minutos na fórmula padrão.',
          },
          {
            label: 'Letra D — 37 gotas/min',
            detail: 'Fator ou volume inflado — fluxo quase o dobro do correto.',
            correct: '250 mL em 240 min com fator 20 rende ~21 gts/min.',
          },
          {
            label: 'Letra E — 41 gotas/min',
            detail: 'Atalho V/(h×1,5) = 250÷6 ≈ 42 — não é o padrão desta questão.',
            correct: 'AVANÇASP aqui usa (V×20)/minutos → 21 gts/min.',
          },
          {
            label: 'Em outra banca — microgotas',
            detail: 'Se o equipo for microgotas, troque fator 20 por 60.',
            correct: 'Identifique o equipo: macrogota 20 | microgota 60.',
          },
        ],
        footer_rule: 'Horas × 60 = minutos — depois (V × fator) ÷ min',
      },
    ],
  },

  'avancasp-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056292978-0': {
    family: 'calc',
    guideline: 'Concentração após diluição — 1 g em 5 mL = 200 mg/mL',
    roi_error: 'confundir_gramas_com_miligramas',
    exam_vs_current: 'conta da prova — cefalotina 1 g em 5 mL → 200 mg/mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cefalotina — concentração mg/mL',
        meta: slideMeta,
        items: [
          {
            label: 'Princípio ativo',
            detail: '1 g de cefalotina = 1.000 mg — converter gramas antes da divisão.',
            icon: 'Pill',
          },
          {
            label: 'Solvente adicionado',
            detail: '5 mL de diluente — volume final total da solução.',
            icon: 'Droplets',
          },
          {
            label: 'Volume final',
            detail: 'Solução total = 5 mL contendo os 1.000 mg.',
            icon: 'FlaskConical',
          },
          {
            label: 'Concentração pedida',
            detail: 'mg por mL — dividir miligramas totais pelo volume final.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Dividir 1 g por 5 sem converter para mg — resposta em g/mL.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão AVANÇASP neste tema',
            detail: 'Frasco-ampola 1 g + 5 mL → 200 mg/mL — decore a conversão g→mg.',
            icon: 'Target',
          },
        ],
        footer_rule: '1 g = 1.000 mg | concentração = mg totais ÷ mL finais',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: concentração em mg/mL após diluição de frasco-ampola.',
          'Converter massa: 1 g de cefalotina = 1.000 mg.',
          'Fixar volume final: 5 mL de solução após diluição (enunciado).',
          'Calcular concentração: 1.000 mg ÷ 5 mL = 200 mg/mL.',
          'Eliminar A (10 mg): divide 1.000 por 100 — erro de escala.',
          'Eliminar B (50 mg), C (100 mg) e D (150 mg): divisores intermediários sem converter g→mg.',
          'Localizar alternativa E = 200 mg.',
          'Marcar E.',
          'Fixação: todo frasco-ampola em gramas exige ×1.000 antes de obter mg/mL.',
        ],
        footer_rule: 'Roteiro: 1 g → 1.000 mg → ÷ 5 mL → 200 mg/mL → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — concentração pós-diluição',
        meta: slideMeta,
        content: 'g → mg → ÷ mL',
        rows: [
          { label: 'Conversão', value: '1 g = 1.000 mg', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fórmula', value: 'mg/mL = mg totais ÷ mL finais', badge: 'ok' },
          { label: 'Cefalotina — massa', value: '1 g = 1.000 mg', badge: 'info' },
          { label: 'Cefalotina — volume', value: '5 mL de solução final', badge: 'info' },
          { label: 'Cefalotina — concentração', value: '1.000 ÷ 5 = 200 mg/mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 100 mg/mL', value: 'divide 1.000 por 10 em vez de 5', badge: 'warn' },
          { label: 'Erro 10 mg/mL', value: 'esquece conversão g→mg', badge: 'warn' },
        ],
        footer_rule: 'Frasco-ampola: converta g em mg, depois divida pelos mL finais',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CEFALOTINA 1 g / 5 mL',
        items: [
          {
            label: 'Letra A — 10 mg/mL',
            detail: 'Divide 1.000 mg por 100 — escala decimal errada.',
            correct: '1.000 mg ÷ 5 mL = 200 mg/mL — não 10 mg/mL.',
          },
          {
            label: 'Letra B — 50 mg/mL',
            detail: 'Usa divisor 20 ou confunde mg totais com apresentação parcial.',
            correct: 'Com 5 mL finais, a concentração é 200 mg/mL.',
          },
          {
            label: 'Letra C — 100 mg/mL',
            detail: 'Divide 1.000 por 10 — ignora que o volume final é 5 mL.',
            correct: '1.000 mg em 5 mL = 200 mg/mL.',
          },
          {
            label: 'Letra D — 150 mg/mL',
            detail: 'Interpolação incorreta entre 100 e 200 sem base na diluição.',
            correct: 'Diluição total 5 mL com 1 g → 200 mg/mL exatos.',
          },
          {
            label: 'Em outra banca — ampola mg',
            detail: 'Se vier em mg (ex.: 500 mg/2 mL), pule conversão de gramas.',
            correct: 'Sempre alinhe unidade: mg totais ÷ mL finais = mg/mL.',
          },
        ],
        footer_rule: 'g → mg (×1.000) antes de qualquer divisão por mL',
      },
    ],
  },

  'avancasp-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056292978-1': {
    family: 'calc',
    guideline: 'Conversão gotas → mL — 50 gts ÷ 20 gts/mL = 2,5 mL',
    roi_error: 'fator_gotas_errado_30_ou_60',
    exam_vs_current: 'conta da prova — 50 gotas prescritas → 2,5 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gotas → mililitros — analgésico VO',
        meta: slideMeta,
        items: [
          {
            label: 'Prescrição em gotas',
            detail: '50 gotas de analgésico — converter para mL para administrar.',
            icon: 'Droplets',
          },
          {
            label: 'Constante padrão BR',
            detail: '1 mL = 20 gotas (macrogotas) — divisor obrigatório em prova.',
            icon: 'Gauge',
          },
          {
            label: 'Fórmula inversa',
            detail: 'mL = gotas prescritas ÷ 20 — inverso de gts/min.',
            icon: 'ArrowLeftRight',
          },
          {
            label: 'Via de administração',
            detail: 'Contagem em gotas costuma ser VO com conta-gotas — não confundir com infusão.',
            icon: 'Pill',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Usar fator 30 ou 60 (microgotas) em vez de 20 gotas/mL.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão AVANÇASP neste tema',
            detail: 'Prescrição em gotas → dividir por 20 → mL na seringa ou copo.',
            icon: 'Target',
          },
        ],
        footer_rule: 'DECORE: 50 gts ÷ 20 = 2,5 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: prescrição em gotas com resposta em mililitros.',
          'Recuperar constante: 1 mL = 20 gotas (padrão brasileiro macrogotas).',
          'Converter: 50 gotas ÷ 20 gotas/mL = 2,5 mL.',
          'Eliminar A (1,0 mL): usa divisor 50 — inverte a conta.',
          'Eliminar B (2,0 mL): divisor 25 — fator intermediário inventado.',
          'Eliminar D (3,0 mL) e E (3,5 mL): multiplicam em vez de dividir ou usam fator 16–17.',
          'Localizar alternativa C = 2,5 mL.',
          'Marcar C.',
          'Fixação: gotas → mL sempre divide pelo fator 20 salvo equipo microgotas explícito.',
        ],
        footer_rule: 'Roteiro: 50 gts ÷ 20 = 2,5 mL → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — gotas para mL',
        meta: slideMeta,
        content: '20 · 60 · 3',
        rows: [
          { label: '1 mL', value: '20 gotas (macrogota)', badge: 'hot', emphasis: 'highlight' },
          { label: '1 mL', value: '60 microgotas', badge: 'ok' },
          { label: '1 gota', value: '3 microgotas', badge: 'ok' },
          { label: 'Fórmula inversa', value: 'mL = gotas ÷ 20', badge: 'hot' },
          { label: '50 gotas', value: '50 ÷ 20 = 2,5 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 1,0 mL', value: '50 ÷ 50 — divisor inventado', badge: 'warn' },
          { label: 'Erro 3,0 mL', value: 'usa fator ~17 ou multiplica gotas × 0,06 errado', badge: 'warn' },
        ],
        footer_rule: 'Gotas → mL: divida pelo fator 20 (macrogotas)',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 50 GOTAS EM mL',
        items: [
          {
            label: 'Letra A — 1,0 mL',
            detail: 'Divide 50 por 50 — confunde gotas com mililitros diretamente.',
            correct: '50 gotas ÷ 20 gotas/mL = 2,5 mL — não 1,0 mL.',
          },
          {
            label: 'Letra B — 2,0 mL',
            detail: 'Usa divisor 25 — meio caminho entre 20 e 30 (pegadinha IDECAN).',
            correct: 'Padrão BR: 1 mL = 20 gotas → 50/20 = 2,5 mL.',
          },
          {
            label: 'Letra D — 3,0 mL',
            detail: 'Multiplica ou usa fator microgotas sem indicar equipo.',
            correct: 'Sem microgotas no enunciado, use macrogotas: 2,5 mL.',
          },
          {
            label: 'Letra E — 3,5 mL',
            detail: 'Superestima volume — divisor menor que 20.',
            correct: '50 ÷ 20 = 2,5 mL — única conversão correta.',
          },
          {
            label: 'Em outra banca — microgotas',
            detail: 'Se prescrição for em microgotas, divida por 60.',
            correct: 'Leia o enunciado: macrogota 20 | microgota 60 por mL.',
          },
        ],
        footer_rule: 'Prescrição em gotas: identifique equipo → divida pelo fator',
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
    console.log(`[handcraft:calculo-g01] OK ${slug}`);
  }
  console.log(`[handcraft:calculo-g01] total=${ok}`);
}

main();
