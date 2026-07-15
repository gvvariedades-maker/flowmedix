#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — calculo-de-administracao-de-medicamentos-e-infusoes-g11 (5 slugs).
 *
 *   npx tsx scripts/handcraft-calculo-de-administracao-de-medicamentos-e-infusoes-g11.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'calculo-de-administracao-de-medicamentos-e-infusoes-g11';
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
  'unifil-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056292978-4': {
    family: 'conceito',
    branch: 'calc_dose_equivalencia',
    guideline: 'VF assertivas I–V — só IV correta: SG 500 mL 8/8 h ≈ 21 gts/min',
    roi_error: 'marcar_insulina_sc_como_papula_ou_confundir_fatores_gotejamento',
    exam_vs_current: 'conta da prova — apenas assertiva IV correta; gabarito B',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'VF UNIFIL — cinco assertivas',
        meta: slideMeta,
        items: [
          {
            label: 'Item I — insulina SC',
            detail: 'Insulina regular subcutânea não deve formar pápula — pápula é intradérmica.',
            icon: 'Syringe',
          },
          {
            label: 'Item II — 0,4 mg / 4 mg/mL',
            detail: '0,4 ÷ 4 = 0,1 mL — não 0,2 mL como afirma a assertiva.',
            icon: 'Calculator',
          },
          {
            label: 'Item III — SF 500 mL / 6 h',
            detail: '(500×20)/360 ≈ 28 gts/min — não 60 gotas nem 240 microgotas/min.',
            icon: 'Droplets',
          },
          {
            label: 'Item IV — SG 500 mL 8/8 h',
            detail: '8/8 h = infusão em 8 h → (500×20)/480 ≈ 21 gts/min — única correta.',
            icon: 'Gauge',
          },
          {
            label: 'Item V — reações iguais',
            detail: 'Mesmo fármaco pode gerar respostas distintas — variabilidade individual.',
            icon: 'Users',
          },
          {
            label: 'Padrão UNIFIL neste tema',
            detail: 'VF misto: técnica de via + cálculo + farmacologia — julgar I–V antes das letras.',
            icon: 'Target',
          },
        ],
        footer_rule: 'Só IV fecha — SG 500 mL/8 h ≈ 21 gts/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: cinco assertivas I–V — marcar combinação correta.',
          'Testar I: insulina regular SC com formação de pápula — FALSO (SC não gera pápula; isso é ID).',
          'Testar II: 0,4 mg com frasco 4 mg/mL → 0,2 mL — FALSO (0,4÷4 = 0,1 mL).',
          'Testar III: SF 500 mL em 6 h → 60 gotas ou 240 microgotas/min — FALSO ((500×20)/360 ≈ 28 gts/min).',
          'Testar IV: SG 500 mL EV 8/8 h → 21 gotas/min — VERDADEIRO ((500×20)/480 ≈ 20,8 ≈ 21).',
          'Testar V: medicamentos iguais = reações iguais em todos — FALSO (variabilidade farmacológica).',
          'Montar mapa: I F · II F · III F · IV V · V F — apenas IV correta.',
          'Eliminar A (II, III e IV): inclui II e III falsas como corretas.',
          'Eliminar C (só V), D (só II e IV incorretas) e E (todas corretas).',
          'Localizar alternativa B = Apenas IV está correta.',
          'Marcar B.',
          'Fixação: julgue cada assertiva isoladamente — só IV passa no cálculo 500 mL/8 h.',
        ],
        footer_rule: 'Roteiro: I F · II F · III F · IV V · V F → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — assertivas I–V',
        meta: slideMeta,
        content: 'Só IV = V',
        rows: [
          { label: 'Item I', value: 'F — insulina SC não forma pápula', badge: 'warn' },
          { label: 'Item II', value: 'F — 0,4 mg ÷ 4 mg/mL = 0,1 mL', badge: 'warn' },
          { label: 'Item III', value: 'F — (500×20)/360 ≈ 28 gts/min', badge: 'warn' },
          { label: 'Item IV', value: 'V — (500×20)/480 ≈ 21 gts/min', badge: 'hot', emphasis: 'success' },
          { label: 'Item V', value: 'F — reações individuais variam', badge: 'warn' },
          { label: '8/8 h', value: 'Infusão em 8 h = 480 min', badge: 'info' },
          { label: 'Mapa assertivas', value: 'B — Apenas IV está correta', badge: 'hot', emphasis: 'highlight' },
        ],
        footer_rule: 'IV: SG 500 mL / 8 h → 21 gts/min — demais assertivas falsas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VF UNIFIL I–V',
        items: [
          {
            label: 'Letra A — II, III e IV corretas',
            detail: 'II erra dose (0,1 mL, não 0,2) e III erra gotejamento (~28, não 60/240).',
            correct: 'Só IV está correta — não inclua II nem III na combinação.',
          },
          {
            label: 'Letra C — apenas V correta',
            detail: 'V é falsa — fármacos iguais não garantem reação idêntica em todos.',
            correct: 'A única assertiva técnica correta é IV (SG 500 mL/8 h ≈ 21 gts/min).',
          },
          {
            label: 'Letra D — só II e IV incorretas',
            detail: 'Implica I, III e V corretas — I (pápula SC) e III (60/240 gts) são falsas.',
            correct: 'I, II, III e V falsas — apenas IV verdadeira → letra B.',
          },
          {
            label: 'Letra E — todas corretas',
            detail: 'Quatro assertivas falham — insulina SC, dose, SF 6 h e farmacologia.',
            correct: 'Mapa final: só IV passa — gabarito B.',
          },
          {
            label: 'Em outra banca — 8/8 h',
            detail: 'Confundir 8/8 h com 8 h totais no dia em vez de infusão em 8 h.',
            correct: '8/8 h = correr em 8 h → 480 min na fórmula (V×20)÷min.',
          },
        ],
        footer_rule: 'Julgue I–V antes das letras — só IV = V',
      },
    ],
  },

  'unifil-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056292978-5': {
    family: 'calc',
    guideline: 'SF 1.000 mL / 8 h — macrogotas (V×20)÷480 min; gabarito prova D = 44',
    roi_error: 'arredondar_sem_conferir_gabarito_ou_dividir_por_horas',
    exam_vs_current: 'conta exata (1.000×20)/480 ≈ 41,7 gts/min — banca marca D (44 gts/min)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SF 1.000 mL — 8 horas',
        meta: slideMeta,
        items: [
          {
            label: 'Volume prescrito',
            detail: '1.000 mL de soro fisiológico 0,9% — numerador da fórmula.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo em horas',
            detail: '8 horas → converter em 480 minutos antes de dividir.',
            icon: 'Clock',
          },
          {
            label: 'Equipo macrogotas',
            detail: 'Fator 20 — 1 mL = 20 gotas; padrão UNIFIL em infusão EV.',
            icon: 'Gauge',
          },
          {
            label: 'Conta canônica',
            detail: '(1.000 × 20) ÷ 480 = 41,67 gotas por minuto — arredonda para ~42.',
            icon: 'Calculator',
          },
          {
            label: 'Resposta UNIFIL',
            detail: 'Banca assinala D = 44 gts/min — ensinar resposta oficial da prova.',
            icon: 'Target',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Dividir por 8 (horas) sem converter em minutos — ou ignorar gabarito D.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Fórmula ≈ 42 gts/min | Gabarito UNIFIL: D = 44',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 1.000 mL de SF 0,9% para correr em 8 horas — gts/min.',
          'Converter tempo: 8 h × 60 = 480 minutos.',
          'Aplicar macrogotas: gts/min = (1.000 × 20) ÷ 480.',
          'Calcular: 20.000 ÷ 480 = 41,67 gotas por minuto — aritmética padrão ≈ 42.',
          'Registrar divergência: alternativa E (42) é a mais próxima da conta exata.',
          'Conferir gabarito oficial UNIFIL: letra D = 44 gotas por minuto.',
          'Eliminar A (48), B (52) e C (40): fluxos sem base no volume/tempo prescritos.',
          'Eliminar E (42): conta exata, mas banca assinala D nesta prova.',
          'Localizar alternativa D = 44 gotas por minuto.',
          'Marcar D.',
          'Fixação: faça a conta (≈42) — na prova UNIFIL, marque o gabarito D = 44.',
        ],
        footer_rule: 'Roteiro: conta ≈42 → gabarito prova D = 44 gts/min',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — SF 1.000 mL / 8 h',
        meta: slideMeta,
        content: '(1.000 × 20) ÷ 480',
        rows: [
          { label: 'Volume', value: '1.000 mL SF 0,9%', badge: 'ok' },
          { label: 'Tempo', value: '8 h = 480 min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator', value: '20 gotas/mL (macrogotas)', badge: 'ok' },
          { label: 'Conta exata', value: '(1.000×20)÷480 = 41,67 ≈ 42', badge: 'info' },
          { label: 'Alternativa D', value: '44 gts/min', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 48 gts/min', value: 'tempo ~417 min — infusão mais rápida', badge: 'warn' },
          { label: 'Erro 52 gts/min', value: 'tempo ~385 min — subestima duração', badge: 'warn' },
          { label: 'Prova × guideline', value: 'Conta padrão ≠ alternativa marcada — seguir gabarito', badge: 'warn' },
        ],
        footer_rule: 'Conta ≈42 | Gabarito UNIFIL: D = 44 gts/min',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SF 1.000 mL / 8 HORAS',
        items: [
          {
            label: 'Letra A — 48 gotas/min',
            detail: 'Fluxo acima do prescrito — tempo efetivo ~417 min em vez de 480.',
            correct: 'Gabarito UNIFIL: D = 44 gts/min — não 48.',
          },
          {
            label: 'Letra B — 52 gotas/min',
            detail: 'Infusão ainda mais rápida — divisor ~385 min (~6,4 h).',
            correct: '1.000 mL em 8 h — banca marca 44 gts/min (letra D).',
          },
          {
            label: 'Letra C — 40 gotas/min',
            detail: 'Fluxo abaixo — tempo ~500 min (~8,3 h) ou arredondamento precoce.',
            correct: 'Conta canônica ≈42; gabarito oficial desta prova é D (44).',
          },
          {
            label: 'Letra E — 42 gotas/min',
            detail: 'Alternativa mais próxima da aritmética (41,67) — mas não é o gabarito UNIFIL.',
            correct: 'Na prova, marque D (44) — registrar divergência em exam_vs_current.',
          },
          {
            label: 'Em outra banca — SF 0,9%',
            detail: 'Tipo de soro não altera gts/min — só volume e tempo.',
            correct: 'Fórmula: (mL × 20) ÷ minutos — conferir gabarito da banca.',
          },
        ],
        footer_rule: 'Conta ≈42 — gabarito UNIFIL: letra D = 44',
      },
    ],
  },

  'vunesp-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056301382-5': {
    family: 'calc',
    guideline: 'RL 1.000 mL / 12 h — 28 gts/min e 84 microgts/min (fator 20 e 60)',
    roi_error: 'calcular_só_macrogotas_ou_trocar_fator_20_por_60',
    exam_vs_current: 'conta da prova — 1.000 mL RL 12 h → D = 28 gotas e 84 microgotas/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'RL 1.000 mL — 12 horas',
        meta: slideMeta,
        items: [
          {
            label: 'Competência VUNESP',
            detail: 'Calcular gotas e microgotas por minuto — Ringer Lactato 1.000 mL em 12 horas.',
            icon: 'Calculator',
          },
          {
            label: 'Volume prescrito',
            detail: '1.000 mL de Ringer Lactato — numerador das duas fórmulas.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo de infusão',
            detail: '12 horas = 720 minutos — converter antes de dividir.',
            icon: 'Clock',
          },
          {
            label: 'Macrogotas',
            detail: 'Fator 20 → gts/min = (1.000 × 20) ÷ 720 ≈ 28.',
            icon: 'Gauge',
          },
          {
            label: 'Microgotas',
            detail: 'Fator 60 → microgts/min = (1.000 × 60) ÷ 720 ≈ 84.',
            icon: 'Activity',
          },
          {
            label: 'Conferência 1:3',
            detail: '28 gotas × 3 = 84 microgotas — proporção 20:60 consistente.',
            icon: 'ArrowLeftRight',
          },
          {
            label: 'Padrão VUNESP neste tema',
            detail: 'Enunciado pede par gotas + microgotas — duas contas, mesmo volume/tempo.',
            icon: 'Target',
          },
        ],
        footer_rule: '12 h = 720 min → 28 gts/min e 84 microgts/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 1.000 mL de Ringer Lactato em 12 horas — gotas e microgotas/min.',
          'Converter tempo: 12 h × 60 = 720 minutos.',
          'Macrogotas: gts/min = (1.000 × 20) ÷ 720 = 20.000 ÷ 720 ≈ 27,78 ≈ 28.',
          'Microgotas: microgts/min = (1.000 × 60) ÷ 720 = 60.000 ÷ 720 ≈ 83,33 ≈ 84.',
          'Conferir par: 28 × 3 = 84 — proporção 20:60 fecha.',
          'Eliminar A (32/96): macrogotas superestimadas — tempo ~625 min.',
          'Eliminar B (46/138): fluxo quase o dobro — tempo ~435 min.',
          'Eliminar C (30/96): microgotas incoerentes com macrogotas (30×3 ≠ 96).',
          'Eliminar E (46/198): escala sem relação com 1.000 mL/12 h.',
          'Localizar alternativa D = 28 gotas e 84 microgotas por minuto.',
          'Marcar D.',
          'Fixação: mesmo volume e tempo — fator 20 → gotas, fator 60 → microgotas.',
        ],
        footer_rule: 'Roteiro: (1.000×20)/720≈28 | (1.000×60)/720≈84 → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — par gotas/microgotas',
        meta: slideMeta,
        content: '28 · 84 · 720 min',
        rows: [
          { label: 'Volume', value: '1.000 mL Ringer Lactato', badge: 'ok' },
          { label: 'Tempo', value: '12 h = 720 min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Macrogotas', value: '(1.000×20)÷720 ≈ 28 gts/min', badge: 'hot', emphasis: 'success' },
          { label: 'Microgotas', value: '(1.000×60)÷720 ≈ 84 microgts/min', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 32/96', value: 'tempo ~625 min — infusão mais rápida', badge: 'warn' },
          { label: 'Erro 46/138', value: 'dobra fluxo — tempo ~435 min', badge: 'warn' },
          { label: 'Conferência', value: '28×3 = 84 — relação 20:60', badge: 'info' },
        ],
        footer_rule: 'Dupla conta: fator 20 → gotas | fator 60 → microgotas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — RL 1.000 mL / 12 HORAS',
        items: [
          {
            label: 'Letra A — 32 e 96',
            detail: 'Macrogotas ~15% acima — tempo efetivo ~625 min (~10,4 h).',
            correct: '(1.000×20)/720 ≈ 28 gts/min — não 32.',
          },
          {
            label: 'Letra B — 46 e 138',
            detail: 'Fluxo quase o dobro — divisor ~435 min (~7,25 h).',
            correct: 'Par correto: 28 gotas e 84 microgotas/min — letra D.',
          },
          {
            label: 'Letra C — 30 e 96',
            detail: 'Microgotas não fecham proporção 1:3 com macrogotas (30×3 = 90, não 96).',
            correct: '28×3 = 84 — par coerente só em D.',
          },
          {
            label: 'Letra E — 46 e 198',
            detail: '198 microgts implicaria ~55 gotas — escala incoerente com 12 h.',
            correct: '1.000 mL em 720 min → 28 gts e 84 microgts/min.',
          },
          {
            label: 'Em outra banca — RL vs SF',
            detail: 'Composição do soro não altera gotejamento — só mL e tempo.',
            correct: 'Ringer, SF ou SG: mesma fórmula com fatores 20 e 60.',
          },
        ],
        footer_rule: 'Par 28/84 — conferir proporção 1:3 entre gotas e microgotas',
      },
    ],
  },

  'vunesp-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056301382-6': {
    family: 'calc',
    guideline: 'Dormonid 10 mg — ampola 15 mg/3 mL (5 mg/mL) → 10÷5 = 2 mL',
    roi_error: 'dividir_por_3_ml_da_ampola_em_vez_de_mg_ml',
    exam_vs_current: 'conta da prova — 10 mg midazolam, 15 mg/3 mL → 2 mL (letra C)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dormonid — mg para mL',
        meta: slideMeta,
        items: [
          {
            label: 'Dose prescrita',
            detail: '10 mg de Dormonid (midazolam) em bolus — alvo em miligramas.',
            icon: 'Syringe',
          },
          {
            label: 'Ampola disponível',
            detail: '15 mg em 3 mL — derivar concentração antes da conta.',
            icon: 'FlaskConical',
          },
          {
            label: 'Concentração',
            detail: '15 mg ÷ 3 mL = 5 mg/mL — passo intermediário obrigatório.',
            icon: 'Calculator',
          },
          {
            label: 'Volume necessário',
            detail: '10 mg ÷ 5 mg/mL = 2 mL na seringa.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Dividir 10 por 3 (volume da ampola) ou responder 3 mL (dose total da ampola).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão VUNESP neste tema',
            detail: 'UTI: bolus EV com apresentação mg/mL — dose ÷ concentração.',
            icon: 'Target',
          },
        ],
        footer_rule: '15 mg/3 mL = 5 mg/mL | 10 mg = 2 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 10 mg de Dormonid em bolus — ampolas de 15 mg/3 mL disponíveis na UTI — resposta em mL.',
          'Calcular concentração: 15 mg ÷ 3 mL = 5 mg/mL.',
          'Montar regra de três: 10 mg ── X mL | 15 mg ── 3 mL.',
          'Resolver: X = (10 × 3) ÷ 15 = 2 mL. Ou: 10 ÷ 5 = 2 mL.',
          'Eliminar A (1,0 mL): 5 mg — metade da dose prescrita.',
          'Eliminar B (1,5 mL): 7,5 mg — 2,5 mg a menos.',
          'Eliminar D (2,5 mL): 12,5 mg — superestima em 2,5 mg.',
          'Eliminar E (3,0 mL): 15 mg — dose total da ampola, não a prescrita.',
          'Localizar alternativa C = 2,0 mL.',
          'Marcar C.',
          'Fixação: mg prescritos ÷ mg/mL = mL — ignore volume total da ampola.',
        ],
        footer_rule: 'Roteiro: 15/3 = 5 mg/mL → 10 mg = 2 mL → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Dormonid 10 mg',
        meta: slideMeta,
        content: '10 mg ÷ 5 mg/mL',
        rows: [
          { label: 'Prescrito', value: '10 mg EV bolus', badge: 'hot', emphasis: 'highlight' },
          { label: 'Apresentação', value: '15 mg em 3 mL', badge: 'ok' },
          { label: 'Concentração', value: '15 ÷ 3 = 5 mg/mL', badge: 'info' },
          { label: 'Volume', value: '10 ÷ 5 = 2 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Regra de três', value: '10 mg ── 2 mL | 15 mg ── 3 mL', badge: 'ok' },
          { label: 'Erro 1,0 mL', value: '5 mg — metade da dose', badge: 'warn' },
          { label: 'Erro 3,0 mL', value: '15 mg — ampola inteira, não prescrito', badge: 'warn' },
        ],
        footer_rule: 'mg prescritos ÷ mg/mL = mL na seringa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DORMONID 10 mg',
        items: [
          {
            label: 'Letra A — 1,0 mL',
            detail: '1 mL × 5 mg/mL = 5 mg — metade dos 10 mg prescritos.',
            correct: '10 mg exigem 2 mL na concentração 5 mg/mL.',
          },
          {
            label: 'Letra B — 1,5 mL',
            detail: '1,5 × 5 = 7,5 mg — faltam 2,5 mg para a prescrição.',
            correct: '10 mg ÷ 5 mg/mL = 2 mL — não 1,5 mL.',
          },
          {
            label: 'Letra D — 2,5 mL',
            detail: '2,5 × 5 = 12,5 mg — 2,5 mg acima do prescrito.',
            correct: '2 mL entrega exatamente 10 mg na apresentação 15 mg/3 mL.',
          },
          {
            label: 'Letra E — 3,0 mL',
            detail: 'Volume total da ampola (15 mg) — não a fração prescrita.',
            correct: 'Resposta = mg prescritos ÷ mg/mL, não mL da ampola.',
          },
          {
            label: 'Em outra banca — bolus EV',
            detail: 'Via e ritmo não alteram a conta de volume — só mg e concentração.',
            correct: '10 mg de 5 mg/mL = 2 mL independente do contexto UTI.',
          },
        ],
        footer_rule: 'Dose ÷ concentração = mL — não aspirar ampola inteira',
      },
    ],
  },

  'vunesp-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056301382-7': {
    family: 'conceito',
    branch: 'calc_dose_equivalencia',
    guideline: 'Metilprednisolona EV 30 min — reconstituição → rediluição → bureta → AVP salinizado',
    roi_error: 'pular_rediluicao_ou_administrar_bolus_em_vez_de_infusao_lenta',
    exam_vs_current: 'conta da prova — sequência correta: letra E (reconstituição, rediluição, bureta, AVP)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Metilprednisolona — sequência EV',
        meta: slideMeta,
        items: [
          {
            label: 'Apresentação',
            detail: 'Pó liofilizado em frasco-ampola — exige reconstituição antes da rediluição.',
            icon: 'FlaskConical',
          },
          {
            label: 'Acesso existente',
            detail: 'AVP em dorso da mão direita — não punir de novo se via está pérvia.',
            icon: 'Syringe',
          },
          {
            label: 'Tempo de infusão',
            detail: '30 minutos — infusão lenta em bureta, não bolus direto.',
            icon: 'Clock',
          },
          {
            label: 'Passo 1',
            detail: 'Reconstituir o pó e identificar medicamento/paciente (dois certos).',
            icon: 'CheckCircle',
          },
          {
            label: 'Passo 2',
            detail: 'Rediluir conforme apresentação e dose prescrita (5 mg).',
            icon: 'Droplets',
          },
          {
            label: 'Passo 3–4',
            detail: 'Preparar equipo + bureta → administrar em AVP verificado e salinizado.',
            icon: 'Gauge',
          },
        ],
        footer_rule: 'Pó liofilizado: reconstituir → rediluir → bureta → AVP salinizado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: sequência de preparo/administração — metilprednisolona 5 mg EV em 30 min.',
          'Contexto: criança com AVP em dorso da mão — precauções-padrão já adotadas.',
          'Eliminar A: salinização + bolus — ignora rediluição e infusão em 30 min.',
          'Eliminar B: punção venosa específica + bolus em bureta — AVP já existe; reconstituição fixa em 10 mL sem rediluição.',
          'Eliminar C: ajuste por peso + SG — dose fixa 5 mg; corticoide não vai em SG como veículo padrão.',
          'Eliminar D: punção independente + bolus — contradiz AVP existente e tempo de 30 min.',
          'Testar E: reconstituição e identificação → rediluição conforme dose → equipo/bureta → AVP salinizado.',
          'Sequência E fecha: pó liofilizado + infusão lenta + via periférica já instalada.',
          'Localizar alternativa E.',
          'Marcar E.',
          'Fixação: pó EV lento = reconstituir → rediluir → bureta → AVP verificado e salinizado.',
        ],
        footer_rule: 'Roteiro: reconstituir → rediluir → bureta → AVP salinizado → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — preparo metilprednisolona',
        meta: slideMeta,
        content: 'Reconstituir → rediluir → bureta → AVP',
        rows: [
          { label: '1º passo', value: 'Reconstituição + identificação (dois certos)', badge: 'hot', emphasis: 'highlight' },
          { label: '2º passo', value: 'Rediluição conforme apresentação e dose 5 mg', badge: 'hot' },
          { label: '3º passo', value: 'Preparo de equipo e bureta (infusão 30 min)', badge: 'ok' },
          { label: '4º passo', value: 'Administração em AVP verificado e salinizado', badge: 'hot', emphasis: 'success' },
          { label: 'Erro bolus', value: '30 min exige infusão lenta — não bolus', badge: 'warn' },
          { label: 'Erro nova punção', value: 'AVP pérvio em mão direita — usar via existente', badge: 'warn' },
          { label: 'Erro SG', value: 'Veículo adequado na rediluição — não SG como atalho', badge: 'warn' },
        ],
        footer_rule: 'Pó liofilizado EV: reconstituir → rediluir → infundir em bureta',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — METILPREDNISOLONA EV 30 min',
        items: [
          {
            label: 'Letra A — bolus após salinização',
            detail: 'Pula reconstituição/rediluição e ignora infusão em 30 minutos.',
            correct: 'Sequência correta: reconstituir → rediluir → bureta → AVP salinizado.',
          },
          {
            label: 'Letra B — punção + reconstituição 10 mL',
            detail: 'AVP já instalado — nova punção desnecessária; falta rediluição formal.',
            correct: 'Usar AVP existente; reconstituir e rediluir antes da bureta.',
          },
          {
            label: 'Letra C — ajuste peso + SG',
            detail: 'Dose fixa 5 mg — não exige recálculo por peso; SG não é veículo padrão.',
            correct: 'Rediluição conforme bula/dose → equipo/bureta → AVP salinizado.',
          },
          {
            label: 'Letra D — punção independente + bolus',
            detail: 'Contradiz AVP em mão direita e tempo prescrito de 30 min.',
            correct: 'Infusão lenta em bureta pelo AVP já verificado — letra E.',
          },
          {
            label: 'Em outra banca — pó liofilizado',
            detail: 'Toda apresentação em pó exige reconstituição antes de rediluir.',
            correct: 'Nunca pular reconstituição — depois rediluir e infundir lentamente.',
          },
        ],
        footer_rule: 'Não bolus · não repuncionar AVP pérvio · reconstituir antes de rediluir',
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
    console.log(`[handcraft:calculo-g11] OK ${slug}`);
  }
  console.log(`[handcraft:calculo-g11] total=${ok}`);
}

main();
