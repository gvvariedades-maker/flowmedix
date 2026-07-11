#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g16 (8 slugs parto P0).
 *
 *   npm run handcraft:saude-da-mulher-g16
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g16 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g16';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const AB32_SOURCE = {
  id: 'caderno-ab-32-prenatal',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica nº 32 — Atenção ao pré-natal de baixo risco',
  year: 2012,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: ['pré-natal', 'hipertensão gestacional', 'puerpério', 'calendário consultas', 'integralidade'],
};

const OMS_PARTO_SOURCE = {
  id: 'oms-parto-humanizado',
  tier: 'A' as const,
  issuer: 'OMS / MS — PNH',
  title: 'Diretrizes Nacionais de Assistência ao Parto Normal — MS',
  year: 2017,
  url: 'https://www.who.int/publications/i/item/9789241550215',
  covers: ['papel do técnico no parto', 'trabalho de parto', 'laceração perineal'],
};

const PF_SOURCE = {
  id: 'ms-planejamento-familiar',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo de Atenção à Saúde das Mulheres — MS 2016',
  year: 2016,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_atencao_saude_mulheres.pdf',
  covers: ['integralidade', 'atenção primária', 'pré-natal do parceiro'],
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

type Branch = 'mulher_prenatal' | 'mulher_planejamento' | 'mulher_parto';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis' | 'certo_errado';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  sources?: (typeof AB32_SOURCE | typeof OMS_PARTO_SOURCE | typeof PF_SOURCE)[];
  slides: unknown[];
  cleanInstruction?: (s: string) => string;
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
    sources: pack.sources ?? [OMS_PARTO_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/vigésima\s+semana/gi, 'segundo trimestre')
    .replace(/dez dias/gi, 'puerpério imediato')
    .replace(/12a semana/gi, 'primeiro trimestre')
    .replace(/28a semana/gi, 'terceiro trimestre inicial')
    .replace(/36a semana/gi, 'terceiro trimestre final')
    .replace(/20a semana/gi, 'metade da gestação')
    .replace(/\s+/g, ' ')
    .trim();
}

const TE_OBSTETRICO_SLIDES = [
  {
    type: 'concept_map',
    slide_title: 'TE — gineco-obstetrícia',
    meta: slideMeta,
    items: [
      { label: 'Escopo', detail: 'Ginecologia e obstetrícia — pré-natal, parto, puerpério e promoção da saúde.', icon: 'Target' },
      { label: 'I e III (D)', detail: 'Afirmativas I e III verdadeiras; II falsa; IV verdadeira.', icon: 'CheckCircle' },
      { label: 'Pegadinha II', detail: 'Item II: TE não realiza procedimentos invasivos autônomos.', icon: 'AlertTriangle' },
      { label: 'Pegadinha IV', detail: 'Item IV: puerpério — sangramento e infecção.', icon: 'Heart' },
    ],
    footer_rule: 'I, II, III e IV — sequência V,F,V,V',
  },
  {
    type: 'golden_rule',
    slide_title: 'TE — obstetrícia',
    meta: slideMeta,
    content: 'PAPEL DO TE',
    rows: [
      { label: 'I', value: 'Pré-natal: observar intercorrências gestacionais', badge: 'hot', emphasis: 'highlight' },
      { label: 'II', value: 'TE sem procedimentos invasivos autônomos', badge: 'hot' },
      { label: 'III', value: 'Orientar sinais de alerta na gravidez', badge: 'info' },
      { label: 'IV', value: 'Puerpério: sangramento e infecção', badge: 'info' },
    ],
    footer_rule: 'Julgar I–IV: V, F, V, V → letra D',
  },
  {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta,
    steps: [
      'Enfermagem em ginecologia e obstetrícia — afirmativas I a IV.',
      'Julgar I — pré-natal: intercorrências gestacionais → verdadeiro.',
      'Julgar II — TE procedimentos invasivos autônomos → falso.',
      'Julgar III — sinais de alerta na gravidez → verdadeiro.',
      'Julgar IV — puerpério: sangramento e infecção → verdadeiro.',
      'Combinação V, F, V, V.',
      'Marcar letra D.',
    ],
    footer_rule: 'Itens I–IV julgados — sequência D',
  },
  {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta,
    content: 'PEGADINHAS — TE OBSTÉTRICO',
    items: [
      { label: 'Letra A — V,V,F,V', detail: 'Erro na afirmativa III — sinais de alerta.', correct: 'Item III verdadeiro — sequência D.' },
      { label: 'Letra B — F,V,V,F', detail: 'Afirmativa I é verdadeira no pré-natal.', correct: 'Vigilância gestacional — gabarito D.' },
      { label: 'Letra C — V,F,F,V', detail: 'Afirmativa III também é verdadeira.', correct: 'I–IV: V,F,V,V — marcar D.' },
      { label: 'Pegadinha II', detail: 'Item II falso — invasivo exige supervisão.', correct: 'Segunda afirmativa falsa — letra D.' },
    ],
    footer_rule: 'Protocolo e supervisão profissional',
  },
];

