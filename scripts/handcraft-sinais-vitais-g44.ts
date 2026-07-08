#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g44 (5 slugs SHORT LOTE vitals_spo2).
 * Cluster SpO₂ e oximetria (5 slugs — g44 fecha cluster inteiro).
 *
 *   npm run handcraft:sinais-vitais-g44
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g44';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN',
  title: 'Oximetria de pulso — SpO₂, técnica e interpretação',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'SpO₂ normal ≥95% em ar ambiente',
    'hipoxemia <95%',
    'oximetria de pulso — saturação periférica arterial',
    'sensor em digitais · lóbulos · extremidades',
    'fatores que alteram leitura — perfusão · esmalte · movimento',
    'oximetria ≠ gasometria (PaO₂/PaCO₂)',
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
    pedagogical_branch: 'vitals_spo2',
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
  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343801786-6': {
    family: 'conceito',
    guideline:
      'MS/COFEN — oximetria de pulso estima oxigenação do sangue arterial periférico (SpO₂); não mede sangue venoso isolado nem gases dissolvidos',
    roi_error: 'spo2_venoso_gasoso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Oximetria — oxigenação arterial',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Completar o termo: oximetria de pulso estima a oxigenação do sangue __________.',
            icon: 'Target',
          },
          {
            label: 'Oximetria de pulso',
            detail:
              'Sensor óptico em extremidade perfundida lê saturação periférica de O₂ no sangue arterial (SpO₂).',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — venoso',
            detail: 'Letra B sugere sangue venoso — oxímetro capta pulso arterial periférico, não leitura venosa.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — “arterial e venoso”',
            detail: 'Letra C mistura compartimentos — leitura é de hemoglobina arterial pulsátil no sítio do sensor.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — gasoso',
            detail: 'Letra D confunde saturação da Hb com oxigênio “gasoso” dissolvido — isso é gasometria (PaO₂).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Oximetria = oxigenação arterial periférica (SpO₂)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: preencher o nome correto — oximetria estima oxigenação do sangue ______.',
          'Fixar: clip de oximetria → saturação periférica no sangue arterial pulsátil.',
          'Testar A — arterial: coerente com SpO₂ em dedo/orelha → candidata.',
          'Testar B — venoso: oxímetro não mede saturação venosa central → eliminar.',
          'Testar C — arterial e venoso: mistura compartimentos → eliminar.',
          'Testar D — gasoso: confunde Hb saturada com O₂ dissolvido → eliminar.',
          'Testar E — todas corretas: há apenas um compartimento válido → eliminar.',
          'Marcar A.',
        ],
        footer_rule: 'Gabarito AVANÇASP = arterial',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — SpO₂ e oximetria',
        meta: slideMeta,
        content: 'OXIMETRIA DE PULSO · SpO₂',
        rows: [
          { label: 'O que mede', value: 'Saturação periférica de O₂ no sangue arterial (SpO₂)', sv_kind: 'meta', badge: 'hot' },
          { label: 'SpO₂ adequada', value: '≥95% em ar ambiente (adulto)', sv_kind: 'meta', badge: 'ok' },
          { label: 'Hipoxemia', value: '<95% — correlacionar com FR e quadro clínico', sv_kind: 'meta', badge: 'warn' },
          { label: 'Não é', value: 'Saturação venosa · PaO₂ · PaCO₂ (gasometria)', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Arterial periférico — não venoso nem gasoso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COMPARTIMENTO DO SANGUE',
        items: [
          {
            label: 'Letra B — venoso',
            detail: 'Oxigenação do sangue venoso.',
            correct:
              'Oxímetro de pulso capta pulso arterial periférico — não mede saturação venosa nem substitui monitorização invasiva.',
          },
          {
            label: 'Letra C — arterial e venoso',
            detail: 'Oxigenação arterial e venosa simultaneamente.',
            correct:
              'A leitura reflete hemoglobina arterial pulsátil no sítio do sensor — não soma compartimentos venosos.',
          },
          {
            label: 'Letra D — gasoso',
            detail: 'Oxigenação do sangue gasoso.',
            correct:
              'SpO₂ estima % de Hb saturada — O₂ dissolvido no plasma (PaO₂) exige gasometria arterial.',
          },
          {
            label: 'Letra E — todas corretas',
            detail: 'Todas as opções descrevem o que a oximetria mede.',
            correct:
              'Só “arterial” descreve o compartimento lido pelo sensor de pulso em extremidade perfundida.',
          },
        ],
        footer_rule: 'Só A fecha oxigenação arterial periférica',
      },
    ],
  },

  'facape-enfermagem-verificacao-de-sinais-vitais-1778969752567-1': {
    family: 'conceito',
    guideline:
      'MS/COFEN — oximetria de pulso determina saturação da hemoglobina com oxigênio (SpO₂/SaO₂); PaO₂, PaCO₂ e O₂ dissolvido = gasometria',
    roi_error: 'spo2_confunde_gasometria',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Oximetria — o que viabiliza',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'O que a oximetria de pulso viabiliza nos exames clínicos respiratórios (medida não invasiva).',
            icon: 'Target',
          },
          {
            label: 'SpO₂ / SaO₂',
            detail: 'Percentual de hemoglobina saturada com oxigênio — leitura contínua no dedo ou lóbulo.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — O₂ no plasma',
            detail: 'Letra A fala em O₂ dissolvido — parâmetro de gasometria, não do oxímetro.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — PaO₂',
            detail: 'Letra C cita pressão parcial arterial — exige punção e analisador, não clip de pulso.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — ventilação / PaCO₂',
            detail: 'Letras D e E misturam oxigenação com ventilação ou CO₂ — capnografia/gasometria.',
            icon: 'Wind',
          },
        ],
        footer_rule: 'Oxímetro = saturação da Hb — não gasometria',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: o que a oximetria de pulso viabiliza na monitorização respiratória.',
          'Fixar: medida não invasiva da saturação da hemoglobina com O₂.',
          'Testar A — O₂ dissolvido no plasma: gasometria → eliminar.',
          'Testar C — PaO₂ arterial: punção + gasômetro → eliminar.',
          'Testar D — ventilação fidedigna: oxímetro não substitui capnografia/observação de FR → eliminar.',
          'Testar E — PaCO₂ arterial: gasometria/capnografia → eliminar.',
          'Testar B — saturação da Hb com O₂ (SaO₂): função do oxímetro → candidata.',
          'Marcar B.',
        ],
        footer_rule: 'Gabarito Facape = letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Oximetria × gasometria',
        meta: slideMeta,
        content: 'MÉTODO · PARÂMETRO · INVASIVIDADE',
        rows: [
          { label: 'Oximetria de pulso', value: 'SpO₂ / SaO₂ — não invasiva', sv_kind: 'meta', badge: 'ok' },
          { label: 'SpO₂ normal', value: '≥95% em ar ambiente', sv_kind: 'meta', badge: 'ok' },
          { label: 'PaO₂ / PaCO₂', value: 'Gasometria arterial — invasiva', sv_kind: 'meta', badge: 'warn' },
          { label: 'O₂ dissolvido', value: 'Gasometria — não oxímetro de pulso', sv_kind: 'meta', badge: 'warn' },
          { label: 'Ventilação', value: 'FR + esforço + capnografia — complementam SpO₂', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Pulso mede saturação — gasometria mede pressões parciais',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — OXIMETRIA × GASOMETRIA',
        items: [
          {
            label: 'Letra A — O₂ dissolvido no plasma',
            detail: 'Medida direta da quantidade de oxigênio dissolvido no plasma sanguíneo.',
            correct:
              'Oximetria estima % de Hb saturada — O₂ dissolvido é quantificado na gasometria (conteúdo arterial).',
          },
          {
            label: 'Letra C — PaO₂ arterial',
            detail: 'Avaliação direta da pressão parcial de oxigênio no sangue arterial.',
            correct:
              'PaO₂ exige coleta arterial e gasômetro — oxímetro de pulso não mede mmHg de O₂.',
          },
          {
            label: 'Letra D — nível de ventilação',
            detail: 'Avaliação fidedigna do nível de ventilação pelo oxímetro.',
            correct:
              'SpO₂ reflete oxigenação — ventilação avalia-se por FR, esforço respiratório e capnografia.',
          },
          {
            label: 'Letra E — PaCO₂ arterial',
            detail: 'Mensuração direta da pressão parcial de CO₂ arterial.',
            correct:
              'PaCO₂ é gasometria arterial ou capnografia — sensor de oximetria não quantifica CO₂.',
          },
        ],
        footer_rule: 'Só B descreve saturação da hemoglobina (SaO₂)',
      },
    ],
  },

  'fau-unicentro-enfermagem-verificacao-de-sinais-vitais-1778969760552-3': {
    family: 'conceito',
    guideline:
      'MS/COFEN — SpO₂ expressa-se em % (saturação); rpm = FR · bpm = FC · °C = temperatura · mmHg = PA',
    roi_error: 'spo2_unidade_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SpO₂ — unidade e formato',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assinalar o valor que corresponde a resultado de oximetria de pulso.',
            icon: 'Target',
          },
          {
            label: 'SpO₂ em %',
            detail: 'Oxímetro exibe percentual de saturação — ex.: 97% (≥95% costuma ser adequado).',
            icon: 'Activity',
          },
          {
            label: 'Letra B — rpm',
            detail: 'Alternativa em respirações por minuto — frequência respiratória, não oximetria.',
            icon: 'Wind',
          },
          {
            label: 'Letra C — bpm',
            detail: 'Alternativa em batimentos por minuto — frequência cardíaca (palpação/ECG).',
            icon: 'HeartPulse',
          },
          {
            label: 'Letra D/E — °C e mmHg',
            detail: 'Temperatura corporal e pressão arterial usam outras unidades e equipamentos.',
            icon: 'Thermometer',
          },
        ],
        footer_rule: 'Oximetria → % de saturação',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: qual alternativa é valor de saturação de oxigênio (oximetria).',
          'Fixar: SpO₂ aparece em percentual (%).',
          'Testar A — percentual de saturação: formato de SpO₂ → candidata.',
          'Testar B — rpm: frequência respiratória → eliminar.',
          'Testar C — bpm: frequência cardíaca → eliminar.',
          'Testar D — °C: temperatura → eliminar.',
          'Testar E — mmHg: pressão arterial → eliminar.',
          'Marcar A.',
        ],
        footer_rule: 'Só % é SpO₂ — gabarito A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — unidades dos SV',
        meta: slideMeta,
        content: 'PARÂMETRO · UNIDADE · EQUIPAMENTO',
        rows: [
          { label: 'SpO₂', value: '% (saturação) — oxímetro de pulso', sv_kind: 'meta', badge: 'hot' },
          { label: 'SpO₂ adequada', value: '≥95% em ar ambiente', sv_kind: 'meta', badge: 'ok' },
          { label: 'FR', value: 'irpm / rpm — observação', sv_kind: 'fr', badge: 'ok' },
          { label: 'FC', value: 'bpm — palpação ou monitor', sv_kind: 'fc', badge: 'ok' },
          { label: 'Temperatura', value: '°C — termômetro', sv_kind: 'temp', badge: 'ok' },
          { label: 'PA', value: 'mmHg — esfigmomanômetro', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Não troque % por rpm, bpm, °C ou mmHg',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — UNIDADE DO PARÂMETRO',
        items: [
          {
            label: 'Letra B — rpm',
            detail: 'Valor em respirações por minuto.',
            correct:
              'rpm/irpm quantifica frequência respiratória por observação — oxímetro exibe % de saturação.',
          },
          {
            label: 'Letra C — bpm',
            detail: 'Valor em batimentos por minuto.',
            correct:
              'bpm é frequência cardíaca (palpação radial ou monitor) — não resultado de oximetria de pulso.',
          },
          {
            label: 'Letra D — °C',
            detail: 'Valor em graus Celsius.',
            correct:
              'Temperatura corporal aferida com termômetro — unidade e método distintos do oxímetro.',
          },
          {
            label: 'Letra E — mmHg',
            detail: 'Valor em milímetros de mercúrio.',
            correct:
              'mmHg expressa pressão arterial no manguito — oxímetro não mede pressão, só saturação em %.',
          },
        ],
        footer_rule: 'Só % é SpO₂ — gabarito letra A',
      },
    ],
  },

  'fepese-enfermagem-verificacao-de-sinais-vitais-1779343883917-6': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — sensor de oximetria em extremidades perfundidas: digitais (mãos/pés) e lóbulos das orelhas; evitar sítios sem pulso adequado',
    roi_error: 'spo2_sitio_sensor',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica — adaptação do sensor',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Outra recomendação de sítio para adaptação do sensor além das digitais (mãos e/ou pés).',
            icon: 'Target',
          },
          {
            label: 'Extremidades perfundidas',
            detail: 'Oxímetro precisa de leito capilar pulsátil — dedos e lóbulos da orelha são clássicos.',
            icon: 'Activity',
          },
          {
            label: 'Digitais (enunciado)',
            detail: 'Mãos e pés já citados como melhor adaptação — gabarito pede alternativa equivalente.',
            icon: 'Hand',
          },
          {
            label: 'Pegadinha — face/nariz',
            detail: 'Letras A–D (narinas, maçãs, queixo, lábios) não são sítios padrão de clip de SpO₂.',
            icon: 'Ban',
          },
          {
            label: 'Fatores que alteram leitura',
            detail: 'Perfusão baixa, esmalte, hipotermia e movimento podem distorcer SpO₂.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Sensor em extremidade com pulso capilar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: outra recomendação correta de adaptação do sensor de oximetria.',
          'Fixar: melhor sítio = extremidades com perfusão (dedos já citados no enunciado).',
          'Testar A — narinas: não é sítio de clip de SpO₂ → eliminar.',
          'Testar B — maçãs do rosto: não é adaptação padrão → eliminar.',
          'Testar C — queixo: sem leito capilar adequado para sensor → eliminar.',
          'Testar D — lábios: não é local recomendado → eliminar.',
          'Testar E — lóbulos das orelhas: extremidade perfundida aceita → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Gabarito FEPESE = lóbulos das orelhas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica de oximetria',
        meta: slideMeta,
        content: 'SÍTIO · CUIDADOS · LEITURA',
        rows: [
          { label: 'Sítios recomendados', value: 'Digitais (mãos/pés) · lóbulos das orelhas', sv_kind: 'meta', badge: 'ok' },
          { label: 'Princípio', value: 'Extremidade perfundida com pulso capilar detectável', sv_kind: 'meta', badge: 'hot' },
          { label: 'SpO₂ adequada', value: '≥95% — interpretar com FR e quadro clínico', sv_kind: 'meta', badge: 'ok' },
          { label: 'Falsifica leitura', value: 'Esmalte · hipoperfusão · hipotermia · tremor', sv_kind: 'meta', badge: 'warn' },
          { label: 'Hipoxemia', value: '<95% — reavaliar técnica e oxigenação', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Lóbulo = alternativa clássica às digitais',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SÍTIO DO SENSOR',
        items: [
          {
            label: 'Letra A — narinas',
            detail: 'Adaptação do sensor nas narinas.',
            correct:
              'Narinas não são sítio de oximetria de pulso — sensor clipa dedo ou lóbulo com leito capilar.',
          },
          {
            label: 'Letra B — maçãs do rosto',
            detail: 'Adaptação nas maçãs do rosto.',
            correct:
              'Região malar não oferece leito capilar padrão para clip óptico — use extremidades perfundidas.',
          },
          {
            label: 'Letra C — queixo',
            detail: 'Adaptação no queixo.',
            correct:
              'Queixo não é local recomendado — falta pulso capilar consistente para o fotodetector.',
          },
          {
            label: 'Letra D — lábios',
            detail: 'Adaptação nos lábios inferior/superior.',
            correct:
              'Lábios não são sítio habitual de SpO₂ — banca troca por região facial sem perfusão adequada.',
          },
        ],
        footer_rule: 'E = lóbulos — par com digitais do enunciado',
      },
    ],
  },

  'instituto-consulpam-enfermagem-verificacao-de-sinais-vitais-1779344127707-6': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — SpO₂ ≥95% adequada; hipoxemia <95%; FC adulto 60–100 bpm; FC 120 bpm = taquicardia',
    roi_error: 'spo2_fc_interpretacao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Caso — SpO₂ 98% e FC 120 bpm',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Julgar se SatO₂ 98% e FC 120 bpm estão dentro ou acima dos padrões de normalidade.',
            icon: 'Target',
          },
          {
            label: 'SpO₂ 98%',
            detail: '≥95% — saturação adequada em ar ambiente; não é hipoxemia.',
            icon: 'Activity',
          },
          {
            label: 'FC 120 bpm',
            detail: '>100 bpm em adulto — taquicardia; acima da faixa 60–100 bpm.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — “ambos alterados”',
            detail: 'Letra A eleva SpO₂ e FC — 98% está normal, só FC está alta.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — hipoxemia',
            detail: 'Letra B trata 98% como baixo — hipoxemia seria <95%.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'SpO₂ ok + FC taquicárdica → julgar separado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar SatO₂ 98% e FC 120 bpm quanto à normalidade.',
          'Interpretar SpO₂: 98% ≥95% → dentro do padrão de adequação.',
          'Interpretar FC: 120 bpm >100 → acima do normal (taquicardia).',
          'Testar A — ambos acima: SpO₂ não está elevada demais → eliminar.',
          'Testar B — SpO₂ abaixo: 98% não é hipoxemia → eliminar.',
          'Testar C — ambos normais: FC 120 é taquicardia → eliminar.',
          'Testar D — SpO₂ normal e FC acima: combina os achados → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Gabarito Consulpam = letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas SpO₂ e FC',
        meta: slideMeta,
        content: 'INTERPRETAÇÃO INTEGRADA — CASO',
        rows: [
          { label: 'SpO₂ 98%', value: 'Dentro do padrão (≥95%)', sv_kind: 'meta', badge: 'ok' },
          { label: 'Hipoxemia', value: 'SpO₂ <95%', sv_kind: 'meta', badge: 'warn' },
          { label: 'FC normal adulto', value: '60–100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC 120 bpm', value: 'Taquicardia — acima do normal', sv_kind: 'fc', badge: 'hot' },
          { label: 'Conduta enfermagem', value: 'Registrar SV e comunicar alteração de FC', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Oxigenação ok não cancela taquicardia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INTERPRETAÇÃO DO CASO',
        items: [
          {
            label: 'Letra A — ambos acima do normal',
            detail: 'FC e SpO₂ encontram-se acima dos padrões de normalidade.',
            correct:
              '98% é saturação adequada (≥95%) — só a FC 120 bpm está acima; não generalize “ambos”.',
          },
          {
            label: 'Letra B — SpO₂ abaixo do normal',
            detail: 'Saturação encontra-se abaixo dos padrões de normalidade.',
            correct:
              '98% está acima do limiar de hipoxemia (<95%) — alternativa inverte o achado do oxímetro.',
          },
          {
            label: 'Letra C — ambos dentro do normal',
            detail: 'Ambos os parâmetros dentro dos padrões de normalidade.',
            correct:
              'FC 120 bpm excede 100 bpm (taquicardia) — não pode classificar frequência cardíaca como normal.',
          },
        ],
        footer_rule: 'D separa SpO₂ adequada de FC taquicárdica',
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
    console.log(`[handcraft:sv-g44] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g44] total=${ok}`);
}

main();
