#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g36 (vitals_vf_faixas SHORT LOTE: 9 slugs).
 * Fecha cluster V/F — faixas de referência (I/II/III).
 *
 *   npm run handcraft:sinais-vitais-g36
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g36';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN / SBC',
  title: 'Faixas de sinais vitais — repouso (adulto)',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'FC adulto 60–100 bpm',
    'FR adulto 12–20 irpm',
    'PA — manguito · calibração · débito cardíaco',
    'temperatura — vias · hipertermia',
    '5º e 6º sinais vitais — dor · SpO₂',
    'V/F I–IV — técnica e faixas normativas',
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
  family: 'vf' | 'protocolo';
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
    pedagogical_branch: 'vitals_vf_faixas',
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
  'avancasp-enfermagem-verificacao-de-sinais-vitais-1778969729218-7': {
    family: 'vf',
    guideline:
      'MS/COFEN — dor como 5º sinal vital · FC 60–100 bpm · pulso com indicador e médio (não polegar) · calibrar esfigmomanômetro · cuidados na hipertermia',
    roi_error: 'polegar_no_pulso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — dor, FC, PA e temperatura',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Quatro afirmativas sobre SV — julgar I–IV e combinar (AVANÇASP Caieiras).',
            icon: 'Target',
          },
          {
            label: '5º sinal vital — dor',
            detail:
              'Item I: dor como experiência subjetiva integra avaliação vital contemporânea.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — polegar no pulso',
            detail:
              'Item II: polegar tem pulsação própria — técnica incorreta para FC.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — calibração PA',
            detail:
              'Item III: relógio do esfigmomanômetro fixo e ponteiro no zero — conduta correta.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha — hipertermia',
            detail:
              'Item IV: retirar cobertores, ventilar e compressas frias com uma axila livre para reaferir.',
            icon: 'Thermometer',
          },
        ],
        footer_rule: 'Polegar no pulso = item II falso — única quebra na sequência',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: quatro itens (I–IV) sobre técnica e conceitos de SV.',
          'Julgar I — dor como sinal vital subjetivo → V.',
          'Julgar II — pulso com polegar → F (usar indicador e médio).',
          'Julgar III — esfigmomanômetro calibrado no zero → V.',
          'Julgar IV — cuidados na hipertermia persistente → V.',
          'Sequência: V, F, V, V — exclui II.',
          'Eliminar A (inclui II), B (inclui II), D (inclui II), E (inclui II).',
          'Marcar C — I, III e IV apenas.',
        ],
        footer_rule: 'Só C fecha V,F,V,V',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas e técnica SV',
        meta: slideMeta,
        content: 'DECORE — FAIXAS E TÉCNICA DE ROTINA',
        rows: [
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR adulto', value: '12 a 20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Pulso radial', value: 'Indicador e médio — 60 s', sv_kind: 'fc', badge: 'hot' },
          { label: 'Polegar', value: 'Não palpar pulso — pulsação própria', sv_kind: 'meta', badge: 'warn' },
          { label: 'PA — esfigmomanômetro', value: 'Calibrado · ponteiro no zero', sv_kind: 'pa', badge: 'ok' },
          { label: 'Temperatura axilar', value: '36 °C a 37,5 °C afebril', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'Técnica + faixa normativa — gabarito só no logic_flow',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F AVANÇASP I–IV',
        items: [
          {
            label: 'Letra A — inclui item II',
            detail: 'Combinação I, II, III e IV aceita polegar no pulso.',
            correct:
              'Item II é falso — polegar contamina a palpação; use indicador e médio no pulso radial.',
          },
          {
            label: 'Letra B — inclui item II',
            detail: 'Sequência II, III e IV mantém o erro do polegar.',
            correct:
              'II falso invalida qualquer alternativa que o inclua — técnica MS usa dedos indicador e médio.',
          },
          {
            label: 'Letra D — inclui item II',
            detail: 'I, II e IV trata polegar como conduta correta.',
            correct:
              'Palpar com polegar é erro clássico de prova — gabarito exclui II (letra C).',
          },
          {
            label: 'Letra E — inclui item II',
            detail: 'I, II e III reintroduz polegar como preferencial.',
            correct:
              'Única sequência sem II: I, III e IV — letra C.',
          },
        ],
        footer_rule: 'Polegar = II falso → letra C',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1778969729218-8': {
    family: 'vf',
    guideline:
      'MS/COFEN — aferir SV na internação · visita domiciliar · rotina hospitalar · antes/durante/após medicações que afetam cardio/resp/temp · transfusão: monitorar antes, durante e após',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — quando aferir sinais vitais',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Cinco itens sobre momentos de aferição de SV — AVANÇASP.',
            icon: 'Target',
          },
          {
            label: 'Internação e domicílio',
            detail: 'Itens I e II: SV na admissão e na visita domiciliar — corretos.',
            icon: 'Home',
          },
          {
            label: 'Rotina cirúrgica',
            detail:
              'Item III: antes, durante e após procedimento cirúrgico ou invasivo — correto.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — transfusão',
            detail:
              'Item IV: “nunca durante” transfusão — falso; monitorar durante o procedimento.',
            icon: 'Ban',
          },
          {
            label: 'Medicações sistêmicas',
            detail:
              'Item V: antes, durante e após fármacos que alteram cardio, resp ou temperatura.',
            icon: 'Pill',
          },
        ],
        footer_rule: 'Transfusão exige vigilância contínua — item IV é a armadilha',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: cinco itens (I–V) sobre indicações de aferição.',
          'Julgar I — SV na internação → V.',
          'Julgar II — SV na visita domiciliar → V.',
          'Julgar III — rotina hospitalar perioperatória → V.',
          'Julgar IV — transfusão só antes e após, nunca durante → F.',
          'Julgar V — medicações que afetam cardio/resp/temp → V.',
          'Sequência: V,V,V,F,V — exclui IV.',
          'Eliminar A (falta V), B (falta III), D (inclui IV), E (falta I).',
          'Marcar C — I, II, III e V apenas.',
        ],
        footer_rule: 'IV falso → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — momentos de aferição',
        meta: slideMeta,
        content: 'QUANDO AFERIR — ROTINA MS/COFEN',
        rows: [
          { label: 'Admissão', value: 'Internação · consulta · procedimento', sv_kind: 'meta', badge: 'ok' },
          { label: 'Domicílio', value: 'Visita domiciliar com avaliação completa', sv_kind: 'meta', badge: 'ok' },
          { label: 'Perioperatório', value: 'Antes · durante · após cirurgia/invasivo', sv_kind: 'meta', badge: 'hot' },
          { label: 'Transfusão', value: 'Antes · durante · após — vigilância contínua', sv_kind: 'meta', badge: 'warn' },
          { label: 'Fármacos', value: 'Medicações que alteram FC/FR/PA/T', sv_kind: 'meta', badge: 'ok' },
          { label: 'FC referência', value: '60 a 100 bpm (adulto)', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Nunca suspender monitorização na transfusão',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MOMENTOS DE AFERIÇÃO',
        items: [
          {
            label: 'Letra A — só I e III',
            detail: 'Omite visita domiciliar e medicações (II e V).',
            correct:
              'II e V são verdadeiros — SV na domiciliar e com fármacos sistêmicos exige aferição.',
          },
          {
            label: 'Letra B — sem item III',
            detail: 'I, II e V ignoram rotina perioperatória hospitalar.',
            correct:
              'Item III é verdadeiro — normas hospitalares exigem SV antes, durante e após procedimentos.',
          },
          {
            label: 'Letra D — inclui IV',
            detail: 'Aceita “nunca durante” transfusão como correto.',
            correct:
              'Durante transfusão monitora-se FC, PA e outros parâmetros — IV é falso.',
          },
          {
            label: 'Letra E — sem I',
            detail: 'II, III e V excluem internação como momento obrigatório.',
            correct:
              'Item I é verdadeiro — admissão em unidade de saúde sempre inclui SV.',
          },
        ],
        footer_rule: 'IV = transfusão durante → falso',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779344178184-1': {
    family: 'vf',
    guideline:
      'MS/COFEN — aquecer mãos antes de palpar · pressão suave na artéria · pulso com indicador e médio (não polegar) · FC 60–100 bpm',
    roi_error: 'polegar_no_pulso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — cuidados na palpação do pulso',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Três itens sobre técnica de verificação da FC — AVANÇASP Amparo.',
            icon: 'Target',
          },
          {
            label: 'Mãos aquecidas',
            detail: 'Item I: aquecer as mãos evita vasoconstrição cutânea na palpação.',
            icon: 'Hand',
          },
          {
            label: 'Pressão suave',
            detail:
              'Item II: pressão forte sobre a artéria pode obliterar o pulso — evitar.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — polegar preferencial',
            detail:
              'Item III: polegar tem pulsação própria — banca marca como falso.',
            icon: 'Ban',
          },
          {
            label: 'Faixa de referência',
            detail: 'Após palpar: comparar com 60–100 bpm no adulto em repouso.',
            icon: 'Calculator',
          },
        ],
        footer_rule: 'III falso (polegar) → só I e II',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: três itens sobre cuidados na FC.',
          'Julgar I — aquecer as mãos → V.',
          'Julgar II — não pressionar forte a artéria → V.',
          'Julgar III — polegar preferencial no pulso → F.',
          'Sequência: V, V, F.',
          'Eliminar A (inclui III), C (inclui III), D (inclui III), E (nega I e II).',
          'Marcar B — I e II, apenas.',
        ],
        footer_rule: 'Polegar invalida A, C e D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — palpação do pulso',
        meta: slideMeta,
        content: 'TÉCNICA FC — PULSO RADIAL',
        rows: [
          { label: 'Dedos', value: 'Indicador e médio — nunca polegar', sv_kind: 'fc', badge: 'hot' },
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'Tempo', value: '60 segundos quando precisão exigida', sv_kind: 'fc', badge: 'ok' },
          { label: 'Pressão', value: 'Suave — não comprimir a artéria', sv_kind: 'fc', badge: 'warn' },
          { label: 'Preparo', value: 'Mãos aquecidas antes do contato', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Indicador + médio + 60–100 bpm',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PALPAÇÃO DO PULSO',
        items: [
          {
            label: 'Letra A — inclui III',
            detail: 'I, II e III validam polegar como dedo preferencial.',
            correct:
              'III é falso — polegar tem pulso próprio e distorce a contagem.',
          },
          {
            label: 'Letra C — inclui III',
            detail: 'I e III mantém o erro do polegar.',
            correct:
              'Só I e II são verdadeiros — técnica MS usa indicador e médio.',
          },
          {
            label: 'Letra D — inclui III',
            detail: 'II e III aceitam polegar na palpação.',
            correct:
              'III falso — gabarito B (I e II apenas).',
          },
          {
            label: 'Letra E — nega itens corretos',
            detail: 'Nenhum item verdadeiro descarta I e II que são corretos.',
            correct:
              'Aquecer mãos e pressão suave são cuidados reais — letra B.',
          },
        ],
        footer_rule: 'III = polegar → falso',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779344205200-2': {
    family: 'vf',
    guideline:
      'MS/COFEN — kit SV: estetoscópio · álcool 70% · termômetro · esfigmomanômetro (cuba rim não integra kit básico)',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — materiais para SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Três itens sobre materiais para verificar SV — Laranjal Paulista.',
            icon: 'Target',
          },
          {
            label: 'Estetoscópio',
            detail: 'Item I: necessário para PA auscultatória e FC apical.',
            icon: 'Stethoscope',
          },
          {
            label: 'Higiene',
            detail: 'Item II: algodão e álcool 70% para antissepsia entre pacientes.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha — cuba rim no kit',
            detail:
              'Item III: cuba rim é de sondagem — confundir com material de palpação do pulso radial invalida o kit.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — temperatura no kit',
            detail:
              'Termômetro integra SV; não confundir vias térmicas com material de coleta urinária.',
            icon: 'Thermometer',
          },
        ],
        footer_rule: 'Cuba rim não compõe kit clássico de SV',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: três itens sobre materiais.',
          'Julgar I — estetoscópio → V.',
          'Julgar II — algodão e álcool 70% → V.',
          'Julgar III — cuba rim → F.',
          'Sequência: V, V, F.',
          'Eliminar A (só I), B (só II), C (só III), E (todos).',
          'Marcar D — apenas I e II verdadeiros.',
        ],
        footer_rule: 'III falso → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — kit de sinais vitais',
        meta: slideMeta,
        content: 'MATERIAIS — AFERIÇÃO DE ROTINA',
        rows: [
          { label: 'PA', value: 'Esfigmomanômetro calibrado + estetoscópio', sv_kind: 'pa', badge: 'ok' },
          { label: 'FC', value: 'Relógio + palpação (radial/apical)', sv_kind: 'fc', badge: 'ok' },
          { label: 'Temperatura', value: 'Termômetro clínico', sv_kind: 'temp', badge: 'ok' },
          { label: 'Higiene', value: 'Algodão · álcool 70%', sv_kind: 'meta', badge: 'ok' },
          { label: 'FR', value: 'Observação visual — sem material específico', sv_kind: 'fr', badge: 'ok' },
        ],
        footer_rule: 'Estetoscópio + antissepsia = I e II',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MATERIAIS SV',
        items: [
          {
            label: 'Letra A — só item I',
            detail: 'Ignora algodão e álcool 70% do item II.',
            correct:
              'II é verdadeiro — antissepsia faz parte do preparo do material.',
          },
          {
            label: 'Letra B — só item II',
            detail: 'Exclui estetoscópio indispensável à PA auscultatória.',
            correct:
              'I é verdadeiro — estetoscópio integra kit básico de SV.',
          },
          {
            label: 'Letra C — só item III',
            detail: 'Aceita cuba rim como material de SV.',
            correct:
              'Cuba rim não substitui estetoscópio nem termômetro — confundir com kit de palpação do pulso radial é erro de prova; III falso.',
          },
          {
            label: 'Letra E — todos verdadeiros',
            detail: 'Inclui cuba rim no kit de SV.',
            correct:
              'III é falso — gabarito D (I e II apenas).',
          },
        ],
        footer_rule: 'III falso (cuba rim) — estetoscópio e antissepsia fecham letra D',
      },
    ],
  },

  'epl-concursos-enfermagem-verificacao-de-sinais-vitais-1779344182672-1': {
    family: 'vf',
    guideline:
      'MS/fisiologia — PA depende de débito cardíaco + volume circulante + resistência vascular periférica — ansiedade altera mas não é “principal fator” isolado',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — determinantes da PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro itens sobre fatores que determinam a PA — EPL Curitibanos.',
            icon: 'Target',
          },
          {
            label: 'Pegadinha — ansiedade principal',
            detail:
              'Item I: ansiedade altera PA mas não é o principal determinante hemodinâmico.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — FR e temperatura',
            detail:
              'Item II: FR e temperatura não determinam PA via “viscosidade” como descrito.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Débito cardíaco',
            detail:
              'Item III: débito cardíaco e volume circulante — determinante clássico da PA.',
            icon: 'Heart',
          },
          {
            label: 'Resistência vascular',
            detail:
              'Item IV: RVP — calibre, elasticidade e viscosidade — força oposta ao fluxo.',
            icon: 'Activity',
          },
        ],
        footer_rule: 'Só III e IV descrevem determinantes fisiológicos centrais',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: quatro itens sobre determinantes da PA.',
          'Julgar I — ansiedade como principal fator → F.',
          'Julgar II — FR e temperatura alteram viscosidade e elevam PA → F.',
          'Julgar III — débito cardíaco e volume circulante → V.',
          'Julgar IV — resistência vascular periférica → V.',
          'Sequência: F, F, V, V.',
          'Eliminar A (I), B (II), C (II+III parcial), E (todos).',
          'Marcar D — III e IV, apenas.',
        ],
        footer_rule: 'III + IV = D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — PA e hemodinâmica',
        meta: slideMeta,
        content: 'PA = DC × RVP (CONCEITO)',
        rows: [
          { label: 'PA sistólica/diastólica', value: 'Tensão sobre parede arterial', sv_kind: 'pa', badge: 'ok' },
          { label: 'Débito cardíaco', value: 'Volume ejetado × FC', sv_kind: 'pa', badge: 'hot' },
          { label: 'Volume circulante', value: 'Volemia efetiva', sv_kind: 'pa', badge: 'ok' },
          { label: 'RVP', value: 'Calibre · elasticidade · viscosidade', sv_kind: 'pa', badge: 'hot' },
          { label: 'PA referência adulto', value: 'Normotenso ~<120×80 mmHg (SBC)', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'DC + RVP = núcleo fisiológico da PA',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DETERMINANTES PA',
        items: [
          {
            label: 'Letra A — só I',
            detail: 'Ansiedade como principal determinante da PA.',
            correct:
              'I é falso — ansiedade influencia mas débito cardíaco e RVP são centrais.',
          },
          {
            label: 'Letra B — só II',
            detail: 'FR e temperatura determinam PA por viscosidade.',
            correct:
              'II é falso — mecanismo descrito não corresponde à fisiologia da PA.',
          },
          {
            label: 'Letra C — II e III',
            detail: 'Mantém item II como verdadeiro.',
            correct:
              'II é falso — só III e IV são corretos (letra D).',
          },
          {
            label: 'Letra E — todos',
            detail: 'Aceita I e II como determinantes principais.',
            correct:
              'I e II falsos — gabarito D (III e IV apenas).',
          },
        ],
        footer_rule: 'F,F,V,V — débito cardíaco e RVP fecham letra D',
      },
    ],
  },

  'fuvest-enfermagem-verificacao-de-sinais-vitais-1779344137078-1': {
    family: 'vf',
    guideline:
      'MS/7ª DBH — manguito estreito → PA falsamente elevada (não baixa) · calibrar esfigmomanômetro · largura manguito ≥40% circunferência braquial',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — braçadeira e calibração PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Três itens sobre técnica de PA confiável — FUVEST HU-USP.',
            icon: 'Target',
          },
          {
            label: 'Pegadinha — manguito pequeno',
            detail:
              'Item I: braçadeira pequena eleva a leitura — não reduz PA medida.',
            icon: 'Ban',
          },
          {
            label: 'Calibração rotineira',
            detail: 'Item II: esfigmomanômetro calibrado periodicamente — correto.',
            icon: 'Gauge',
          },
          {
            label: 'Largura do manguito',
            detail:
              'Item III: largura mínima 40% da circunferência do membro — correto.',
            icon: 'Ruler',
          },
        ],
        footer_rule: 'I inverte direção do erro do manguito estreito',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: três itens sobre PA confiável.',
          'Julgar I — manguito pequeno → PA mais baixa → F (eleva a leitura).',
          'Julgar II — calibrar rotineiramente → V.',
          'Julgar III — largura ≥40% da circunferência → V.',
          'Sequência: F, V, V.',
          'Eliminar A (inclui I), B (inclui I), C (inclui I).',
          'Marcar D — II e III.',
        ],
        footer_rule: 'Manguito estreito = PA alta falsa → I falso',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — manguito × leitura PA',
        meta: slideMeta,
        content: 'MANGUITO · CALIBRAÇÃO · PA',
        rows: [
          { label: 'Manguito estreito', value: 'PA falsamente elevada', sv_kind: 'pa', badge: 'hot' },
          { label: 'Manguito largo', value: 'PA falsamente baixa', sv_kind: 'pa', badge: 'warn' },
          { label: 'Largura bolsa', value: '≥40% circunferência braquial', sv_kind: 'pa', badge: 'ok' },
          { label: 'Calibração', value: 'Rotina — ponteiro no zero', sv_kind: 'pa', badge: 'ok' },
          { label: 'Cobertura', value: 'Bolsa ~80% do braço', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Estreito = alto falso · largo = baixo falso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MANGUITO FUVEST',
        items: [
          {
            label: 'Letra A — inclui I',
            detail: 'I e II aceitam manguito pequeno como causador de PA baixa.',
            correct:
              'I é falso — manguito pequeno eleva artificialmente a PA medida.',
          },
          {
            label: 'Letra B — inclui I',
            detail: 'I e III mantém erro de direção do manguito estreito.',
            correct:
              'Braçadeira pequena comprime demais → leitura alta, não baixa.',
          },
          {
            label: 'Letra C — inclui I',
            detail: 'Todos os itens incluem afirmativa invertida do item I.',
            correct:
              'Só II e III são verdadeiros — letra D.',
          },
        ],
        footer_rule: 'I falso → D (II e III)',
      },
    ],
  },

  'imparh-enfermagem-verificacao-de-sinais-vitais-1779344196733-3': {
    family: 'vf',
    guideline:
      'MS/COFEN — PA nos dois braços quando indicado (maior valor se diferença) · vias de temperatura oral/retal/axilar/ouvido · artérias de pulso · FR sem alertar paciente',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — técnica integrada de SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro itens sobre aferição de SV — Imparh Fortaleza.',
            icon: 'Target',
          },
          {
            label: 'Pegadinha — PA 4× menor valor',
            detail:
              'Item I: protocolo não exige 4 medidas nem “sempre menor valor” entre braços.',
            icon: 'Ban',
          },
          {
            label: 'Vias de temperatura',
            detail:
              'Item II: oral, retal, axilar e ouvido — vias clássicas de aferição.',
            icon: 'Thermometer',
          },
          {
            label: 'Artérias palpáveis',
            detail:
              'Item III: temporal, carótida, braquial, radial, femoral, poplítea, pediosa, maleolar, apical.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — FR com mão no abdômen',
            detail:
              'Item IV: mão visível no abdômen alerta o paciente — distorce contagem da FR.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'I e IV falsos — II e III verdadeiros',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: quatro itens sobre técnica de SV.',
          'Julgar I — PA 4× nos dois braços, sempre menor valor → F.',
          'Julgar II — vias de temperatura oral/retal/axilar/ouvido → V.',
          'Julgar III — artérias para palpação do pulso → V.',
          'Julgar IV — FR 1 min com mão no abdômen → F.',
          'Sequência: F, V, V, F.',
          'Eliminar A (só I falso), B (inclui I), D (inclui IV).',
          'Marcar C — apenas II e III verdadeiros.',
        ],
        footer_rule: 'II + III = C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas e técnica SV',
        meta: slideMeta,
        content: 'PA · FC · FR · TEMP — REFERÊNCIA',
        rows: [
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR adulto', value: '12 a 20 irpm — contar sem alertar', sv_kind: 'fr', badge: 'hot' },
          { label: 'Temperatura', value: 'Oral · axilar · retal · timpânica', sv_kind: 'temp', badge: 'ok' },
          { label: 'PA — dois braços', value: 'Comparar; diferença relevante → conduta médica', sv_kind: 'pa', badge: 'warn' },
          { label: 'Pulso apical', value: 'Estetoscópio no ictus — 5º EIC esquerdo', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'FR: paciente não deve perceber a contagem',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SV IMPARH',
        items: [
          {
            label: 'Letra A — só I falso',
            detail: 'Apenas item I falso mas ignora IV também falso.',
            correct:
              'IV também é falso — mão no abdômen durante FR alerta o paciente.',
          },
          {
            label: 'Letra B — inclui I',
            detail: 'I e II tratam protocolo de PA 4× como correto.',
            correct:
              'I é falso — não há obrigatoriedade de 4 medidas com menor valor.',
          },
          {
            label: 'Letra D — inclui IV',
            detail: 'III e IV validam técnica de FR com mão visível.',
            correct:
              'IV é falso — FR deve ser contada discretamente.',
          },
        ],
        footer_rule: 'F,V,V,F — vias térmicas e artérias palpáveis fecham letra C',
      },
    ],
  },

  'reis-e-reis-enfermagem-verificacao-de-sinais-vitais-1779344089179-9': {
    family: 'vf',
    guideline:
      'MS/Korotkoff — silêncio na PA · braquial + estetoscópio · palpatória radial +20–30 mmHg · manguito 2–3 cm acima da fossa cubital',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — sequência técnica da PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro itens sobre procedimento de PA — Reis e Reis Coluna.',
            icon: 'Target',
          },
          {
            label: 'Pegadinha — manguito terço inferior',
            detail:
              'Item I: manguito fica 2–3 cm acima da fossa cubital — não no terço distal.',
            icon: 'Ban',
          },
          {
            label: 'Silêncio do paciente',
            detail: 'Item II: paciente não deve falar durante a aferição — correto.',
            icon: 'VolumeX',
          },
          {
            label: 'Palpação braquial',
            detail:
              'Item III: palpar braquial e colocar diafragma do estetoscópio — correto.',
            icon: 'Stethoscope',
          },
          {
            label: 'Técnica palpatória',
            detail:
              'Item IV: palpar radial, insuflar até sumir pulso + 20–30 mmHg — palpatória clássica.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'I falso (posição manguito) — II, III e IV corretos',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: quatro itens sobre técnica de PA.',
          'Julgar I — manguito no terço inferior do braço → F.',
          'Julgar II — paciente em silêncio → V.',
          'Julgar III — palpar braquial + estetoscópio → V.',
          'Julgar IV — técnica palpatória radial + 20–30 mmHg → V.',
          'Sequência: F, V, V, V.',
          'Eliminar A (inclui I), B (inclui I), D (todos).',
          'Marcar C — II, III e IV apenas.',
        ],
        footer_rule: 'I falso no manguito — II, III e IV fecham letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica PA Korotkoff',
        meta: slideMeta,
        content: 'SEQUÊNCIA PA — MS/COFEN',
        rows: [
          { label: 'Manguito', value: '2–3 cm acima da fossa cubital', sv_kind: 'pa', badge: 'hot' },
          { label: 'PA — pré-insuflação', value: 'Sumir pulso radial + 20–30 mmHg', sv_kind: 'pa', badge: 'ok' },
          { label: 'PA auscultatória', value: 'Diafragma sobre artéria braquial', sv_kind: 'pa', badge: 'ok' },
          { label: 'Repouso', value: 'Paciente calmo · sem falar', sv_kind: 'pa', badge: 'ok' },
          { label: 'PA referência', value: 'Normotenso ~<120×80 mmHg', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Posição do manguito = pegadinha clássica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA PA REIS',
        items: [
          {
            label: 'Letra A — inclui I',
            detail: 'I, II e III aceitam manguito no terço inferior.',
            correct:
              'I é falso — manguito fica proximal à fossa cubital, não no terço distal.',
          },
          {
            label: 'Letra B — inclui I',
            detail: 'I, II e IV mantém posicionamento errado do manguito.',
            correct:
              'Terço inferior do braço invalida item I — gabarito C.',
          },
          {
            label: 'Letra D — inclui I',
            detail: 'Todas as afirmativas incluem item I falso.',
            correct:
              'I falso — só II, III e IV são corretos (letra C).',
          },
        ],
        footer_rule: 'Manguito proximal → I falso',
      },
    ],
  },

  'ufmt-enfermagem-verificacao-de-sinais-vitais-1779344182672-4': {
    family: 'vf',
    guideline:
      'MS/COFEN — SV clássicos T/FC/FR/PA + 5º dor + 6º SpO₂ · aferição pontual ou rotina · não aferir PA no lado mastectomizado · manguito acima do cotovelo (estetoscópio sob manguito, não preso)',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — dados vitais e conceitos',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro itens sobre dados vitais — UFMT Nobres.',
            icon: 'Target',
          },
          {
            label: 'Pontual ou rotina',
            detail:
              'Item I: SV isolados ou repetidos na rotina de enfermagem — correto.',
            icon: 'Clock',
          },
          {
            label: '5º e 6º sinais vitais',
            detail:
              'Item II: quatro clássicos + dor (5º) + oximetria de pulso (6º) — correto.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — mastectomia',
            detail:
              'Item III: evitar braço mastectomizado/esvaziamento axilar — não aferir “deitado relaxado” nesse lado.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — manguito no cotovelo',
            detail:
              'Item IV: manguito sobre braquial acima da fossa — estetoscópio sob manguito, não “preso sob”.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'III e IV invertem conduta de PA',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: quatro itens sobre dados vitais.',
          'Julgar I — medida pontual ou rotineira → V.',
          'Julgar II — quatro clássicos + dor + SpO₂ → V.',
          'Julgar III — PA preferencial no braço mastectomizado → F.',
          'Julgar IV — manguito na prega do cotovelo com estetoscópio preso → F.',
          'Sequência: V, V, F, F.',
          'Eliminar B (inclui III), C (inclui III e IV), D (inclui III e IV).',
          'Marcar A — I e II, apenas.',
        ],
        footer_rule: 'III e IV falsos → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sinais vitais clássicos',
        meta: slideMeta,
        content: 'QUATRO CLÁSSICOS + DOR + SpO₂',
        rows: [
          { label: 'Clássicos', value: 'T · FC · FR · PA', sv_kind: 'meta', badge: 'ok' },
          { label: '5º sinal', value: 'Dor — experiência subjetiva', sv_kind: 'meta', badge: 'ok' },
          { label: '6º sinal', value: 'Oximetria de pulso (SpO₂)', sv_kind: 'meta', badge: 'ok' },
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR adulto', value: '12 a 20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Manguito PA', value: '2–3 cm acima da fossa cubital', sv_kind: 'pa', badge: 'hot' },
        ],
        footer_rule: 'Mastectomia = evitar braço operado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DADOS VITAIS UFMT',
        items: [
          {
            label: 'Letra B — inclui III',
            detail: 'II e III aceitam PA no braço mastectomizado.',
            correct:
              'III é falso — não aferir PA no membro com mastectomia/esvaziamento axilar.',
          },
          {
            label: 'Letra C — inclui III e IV',
            detail: 'Combinação com técnica errada de manguito.',
            correct:
              'III e IV falsos — manguito não fica na prega do cotovelo.',
          },
          {
            label: 'Letra D — inclui III e IV',
            detail: 'I, III e IV misturam item correto com dois falsos.',
            correct:
              'Só I e II verdadeiros — letra A.',
          },
        ],
        footer_rule: 'V,V,F,F — conceitos I e II corretos fecham letra A',
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
    console.log(`[handcraft:sv-g36] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g36] total=${ok}`);
}

main();