const SPECS: Record<string, Pack> = {
  'igeduc-enfermagem-saude-da-mulher-1777104432986-3': {
    family: 'certo_errado',
    branch: 'mulher_parto',
    guideline: 'MS/FEGO — hipertensão gestacional: após segundo trimestre, transitória no puerpério',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'HAS gestacional — julgue',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Julgar definição de hipertensão gestacional em primíparas normotensas.', icon: 'Target' },
          { label: 'Definição (Certo)', detail: 'PA elevada após segundo trimestre, transitória no puerpério.', icon: 'Gauge' },
          { label: 'Pegadinha crônica', detail: 'HAS prévia não é hipertensão gestacional.', icon: 'AlertTriangle' },
          { label: 'Pegadinha pré-eclâmpsia', detail: 'Proteinúria define pré-eclâmpsia — não só PA.', icon: 'XCircle' },
        ],
        footer_rule: 'HAS gestacional transitória — Certo',
      },
      {
        type: 'golden_rule',
        slide_title: 'HAS — gestação',
        meta: slideMeta,
        content: 'HIPERTENSÃO GESTACIONAL',
        rows: [
          { label: 'Quando', value: 'Após segundo trimestre em normotensa', badge: 'hot', emphasis: 'highlight' },
          { label: 'Frequência', value: 'Menos da metade das primíparas', badge: 'info' },
          { label: 'Resolução', value: 'Desaparece no puerpério imediato', badge: 'hot' },
          { label: 'Não é', value: 'HAS crônica nem pré-eclâmpsia isolada', badge: 'warn' },
        ],
        footer_rule: 'Definição clássica → Certo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Hipertensão gestacional — julgar afirmativa.',
          'PA elevada após segundo trimestre — verdadeiro.',
          'Transitória no puerpério — verdadeiro.',
          'Menos da metade das primíparas — verdadeiro.',
          'Afirmativa global correta.',
          'Marcar Certo — letra A.',
        ],
        footer_rule: 'HAS gestacional clássica → Certo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HAS GESTACIONAL',
        items: [
          { label: 'Letra B — Errado', detail: 'Negar definição aceita na prova.', correct: 'PA após 2º tri transitória — Certo.' },
          { label: 'Pegadinha crônica', detail: 'HAS antes da gestação é outra entidade.', correct: 'Hipertensão gestacional — marcar A.' },
          { label: 'Pegadinha proteinúria', detail: 'Pré-eclâmpsia exige proteinúria.', correct: 'Transitória pós-parto — gabarito Certo.' },
          { label: 'Confundir permanência', detail: 'HAS gestacional resolve no puerpério.', correct: 'Afirmativa correta — letra A.' },
        ],
        footer_rule: 'Transitória ≠ crônica',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'igeduc-enfermagem-saude-da-mulher-1780001440222-0': {
    family: 'vf',
    branch: 'mulher_parto',
    guideline: 'MS — TE em obstetrícia: apoio e vigilância; sem procedimentos invasivos autônomos',
    sources: [AB32_SOURCE],
    slides: TE_OBSTETRICO_SLIDES,
    cleanInstruction: cleanPdfNoise,
  },

  'igeduc-enfermagem-seguranca-do-paciente-1777102918981-3': {
    family: 'certo_errado',
    branch: 'mulher_parto',
    guideline: 'MS/Anvisa — resíduos em sala de parto: recolhimento após procedimento conforme prova',
    exam_vs_current: 'residuos_tampa_nr32',
    sources: [OMS_PARTO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Resíduos — sala de parto',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Julgar recipientes sem tampa em sala de cirurgia e parto.', icon: 'Target' },
          { label: 'Recolhimento (Certo)', detail: 'Resíduos recolhidos ao término do procedimento — gabarito prova.', icon: 'Trash2' },
          { label: 'Pegadinha clampeamento', detail: 'Clampeamento tardio do cordão — tema distinto de resíduos.', icon: 'Baby' },
          { label: 'Pegadinha tampa', detail: 'NR-32 exige vedação — diverge da banca.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Recolhimento ao término do procedimento — Certo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Resíduos — parto',
        meta: slideMeta,
        content: 'MANEJO DE RESÍDUOS',
        rows: [
          { label: 'Prova', value: 'Recolher resíduos ao fim do procedimento', badge: 'hot', emphasis: 'highlight' },
          { label: 'Ambiente', value: 'Salas de cirurgia e parto', badge: 'info' },
          { label: 'NR-32', value: 'Tampa de vedação recomendada na norma atual', badge: 'warn' },
          { label: 'Conduta TE', value: 'Destinar ao local adequado sem acúmulo', badge: 'info' },
        ],
        footer_rule: 'Gabarito banca → Certo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Resíduos em sala de parto — julgar item.',
          'Recipientes sem tampa se recolhidos ao fim — verdadeiro na banca.',
          'Recolhimento ao término do procedimento — verdadeiro.',
          'Afirmativa aceita pela prova.',
          'Marcar Certo — letra A.',
        ],
        footer_rule: 'Recolhimento pós-procedimento → Certo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — RESÍDUOS',
        items: [
          { label: 'Letra B — Errado', detail: 'Exigir tampa universal na norma.', correct: 'Prova aceita recolhimento — Certo.' },
          { label: 'Pegadinha tampa', detail: 'NR-32 diverge do gabarito da banca.', correct: 'Recolher ao término — letra A.' },
          { label: 'Pegadinha clampeamento', detail: 'Clampeamento tardio do cordão — tema obstétrico distinto.', correct: 'Recolher resíduos ao término — letra A.' },
          { label: 'Confundir normas', detail: 'Prova prioriza fluxo de recolhimento.', correct: 'Afirmativa correta na banca — A.' },
        ],
        footer_rule: 'Prova × NR-32 registrada',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'inaz-do-para-enfermagem-saude-da-mulher-1777104335102-5': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS/OMS — TE no TP: acompanhar evolução e prestar assistência à gestante',
    sources: [OMS_PARTO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TE — trabalho de parto',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Papel do técnico em enfermagem no trabalho de parto.', icon: 'Target' },
          { label: 'Assistência (C)', detail: 'Acompanhar evolução do parto e prestar assistência.', icon: 'Heart' },
          { label: 'Pegadinha cesariana', detail: 'Cesariana é ato médico — A.', icon: 'Ban' },
          { label: 'Pegadinha episiotomia', detail: 'Episiotomia não é atribuição do TE — D.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Acompanhar e assistir — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'TE — intraparto',
        meta: slideMeta,
        content: 'PAPEL NO TP',
        rows: [
          { label: 'Faz', value: 'Acompanhar evolução e assistir a gestante', badge: 'hot', emphasis: 'highlight' },
          { label: 'Vigilância', value: 'Segurança e bem-estar materno-fetal', badge: 'hot' },
          { label: 'Não faz', value: 'Cesariana, prescrição, episiotomia ou anestesia', badge: 'warn' },
        ],
        footer_rule: 'Assistência à gestante → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trabalho de parto — papel do TE.',
          'Eliminar A — cesariana.',
          'Eliminar B — prescrever medicamentos.',
          'Testar C — acompanhar e assistir.',
          'Eliminar D — episiotomia.',
          'Eliminar E — anestesiar.',
          'Marcar letra C.',
        ],
        footer_rule: 'Acompanhamento e assistência → C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PAPEL TE',
        items: [
          { label: 'Letra A — cesariana', detail: 'Procedimento cirúrgico médico.', correct: 'Acompanhar parto — letra C.' },
          { label: 'Letra B — prescrição', detail: 'Atribuição médica.', correct: 'Assistência à gestante — gabarito C.' },
          { label: 'Letra D — episiotomia', detail: 'Procedimento obstétrico médico.', correct: 'Evolução do parto — marcar C.' },
          { label: 'Letra E — anestesia', detail: 'Profissional habilitado específico.', correct: 'Bem-estar da gestante — letra C.' },
        ],
        footer_rule: 'Escopo do técnico no TP',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-access-enfermagem-processo-de-enfermagem-1780005797734-5': {
    family: 'vf',
    branch: 'mulher_parto',
    guideline: 'MS/Caderno AB 32 — pré-natal: seis consultas; captação precoce; calendário por trimestre',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pré-natal — VF MS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Gestante primigesta na UBS — acolhimento, sinais vitais e pré-natal materno-fetal.', icon: 'Target' },
          { label: 'I e III (C)', detail: 'Seis consultas mínimas e calendário por fase gestacional.', icon: 'CheckCircle' },
          { label: 'Pegadinha 4 consultas', detail: 'MS exige seis — não quatro.', icon: 'AlertTriangle' },
          { label: 'Pegadinha captação', detail: 'II: primeira consulta na metade da gestação é tardia.', icon: 'Clock' },
        ],
        footer_rule: 'I e III corretos — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Pré-natal — AB 32',
        meta: slideMeta,
        content: 'ORGANIZAÇÃO MS',
        rows: [
          { label: 'Mínimo', value: 'Seis consultas no risco habitual', badge: 'hot', emphasis: 'highlight' },
          { label: 'Captação', value: 'Primeira consulta precoce — não na metade', badge: 'warn' },
          { label: 'Calendário', value: 'Mensal, quinzenal e semanal conforme IG', badge: 'hot' },
          { label: 'Continuidade', value: 'Avaliar impacto na saúde materna e perinatal', badge: 'info' },
          { label: 'Acolhimento', value: 'Técnico prepara consulta com enfermeiro', badge: 'info' },
        ],
        footer_rule: 'Seis consultas + calendário → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Pré-natal na APS — julgar I a III.',
          'Julgar I — mínimo de seis consultas → verdadeiro.',
          'Julgar II — primeira consulta até metade da gestação → falso.',
          'Julgar III — calendário mensal/quinzenal/semanal → verdadeiro.',
          'Combinação I e III.',
          'Marcar letra C.',
        ],
        footer_rule: 'Captação precoce invalida II — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRÉ-NATAL VF',
        items: [
          { label: 'Letra A — I e II', detail: 'II é falsa — captação tardia.', correct: 'I e III verdadeiros — letra C.' },
          { label: 'Letra B — I,II,III', detail: 'II invalida combinação.', correct: 'Seis consultas e calendário — gabarito C.' },
          { label: 'Letra D — II e III', detail: 'II é falsa.', correct: 'Só I e III — marcar C.' },
          { label: 'Pegadinha 4 consultas', detail: 'Norma atual é seis encontros.', correct: 'I e III — letra C.' },
        ],
        footer_rule: 'MS AB 32 — seis consultas',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulplan-enfermagem-saude-da-mulher-1777104323066-7': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS — puerpério imediato: dor, hematoma e disúria exigem avaliação de laceração perineal',
    sources: [OMS_PARTO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Puerpério — dor perineal',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: 'Pós-parto vaginal — recém-nascido saudável, dor perineal e disúria.', icon: 'Target' },
          { label: 'Encaminhar (D)', detail: 'Avaliação médica por possível laceração perineal.', icon: 'AlertTriangle' },
          { label: 'Pegadinha clampeamento', detail: 'Clampeamento tardio do cordão — não confundir com trauma perineal.', icon: 'Baby' },
          { label: 'Pegadinha puerpério curto', detail: 'Assistência puerperal além do primeiro mês — até o 42º dia.', icon: 'Clock' },
        ],
        footer_rule: 'Suspeita de laceração → médico',
      },
      {
        type: 'golden_rule',
        slide_title: 'Puerpério — conduta',
        meta: slideMeta,
        content: 'DOR PERINEAL',
        rows: [
          { label: 'Sinais', value: 'Dor intensa, disúria, edema e hematoma', badge: 'hot', emphasis: 'highlight' },
          { label: 'Conduta', value: 'Encaminhar para avaliação médica', badge: 'hot' },
          { label: 'Não basta', value: 'Só analgésico oral ou compressa fria', badge: 'warn' },
          { label: 'Risco', value: 'Laceração perineal não identificada', badge: 'warn' },
        ],
        footer_rule: 'Avaliação médica → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Puerpério imediato — dor perineal intensa.',
          'Eliminar A — só analgésico oral.',
          'Eliminar B — só hidratação.',
          'Eliminar C — só compressa fria.',
          'Testar D — encaminhar para avaliação médica.',
          'Marcar letra D.',
        ],
        footer_rule: 'Laceração possível → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PUERPÉRIO',
        items: [
          { label: 'Letra A — analgésico', detail: 'Mascara laceração não tratada.', correct: 'Avaliação médica urgente — letra D.' },
          { label: 'Letra B — líquidos', detail: 'Não resolve hematoma perineal.', correct: 'Suspeita de laceração — gabarito D.' },
          { label: 'Letra C — gelo', detail: 'Adjuvante sem excluir lesão.', correct: 'Encaminhar médico — marcar D.' },
          { label: 'Pegadinha puerpério curto', detail: 'Complicação nas primeiras horas pós-parto.', correct: 'Laceração possível — letra D.' },
        ],
        footer_rule: 'TE identifica e encaminha',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulplan-enfermagem-saude-da-mulher-1777104340484-6': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS Protocolo Saúde das Mulheres 2016 — integralidade do cuidado em todas as fases da vida',
    sources: [PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Protocolo — mulheres APS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Princípio fundamental do cuidado às mulheres na APS.', icon: 'Target' },
          { label: 'Integralidade (C)', detail: 'Cuidado em todas as fases da vida.', icon: 'Layers' },
          { label: 'Pegadinha gestação só', detail: 'Não restringir à gestação e parto — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha hospitalar', detail: 'APS não centraliza no hospital — B.', icon: 'XCircle' },
        ],
        footer_rule: 'Integralidade vitalícia — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Princípios — MS 2016',
        meta: slideMeta,
        content: 'SAÚDE DA MULHER',
        rows: [
          { label: 'Integralidade', value: 'Todas as fases da vida da mulher', badge: 'hot', emphasis: 'highlight' },
          { label: 'APS', value: 'Coordenação do cuidado na atenção básica', badge: 'info' },
          { label: 'Não é', value: 'Só gestação, hospital ou IST isolada', badge: 'warn' },
        ],
        footer_rule: 'Integralidade → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Protocolo de Atenção à Saúde das Mulheres.',
          'Eliminar A — só gestação e parto.',
          'Eliminar B — centralização hospitalar.',
          'Testar C — integralidade em todas as fases.',
          'Eliminar D — restrição a IST.',
          'Marcar letra C.',
        ],
        footer_rule: 'Cuidado integral → C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRINCÍPIOS',
        items: [
          { label: 'Letra A — gestação', detail: 'Saúde da mulher vai além do ciclo gravídico.', correct: 'Integralidade vitalícia — letra C.' },
          { label: 'Letra B — hospital', detail: 'APS é porta de entrada.', correct: 'Todas as fases da vida — gabarito C.' },
          { label: 'Letra D — IST', detail: 'Cuidado não se restringe a IST.', correct: 'Integralidade do cuidado — marcar C.' },
          { label: 'Pegadinha fragmentada', detail: 'Protocolo MS é cuidado longitudinal.', correct: 'Princípio integral — letra C.' },
        ],
        footer_rule: 'Mulher no ciclo de vida',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulplan-enfermagem-saude-da-mulher-1777104347186-0': {
    family: 'vf',
    branch: 'mulher_parto',
    guideline: 'MS/Caderno AB 32 — captação precoce; PNAISH pré-natal do parceiro',
    sources: [AB32_SOURCE, PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pré-natal — VF MS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Pré-natal na APS — aspectos psicossociais, atividades educativas e PNAISH.', icon: 'Target' },
          { label: 'I e II (C)', detail: 'Captação precoce na atenção básica e pré-natal do parceiro.', icon: 'CheckCircle' },
          { label: 'Pegadinha adolescente', detail: 'III: gestantes adolescentes e ECA — responsável legal não é requisito absoluto.', icon: 'AlertTriangle' },
          { label: 'Pegadinha 4 consultas', detail: 'MS recomenda seis consultas mínimas na gestação.', icon: 'Clock' },
        ],
        footer_rule: 'I e II corretos — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Pré-natal — MS',
        meta: slideMeta,
        content: 'ORGANIZAÇÃO APS',
        rows: [
          { label: 'Objetivo', value: 'Desenvolvimento saudável da gestação e parto seguro', badge: 'info' },
          { label: 'APS', value: 'Unidade de atenção básica mais próxima da residência', badge: 'info' },
          { label: 'Calendário', value: 'Periodicidade conforme idade gestacional', badge: 'hot' },
          { label: 'Parceiro', value: 'PNAISH — planejamento reprodutivo e masculinidade saudável', badge: 'info' },
          { label: 'Psicossocial', value: 'Aspectos educativos e preventivos na APS', badge: 'info' },
          { label: 'Adolescente', value: 'Acesso sem condicionar a responsável legal sempre', badge: 'warn' },
        ],
        footer_rule: 'I e II verdadeiros → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Pré-natal — julgar afirmativas I a III sobre MS e PNAISH.',
          'Julgar I — captação precoce na atenção primária e periodicidade → verdadeiro.',
          'Julgar II — PNAISH, planejamento reprodutivo e pré-natal do parceiro → verdadeiro.',
          'Julgar III — adolescente apenas com responsáveis legais → falso.',
          'Combinação I e II.',
          'Marcar letra C.',
        ],
        footer_rule: 'Adolescente invalida III — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRÉ-NATAL VF',
        items: [
          { label: 'Letra A — I,II,III', detail: 'III é falsa.', correct: 'I e II corretos — letra C.' },
          { label: 'Letra B — só I', detail: 'Omite II verdadeira.', correct: 'PNAISH parceiro — gabarito C.' },
          { label: 'Letra D — II,III', detail: 'III é falsa.', correct: 'Captação e parceiro — marcar C.' },
          { label: 'Pegadinha adolescente', detail: 'ECA garante atendimento sem condicionante absoluta.', correct: 'I e II — letra C.' },
        ],
        footer_rule: 'Parceiro no pré-natal — II',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const instruction = pack.cleanInstruction
      ? pack.cleanInstruction(raw.question_data.instruction)
      : raw.question_data.instruction;
    const { text_fragment: _drop, ...questionRest } = raw.question_data;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: { ...questionRest, instruction },
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sm-g16] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g16] total=${ok}`);
}

main();
