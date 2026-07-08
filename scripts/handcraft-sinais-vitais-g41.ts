#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g41 (8 slugs P1 vitals_temperatura batch 3).
 * Cluster Temperatura — vias e febre (33 slugs — g39=8, g40=8, g41=8, 9 restantes).
 *
 *   npm run handcraft:sinais-vitais-g41
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g41';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN',
  title: 'Temperatura corporal — vias, faixas e classificação clínica',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'vias axilar · oral · retal · timpânica · temporal',
    'oral ~0,5 °C acima da axilar · axilar ~0,5 °C abaixo da retal',
    'afebril · febre · hiperpirexia · hipotermia',
    'retal mais próxima da central · axilar menos precisa',
    'termoplegia / hipertermia >40 °C',
    'hipotermia grave <28 °C',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: {
    instruction: string;
    text_fragment?: string;
    options: { id: string; text: string; is_correct: boolean }[];
  };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo';
  guideline: string;
  exam_vs_current?: string;
  roi_error: string;
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: 'vitals_temperatura',
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      roi_error: pack.roi_error,
    },
    sources: [SV_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'fgv-enfermagem-verificacao-de-sinais-vitais-1778969737311-1': {
    family: 'vf',
    guideline:
      'MS/COFEN — oral ~0,5 °C > axilar · axilar ~0,5 °C < retal · oral ~1 °C < retal (não 1 °C exato oral–retal na III)',
    roi_error: 'diferenca_entre_vias',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hierarquia térmica entre vias',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Três afirmativas V/F sobre diferenças entre temperatura oral, axilar e retal.',
            icon: 'Target',
          },
          {
            label: 'Oral × axilar',
            detail: 'Cavidade oral costuma registrar ~0,5 °C a mais que a axila.',
            icon: 'Thermometer',
          },
          {
            label: 'Axilar × retal',
            detail: 'Axila fica ~0,5 °C abaixo da temperatura retal/central.',
            icon: 'Activity',
          },
          {
            label: 'Oral × retal',
            detail: 'Oral é menor que retal — diferença clássica ≈0,5–1 °C, não 1 °C fixo na III.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — 1 °C fixo',
            detail: 'Terceira afirmativa fixa 1 °C oral–retal — referência usa ~0,5–1 °C.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Retal > oral > axilar na maioria das referências',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: julgar V/F nas três relações entre vias de temperatura.',
          'Afirmativa I — oral 0,5 °C maior que axilar: padrão semiológico → V.',
          'Afirmativa II — axilar 0,5 °C menor que retal: coerente com hierarquia → V.',
          'Afirmativa III — oral 1 °C menor que retal: exagera o gap — oral costuma ficar ~0,5 °C abaixo da retal → F.',
          'Sequência V – V – F → eliminar A (F–V–V), B (F–V–F), C (V–F–V), D (V–V–V).',
          'Marcar E (V – V – F).',
        ],
        footer_rule: 'Não confunda 0,5 °C com 1 °C oral–retal',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — diferenças entre vias',
        meta: slideMeta,
        content: 'COMPARE SEMPRE A MESMA VIA NO PRONTUÁRIO',
        rows: [
          { label: 'Oral vs axilar', value: 'Oral ≈0,5 °C maior', sv_kind: 'temp', badge: 'ok' },
          { label: 'Axilar vs retal', value: 'Axilar ≈0,5 °C menor', sv_kind: 'temp', badge: 'ok' },
          { label: 'Oral vs retal', value: 'Oral ≈0,5 °C menor (~1 °C máx.)', sv_kind: 'temp', badge: 'hot' },
          { label: 'Faixa geral', value: '36 a 38 °C conforme local', sv_kind: 'temp', badge: 'warn' },
        ],
        footer_rule: 'Terceira afirmativa erra o delta oral–retal',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F VIAS FGV',
        items: [
          {
            label: 'Letra A — F – V – V',
            detail: 'Marca a primeira afirmativa como falsa.',
            correct:
              'Oral costuma ser ~0,5 °C maior que axilar — afirmativa I é verdadeira, não falsa.',
          },
          {
            label: 'Letra B — F – V – F',
            detail: 'Marca a primeira como falsa e aceita III como falsa.',
            correct:
              'I é V (oral > axilar); só a III é F — sequência correta inicia com V, não F.',
          },
          {
            label: 'Letra C — V – F – V',
            detail: 'Nega que axilar seja ~0,5 °C menor que retal.',
            correct:
              'Axilar fica abaixo da retal em ~0,5 °C — afirmativa II é verdadeira.',
          },
          {
            label: 'Letra D — V – V – V',
            detail: 'Aceita oral 1 °C menor que retal como verdade na III.',
            correct:
              'Diferença oral–retal é em torno de 0,5 °C — fixar 1 °C na III exagera; afirmativa é falsa.',
          },
        ],
        footer_rule: 'Só E fecha V – V – F',
      },
    ],
  },

  'fgv-enfermagem-verificacao-de-sinais-vitais-1778969760552-6': {
    family: 'protocolo',
    guideline:
      'MS — hipotermia leve 32–35 °C · moderada 28–32 °C · grave <28 °C · 26 °C = hipotermia grave',
    roi_error: 'classificacao_hipotermia_grau',
    slides: [
      {
        type: 'concept_map',
        slide_title: '26 °C — classificar hipotermia',
        meta: slideMeta,
        items: [
          {
            label: 'Caso UPA',
            detail: 'Paciente com temperatura = 26 °C — valor crítico, longe da normotermia.',
            icon: 'Target',
          },
          {
            label: 'Normotermia',
            detail: 'Adulto ≈36–37,5 °C axilar — 26 °C é queda extrema.',
            icon: 'Thermometer',
          },
          {
            label: 'Hipotermia grave',
            detail: 'Geralmente <28 °C — risco de arritmia e PCR.',
            icon: 'Snowflake',
          },
          {
            label: 'Pegadinha — “leve”',
            detail: 'Letras B e E sugerem graus menores — incompatíveis com 26 °C.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — estresse frio',
            detail: 'Letra A não é termo clínico de classificação térmica.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '26 °C → hipotermia grave',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: 26 °C corresponde a qual classificação?',
          'Referência: hipotermia grave costuma ser <28 °C.',
          'Testar A — estresse por frio: não é classificação semiológica → eliminar.',
          'Testar B — hipotermia leve (32–35 °C): 26 °C está muito abaixo → eliminar.',
          'Testar D — profunda e E — moderada: graus intermediários não cabem em 26 °C → eliminar.',
          'Testar C — hipotermia grave: compatível com <28 °C → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'Quanto menor o valor, mais grave o grau',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — graus de hipotermia',
        meta: slideMeta,
        content: 'NÚMERO → GRAU CLÍNICO',
        rows: [
          { label: '32–35 °C', value: 'Hipotermia leve', sv_kind: 'temp', badge: 'warn' },
          { label: '28–32 °C', value: 'Hipotermia moderada', sv_kind: 'temp', badge: 'warn' },
          { label: '<28 °C', value: 'Hipotermia grave', sv_kind: 'temp', badge: 'hot' },
          { label: '26 °C (caso)', value: 'Hipotermia grave', sv_kind: 'temp', badge: 'hot' },
        ],
        footer_rule: '26 °C exige reaquecimento urgente',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 26 °C FGV',
        items: [
          {
            label: 'Letra A — estresse por frio',
            detail: 'Estresse por frio.',
            correct:
              'Não é terminologia de classificação de hipotermia — a banca espera leve/moderada/grave.',
          },
          {
            label: 'Letra B — hipotermia leve',
            detail: 'Hipotermia leve.',
            correct:
              'Leve situa-se em torno de 32–35 °C — 26 °C está muito abaixo dessa faixa.',
          },
          {
            label: 'Letra D — hipotermia profunda',
            detail: 'Hipotermia profunda.',
            correct:
              '“Profunda” não é o termo usado nesta escala — com 26 °C o gabarito oficial é grave.',
          },
          {
            label: 'Letra E — hipotermia moderada',
            detail: 'Hipotermia moderada.',
            correct:
              'Moderada costuma ser 28–32 °C — 26 °C já ultrapassa para grave (<28 °C).',
          },
        ],
        footer_rule: 'Só C fecha hipotermia grave',
      },
    ],
  },

  'furb-enfermagem-verificacao-de-sinais-vitais-1779343956155-7': {
    family: 'protocolo',
    guideline:
      'MS — inguinal 36–36,8 °C · axilar 36–37,5 °C · retal 36,5–37,5 °C · tempo axilar 5–10 min',
    exam_vs_current:
      'Gabarito C cita via inguinal — menos frequente em outras bancas; prova FURB marca inguinal 36–36,8 °C',
    roi_error: 'faixa_normativa_por_via',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Faixa normal por via',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Alternativa com valor normal correto conforme o local aferido.',
            icon: 'Target',
          },
          {
            label: 'Tempo axilar',
            detail: 'Enunciado cita 5 a 10 min — técnica de imersão prolongada.',
            icon: 'Clock',
          },
          {
            label: 'Inguinal',
            detail: 'Referência FURB: inguinal 36 °C a 36,8 °C.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — axilar alta',
            detail: 'Letra A: teto 37,8 °C na norma axilar — confunde com corte febril.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — retal baixa',
            detail: 'Letra B: retal 36–36,2 °C — faixa muito estreita e baixa.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Leia o local antes do número',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: valor normal de temperatura segundo o local aferido.',
          'Testar A — axilar 36,5–37,8 °C: teto 37,8 °C é febre em muitas referências, não limite superior da norma → eliminar.',
          'Testar B — retal 36–36,2 °C: faixa retal normal costuma ser mais ampla (≈36,5–37,5 °C) → eliminar.',
          'Testar D — axilar 35,6–37,8 °C: piso baixo e teto febril — incoerente como “normal” → eliminar.',
          'Testar E — retal 37,2–38,2 °C: inclui valores febris — não é faixa de normotermia → eliminar.',
          'Testar C — inguinal 36–36,8 °C: única faixa coerente com normotermia inguinal → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'Inguinal 36–36,8 °C fecha letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — normais por via',
        meta: slideMeta,
        content: 'VIA + FAIXA NORMOTÉRMICA',
        rows: [
          { label: 'Inguinal', value: '36 °C a 36,8 °C', sv_kind: 'temp', badge: 'hot' },
          { label: 'Axilar típica', value: '≈36,0 a 37,5 °C', sv_kind: 'temp', badge: 'ok' },
          { label: 'Retal típica', value: '≈36,5 a 37,5 °C', sv_kind: 'temp', badge: 'ok' },
          { label: 'Febre axilar', value: '≥37,8 °C (maioria das bancas)', sv_kind: 'temp', badge: 'warn' },
        ],
        footer_rule: '37,8 °C axilar = febre, não teto normal',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FAIXAS FURB',
        items: [
          {
            label: 'Letra A — axilar 36,5–37,8 °C',
            detail: 'Temperatura axilar: de 36,5 ºC a 37,8 ºC.',
            correct:
              '37,8 °C axilar é corte de febre na maioria das referências — não limite superior da normotermia.',
          },
          {
            label: 'Letra B — retal 36–36,2 °C',
            detail: 'Temperatura retal: de 36 ºC a 36,2 ºC.',
            correct:
              'Faixa retal normal é mais ampla (≈36,5–37,5 °C) — 36,2 °C como teto subestima a norma.',
          },
          {
            label: 'Letra D — axilar 35,6–37,8 °C',
            detail: 'Temperatura axilar: de 35,6 ºC a 37,8 ºC.',
            correct:
              'Piso 35,6 °C já sugere hipotermia leve; teto 37,8 °C é febril — não descreve normotermia.',
          },
          {
            label: 'Letra E — retal 37,2–38,2 °C',
            detail: 'Temperatura retal: de 37,2 ºC a 38,2 ºC.',
            correct:
              'Valores ≥37,2 °C configuram elevação térmica — faixa não representa temperatura normal.',
          },
        ],
        footer_rule: 'Só C fecha inguinal 36–36,8 °C',
      },
    ],
  },

  'ibade-enfermagem-verificacao-de-sinais-vitais-1779343865210-7': {
    family: 'protocolo',
    guideline:
      'MS — termoplegia (golpe de calor) · temperatura corporal >40 °C · exposição ao calor extremo',
    roi_error: 'termoplegia_corte',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Termoplegia — calor extremo',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Termoplegia por exposição ao sol/calor — temperatura corporal acima de quanto?',
            icon: 'Target',
          },
          {
            label: 'Mecanismo',
            detail: 'Calor deprime hipotálamo — perda de calor falha.',
            icon: 'Sun',
          },
          {
            label: 'Termoplegia',
            detail: 'Hipertermia grave por ambiente — corte clássico >40 °C.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — febre comum',
            detail: 'Letras C e D (37–37,8 °C) são afebril/febre leve.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — hipotermia',
            detail: 'Letra A (35,8 °C) é queda térmica — oposto do quadro.',
            icon: 'Snowflake',
          },
        ],
        footer_rule: 'Termoplegia → >40 °C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: termoplegia definida como temperatura acima de…',
          'Contexto: exposição prolongada ao sol/ambiente quente.',
          'Testar A — 35,8 °C: hipotermia, não hipertermia → eliminar.',
          'Testar B — 36,8 °C: afebril → eliminar.',
          'Testar C — 37 °C e D — 37,8 °C: febre leve — distante de termoplegia → eliminar.',
          'Testar E — 40 °C: corte clássico de hipertermia grave/termoplegia → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Termoplegia ≠ febre de 37,8 °C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — calor extremo',
        meta: slideMeta,
        content: 'HIPERTERMIA POR AMBIENTE',
        rows: [
          { label: 'Termoplegia', value: 'Temperatura >40 °C', sv_kind: 'temp', badge: 'hot' },
          { label: 'Febre axilar', value: '≥37,8 °C', sv_kind: 'temp', badge: 'warn' },
          { label: 'Afebril', value: '≈36–37,5 °C', sv_kind: 'temp', badge: 'ok' },
          { label: 'Mecanismo', value: 'Falha de termorregulação por calor externo', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Calor ambiente + T>40 °C = emergência',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TERMOPLEGIA IBADE',
        items: [
          {
            label: 'Letra A — 35,8 °C',
            detail: '35,8 º.',
            correct:
              'Valor abaixo da normotermia — hipotermia leve, oposto da termoplegia por calor.',
          },
          {
            label: 'Letra B — 36,8 °C',
            detail: '36,8 º',
            correct:
              'Temperatura afebril — não configura hipertermia grave por exposição ao sol.',
          },
          {
            label: 'Letra C — 37 °C',
            detail: '37 º.',
            correct:
              'Febre leve/subfebril — distante do corte de 40 °C exigido para termoplegia.',
          },
          {
            label: 'Letra D — 37,8 °C',
            detail: '37,8 º.',
            correct:
              'Corte de febre axilar — ainda muito abaixo da hipertermia grave (>40 °C).',
          },
        ],
        footer_rule: 'Só E fecha >40 °C',
      },
    ],
  },

  'ibade-enfermagem-verificacao-de-sinais-vitais-1779344178184-6': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — retal mais próxima da temperatura central · oral e axilar periféricas · timpânica depende de técnica',
    roi_error: 'via_mais_precisa',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Precisão das vias térmicas',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Qual aferição de temperatura corporal é a mais precisa?',
            icon: 'Target',
          },
          {
            label: 'Via retal',
            detail: 'Mais próxima da temperatura central/core — padrão em muitas bancas.',
            icon: 'Thermometer',
          },
          {
            label: 'Axilar',
            detail: 'Mais usada no leito, porém mais afetada pelo ambiente.',
            icon: 'Activity',
          },
          {
            label: 'Timpânica',
            detail: 'Rápida — precisa de técnica e idade adequada.',
            icon: 'Ear',
          },
          {
            label: 'Pegadinha — “orgânica”',
            detail: 'Letra E inventa via inexistente na semiologia.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Mais precisa = mais central',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: aferição de temperatura mais precisa.',
          'Hierarquia clássica: central > periférica.',
          'Testar B — axilar: acessível, porém menos precisa → eliminar.',
          'Testar A — timpânica: útil, mas depende de técnica — não é a “mais precisa” na prova → eliminar.',
          'Testar D — oral: intermediária, influenciada por ingestão → eliminar.',
          'Testar E — orgânica: via inexistente → eliminar.',
          'Testar C — retal: mais próxima da central → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'Retal = referência de precisão na prova',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vias × precisão',
        meta: slideMeta,
        content: 'CENTRAL × PERIFÉRICA',
        rows: [
          { label: 'Retal', value: 'Mais próxima da central — mais precisa', sv_kind: 'temp', badge: 'hot' },
          { label: 'Oral', value: 'Intermediária — exige cooperação', sv_kind: 'temp', badge: 'ok' },
          { label: 'Axilar', value: 'Mais usada — menos precisa', sv_kind: 'temp', badge: 'warn' },
          { label: 'Timpânica', value: 'Rápida — técnica e idade importam', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'Registrar sempre a via utilizada',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRECISÃO IBADE',
        items: [
          {
            label: 'Letra A — timpânica',
            detail: 'Timpânica.',
            correct:
              'Via rápida e prática, mas a precisão depende de posicionamento — retal permanece referência central.',
          },
          {
            label: 'Letra B — axilar',
            detail: 'Axilar.',
            correct:
              'Mais comum no cotidiano, porém mais sujeita a variação ambiental — menos precisa que retal.',
          },
          {
            label: 'Letra D — oral',
            detail: 'Oral.',
            correct:
              'Influenciada por bebidas e respiração — não supera a leitura retal em precisão central.',
          },
          {
            label: 'Letra E — orgânica',
            detail: 'Orgânica.',
            correct:
              'Não existe via “orgânica” de temperatura na semiologia — distrator sem base técnica.',
          },
        ],
        footer_rule: 'Só C fecha retal',
      },
    ],
  },

  'idecan-enfermagem-verificacao-de-sinais-vitais-1780066924385-5': {
    family: 'vf',
    guideline:
      'MS — SV orientam decisão · 36,1–37,2 °C afebril (não hipotermia) · bradipneia = FR lenta · dispneia = esforço respiratório',
    roi_error: 'vf_sv_misto_temperatura_fr',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — SV e termos clínicos',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro afirmativas sobre SV — julgar V ou F e achar a sequência.',
            icon: 'Target',
          },
          {
            label: 'Papel dos SV',
            detail: 'Monitorização instrumentaliza decisões da equipe.',
            icon: 'Activity',
          },
          {
            label: '36,1–37,2 °C',
            detail: 'Faixa afebril/normotérmica — não é hipotermia.',
            icon: 'Thermometer',
          },
          {
            label: 'Pulso arterial/venoso',
            detail: 'Artéria reflete VE; veia jugular reflete VD — fisiologia avançada.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — bradipneia',
            detail: 'Bradipneia = FR lenta — não “respiração difícil”.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Não troque bradipneia por dispneia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sequência V/F em quatro afirmativas sobre SV.',
          'I — SV instrumentalizam decisão clínica: verdadeiro → V.',
          'II — 36,1 a 37,2 °C é hipotermia: falso — é faixa afebril → F.',
          'III — pulso arterial reflete VE e venoso reflete VD: afirmativa fisiológica → V.',
          'IV — bradipneia é respiração difícil/trabalhosa: falso — isso é dispneia; bradipneia é FR lenta → F.',
          'Sequência V – F – V – F → eliminar A, C, D.',
          'Marcar B.',
        ],
        footer_rule: 'Item II erra temperatura · IV erra FR',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — termos da questão',
        meta: slideMeta,
        content: 'NÚMERO E TERMO — NÃO INVERTA',
        rows: [
          { label: '36,1–37,2 °C', value: 'Afebril — não hipotermia', sv_kind: 'temp', badge: 'hot' },
          { label: 'Hipotermia', value: 'Abaixo do normal — ex. <35 °C grave', sv_kind: 'temp', badge: 'warn' },
          { label: 'Bradipneia', value: 'FR lenta (<12 irpm adulto)', sv_kind: 'fr', badge: 'ok' },
          { label: 'Dispneia', value: 'Respiração difícil/trabalhosa', sv_kind: 'fr', badge: 'warn' },
        ],
        footer_rule: 'Bradipneia ≠ dispneia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F IDECAN',
        items: [
          {
            label: 'Letra A — V, V, V, V',
            detail: 'V, V, V, V.',
            correct:
              'Aceita II (hipotermia em 36,1–37,2 °C) e IV (bradipneia = dispneia) — ambas falsas na semiologia.',
          },
          {
            label: 'Letra C — V, F, F, V',
            detail: 'V, F, F, V.',
            correct:
              'Marca III como falsa — pulso arterial/venoso e dinâmica ventricular é afirmativa verdadeira.',
          },
          {
            label: 'Letra D — F, F, V, F',
            detail: 'F, F, V, F.',
            correct:
              'Nega I (papel dos SV na decisão) — monitorização de SV é base da intervenção em enfermagem.',
          },
        ],
        footer_rule: 'Só B fecha V – F – V – F',
      },
    ],
  },

  'instituto-access-enfermagem-verificacao-de-sinais-vitais-1779343789998-0': {
    family: 'protocolo',
    guideline:
      'MS — oral sublingual · retal indicada em lactentes · axilar mais usada e menos precisa · retal sem lavagem prévia obrigatória',
    roi_error: 'tecnica_vias_oral_axilar_retal',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica — oral · axilar · retal',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Afirmativa correta sobre aferição em boca, reto e axila.',
            icon: 'Target',
          },
          {
            label: 'Axilar',
            detail: 'Via mais verificada no Brasil — leitura periférica, menos precisa.',
            icon: 'Thermometer',
          },
          {
            label: 'Oral',
            detail: 'Ponta sublingual — não na bochecha.',
            icon: 'Activity',
          },
          {
            label: 'Retal pediátrica',
            detail: 'Indicada em bebês quando axilar é insuficiente.',
            icon: 'Baby',
          },
          {
            label: 'Pegadinha — lavagem retal',
            detail: 'Letra D exige lavagem — não é requisito clássico.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Axilar = comum, porém imprecisa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa correta sobre as três vias citadas.',
          'Testar A — oral na bochecha: técnica errada — sublingual → eliminar.',
          'Testar B — não recomendar retal em bebês: falso — retal é opção em lactentes → eliminar.',
          'Testar D — lavagem obrigatória do reto: não é passo clássico da técnica → eliminar.',
          'Testar C — axilar mais verificada e menos precisa: afirmativa verdadeira → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'C = axilar comum × imprecisa',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — três vias Access',
        meta: slideMeta,
        content: 'TÉCNICA × PRECISÃO',
        rows: [
          { label: 'Axilar', value: 'Mais usada · menos precisa', sv_kind: 'temp', badge: 'hot' },
          { label: 'Oral', value: 'Ponta sublingual — paciente cooperativo', sv_kind: 'temp', badge: 'ok' },
          { label: 'Retal', value: 'Útil em lactentes — sem lavagem prévia obrigatória', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'Oral ≠ bochecha',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VIAS ACCESS',
        items: [
          {
            label: 'Letra A — oral na bochecha',
            detail:
              'Para aferição da temperatura oral, coloca-se o termômetro com a ponta medidora em contato com a parte interna da bochecha.',
            correct:
              'Via oral exige ponta sublingual sob a língua — bochecha não reflete temperatura central.',
          },
          {
            label: 'Letra B — retal contraindicada em bebês',
            detail: 'Não se recomenda aferição da temperatura retal em bebês.',
            correct:
              'Retal é justamente indicada em lactentes quando axilar é duvidosa — afirmativa inverte a prática.',
          },
          {
            label: 'Letra D — lavagem do reto',
            detail:
              'Para a verificação da temperatura retal, é necessário proceder à lavagem do reto.',
            correct:
              'Higiene local sim, mas “lavagem do reto” como requisito obrigatório não é passo clássico da técnica.',
          },
        ],
        footer_rule: 'Só C descreve axilar corretamente',
      },
    ],
  },

  'instituto-consulpam-enfermagem-verificacao-de-sinais-vitais-1779343865210-1': {
    family: 'conceito',
    guideline:
      'MS/COFEN — dor mensurável (escala 0–10) · febre/inflamação ≠ hipotermia · SV conforme prescrição e risco clínico',
    roi_error: 'hipotermia_vs_infeccao_dor_escala',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV — dor, temperatura e rotina',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Alternativa correta sobre sinais vitais e monitorização.',
            icon: 'Target',
          },
          {
            label: 'Dor como SV',
            detail: 'Quinto sinal vital — quantificável por escalas 0–10.',
            icon: 'Activity',
          },
          {
            label: 'Hipotermia',
            detail: 'Queda térmica — não “sempre” com infecção (isso é febre).',
            icon: 'Snowflake',
          },
          {
            label: 'Frequência de aferição',
            detail: 'SV seguem prescrição e gravidade — não só rotina fixa.',
            icon: 'ClipboardList',
          },
          {
            label: 'Pegadinha — inversão térmica',
            detail: 'Letra C associa hipotermia a processo infeccioso.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Infecção → febre, não hipotermia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa CORRETA sobre sinais vitais.',
          'Testar A — SV só na rotina diária sem prescrição: falso — frequência depende de risco e ordem médica → eliminar.',
          'Testar C — hipotermia sempre com infecção: inverte fisiologia — infecção cursa com febre → eliminar.',
          'Testar D — dor não mensurável: falso — escalas validadas existem → eliminar.',
          'Testar B — dor mensurada por escala analógica 0–10: afirmativa correta → candidata.',
          'Marcar B.',
        ],
        footer_rule: 'B = escala de dor 0–10',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — dor e temperatura',
        meta: slideMeta,
        content: 'SINAL VITAL × MENSURAÇÃO',
        rows: [
          { label: 'Dor', value: 'Escala analógica 0–10 (EVA)', sv_kind: 'meta', badge: 'hot' },
          { label: 'Febre', value: 'Infecção/inflamação — temperatura elevada', sv_kind: 'temp', badge: 'warn' },
          { label: 'Hipotermia', value: 'Temperatura baixa — não sinônimo de infecção', sv_kind: 'temp', badge: 'ok' },
          { label: 'Monitorização', value: 'Conforme prescrição e estado clínico', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Hipotermia ≠ “sempre” infecção',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SV CONSULPAM',
        items: [
          {
            label: 'Letra A — só rotina diária',
            detail:
              'Os sinais vitais somente devem ser mensurados na rotina diária da independentemente de prescrição e no pré e pós-instituição de saúde, operatório.',
            correct:
              'Frequência de SV depende de prescrição, risco e intercorrências — não é exclusiva da rotina diária.',
          },
          {
            label: 'Letra C — hipotermia e infecção',
            detail:
              'A hipotermia sempre é acompanhada de processos infecciosos e inflamatórios, devendo o profissional mensurar a temperatura corporal para detectar alterações o mais precocemente possível.',
            correct:
              'Processo infeccioso cursa com febre (elevação) — hipotermia é queda térmica, não “sempre” com infecção.',
          },
          {
            label: 'Letra D — dor não mensurável',
            detail:
              'A dor não é considerada um sinal que indica as condições de saúde do paciente, pois não se pode medi-la.',
            correct:
              'Dor é quinto sinal vital e é quantificada por escalas validadas (ex.: analógica 0–10).',
          },
        ],
        footer_rule: 'Só B fecha escala de dor',
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
      meta: metaBase(raw, pack, slug),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sv-g41] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g41] total=${ok}`);
}

main();
