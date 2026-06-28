#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — respiratorio-cronico-g01 (9 slugs pendentes).
 * Uso: npx tsx scripts/handcraft-respiratorio-cronico-g01.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const SUBTOPICO = 'Doenças Respiratórias Crônicas (Asma, DPOC)';
const REVIEWED = '2026-06-27';

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[] };
  reverse_study_slides: unknown[];
  modulo_slug?: string;
};

type SlidePack = {
  family: 'conceito' | 'vf' | 'protocolo';
  guideline: string;
  sources: { id: string; tier: 'A' | 'B'; issuer: string; title: string; year: number; url?: string; covers: string[] }[];
  concept_map: Record<string, unknown>;
  golden_rule: Record<string, unknown>;
  logic_flow: Record<string, unknown>;
  danger_zone: Record<string, unknown>;
};

function metaBase(q: Q, family: string, guideline: string) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM').toUpperCase().includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    content_standard: 'golden-v1',
    family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: guideline,
      exam_vs_current: 'none',
    },
    sources: [] as SlidePack['sources'],
  };
}

function wrongOptions(opts: Opt[]): Opt[] {
  return opts.filter((o) => !o.is_correct);
}

function correctOption(opts: Opt[]): Opt {
  const c = opts.find((o) => o.is_correct);
  if (!c) throw new Error('Sem gabarito');
  return c;
}

