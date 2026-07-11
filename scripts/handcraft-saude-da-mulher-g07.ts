#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g07 (8 slugs pré-natal P0).
 *
 *   npm run handcraft:saude-da-mulher-g07
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g07 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g07';
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
    'infertilidade',
    'hemoglobina pré-natal',
    'alto risco gestacional',
    'desnutrição gestacional',
    'pré-eclâmpsia',
    'abortamento precoce',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Branch = 'mulher_prenatal' | 'mulher_planejamento' | 'mulher_parto';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis' | 'certo_errado';
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

const INFERTILITY_SLIDES = [
  {
    type: 'concept_map',
    slide_title: 'Infertilidade — critérios',
    meta: slideMeta,
    items: [
      { label: 'Comando', detail: 'Orientação pré-concepcional, fatores de risco e critérios diagnósticos de infertilidade no casal.', icon: 'Target' },
      { label: 'Casal (B)', detail: 'Um ano de relações regulares sem contraceptivos — investigar casal.', icon: 'Users' },
      { label: 'Hábitos saudáveis', detail: 'Pré-concepcional promove hábitos para quem deseja conceber.', icon: 'Heart' },
      { label: 'Idade materna', detail: 'Acima de 35 anos: antecipar investigação para seis meses.', icon: 'Calendar' },
      { label: 'Pegadinha só >35', detail: 'Infertilidade não é exclusiva de mulheres acima de 35 — distrator A.', icon: 'AlertTriangle' },
      { label: 'Pegadinha seis meses universal', detail: 'Seis meses para todas as idades — distrator D falso.', icon: 'XCircle' },
    ],
    footer_rule: '12 meses geral · 6 meses se >35',
  },
  {
    type: 'golden_rule',
    slide_title: 'Infertilidade — MS/OMS',
    meta: slideMeta,
    content: 'CRITÉRIOS DIAGNÓSTICOS',
    rows: [
      { label: 'Geral', value: 'Um ano sem concepção — casal', badge: 'hot', emphasis: 'highlight' },
      { label: '>35 anos', value: 'Investigar após seis meses', badge: 'hot' },
      { label: 'Casal', value: 'Avaliar mulher e parceiro', badge: 'info' },
      { label: 'Não é', value: 'Só mulher >35 ou seis meses para todas', badge: 'warn' },
    ],
    footer_rule: 'Critério temporal → letra B',
  },
  {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta,
    steps: [
      'Infertilidade = casal sem concepção após tempo definido.',
      'Eliminar A — só mulheres acima de 35 anos.',
      'Testar B — um ano geral; seis meses se mulher >35.',
      'Eliminar C — infertilidade masculina sem avaliar parceira.',
      'Eliminar D — seis meses para todas as idades.',
      'Marcar letra B.',
    ],
    footer_rule: '12 meses / 6 meses >35 → B',
  },
  {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta,
    content: 'PEGADINHAS — INFERTILIDADE',
    items: [
      { label: 'Letra A — só >35', detail: 'Restringe critério à idade materna avançada.', correct: 'Casal: um ano geral; seis meses se >35 — B.' },
      { label: 'Letra C — só masculina', detail: 'Ignora avaliação da parceira feminina.', correct: 'Investigação do casal — letra B.' },
      { label: 'Letra D — seis meses universal', detail: 'Não diferencia idade materna.', correct: 'Um ano geral; antecipar se >35 — B.' },
      { label: 'Pegadinha só >35', detail: 'Banca testa se você generaliza seis meses.', correct: 'Critério correto na alternativa B.' },
    ],
    footer_rule: 'Casal + tempo → B',
  },
];

