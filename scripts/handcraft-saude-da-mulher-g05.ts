#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g05 (8 slugs pré-natal P0).
 *
 *   npm run handcraft:saude-da-mulher-g05
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g05 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g05';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-09';

const AB32_SOURCE = {
  id: 'caderno-ab-32-prenatal',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica nº 32 — Atenção ao pré-natal de baixo risco',
  year: 2012,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: [
    'pré-eclâmpsia',
    'decúbito lateral',
    'consultas pré-natal',
    'diabetes gestacional',
    'nutrição gestacional',
    'atribuições técnico enfermagem',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Branch = 'mulher_prenatal' | 'mulher_planejamento' | 'mulher_parto';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo';
  branch: Branch;
  guideline: string;
  roi_error?: string;
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
      exam_vs_current: 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: [AB32_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\n?\d{4}\)\s*/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

const TE_PRENATAL_SLIDES = [
  {
    type: 'concept_map',
    slide_title: 'TE no pré-natal',
    meta: slideMeta,
    items: [
      { label: 'Comando', detail: 'Atribuições do Técnico em Enfermagem no acompanhamento pré-natal.', icon: 'Target' },
      { label: 'Orientar (B)', detail: 'Sinais de risco e importância das consultas de pré-natal.', icon: 'BookOpen' },
      { label: 'Pegadinha diagnosticar', detail: 'TE não realiza diagnóstico obstétrico — papel do médico/enfermeiro.', icon: 'AlertTriangle' },
      { label: 'Pegadinha prescrever', detail: 'Suplementação e prescrição não são atribuição do TE.', icon: 'XCircle' },
    ],
    footer_rule: 'TE orienta e comunica — não diagnostica nem prescreve',
  },
  {
    type: 'golden_rule',
    slide_title: 'Atribuições — TE × equipe',
    meta: slideMeta,
    content: 'PRÉ-NATAL NA UBS',
    rows: [
      { label: 'TE — pode', value: 'Orientar sinais de alerta e adesão às consultas', badge: 'hot', emphasis: 'highlight' },
      { label: 'TE — não pode', value: 'Diagnosticar obstétrico ou prescrever', badge: 'warn' },
      { label: 'Invasivo', value: 'Procedimentos só com supervisão/prescrição', badge: 'warn' },
      { label: 'Comunicação', value: 'Achados anormais → enfermeiro/médico', badge: 'info' },
    ],
    footer_rule: 'Orientação educativa = papel do TE',
  },
  {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta,
    steps: [
      'Identificar atribuições do TE no pré-natal.',
      'Eliminar A — diagnóstico obstétrico: competência médica/enfermeira.',
      'Testar B — orientar sinais de risco e importância das consultas.',
      'Eliminar C — prescrever suplementação.',
      'Eliminar D — procedimentos invasivos sem supervisão.',
      'Marcar letra B.',
    ],
    footer_rule: 'Orientar sinais de risco → letra B',
  },
  {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta,
    content: 'PEGADINHAS — ATRIBUIÇÃO DO TE',
    items: [
      { label: 'Letra A — diagnóstico', detail: 'Extrapola competência do TE.', correct: 'Diagnóstico obstétrico é do médico/enfermeiro.' },
      { label: 'Letra C — prescrever', detail: 'Prescrição medicamentosa não é do TE.', correct: 'TE orienta sinais de risco — letra B.' },
      { label: 'Letra D — invasivo sem supervisão', detail: 'Viola segurança e protocolo.', correct: 'Orientação e comunicação — papel do TE.' },
      { label: 'Confundir TE com enfermeiro', detail: 'TE educa e registra — não diagnostica.', correct: 'Sinais de risco e consultas — B.' },
    ],
    footer_rule: 'Diagnóstico × orientação',
  },
];

const SPECS: Record<string, Pack> = {
  'gama-enfermagem-saude-da-mulher-1777104261182-3': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — iminência de eclâmpsia: comunicar equipe imediatamente',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Iminência de eclâmpsia',
        meta: slideMeta,
        items: [
          { label: 'Caso 3º tri', detail: 'Edema súbito face/mãos + cefaleia + escotomas + PA severamente elevada.', icon: 'AlertCircle' },
          { label: 'Conduta TE (C)', detail: 'Comunicar imediatamente enfermeiro obstetra ou médico.', icon: 'Phone' },
          { label: 'Pegadinha diurético (A)', detail: 'TE não administra diurético por iniciativa — emergência obstétrica.', icon: 'AlertTriangle' },
          { label: 'Pegadinha repouso (B)', detail: 'Repouso isolado não substitui acionamento da equipe.', icon: 'XCircle' },
        ],
        footer_rule: 'Escotomas + PA alta = acionar equipe já',
      },
      {
        type: 'golden_rule',
        slide_title: 'Pré-eclâmpsia grave',
        meta: slideMeta,
        content: 'SINAIS DE ALERTA',
        rows: [
          { label: 'Cefaleia + escotomas', value: 'Iminência de eclâmpsia — urgência', badge: 'hot', emphasis: 'highlight' },
          { label: 'Edema súbito', value: 'Face e mãos — não só MMII fisiológico', badge: 'warn' },
          { label: 'PA elevada', value: 'Aferir e comunicar imediatamente', badge: 'hot' },
          { label: 'TE', value: 'Comunicar médico/enfermeiro — não prescrever', badge: 'info' },
        ],
        footer_rule: 'Emergência obstétrica → comunicar equipe',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Reconhecer tríade: edema súbito + cefaleia + escotomas visuais.',
          'PA severamente elevada confirma gravidade.',
          'Eliminar A — administrar diurético: TE não prescreve/administra por conta.',
          'Eliminar B — só repouso e água: insuficiente para iminência de eclâmpsia.',
          'Eliminar D — glicemia/temperatura: não é conduta imediata principal.',
          'Testar C — comunicar imediatamente enfermeiro obstetra ou médico.',
          'Marcar letra C.',
        ],
        footer_rule: 'Iminência eclâmpsia → comunicar equipe → C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONDUTA DO TE',
        items: [
          { label: 'Letra A — diurético', detail: 'TE não administra medicamento não prescrito na urgência.', correct: 'Comunicar equipe obstétrica imediatamente.' },
          { label: 'Letra B — repouso e água', detail: 'Subestima gravidade dos escotomas.', correct: 'Escotomas + PA alta = acionar médico/enfermeiro.' },
          { label: 'Letra D — glicemia', detail: 'Exame complementar não é prioridade imediata.', correct: 'Conduta: comunicação imediata — letra C.' },
          { label: 'Tratar edema como fisiológico', detail: 'Edema súbito de face é sinal de alerta.', correct: 'Iminência de eclâmpsia — comunicar equipe.' },
        ],
        footer_rule: 'Não minimizar escotomas',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'gama-enfermagem-saude-da-mulher-1777104382533-2': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — evitar decúbito lateral direito: compressão da veia cava inferior',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Decúbito na gestação',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Por que evitar decúbito lateral direito prolongado no 3º trimestre.', icon: 'Target' },
          { label: 'Veia cava (A)', detail: 'Útero comprime veia cava inferior → reduz retorno venoso e perfusão placentária.', icon: 'Heart' },
          { label: 'Pegadinha fígado (B)', detail: 'Deslocamento hepático não é o mecanismo principal cobrado.', icon: 'AlertTriangle' },
          { label: 'DLE preferido', detail: 'Decúbito lateral esquerdo favorece retorno venoso.', icon: 'CheckCircle' },
        ],
        footer_rule: 'DLD comprime veia cava — evitar no 3º tri',
      },
      {
        type: 'golden_rule',
        slide_title: 'Posicionamento — gestante',
        meta: slideMeta,
        content: 'DECÚBITO LATERAL',
        rows: [
          { label: 'DLD — evitar', value: 'Compressão veia cava inferior', badge: 'hot', emphasis: 'highlight' },
          { label: 'Consequência', value: 'Hipotensão materna e hipoperfusão placentária', badge: 'warn' },
          { label: 'DLE', value: 'Posição preferencial no 3º trimestre', badge: 'hot' },
          { label: 'Não é', value: 'Atelectasia ou constipação como mecanismo principal', badge: 'info' },
        ],
        footer_rule: 'Veia cava = gabarito A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: gestante 3º trimestre — posicionamento prolongado.',
          'Testar A — compressão veia cava → hipotensão e comprometimento placentário.',
          'Eliminar B — pressão sobre fígado: mecanismo incorreto.',
          'Eliminar C — atelectasia pulmonar: não é a justificativa clássica.',
          'Eliminar D — compressão intestinal/hemorroidas: distrator.',
          'Marcar letra A.',
        ],
        footer_rule: 'Veia cava inferior → A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MECANISMO FISIOPATOLÓGICO',
        items: [
          { label: 'Letra B — fígado', detail: 'Confunde veia cava com deslocamento hepático — mecanismo errado.', correct: 'Compressão da veia cava inferior reduz retorno venoso — A.' },
          { label: 'Letra C — pulmões', detail: 'Não explica hipotensão placentária.', correct: 'Retorno venoso reduzido pela veia cava.' },
          { label: 'Letra D — intestino', detail: 'Constipação não é o foco do enunciado.', correct: 'Veia cava + circulação placentária — A.' },
          { label: 'Confundir DLE com DLD', detail: 'Direito prolongado comprime veia cava — não o fígado.', correct: 'Pegadinha hepática distrator — veia cava é o mecanismo.' },
        ],
        footer_rule: 'Fisiologia vascular — não digestiva',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'grupo-talent-enfermagem-processo-de-enfermagem-1780009359555-7': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — pré-eclâmpsia na UBS: comunicar equipe e referenciar urgência obstétrica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pré-eclâmpsia — UBS',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: 'Cefaleia, escotomas, dor epigástrica, edema facial, PA muito elevada.', icon: 'AlertCircle' },
          { label: 'Conduta (B)', detail: 'Repetir PA, comunicar equipe, referenciar urgência, registrar.', icon: 'ClipboardList' },
          { label: 'Pegadinha repouso 48h (A)', detail: 'Edema fisiológico não explica escotomas e PA grave.', icon: 'AlertTriangle' },
          { label: 'Pegadinha prescrever (C)', detail: 'TE não administra anti-hipertensivo por iniciativa.', icon: 'XCircle' },
        ],
        footer_rule: 'PA grave + escotomas = referência urgente',
      },
      {
        type: 'golden_rule',
        slide_title: 'Fluxo — urgência obstétrica',
        meta: slideMeta,
        content: 'PRÉ-ECLÂMPSIA NA UBS',
        rows: [
          { label: 'Sinais', value: 'Cefaleia, escotomas, epigástrica, edema facial', badge: 'hot' },
          { label: 'PA', value: 'Repetir aferição com técnica adequada', badge: 'info' },
          { label: 'TE', value: 'Comunicar enfermeiro/médico + referência', badge: 'hot', emphasis: 'highlight' },
          { label: 'Não fazer', value: 'Prescrever ou alta com retorno em 48h', badge: 'warn' },
        ],
        footer_rule: 'Referenciar urgência obstétrica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Gestante com sinais de pré-eclâmpsia grave na UBS.',
          'Eliminar A — repouso domiciliar 48h: subestima gravidade.',
          'Testar B — repetir PA, comunicar equipe, referenciar urgência, registrar.',
          'Eliminar C — anti-hipertensivo por iniciativa do TE.',
          'Eliminar D — priorizar citopatológico de rotina.',
          'Marcar letra B.',
        ],
        footer_rule: 'Comunicar + referenciar → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONDUTA NA UBS',
        items: [
          { label: 'Letra A — retorno 48h', detail: 'Trata edema como só fisiológico.', correct: 'Escotomas e PA alta exigem referência imediata.' },
          { label: 'Letra C — prescrever anti-hipertensivo', detail: 'TE não prescreve nem administra por conta.', correct: 'Comunicar equipe e acionar fluxo — B.' },
          { label: 'Letra D — citopatológico', detail: 'Rastreio de rotina não é prioridade na urgência.', correct: 'Urgência obstétrica — letra B.' },
          { label: 'Minimizar escotomas', detail: 'Alteração visual = gravidade.', correct: 'Referenciar urgência com registro completo.' },
        ],
        footer_rule: 'Urgência ≠ consulta de rotina',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'icece-enfermagem-saude-da-mulher-1777104261182-0': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS 2012) — TE no pré-natal: orientar sinais de risco e adesão às consultas',
    slides: TE_PRENATAL_SLIDES,
  },

  'icece-enfermagem-saude-da-mulher-1780001362784-9': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS 2012) — TE no pré-natal: orientar sinais de risco e adesão às consultas',
    slides: TE_PRENATAL_SLIDES,
  },

  'idcap-enfermagem-saude-da-mulher-1777104301763-7': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS 2012) — mínimo 6 consultas pré-natal com distribuição por trimestre',
    roi_error: 'prenatal_consultas_4',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Consultas pré-natal — MS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Número mínimo e distribuição das consultas de pré-natal.', icon: 'Target' },
          { label: 'Seis consultas (D)', detail: 'Mínimo MS — distribuídas nos trimestres.', icon: 'Calendar' },
          { label: 'Distribuição', detail: 'Uma no 1º trimestre, duas no 2º, três no 3º.', icon: 'Clock' },
          { label: 'Pegadinha 4 consultas (E)', detail: 'Número desatualizado — não é o mínimo vigente.', icon: 'AlertTriangle' },
        ],
        footer_rule: '6 consultas — distribuição 1+2+3',
      },
      {
        type: 'golden_rule',
        slide_title: 'AB 32 — cronograma',
        meta: slideMeta,
        content: 'CONSULTAS PRÉ-NATAL',
        rows: [
          { label: 'Mínimo', value: 'Seis consultas de baixo risco', badge: 'hot', emphasis: 'highlight' },
          { label: '1º trimestre', value: 'Uma consulta — captação precoce', badge: 'info' },
          { label: '2º trimestre', value: 'Duas consultas', badge: 'info' },
          { label: '3º trimestre', value: 'Três consultas — fechamento', badge: 'hot' },
        ],
        footer_rule: 'D = 6 consultas com 1+2+3',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar mínimo MS e distribuição por trimestre.',
          'Eliminar A — oito consultas iguais: não é o padrão MS.',
          'Eliminar B — cinco consultas.',
          'Eliminar C — sete consultas.',
          'Testar D — seis consultas: 1 no 1º tri, 2 no 2º, 3 no 3º.',
          'Eliminar E — quatro consultas (desatualizado).',
          'Marcar letra D.',
        ],
        footer_rule: 'Seis consultas distribuídas → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NÚMERO E DISTRIBUIÇÃO',
        items: [
          { label: 'Letra A — oito consultas', detail: 'Acima do mínimo e distribuição incorreta.', correct: 'MS: 6 consultas — letra D.' },
          { label: 'Letra B — cinco consultas', detail: 'Abaixo do mínimo.', correct: 'Seis consultas com distribuição 1+2+3.' },
          { label: 'Letra C — sete consultas', detail: 'Não é o parâmetro do Caderno AB 32.', correct: 'Mínimo 6 — distribuição D.' },
          { label: 'Letra E — quatro consultas', detail: 'Pegadinha de prova antiga.', correct: 'Humanização: 6+ consultas.' },
        ],
        footer_rule: '4 consultas = desatualizado',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idcap-enfermagem-saude-da-mulher-1777104389226-4': {
    family: 'vf',
    branch: 'mulher_prenatal',
    guideline: 'MS manual gestação alto risco — diabetes mellitus gestacional: definição, fatores de risco e morbidade',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'DMG — assertivas I–III',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Três afirmativas sobre diabetes mellitus gestacional — julgar cada uma.', icon: 'Target' },
          { label: 'Definição (I)', detail: 'Intolerância a carboidratos de gravidade variável na gestação.', icon: 'Activity' },
          { label: 'Fatores de risco (II)', detail: 'Obesidade, idade, história familiar, HAS, tabagismo, macrossomia prévia…', icon: 'List' },
          { label: 'Morbidade (III)', detail: 'Hiperglicemia aumenta risco materno-fetal e repercussões futuras.', icon: 'AlertCircle' },
          { label: 'Pegadinha parcial', detail: 'Banca testa se você exclui II (fatores de risco) — todos verdadeiros.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'I, II e III verdadeiras',
      },
      {
        type: 'golden_rule',
        slide_title: 'DMG — MS',
        meta: slideMeta,
        content: 'DIABETES GESTACIONAL',
        rows: [
          { label: 'Definição', value: 'Intolerância a carboidratos na gestação', badge: 'hot' },
          { label: 'Fatores de risco', value: 'Obesidade, HAS, história familiar, tabagismo…', badge: 'info' },
          { label: 'Repercussão', value: 'Morbidade materna e perinatal + longo prazo', badge: 'hot', emphasis: 'highlight' },
          { label: 'Prevalência SUS', value: 'Condição frequente — rastreio no pré-natal', badge: 'info' },
        ],
        footer_rule: 'Três assertivas corretas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: julgar I, II e III.',
          'Julgar I: intolerância a carboidratos → VERDADEIRA.',
          'Julgar II: fatores de risco listados → VERDADEIRA.',
          'Julgar III: morbidade materno-fetal e longo prazo → VERDADEIRA.',
          'Conjunto: I, II e III.',
          'Eliminar A (I,III), B (só II), D (I,II).',
          'Marcar letra C.',
        ],
        footer_rule: 'I+II+III → letra C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COMBINAÇÃO DMG',
        items: [
          { label: 'Letra A — I e III', detail: 'Omite II sobre fatores de risco.', correct: 'II também é verdadeira — obesidade, HAS, tabagismo.' },
          { label: 'Letra B — só II', detail: 'Isola fatores de risco sem definição e morbidade.', correct: 'I e III também são verdadeiras.' },
          { label: 'Letra D — I e II', detail: 'Exclui III sobre repercussões.', correct: 'Morbidade materno-fetal — III verdadeira.' },
          { label: 'Subestimar DMG', detail: 'Tratar como condição banal.', correct: 'Três assertivas corretas — C.' },
        ],
        footer_rule: 'Não excluir fatores de risco (II)',
      },
    ],
    cleanInstruction: (s) => cleanPdfNoise(s).replace(/https?:\/\/\S+/g, '').trim(),
  },

  'ideap-enfermagem-nutricao-aplicada-a-enfermagem-1777102944034-5': {
    family: 'vf',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — nutrição gestacional: refeições fracionadas, ferro, vitamina A, leguminosas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Nutrição — orientação ACS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Quatro afirmativas (I–IV) sobre alimentação na gestação.', icon: 'Target' },
          { label: 'Refeições (I)', detail: 'Mínimo seis refeições diárias fracionadas — não pular.', icon: 'Utensils' },
          { label: 'Fígado/ferro (II)', detail: 'Fígado semanal + carnes bem cozidas — toxoplasmose.', icon: 'Drumstick' },
          { label: 'Vitamina A (III)', detail: 'Vegetais amarelos/verde-escuros três vezes por semana.', icon: 'Carrot' },
          { label: 'Leguminosas (IV)', detail: 'Porção diária de feijão/lentilha/grão-de-bico.', icon: 'Wheat' },
          { label: 'Pegadinha combinação parcial', detail: 'Todas I–IV verdadeiras — banca testa se você para em três assertivas.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'I, II, III e IV verdadeiras',
      },
      {
        type: 'golden_rule',
        slide_title: 'AB 32 — nutrição gestacional',
        meta: slideMeta,
        content: 'ORIENTAÇÃO NUTRICIONAL',
        rows: [
          { label: 'Frequência', value: 'Seis refeições — fracionar', badge: 'hot' },
          { label: 'Ferro', value: 'Fígado/miúdos + carnes cozidas', badge: 'info' },
          { label: 'Vitamina A', value: 'Vegetais coloridos — folhas e cenoura', badge: 'info' },
          { label: 'Leguminosas', value: 'Feijão diário — proteína vegetal', badge: 'hot', emphasis: 'highlight' },
        ],
        footer_rule: 'Todas as assertivas corretas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: julgar I a IV.',
          'Julgar I: seis refeições fracionadas → VERDADEIRA.',
          'Julgar II: fígado semanal + carnes cozidas → VERDADEIRA.',
          'Julgar III: vitamina A em vegetais coloridos → VERDADEIRA.',
          'Julgar IV: leguminosas diárias → VERDADEIRA.',
          'Conjunto: todas verdadeiras.',
          'Eliminar A, B, C (combinações parciais).',
          'Marcar letra D — todas corretas.',
        ],
        footer_rule: 'I+II+III+IV → letra D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COMBINAÇÃO NUTRIÇÃO',
        items: [
          { label: 'Letra A — I, II e IV', detail: 'Omite III sobre vitamina A.', correct: 'III também é verdadeira — vegetais coloridos.' },
          { label: 'Letra B — II, III e IV', detail: 'Exclui I sobre refeições fracionadas.', correct: 'I é verdadeira — seis refeições diárias.' },
          { label: 'Letra C — I, II e III', detail: 'Exclui IV sobre leguminosas.', correct: 'IV é verdadeira — feijão diário.' },
          { label: 'Combinação parcial', detail: 'Banca testa se você para antes de IV.', correct: 'Todas verdadeiras — letra D.' },
        ],
        footer_rule: 'Quatro assertivas — não parar em três',
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
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: { ...raw.question_data, instruction },
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sm-g05] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g05] total=${ok}`);
}

main();
