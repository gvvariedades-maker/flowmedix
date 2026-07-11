#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g13 (8 slugs parto P0).
 *
 *   npm run handcraft:saude-da-mulher-g13
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g13 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g13';
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
    'classificação de risco gestacional',
    'hipertensão gestacional',
    'pré-natal anomalias congênitas',
    'Naegele',
  ],
};

const OMS_PARTO_SOURCE = {
  id: 'oms-parto-humanizado',
  tier: 'A' as const,
  issuer: 'OMS / MS — PNH',
  title: 'Recomendações OMS — parto humanizado e cuidados intraparto',
  year: 2018,
  url: 'https://www.who.int/publications/i/item/9789241550215',
  covers: [
    'alívio não farmacológico da dor',
    'enema e jejum no parto',
    'pródromos trabalho de parto',
    'parto normal',
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

type Branch = 'mulher_prenatal' | 'mulher_planejamento' | 'mulher_parto';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis' | 'certo_errado';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  sources?: (typeof AB32_SOURCE | typeof OMS_PARTO_SOURCE)[];
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
    sources: pack.sources ?? [OMS_PARTO_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\n?\d{4}\)\s*/g, '\n')
    .replace(/PAS ≥\s*\n160/g, 'PAS elevada')
    .replace(/PAD ≥\s*\n110 mmHg/g, 'PAD elevada')
    .replace(/\s+/g, ' ')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'fafipa-enfermagem-processo-de-enfermagem-1780009379028-9': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'SESA/PR 2022 / MS — classificação de risco: ameaça de aborto resolvida pode ser habitual',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Risco gestacional — SESA',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Linha de Cuidado Materno Infantil — classificação de risco na gestação.', icon: 'Target' },
          { label: 'Ameaça aborto (A)', detail: 'Ameaça resolvida na gestação atual — risco habitual conforme prova.', icon: 'CheckCircle' },
          { label: 'Pegadinha adolescente', detail: 'Gestante de 14 anos — alto risco — B.', icon: 'AlertTriangle' },
          { label: 'Pegadinha puerpério curto', detail: 'Linha cobre puerpério além do primeiro mês — acompanhamento até o 42º dia.', icon: 'Clock' },
        ],
        footer_rule: 'Classificar risco por fator',
      },
      {
        type: 'golden_rule',
        slide_title: 'Risco — gestação',
        meta: slideMeta,
        content: 'CLASSIFICAÇÃO DE RISCO',
        rows: [
          { label: 'Habitual', value: 'Gestação sem fator de alto risco ativo', badge: 'info' },
          { label: 'Alto risco', value: 'Adolescente, óbito fetal prévio, comorbidades graves', badge: 'hot', emphasis: 'highlight' },
          { label: 'Ameaça aborto', value: 'Resolvida — pode manter risco habitual na prova', badge: 'hot' },
          { label: 'Obesidade mórbida', value: 'Eleva estratificação — não habitual', badge: 'warn' },
        ],
        footer_rule: 'Ameaça resolvida → habitual — A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'SESA/PR — estratificar risco gestacional.',
          'Testar A — ameaça de aborto resolvida: habitual.',
          'Eliminar B — 14 anos: alto risco.',
          'Eliminar C — DMG: não habitual isoladamente na banca.',
          'Eliminar D — óbito fetal anterior: alto risco.',
          'Eliminar E — obesidade mórbida: não habitual.',
          'Marcar letra A.',
        ],
        footer_rule: 'Ameaça aborto resolvida → A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — RISCO',
        items: [
          { label: 'Letra B — 14 anos', detail: 'Adolescente jovem eleva risco.', correct: 'Alto risco — não é habitual; gabarito A.' },
          { label: 'Letra C — DMG', detail: 'Diabetes gestacional altera estratificação.', correct: 'Ameaça de aborto resolvida — letra A.' },
          { label: 'Letra D — óbito fetal', detail: 'Antecedente obstétrico grave.', correct: 'Alto risco — marcar A.' },
          { label: 'Letra E — obesidade mórbida', detail: 'Comorbidade significativa.', correct: 'Risco habitual na ameaça resolvida — A.' },
        ],
        footer_rule: 'Fatores de alto risco',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fafipa-enfermagem-processo-de-enfermagem-1780009386446-6': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'SESA/PR / MS — hipertensão gestacional leve: orientar sinais de alarme e movimentos fetais',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hipertensão — sem gravidade',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: 'Hipertensão gestacional sem critérios de gravidade — acompanhamento ambulatorial.', icon: 'Gauge' },
          { label: 'Sinais de alarme (B)', detail: 'Cefaleia, epigastralgia, hipocôndrio direito, MF+, sangramento.', icon: 'AlertTriangle' },
          { label: 'Pegadinha aspirina TE', detail: 'TE não prescreve aspirina — A.', icon: 'Ban' },
          { label: 'Pegadinha Papanicolau anual', detail: 'Citologia não é anual universal — periodicidade trienal na faixa etária.', icon: 'AlertTriangle' },
          { label: 'Pegadinha hospitalar', detail: 'Acompanhamento não é exclusivamente hospitalar — E.', icon: 'XCircle' },
        ],
        footer_rule: 'Educar sinais de alarme',
      },
      {
        type: 'golden_rule',
        slide_title: 'HAS gestacional — leve',
        meta: slideMeta,
        content: 'ORIENTAÇÃO ENFERMAGEM',
        rows: [
          { label: 'Alerta', value: 'Cefaleia intensa, dor epigástrica, escotomas', badge: 'hot', emphasis: 'highlight' },
          { label: 'Feto', value: 'Diminuição de movimentos fetais', badge: 'hot' },
          { label: 'Sangramento', value: 'Sangue vaginal ou TP prematuro — retornar', badge: 'warn' },
          { label: 'Não é', value: 'Exercício intenso, internação universal ou aspirina pelo TE', badge: 'warn' },
        ],
        footer_rule: 'Sinais de alarme → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'HAS gestacional sem gravidade — reforço ambulatorial.',
          'Eliminar A — aspirina pelo TE.',
          'Testar B — sinais de alarme e MF.',
          'Eliminar C — aeróbico intenso.',
          'Eliminar D — exercícios isométricos puros.',
          'Eliminar E — pré-natal só hospitalar.',
          'Marcar letra B.',
        ],
        footer_rule: 'Educar alarmes → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HAS GESTACIONAL',
        items: [
          { label: 'Letra A — aspirina', detail: 'Prescrição médica — não atribuição do TE.', correct: 'Sinais de alarme — letra B.' },
          { label: 'Letra C — aeróbico intenso', detail: 'Contraindicado na HAS.', correct: 'Cefaleia e epigastralgia — gabarito B.' },
          { label: 'Letra D — isométrico', detail: 'Pode elevar pressão.', correct: 'Orientar retorno se alarmes — B.' },
          { label: 'Letra E — hospitalar', detail: 'Maioria ambulatorial.', correct: 'Sinais de alarme — marcar B.' },
        ],
        footer_rule: 'Vigilância materno-fetal',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002704012-1': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'MS/FEGO — Regra de Naegele: data provável do parto a partir da DUM',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Naegele — DPP',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Regra Universal de Naegele calcula data provável.', icon: 'Target' },
          { label: 'Parto (C)', detail: 'Data provável do parto — DPP.', icon: 'Calendar' },
          { label: 'Pegadinha puerpério', detail: 'Puerpério é pós-parto — não DPP — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha aborto', detail: 'Interrupção precoce — não cálculo Naegele — E.', icon: 'XCircle' },
        ],
        footer_rule: 'Naegele → data do parto',
      },
      {
        type: 'golden_rule',
        slide_title: 'Naegele — fórmula',
        meta: slideMeta,
        content: 'DATA PROVÁVEL',
        rows: [
          { label: 'Calcula', value: 'Data provável do parto (DPP)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Base', value: 'Ajuste aritmético da DUM (semana e mês)', badge: 'info' },
          { label: 'Não é', value: 'Puerpério, toque ou preventivo', badge: 'warn' },
        ],
        footer_rule: 'DPP = parto → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Naegele — estimar quando ocorrerá o nascimento.',
          'Eliminar A — puerpério.',
          'Eliminar B — preventivo.',
          'Testar C — parto.',
          'Eliminar D — toque.',
          'Eliminar E — aborto.',
          'Marcar letra C.',
        ],
        footer_rule: 'Data provável do parto → C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NAEEGELE',
        items: [
          { label: 'Letra A — puerpério', detail: 'Período após o parto.', correct: 'Data provável do parto — letra C.' },
          { label: 'Letra B — preventivo', detail: 'Não é terminologia obstétrica.', correct: 'Naegele estima parto — gabarito C.' },
          { label: 'Letra D — toque', detail: 'Exame, não data.', correct: 'DPP do parto — marcar C.' },
          { label: 'Letra E — aborto', detail: 'Interrupção da gestação.', correct: 'Data provável do parto — C.' },
        ],
        footer_rule: 'Naegele = DPP parto',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fau-unicentro-enfermagem-processo-de-enfermagem-1780009379028-0': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'MS/FEGO — ginecologia: saúde reprodutiva; obstetrícia: gestação, parto e puerpério',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gineco × Obstetra',
        meta: slideMeta,
        items: [
          { label: 'Lacuna 1', detail: 'Fora da gestação — sistema reprodutor — ginecologia.', icon: 'Stethoscope' },
          { label: 'Lacuna 2 (D)', detail: 'Gestação, parto e puerpério — obstetrícia.', icon: 'Baby' },
          { label: 'Pegadinha invertida', detail: 'Obstetrícia / Ginecologia — ordem trocada — C.', icon: 'AlertTriangle' },
          { label: 'Pegadinha proctologia', detail: 'Especialidade distinta — E.', icon: 'XCircle' },
        ],
        footer_rule: 'Gineco fora — Obstetra na gestação',
      },
      {
        type: 'golden_rule',
        slide_title: 'Especialidades',
        meta: slideMeta,
        content: 'GINECO × OBSTETRA',
        rows: [
          { label: 'Ginecologia', value: 'Saúde reprodutiva fora da gestação', badge: 'hot', emphasis: 'highlight' },
          { label: 'Obstetrícia', value: 'Gestação, parto e puerpério', badge: 'hot' },
          { label: 'Ordem', value: 'Ginecologia / Obstetrícia', badge: 'info' },
        ],
        footer_rule: 'Gineco / Obstetra → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Preencher lacunas — especialidades obstétricas.',
          'Eliminar letra A — endocrinologia não preenche lacuna.',
          'Eliminar letra B — segunda lacuna não é endocrino.',
          'Eliminar letra C — ordem invertida Obstetrícia/Ginecologia.',
          'Testar letra D — Ginecologia / Obstetrícia.',
          'Eliminar letra E — proctologia fora do escopo.',
          'Marcar letra D.',
        ],
        footer_rule: 'Ginecologia / Obstetrícia → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LACUNAS',
        items: [
          { label: 'Letra A — endocrinologia', detail: 'Não preenche lacuna obstétrica.', correct: 'Ginecologia / Obstetrícia — letra D.' },
          { label: 'Letra B — endocrinologia', detail: 'Segunda lacuna é obstetrícia.', correct: 'Ordem correta — gabarito D.' },
          { label: 'Letra C — ordem invertida', detail: 'Obstetrícia vem na segunda lacuna.', correct: 'Ginecologia primeiro — marcar D.' },
          { label: 'Letra E — proctologia', detail: 'Fora do escopo.', correct: 'Ginecologia / Obstetrícia — D.' },
        ],
        footer_rule: 'Fora gestação = gineco',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fau-unicentro-enfermagem-saude-da-mulher-1777104288275-5': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'MS — notação obstétrica G/P/A e idade gestacional definem gestação em curso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Caso obstétrico — emergência',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: 'Gesta 2 para 1, terceiro trimestre, sangramento indolor — contexto obstétrico.', icon: 'User' },
          { label: 'Gestante (E)', detail: 'Idade gestacional e notação G/P confirmam gestação.', icon: 'Baby' },
          { label: 'Pegadinha Papanicolau anual', detail: 'Citologia não é anual universal — periodicidade trienal na faixa etária.', icon: 'AlertTriangle' },
          { label: 'Pegadinha mamografia anual', detail: 'Rastreio mamográfico é bienal — não anual universal.', icon: 'XCircle' },
        ],
        footer_rule: 'G2P1 + IG avançada = gestante',
      },
      {
        type: 'golden_rule',
        slide_title: 'Notação — G/P/A',
        meta: slideMeta,
        content: 'HISTÓRIA OBSTÉTRICA',
        rows: [
          { label: 'Gesta', value: 'Número total de gestações', badge: 'info' },
          { label: 'Para', value: 'Partos com viabilidade', badge: 'info' },
          { label: 'IG', value: 'Semanas informadas — gestação em curso', badge: 'hot', emphasis: 'highlight' },
          { label: 'Conduta', value: 'Atendimento médico obrigatório — não trivializar', badge: 'warn' },
        ],
        footer_rule: 'Contexto define gestante → E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler G2P1A0 e idade gestacional no enunciado.',
          'Eliminar A — próstata: absurdo.',
          'Eliminar B — negar relações: contradiz paridade.',
          'Eliminar C — diabetes: não se deduz do caso.',
          'Eliminar D — dispensar médico: incorreto.',
          'Testar E — certamente gestante pelo contexto.',
          'Marcar letra E.',
        ],
        footer_rule: 'IG + G/P → gestante — E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DISTRATORES',
        items: [
          { label: 'Letra A — próstata', detail: 'Distrator absurdo — paciente feminina.', correct: 'Gestante pelo contexto — letra E.' },
          { label: 'Letra B — sem relações', detail: 'Para 1 contradiz história.', correct: 'Gesta 2 para 1 — gabarito E.' },
          { label: 'Letra C — diabetes', detail: 'Não decorre do sangramento.', correct: 'IG avançada no enunciado — E.' },
          { label: 'Letra D — sem médico', detail: 'Sangramento exige avaliação.', correct: 'Gestação em curso — marcar E.' },
          { label: 'Pegadinha Papanicolau anual', detail: 'Citologia trienal — não confundir com notação G/P.', correct: 'Contexto obstétrico — letra E.' },
          { label: 'Pegadinha mamografia anual', detail: 'Rastreio mamográfico bienal — fora do caso.', correct: 'G2P1 define gestação — E.' },
        ],
        footer_rule: 'Ler notação obstétrica',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fau-unicentro-enfermagem-semiologia-em-enfermagem-1779563505333-1': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'MS/FEGO — pródromos do trabalho de parto precedem o período expulsivo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pródromos — TP',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Definir relação temporal dos pródromos do trabalho de parto.', icon: 'Target' },
          { label: 'Precedem TP (D)', detail: 'Pródromos antecedem o trabalho de parto propriamente dito.', icon: 'Clock' },
          { label: 'Pegadinha gestação', detail: 'Não precedem nem sucedem gestação inteira — A e B.', icon: 'AlertTriangle' },
          { label: 'Pegadinha pós-parto', detail: 'Não sucedem o parto — E.', icon: 'XCircle' },
        ],
        footer_rule: 'Pródromos → antes do TP',
      },
      {
        type: 'golden_rule',
        slide_title: 'Fases — TP',
        meta: slideMeta,
        content: 'PRÓDROMOS',
        rows: [
          { label: 'Quando', value: 'Antes do trabalho de parto ativo', badge: 'hot', emphasis: 'highlight' },
          { label: 'Sinais', value: 'Apagamento, contrações irregulares, perda mucosa', badge: 'info' },
          { label: 'Não é', value: 'Fase pós-parto nem evita gestação', badge: 'warn' },
        ],
        footer_rule: 'Precedem o TP → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Pródromos — fase preparatória do parto.',
          'Eliminar A — precedem gestação.',
          'Eliminar B — sucedem gestação.',
          'Eliminar C — evitam gestação.',
          'Testar D — precedem trabalho de parto.',
          'Eliminar E — sucedem parto.',
          'Marcar letra D.',
        ],
        footer_rule: 'Antes do TP → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRÓDROMOS',
        items: [
          { label: 'Letra A — precedem gestação', detail: 'Ocorrem no final da gestação.', correct: 'Precedem trabalho de parto — letra D.' },
          { label: 'Letra B — sucedem gestação', detail: 'Antecedem o TP.', correct: 'Fase preparatória — gabarito D.' },
          { label: 'Letra C — evitam gestação', detail: 'Sem sentido clínico.', correct: 'Antes do TP ativo — marcar D.' },
          { label: 'Letra E — sucedem parto', detail: 'Pródromos são pré-parto.', correct: 'Precedem trabalho de parto — D.' },
        ],
        footer_rule: 'Pródromos = pré-TP',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fcpc-enfermagem-processo-de-enfermagem-1780004602717-9': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'Diretrizes Nacionais MS — parto normal: analgesia não farmacológica antes da farmacológica',
    roi_error: 'parto_supina_expulsivo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Parto normal — MS',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: 'Parturiente baixo risco, apresentação cefálica, TP ativo.', icon: 'User' },
          { label: 'Analgesia não farmacológica (A)', detail: 'Oferecer antes dos métodos farmacológicos.', icon: 'Heart' },
          { label: 'Pegadinha jejum absoluto', detail: 'Líquidos leves permitidos — B falsa.', icon: 'AlertTriangle' },
          { label: 'Pegadinha enema rotina', detail: 'Enema não é rotineiro — D falsa.', icon: 'Ban' },
        ],
        footer_rule: 'Dor não farmacológica primeiro',
      },
      {
        type: 'golden_rule',
        slide_title: 'Parto normal — MS',
        meta: slideMeta,
        content: 'DIRETRIZES NACIONAIS',
        rows: [
          { label: 'Dor', value: 'Métodos não farmacológicos antes dos farmacológicos', badge: 'hot', emphasis: 'highlight' },
          { label: 'Hidratação', value: 'Líquidos leves permitidos no TP de baixo risco', badge: 'info' },
          { label: 'Não rotina', value: 'Enema e jejum absoluto', badge: 'warn' },
          { label: 'Higiene', value: 'Limpeza perineal conforme necessidade — não água estéril obrigatória', badge: 'info' },
        ],
        footer_rule: 'Não farmacológico primeiro → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Parto normal de baixo risco — diretrizes MS.',
          'Testar A — analgesia não farmacológica antes.',
          'Eliminar B — proibir líquidos.',
          'Eliminar C — água estéril obrigatória.',
          'Eliminar D — enema de rotina.',
          'Marcar letra A.',
        ],
        footer_rule: 'Escada analgésica → A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PARTO NORMAL',
        items: [
          { label: 'Letra B — jejum líquidos', detail: 'Humanização permite hidratação oral.', correct: 'Analgesia não farmacológica primeiro — letra A.' },
          { label: 'Letra C — água estéril', detail: 'Limpeza não exige água estéril rotina.', correct: 'Métodos não farmacológicos — gabarito A.' },
          { label: 'Letra D — enema', detail: 'Procedimento abolido na rotina.', correct: 'Oferecer analgesia não farmacológica — A.' },
          { label: 'Pegadinha enema rotina', detail: 'OMS não recomenda enema universal.', correct: 'Escada da dor — letra A.' },
        ],
        footer_rule: 'Humanização do parto',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fepese-enfermagem-saude-da-mulher-1777104222222-4': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'MS/Caderno AB 32 — pré-natal: prevenção e detecção precoce de anomalias congênitas',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Anomalias congênitas',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Estratégia de prevenção e detecção precoce de AC no SUS.', icon: 'Target' },
          { label: 'Pré-natal (A)', detail: 'Ultrassom, fólico, rastreios e vigilância fetal.', icon: 'Stethoscope' },
          { label: 'Pegadinha parto humanizado', detail: 'Humanização não substitui rastreio pré-natal — B.', icon: 'AlertTriangle' },
          { label: 'Pegadinha cesariana', detail: 'Via de parto não previne AC — E.', icon: 'XCircle' },
        ],
        footer_rule: 'Rastreio no pré-natal',
      },
      {
        type: 'golden_rule',
        slide_title: 'Prevenção AC — MS',
        meta: slideMeta,
        content: 'ANOMALIAS CONGÊNITAS',
        rows: [
          { label: 'Pré-natal', value: 'Detecção precoce — USG, fólico, sorologias', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fólico', value: 'Prevenção de defeitos do tubo neural', badge: 'hot' },
          { label: 'Não é', value: 'Parto humanizado, mapeamento universal ou cesariana', badge: 'warn' },
        ],
        footer_rule: 'Pré-natal → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Prevenção e detecção de anomalias congênitas.',
          'Testar A — pré-natal.',
          'Eliminar B — parto humanizado isolado.',
          'Eliminar C — mapeamento genético universal.',
          'Eliminar D — biologia molecular rotina.',
          'Eliminar E — cesariana.',
          'Marcar letra A.',
        ],
        footer_rule: 'Vigilância pré-natal → A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AC',
        items: [
          { label: 'Letra B — parto humanizado', detail: 'Não substitui rastreio gestacional.', correct: 'Pré-natal detecta AC — letra A.' },
          { label: 'Letra C — mapeamento', detail: 'Não é estratégia populacional SUS.', correct: 'Acompanhamento pré-natal — gabarito A.' },
          { label: 'Letra D — biologia molecular', detail: 'Alto custo — não estratégia base.', correct: 'Pré-natal — marcar A.' },
          { label: 'Letra E — cesariana', detail: 'Via de parto ≠ prevenção AC.', correct: 'Detecção no pré-natal — letra A.' },
        ],
        footer_rule: 'AC = vigilância pré-natal',
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
    console.log(`[handcraft:sm-g13] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g13] total=${ok}`);
}

main();