const HEMOGLOBIN_SLIDES = [
  {
    type: 'concept_map',
    slide_title: 'Anemia — hemoglobina pré-natal',
    meta: slideMeta,
    items: [
      { label: 'Comando', detail: 'Rastreamento de anemia no pré-natal — intervalo da dosagem de hemoglobina.', icon: 'Target' },
      { label: 'Hb (B)', detail: 'No diagnóstico da gestação e novamente no início do terceiro trimestre.', icon: 'Droplets' },
      { label: 'Monitorização', detail: 'Repetir Hb para evitar complicações maternas e fetais.', icon: 'Activity' },
      { label: 'Pegadinha só diagnóstico', detail: 'Uma única coleta — distrator C falso.', icon: 'AlertTriangle' },
      { label: 'Pegadinha semanas erradas', detail: 'Marcos no segundo trimestre ou fora do protocolo — não é o par MS.', icon: 'XCircle' },
    ],
    footer_rule: 'Diagnóstico + 3º trimestre → B',
  },
  {
    type: 'golden_rule',
    slide_title: 'Hb — AB 32',
    meta: slideMeta,
    content: 'HEMOGRAMA / HEMOGLOBINA',
    rows: [
      { label: '1ª coleta', value: 'Diagnóstico da gestação / 1ª consulta', badge: 'hot' },
      { label: 'Repetir', value: 'Início do terceiro trimestre — periodicidade AB 32', badge: 'hot', emphasis: 'highlight' },
      { label: 'Objetivo', value: 'Detectar e tratar anemia gestacional', badge: 'info' },
      { label: 'Não é', value: 'Só uma coleta ou marco fora do 3º trimestre', badge: 'warn' },
    ],
    footer_rule: 'Duas coletas → letra B',
  },
  {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta,
    steps: [
      'MS solicita Hb no diagnóstico e repete no pré-natal.',
      'Eliminar A — marco no segundo trimestre médio.',
      'Testar B — diagnóstico + início do terceiro trimestre.',
      'Eliminar C — somente no diagnóstico.',
      'Eliminar D — marco inadequado fora do protocolo MS.',
      'Marcar letra B.',
    ],
    footer_rule: 'Hb diagnóstico + 3º tri → B',
  },
  {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta,
    content: 'PEGADINHAS — HEMOGLOBINA',
    items: [
      { label: 'Pegadinha semanas erradas', detail: 'Marcos fora do par diagnóstico + terceiro trimestre.', correct: 'MS: Hb no diagnóstico e repetir no início do 3º trimestre — B.' },
      { label: 'Letra A — segundo trimestre', detail: 'Detecção precoce não substitui coleta do terceiro trimestre.', correct: 'Repetir hemoglobina no 3º trimestre — alternativa B.' },
      { label: 'Letra C — só diagnóstico', detail: 'Anemia pode surgir após a primeira consulta.', correct: 'Duas dosagens no pré-natal — monitorar evolução — B.' },
      { label: 'Letra D — marco inadequado', detail: 'Periodicidade fora do intervalo MS cobrado.', correct: 'Par correto: diagnóstico + início do terceiro trimestre — B.' },
    ],
    footer_rule: 'Duas dosagens → B',
  },
];

