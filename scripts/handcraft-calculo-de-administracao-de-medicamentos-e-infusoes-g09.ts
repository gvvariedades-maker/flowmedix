#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — calculo-de-administracao-de-medicamentos-e-infusoes-g09 (8 slugs).
 *
 *   npx tsx scripts/handcraft-calculo-de-administracao-de-medicamentos-e-infusoes-g09.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'calculo-de-administracao-de-medicamentos-e-infusoes-g09';
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
    'hemocomponentes 4h',
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
  'itame-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056256294-1': {
    family: 'calc',
    guideline: 'Gluconato 8%/10 mL (800 mg) + 50 mL SG = 60 mL — 42 mL infundidos → 560 mg',
    roi_error: 'usar_volume_diluente_sem_somar_ampola',
    exam_vs_current: 'conta da prova — ampola 800 mg em 60 mL total, 42 mL → 560 mg',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gluconato diluído — proporção',
        meta: slideMeta,
        items: [
          {
            label: 'Ampola 8%/10 mL',
            detail: 'Gluconato de cálcio 8% em 10 mL = 800 mg de princípio ativo.',
            icon: 'FlaskConical',
          },
          {
            label: 'Diluição em SG',
            detail: '50 mL de soro glicosado 5% — diluente sem fármaco adicional.',
            icon: 'Droplets',
          },
          {
            label: 'Volume total',
            detail: '10 mL (ampola) + 50 mL (SG) = 60 mL — denominador da proporção.',
            icon: 'Calculator',
          },
          {
            label: 'Volume infundido',
            detail: 'Paciente recebe 42 mL da solução final — numerador parcial.',
            icon: 'Syringe',
          },
          {
            label: 'Regra de três',
            detail: '800 mg ── 60 mL | X mg ── 42 mL → X = 560 mg.',
            icon: 'Equal',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Usar só 50 mL de diluente ou 10 mL da ampola — ignora volume total.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Volume total = ampola + diluente | 42/60 × 800 = 560 mg',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: diluição proporcional — mg infundidos a partir de volume parcial.',
          'Calcular mg na ampola: gluconato 8%/10 mL = 800 mg.',
          'Somar volume total: 10 mL + 50 mL SG = 60 mL.',
          'Montar proporção: 800 mg ── 60 mL | X mg ── 42 mL.',
          'Calcular: X = (800 × 42) ÷ 60 = 560 mg.',
          'Eliminar A (480 mg): usa denominador ~70 mL ou subestima proporção.',
          'Eliminar B (520 mg): escala intermediária sem fechar 42/60.',
          'Eliminar D (580 mg): superestima — equivale a ~43,5 mL de 60 mL.',
          'Localizar alternativa C = 560 mg.',
          'Marcar C.',
          'Fixação: diluição → some ampola + diluente antes da regra de três.',
        ],
        footer_rule: 'Roteiro: 800 mg/60 mL → 42 mL = 560 mg → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — gluconato diluído',
        meta: slideMeta,
        content: '(800 × 42) ÷ 60',
        rows: [
          { label: 'Ampola', value: '8%/10 mL = 800 mg', badge: 'hot', emphasis: 'highlight' },
          { label: 'Diluente', value: '50 mL SG 5%', badge: 'ok' },
          { label: 'Volume total', value: '10 + 50 = 60 mL', badge: 'hot' },
          { label: 'Infundido', value: '42 mL da solução final', badge: 'ok' },
          { label: 'Proporção', value: '(800 × 42) ÷ 60 = 560 mg', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 480 mg', value: 'denominador ~70 mL — não somou ampola', badge: 'warn' },
          { label: 'Erro 580 mg', value: 'superestima — acima de 42/60', badge: 'warn' },
        ],
        footer_rule: 'Diluição: ampola + diluente = volume total da proporção',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GLUCONATO 8%/10 mL + 50 mL SG',
        items: [
          {
            label: 'Letra A — 480 mg',
            detail: 'Proporção com denominador ~70 mL — não fecha 42/60 da solução final.',
            correct: '800 mg em 60 mL total — 42 mL rendem 560 mg, não 480 mg.',
          },
          {
            label: 'Letra B — 520 mg',
            detail: 'Escala intermediária — não corresponde a 42 mL de 60 mL com 800 mg.',
            correct: 'Regra de três com volume total 60 mL fecha em 560 mg.',
          },
          {
            label: 'Letra D — 580 mg',
            detail: 'Superestima — equivale a infundir mais de 43 mL de 60 mL.',
            correct: '42 mL de solução com 800 mg/60 mL = 560 mg exatos.',
          },
          {
            label: 'Em outra banca — só diluente',
            detail: 'Calcular 800 mg em 50 mL (sem ampola) distorce concentração.',
            correct: 'Volume total = fármaco + diluente — 10 + 50 = 60 mL.',
          },
        ],
        footer_rule: 'Some ampola ao diluente antes da proporção mg/mL',
      },
    ],
  },

  'ivin-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056256294-2': {
    family: 'calc',
    guideline: 'Epinefrina 2 mL + SF 8 mL + SG 500 mL = 510 mL / 4 h = 127,5 mL/h',
    roi_error: 'usar_so_volume_do_veiculo_500_ml',
    exam_vs_current: 'conta da prova — 510 mL total em 4 h → 127,5 mL/h',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Epinefrina — vazão da bomba',
        meta: slideMeta,
        items: [
          {
            label: 'Fármaco',
            detail: '2 mL de epinefrina — primeiro componente da solução.',
            icon: 'Syringe',
          },
          {
            label: 'Diluição intermediária',
            detail: '8 mL de SF 0,9% — soma 10 mL antes da rediluição.',
            icon: 'FlaskConical',
          },
          {
            label: 'Veículo final',
            detail: '500 mL de SG 5% — rediluição na bolsa de infusão.',
            icon: 'Droplets',
          },
          {
            label: 'Volume total',
            detail: '2 + 8 + 500 = 510 mL — numerador da vazão.',
            icon: 'Calculator',
          },
          {
            label: 'Tempo de infusão',
            detail: '4 horas contínuas — bomba de infusão em mL/h.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Dividir só 500 mL por 4 h — esquece epinefrina e SF.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '510 mL ÷ 4 h = 127,5 mL/h',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: bomba de infusão contínua — vazão em mL/h.',
          'Somar todos os volumes: 2 mL (epi) + 8 mL (SF) + 500 mL (SG) = 510 mL.',
          'Fixar tempo: 4 horas de infusão contínua.',
          'Calcular vazão: 510 mL ÷ 4 h = 127,5 mL/h.',
          'Eliminar B (125 mL/h): 500 ÷ 4 — usa só o veículo, ignora 10 mL.',
          'Eliminar C (125,5 mL/h): ajuste parcial sem fechar 510 mL total.',
          'Eliminar D (130 mL/h): 520 mL ÷ 4 — volume superestimado.',
          'Eliminar E (132 mL/h): 528 mL ÷ 4 — escala sem base no enunciado.',
          'Localizar alternativa A = 127,5 mL/h.',
          'Marcar A.',
          'Fixação: bomba → some medicamento + diluente + veículo antes de ÷ tempo.',
        ],
        footer_rule: 'Roteiro: 510 mL ÷ 4 h = 127,5 mL/h → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — epinefrina / 4 h',
        meta: slideMeta,
        content: '510 mL ÷ 4 h',
        rows: [
          { label: 'Epinefrina', value: '2 mL', badge: 'ok' },
          { label: 'SF 0,9%', value: '8 mL', badge: 'ok' },
          { label: 'SG 5%', value: '500 mL', badge: 'ok' },
          { label: 'Volume total', value: '2 + 8 + 500 = 510 mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Tempo', value: '4 horas', badge: 'ok' },
          { label: 'Vazão', value: '510 ÷ 4 = 127,5 mL/h', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 125 mL/h', value: '500 ÷ 4 — esquece 10 mL de epi + SF', badge: 'warn' },
        ],
        footer_rule: 'Volume total / tempo = mL/h na bomba',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EPINEFRINA 2 mL + SF + SG 500 mL',
        items: [
          {
            label: 'Letra B — 125 mL/h',
            detail: '500 mL ÷ 4 h — considera só o soro glicosado, ignora 10 mL anteriores.',
            correct: 'Some 2 + 8 + 500 = 510 mL antes de dividir por 4 h.',
          },
          {
            label: 'Letra C — 125,5 mL/h',
            detail: 'Ajuste parcial — não fecha 510 mL totais do enunciado.',
            correct: '510 mL em 4 h = 127,5 mL/h — vazão exata da bomba.',
          },
          {
            label: 'Letra D — 130 mL/h',
            detail: '520 mL ÷ 4 — volume superestimado em 10 mL.',
            correct: 'Volume correto é 510 mL — 127,5 mL/h, não 130.',
          },
          {
            label: 'Letra E — 132 mL/h',
            detail: '528 mL ÷ 4 — escala sem relação com os volumes prescritos.',
            correct: '2 + 8 + 500 = 510 mL → 127,5 mL/h em 4 h.',
          },
          {
            label: 'Em outra banca — gts/min',
            detail: 'Se pedir gotas/min, converter 510 mL com fator 20 e 240 min.',
            correct: 'Esta prova pede mL/h na bomba — some tudo e divida por horas.',
          },
        ],
        footer_rule: 'Rediluição: some TODOS os mL antes de calcular vazão',
      },
    ],
  },

  'ivin-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056256294-3': {
    family: 'conceito',
    branch: 'calc_conceito',
    guideline: 'CH — transfusão de concentrado de hemácias em no máximo 4 horas após início',
    roi_error: 'confundir_tempo_ch_com_plasma_ou_24h',
    exam_vs_current: 'conta da prova — CH deve ser transfundido em no máximo 4 horas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'CH — tempo máximo de transfusão',
        meta: slideMeta,
        items: [
          {
            label: 'Concentrado de hemácias',
            detail: 'CH trata ou previne hipoxia tecidual por anemia — hemocomponente celular.',
            icon: 'Droplets',
          },
          {
            label: 'Indicação clínica',
            detail: 'Anemia com liberação inadequada de O₂ — nem toda anemia exige transfusão.',
            icon: 'Heart',
          },
          {
            label: 'Início da transfusão',
            detail: 'Após conectar o equipo, o relógio da bolsa começa a contar.',
            icon: 'Clock',
          },
          {
            label: 'Limite normativo',
            detail: 'Cada bolsa de CH deve ser transfundida em no máximo 4 horas.',
            icon: 'Shield',
          },
          {
            label: 'Risco do atraso',
            detail: 'Tempo prolongado aumenta risco de contaminação bacteriana e deterioração.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Confundir com plasma (4 h sem aquecimento) ou infusão de SF 24 h.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'CH: máximo 4 horas por bolsa após início',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: norma de hemoterapia — tempo máximo de transfusão de CH.',
          'Contextualizar: CH para anemia com hipoxia tecidual — não é cálculo numérico.',
          'Recuperar decore: concentrado de hemácias → no máximo 4 horas por bolsa.',
          'Eliminar A (5 horas): excede o limite normativo de 4 h.',
          'Eliminar B (5 h 30 min): ainda mais acima do teto de segurança.',
          'Eliminar C (3 horas): subestima — 3 h é possível, mas não é o máximo permitido.',
          'Eliminar E (4 h 30 min): ultrapassa 4 horas — bolsa deve ser interrompida.',
          'Localizar alternativa D = 4 horas.',
          'Marcar D.',
          'Fixação: CH = 4 h máximo | memorize junto com hemocomponentes em geral.',
        ],
        footer_rule: 'Roteiro: CH → máximo 4 h → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — tempo de transfusão CH',
        meta: slideMeta,
        content: 'CH — máximo 4 horas',
        rows: [
          { label: 'Hemocomponente', value: 'Concentrado de hemácias (CH)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Tempo máximo', value: '4 horas após início', badge: 'hot', emphasis: 'success' },
          { label: 'Início', value: 'Relógio conta a partir da conexão', badge: 'ok' },
          { label: 'Erro 5 h', value: 'Excede limite — risco de deterioração', badge: 'warn' },
          { label: 'Erro 3 h', value: 'Pode ser mais rápido, mas não é o teto', badge: 'info' },
          { label: 'Segurança', value: 'Interromper bolsa se ultrapassar 4 h', badge: 'warn' },
          { label: 'Paralelo', value: 'Hemocomponentes em geral: teto 4 h de infusão', badge: 'info' },
        ],
        footer_rule: 'CH e hemocomponentes: 4 h máximo por bolsa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TEMPO MÁXIMO CH',
        items: [
          {
            label: 'Letra A — 5 horas',
            detail: 'Excede o limite normativo — bolsa de CH não pode correr 5 h.',
            correct: 'Norma hemoterapia: CH transfundido em no máximo 4 horas.',
          },
          {
            label: 'Letra B — 5 h 30 min',
            detail: 'Ainda mais acima do teto — aumenta risco de contaminação.',
            correct: 'Após 4 h a transfusão deve ser interrompida — resposta D.',
          },
          {
            label: 'Letra C — 3 horas',
            detail: 'Transfusão pode ser mais rápida, mas a pergunta pede o máximo.',
            correct: 'Máximo permitido = 4 horas — não o tempo ideal mais curto.',
          },
          {
            label: 'Letra E — 4 h 30 min',
            detail: 'Ultrapassa 4 h — meia hora acima do limite de segurança.',
            correct: 'Teto normativo é 4 horas exatas — alternativa D.',
          },
          {
            label: 'Em outra banca — SF 24 h',
            detail: 'Infusão de soro fisiológico 24 h não se aplica a hemocomponentes.',
            correct: 'CH tem regra própria: 4 h máximo por bolsa após início.',
          },
        ],
        footer_rule: 'Não confunda CH (4 h) com infusão de soro (24 h)',
      },
    ],
  },

  'ivin-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056256294-4': {
    family: 'calc',
    guideline: 'SF 2.000 mL / 24 h — macrogotas (V×20)÷1.440 min ≈ 28 gts/min',
    roi_error: 'tempo_em_horas_sem_converter_minutos',
    exam_vs_current: 'conta da prova — 2.000 mL SF 24 h, macrogotas ≈ 28 gts/min',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SF 2.000 mL — 24 horas',
        meta: slideMeta,
        items: [
          {
            label: 'Volume prescrito',
            detail: '2.000 mL de soro fisiológico 0,9% — numerador da fórmula.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo em horas',
            detail: '24 horas → converter em 1.440 minutos antes de dividir.',
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
            detail: 'Dividir por 24 (horas) ou usar 8 h (480 min) em vez de 24 h.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão IVIN neste tema',
            detail: 'Grande volume / 24 h: converter h→min, arredondar para alternativa mais próxima.',
            icon: 'Target',
          },
        ],
        footer_rule: '24 h = 1.440 min | gts/min = (2.000 × 20) ÷ 1.440 ≈ 28',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: 2.000 mL de SF 0,9% para correr em 24 horas.',
          'Converter tempo: 24 h × 60 = 1.440 minutos.',
          'Aplicar fórmula: gts/min = (2.000 × 20) ÷ 1.440.',
          'Calcular: 40.000 ÷ 1.440 = 27,78 gotas por minuto.',
          'Arredondar para alternativa mais próxima: B = 28 gotas por minuto.',
          'Eliminar A (21 gts/min): tempo ~1.905 min — superestima duração.',
          'Eliminar C (62 gts/min): tempo ~645 min (~10,7 h) em vez de 24 h.',
          'Eliminar D (83 gts/min): tempo ~481 min (~8 h) — confunde com infusão 8 h.',
          'Eliminar E (100 gts/min): tempo ~400 min (~6,7 h) — subestima tempo.',
          'Localizar alternativa B = 28 gotas por minuto.',
          'Marcar B.',
          'Fixação: 24 h = 1.440 min — depois (V×20)÷tempo.',
        ],
        footer_rule: 'Roteiro: 24 h → 1.440 min → (2.000×20)/1.440 ≈ 28 → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 2.000 mL SF / 24 h',
        meta: slideMeta,
        content: '(2.000 × 20) ÷ 1.440',
        rows: [
          { label: 'Volume', value: '2.000 mL SF 0,9%', badge: 'ok' },
          { label: 'Tempo', value: '24 h = 1.440 min', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fator', value: '20 gotas/mL (macrogotas)', badge: 'ok' },
          { label: 'Fórmula', value: 'gts/min = (V × 20) ÷ min', badge: 'hot' },
          { label: 'Conta', value: '(2.000 × 20) ÷ 1.440 = 27,78 ≈ 28', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 83 gts/min', value: '480 min (8 h) — tempo 3× menor', badge: 'warn' },
          { label: 'Comparar', value: '2.000 mL/8 h ≈ 83 | 2.000 mL/24 h ≈ 28', badge: 'info' },
        ],
        footer_rule: 'Macrogotas: (mL × 20) ÷ minutos, arredonde',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 2.000 mL SF / 24 HORAS',
        items: [
          {
            label: 'Letra A — 21 gotas/min',
            detail: 'Fluxo muito baixo — tempo efetivo ~1.905 min (~32 h).',
            correct: '2.000 mL em 1.440 min com fator 20 ≈ 28 gts/min — não 21.',
          },
          {
            label: 'Letra C — 62 gotas/min',
            detail: 'Tempo ~645 min (~10,7 h) — menos da metade das 24 h.',
            correct: '24 h = 1.440 min — usar esse tempo na fórmula padrão.',
          },
          {
            label: 'Letra D — 83 gotas/min',
            detail: 'Resultado típico de 2.000 mL em 8 h (480 min), não 24 h.',
            correct: 'Infusão prescrita é 24 h — fluxo aproxima 28 gts/min.',
          },
          {
            label: 'Letra E — 100 gotas/min',
            detail: 'Tempo ~400 min (~6,7 h) — subestima as 24 h prescritas.',
            correct: '1.000 mL/24 h ≈ 14 | 2.000 mL/24 h ≈ 28 — dobro do volume.',
          },
          {
            label: 'Em outra banca — SF vs SG',
            detail: 'O tipo de soro não altera gts/min — só volume e tempo.',
            correct: 'SF, SG ou Ringer: mesma fórmula (V×20)÷min.',
          },
        ],
        footer_rule: 'Horas × 60 = minutos — depois (V × 20) ÷ min',
      },
    ],
  },

  'ivin-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056256294-5': {
    family: 'conceito',
    branch: 'calc_dose_equivalencia',
    guideline: 'Hemocomponentes — nenhuma transfusão deve exceder 4 horas de infusão',
    roi_error: 'confundir_hemocomponente_com_infusao_24h',
    exam_vs_current: 'conta da prova — tempo máximo de infusão de hemocomponentes = 4 horas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hemocomponentes — teto de infusão',
        meta: slideMeta,
        items: [
          {
            label: 'Hemocomponentes',
            detail: 'CH, plasma, plaquetas, crioprecipitado — produtos labile da hemoterapia.',
            icon: 'Droplets',
          },
          {
            label: 'Recomendação geral',
            detail: 'Nenhuma transfusão deve exceder o período máximo de infusão normativo.',
            icon: 'Shield',
          },
          {
            label: 'Limite universal',
            detail: '4 horas por bolsa — padrão Anvisa/hemoterapia para hemocomponentes.',
            icon: 'Clock',
          },
          {
            label: 'Segurança do paciente',
            detail: 'Tempo prolongado aumenta risco bacteriano e reação transfusional tardia.',
            icon: 'Heart',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Confundir com infusão de soro 24 h ou responder 1–2 h (tempo ideal, não teto).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão IVIN neste tema',
            detail: 'Decore normativo: hemocomponente = 4 h máximo — sem cálculo numérico.',
            icon: 'Target',
          },
        ],
        footer_rule: 'Hemocomponentes: infusão máxima 4 horas por bolsa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: norma de hemoterapia — tempo máximo de infusão.',
          'Contextualizar: recomendações para uso de hemocomponentes — conceito, não conta.',
          'Recuperar decore: nenhuma transfusão excede 4 horas de infusão.',
          'Eliminar A (1 hora): tempo ideal em alguns casos, mas não é o teto normativo.',
          'Eliminar B (2 horas): transfusão pode ser mais rápida — não é o máximo.',
          'Eliminar C (3 horas): ainda abaixo do limite de 4 h permitido.',
          'Eliminar E (24 horas): confunde hemocomponente com infusão de soro/manutenção.',
          'Localizar alternativa D = 4 horas.',
          'Marcar D.',
          'Fixação: hemocomponentes = 4 h máximo — decore junto com CH (questão 3).',
        ],
        footer_rule: 'Roteiro: hemocomponentes → máximo 4 h → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — hemocomponentes 4 h',
        meta: slideMeta,
        content: 'Máximo 4 horas por bolsa',
        rows: [
          { label: 'Hemocomponentes', value: 'CH, plasma, plaquetas, crioprecipitado', badge: 'ok' },
          { label: 'Tempo máximo', value: '4 horas de infusão', badge: 'hot', emphasis: 'success' },
          { label: 'Norma', value: 'Anvisa / hemoterapia — segurança transfusional', badge: 'hot', emphasis: 'highlight' },
          { label: 'Erro 1–2 h', value: 'Tempo ideal ≠ teto normativo', badge: 'info' },
          { label: 'Erro 3 h', value: 'Abaixo do máximo — resposta pede o teto', badge: 'info' },
          { label: 'Erro 24 h', value: 'Confunde com soro/manutenção EV', badge: 'warn' },
          { label: 'Paralelo CH', value: 'CH também: máximo 4 h após início', badge: 'ok' },
        ],
        footer_rule: 'Decore: hemocomponentes = 4 h | soro = volume/tempo calculado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TEMPO MÁXIMO HEMOCOMPONENTES',
        items: [
          {
            label: 'Letra A — 1 hora',
            detail: 'Transfusão pode ser mais rápida, mas 1 h não é o limite máximo.',
            correct: 'Teto normativo é 4 horas — não o tempo ideal mais curto.',
          },
          {
            label: 'Letra B — 2 horas',
            detail: '2 h é possível clinicamente — pergunta pede o máximo permitido.',
            correct: 'Nenhuma transfusão excede 4 h — resposta D.',
          },
          {
            label: 'Letra C — 3 horas',
            detail: 'Ainda abaixo do teto — 3 h não é o limite superior.',
            correct: 'Período máximo de infusão = 4 horas para hemocomponentes.',
          },
          {
            label: 'Letra E — 24 horas',
            detail: 'Confunde hemocomponente com infusão de manutenção (SF/SG 24 h).',
            correct: 'Bolsa de sangue tem teto 4 h — interromper se ultrapassar.',
          },
          {
            label: 'Em outra banca — plasma',
            detail: 'Plasma também respeita teto de 4 h (com regras de temperatura).',
            correct: 'Regra geral hemocomponentes: 4 h máximo de infusão por bolsa.',
          },
        ],
        footer_rule: 'Hemocomponente ≠ soro 24 h — decore 4 h',
      },
    ],
  },

  'lj-assessoria-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056256294-6': {
    family: 'calc',
    guideline: 'Analgésico 1 gota/kg — 36 kg = 36 gotas; 18 gotas/mL → 2,0 mL',
    roi_error: 'parar_em_gotas_sem_converter_ml',
    exam_vs_current: 'conta da prova — 36 gotas ÷ 18 gotas/mL = 2,0 mL',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Analgésico pediátrico — gotas para mL',
        meta: slideMeta,
        items: [
          {
            label: 'Posologia',
            detail: '1 gota por kg de peso — dose escalonada pela massa corporal.',
            icon: 'Scale',
          },
          {
            label: 'Peso da criança',
            detail: '36 kg — multiplicador direto na posologia gota/kg.',
            icon: 'Baby',
          },
          {
            label: 'Total de gotas',
            detail: '1 × 36 = 36 gotas — passo intermediário antes de converter.',
            icon: 'Droplets',
          },
          {
            label: 'Densidade do frasco',
            detail: '18 gotas/mL — fator de conversão do medicamento analgésico.',
            icon: 'Gauge',
          },
          {
            label: 'Volume em mL',
            detail: '36 gotas ÷ 18 gotas/mL = 2,0 mL — resposta pedida.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Parar em 36 gotas ou dividir por 20 (macrogota IV) em vez de 18.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '36 gotas ÷ 18 gotas/mL = 2,0 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: posologia gota/kg — resposta em mililitros.',
          'Calcular gotas: 1 gota/kg × 36 kg = 36 gotas.',
          'Converter para mL: 36 gotas ÷ 18 gotas/mL = 2,0 mL.',
          'Eliminar A (1,4 mL): ~25 gotas — subdose para 36 kg.',
          'Eliminar B (1,6 mL): ~29 gotas — ainda abaixo de 36 gotas.',
          'Eliminar C (1,8 mL): 32,4 gotas — 3,6 gotas a menos.',
          'Eliminar E (2,2 mL): ~40 gotas — superestima a dose.',
          'Localizar alternativa D = 2,0 mL.',
          'Marcar D.',
          'Fixação: gota/kg → gotas totais → ÷ gotas/mL do frasco = mL.',
        ],
        footer_rule: 'Roteiro: 36 gotas ÷ 18 = 2,0 mL → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 1 gota/kg / 36 kg',
        meta: slideMeta,
        content: '36 gotas ÷ 18 gotas/mL',
        rows: [
          { label: 'Posologia', value: '1 gota/kg', badge: 'hot', emphasis: 'highlight' },
          { label: 'Peso', value: '36 kg', badge: 'ok' },
          { label: 'Gotas', value: '1 × 36 = 36 gotas', badge: 'hot' },
          { label: 'Conversão', value: '18 gotas/mL (frasco)', badge: 'ok' },
          { label: 'Volume', value: '36 ÷ 18 = 2,0 mL', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 1,8 mL', value: '32 gotas — subdose de 4 gotas', badge: 'warn' },
          { label: 'Erro 2,2 mL', value: '~40 gotas — 4 gotas acima', badge: 'warn' },
        ],
        footer_rule: 'gota/kg × peso = gotas → gotas ÷ gotas/mL = mL',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ANALGÉSICO 1 GOTA/KG',
        items: [
          {
            label: 'Letra A — 1,4 mL',
            detail: 'Equivale a ~25 gotas — dose para ~25 kg, não 36 kg.',
            correct: '36 kg × 1 gota/kg = 36 gotas → 2,0 mL na densidade 18.',
          },
          {
            label: 'Letra B — 1,6 mL',
            detail: '~29 gotas — subdose de 7 gotas para 36 kg.',
            correct: '36 gotas ÷ 18 gotas/mL = 2,0 mL — não 1,6 mL.',
          },
          {
            label: 'Letra C — 1,8 mL',
            detail: '32,4 gotas — arredonda para baixo sem fechar 36 gotas.',
            correct: '2,0 mL entrega exatamente 36 gotas na densidade 18 gotas/mL.',
          },
          {
            label: 'Letra E — 2,2 mL',
            detail: '~40 gotas — superestima dose em 4 gotas (~11%).',
            correct: 'Posologia 1 gota/kg em 36 kg = 2,0 mL — alternativa D.',
          },
          {
            label: 'Em outra banca — fator 20',
            detail: 'Macrogota IV (20 gotas/mL) ≠ densidade do frasco oral (18).',
            correct: 'Use 18 gotas/mL do medicamento — não o fator 20 de equipo IV.',
          },
        ],
        footer_rule: 'Confirme gotas/mL do frasco antes de converter',
      },
    ],
  },

  'lj-assessoria-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056256294-7': {
    family: 'calc',
    guideline: 'Medicamento VO 10 mL — 10 gotas/mL = 100 gotas',
    roi_error: 'usar_fator_20_macrogota_iv_em_vo',
    exam_vs_current: 'conta da prova — 10 mL VO × 10 gotas/mL = 100 gotas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Medicamento VO — mL para gotas',
        meta: slideMeta,
        items: [
          {
            label: 'Prescrição',
            detail: '10 mL de medicamento via oral — volume-alvo da administração.',
            icon: 'Pill',
          },
          {
            label: 'Via oral',
            detail: 'Gotas VO usam densidade do frasco — não equipo de macrogotas IV.',
            icon: 'Droplets',
          },
          {
            label: 'Conversão padrão VO',
            detail: '10 gotas/mL — referência usual para xaropes e soluções orais.',
            icon: 'Gauge',
          },
          {
            label: 'Cálculo direto',
            detail: '10 mL × 10 gotas/mL = 100 gotas.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Usar fator 20 (macrogota IV) → 200 gotas — dobra a resposta.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão LJ Assessoria',
            detail: 'Pediatria VO: converter mL em gotas com densidade do frasco (10 gotas/mL).',
            icon: 'Target',
          },
        ],
        footer_rule: '10 mL × 10 gotas/mL = 100 gotas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: prescrição em mL VO — resposta pede quantidade em gotas.',
          'Fixar volume: 10 mL de medicamento via oral.',
          'Aplicar conversão VO: 10 gotas/mL (padrão soluções orais).',
          'Calcular: 10 mL × 10 gotas/mL = 100 gotas.',
          'Eliminar B (120 gotas): 12 mL ou fator 12 gotas/mL — sem base.',
          'Eliminar C (150 gotas): 15 mL equivalente — volume 50% acima.',
          'Eliminar D (180 gotas): 18 mL ou fator 18 — escala incoerente.',
          'Eliminar E (200 gotas): 10 mL × 20 (macrogota IV) — confunde vias.',
          'Localizar alternativa A = 100 gotas.',
          'Marcar A.',
          'Fixação: VO = gotas/mL do frasco | IV macrogota = 20 gotas/mL.',
        ],
        footer_rule: 'Roteiro: 10 mL × 10 = 100 gotas → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 10 mL VO em gotas',
        meta: slideMeta,
        content: '10 mL × 10 gotas/mL',
        rows: [
          { label: 'Prescrito', value: '10 mL VO', badge: 'hot', emphasis: 'highlight' },
          { label: 'Conversão VO', value: '10 gotas/mL', badge: 'ok' },
          { label: 'Gotas', value: '10 × 10 = 100 gotas', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 200 gotas', value: '10 × 20 — fator macrogota IV', badge: 'warn' },
          { label: 'Erro 120 gotas', value: '12 mL ou fator 12 — sem base', badge: 'warn' },
          { label: 'VO vs IV', value: 'Oral: 10 gotas/mL | IV: 20 gotas/mL', badge: 'info' },
          { label: 'Contexto', value: 'Criança 6 anos — dose por volume oral', badge: 'ok' },
        ],
        footer_rule: 'VO: mL × gotas/mL do frasco | não use fator 20 de IV',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 10 mL VO EM GOTAS',
        items: [
          {
            label: 'Letra B — 120 gotas',
            detail: 'Equivale a 12 mL na densidade 10 — volume 20% acima do prescrito.',
            correct: '10 mL × 10 gotas/mL = 100 gotas — alternativa A.',
          },
          {
            label: 'Letra C — 150 gotas',
            detail: '15 mL equivalente — dose 50% maior que 10 mL.',
            correct: 'Prescrição é 10 mL — 100 gotas na conversão padrão VO.',
          },
          {
            label: 'Letra D — 180 gotas',
            detail: '18 mL ou fator 18 gotas/mL — escala sem relação com 10 mL.',
            correct: '10 mL com 10 gotas/mL fecham exatamente 100 gotas.',
          },
          {
            label: 'Letra E — 200 gotas',
            detail: '10 mL × 20 — aplica fator de macrogotas IV em medicamento oral.',
            correct: 'Via oral usa 10 gotas/mL — macrogota IV (20) é outra via.',
          },
          {
            label: 'Em outra banca — seringa graduada',
            detail: 'Com seringa de 10 mL, administra volume direto — sem converter gotas.',
            correct: 'Quando pede gotas: mL × densidade do frasco (10 gotas/mL VO).',
          },
        ],
        footer_rule: 'VO ≠ IV — confirme fator gotas/mL da via',
      },
    ],
  },

  'nao-informado-geral-calculo-de-administracao-de-medicamentos-e-infusoes-1776056256294-0': {
    family: 'calc',
    guideline: 'Ampola 10 mg/2,5 mL = 4 mg/mL — 1,8 mL administrados → 7,2 mg',
    roi_error: 'dividir_em_vez_de_multiplicar_ml_por_concentracao',
    exam_vs_current: 'conta da prova — 1,8 mL × 4 mg/mL = 7,2 mg prescritos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ampola — mL administrados para mg',
        meta: slideMeta,
        items: [
          {
            label: 'Apresentação comercial',
            detail: '10 mg em 2,5 mL — derivar concentração antes da conta.',
            icon: 'FlaskConical',
          },
          {
            label: 'Concentração',
            detail: '10 mg ÷ 2,5 mL = 4 mg/mL — passo intermediário obrigatório.',
            icon: 'Calculator',
          },
          {
            label: 'Volume administrado',
            detail: '1,8 mL por via intramuscular — dado de partida em mililitros.',
            icon: 'Syringe',
          },
          {
            label: 'Pergunta da prova',
            detail: 'Quantos miligramas foram prescritos — inverte fluxo usual (mg→mL).',
            icon: 'HelpCircle',
          },
          {
            label: 'Cálculo direto',
            detail: '1,8 mL × 4 mg/mL = 7,2 mg.',
            icon: 'Equal',
          },
          {
            label: 'Pegadinha clássica',
            detail: 'Dividir 1,8 por 4 ou usar 10 mg/2,5 mL sem converter para mg/mL.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '10/2,5 = 4 mg/mL | 1,8 × 4 = 7,2 mg',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler enunciado: ampola comercial 10 mg/2,5 mL — técnico aspirou 1,8 mL por via intramuscular.',
          'Identificar formato: volume em mL administrado — pergunta pede mg prescritos.',
          'Calcular concentração da ampola: 10 mg ÷ 2,5 mL = 4 mg/mL.',
          'Aplicar: mg = volume (mL) × concentração (mg/mL).',
          'Calcular: 1,8 × 4 = 7,2 mg.',
          'Eliminar A (5,6 mg): 1,4 mL — subdose de 0,4 mL.',
          'Eliminar B (6,3 mg): 1,575 mL — escala sem fechar 1,8 mL.',
          'Eliminar D (8,5 mg): ~2,1 mL — superestima volume administrado.',
          'Localizar alternativa C = 7,2 mg.',
          'Marcar C.',
          'Fixação: derive mg/mL da apresentação, depois mL × mg/mL = mg.',
        ],
        footer_rule: 'Roteiro: 4 mg/mL → 1,8 × 4 = 7,2 mg → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 10 mg/2,5 mL / 1,8 mL',
        meta: slideMeta,
        content: '1,8 mL × 4 mg/mL',
        rows: [
          { label: 'Apresentação', value: '10 mg / 2,5 mL', badge: 'ok' },
          { label: 'Concentração', value: '10 ÷ 2,5 = 4 mg/mL', badge: 'hot', emphasis: 'highlight' },
          { label: 'Administrado', value: '1,8 mL IM', badge: 'ok' },
          { label: 'Fórmula', value: 'mg = mL × mg/mL', badge: 'hot' },
          { label: 'Dose em mg', value: '1,8 × 4 = 7,2 mg', badge: 'hot', emphasis: 'success' },
          { label: 'Erro 5,6 mg', value: '1,4 mL — subdose', badge: 'warn' },
          { label: 'Erro 8,5 mg', value: '~2,1 mL — superestima', badge: 'warn' },
        ],
        footer_rule: 'Apresentação → mg/mL → mL × concentração = mg',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 10 mg/2,5 mL / 1,8 mL IM',
        items: [
          {
            label: 'Letra A — 5,6 mg',
            detail: 'Equivale a 1,4 mL — 0,4 mL a menos que o administrado.',
            correct: '1,8 mL × 4 mg/mL = 7,2 mg — não 5,6 mg.',
          },
          {
            label: 'Letra B — 6,3 mg',
            detail: 'Escala intermediária — não corresponde a 1,8 mL na concentração 4 mg/mL.',
            correct: '7,2 mg é a única resposta coerente com 1,8 mL administrados.',
          },
          {
            label: 'Letra D — 8,5 mg',
            detail: 'Superestima — equivale a ~2,1 mL na concentração 4 mg/mL.',
            correct: 'Multiplique mL administrado (1,8) pela concentração (4 mg/mL).',
          },
          {
            label: 'Em outra banca — regra de três',
            detail: 'Alternativa: 10 mg ── 2,5 mL | X mg ── 1,8 mL → X = 7,2 mg.',
            correct: 'Regra de três e mL × mg/mL fecham no mesmo gabarito C.',
          },
        ],
        footer_rule: 'mL × mg/mL = mg — derive concentração da apresentação',
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
    console.log(`[handcraft:calculo-g09] OK ${slug}`);
  }
  console.log(`[handcraft:calculo-g09] total=${ok}`);
}

main();
