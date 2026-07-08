#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g30 (SHORT LOTE: 7 slugs P1 vitals_fc_faixas final).
 * Fecha cluster vitals_fc_faixas após g26–g29.
 *
 *   npm run handcraft:sinais-vitais-g30
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g30';
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
    'pulso radial — indicador e médio',
    'pulso apical — ritmo irregular',
    'pulso filiforme / parvus',
    'normocárdico · bradicardia · taquicardia',
    'FR após pulso — distração radial',
    'ritmo rítmico × arrítmico',
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

type Branch =
  | 'vitals_pa_tecnica'
  | 'vitals_interpretacao'
  | 'vitals_fc_faixas'
  | 'vitals_generico';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'certo_errado';
  branch: Branch;
  guideline: string;
  exam_vs_current?: string;
  roi_error?: string;
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
    pedagogical_branch: pack.branch,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: [SV_SOURCE],
  };
}

const UNESC_NORMOCARDICO: Pack = {
  family: 'conceito',
  branch: 'vitals_fc_faixas',
  guideline:
    'MS/Potter — ritmo rítmico: intervalos iguais · arrítmico: intervalos irregulares · normocárdico: FC 60–100 bpm · bradicardia <60 · taquicardia >100',
  roi_error: 'fc_faixa_invertida',
  slides: [
    {
      type: 'concept_map',
      slide_title: 'Terminologia do pulso — ritmo e FC',
      meta: slideMeta,
      items: [
        {
          label: 'Comando da prova',
          detail:
            'Definições relativas ao pulso (frequência e ritmo cardíacos) — marcar alternativa CORRETA.',
          icon: 'Target',
        },
        {
          label: 'Normocárdico',
          detail:
            'Ritmo e frequência dentro da faixa normal (60–100 bpm em repouso) — letra D.',
          icon: 'HeartPulse',
        },
        {
          label: 'Pegadinha — rítmico invertido',
          detail: 'Letra A: intervalos diferentes = arrítmico, não rítmico.',
          icon: 'Ban',
        },
        {
          label: 'Pegadinha — arrítmico invertido',
          detail: 'Letra B: intervalos iguais = rítmico, não arrítmico.',
          icon: 'GitCompare',
        },
        {
          label: 'Pegadinha — bradi/taqui trocados',
          detail: 'Letras C e E invertem bradicardia (<60) e taquicardia (>100).',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Ritmo + FC corretos → normocárdico (D)',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: slideMeta,
      steps: [
        'Comando: terminologias do pulso — alternativa correta.',
        'Testar A — rítmico com intervalos diferentes: define arrítmico → eliminar.',
        'Testar B — arrítmico com intervalos iguais: define rítmico → eliminar.',
        'Testar C — bradicardia acima da faixa: inverte bradi (<60) e taqui → eliminar.',
        'Testar E — taquicardia abaixo da faixa: inverte taqui (>100) e bradi → eliminar.',
        'Testar D — normocárdico: ritmo e FC normais → candidata.',
        'Marcar D.',
      ],
      footer_rule: 'Só D une ritmo e FC corretos',
    },
    {
      type: 'golden_rule',
      slide_title: 'Referência — ritmo e frequência',
      meta: slideMeta,
      content: 'RITMO × FREQUÊNCIA',
      rows: [
        { label: 'Normocárdico', value: 'Ritmo regular + FC 60–100 bpm', sv_kind: 'fc', badge: 'hot' },
        { label: 'Rítmico', value: 'Intervalos iguais entre batimentos', sv_kind: 'fc', badge: 'ok' },
        { label: 'Arrítmico', value: 'Intervalos irregulares', sv_kind: 'fc', badge: 'warn' },
        { label: 'Bradicardia', value: 'FC < 60 bpm', sv_kind: 'fc', badge: 'ok' },
        { label: 'Taquicardia', value: 'FC > 100 bpm', sv_kind: 'fc', badge: 'ok' },
      ],
      footer_rule: 'Não inverta ritmo nem faixa de FC',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: slideMeta,
      content: 'PEGADINHAS — TERMINOLOGIA PULSO',
      items: [
        {
          label: 'Letra A — pulso rítmico',
          detail: 'Intervalos entre batimentos diferentes.',
          correct:
            'Rítmico exige intervalos iguais — descrição da letra A define arrítmico, não rítmico.',
        },
        {
          label: 'Letra B — pulso arrítmico',
          detail: 'Intervalos entre batimentos iguais.',
          correct:
            'Arrítmico apresenta intervalos irregulares — letra B descreve pulso rítmico.',
        },
        {
          label: 'Letra C — bradicardia',
          detail: 'FC acima da faixa normal.',
          correct:
            'Bradicardia é FC abaixo de 60 bpm — letra C inverte o conceito (acima = taquicardia).',
        },
        {
          label: 'Letra E — taquicardia',
          detail: 'FC abaixo da faixa normal.',
          correct:
            'Taquicardia é FC acima de 100 bpm — letra E inverte bradicardia e taquicardia.',
        },
      ],
      footer_rule: 'Definição correta = normocárdico (D)',
    },
  ],
};

const SPECS: Record<string, Pack> = {
  'omni-enfermagem-verificacao-de-sinais-vitais-1779344237445-5': {
    family: 'vf',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/Potter — FR: palpar radial como distração · contar 15 s × 4 se rítmico · não anunciar ao paciente · simultâneo ao pulso, não após encerrar',
    roi_error: 'contar_fr_com_fala',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FR — técnica com pulso radial',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'I/II/III/IV sobre aferição da FR — quais estão corretas?',
            icon: 'Target',
          },
          {
            label: 'II — distração radial',
            detail:
              'Dedos na radial “como pulso” para o paciente não alterar o ritmo respiratório — correto.',
            icon: 'HeartPulse',
          },
          {
            label: 'III — ¼ min × 4',
            detail: '15 s de observação se rítmico, multiplicar por 4 — técnica clássica.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — I depois do pulso',
            detail: 'I: contar FR depois do pulso — separa os momentos; técnica é simultânea.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — IV prolongado',
            detail: 'IV: contagem além do minuto padrão se arrítmico — intervalo não é o protocolo desta prova.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Distração radial + 15 s × 4 → II e III',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativas sobre técnica de FR.',
          'Julgar I — FR depois do pulso: técnica correta é durante a palpação radial, não após → FALSA.',
          'Julgar II — dedos na radial para distrair: VERDADEIRA.',
          'Julgar III — ¼ min rítmico × 4: VERDADEIRA.',
          'Julgar IV — contagem prolongada se arrítmico: não é o protocolo cobrado → FALSA.',
          'Combinação correta: apenas II e III → letra C.',
          'Marcar C.',
        ],
        footer_rule: 'II + III corretas → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FR com pulso',
        meta: slideMeta,
        content: 'TÉCNICA FR × PULSO',
        rows: [
          { label: 'Distração', value: 'Radial como se fosse pulso — paciente não percebe', sv_kind: 'fr', badge: 'hot' },
          { label: 'Tempo rítmico', value: '15 s × 4 = 1 min (respiração regular)', sv_kind: 'fr', badge: 'ok' },
          { label: 'Momento', value: 'Simultâneo à palpação — não após encerrar FC', sv_kind: 'fc', badge: 'warn' },
          { label: 'FR adulto', value: '12–20 irpm eupneia', sv_kind: 'fr', badge: 'ok' },
          { label: 'FC adulto', value: '60–100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Palpa radial · conta respiração · não avisa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FR OMNI',
        items: [
          {
            label: 'Letra A — I, II, III e IV',
            detail: 'Inclui I (depois do pulso) e IV (contagem prolongada).',
            correct:
              'I separa FR do momento da palpação radial — técnica exige contagem simultânea, não “depois o pulso”.',
          },
          {
            label: 'Letra B — II, III e IV',
            detail: 'Acrescenta IV (contagem prolongada em arrítmia).',
            correct:
              'IV propõe tempo além do padrão para arrítmia — não é o par correto com II e III nesta questão.',
          },
          {
            label: 'Letra D — I e IV',
            detail: 'Só afirmativas I e IV.',
            correct:
              'I erra o momento (depois vs simultâneo) e IV erra o tempo — nenhuma das duas é correta isoladamente.',
          },
        ],
        footer_rule: 'Só C fecha II + III',
      },
    ],
  },

  'omni-geral-verificacao-de-sinais-vitais-1779344205200-3': {
    family: 'protocolo',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/Potter — FR após/início do pulso radial na mesma posição · 1 minuto completo · 1 ciclo = inspiração + expiração',
    roi_error: 'contar_fr_com_fala',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FR logo após o pulso',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'FR em seguida ao pulso, sem o paciente perceber — conduta do profissional.',
            icon: 'Target',
          },
          {
            label: 'Mesma posição',
            detail: 'Manter postura da palpação radial — distração contínua.',
            icon: 'HeartPulse',
          },
          {
            label: '1 minuto inteiro',
            detail: 'Contar respirações por 60 s — 1 ciclo = inspiração + expiração.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha — inspiração e expiração separadas',
            detail: 'Letra A conta inspirações e expirações como eventos distintos.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — tempo incompleto',
            detail: 'Letras C e D usam intervalos menores ou maiores que 1 minuto padrão.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Mesma posição · 1 min · ciclo completo → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: FR após pulso sem controle voluntário do paciente.',
          'Testar A — inspirações e expirações separadas: 1 respiração = ciclo completo → eliminar.',
          'Testar C — meio minuto: tempo insuficiente padrão → eliminar.',
          'Testar D — tempo além de 60 s: intervalo atípico → eliminar.',
          'Testar B — mesma posição, 1 min, ciclo insp+exp: protocolo MS → candidata.',
          'Marcar B.',
        ],
        footer_rule: '60 s · ciclo respiratório → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sequência FC → FR',
        meta: slideMeta,
        content: 'PULSO DISTRAI · FR CONTA',
        rows: [
          { label: 'Sequência', value: 'Pulso radial → FR na mesma posição', sv_kind: 'fc', badge: 'hot' },
          { label: 'Tempo FR', value: '1 minuto completo (60 s)', sv_kind: 'fr', badge: 'ok' },
          { label: '1 respiração', value: 'Inspiração + expiração = 1 ciclo', sv_kind: 'fr', badge: 'warn' },
          { label: 'Objetivo', value: 'Evitar controle voluntário da FR', sv_kind: 'fr', badge: 'ok' },
          { label: 'FC rotina', value: 'Radial — indicador + médio — 60 s', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Não conte inspiração e expiração em dobro',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FR OMNI GERAL',
        items: [
          {
            label: 'Letra A — inspirações e expirações',
            detail: 'Conta inspirações e expirações separadamente.',
            correct:
              'Cada respiração é um ciclo único (inspiração + expiração) — contar em dobro superestima a FR.',
          },
          {
            label: 'Letra C — 30 segundos',
            detail: 'Contagem por meio minuto.',
            correct:
              'FR padrão exige 1 minuto de observação — 30 s é intervalo insuficiente sem justificativa no enunciado.',
          },
          {
            label: 'Letra D — 1 min 30 s',
            detail: 'Contagem por noventa segundos.',
            correct:
              'Protocolo de rotina usa 60 s — 1 min 30 s não é o tempo cobrado nesta alternativa.',
          },
        ],
        footer_rule: 'B = posição + 1 min + ciclo',
      },
    ],
  },

  'selecon-enfermagem-verificacao-de-sinais-vitais-1779344182672-2': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/Potter — pulso filiforme/fino = parvus (amplitude reduzida) · distinto de bradipneia, magnus ou local apical',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pulso filiforme — parvus',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Palpação identifica pulso filiforme ou fino — termo correto?',
            icon: 'Target',
          },
          {
            label: 'Parvus',
            detail: 'Latim clínico para pulso de baixa amplitude / fino à palpação.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — bradipneia',
            detail: 'Letra A: termo respiratório (FR baixa), não pulso.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — magnus',
            detail: 'Letra B: pulso forte/amplitude aumentada — oposto de fino.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — confundir pulso radial',
            detail:
              'Letra D apical: sítio de ausculta no tórax — não confundir local de palpação radial com qualidade parvus.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Fino à palpação → parvus (C)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: pulso filiforme/fino — qual termo?',
          'Separar: qualidade (amplitude) vs frequência vs local.',
          'Testar A — bradipneia: FR lenta, não pulso → eliminar.',
          'Testar B — magnus: amplitude aumentada → eliminar.',
          'Testar D — apical: sítio de aferição → eliminar.',
          'Testar C — parvus: pulso fino de baixa amplitude → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'Filiforme = parvus → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — qualidade do pulso',
        meta: slideMeta,
        content: 'AMPLITUDE × TERMO',
        rows: [
          { label: 'Parvus / filiforme', value: 'Pulso fino · baixa amplitude', sv_kind: 'fc', badge: 'hot' },
          { label: 'Magnus', value: 'Pulso forte · amplitude aumentada', sv_kind: 'fc', badge: 'warn' },
          { label: 'Bradipneia', value: 'FR diminuída — não é pulso', sv_kind: 'fr', badge: 'ok' },
          { label: 'Apical', value: 'Local de ausculta no ictus', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC adulto', value: '60–100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Fino = parvus, não magnus',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PARVUS SELECON',
        items: [
          {
            label: 'Letra A — bradipneia',
            detail: 'Termo de frequência respiratória.',
            correct:
              'Bradipneia classifica FR baixa — enunciado trata qualidade do pulso à palpação.',
          },
          {
            label: 'Letra B — magnus',
            detail: 'Pulso de amplitude aumentada.',
            correct:
              'Magnus descreve pulso forte e cheio — oposto de filiforme/fino identificado na palpação.',
          },
          {
            label: 'Letra D — apical',
            detail: 'Pulso apical no tórax.',
            correct:
              'Apical indica local de aferição (ausculta) — não traduz pulso fino de baixa amplitude.',
          },
        ],
        footer_rule: 'Amplitude fina → parvus',
      },
    ],
  },

  'unesc-enfermagem-verificacao-de-sinais-vitais-1778969729218-2': UNESC_NORMOCARDICO,

  'unesc-enfermagem-verificacao-de-sinais-vitais-1780000468214-5': UNESC_NORMOCARDICO,

  'unifil-enfermagem-verificacao-de-sinais-vitais-1779344196733-1': {
    family: 'protocolo',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/COFEN — ritmo irregular: FC apical com estetoscópio por 60 s · mais precisa que periférico quando há arritmia ou fármacos cardíacos',
    roi_error: 'pulso_periferico_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC apical — ritmo irregular',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Paciente cardiológica, fármacos que alteram FC, pulso irregular — FC mais precisa.',
            icon: 'Target',
          },
          {
            label: 'FC apical 60 s',
            detail:
              'Ausculta direta no ictus — melhor quando ritmo irregular ou drogas cronotrópicas.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — braquial 15 s × 2',
            detail: 'Letra B: local e tempo errados (×2 em vez de ×4).',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — femoral',
            detail: 'Letra C: pulso central, mas não ausculta apical em arritmia.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — carótida 30 s',
            detail: 'Letra D: intervalo curto ×2 — impreciso em irregularidade.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Arritmia + fármacos → apical 60 s',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: clínica cardiológica · fármacos cronotrópicos · pulso irregular.',
          'Regra: ritmo irregular exige FC apical por 1 minuto completo.',
          'Testar B — braquial 15 s × 2: local e fator de multiplicação errados → eliminar.',
          'Testar C — femoral 60 s: central, mas não ausculta direta → eliminar.',
          'Testar D — carótida 30 s × 2: tempo curto e impreciso → eliminar.',
          'Testar A — apical 60 s: padrão MS para arritmia → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'Irregular → apical · 60 s → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — quando usar apical',
        meta: slideMeta,
        content: 'RADIAL × APICAL',
        rows: [
          { label: 'FC apical', value: 'Ictus · estetoscópio · 60 s — arritmia', sv_kind: 'fc', badge: 'hot' },
          { label: 'Pulso radial', value: 'Rotina em ritmo regular', sv_kind: 'fc', badge: 'ok' },
          { label: 'Femoral/carótida', value: 'Pulsos centrais — emergência, não apical', sv_kind: 'fc', badge: 'warn' },
          { label: 'Braquial', value: 'PA infantil / recém-nascido', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC adulto', value: '60–100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Irregular = ausculte o ictus',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — APICAL UNIFIL',
        items: [
          {
            label: 'Letra B — braquial 15 s × 2',
            detail: 'Pulso braquial por 15 segundos multiplicado por 2.',
            correct:
              'Braquial não é o sítio de escolha em arritmia adulta — e ×2 subestima (padrão é 60 s ou 15 s × 4).',
          },
          {
            label: 'Letra C — femoral 60 s',
            detail: 'Pulso femoral por 1 minuto.',
            correct:
              'Femoral é pulso central de emergência — não substitui ausculta apical para FC precisa em arritmia.',
          },
          {
            label: 'Letra D — carótida 30 s × 2',
            detail: 'Carótida por 30 segundos × 2.',
            correct:
              'Intervalo de 30 s com ×2 é impreciso em ritmo irregular — MS indica apical por 60 s completos.',
          },
        ],
        footer_rule: 'Precisão em arritmia = apical',
      },
    ],
  },

  'univida-enfermagem-verificacao-de-sinais-vitais-1779344097180-2': {
    family: 'protocolo',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/COFEN — PA 120×80 normotenso · FC >100 taquicárdico · FR >20 taquipneia · T <37,8°C afebril',
    exam_vs_current:
      'Prova gabarita FR 22 irpm como eupneia (letra A); referência MS define eupneia 12–20 irpm — FR 22 = taquipneia (letra C seria clinicamente correta na FR)',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Painel SV — emergência Univida',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'PA 120×80 · FC 171 · FR 22 · T 36,6°C — classificar o paciente.',
            icon: 'Target',
          },
          {
            label: 'PA normotenso',
            detail: '120×80 mmHg — dentro da faixa de normotensão.',
            icon: 'Scale',
          },
          {
            label: 'Taquicárdico',
            detail: 'FC 171 bpm > 100 — taquicardia.',
            icon: 'HeartPulse',
          },
          {
            label: 'Afebril',
            detail: 'T 36,6°C — sem febre.',
            icon: 'Thermometer',
          },
          {
            label: 'Divergência prova × MS',
            detail: 'Gabarito A classifica FR 22 como eupneia — MS: >20 = taquipneia.',
            icon: 'BookOpen',
          },
        ],
        footer_rule: 'Prova: normotenso · taquicárdico · eupneico · afebril → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Painel: PA 120×80 · FC 171 · FR 22 · T 36,6°C.',
          'PA → normotenso.',
          'FC 171 → taquicárdico (elimina B e D com bradicardia).',
          'T 36,6°C → afebril (todas alternativas concordam).',
          'FR 22: prova gabarita eupneia (A); MS classificaria taquipneia — registrar divergência.',
          'Testar B — bradicárdico: FC 171 é taquicardia → eliminar.',
          'Testar C — taquipneico: clinicamente FR 22, mas gabarito oficial é A → eliminar na prova.',
          'Testar D — bradicárdico + taquipneico: erra FC → eliminar.',
          'Marcar A (gabarito da banca).',
        ],
        footer_rule: 'Na prova: A · saiba que FR 22 = taquipneia no MS',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — painel do caso',
        meta: slideMeta,
        content: 'PROVA × GUIDELINE',
        rows: [
          { label: 'PA 120×80', value: 'Normotenso', sv_kind: 'pa', badge: 'ok' },
          { label: 'FC 171 bpm', value: 'Taquicárdico (>100)', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR 22 (prova)', value: 'Eupneico — gabarito A', sv_kind: 'fr', badge: 'warn' },
          { label: 'FR 22 (MS)', value: 'Taquipneia (>20 irpm)', sv_kind: 'fr', badge: 'warn' },
          { label: 'T 36,6°C', value: 'Afebril', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'Marque A na prova · decore FR >20 = taquipneia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — UNIVIDA',
        items: [
          {
            label: 'Letra B — bradicárdico',
            detail: 'Normotenso, bradicárdico, eupneico e afebril.',
            correct:
              'FC 171 bpm é taquicardia — bradicárdico inverte a classificação da frequência cardíaca do caso.',
          },
          {
            label: 'Letra C — taquipneico',
            detail: 'Normotenso, taquicárdico, taquipneico e afebril.',
            correct:
              'Clinicamente FR 22 irpm configura taquipneia (MS >20), mas a banca gabaritou A com eupneia — marque A na prova.',
          },
          {
            label: 'Letra D — bradicárdico e taquipneico',
            detail: 'Combina bradicardia com taquipneia.',
            correct:
              'FC 171 é taquicárdica, não bradicárdica — distrator erra o componente cardíaco do painel.',
          },
        ],
        footer_rule: 'Gabarito prova = A · FR 22 = pegadinha clínica',
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
    console.log(`[handcraft:sv-g30] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g30] total=${ok}`);
}

main();