const ALTO_RISCO_APS_SLIDES = [
  {
    type: 'concept_map',
    slide_title: 'Alto risco — educação permanente',
    meta: slideMeta,
    items: [
      { label: 'Comando', detail: 'Competência educacional da equipe de alto risco além do atendimento básico.', icon: 'Target' },
      { label: 'Capacitação APS (C)', detail: 'Formar equipes da atenção primária presencial e à distância.', icon: 'Users' },
      { label: 'Pegadinha só prontuário', detail: 'Registrar é rotina — não é capacitação de equipes.', icon: 'AlertTriangle' },
      { label: 'Pegadinha exame sem formação', detail: 'Solicitar exame sem capacitar interpretação.', icon: 'XCircle' },
    ],
    footer_rule: 'Educar APS = papel da referência',
  },
  {
    type: 'golden_rule',
    slide_title: 'Rede — alto risco × APS',
    meta: slideMeta,
    content: 'COMPETÊNCIA EDUCACIONAL',
    rows: [
      { label: 'Referência', value: 'Capacitar APS no manejo de alto risco', badge: 'hot', emphasis: 'highlight' },
      { label: 'Metodologia', value: 'Ativa, interdisciplinar, presencial e EAD', badge: 'info' },
      { label: 'Prontuário', value: 'Registro é rotina — não é o foco da questão', badge: 'warn' },
      { label: 'Urgência', value: 'Intervir sem orientar APS — inadequado', badge: 'warn' },
    ],
    footer_rule: 'Formação de equipes → C',
  },
  {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta,
    steps: [
      'Identificar ação educacional além do atendimento direto.',
      'Eliminar A — só registro em prontuário.',
      'Eliminar B — exames sem formar equipe.',
      'Testar C — capacitar APS presencial e à distância com metodologias ativas.',
      'Eliminar D — intervir sem comunicar APS.',
      'Marcar letra C.',
    ],
    footer_rule: 'Capacitação APS → C',
  },
  {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta,
    content: 'PEGADINHAS — PAPEL EDUCACIONAL',
    items: [
      { label: 'Letra A — prontuário', detail: 'Registro é atribuição rotineira.', correct: 'Além do básico: capacitar APS — letra C.' },
      { label: 'Letra B — exame sem formação', detail: 'Não educa a equipe da APS.', correct: 'Capacitação com metodologias ativas — C.' },
      { label: 'Letra D — urgência sem orientar', detail: 'Falta articulação com APS.', correct: 'Formação permanente das equipes — C.' },
      { label: 'Confundir atendimento × educação', detail: 'Questão pede formação de equipes.', correct: 'Capacitar APS no alto risco — C.' },
    ],
    footer_rule: 'Referência educa APS',
  },
];

