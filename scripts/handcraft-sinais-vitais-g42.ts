#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g42 (8 slugs P1 vitals_temperatura batch 4).
 * Cluster Temperatura — vias e febre (33 slugs — g42=8, g43=1 restante).
 *
 *   npm run handcraft:sinais-vitais-g42
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g42';
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
    'vias axilar · oral · retal · timpânica',
    'afebril · febre · hiperpirexia · hipotermia',
    'técnica oral sublingual · contraindicações',
    'técnica retal — Sims · profundidade por idade',
    'axilar 36–37,4 °C afebril · digital 2–3 min',
    'curvas febris — contínua · intermitente · reincidente',
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
  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779344122526-3': {
    family: 'vf',
    guideline:
      'MS/COFEN — oral sublingual · contraindicar oral em inconsciente/delírio/lesão oral · retal com luvas, Sims, profundidade 1/2/4 cm',
    roi_error: 'tecnica_vias_oral_retal',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — técnica oral e retal',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Três afirmativas V/F: técnica oral, contraindicações da via oral e passos da via retal.',
            icon: 'Target',
          },
          {
            label: 'Via oral',
            detail: 'Termômetro sob a língua, boca fechada, uso individual.',
            icon: 'Thermometer',
          },
          {
            label: 'Contraindicações oral',
            detail:
              'Delírio, inconsciência, lesões orais, vias aéreas e criança após alimento gelado/quente.',
            icon: 'Ban',
          },
          {
            label: 'Via retal',
            detail:
              'Luvas · Sims · lubrificar · 1 cm lactente · 2 cm criança · 4 cm adulto · uso individual.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — marcar F',
            detail: 'Banca troca profundidade retal ou contraindicação oral.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'As três afirmativas são verdadeiras',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: julgar três afirmativas sobre temperatura oral e retal.',
          'I — oral sublingual, boca fechada, termômetro individual: técnica correta → V.',
          'II — contraindicar oral em delírio/inconsciente/lesão oral/criança pós-alimento: verdadeiro → V.',
          'III — retal com luvas, Sims, lubrificação e profundidades 1/2/4 cm: técnica clássica → V.',
          'Sequência V – V – V → eliminar A, B e C.',
          'Marcar D.',
        ],
        footer_rule: 'Três V consecutivas → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — oral × retal',
        meta: slideMeta,
        content: 'TÉCNICA POR VIA',
        rows: [
          { label: 'Oral', value: 'Sublingual · boca fechada · individual', sv_kind: 'temp', badge: 'ok' },
          {
            label: 'Não usar oral',
            value: 'Inconsciente · delírio · lesão oral · pós-alimento quente/frio',
            sv_kind: 'temp',
            badge: 'warn',
          },
          { label: 'Retal — lactente', value: '≈1 cm · direção umbigo', sv_kind: 'temp', badge: 'ok' },
          { label: 'Retal — adulto', value: '≈4 cm · decúbito lateral (Sims)', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'Termômetro individual em todas as vias invasivas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F CONSULPLAN ORAL/RETAL',
        items: [
          {
            label: 'Letra A — F, F, F',
            detail: 'F, F, F.',
            correct:
              'Nega as três técnicas corretas — oral, contraindicação e retal estão todas certas na referência.',
          },
          {
            label: 'Letra B — F, V, F',
            detail: 'F, V, F.',
            correct:
              'Marca oral e retal como falsas — ambas descrevem passos válidos de aferição.',
          },
          {
            label: 'Letra C — V, F, V',
            detail: 'V, F, V.',
            correct:
              'Nega a contraindicação da via oral — delírio e inconsciência são contraindicações clássicas.',
          },
        ],
        footer_rule: 'Só D fecha V – V – V',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779344224014-7': {
    family: 'vf',
    guideline:
      'MS — hipertermia infecciosa · pulso radial (não ulnar) · dispneia = esforço respiratório · normotermia 36,1–37,2 °C · hiperpirexia >40 °C',
    roi_error: 'vf_sv_misto_temperatura_fc_fr',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'I–IV — SV e termos clínicos',
        meta: slideMeta,
        items: [
          {
            label: 'Funções vitais',
            detail:
              'Sinais vitais indicam desempenho das funções vitais — padrões basais, diagnóstico e evolução clínica.',
            icon: 'Activity',
          },
          {
            label: 'I — hipertermia',
            detail:
              'Hipertermia relacionada a doenças infecciosas e traumas; em crianças pode ocasionar convulsão.',
            icon: 'Flame',
          },
          {
            label: 'II — frequência cardíaca',
            detail:
              'Enunciado cita artéria ulnar no pulso — técnica clássica de rotina é palpar artéria radial.',
            icon: 'HeartPulse',
          },
          {
            label: 'III — frequência respiratória',
            detail:
              'Dispneia: respiração difícil, trabalhosa ou curta — comum em doenças pulmonares e cardíacas.',
            icon: 'Wind',
          },
          {
            label: 'IV — temperatura corporal',
            detail:
              'Normal 36,1–37,2 °C no adulto; estado febril acima de 40 °C classifica hiperpirexia.',
            icon: 'Thermometer',
          },
        ],
        footer_rule: 'Item II erra artéria ulnar no pulso',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sobre sinais vitais e funções orgânicas — julgar I–IV (texto ABC.med.br).',
          'I — hipertermia com doenças infecciosas/traumas e convulsão em crianças: verdadeiro → manter.',
          'II — frequência cardíaca na artéria ulnar do pulso: falso — palpação de rotina é radial → descartar II.',
          'III — dispneia como respiração difícil/trabalhosa em doenças pulmonares e cardíacas: verdadeiro → manter.',
          'IV — temperatura corporal normal 36,1–37,2 °C; hiperpirexia acima de 40 °C: verdadeiro → manter.',
          'Combinação I + III + IV — monitorar resposta ao tratamento sem incluir II.',
          'Eliminar A (I e II), B (III e IV) e C (I, II e III).',
          'Marcar D.',
        ],
        footer_rule: 'Radial no pulso — não ulnar',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — itens da prova',
        meta: slideMeta,
        content: 'TERMOS × DEFINIÇÃO',
        rows: [
          { label: 'Pulso de rotina', value: 'Artéria radial no punho', sv_kind: 'fc', badge: 'hot' },
          { label: 'Dispneia', value: 'Respiração difícil ou trabalhosa', sv_kind: 'fr', badge: 'ok' },
          { label: 'Normotermia', value: '36,1 a 37,2 °C (texto da prova)', sv_kind: 'temp', badge: 'ok' },
          { label: 'Hiperpirexia', value: '>40 °C (texto da prova)', sv_kind: 'temp', badge: 'warn' },
        ],
        footer_rule: 'Ulnar ≠ pulso de rotina',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — I–IV CONSULPLAN',
        items: [
          {
            label: 'Letra A — I e II',
            detail: 'I e II.',
            correct:
              'Inclui II — aferição de FC de rotina usa artéria radial, não ulnar no pulso.',
          },
          {
            label: 'Letra B — III e IV',
            detail: 'III e IV.',
            correct:
              'Omite I (hipertermia infecciosa) — afirmativa verdadeira sobre febre e convulsão infantil.',
          },
          {
            label: 'Letra C — I, II e III',
            detail: 'I, II e III.',
            correct:
              'Mantém II com artéria ulnar — erro técnico que invalida a combinação.',
          },
        ],
        footer_rule: 'Só D exclui o item II',
      },
    ],
  },

  'instituto-jk-enfermagem-verificacao-de-sinais-vitais-1779343822075-8': {
    family: 'conceito',
    guideline: 'MS/COFEN — pulso periférico = palpação manual dos batimentos cardíacos por 60 segundos',
    roi_error: 'definicao_pulso_periferico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pulso periférico — definição',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Definição correta de Pulso Periférico (P ou FP).',
            icon: 'Target',
          },
          {
            label: 'Pulso periférico',
            detail: 'Contagem manual dos batimentos cardíacos em 1 minuto.',
            icon: 'HeartPulse',
          },
          {
            label: 'Não é PA',
            detail: 'Pressão nas paredes arteriais = pressão arterial.',
            icon: 'Gauge',
          },
          {
            label: 'Não é FR',
            detail: 'Respirações por minuto = frequência respiratória.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — mistura',
            detail: 'Letra D junta batimentos com temperatura axilar.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'FP = batimentos/min manualmente',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: o que é verificação do pulso periférico.',
          'Testar A — pressão nas artérias: define PA, não pulso → eliminar.',
          'Testar B — respirações/min: define FR → eliminar.',
          'Testar D — batimentos + temperatura axilar: mistura dois SV → eliminar.',
          'Testar C — batimentos cardíacos manualmente em 1 minuto: definição clássica → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'C = contagem manual da FC',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — pulso × outros SV',
        meta: slideMeta,
        content: 'NÃO CONFUNDA PARÂMETROS',
        rows: [
          { label: 'Pulso periférico', value: 'Palpação manual · contagem 60 s', sv_kind: 'fc', badge: 'hot' },
          { label: 'Pressão arterial', value: 'Pressão do sangue na artéria', sv_kind: 'pa', badge: 'ok' },
          { label: 'Frequência respiratória', value: 'Ciclos respiratórios/min', sv_kind: 'fr', badge: 'ok' },
          { label: 'Temperatura axilar', value: 'Parâmetro térmico — outro SV', sv_kind: 'temp', badge: 'warn' },
        ],
        footer_rule: 'Cada SV tem definição própria',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEFINIÇÃO JK',
        items: [
          {
            label: 'Letra A — pressão arterial',
            detail: 'Medida da pressão exercida pelo sangue nas paredes das artérias.',
            correct:
              'Descreve pressão arterial (PA) — pulso periférico é contagem dos batimentos, não pressão.',
          },
          {
            label: 'Letra B — frequência respiratória',
            detail: 'Mensuração do número de respirações em um minuto.',
            correct:
              'Respirações por minuto definem FR — pulso periférico conta batimentos cardíacos.',
          },
          {
            label: 'Letra D — batimentos + temperatura',
            detail: 'Mensuração e registro dos batimentos e temperatura axilar do paciente.',
            correct:
              'Mistura FC com temperatura — pulso periférico isoladamente é palpação/contagem dos batimentos.',
          },
        ],
        footer_rule: 'Só C define pulso periférico',
      },
    ],
  },

  'metrocapital-enfermagem-verificacao-de-sinais-vitais-1779344127707-0': {
    family: 'protocolo',
    guideline: 'MS — afebril axilar 36,0 a 37,4 °C · febre axilar ≥37,8 °C',
    exam_vs_current: 'exam_axilar_36_37_4 — gabarito Metrocapital marca 36–37,4 °C',
    roi_error: 'faixa_afebril_axilar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Afebril — faixa axilar',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Intervalo de temperatura axilar considerado afebril.',
            icon: 'Target',
          },
          {
            label: 'Afebril axilar',
            detail: 'Gabarito Metrocapital: 36,0 a 37,4 °C.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — piso baixo',
            detail: 'Letra A e D começam em 35 °C — sugere hipotermia leve.',
            icon: 'Snowflake',
          },
          {
            label: 'Pegadinha — teto febril',
            detail: 'Letra D vai até 37,8 °C — corte de febre, não norma.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — faixa estreita',
            detail: 'Letra B: 36,5–37,0 °C — intervalo curto demais.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '36–37,4 °C = afebril nesta banca',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: faixa axilar afebril.',
          'Testar A — 35–37,5 °C: piso 35 °C é baixo para normotermia → eliminar.',
          'Testar B — 36,5–37 °C: faixa estreita — não é a alternativa da banca → eliminar.',
          'Testar D — 35–37,8 °C: inclui hipotermia leve e febre no teto → eliminar.',
          'Testar E — 36,5–37,5 °C: próxima, mas gabarito é 36–37,4 °C → eliminar.',
          'Testar C — 36–37,4 °C: coincide com gabarito → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'C = 36 a 37,4 °C axilar',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — normotermia axilar',
        meta: slideMeta,
        content: 'AFEBRIL × FEBRIL',
        rows: [
          { label: 'Normotermia axilar', value: '36,0 a 37,4 °C afebril', sv_kind: 'temp', badge: 'hot' },
          { label: 'Febre axilar', value: '≥37,8 °C (maioria das bancas)', sv_kind: 'temp', badge: 'warn' },
          { label: 'Hipotermia leve', value: '≈32–35 °C', sv_kind: 'temp', badge: 'ok' },
          { label: 'Subfebril', value: '37,3–37,7 °C (algumas fontes)', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: '37,8 °C já é febre — não teto afebril',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FAIXAS METROCAPITAL',
        items: [
          {
            label: 'Letra A — 35–37,5 °C',
            detail: '35°C e 37,5°C.',
            correct:
              'Piso 35 °C inclui hipotermia leve — normotermia axilar começa em torno de 36 °C.',
          },
          {
            label: 'Letra B — 36,5–37 °C',
            detail: '36, 5°C e 37°C.',
            correct:
              'Faixa muito estreita — a banca marca 36,0 a 37,4 °C como afebril.',
          },
          {
            label: 'Letra D — 35–37,8 °C',
            detail: '35°C e 37,8°C.',
            correct:
              'Teto 37,8 °C é corte de febre axilar — não limite superior da normotermia.',
          },
          {
            label: 'Letra E — 36,5–37,5 °C',
            detail: '36,5°C e 37,5°C.',
            correct:
              'Piso 36,5 °C exclui valores afebris entre 36,0 e 36,4 °C — gabarito inicia em 36 °C.',
          },
        ],
        footer_rule: 'Só C fecha 36–37,4 °C',
      },
    ],
  },

  'objetiva-concursos-enfermagem-verificacao-de-sinais-vitais-1779344122526-1': {
    family: 'vf',
    guideline:
      'MS — vias axilar/bucal/retal · processos infecciosos/inflamatórios elevam temperatura · choque e depressores SNC reduzem',
    roi_error: 'fatores_patologicos_temperatura',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'I–III — fatores e vias térmicas',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Três itens sobre vias de aferição e fatores que alteram temperatura.',
            icon: 'Target',
          },
          {
            label: 'I — vias',
            detail: 'Axilar, bucal e retal são locais clássicos de aferição.',
            icon: 'Thermometer',
          },
          {
            label: 'II — pegadinha',
            detail: 'Inflamatórios/infecciosos aumentam — não diminuem — a temperatura.',
            icon: 'Flame',
          },
          {
            label: 'III — pegadinha',
            detail: 'Choque e depressores do SNC reduzem — não elevam — a temperatura.',
            icon: 'TrendingDown',
          },
          {
            label: 'Só item I',
            detail: 'Apenas as vias axilar, bucal e retal estão corretas — II e III invertem efeito térmico.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: 'II e III invertem efeito térmico',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: julgar I–III sobre temperatura corporal (MOTTA).',
          'I — vias axilar, bucal e retal: locais válidos de aferição → verdadeiro.',
          'II — inflamatórios/infecciosos diminuem temperatura: falso — elevam (febre) → eliminar combinações com II.',
          'III — choque/depressores SNC aumentam temperatura: falso — tendem a reduzir → eliminar combinações com III.',
          'Somente I correto → eliminar B, C e D.',
          'Marcar A.',
        ],
        footer_rule: 'A = somente item I',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — fatores térmicos',
        meta: slideMeta,
        content: 'O QUE SOBE × O QUE DESCE',
        rows: [
          { label: 'Vias clássicas', value: 'Axilar · bucal · retal', sv_kind: 'temp', badge: 'ok' },
          { label: 'Eleva temperatura', value: 'Infecção · inflamação · exercício', sv_kind: 'temp', badge: 'hot' },
          { label: 'Reduz temperatura', value: 'Choque · depressores SNC · hipotermia', sv_kind: 'temp', badge: 'warn' },
        ],
        footer_rule: 'Febre = elevação — não queda',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — I–III OBJETIVA',
        items: [
          {
            label: 'Letra B — somente II',
            detail: 'Somente o item II.',
            correct:
              'Item II inverte fisiologia — processos infecciosos cursam com elevação térmica, não hipotermia.',
          },
          {
            label: 'Letra C — I e III',
            detail: 'Somente os itens I e III.',
            correct:
              'Item III erra: choque e drogas depressoras do SNC reduzem temperatura corporal.',
          },
          {
            label: 'Letra D — todos',
            detail: 'Todos os itens.',
            correct:
              'Aceita II e III falsos — inflamação não baixa temperatura e choque não a eleva.',
          },
        ],
        footer_rule: 'Só A isola o item I',
      },
    ],
  },

  'selecon-enfermagem-verificacao-de-sinais-vitais-1779344111854-1': {
    family: 'protocolo',
    guideline: 'MS/COFEN — vias de temperatura: oral · retal · axilar · timpânica',
    roi_error: 'vias_afericao_temperatura',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vias de aferição térmica',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Regiões válidas para aferição da temperatura corporal.',
            icon: 'Target',
          },
          {
            label: 'Quatro vias clássicas',
            detail: 'Oral · retal · axilar · timpânica.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — mamilar',
            detail: 'Letras B e D citam mamilar — não é via de rotina.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — pediosa',
            detail: 'Letra C inventa sítios não usuais (pediosa, escapular).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — glabelar',
            detail: 'Letra D mistura “central” com locais não padronizados.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Oral · retal · axilar · timpânica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: regiões de aferição da temperatura.',
          'Testar B — sublingual/mamilar: mamilar não é via clássica → eliminar.',
          'Testar C — pediosa/escapular/esofagiana: sítios atípicos na prova → eliminar.',
          'Testar D — central/glabelar/mamilar: combinação inválida → eliminar.',
          'Testar A — oral, retal, axilar e timpânica: quatro vias padrão → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'A = quartet clássico',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vias Selecon',
        meta: slideMeta,
        content: 'VIAS PADRÃO EM PROVA',
        rows: [
          { label: 'Oral', value: 'Cooperativo · sublingual', sv_kind: 'temp', badge: 'ok' },
          { label: 'Axilar', value: 'Mais usada no Brasil', sv_kind: 'temp', badge: 'ok' },
          { label: 'Retal', value: 'Central · pediatria', sv_kind: 'temp', badge: 'ok' },
          { label: 'Timpânica', value: 'Rápida · canal auditivo', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'Mamilar e glabelar não são vias de SV',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VIAS SELECON',
        items: [
          {
            label: 'Letra B — mamilar',
            detail: 'oral, sublingual, mamilar e retal',
            correct:
              'Mamilar não é local de aferição de temperatura em semiologia de enfermagem.',
          },
          {
            label: 'Letra C — pediosa',
            detail: 'retal, pediosa, escapular e esofagiana',
            correct:
              'Pediosa e escapular não compõem o quartet oral/axilar/retal/timpânica cobrado em prova.',
          },
          {
            label: 'Letra D — glabelar',
            detail: 'central, glabelar, timpânica e mamilar',
            correct:
              '“Central” não é via nominal — glabelar e mamilar são distratores sem base na técnica.',
          },
        ],
        footer_rule: 'Só A lista as quatro vias corretas',
      },
    ],
  },

  'unesc-enfermagem-verificacao-de-sinais-vitais-1778969745165-5': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — axilar: secar região · termômetro digital 2–3 min · evitar umidade na pele',
    exam_vs_current: 'exam_axilar_digital_2_3min — prova Unesc marca 2 a 3 minutos com termômetro digital',
    roi_error: 'tecnica_axilar_digital',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica axilar — termômetro digital',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Alternativa correta sobre medição da temperatura axilar.',
            icon: 'Target',
          },
          {
            label: 'Secar a axila',
            detail: 'Umidade altera condução térmica — secar antes.',
            icon: 'Droplets',
          },
          {
            label: 'Tempo digital',
            detail: '2 a 3 minutos para leitura confiável.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha — 30 s',
            detail: 'Letra A: mercúrio 30 s — tempo insuficiente.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — umidade',
            detail: 'Letra E: não secar “melhora contato” — erro técnico.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Secar + 2–3 min digital',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: técnica correta da temperatura axilar.',
          'Testar A — mercúrio 30 s: tempo curto demais → eliminar.',
          'Testar B — hiperidrose dispensa calibração: falso → eliminar.',
          'Testar C — infravermelho sem contato axilar: técnica distinta → eliminar.',
          'Testar E — não secar melhora precisão: umidade distorce → eliminar.',
          'Testar D — digital 2–3 min após secar: técnica correta → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'D = secar + 2–3 min',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — axilar Unesc',
        meta: slideMeta,
        content: 'PASSOS DA AXILAR',
        rows: [
          { label: 'Temperatura axilar — preparo', value: 'Secar axila · termômetro limpo', sv_kind: 'temp', badge: 'ok' },
          { label: 'Temperatura axilar — posição', value: 'Centro da axila · braço aduzido', sv_kind: 'temp', badge: 'ok' },
          { label: 'Temperatura axilar — digital', value: 'Manter 2 a 3 min após secar', sv_kind: 'temp', badge: 'hot' },
          { label: 'Registro clínico', value: 'Anotar valor + hora + via', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Umidade = leitura falsamente baixa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AXILAR UNESC',
        items: [
          {
            label: 'Letra A — mercúrio 30 s',
            detail: 'Medir a temperatura axilar com termômetro de mercúrio por 30 segundos é suficiente.',
            correct:
              'Axilar exige imersão prolongada — 30 s é insuficiente; digital costuma precisar 2–3 min.',
          },
          {
            label: 'Letra B — hiperidrose',
            detail: 'Medir em pacientes com hiperidrose elimina a necessidade de calibração do termômetro.',
            correct:
              'Sudorese excessiva exige técnica rigorosa e equipamento calibrado — não dispensa calibração.',
          },
          {
            label: 'Letra C — infravermelho',
            detail: 'Medir com termômetro infravermelho dispensa o contato com a pele, mantendo a precisão.',
            correct:
              'Termômetro infravermelho sem contato mede superfície — não substitui técnica axilar de contato.',
          },
          {
            label: 'Letra E — não secar',
            detail: 'Medir sem secar a região garante maior precisão, pois a umidade melhora o contato.',
            correct:
              'Umidade na axila reduz precisão por evaporação — secar a pele antes da aferição.',
          },
        ],
        footer_rule: 'Só D descreve técnica axilar',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779343897104-0': {
    family: 'conceito',
    guideline:
      'MS — febre reincidente: episódios febris e afebris com períodos frequentemente >24 h · não confundir com contínua/intermitente/remitente',
    exam_vs_current:
      'exam_febre_reincidente_24h — enunciado VUNESP define reincidente com períodos >24 horas',
    roi_error: 'curvas_febreis_termos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Curvas febris — termos VUNESP',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Completar definição correta de padrão febril (hipertermia…).',
            icon: 'Target',
          },
          {
            label: 'Reincidente (gabarito)',
            detail: 'Episódios febris e afebris com períodos >24 h.',
            icon: 'RefreshCw',
          },
          {
            label: 'Pegadinha — remitente',
            detail: 'Letra A descreve platô contínuo — é febre contínua.',
            icon: 'Flame',
          },
          {
            label: 'Pegadinha — sustentada',
            detail: 'Letra B descreve alternância com normal — é intermitente.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — intermitente',
            detail: 'Letra D nega retorno ao normal — inverte definição.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Reincidente = ciclos longos (>24 h)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: termo classificatório correto para padrão febril descrito.',
          'Testar A — “remitente” contínua >38 °C: define febre contínua, não remitente → eliminar.',
          'Testar B — “sustentada” com retorno em 24 h: padrão intermitente → eliminar.',
          'Testar D — “intermitente” sem retorno ao normal: inverte conceito → eliminar.',
          'Testar E — “maligna” ≥39 °C retal: corte e termo inadequados → eliminar.',
          'Testar C — “reincidente” com períodos >24 h: definição literal da banca → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'C = febre reincidente',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — padrões febris',
        meta: slideMeta,
        content: 'CURVAS FEBRIS — NÃO TROQUE',
        rows: [
          { label: 'Contínua', value: 'Sempre febril · oscila ≤1 °C', sv_kind: 'temp', badge: 'ok' },
          { label: 'Intermitente', value: 'Picos com retorno afebril em 24 h', sv_kind: 'temp', badge: 'ok' },
          { label: 'Remitente', value: 'Queda >1 °C sem normalizar', sv_kind: 'temp', badge: 'ok' },
          { label: 'Reincidente', value: 'Episódios febris/afebris >24 h', sv_kind: 'temp', badge: 'hot' },
        ],
        footer_rule: 'Leia o tempo do ciclo (24 h)',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CURVAS VUNESP',
        items: [
          {
            label: 'Letra A — remitente',
            detail:
              'remitente", quando a temperatura corporal é constante, continuamente acima de 38 ºC e com pouca flutuação.',
            correct:
              'Descrição é de febre contínua (platô febril) — remitente cai parcialmente sem voltar à normotermia.',
          },
          {
            label: 'Letra B — sustentada',
            detail:
              'sustentada", quando ocorrem picos de febre intercalados com temperatura em níveis usuais, e a temperatura retorna a um valor aceitável pelo menos uma vez em 24 horas.',
            correct:
              'Picos com retorno afebril em 24 h define febre intermitente — não “sustentada”.',
          },
          {
            label: 'Letra D — intermitente',
            detail:
              'intermitente", quando picos e quedas de febre se sucedem, sem retorno à temperatura normal.',
            correct:
              'Intermitente classicamente alterna febre e normotermia — “sem retorno ao normal” inverte o conceito.',
          },
          {
            label: 'Letra E — maligna',
            detail: 'maligna", quando a temperatura retal atinge valor maior ou igual a 39 ºC.',
            correct:
              'Febre maligna/hiperpirexia usa cortes mais altos (≥41 °C em muitas fontes) — 39 °C não fecha o termo.',
          },
        ],
        footer_rule: 'Só C define reincidente',
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
    console.log(`[handcraft:sv-g42] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g42] total=${ok}`);
}

main();
