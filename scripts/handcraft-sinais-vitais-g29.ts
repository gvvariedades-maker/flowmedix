#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g29 (8 slugs P1 vitals_fc_faixas batch 4).
 *
 *   npm run handcraft:sinais-vitais-g29
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g29';
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
    'bradicardia <60',
    'taquicardia >100',
    'bradisfigmia / taquisfigmia',
    'bradipneia / taquipneia',
    'avaliação do pulso — frequência ritmo intensidade',
    'alterações posturais e pulso',
    'hiperpneia — FR aumentada',
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
  'fuvest-enfermagem-verificacao-de-sinais-vitais-1779344137078-2': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — taquicardia adulto >100 bpm · bradipneia FR <12 irpm · PA sistólica = pico na ejeção · hiperpneia = FR e profundidade aumentadas',
    exam_vs_current:
      'Letra A usa corte 120 bpm para taquicardia; referência atual adulto = >100 bpm — slides seguem gabarito D',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Definições de SV — adulto',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assinale a afirmativa correta sobre sinais vitais em pacientes adultos.',
            icon: 'Target',
          },
          {
            label: 'Hiperpneia (gabarito)',
            detail:
              'Respiração difícil com profundidade e frequência aumentadas — FR superior a 20 irpm.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — taquicardia',
            detail: 'Letra A: corte 120 bpm — prova erra o limiar clássico de 100 bpm.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — PA',
            detail: 'Letra C: pico na ejeção = pressão sistólica, não diastólica.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — bradipneia',
            detail: 'Letra B: bradipneia é FR lenta — verificar se o corte da alternativa confere.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Teste cada definição antes de marcar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre SV em adultos.',
          'Testar A — taquicardia >120: corte atípico; taquicardia clássica adulto = >100 bpm → eliminar.',
          'Testar B — bradipneia <8 irpm: definição de bradipneia pode variar; conferir se fecha como única correta → eliminar.',
          'Testar C — pico na ejeção = diastólica: inverte sistólica/diastólica → eliminar.',
          'Testar D — hiperpneia: FR e profundidade aumentadas, >20 irpm → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Só D fecha definição respiratória coerente',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — terminologia SV',
        meta: slideMeta,
        content: 'DEFINIÇÕES — ADULTO',
        rows: [
          { label: 'Taquicardia', value: 'FC > 100 bpm (referência MS)', sv_kind: 'fc', badge: 'hot' },
          { label: 'Bradipneia', value: 'FR abaixo do normal (<12 irpm)', sv_kind: 'fr', badge: 'warn' },
          { label: 'Hiperpneia', value: 'FR e profundidade aumentadas', sv_kind: 'fr', badge: 'ok' },
          { label: 'PA sistólica', value: 'Pico na ejeção ventricular', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Sistólica = ejeção · diastólica = relaxamento',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEFINIÇÕES FUVEST',
        items: [
          {
            label: 'Letra A — taquicardia >120',
            detail: 'Taquicardia acima de 120 batimentos/minuto.',
            correct:
              'Referência adulto em repouso: taquicardia = FC >100 bpm — corte de 120 bpm invalida a afirmativa.',
          },
          {
            label: 'Letra B — bradipneia <8',
            detail: 'Bradipneia abaixo de 8 respirações/minuto.',
            correct:
              'Bradipneia é FR lenta, mas a definição da alternativa não fecha como única correta frente à hiperpneia (D).',
          },
          {
            label: 'Letra C — diastólica na ejeção',
            detail: 'Pico máximo na ejeção = pressão diastólica.',
            correct:
              'O pico na ejeção ventricular corresponde à pressão sistólica — diastólica é o relaxamento.',
          },
        ],
        footer_rule: 'Hiperpneia = D',
      },
    ],
  },

  'ibfc-enfermagem-verificacao-de-sinais-vitais-1779344117207-1': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/SBC — bradisfigmia: pulso fino + bradicardia (<60 bpm) · taquisfigmia: fino + taquicardia (>100)',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Bradisfigmia — lacuna',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Preencher: a terminologia ___ deve ser usada quando o pulso se apresenta fino e bradicárdico.',
            icon: 'Target',
          },
          {
            label: 'Bradisfigmia',
            detail: 'Bradi- (lento) + -sfigmia (pulso fino): une FC baixa e amplitude reduzida.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — só bradicardia',
            detail: 'Letra A: omite qualidade “fino” do pulso.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — taquisfigmia',
            detail: 'Letra B: fino + taquicárdico — oposto do enunciado.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — taquicardia',
            detail: 'Letra D: FC elevada — contrário de bradicárdico.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Fino + bradicárdico = bradisfigmia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: termo para pulso fino e bradicárdico.',
          'Decodificar: bradi- = FC lenta · -sfigmia = pulso fino.',
          'Testar A — bradicardia: só frequência, falta amplitude → eliminar.',
          'Testar B — taquisfigmia: fino + taqui — oposto → eliminar.',
          'Testar D — taquicardia: FC alta — oposto → eliminar.',
          'Testar E — normocardia: FC normal — oposto → eliminar.',
          'Testar C — bradisfigmia: fino + bradicárdico → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'Lacuna → bradisfigmia → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — terminologia pulso',
        meta: slideMeta,
        content: 'FREQUÊNCIA × AMPLITUDE',
        rows: [
          { label: 'Bradisfigmia', value: 'Pulso fino + bradicardia', sv_kind: 'fc', badge: 'hot' },
          { label: 'Taquisfigmia', value: 'Pulso fino + taquicardia', sv_kind: 'fc', badge: 'warn' },
          { label: 'Bradicardia', value: 'FC < 60 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'Taquicardia', value: 'FC > 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC normal adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: '-sfigmia exige pulso fino',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BRADISFIGMIA IBFC',
        items: [
          {
            label: 'Letra A — bradicardia',
            detail: 'Apenas FC abaixo do normal.',
            correct:
              'Bradicardia nomeia só a frequência — enunciado exige também pulso fino (-sfigmia).',
          },
          {
            label: 'Letra B — taquisfigmia',
            detail: 'Pulso fino com taquicardia.',
            correct:
              'Taquisfigmia combina fino + taqui — enunciado pede fino + bradicárdico.',
          },
          {
            label: 'Letra D — taquicardia',
            detail: 'FC acima de 100 bpm.',
            correct:
              'Taquicardia é frequência elevada — oposto de bradicárdico citado na lacuna.',
          },
          {
            label: 'Letra E — normocardia',
            detail: 'FC dentro da faixa normal.',
            correct:
              'Normocardia = 60–100 bpm — incompatível com pulso bradicárdico do enunciado.',
          },
        ],
        footer_rule: 'Só C une fino + bradi',
      },
    ],
  },

  'ibfc-enfermagem-verificacao-de-sinais-vitais-1779344152370-7': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/SBC — FC 102 bpm = taquicardia adulto (>100) · taquisfigmia exige pulso fino · pulso cheio/forte ≠ taquisfigmia',
    exam_vs_current:
      'Gabarito aceita taquisfigmia com pulso cheio e forte; terminologia estrita reservaria taquisfigmia ao pulso fino',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC 102 bpm — classificar',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail:
              'Adulto jovem — FC 102 bpm, pulso cheio, forte e rítmico.',
            icon: 'User',
          },
          {
            label: 'Taquicardia',
            detail: '102 > 100 bpm — frequência cardíaca elevada para adulto.',
            icon: 'HeartPulse',
          },
          {
            label: 'Gabarito da prova',
            detail:
              'Alternativa B: taquicardia ou taquisfigmia — “ou” permite ambos na banca.',
            icon: 'Target',
          },
          {
            label: 'Pegadinha — bradicardia',
            detail: 'Letra A: FC alta — oposto de bradi.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — ritmo/qualidade',
            detail: 'Letras C e D: irregularidade ou dicrótico — enunciado diz rítmico e cheio.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '102 bpm = taqui · prova aceita B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: nomear quadro de FC 102 bpm em adulto jovem.',
          'Classificar FC: 102 > 100 → taquicardia.',
          'Notar qualidade: pulso cheio e forte — não filiforme.',
          'Testar A — bradicardia/bradisfigmia: FC alta → eliminar.',
          'Testar C — pulso irregular: enunciado diz rítmico → eliminar.',
          'Testar D — dicrótico: dupla onda — não descrito → eliminar.',
          'Testar B — taquicardia ou taquisfigmia: cobre FC elevada → candidata.',
          'Marcar B.',
        ],
        footer_rule: '102 bpm → taquicardia → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FC adulto',
        meta: slideMeta,
        content: 'CLASSIFICAÇÃO — 102 BPM',
        rows: [
          { label: 'FC 102 bpm', value: 'Taquicardia (adulto >100)', sv_kind: 'fc', badge: 'hot' },
          { label: 'Taquisfigmia', value: 'Pulso fino + taquicardia', sv_kind: 'fc', badge: 'warn' },
          { label: 'Bradisfigmia', value: 'Pulso fino + bradicardia', sv_kind: 'fc', badge: 'warn' },
          { label: 'FC normal', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Cheio/forte ≠ taquisfigmia estrita',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 102 BPM IBFC',
        items: [
          {
            label: 'Letra A — bradicardia',
            detail: 'Bradicardia ou bradisfigmia.',
            correct:
              '102 bpm está acima de 100 — é taquicardia, não bradicardia nem bradisfigmia.',
          },
          {
            label: 'Letra C — irregular',
            detail: 'Pulso irregular.',
            correct:
              'Enunciado descreve pulso rítmico — irregularidade não corresponde ao achado.',
          },
          {
            label: 'Letra D — dicrótico',
            detail: 'Pulso dicrótico.',
            correct:
              'Dicrótico = dupla onda por batimento — caso traz pulso cheio, forte e rítmico.',
          },
        ],
        footer_rule: 'Taquicardia fecha B',
      },
    ],
  },

  'instituto-access-enfermagem-verificacao-de-sinais-vitais-1779343789998-2': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/COFEN/Potter — avaliação do pulso: frequência, ritmo, intensidade, igualdade · FC apical requer estetoscópio · hipovolemia → taquicardia compensatória · postura altera FC',
    roi_error: 'pulso_tecnica_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Avaliação do pulso — dimensões',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Pulso = indicador indireto do estado circulatório — frequência, ritmo, intensidade e igualdade.',
            icon: 'Target',
          },
          {
            label: 'Postura e FC',
            detail:
              'Mudanças posturais (deitado → sentado → ortostase) alteram a frequência do pulso.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — intensidade',
            detail: 'Letra A: intensidade costuma ser constante batimento a batimento em ritmo regular.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — apical',
            detail:
              'Letra B: FC apical é auscultada com estetoscópio — indicador e médio palpam radial, não apical.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — hipovolemia',
            detail:
              'Letra C: perda de sangue gera taquicardia compensatória — não bradicardia nem FC <60 bpm.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Quatro dimensões + postura importa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre avaliação do pulso.',
          'Testar A — intensidade varia a cada batimento: em ritmo regular, intensidade tende a ser igual → eliminar.',
          'Testar B — apical sem estetoscópio: ausculta cardíaca exige estetoscópio → eliminar.',
          'Testar C — hipovolemia diminui FC: resposta simpática aumenta FC na perda de volume → eliminar.',
          'Testar D — postura altera FC: ortostase e mudanças posturais modificam frequência → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Postura muda pulso → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — avaliação do pulso',
        meta: slideMeta,
        content: 'DIMENSÕES DO PULSO',
        rows: [
          { label: 'Frequência', value: 'Batimentos por minuto', sv_kind: 'fc', badge: 'ok' },
          { label: 'Ritmo', value: 'Regular ou irregular', sv_kind: 'fc', badge: 'ok' },
          { label: 'Intensidade', value: 'Fino · normal · bounding', sv_kind: 'fc', badge: 'ok' },
          { label: 'Postura', value: 'Ortostase pode ↑ FC transitória', sv_kind: 'fc', badge: 'hot' },
        ],
        footer_rule: 'Apical = estetoscópio no tórax',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PULSO ACCESS',
        items: [
          {
            label: 'Letra A — intensidade variável',
            detail: 'Intensidade não permanece igual a cada batimento.',
            correct:
              'Em ritmo regular, a intensidade do pulso costuma ser consistente — A inverte o conceito.',
          },
          {
            label: 'Letra B — apical sem esteto',
            detail: 'FC apical não requer estetoscópio.',
            correct:
              'Frequência cardíaca apical é obtida por ausculta do ápice cardíaco — estetoscópio é obrigatório.',
          },
          {
            label: 'Letra C — hipovolemia ↓ FC',
            detail: 'Perda de sangue diminui a frequência do pulso.',
            correct:
              'Hipovolemia ativa resposta simpática — taquicardia compensatória, não bradicardia.',
          },
        ],
        footer_rule: 'Só D é fisiologicamente correta',
      },
    ],
  },

  'instituto-evo-enfermagem-verificacao-de-sinais-vitais-1778969737311-4': {
    family: 'protocolo',
    branch: 'vitals_fc_faixas',
    guideline: 'MS/SBC — FC adulto em repouso: 60 a 100 bpm',
    exam_vs_current:
      'Prova gabarita 50–100 bpm; referência MS/SBC adulto = 60–100 bpm — slides seguem gabarito C',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC ideal — adulto jovem',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Pulso ideal do adulto jovem — qual faixa de batimentos por minuto?',
            icon: 'Target',
          },
          {
            label: 'Gabarito da prova',
            detail: 'Alternativa C: 50 a 100 bpm — faixa oferecida pela banca.',
            icon: 'HeartPulse',
          },
          {
            label: 'Referência MS',
            detail: 'Clínica atual: adulto em repouso = 60 a 100 bpm.',
            icon: 'BookOpen',
          },
          {
            label: 'Pegadinha — muito baixa',
            detail: 'Letra A: 30–90 inclui bradicardia extrema como “ideal”.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — limite alto',
            detail: 'Letras B e D: teto 110–115 admite taquicardia como normal.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Na prova: 50–100 → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: faixa de pulso ideal em adulto jovem.',
          'Referência de prova: comparar limites inferior e superior de cada alternativa.',
          'Testar A — 30–90: limite inferior muito baixo → eliminar.',
          'Testar B — 60–110: teto acima de 100 admite taqui → eliminar.',
          'Testar D — 65–115: teto alto e piso acima de 60 → eliminar.',
          'Testar C — 50–100: única faixa com teto em 100 oferecida → candidata.',
          'Marcar C.',
          'Fixação clínica: MS usa 60–100 bpm — registrar divergência se necessário.',
        ],
        footer_rule: 'Prova → C (50–100)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FC adulto',
        meta: slideMeta,
        content: 'FAIXA FC — ADULTO',
        rows: [
          { label: 'MS/SBC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'Alternativa C', value: '50 a 100 bpm (faixa da prova)', sv_kind: 'fc', badge: 'hot' },
          { label: 'Bradicardia', value: 'FC < 60 bpm', sv_kind: 'fc', badge: 'warn' },
          { label: 'Taquicardia', value: 'FC > 100 bpm', sv_kind: 'fc', badge: 'warn' },
        ],
        footer_rule: 'Prova C · clínica 60–100',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FAIXA FC EVO',
        items: [
          {
            label: 'Letra A — 30–90',
            detail: 'Pulso ideal entre 30 e 90 bpm.',
            correct:
              '30 bpm é bradicardia grave — não compõe faixa “ideal” em alternativa de prova.',
          },
          {
            label: 'Letra B — 60–110',
            detail: 'Pulso ideal entre 60 e 110 bpm.',
            correct:
              'Teto de 110 bpm inclui taquicardia — a banca reserva C com limite em 100.',
          },
          {
            label: 'Letra D — 65–115',
            detail: 'Pulso ideal entre 65 e 115 bpm.',
            correct:
              'Piso de 65 exclui bradicardia leve e teto 115 normaliza taquicardia — distrator amplo.',
          },
        ],
        footer_rule: 'C = gabarito da banca',
      },
    ],
  },

  'ivin-enfermagem-verificacao-de-sinais-vitais-1779343822075-3': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — FC 48 bpm = bradicardia · FR 10 irpm = bradipneia · ordem: FC primeiro, FR depois',
    exam_vs_current:
      'Gabarito prova marca A (taquicardia + taquipneia) para FC 48 e FR 10; clinicamente correto = bradicardia + bradipneia (B) — slides seguem gabarito catalogado',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC 48 + FR 10 — traduzir',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail: 'FC 48 bpm e FR 10 irpm — nomear as duas alterações na ordem do enunciado.',
            icon: 'User',
          },
          {
            label: 'Gabarito da prova',
            detail: 'Letra A: taquicardia e taquipneia — resposta catalogada.',
            icon: 'Target',
          },
          {
            label: 'Tradução clínica',
            detail: '48 < 60 = bradicardia · 10 < 12 = bradipneia — registrar divergência.',
            icon: 'BookOpen',
          },
          {
            label: 'Pegadinha — ordem invertida',
            detail: 'Letra C: troca FC e FR de posição.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — apneia',
            detail: 'Letra D: apneia = ausência de respiração — FR 10 não é apneia.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Prova → A · clínica → bradi + bradipneia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: termos para FC 48 bpm e FR 10 irpm, respectivamente.',
          'Nota clínica: 48 bpm = bradicardia · 10 irpm = bradipneia — gabarito catalogado difere.',
          'Testar B — bradicardia e bradipneia: clinicamente correta, mas prova marca A → eliminar para gabarito.',
          'Testar C — ordem invertida (bradipneia primeiro) → eliminar.',
          'Testar D — apneia: FR 10 não é ausência respiratória → eliminar.',
          'Testar E — taquisfigmia e dispneia: termos não correspondem aos valores → eliminar.',
          'Gabarito catalogado: letra A — taquicardia e taquipneia.',
          'Marcar A conforme prova.',
        ],
        footer_rule: 'Gabarito prova → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FC e FR adulto',
        meta: slideMeta,
        content: 'TRADUÇÃO — CASO IVIN',
        rows: [
          { label: 'Bradicardia', value: 'FC abaixo de 60 bpm', sv_kind: 'fc', badge: 'hot' },
          { label: 'Bradipneia', value: 'FR abaixo de 12 irpm', sv_kind: 'fr', badge: 'hot' },
          { label: 'Taquicardia', value: 'FC acima de 100 bpm', sv_kind: 'fc', badge: 'warn' },
          { label: 'Taquipneia', value: 'FR acima de 20 irpm', sv_kind: 'fr', badge: 'warn' },
        ],
        footer_rule: 'Valores do caso ≠ gabarito A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FC+FR IVIN',
        items: [
          {
            label: 'Letra B — bradicardia e bradipneia',
            detail: 'Bradicardia e bradipneia.',
            correct:
              'Clinicamente correta para 48 bpm e 10 irpm — prova cataloga A; memorize o gabarito da questão.',
          },
          {
            label: 'Letra C — ordem trocada',
            detail: 'Bradipneia e bradicardia.',
            correct:
              'Termos até poderiam descrever os valores, mas a ordem inverte FC e FR pedida no enunciado.',
          },
          {
            label: 'Letra D — apneia',
            detail: 'Bradicardia e apneia.',
            correct:
              'FR 10 irpm é respiração lenta (bradipneia) — apneia seria ausência de movimentos respiratórios.',
          },
          {
            label: 'Letra E — taquisfigmia',
            detail: 'Taquisfigmia e dispneia.',
            correct:
              '48 bpm não é taquicardia nem taquisfigmia; dispneia é sensação, não nome de FR 10 irpm.',
          },
        ],
        footer_rule: 'Gabarito catalogado: A',
      },
    ],
  },

  'ivin-enfermagem-verificacao-de-sinais-vitais-1779343919045-7': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — FC abaixo de 60 bpm = bradicardia · FR abaixo de 12 irpm = bradipneia · anotar FR primeiro, FC depois conforme enunciado',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FR baixa + FC baixa — anotação',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail:
              'R.G.S., 40 anos — FR abaixo de 12 irpm e FC abaixo de 60 bpm. Anotar alterações respectivamente (FR → FC).',
            icon: 'User',
          },
          {
            label: 'Bradipneia',
            detail: 'FR abaixo de 12 irpm em adulto.',
            icon: 'Wind',
          },
          {
            label: 'Bradicardia',
            detail: 'FC abaixo de 60 bpm em adulto.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — taqui',
            detail: 'Letras A e B: ambos parâmetros estão baixos — não taqui.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — apneia',
            detail: 'Letra E: FR 10 não é ausência respiratória.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'FR baixa + FC baixa → bradipneia + bradicardia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: descrever FR baixa e FC baixa, nessa ordem.',
          'Traduzir FR: abaixo de 12 irpm → bradipneia.',
          'Traduzir FC: abaixo de 60 bpm → bradicardia.',
          'Testar A — taquipneia e taquicardia: valores baixos → eliminar.',
          'Testar B — taquipneia e bradicardia: FR baixa é bradipneia, não taqui → eliminar.',
          'Testar D — bradipneia e taquicardia: FC baixa é bradicardia → eliminar.',
          'Testar E — apneia e bradicardia: FR 10 não é apneia → eliminar.',
          'Testar C — bradipneia e bradicardia: combinação correta → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'Bradipneia + bradicardia → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação',
        meta: slideMeta,
        content: 'FR × FC — ADULTO',
        rows: [
          { label: 'Bradipneia', value: 'FR abaixo de 12 irpm', sv_kind: 'fr', badge: 'hot' },
          { label: 'Bradicardia', value: 'FC abaixo de 60 bpm', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR normal', value: '12 a 20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'FC normal', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Respeite a ordem FR → FC do enunciado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ANOTAÇÃO IVIN',
        items: [
          {
            label: 'Letra A — taquipneia e taquicardia',
            detail: 'Ambos os parâmetros elevados.',
            correct:
              'FR e FC do caso estão abaixo do normal — não há taquipneia nem taquicardia.',
          },
          {
            label: 'Letra B — taquipneia e bradicardia',
            detail: 'FR alta e FC baixa.',
            correct:
              'FR abaixo de 12 irpm é bradipneia — taquipneia exigiria FR acima de 20 irpm.',
          },
          {
            label: 'Letra D — bradipneia e taquicardia',
            detail: 'FR baixa e FC alta.',
            correct:
              'FC abaixo de 60 bpm é bradicardia — taquicardia exigiria FC acima de 100 bpm.',
          },
          {
            label: 'Letra E — apneia',
            detail: 'Ausência de respiração e bradicardia.',
            correct:
              'FR abaixo de 12 irpm documenta respiração lenta — apneia seria zero incursões.',
          },
        ],
        footer_rule: 'Só C fecha os dois valores',
      },
    ],
  },

  'objetiva-concursos-enfermagem-verificacao-de-sinais-vitais-1779344158323-3': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline: 'MS/SBC — taquisfigmia: pulso fino + taquicardia (>100 bpm)',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Taquisfigmia — terminologia',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Terminologia para pulso fino e taquicárdico.',
            icon: 'Target',
          },
          {
            label: 'Taquisfigmia',
            detail: 'Taqui- (rápido) + -sfigmia (pulso fino): une FC elevada e amplitude reduzida.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — só taquicardia',
            detail: 'Letra A: omite qualidade “fino” do pulso.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — taquipneia',
            detail: 'Letra D: parâmetro respiratório — outro sinal vital.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — arritmia',
            detail: 'Letra C: taquiarritmia = ritmo, não amplitude + FC.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Fino + taqui = taquisfigmia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: termo para pulso fino e taquicárdico.',
          'Decodificar: taqui- = FC alta · -sfigmia = pulso fino.',
          'Testar A — taquicardia: só frequência, falta “fino” → eliminar.',
          'Testar C — taquiarritmia: distúrbio de ritmo — não descreve amplitude → eliminar.',
          'Testar D — taquipneia: frequência respiratória → eliminar.',
          'Testar B — taquisfigmia: fino + taquicárdico → candidata.',
          'Marcar B.',
        ],
        footer_rule: 'Fino + taqui → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — terminologia pulso',
        meta: slideMeta,
        content: 'FREQUÊNCIA + AMPLITUDE',
        rows: [
          { label: 'Taquisfigmia', value: 'Pulso fino + taquicardia', sv_kind: 'fc', badge: 'hot' },
          { label: 'Bradisfigmia', value: 'Pulso fino + bradicardia', sv_kind: 'fc', badge: 'warn' },
          { label: 'Taquicardia', value: 'FC > 100 bpm (só frequência)', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC normal adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: '-sfigmia = pulso fino',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TAQUISFIGMIA OBJETIVA',
        items: [
          {
            label: 'Letra A — taquicardia',
            detail: 'Apenas frequência cardíaca elevada.',
            correct:
              'Taquicardia nomeia só a FC — enunciado exige também pulso fino (-sfigmia).',
          },
          {
            label: 'Letra C — taquiarritmia',
            detail: 'Ritmo cardíaco acelerado e irregular.',
            correct:
              'Taquiarritmia refere-se ao ritmo — não une amplitude fina com taquicardia.',
          },
          {
            label: 'Letra D — taquipneia',
            detail: 'Frequência respiratória aumentada.',
            correct:
              'Taquipneia é parâmetro respiratório — questão trata de pulso cardíaco.',
          },
        ],
        footer_rule: 'Só B fecha fino + taqui',
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
    console.log(`[handcraft:sv-g29] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g29] total=${ok}`);
}

main();