const SPECS: Record<string, SlidePack> = {
  'facape-enfermagem-verificacao-de-sinais-vitais-1778969752567-1': {
    family: 'conceito',
    guideline: 'Oximetria de pulso — SatO₂ periférica (monitorização respiratória)',
    sources: [
      {
        id: 'manual-tecnico-oximetria',
        tier: 'B',
        issuer: 'Literatura técnica de enfermagem',
        title: 'Manual do Técnico de Enfermagem — oximetria de pulso',
        year: 2024,
        covers: ['SpO2', 'SaO2', 'oximetria de pulso'],
      },
    ],
    concept_map: {
      type: 'concept_map',
      slide_title: 'Oximetria de pulso — o que mede',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      items: [
        {
          label: 'ENQUADRAMENTO',
          detail: 'Prova separa oximetria de pulso (não invasiva) de gasometria arterial.',
          icon: 'Target',
        },
        {
          label: 'Oximetria de pulso',
          detail: 'Estima saturação periférica da hemoglobina com O₂ (SpO₂/SaO₂).',
          icon: 'Activity',
        },
        {
          label: 'Não mede diretamente',
          detail: 'PaO₂, PaCO₂ e O₂ dissolvido exigem gasometria arterial.',
          icon: 'XCircle',
        },
        { label: 'GABARITO — letra B', detail: 'Determina saturação da hemoglobina com oxigênio.', icon: 'CheckCircle' },
      ],
      footer_rule: 'Pulso = SatO₂; gasometria = PaO₂/PaCO₂',
    },
    golden_rule: {
      type: 'golden_rule',
      slide_title: 'Oximetria × gasometria',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'OXIMETRIA DE PULSO — REFERÊNCIA',
      rows: [
        { label: 'Oximetria', value: 'SpO₂ / SaO₂ — não invasiva', badge: 'ok' },
        { label: 'PaO₂ / PaCO₂', value: 'Gasometria arterial', badge: 'warn' },
        { label: 'Ventilação', value: 'Oximetria não substitui capnografia/VM', badge: 'warn' },
        { label: 'Gabarito', value: 'Letra B', emphasis: 'success', badge: 'hot' },
      ],
      footer_rule: 'SatO₂ no pulso — não confundir com pressão parcial',
    },
    logic_flow: {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      steps: [
        'Identificar: oximetria de pulso em contexto respiratório.',
        'Lembrar: medida não invasiva da saturação da hemoglobina.',
        'Eliminar A: O₂ dissolvido no plasma = gasometria, não oxímetro.',
        'Eliminar C: PaO₂ arterial = gasometria.',
        'Eliminar D: oximetria não avalia ventilação isoladamente.',
        'Eliminar E: PaCO₂ = gasometria/capnografia.',
        'Escolher B: SatO₂ pela oximetria de pulso.',
        'Marcar letra B.',
      ],
      footer_rule: 'Pulso mede saturação — gasometria mede pressões parciais',
    },
    danger_zone: {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'PEGADINHAS — OXIMETRIA DE PULSO',
      items: [
        {
          label: 'Letra A — O₂ dissolvido no plasma',
          detail: 'Parece relacionado a oxigenação, mas é parâmetro de gasometria.',
          correct: 'Oximetria estima saturação da Hb — não quantifica O₂ dissolvido.',
        },
        {
          label: 'Letra C — PaO₂ arterial',
          detail: 'Confunde saturação com pressão parcial de oxigênio.',
          correct: 'PaO₂ requer coleta arterial e gasometria.',
        },
        {
          label: 'Letra D — nível de ventilação',
          detail: 'Oximetria reflete oxigenação, não substitui avaliação ventilatória completa.',
          correct: 'Capnografia/VM avaliam ventilação — oxímetro mede SpO₂.',
        },
        {
          label: 'Letra E — PaCO₂ arterial',
          detail: 'Mistura oximetria com gasometria de CO₂.',
          correct: 'PaCO₂ é gasometria arterial ou capnografia — não oxímetro de pulso.',
        },
      ],
      footer_rule: 'SpO₂ no pulso; PaO₂/PaCO₂ na gasometria',
    },
  },

  'fcpc-enfermagem-processo-de-enfermagem-1780004602717-4': {
    family: 'conceito',
    guideline: 'PCDT MS — DPOC (monitorização de SpO₂ na descompensação)',
    sources: [
      {
        id: 'pcdt-dpoc-monitorizacao',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'PCDT — Doença Pulmonar Obstrutiva Crônica',
        year: 2021,
        url: 'https://www.gov.br/saude/',
        covers: ['SpO2', 'oxigenoterapia', 'DPOC'],
      },
    ],
    concept_map: {
      type: 'concept_map',
      slide_title: 'DPOC — oxímetro na emergência',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      items: [
        {
          label: 'ENQUADRAMENTO',
          detail: 'DPOC descompensada com O₂ e oximetria — técnico monitoriza e comunica hipoxemia.',
          icon: 'Target',
        },
        { label: 'SpO₂ alvo', detail: 'Queda abaixo de 90% exige comunicação imediata à equipe.', icon: 'Activity' },
        { label: 'Oxímetro', detail: 'Evitar interferência (PA no mesmo membro); trocar sítio do sensor.', icon: 'HeartPulse' },
        { label: 'GABARITO — letra A', detail: 'Comunicar SpO₂ < 90% ao médico e enfermeiro.', icon: 'CheckCircle' },
      ],
      footer_rule: 'Monitorizar SpO₂ e escalar hipoxemia',
    },
    golden_rule: {
      type: 'golden_rule',
      slide_title: 'Oxímetro na DPOC',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'SPO₂ NA DPOC — CUIDADOS',
      rows: [
        { label: 'Alerta', value: 'SpO₂ < 90% → comunicar equipe', badge: 'ok' },
        { label: 'Sensor', value: 'Trocar sítio para evitar lesão por pressão', badge: 'ok' },
        { label: 'Interferência', value: 'Não usar no braço com manguito inflado', badge: 'warn' },
        { label: 'Gabarito', value: 'Letra A', emphasis: 'success', badge: 'hot' },
      ],
      footer_rule: 'Hipoxemia comunicada — não ajuste empírico sem equipe',
    },
    logic_flow: {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      steps: [
        'Cenário: DPOC com O₂ e oximetria de pulso na emergência.',
        'Prioridade: monitorizar SpO₂ e comunicar alterações.',
        'Eliminar B: troca de sensor é cuidado válido, mas não é o foco central da questão.',
        'Eliminar C: mesmo braço do manguito de PA distorce leitura — conduta errada.',
        'Eliminar D: subtrair 5% em mãos frias não é regra padrão do oxímetro.',
        'Escolher A: comunicar SpO₂ < 90%.',
        'Marcar letra A.',
      ],
      footer_rule: 'DPOC descompensada: SpO₂ monitorada e comunicada',
    },
    danger_zone: {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'PEGADINHAS — OXÍMETRO NA DPOC',
      items: [
        {
          label: 'Letra B — trocar sensor a cada 12 h',
          detail: 'Prevenção de lesão é válida, mas a questão cobra comunicação de hipoxemia.',
          correct: 'Trocar sítio do sensor é cuidado — alerta de SpO₂ < 90% é prioridade aqui.',
        },
        {
          label: 'Letra C — oxímetro com manguito de PA',
          detail: 'Interferência hemodinâmica distorce a leitura.',
          correct: 'Não colocar sensor no membro onde a PA está sendo aferida.',
        },
        {
          label: 'Letra D — subtrair 5% com mãos frias',
          detail: 'Regra empírica inventada — aquecer/reposicionar é conduta adequada.',
          correct: 'Vasoconstrição altera sinal — aquecer membro e reavaliar, sem fórmula fixa.',
        },
      ],
      footer_rule: 'Comunicar hipoxemia antes de truques de leitura',
    },
  },

  'grupo-talent-enfermagem-processo-de-enfermagem-1780009359555-1': {
    family: 'protocolo',
    guideline: 'PCDT MS — DPOC (O₂ titulado, segurança do paciente na APS)',
    sources: [
      {
        id: 'pcdt-dpoc-o2-titulado',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'PCDT — DPOC (oxigenoterapia titulada)',
        year: 2021,
        url: 'https://www.gov.br/saude/',
        covers: ['SpO2 88-92%', 'oxigenoterapia titulada', 'DPOC'],
      },
    ],
    concept_map: {
      type: 'concept_map',
      slide_title: 'DPOC na ESF — SpO₂ 86%',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      items: [
        {
          label: 'ENQUADRAMENTO',
          detail: 'Usuário DPOC com SpO₂ 86%, FR 28 e musculatura acessória — acolhimento na UBS.',
          icon: 'Target',
        },
        { label: 'O₂ titulado', detail: 'Baixo fluxo conforme prescrição quando SpO₂ < 90%.', icon: 'Wind' },
        { label: 'Segurança', detail: 'Monitorizar, comunicar enfermeiro/médico, registrar conduta.', icon: 'Shield' },
        { label: 'GABARITO — letra B', detail: 'O₂ titulado + monitorização + comunicação + registro.', icon: 'CheckCircle' },
      ],
      footer_rule: 'Hipoxemia na DPOC: titular O₂ e escalar — não alta cega',
    },
    golden_rule: {
      type: 'golden_rule',
      slide_title: 'DPOC descompensada na APS',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'DPOC — O₂ TITULADO NA UBS',
      rows: [
        { label: 'SpO₂ 86%', value: 'Hipoxemia — iniciar O₂ conforme prescrição', badge: 'ok' },
        { label: 'Alto fluxo cego', value: 'Risco de hipercapnia no retentor', badge: 'warn' },
        { label: 'Comunicação', value: 'Enfermeiro e médico imediatamente', badge: 'ok' },
        { label: 'Gabarito', value: 'Letra B', emphasis: 'success', badge: 'hot' },
      ],
      footer_rule: 'Titular O₂, monitorar, comunicar, registrar',
    },
    logic_flow: {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      steps: [
        'Ler sinais: SpO₂ 86%, taquipneia, musculatura acessória.',
        'Prescrição prévia: O₂ nasal se SpO₂ < 90%.',
        'Eliminar A: alto fluxo/máscara não reinalante sem titulação — risco na DPOC.',
        'Eliminar C: postergar e mandar para casa com 86% é inseguro.',
        'Eliminar D: nebulização não substitui correção da hipoxemia aguda.',
        'Escolher B: O₂ titulado baixo fluxo + monitorização + comunicação + registro.',
        'Marcar letra B.',
      ],
      footer_rule: 'Descompensação na UBS exige O₂ titulado e equipe',
    },
    danger_zone: {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'PEGADINHAS — DPOC NA ESF',
      items: [
        {
          label: 'Letra A — alto fluxo rápido',
          detail: 'Parece corrigir hipoxemia, mas ignora risco de retenção de CO₂.',
          correct: 'DPOC: O₂ titulado em baixo fluxo — não hiperóxia indiscriminada.',
        },
        {
          label: 'Letra C — retorno domiciliar',
          detail: 'Minimiza SpO₂ 86% com esforço respiratório.',
          correct: 'Hipoxemia aguda na UBS exige intervenção e comunicação — não alta.',
        },
        {
          label: 'Letra D — nebulizar antes do O₂',
          detail: 'Prioriza broncodilatador e atrasa oxigenação.',
          correct: 'Corrigir hipoxemia e monitorizar SpO₂ — nebulização conforme prescrição.',
        },
      ],
      footer_rule: 'SpO₂ baixa + esforço = O₂ titulado e equipe',
    },
  },

  'igecap-enfermagem-processo-de-enfermagem-1780004452857-3': {
    family: 'conceito',
    guideline: 'PCDT MS — Asma na Atenção Básica (educação e dispositivos inalatórios)',
    sources: [
      {
        id: 'pcdt-asma-aps',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'PCDT — Asma (cuidado na APS)',
        year: 2021,
        url: 'https://www.gov.br/saude/',
        covers: ['asma', 'inaladores', 'controle ambiental'],
      },
    ],
    concept_map: {
      type: 'concept_map',
      slide_title: 'Asma na APS — atribuição do técnico',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      items: [
        {
          label: 'ENQUADRAMENTO',
          detail: 'Prova separa condutas educativas corretas de mitos sobre asma.',
          icon: 'Target',
        },
        { label: 'Técnico de enfermagem', detail: 'Identificar desconforto respiratório e orientar inaladores.', icon: 'Wind' },
        { label: 'Evitar', detail: 'Tabagismo passivo, restrição hídrica, suspender SABA sem médico.', icon: 'Ban' },
        { label: 'GABARITO — letra E', detail: 'Sinais de desconforto + técnica inalatória conforme plano.', icon: 'CheckCircle' },
      ],
      footer_rule: 'Educar e monitorizar — não contraindicar resgate sem médico',
    },
    golden_rule: {
      type: 'golden_rule',
      slide_title: 'Asma — APS',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'ASMA NA ATENÇÃO BÁSICA',
      rows: [
        { label: 'Técnico', value: 'Identificar desconforto + orientar inaladores', badge: 'ok' },
        { label: 'Tabagismo passivo', value: 'Evitar — não dessensibilizar', badge: 'warn' },
        { label: 'SABA', value: 'Resgate — não contraindicar unilateralmente', badge: 'warn' },
        { label: 'Gabarito', value: 'Letra E', emphasis: 'success', badge: 'hot' },
      ],
      footer_rule: 'Educação terapêutica e técnica inalatória',
    },
    logic_flow: {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      steps: [
        'Contexto: asma na Atenção Básica — atribuição do técnico.',
        'Eliminar A: tabagismo passivo piora asma — não é estratégia.',
        'Eliminar B: restrição hídrica rigorosa não previne crise.',
        'Eliminar C: broncodilatador de curta ação é resgate — não contraindicar.',
        'Eliminar D: carpetes/estofados acumulam alérgenos — não estabilizam umidade.',
        'Escolher E: identificar desconforto e orientar inaladores prescritos.',
        'Marcar letra E.',
      ],
      footer_rule: 'Monitorizar + educar técnica inalatória',
    },
    danger_zone: {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'PEGADINHAS — ASMA NA APS',
      items: [
        {
          label: 'Letra A — tabagismo passivo controlado',
          detail: 'Parece estratégia comportamental, mas agrava inflamação brônquica.',
          correct: 'Orientar ambiente livre de fumo — tabagismo passivo desencadeia crise.',
        },
        {
          label: 'Letra B — restrição hídrica',
          detail: 'Mito de reduzir secreções com pouca água.',
          correct: 'Hidratação adequada — restrição rigorosa não previne crise asmática.',
        },
        {
          label: 'Letra C — contraindicar SABA',
          detail: 'Confunde dependência com proibição do resgate.',
          correct: 'Broncodilatador de curta ação é resgate — suspensão é conduta médica.',
        },
        {
          label: 'Letra D — carpetes e estofados',
          detail: 'Acumulam ácaros e poeira — pioram controle.',
          correct: 'Controle ambiental reduz alérgenos — não manter têxteis que retêm poeira.',
        },
      ],
      footer_rule: 'Educação: ambiente, técnica inalatória, sinais de alerta',
    },
  },

  'instituto-access-enfermagem-processo-de-enfermagem-1780005797734-8': {
    family: 'conceito',
    guideline: 'PCDT MS — DPOC (O₂ titulado; dispositivos de oxigenoterapia)',
    sources: [
      {
        id: 'pcdt-dpoc-dispositivos-o2',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'PCDT — DPOC (oxigenoterapia)',
        year: 2021,
        url: 'https://www.gov.br/saude/',
        covers: ['máscara de Venturi', 'FiO2 controlada', 'DPOC'],
      },
    ],
    concept_map: {
      type: 'concept_map',
      slide_title: 'DPOC — FiO₂ controlada',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      items: [
        {
          label: 'ENQUADRAMENTO',
          detail: 'DPOC exacerbada SpO₂ 89% — O₂ baixo fluxo com FiO₂ alvo 90–93%.',
          icon: 'Target',
        },
        { label: 'Venturi', detail: 'FiO₂ precisa e estável independente do padrão respiratório.', icon: 'Wind' },
        { label: 'Cateter nasal', detail: 'Baixo fluxo — FiO₂ varia com padrão respiratório.', icon: 'Droplets' },
        { label: 'GABARITO — letra C', detail: 'Máscara de Venturi para FiO₂ controlada.', icon: 'CheckCircle' },
      ],
      footer_rule: 'FiO₂ fixa na DPOC: Venturi — titular SpO₂',
    },
    golden_rule: {
      type: 'golden_rule',
      slide_title: 'Dispositivos de O₂',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'O₂ NA DPOC — DISPOSITIVOS',
      rows: [
        { label: 'Máscara Venturi', value: 'FiO₂ precisa (válvulas coloridas)', badge: 'ok' },
        { label: 'Cateter nasal', value: 'Baixo fluxo — FiO₂ estimada', badge: 'ok' },
        { label: 'Não reinalante', value: 'Alto fluxo/reservatório — não menor FiO₂', badge: 'warn' },
        { label: 'Gabarito', value: 'Letra C', emphasis: 'success', badge: 'hot' },
      ],
      footer_rule: 'Venturi = FiO₂ controlada; titular SpO₂ 90–93%',
    },
    logic_flow: {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      steps: [
        'Cenário: DPOC exacerbada — FiO₂ controlada 90–93%.',
        'Eliminar A: máscara não reinalante é alto fluxo/reservatório — não menor FiO₂.',
        'Eliminar B: máscara simples < 5 L/min não garante FiO₂ estável na DPOC.',
        'Eliminar D: cateter nasal é baixo fluxo — FiO₂ não chega a 100% nem é alto fluxo.',
        'Escolher C: Venturi entrega FiO₂ precisa e controlada.',
        'Marcar letra C.',
      ],
      footer_rule: 'DPOC retentor: FiO₂ titulada com dispositivo adequado',
    },
    danger_zone: {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'PEGADINHAS — DISPOSITIVOS DE O₂',
      items: [
        {
          label: 'Letra A — não reinalante baixo fluxo',
          detail: 'Confunde reservatório (alta FiO₂) com baixa concentração.',
          correct: 'Máscara não reinalante oferece alta FiO₂ — não é dispositivo de desmame de baixa concentração.',
        },
        {
          label: 'Letra B — máscara simples na DPOC',
          detail: 'FiO₂ imprecisa e risco de retenção se fluxo inadequado.',
          correct: 'DPOC exige titulação — Venturi ou cateter nasal com monitorização de SpO₂.',
        },
        {
          label: 'Letra D — cateter nasal alto fluxo 100%',
          detail: 'Cateter é baixo fluxo — FiO₂ estimada, não 100%.',
          correct: 'Óculos nasais: baixo fluxo; FiO₂ varia com ventilação do paciente.',
        },
      ],
      footer_rule: 'Venturi = FiO₂ fixa; cateter = baixo fluxo variável',
    },
  },

  'instituto-iacp-enfermagem-processo-de-enfermagem-1780004280851-6': {
    family: 'conceito',
    guideline: 'GOLD COPD / PCDT MS — espirometria VEF1/CVF na DPOC',
    sources: [
      {
        id: 'gold-copd-espirometria',
        tier: 'A',
        issuer: 'GOLD / Ministério da Saúde',
        title: 'DPOC — critério espirométrico VEF1/CVF',
        year: 2023,
        url: 'https://goldcopd.org/',
        covers: ['VEF1/CVF', '0,70', 'obstrução crônica'],
      },
    ],
    concept_map: {
      type: 'concept_map',
      slide_title: 'DPOC — espirometria',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      items: [
        {
          label: 'ENQUADRAMENTO',
          detail: 'Prova cobra corte espirométrico que confirma obstrução crônica.',
          icon: 'Target',
        },
        { label: 'VEF1/CVF', detail: 'Relação entre volume expiratório forçado no 1º s e CVF.', icon: 'Activity' },
        { label: 'Obstrução', detail: 'VEF1/CVF < 0,70 pós-broncodilatador (GOLD/PCDT).', icon: 'TrendingDown' },
        { label: 'GABARITO — letra A', detail: 'VEF1/CVF inferior a 0,70.', icon: 'CheckCircle' },
      ],
      footer_rule: 'DPOC: VEF1/CVF < 0,70 confirma obstrução',
    },
    golden_rule: {
      type: 'golden_rule',
      slide_title: 'Espirometria na DPOC',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'VEF1/CVF — CORTE DA DPOC',
      rows: [
        { label: 'Obstrução confirmada', value: 'VEF1/CVF < 0,70', badge: 'ok' },
        { label: '0,80', value: 'Não é corte da DPOC', badge: 'warn' },
        { label: 'Superior a 0,70', value: 'Não indica obstrução fixa', badge: 'warn' },
        { label: 'Gabarito', value: 'Letra A', emphasis: 'success', badge: 'hot' },
      ],
      footer_rule: 'Decorar: < 0,70 = obstrução crônica',
    },
    logic_flow: {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      steps: [
        'Identificar: espirometria na DPOC — parâmetro VEF1/CVF.',
        'Lembrar corte GOLD/PCDT: relação < 0,70.',
        'Eliminar B e D: 0,80 não é o limiar da obstrução.',
        'Eliminar C e E: superior a 0,70 ou igual a 0,75 não confirma obstrução.',
        'Escolher A: VEF1/CVF inferior a 0,70.',
        'Marcar letra A.',
      ],
      footer_rule: 'Obstrução crônica: VEF1/CVF < 0,70',
    },
    danger_zone: {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'PEGADINHAS — ESPIROMETRIA DPOC',
      items: [
        {
          label: 'Letra B — inferior a 0,80',
          detail: 'Confunde com outros cortes clínicos ou regra mnemônica errada.',
          correct: 'Corte da DPOC é 0,70 — não 0,80.',
        },
        {
          label: 'Letra C — superior a 0,70',
          detail: 'Inverte o critério — obstrução exige relação baixa.',
          correct: 'Obstrução = VEF1 desproporcionalmente reduzido — relação < 0,70.',
        },
        {
          label: 'Letra D — superior a 0,80',
          detail: 'Relação alta indica padrão restritivo/normal, não DPOC.',
          correct: 'DPOC = obstrução — VEF1/CVF diminuída (< 0,70).',
        },
        {
          label: 'Letra E — igual a 0,75',
          detail: 'Valor intermediário acima do corte.',
          correct: '0,75 > 0,70 — não confirma obstrução crônica pelo critério padrão.',
        },
      ],
      footer_rule: 'Mnemônico: setenta confirma DPOC',
    },
  },

  'lj-assessoria-enfermagem-semiologia-em-enfermagem-1779563542813-6': {
    family: 'conceito',
    guideline: 'PCDT MS — Asma (semiologia pediátrica)',
    sources: [
      {
        id: 'pcdt-asma-pediatria',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'PCDT — Asma (criança)',
        year: 2021,
        url: 'https://www.gov.br/saude/',
        covers: ['sibilos expiratórios', 'asma pediátrica'],
      },
    ],
    concept_map: {
      type: 'concept_map',
      slide_title: 'Asma na criança — achado clínico',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      items: [
        {
          label: 'ENQUADRAMENTO',
          detail: 'Semiologia da asma pediátrica — achado mais frequente na crise/controle.',
          icon: 'Target',
        },
        { label: 'Sibilos expiratórios', detail: 'Ruído musical na expiração — clássico da asma.', icon: 'Wind' },
        { label: 'Distratores', detail: 'Estridor inspiratório = vias altas; rouquidão ≠ asma típica.', icon: 'AlertTriangle' },
        { label: 'GABARITO — letra C', detail: 'Presença de sibilos expiratórios.', icon: 'CheckCircle' },
      ],
      footer_rule: 'Asma infantil: sibilos expiratórios são o achado típico',
    },
    golden_rule: {
      type: 'golden_rule',
      slide_title: 'Semiologia — asma pediátrica',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'ASMA NA CRIANÇA — ACHADO TÍPICO',
      rows: [
        { label: 'Mais frequente', value: 'Sibilos expiratórios', badge: 'ok' },
        { label: 'Estridor inspiratório', value: 'Vias aéreas superiores — não asma', badge: 'warn' },
        { label: 'Gotejamento pós-nasal', value: 'Rinite — não achado central da asma', badge: 'warn' },
        { label: 'Gabarito', value: 'Letra C', emphasis: 'success', badge: 'hot' },
      ],
      footer_rule: 'Expiração com sibilos — padrão asmático',
    },
    logic_flow: {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      steps: [
        'Pergunta: anormalidade mais frequente na asma infantil.',
        'Eliminar A: alteração de voz não é o achado clássico.',
        'Eliminar B: estridor inspiratório sugere obstrução alta (ex.: laringe).',
        'Eliminar D: tosse com expectoração não é marca típica isolada.',
        'Eliminar E: gotejamento pós-nasal associa rinite alérgica.',
        'Escolher C: sibilos expiratórios.',
        'Marcar letra C.',
      ],
      footer_rule: 'Sibilos na expiração = asma',
    },
    danger_zone: {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'PEGADINHAS — SEMIOLOGIA PEDIÁTRICA',
      items: [
        {
          label: 'Letra A — alteração de voz',
          detail: 'Pode ocorrer, mas não é o achado mais frequente da asma.',
          correct: 'Sibilos expiratórios são o sinal respiratório clássico da asma.',
        },
        {
          label: 'Letra B — estridor inspiratório',
          detail: 'Sugere obstrução extratorácica (crupe, corpo estranho).',
          correct: 'Asma = sibilos predominantemente expiratórios.',
        },
        {
          label: 'Letra D — tosse com expectoração',
          detail: 'Comum em infecções; asma pode ter tosse seca.',
          correct: 'Achado típico asmático: sibilos expiratórios.',
        },
        {
          label: 'Letra E — gotejamento pós-nasal',
          detail: 'Associa rinite/rinossinusite, não núcleo da asma.',
          correct: 'Rinite pode coexistir — sibilos expiratórios definem broncoespasmo.',
        },
      ],
      footer_rule: 'Expiração ruidosa — pensar asma',
    },
  },

  'objetiva-concursos-enfermagem-semiologia-em-enfermagem-1779563549311-1': {
    family: 'vf',
    guideline: 'Semiologia respiratória — dispneia, cianose, ausculta (BARROS)',
    sources: [
      {
        id: 'semiologia-respiratoria-barros',
        tier: 'B',
        issuer: 'Literatura de semiologia',
        title: 'Semiologia respiratória — manifestações clínicas',
        year: 2020,
        covers: ['dispneia', 'cianose', 'crepitações', 'hemoptise'],
      },
    ],
    concept_map: {
      type: 'concept_map',
      slide_title: 'Semiologia respiratória — V/F',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      items: [
        { label: 'ENQUADRAMENTO', detail: 'Julgar I–IV sobre achados respiratórios na anamnese/exame.', icon: 'Target' },
        { label: 'I — dispneia', detail: 'Musculatura acessória, retrações, batimento nasal — VERDADEIRO.', icon: 'CheckCircle' },
        { label: 'II — cianose', detail: 'Coloração azulada por hipoxemia — VERDADEIRO.', icon: 'CheckCircle' },
        { label: 'III — crepitações', detail: 'Não são marca da asma — FALSO (asma = sibilos).', icon: 'XCircle' },
        { label: 'IV — hemoptise', detail: 'Confunde escarro habitual com hemoptise — FALSO.', icon: 'XCircle' },
      ],
      footer_rule: 'I e II verdadeiros → letra A',
    },
    golden_rule: {
      type: 'golden_rule',
      slide_title: 'Referência — semiologia',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'SEMIOLOGIA RESPIRATÓRIA',
      rows: [
        { label: 'I — dispneia', value: 'Musculatura acessória + retrações — V', badge: 'ok' },
        { label: 'II — cianose', value: 'Hipoxemia — V', badge: 'ok' },
        { label: 'III — crepitações', value: 'Asma = sibilos, não crepitações — F', badge: 'warn' },
        { label: 'IV — hemoptise', value: 'Escarro ≠ hemoptise — F', badge: 'warn' },
        { label: 'Gabarito', value: 'I e II → letra A', emphasis: 'success', badge: 'hot' },
      ],
      footer_rule: 'Crepitação ≠ asma; hemoptise é sangue',
    },
    logic_flow: {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      steps: [
        'Formato: I–IV + “Estão CORRETOS”.',
        'Julgar I: sinais objetivos da dispneia → verdadeiro.',
        'Julgar II: cianose por hipoxemia → verdadeiro.',
        'Julgar III: crepitações na asma → falso (asma = sibilos).',
        'Julgar IV: confunde escarro com hemoptise → falso.',
        'Conjunto verdadeiro: I e II apenas.',
        'Marcar letra A.',
      ],
      footer_rule: 'Asma sibila; crepitação é outro padrão',
    },
    danger_zone: {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'PEGADINHAS — SEMIOLOGIA (I–IV)',
      items: [
        {
          label: 'Letra B — I e III',
          detail: 'III associa crepitações à asma.',
          correct: 'Asma: sibilos expiratórios — crepitações sugerem edema/restrição.',
        },
        {
          label: 'Letra C — I, III e IV',
          detail: 'Inclui III falsa e IV falsa.',
          correct: 'Só I e II são verdadeiras nesta questão.',
        },
        {
          label: 'Letra D — II, III e IV',
          detail: 'Exclui I verdadeira e inclui III/IV falsas.',
          correct: 'Gabarito exige I (dispneia) e II (cianose) apenas.',
        },
      ],
      footer_rule: 'III e IV são as armadilhas clássicas',
    },
  },

  'univali-enfermagem-processo-de-enfermagem-1780010600919-9': {
    family: 'conceito',
    guideline: 'PCDT MS — DPOC na Atenção Básica (papel do técnico de enfermagem)',
    sources: [
      {
        id: 'pcdt-dpoc-ubs',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'PCDT — DPOC (cuidado na APS)',
        year: 2021,
        url: 'https://www.gov.br/saude/',
        covers: ['monitorização', 'cessação tabágica', 'DPOC'],
      },
    ],
    concept_map: {
      type: 'concept_map',
      slide_title: 'DPOC na UBS — papel do técnico',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      items: [
        {
          label: 'ENQUADRAMENTO',
          detail: 'DPOC crônica na UBS — responsabilidades do técnico vs condutas proibidas.',
          icon: 'Target',
        },
        { label: 'Monitorização', detail: 'Sinais vitais e orientação de manejo respiratório.', icon: 'Activity' },
        { label: 'Proibido', detail: 'O₂ sem prescrição; adiar tabagismo; restringir água.', icon: 'Ban' },
        { label: 'GABARITO — letra A', detail: 'Monitorar SV e orientar manejo respiratório.', icon: 'CheckCircle' },
      ],
      footer_rule: 'Técnico monitoriza e educa — O₂ só com prescrição',
    },
    golden_rule: {
      type: 'golden_rule',
      slide_title: 'DPOC — técnico na APS',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'DPOC NA UBS — TÉCNICO',
      rows: [
        { label: 'Atribuição', value: 'Monitorar SV + orientar manejo respiratório', badge: 'ok' },
        { label: 'Tabagismo', value: 'Abordar cessação — não adiar', badge: 'warn' },
        { label: 'O₂', value: 'Somente com prescrição médica', badge: 'warn' },
        { label: 'Gabarito', value: 'Letra A', emphasis: 'success', badge: 'hot' },
      ],
      footer_rule: 'Monitorizar, educar, escalar — não prescrever O₂',
    },
    logic_flow: {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      steps: [
        'Contexto: DPOC na UBS — papel do técnico (MS).',
        'Eliminar B: cessação tabágica não deve ser adiada.',
        'Eliminar C: restrição hídrica não é conduta na DPOC.',
        'Eliminar D: oxigenoterapia exige prescrição — técnico não prescreve.',
        'Escolher A: monitorar parâmetros vitais e orientar manejo respiratório.',
        'Marcar letra A.',
      ],
      footer_rule: 'APS DPOC: vigilância clínica + educação',
    },
    danger_zone: {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
      content: 'PEGADINHAS — DPOC NA UBS',
      items: [
        {
          label: 'Letra B — adiar cessação tabágica',
          detail: 'Evitar “estresse” contraria promoção à saúde.',
          correct: 'Abordar tabagismo é parte do cuidado à DPOC — não postergar.',
        },
        {
          label: 'Letra C — restringir hidratação',
          detail: 'Mito de reduzir secreções com pouca água.',
          correct: 'Hidratação adequada — restrição não faz parte do manejo padrão.',
        },
        {
          label: 'Letra D — O₂ sem prescrição',
          detail: 'Autonomia indevida do técnico.',
          correct: 'Oxigenoterapia requer prescrição e monitorização titulada.',
        },
      ],
      footer_rule: 'Técnico educa e monitoriza — não prescreve O₂',
    },
  },
};

function applyHandcraft(slug: string, raw: Q): Q {
  const spec = SPECS[slug];
  if (!spec) throw new Error(`Sem spec handcraft: ${slug}`);

  const meta = metaBase(raw, spec.family, spec.guideline);
  meta.sources = spec.sources;

  const { modulo_slug: _drop, ...rest } = raw;

  return {
    ...rest,
    meta,
    reverse_study_slides: [
      spec.concept_map,
      spec.golden_rule,
      spec.logic_flow,
      spec.danger_zone,
    ],
  };
}

function main() {
  const lote = 'respiratorio-cronico-g01';
  const dir = loteQuestionsDir(lote);

  for (const slug of Object.keys(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const crafted = applyHandcraft(slug, raw);
    writeFileSync(path, JSON.stringify(crafted, null, 2), 'utf8');
    console.log(`handcraft OK ${slug}`);
  }
}

main();