const SPECS: Record<string, Pack> = {
  'idib-enfermagem-saude-da-mulher-1777104335102-2': {
    family: 'conceito',
    branch: 'mulher_planejamento',
    guideline: 'Caderno AB 32 (MS) — infertilidade: um ano sem concepção; seis meses se mulher >35 anos',
    slides: INFERTILITY_SLIDES,
    cleanInstruction: cleanPdfNoise,
  },

  'idib-enfermagem-saude-da-mulher-1777104335102-3': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS 2012) — hemoglobina: 1ª consulta e repetição no 3º trimestre',
    slides: HEMOGLOBIN_SLIDES,
    cleanInstruction: cleanPdfNoise,
  },

  'idib-enfermagem-saude-da-mulher-1778934936220-9': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'MS manual alto risco — equipe referência capacita APS no manejo de gestante de alto risco',
    slides: ALTO_RISCO_APS_SLIDES,
    cleanInstruction: cleanPdfNoise,
  },

  'idib-enfermagem-saude-da-mulher-1778934944659-0': {
    family: 'conceito',
    branch: 'mulher_planejamento',
    guideline: 'Caderno AB 32 (MS) — infertilidade: um ano sem concepção; seis meses se mulher >35 anos',
    slides: INFERTILITY_SLIDES,
    cleanInstruction: cleanPdfNoise,
  },

  'idib-enfermagem-saude-da-mulher-1778934944659-1': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS 2012) — hemoglobina: 1ª consulta e repetição no 3º trimestre',
    slides: HEMOGLOBIN_SLIDES,
    cleanInstruction: cleanPdfNoise,
  },

  'igeduc-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-2': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'MS/AB 32 — desnutrição primária: ingestão insuficiente por condições socioeconômicas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Desnutrição na gestação',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Tipo de desnutrição por ingestão insuficiente quantitativa ou qualitativa.', icon: 'Target' },
          { label: 'Primária (C)', detail: 'Falta de alimentos — condições ambientais e socioeconômicas.', icon: 'Wheat' },
          { label: 'Pegadinha temporal', detail: 'Temporal refere-se à duração — não ao mecanismo do texto.', icon: 'AlertTriangle' },
          { label: 'Pegadinha secundária', detail: 'Secundária = doença que impede absorção — não é o caso.', icon: 'XCircle' },
        ],
        footer_rule: 'Ingestão insuficiente = primária',
      },
      {
        type: 'golden_rule',
        slide_title: 'Tipos de desnutrição',
        meta: slideMeta,
        content: 'CLASSIFICAÇÃO',
        rows: [
          { label: 'Primária', value: 'Ingestão insuficiente — fator socioeconômico', badge: 'hot', emphasis: 'highlight' },
          { label: 'Secundária', value: 'Doença ou absorção prejudicada', badge: 'info' },
          { label: 'Temporal', value: 'Duração aguda/crônica — outro eixo', badge: 'warn' },
          { label: 'Gestação', value: 'Desnutrição prejudica desenvolvimento fetal', badge: 'info' },
        ],
        footer_rule: 'Primária → letra C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: ingestão insuficiente + condições socioeconômicas.',
          'Eliminar A — “alternativa” não é termo técnico.',
          'Eliminar B — temporal classifica duração, não causa.',
          'Testar C — desnutrição primária.',
          'Eliminar D — “particular” não é classificação nutricional.',
          'Marcar letra C.',
        ],
        footer_rule: 'Socioeconômica + falta de comida → C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DESNUTRIÇÃO',
        items: [
          { label: 'Letra A — alternativa', detail: 'Termo inexistente na classificação nutricional.', correct: 'Ingestão insuficiente = desnutrição primária — C.' },
          { label: 'Pegadinha temporal', detail: 'Confunde duração com mecanismo etiológico.', correct: 'Ingestão insuficiente = primária — C.' },
          { label: 'Letra B — temporal', detail: 'Não descreve falta de oferta alimentar.', correct: 'Primária por condições socioeconômicas.' },
          { label: 'Letra D — particular', detail: 'Termo inexistente na classificação.', correct: 'Desnutrição primária — letra C.' },
          { label: 'Confundir com secundária', detail: 'Secundária exige doença de base.', correct: 'Falta de alimentos → primária.' },
        ],
        footer_rule: 'Oferta alimentar → primária',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'igeduc-enfermagem-saude-da-mulher-1777104306781-4': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — pré-eclâmpsia: hipertensão gestacional + proteinúria após viabilidade',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pré-eclâmpsia — sinais',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Sinais que indicam possível pré-eclâmpsia na gestante.', icon: 'Target' },
          { label: 'Gabarito (A)', detail: 'Proteína na urina associada à hipertensão arterial.', icon: 'Droplets' },
          { label: 'Pegadinha glicose', detail: 'Glicose elevada sugere diabetes gestacional — não pré-eclâmpsia.', icon: 'AlertTriangle' },
          { label: 'Pegadinha hipotensão', detail: 'Pré-eclâmpsia cursa com pressão alta, não baixa.', icon: 'XCircle' },
        ],
        footer_rule: 'Hipertensão + proteinúria',
      },
      {
        type: 'golden_rule',
        slide_title: 'Pré-eclâmpsia — critérios',
        meta: slideMeta,
        content: 'DIAGNÓSTICO CLÍNICO',
        rows: [
          { label: 'PA', value: 'Hipertensão arterial na gestação', badge: 'hot', emphasis: 'highlight' },
          { label: 'Proteinúria', value: 'Proteína na urina — lesão renal', badge: 'hot' },
          { label: 'Não é', value: 'Hipotensão ou glicose isolada', badge: 'warn' },
          { label: 'Aferição', value: 'PA em toda consulta de pré-natal', badge: 'info' },
        ],
        footer_rule: 'Proteinúria + hipertensão → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Pré-eclâmpsia = hipertensão + sinais de lesão orgânica.',
          'Testar A — proteína na urina e hipertensão.',
          'Eliminar B — frequência cardíaca acelerada isolada.',
          'Eliminar C — glicose elevada (DMG).',
          'Eliminar D — hipotensão arterial.',
          'Marcar letra A.',
        ],
        footer_rule: 'Proteinúria + PA alta → A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRÉ-ECLÂMPSIA',
        items: [
          { label: 'Letra B — FC acelerada', detail: 'Não define pré-eclâmpsia isoladamente.', correct: 'Proteinúria + hipertensão — letra A.' },
          { label: 'Letra C — glicose elevada', detail: 'Níveis de glicose sugerem diabetes gestacional.', correct: 'Pré-eclâmpsia = proteinúria + hipertensão — letra A.' },
          { label: 'Pegadinha glicose', detail: 'Confunde com diabetes gestacional.', correct: 'Lesão renal + PA alta — A.' },
          { label: 'Letra D — hipotensão', detail: 'Pré-eclâmpsia é hipertensão, não hipotensão.', correct: 'Proteína na urina e hipertensão — A.' },
          { label: 'Confundir com DMG', detail: 'Glicose não é critério de pré-eclâmpsia.', correct: 'Marcar alternativa A.' },
        ],
        footer_rule: 'PA alta + proteinúria',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'igeduc-enfermagem-saude-da-mulher-1777104432986-6': {
    family: 'certo_errado',
    branch: 'mulher_prenatal',
    guideline: 'OMS/MS — abortamento: antes do limite gestacional; precoce até 1º trimestre; tardio até limite OMS',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Abortamento — classificação',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Julgar definição de abortamento e classificação precoce/tardio.', icon: 'Target' },
          { label: 'Limite OMS', detail: 'Morte ovular antes do marco gestacional clássico de viabilidade.', icon: 'Calendar' },
          { label: 'Precoce', detail: 'Até o fim do primeiro trimestre gestacional.', icon: 'Clock' },
          { label: 'Tardio', detail: 'Entre fim do 1º trimestre e limite de abortamento.', icon: 'Timer' },
          { label: 'Pegadinha parto prematuro', detail: 'Confundir aborto tardio com prematuridade após o limite.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Precoce × tardio × limite OMS',
      },
      {
        type: 'golden_rule',
        slide_title: 'Abortamento — tipos',
        meta: slideMeta,
        content: 'CLASSIFICAÇÃO TEMPORAL',
        rows: [
          { label: 'Abortamento', value: 'Interrupção antes do limite gestacional OMS', badge: 'hot' },
          { label: 'Precoce', value: 'Até o primeiro trimestre', badge: 'hot', emphasis: 'highlight' },
          { label: 'Tardio', value: 'Do 2º trimestre até o limite de aborto', badge: 'info' },
          { label: 'Não confundir', value: 'Parto prematuro após o limite', badge: 'warn' },
        ],
        footer_rule: 'Afirmativa da prova = correta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler afirmativa: morte ovular antes do limite + precoce/tardio.',
          'Verificar definição de abortamento — alinhada à OMS.',
          'Verificar precoce até fim do 1º trimestre.',
          'Verificar tardio até o limite gestacional de aborto.',
          'Afirmativa coerente com classificação clássica.',
          'Eliminar Errado.',
          'Marcar Certo — letra A.',
        ],
        footer_rule: 'Classificação correta → Certo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ABORTAMENTO',
        items: [
          { label: 'Pegadinha parto prematuro', detail: 'Após o limite não é mais abortamento.', correct: 'Afirmativa descreve precoce e tardio corretamente — Certo.' },
          { label: 'Letra B — Errado', detail: 'Negar classificação aceita na obstetrícia.', correct: 'Definição e tipos estão corretos — marcar Certo.' },
          { label: 'Confundir precoce/tardio', detail: 'Trocar limites entre trimestres.', correct: 'Precoce no 1º tri; tardio até limite — Certo.' },
          { label: 'Ignorar morte ovular', detail: 'Aborto exige interrupção da gestação.', correct: 'Assertiva completa — letra A.' },
        ],
        footer_rule: 'Limites corretos → Certo',
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
    console.log(`[handcraft:sm-g07] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g07] total=${ok}`);
}

main();
