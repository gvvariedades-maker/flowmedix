#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g27 (8 slugs P1 vitals_fc_faixas batch 2).
 *
 *   npm run handcraft:sinais-vitais-g27
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g27';
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
    'polegar não palpa pulso',
    'pulso filiforme = fino',
    'pulso carotídeo — pescoço',
    'bradicardia <60',
    'taquicardia >100',
    'bradisfigmia',
    'pulso paradoxal',
    'FC apical — estetoscópio',
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

const SPECS: Record<string, Pack> = {
  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343945057-4': {
    family: 'protocolo',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/Potter — palpação do pulso: dedos indicador e médio sobre a artéria · nunca o polegar · contagem 60 s · radial de rotina',
    roi_error: 'polegar_palpa_pulso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica — dedos na palpação',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Imagem com posicionamentos numerados — identificar o correto para aferir o pulso.',
            icon: 'Target',
          },
          {
            label: 'Técnica MS',
            detail:
              'Indicador e médio sobre a artéria — leve pressão · polegar tem pulso próprio e não serve.',
            icon: 'Hand',
          },
          {
            label: 'Figura — nº 2',
            detail:
              'Painel 2 mostra indicador + médio alinhados ao trajeto arterial — gabarito da prova.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — polegar',
            detail: 'Painel 1 costuma usar polegar — confunde com o pulso do examinador.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — pressão',
            detail: 'Painéis com compressão excessiva ou dedos afastados do vaso não captam o pulso.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Após palpar',
            detail: 'Conte 60 s e compare com 60–100 bpm (adulto) · <60 bradicardia · >100 taquicardia.',
            icon: 'Calculator',
          },
        ],
        footer_rule: 'Indicador + médio · nunca polegar → nº 2',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: qual número da imagem mostra o posicionamento correto dos dedos para o pulso?',
          'Fixar regra: palpação com indicador e médio — polegar tem pulso próprio.',
          'Testar A (nº 1): posição típica com polegar → eliminar.',
          'Testar C (nº 3): dedos inadequados ou fora do trajeto arterial → eliminar.',
          'Testar D (nº 4): técnica incorreta na figura → eliminar.',
          'Testar E (nº 5): outro posicionamento errado → eliminar.',
          'Testar B (nº 2): indicador + médio sobre artéria → candidata.',
          'Marcar B.',
        ],
        footer_rule: 'Nº 2 = indicador + médio → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — palpação do pulso',
        meta: slideMeta,
        content: 'DECORE — DEDOS E TEMPO',
        rows: [
          { label: 'Dedos corretos', value: 'Indicador + médio sobre a artéria', sv_kind: 'fc', badge: 'hot' },
          { label: 'Polegar', value: 'Proibido — pulso próprio do examinador', sv_kind: 'fc', badge: 'warn' },
          { label: 'Tempo padrão', value: '60 segundos quando precisão importa', sv_kind: 'fc', badge: 'ok' },
          { label: 'Site de rotina', value: 'Artéria radial no punho', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Indicador + médio · 60 s · radial',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — POSIÇÃO DOS DEDOS',
        items: [
          {
            label: 'Letra A — nº 1',
            detail: 'Primeiro painel da figura.',
            correct:
              'Posição 1 costuma mostrar polegar sobre o vaso — o polegar capta o pulso do próprio examinador, não do paciente.',
          },
          {
            label: 'Letra C — nº 3',
            detail: 'Terceiro painel numerado.',
            correct:
              'Painel 3 não alinha indicador e médio ao trajeto arterial — técnica inadequada para palpação confiável.',
          },
          {
            label: 'Letra D — nº 4',
            detail: 'Quarto painel da ilustração.',
            correct:
              'Posição 4 na figura AVANÇASP não representa a dupla indicador–médio exigida pela MS para pulso radial.',
          },
          {
            label: 'Letra E — nº 5',
            detail: 'Quinto painel da imagem.',
            correct:
              'Indicação 5 mostra posicionamento distinto do padrão indicador + médio — gabarito é o painel 2.',
          },
        ],
        footer_rule: 'Só nº 2 fecha técnica MS',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343956155-5': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/Potter — pulso filiforme: amplitude fina/débil · distinto de bradicardia ou taquicardia isoladas · radial de rotina; carótida/femoral se filiforme',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pulso filiforme — definição',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Após citar radial e artérias calibrosas para pulso filiforme, pede a definição de pulso filiforme.',
            icon: 'Target',
          },
          {
            label: 'Filiforme',
            detail:
              'Pulso de amplitude reduzida — fino, débil, “fio de linha”; qualidade do pulso, não frequência.',
            icon: 'Activity',
          },
          {
            label: 'Pulso fino puro',
            detail:
              'Filiforme = amplitude reduzida — “pulso fino” sem misturar FC alta ou baixa.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — só FC baixa',
            detail: 'Letra A: FC abaixo do normal = bradicardia, não filiforme.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — compostos',
            detail: 'Letras C e D unem fino + taqui/bradi = taquisfigmia/bradisfigmia, não filiforme puro.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Filiforme = amplitude fina → pulso fino',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: definição de pulso filiforme.',
          'Separar: filiforme = qualidade (amplitude) · não é sinônimo de bradicardia ou taquicardia.',
          'Testar A — FC abaixo do normal: frequência, não amplitude → eliminar.',
          'Testar B — FC acima do normal: taquicardia numérica → eliminar.',
          'Testar C — fino taquicárdico: taquisfigmia → eliminar.',
          'Testar D — fino bradicárdico: bradisfigmia → eliminar.',
          'Testar E — pulso fino: amplitude reduzida sem frequência → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Filiforme = fino → E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — qualidade do pulso',
        meta: slideMeta,
        content: 'AMPLITUDE × FREQUÊNCIA',
        rows: [
          { label: 'Pulso filiforme', value: 'Amplitude fina / débil', sv_kind: 'fc', badge: 'hot' },
          { label: 'Bradisfigmia', value: 'Fino + bradicardia (<60)', sv_kind: 'fc', badge: 'warn' },
          { label: 'Taquisfigmia', value: 'Fino + taquicardia (>100)', sv_kind: 'fc', badge: 'warn' },
          { label: 'Bradicardia', value: 'FC < 60 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Filiforme ≠ bradi/taqui isolados',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FILIFORME',
        items: [
          {
            label: 'Letra A — FC abaixo do normal',
            detail: 'Define bradicardia numérica.',
            correct:
              'Filiforme descreve amplitude do pulso — FC abaixo de 60 bpm é bradicardia, não definição de filiforme.',
          },
          {
            label: 'Letra B — FC acima do normal',
            detail: 'Define taquicardia.',
            correct:
              'Frequência elevada isolada não traduz pulso filiforme — filiforme é pulso fino à palpação.',
          },
          {
            label: 'Letra C — fino taquicárdico',
            detail: 'Une amplitude e taquicardia.',
            correct:
              'Combinação fino + taqui = taquisfigmia — o enunciado pede só o termo para pulso filiforme (amplitude).',
          },
          {
            label: 'Letra D — fino bradicárdico',
            detail: 'Une amplitude e bradicardia.',
            correct:
              'Fino + bradi = bradisfigmia — distinto de filiforme puro, que é apenas “pulso fino”.',
          },
        ],
        footer_rule: 'Só E = amplitude sem FC',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343956155-6': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline: 'MS/Potter — artéria carótida: pulso central palpado no pescoço · lateral à traqueia',
    roi_error: 'pulso_periferico_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pulso no pescoço — carótida',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Qual pulso é verificado na região do pescoço?',
            icon: 'Target',
          },
          {
            label: 'Carótida',
            detail:
              'Grande artéria cervical — pulso central palpado no pescoço, lateral à traqueia.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — braquial',
            detail: 'Letra B: fossa antecubital do braço.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — femoral',
            detail: 'Letra C: virilha — membro inferior.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — apical/radial',
            detail: 'Letras D e E: ausculta no tórax ou punho — não são pescoço.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Pescoço = carótida → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: pulso verificado no pescoço.',
          'Mapear: pescoço cervical → artéria carótida.',
          'Testar B — braquial: braço → eliminar.',
          'Testar C — femoral: virilha → eliminar.',
          'Testar D — apical: ausculta cardíaca, não palpação cervical → eliminar.',
          'Testar E — radial: punho → eliminar.',
          'Testar A — carotídeo: sítio cervical clássico → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'Carótida no pescoço → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — locais de pulso',
        meta: slideMeta,
        content: 'ONDE PALPAR CADA PULSO',
        rows: [
          { label: 'Carótida', value: 'Pescoço — pulso central', sv_kind: 'fc', badge: 'hot' },
          { label: 'Radial', value: 'Punho — periférico de rotina', sv_kind: 'fc', badge: 'ok' },
          { label: 'Femoral', value: 'Virilha — central', sv_kind: 'fc', badge: 'ok' },
          { label: 'Braquial', value: 'Fossa antecubital', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC apical', value: 'Ausculta no ictus — estetoscópio', sv_kind: 'fc', badge: 'warn' },
        ],
        footer_rule: 'Segmento anatômico antes da letra',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PESCOÇO',
        items: [
          {
            label: 'Letra B — braquial',
            detail: 'Pulso braquial no braço.',
            correct:
              'Artéria braquial situa-se na fossa antecubital do membro superior — não no pescoço.',
          },
          {
            label: 'Letra C — femoral',
            detail: 'Pulso femoral na virilha.',
            correct:
              'Femoral é pulso central inguinal — região distante do pescoço pedido no enunciado.',
          },
          {
            label: 'Letra D — apical',
            detail: 'Pulso apical por ausculta.',
            correct:
              'FC apical é auscultada no tórax com estetoscópio — não é o pulso palpado na região cervical.',
          },
          {
            label: 'Letra E — radial',
            detail: 'Pulso radial no punho.',
            correct:
              'Radial é o pulso periférico de rotina no punho — não corresponde ao pescoço.',
          },
        ],
        footer_rule: 'Só carótida fecha pescoço',
      },
    ],
  },

  'cev-urca-enfermagem-verificacao-de-sinais-vitais-1778969752567-6': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/SBC — FC adulto 60–100 bpm · 49 bpm = bradicardia · bradisfigmia = fino + bradicardia · bradipneia = FR lenta',
    exam_vs_current:
      'Prova gabarita bradisfigmia com FC 49 bpm sem citar amplitude; terminologia estrita reservaria bradicardia isolada',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC 49 bpm — classificar',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail:
              'Adulto jovem — pulso radial palpado: 49 bpm.',
            icon: 'User',
          },
          {
            label: 'FC 49 bpm',
            detail: 'Abaixo de 60 bpm — bradicardia para adulto.',
            icon: 'HeartPulse',
          },
          {
            label: 'Alternativas cardíacas',
            detail:
              'Entre as opções, bradisfigmia é o único termo com prefixo bradi- cardíaco.',
            icon: 'Target',
          },
          {
            label: 'Pegadinha — normocardia',
            detail: 'Letra B: 49 bpm não é normocardia (60–100).',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — bradipneia',
            detail: 'Letra E: bradipneia é frequência respiratória lenta — outro sinal vital.',
            icon: 'Wind',
          },
        ],
        footer_rule: '49 bpm = bradi · eliminar FR e normo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: nomear a situação de FC 49 bpm ao palpar radial.',
          'Classificar FC: 49 < 60 → bradicardia.',
          'Testar A — normosfigmia: qualidade normal — não traduz FC baixa → eliminar.',
          'Testar B — normocardia: 49 não está em 60–100 → eliminar.',
          'Testar D — taquisfigmia: taqui + fino — oposto de bradi → eliminar.',
          'Testar E — bradipneia: parâmetro respiratório → eliminar.',
          'Testar C — bradisfigmia: único termo bradi-cardíaco oferecido → candidata.',
          'Marcar C.',
        ],
        footer_rule: '49 bpm + opções → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — terminologia FC',
        meta: slideMeta,
        content: 'FREQUÊNCIA × TERMINOLOGIA',
        rows: [
          { label: 'FC normal adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'Bradicardia', value: 'FC < 60 bpm', sv_kind: 'fc', badge: 'hot' },
          { label: 'Bradisfigmia', value: 'Pulso fino + bradicardia', sv_kind: 'fc', badge: 'hot' },
          { label: 'Taquisfigmia', value: 'Pulso fino + taquicardia', sv_kind: 'fc', badge: 'warn' },
          { label: 'Bradipneia', value: 'FR abaixo do normal — respiratório', sv_kind: 'fr', badge: 'warn' },
        ],
        footer_rule: 'Não confunda bradipneia com bradicardia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 49 BPM',
        items: [
          {
            label: 'Letra A — normosfigmia',
            detail: 'Pulso de amplitude normal.',
            correct:
              'Normosfigmia descreve qualidade do pulso — não nomeia bradicardia de 49 bpm.',
          },
          {
            label: 'Letra B — normocardia',
            detail: 'FC dentro da faixa normal.',
            correct:
              '49 bpm está abaixo de 60 — não é normocardia; adulto em repouso espera 60–100 bpm.',
          },
          {
            label: 'Letra D — taquisfigmia',
            detail: 'Pulso fino com taquicardia.',
            correct:
              'Taquisfigmia exige FC >100 — oposto de 49 bpm palpados no radial.',
          },
          {
            label: 'Letra E — bradipneia',
            detail: 'Frequência respiratória diminuída.',
            correct:
              'Bradipneia refere-se à respiração — a questão mediu FC cardíaca no pulso radial.',
          },
        ],
        footer_rule: 'Só C fecha bradi-cardíaco',
      },
    ],
  },

  'com-exam-pref-bauru-enfermagem-verificacao-de-sinais-vitais-1779344089179-1': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/Potter — pulso cervical: artéria carótida · jugular interna não é artéria palpável para FC de rotina',
    roi_error: 'pulso_periferico_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pulso cervical — carótida',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Pulso = limite palpável do fluxo sanguíneo em artéria periférica — indicador indireto do estado circulatório. Qual artéria na região cervical?',
            icon: 'Target',
          },
          {
            label: 'Carótida',
            detail:
              'Artéria cervical palpável — lateral à traqueia; pulso central na avaliação do pescoço.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — jugular',
            detail: 'Letra B: veia jugular — distensão venosa, não pulso arterial de rotina.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — temporal',
            detail: 'Letra C: região temporal da cabeça — outro sítio.',
            icon: 'MapPin',
          },
          {
            label: 'Pegadinha — braquial',
            detail: 'Letra D: membro superior — fossa antecubital.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Fluxo sanguíneo cervical = carótida',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: pulso palpável do fluxo sanguíneo em artéria periférica — qual artéria na região cervical?',
          'Fixar: avaliação do pulso como indicador indireto do estado circulatório.',
          'Fixar: cervical + palpável = carótida comum.',
          'Testar B — jugular: veia, não artéria de pulso rotineiro → eliminar.',
          'Testar C — temporal: região craniana distinta → eliminar.',
          'Testar D — braquial: braço → eliminar.',
          'Testar A — carótida: par cervical clássico → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'Carótida → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — pulso cervical',
        meta: slideMeta,
        content: 'PULSO CERVICAL — ARTÉRIA PALPÁVEL',
        rows: [
          { label: 'Artéria carótida', value: 'Região cervical — fluxo sanguíneo palpável', sv_kind: 'fc', badge: 'hot' },
          { label: 'Veia jugular', value: 'Turgência venosa — não pulso arterial', sv_kind: 'meta', badge: 'warn' },
          { label: 'Temporal', value: 'Artéria temporal — região da têmpora', sv_kind: 'fc', badge: 'ok' },
          { label: 'Braquial', value: 'Fossa antecubital — braço', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Jugular ≠ carótida em prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CERVICAL',
        items: [
          {
            label: 'Letra B — jugular',
            detail: 'Veia jugular na região cervical.',
            correct:
              'Jugular é veia — avalia-se turgência/distensão; pulso arterial cervical de rotina é a carótida.',
          },
          {
            label: 'Letra C — temporal',
            detail: 'Artéria temporal.',
            correct:
              'Temporal palpa-se na região da têmpora — não é o sítio cervical genérico pedido no enunciado.',
          },
          {
            label: 'Letra D — braquial',
            detail: 'Artéria braquial.',
            correct:
              'Braquial localiza-se no braço (fossa antecubital) — fora da região cervical.',
          },
          {
            label: 'Confundir veia e artéria',
            detail: 'Marcar jugular por estar no pescoço.',
            correct:
              'Questão pede artéria para pulso — no pescoço, a resposta é carótida, não jugular.',
          },
        ],
        footer_rule: 'Artéria cervical = carótida',
      },
    ],
  },

  'coseac-uff-enfermagem-verificacao-de-sinais-vitais-1779344253939-6': {
    family: 'protocolo',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/COFEN — FC apical: ausculta com diafragma do estetoscópio no ictus · hemitórax esquerdo · contagem 60 s',
    exam_vs_current:
      'COSEAC gabarita 4º EIC esquerdo; referência MS contemporânea = 5º EIC linha hemiclavicular no ictus',
    roi_error: 'pulso_periferico_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC apical — técnica COSEAC',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Como verificar o pulso apical (não periférico)?',
            icon: 'Target',
          },
          {
            label: 'Pegadinha — periférico × apical',
            detail:
              'Apical = ausculta no tórax · radial/carótida/femoral = palpação periférica ou central — não confundir com FC apical.',
            icon: 'GitCompare',
          },
          {
            label: 'Alternativa D',
            detail:
              'Diafragma no hemitórax esquerdo, 4º espaço intercostal — técnica apical da banca.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — palpação radial',
            detail: 'B, C e E descrevem pressão digital em artéria radial — técnica periférica, não apical.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — 60 minutos',
            detail: 'A e E citam contagem por 60 minutos — erro de tempo.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Apical = estetoscópio no tórax esquerdo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: técnica para verificação do pulso apical.',
          'Diferenciar: apical = ausculta · periférico = palpação arterial.',
          'Testar A — manguito + 60 min: técnica de PA e tempo absurdo → eliminar.',
          'Testar B — pressão na artéria 60 s: palpação periférica → eliminar.',
          'Testar C — indicador/médio 1 min: palpação periférica → eliminar.',
          'Testar E — pressão 60 min: periférico + tempo errado → eliminar.',
          'Testar D — diafragma 4º EIC esquerdo: ausculta apical → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Estetoscópio esquerdo → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — apical × periférico',
        meta: slideMeta,
        content: 'APICAL × RADIAL',
        rows: [
          { label: 'FC apical', value: 'Estetoscópio no tórax — ausculta', sv_kind: 'fc', badge: 'hot' },
          { label: 'COSEAC — sítio', value: '4º EIC esquerdo (gabarito prova)', sv_kind: 'fc', badge: 'hot' },
          { label: 'MS — ictus', value: '5º EIC esquerdo hemiclavicular', sv_kind: 'fc', badge: 'warn' },
          { label: 'FC periférica', value: 'Palpação radial — 60 s', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Apical = ausculta · não palpar artéria',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — APICAL COSEAC',
        items: [
          {
            label: 'Letra A — manguito 60 min',
            detail: 'Aparelho de pressão e contagem por hora.',
            correct:
              'Manguito mede PA — não FC apical; contagem por 60 minutos é erro de unidade (correto = 60 segundos).',
          },
          {
            label: 'Letra B — pressão 60 s',
            detail: 'Palpação suave na artéria por 60 segundos.',
            correct:
              'Pressão digital sobre artéria é técnica de pulso periférico — apical exige estetoscópio no tórax.',
          },
          {
            label: 'Letra C — indicador e médio',
            detail: 'Localizar artéria e contar 1 minuto.',
            correct:
              'Indicador e médio palpam artérias periféricas — não substituem ausculta apical com diafragma.',
          },
          {
            label: 'Letra E — pressão 60 min',
            detail: 'Palpação arterial por 60 minutos.',
            correct:
              'Combina palpação periférica com tempo impossível (60 min) — duplo erro frente à ausculta apical.',
          },
        ],
        footer_rule: 'Só D é ausculta apical',
      },
    ],
  },

  'coseac-uff-enfermagem-verificacao-de-sinais-vitais-1779344253939-8': {
    family: 'protocolo',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/COFEN — FC apical: ausculta com diafragma do estetoscópio no ictus · hemitórax esquerdo · contagem 60 s',
    exam_vs_current:
      'COSEAC gabarita 4º EIC esquerdo; referência MS contemporânea = 5º EIC linha hemiclavicular no ictus',
    roi_error: 'pulso_periferico_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC apical — técnica COSEAC',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Como verificar o pulso apical (não periférico)?',
            icon: 'Target',
          },
          {
            label: 'Pegadinha — periférico × apical',
            detail:
              'Apical = ausculta no tórax · radial/carótida/femoral = palpação periférica ou central — não confundir com FC apical.',
            icon: 'GitCompare',
          },
          {
            label: 'Alternativa D',
            detail:
              'Diafragma no hemitórax esquerdo, 4º espaço intercostal — técnica apical da banca.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — palpação radial',
            detail: 'B, C e E descrevem pressão digital em artéria radial — técnica periférica, não apical.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — 60 minutos',
            detail: 'A e E citam contagem por 60 minutos — erro de tempo.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Apical = estetoscópio no tórax esquerdo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: técnica para verificação do pulso apical.',
          'Diferenciar: apical = ausculta · periférico = palpação arterial.',
          'Testar A — manguito + 60 min: técnica de PA e tempo absurdo → eliminar.',
          'Testar B — pressão na artéria 60 s: palpação periférica → eliminar.',
          'Testar C — indicador/médio 1 min: palpação periférica → eliminar.',
          'Testar E — pressão 60 min: periférico + tempo errado → eliminar.',
          'Testar D — diafragma 4º EIC esquerdo: ausculta apical → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Estetoscópio esquerdo → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — apical × periférico',
        meta: slideMeta,
        content: 'APICAL × RADIAL',
        rows: [
          { label: 'FC apical', value: 'Estetoscópio no tórax — ausculta', sv_kind: 'fc', badge: 'hot' },
          { label: 'COSEAC — sítio', value: '4º EIC esquerdo (gabarito prova)', sv_kind: 'fc', badge: 'hot' },
          { label: 'MS — ictus', value: '5º EIC esquerdo hemiclavicular', sv_kind: 'fc', badge: 'warn' },
          { label: 'FC periférica', value: 'Palpação radial — 60 s', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Apical = ausculta · não palpar artéria',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — APICAL COSEAC',
        items: [
          {
            label: 'Letra A — manguito 60 min',
            detail: 'Aparelho de pressão e contagem por hora.',
            correct:
              'Manguito mede PA — não FC apical; contagem por 60 minutos é erro de unidade (correto = 60 segundos).',
          },
          {
            label: 'Letra B — pressão 60 s',
            detail: 'Palpação suave na artéria por 60 segundos.',
            correct:
              'Pressão digital sobre artéria é técnica de pulso periférico — apical exige estetoscópio no tórax.',
          },
          {
            label: 'Letra C — indicador e médio',
            detail: 'Localizar artéria e contar 1 minuto.',
            correct:
              'Indicador e médio palpam artérias periféricas — não substituem ausculta apical com diafragma.',
          },
          {
            label: 'Letra E — pressão 60 min',
            detail: 'Palpação arterial por 60 minutos.',
            correct:
              'Combina palpação periférica com tempo impossível (60 min) — duplo erro frente à ausculta apical.',
          },
        ],
        footer_rule: 'Só D é ausculta apical',
      },
    ],
  },

  'cpcon-uepb-enfermagem-verificacao-de-sinais-vitais-1779343801786-5': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/SBC — pulso paradoxal: queda >10 mmHg da PAS na inspiração · pulso mais fraco na inspiração · asma grave · tamponamento',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pulso paradoxal — padrão',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail:
              'João, 39 anos, asmático e cardíaco — pulso mais fraco na inspiração, mais forte na expiração.',
            icon: 'User',
          },
          {
            label: 'Pulso paradoxal',
            detail:
              'Queda da amplitude do pulso durante a inspiração — clássico em asma e tamponamento.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — taqui/bradi × paradoxal',
            detail:
              'Não confundir bigeminado ou taquicardia/bradicardia (FC 60–100 bpm) com variação inspiratória do pulso.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha — bigeminado',
            detail: 'Letra B: batimentos em pares alternados — arritmia, não ciclo respiratório.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — parvus tardus',
            detail: 'Letra C: pulso fraco e tardio — estenose aórtica, não variação inspiratória.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — normal',
            detail: 'Letra E: variação descrita não é pulso normal.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Fraco na inspiração = paradoxal',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: nomear padrão de pulso que enfraquece na inspiração e fortalece na expiração.',
          'Associar: variação com ciclo respiratório → pulso paradoxal.',
          'Testar A — magnus: pulso bounding, não relacionado à inspiração → eliminar.',
          'Testar B — bigeminado: extrasístoles alternadas → eliminar.',
          'Testar C — parvus et tardus: estenose aórtica → eliminar.',
          'Testar E — normal: achado é patológico → eliminar.',
          'Testar D — paradoxal: queda na inspiração → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Inspiração fraca → paradoxal → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — padrões de pulso',
        meta: slideMeta,
        content: 'QUALIDADE DO PULSO — NOMES',
        rows: [
          { label: 'Pulso paradoxal', value: 'Mais fraco na inspiração', sv_kind: 'fc', badge: 'hot' },
          { label: 'Bigeminado', value: 'Batimento normal + extrasístole alternados', sv_kind: 'fc', badge: 'warn' },
          { label: 'Parvus et tardus', value: 'Fraco e tardio — estenose aórtica', sv_kind: 'fc', badge: 'warn' },
          { label: 'Pulso magnus', value: 'Amplitude aumentada (bounding)', sv_kind: 'fc', badge: 'warn' },
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Paradoxal = ciclo respiratório',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PARADOXAL',
        items: [
          {
            label: 'Letra A — magnus',
            detail: 'Pulso de grande amplitude.',
            correct:
              'Magnus/bounding é pulso hipercinético — não descreve enfraquecimento inspiratório do caso.',
          },
          {
            label: 'Letra B — bigeminado',
            detail: 'Ritmo em bigeminismo.',
            correct:
              'Bigeminado alterna batimento normal e extrasístole — padrão arrítmico, não variação com respiração.',
          },
          {
            label: 'Letra C — parvus et tardus',
            detail: 'Pulso parvus et tardus ou anácroto.',
            correct:
              'Parvus tardus é pulso fraco e tardio na estenose aórtica — não liga fraqueza ao ciclo inspiratório.',
          },
          {
            label: 'Letra E — normal',
            detail: 'Pulso dentro do padrão esperado.',
            correct:
              'Variação considerável com inspiração/expiração em asmático cardíaco é achado patológico — pulso paradoxal.',
          },
        ],
        footer_rule: 'Inspiração fraca → só D',
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
    console.log(`[handcraft:sv-g27] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g27] total=${ok}`);
}

main();
