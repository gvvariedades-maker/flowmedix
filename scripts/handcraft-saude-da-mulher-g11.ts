#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g11 (8 slugs parto P0).
 *
 *   npm run handcraft:saude-da-mulher-g11
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g11 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g11';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-09';

const AB32_SOURCE = {
  id: 'caderno-ab-32-prenatal',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica nº 32 — Atenção ao pré-natal de baixo risco',
  year: 2012,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: ['ácido fólico', 'diabetes gestacional', 'assistência pré-natal', 'puerpério'],
};

const OMS_PARTO_SOURCE = {
  id: 'oms-parto-humanizado',
  tier: 'A' as const,
  issuer: 'OMS / MS — PNH',
  title: 'Recomendações OMS — parto humanizado e cuidados intraparto',
  year: 2018,
  url: 'https://www.who.int/publications/i/item/9789241550215',
  covers: [
    'monitorização fetal seletiva',
    'alívio não farmacológico da dor',
    'posição no expulsivo',
    'clampeamento tardio cordão',
    'tricotomia e enema',
    'parto humanizado',
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
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanAtameParto(s: string): string {
  return cleanPdfNoise(s)
    .replace(/Não e indicada/g, 'Não é indicada')
    .replace(/apresentado contrações/g, 'apresentando contrações')
    .replace(/chega á unidade/g, 'chega à unidade')
    .replace(/para prepara a gestante/g, 'para preparar a gestante');
}

const SPECS: Record<string, Pack> = {
  'adm-tec-enfermagem-saude-da-mulher-1777104301763-1': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'Caderno AB 32 (MS 2012) — ácido fólico: prevenção de defeitos do tubo neural',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ácido fólico — gestação',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Papel do ácido fólico na saúde materno-fetal no pré-natal.', icon: 'Target' },
          { label: 'DTN (B)', detail: 'Desenvolvimento do sistema nervoso e prevenção de defeitos do tubo neural.', icon: 'Baby' },
          { label: 'Pegadinha náuseas', detail: 'Fólico não previne emeses gravídicas — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha DMG/PA', detail: 'Não previne diabetes gestacional nem hipertensão — D.', icon: 'XCircle' },
        ],
        footer_rule: 'Fólico → sistema nervoso fetal',
      },
      {
        type: 'golden_rule',
        slide_title: 'Suplementação — MS',
        meta: slideMeta,
        content: 'ÁCIDO FÓLICO',
        rows: [
          { label: 'Função', value: 'Desenvolvimento adequado do sistema nervoso fetal', badge: 'hot', emphasis: 'highlight' },
          { label: 'Prevenção', value: 'Defeitos do tubo neural', badge: 'hot' },
          { label: 'Não é', value: 'Anti-náusea, ganho ponderal ou prevenção de DMG', badge: 'warn' },
          { label: 'Quando', value: 'Pré-concepcional e início precoce da gestação', badge: 'info' },
        ],
        footer_rule: 'DTN → letra B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar função específica do ácido fólico.',
          'Eliminar A — prevenir náuseas: sem evidência.',
          'Testar B — sistema nervoso e defeitos do tubo neural.',
          'Eliminar C — ganho de peso e parto prematuro.',
          'Eliminar D — diabetes gestacional e hipertensão.',
          'Marcar letra B.',
        ],
        footer_rule: 'Tubo neural → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ÁCIDO FÓLICO',
        items: [
          { label: 'Letra A — náuseas', detail: 'Confunde com antiemético.', correct: 'Sistema nervoso fetal e DTN — letra B.' },
          { label: 'Letra C — ganho de peso', detail: 'Nutrição ≠ função do fólico.', correct: 'Prevenção de defeito do tubo neural — gabarito B.' },
          { label: 'Letra D — DMG e PA', detail: 'Suplemento vitamínico específico.', correct: 'Desenvolvimento neurológico fetal — marcar B.' },
          { label: 'Pegadinha náuseas', detail: 'Banca atribui efeito antiemético.', correct: 'Fólico e tubo neural — letra B.' },
        ],
        footer_rule: 'Fólico ≠ ferro nem antiemético',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'adm-tec-enfermagem-saude-da-mulher-1777104329543-2': {
    family: 'vf',
    branch: 'mulher_parto',
    guideline: 'OMS/PNH/MS 2018 — parto humanizado: monitorização seletiva, mobilidade, clampeamento tardio do cordão',
    roi_error: 'parto_ctg_universal',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Boas práticas — parto',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Quatro assertivas sobre trabalho de parto — julgar I–IV antes das letras.', icon: 'Target' },
          { label: 'Pegadinha CTG universal', detail: 'Cardiotocografia contínua para todas — I é falsa — monitorização seletiva.', icon: 'Activity' },
          { label: 'Alívio não farmacológico (II)', detail: 'Água morna e movimentação ativa — verdadeira.', icon: 'Waves' },
          { label: 'Pegadinha supina expulsivo', detail: 'Posição dorsal única no expulsivo — III falsa — mobilidade materna.', icon: 'AlertTriangle' },
          { label: 'Clampeamento tardio (IV)', detail: 'Um a três minutos após o nascimento — melhora estoques de ferro.', icon: 'Heart' },
        ],
        footer_rule: 'I e III falsas — II e IV verdadeiras',
      },
      {
        type: 'golden_rule',
        slide_title: 'OMS — parto humanizado',
        meta: slideMeta,
        content: 'TRABALHO DE PARTO',
        rows: [
          { label: 'Monitor fetal', value: 'Seletiva conforme risco — não contínua universal', badge: 'warn' },
          { label: 'Dor', value: 'Métodos não farmacológicos — água e movimento', badge: 'hot', emphasis: 'highlight' },
          { label: 'Expulsivo', value: 'Vertical, lateral ou posições livres — não só supina', badge: 'hot' },
          { label: 'Cordão', value: 'Clampeamento tardio quando viável', badge: 'info' },
        ],
        footer_rule: 'Humanização ≠ CTG em todas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Julgar I — CTG contínua para todas → FALSA.',
          'Julgar II — imersão e movimentação para dor → VERDADEIRA.',
          'Julgar III — supina no expulsivo → FALSA.',
          'Julgar IV — clampeamento tardio do cordão → VERDADEIRA.',
          'Conjunto correto: II e IV apenas.',
          'Eliminar A (I e II), C (I e III), D (III e IV).',
          'Marcar letra B.',
        ],
        footer_rule: 'II + IV verdadeiras → letra B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F PARTO',
        items: [
          { label: 'Pegadinha CTG universal', detail: 'Humanização não exige monitor contínuo em todas.', correct: 'I é falsa — gabarito II e IV — letra B.' },
          { label: 'Letra A — I e II', detail: 'Inclui I falsa sobre cardiotocografia.', correct: 'Monitorização seletiva — marcar B (II e IV).' },
          { label: 'Letra C — I e III', detail: 'Aceita supina no expulsivo.', correct: 'Mobilidade materna — II e IV — B.' },
          { label: 'Letra D — III e IV', detail: 'Mantém III falsa com IV verdadeira.', correct: 'Supina não é padrão OMS — letra B.' },
        ],
        footer_rule: 'CTG seletivo — não universal',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'amauc-enfermagem-processo-de-enfermagem-1780002441285-6': {
    family: 'vf',
    branch: 'mulher_parto',
    guideline: 'Caderno AB 32 / COFEN — assistência de enfermagem no ciclo gravídico-puerperal',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TE — ciclo materno',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Três proposições sobre assistência no pré-natal, parto e puerpério.', icon: 'Target' },
          { label: 'Pré-natal (I)', detail: 'Identificar fatores de risco e orientar cuidados — verdadeira.', icon: 'Stethoscope' },
          { label: 'Puerpério (II)', detail: 'Observar sinais clínicos da mãe — detecção precoce — verdadeira.', icon: 'Heart' },
          { label: 'Pegadinha só parto', detail: 'Assistência restrita ao parto — III falsa — atua em todo ciclo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'I e II verdadeiras — III falsa',
      },
      {
        type: 'golden_rule',
        slide_title: 'Atribuições — TE',
        meta: slideMeta,
        content: 'ASSISTÊNCIA MATERNA',
        rows: [
          { label: 'Pré-natal', value: 'Acompanhamento e identificação de riscos', badge: 'hot', emphasis: 'highlight' },
          { label: 'Parto', value: 'Apoio físico e emocional humanizado', badge: 'info' },
          { label: 'Puerpério', value: 'Vigilância clínica e aleitamento', badge: 'hot' },
          { label: 'Não é', value: 'Atuação exclusiva no momento do parto', badge: 'warn' },
        ],
        footer_rule: 'Ciclo integral — não só parto',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Julgar I — pré-natal identifica riscos → VERDADEIRA.',
          'Julgar II — puerpério com observação clínica → VERDADEIRA.',
          'Julgar III — assistência só no parto → FALSA.',
          'Eliminar A, B, C e E — combinações incorretas.',
          'Marcar letra D — I e II corretas.',
        ],
        footer_rule: 'I + II → letra D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PROPOSIÇÕES',
        items: [
          { label: 'Letra A — só I', detail: 'Omite II verdadeira sobre puerpério.', correct: 'I e II corretas — letra D.' },
          { label: 'Letra B — II e III', detail: 'Aceita III falsa.', correct: 'Assistência não se restringe ao parto — D.' },
          { label: 'Letra C — todas', detail: 'III é falsa.', correct: 'Pré-natal e puerpério — gabarito D.' },
          { label: 'Letra E — só III', detail: 'Nega I e II verdadeiras.', correct: 'Ciclo gravídico-puerperal integral — D.' },
          { label: 'Pegadinha só parto', detail: 'TE atua antes e depois do nascimento.', correct: 'I e II verdadeiras — letra D.' },
        ],
        footer_rule: 'Assistência em todo o ciclo',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'amauc-enfermagem-processo-de-enfermagem-1780004982901-9': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'PNH/MS — parto humanizado: processo fisiológico e redução de intervenções desnecessárias',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Parto humanizado — PNH',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Política pública de dignidade e protagonismo da mulher no nascimento.', icon: 'Target' },
          { label: 'Processo fisiológico (B)', detail: 'Parto normal com redução de intervenções desnecessárias.', icon: 'Heart' },
          { label: 'Pegadinha protagonismo limitado', detail: 'Escolha não se restringe ao tipo de parto — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha padronização rígida', detail: 'Humanização ≠ eficiência sobre escolhas — C.', icon: 'XCircle' },
        ],
        footer_rule: 'Fisiológico + menos intervenções',
      },
      {
        type: 'golden_rule',
        slide_title: 'PNH — princípios',
        meta: slideMeta,
        content: 'PARTO HUMANIZADO',
        rows: [
          { label: 'Base', value: 'Parto normal como processo fisiológico', badge: 'hot', emphasis: 'highlight' },
          { label: 'Intervenções', value: 'Reduzir procedimentos desnecessários', badge: 'hot' },
          { label: 'Protagonismo', value: 'Decisões durante todo o trabalho de parto', badge: 'info' },
          { label: 'Rede', value: 'SUS e rede pública — não só privada', badge: 'warn' },
        ],
        footer_rule: 'Evidência + experiência → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Parto humanizado — política pública no SUS.',
          'Eliminar A — protagonismo só na escolha do tipo.',
          'Testar B — fisiológico e menos intervenções.',
          'Eliminar C — padronização rígida sobre escolhas.',
          'Eliminar D — desconsiderar evidências.',
          'Eliminar E — restrito à rede privada.',
          'Marcar letra B.',
        ],
        footer_rule: 'Fisiológico → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PNH',
        items: [
          { label: 'Letra A — protagonismo limitado', detail: 'Mulher decide durante todo o processo.', correct: 'Parto fisiológico com menos intervenções — B.' },
          { label: 'Letra C — padronização rígida', detail: 'Humanização respeita escolhas informadas.', correct: 'Reduzir intervenções desnecessárias — gabarito B.' },
          { label: 'Letra D — sem evidência', detail: 'Humanizado integra ciência e experiência.', correct: 'Processo fisiológico — letra B.' },
          { label: 'Letra E — só privada', detail: 'PNH é política do SUS.', correct: 'Parto humanizado público — marcar B.' },
        ],
        footer_rule: 'PNH no SUS — letra B',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'amauc-enfermagem-saude-da-mulher-1777104295283-7': {
    family: 'vf',
    branch: 'mulher_parto',
    guideline: 'COFEN/MS — assistência de enfermagem: pré-natal, parto humanizado, puerpério e planejamento familiar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Enfermagem — ciclo da mulher',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Quatro assertivas V/F sobre assistência integral.', icon: 'Target' },
          { label: 'Pré-natal (I)', detail: 'Monitorar materno-fetal e sinais de alerta — V.', icon: 'Activity' },
          { label: 'Puerpério (II)', detail: 'Aleitamento e recuperação materna — V.', icon: 'Baby' },
          { label: 'Pegadinha prescrição PF', detail: 'Enfermeiro prescrever contraceptivos exclusivamente — III F.', icon: 'AlertTriangle' },
          { label: 'Parto humanizado (IV)', detail: 'Suporte físico e emocional — V.', icon: 'Heart' },
        ],
        footer_rule: 'Sequência V, V, F, V',
      },
      {
        type: 'golden_rule',
        slide_title: 'Assistência — enfermagem',
        meta: slideMeta,
        content: 'CICLO MATERNO',
        rows: [
          { label: 'Pré-natal', value: 'Monitorização e sinais de alerta', badge: 'hot', emphasis: 'highlight' },
          { label: 'Parto', value: 'Suporte humanizado físico e emocional', badge: 'hot' },
          { label: 'Puerpério', value: 'Aleitamento e recuperação', badge: 'info' },
          { label: 'PF', value: 'Orientação compartilhada — não prescrição exclusiva', badge: 'warn' },
        ],
        footer_rule: 'V, V, F, V → letra E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Julgar I — monitorar pré-natal → VERDADEIRA.',
          'Julgar II — puerpério com AM → VERDADEIRA.',
          'Julgar III — prescrição exclusiva de contraceptivos → FALSA.',
          'Julgar IV — suporte no parto → VERDADEIRA.',
          'Sequência: V, V, F, V.',
          'Eliminar A, B, C e D.',
          'Marcar letra E.',
        ],
        footer_rule: 'V, V, F, V → E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F ENFERMAGEM',
        items: [
          { label: 'Letra A — V, F, F, F', detail: 'Nega puerpério e parto.', correct: 'II e IV verdadeiras — sequência E.' },
          { label: 'Letra B — F, F, V, F', detail: 'Inverte I e III.', correct: 'Prescrição exclusiva é falsa — gabarito E.' },
          { label: 'Letra C — V, V, V, V', detail: 'Aceita III verdadeira.', correct: 'PF compartilhado — letra E.' },
          { label: 'Letra D — F, F, V, V', detail: 'Nega pré-natal.', correct: 'V, V, F, V — marcar E.' },
          { label: 'Pegadinha prescrição PF', detail: 'Contracepção não é exclusiva do enfermeiro.', correct: 'Equipe multiprofissional — E.' },
        ],
        footer_rule: 'III falsa — prescrição exclusiva',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'ameosc-enfermagem-saude-da-mulher-1777104376057-5': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'COFEN/MS — TE na maternidade: vigilância sulfato de magnésio, puerpério e aleitamento humanizado',
    roi_error: 'puerperio_30_dias',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Maternidade — três casos',
        meta: slideMeta,
        items: [
          { label: 'Caso pré-eclâmpsia', detail: 'Pré-eclâmpsia grave em sulfato de magnésio — vigilância de sinais vitais pelo TE.', icon: 'AlertTriangle' },
          { label: 'Caso puérpera', detail: 'Puérpera pós-cesariana — dor, deambulação e aleitamento materno.', icon: 'Heart' },
          { label: 'Caso recém-nascido', detail: 'RN em alojamento conjunto — aleitamento exclusivo e vacinas neonatais.', icon: 'Baby' },
          { label: 'Pegadinha suspender aleitamento', detail: 'Dor na incisão não contraindica amamentação — letra A errada.', icon: 'Ban' },
          { label: 'Pegadinha puerpério curto', detail: 'Vigilância puerperal prolongada — MS orienta acompanhamento até o 42º dia.', icon: 'Clock' },
          { label: 'Conduta integrada (D)', detail: 'Monitorar, comunicar alterações, apoiar AM e registrar com enfermeiro.', icon: 'Target' },
        ],
        footer_rule: 'TE vigia, comunica e apoia',
      },
      {
        type: 'golden_rule',
        slide_title: 'TE — maternidade SUS',
        meta: slideMeta,
        content: 'ASSISTÊNCIA HUMANIZADA',
        rows: [
          { label: 'Magnésio', value: 'PA, FR, consciência e diurese — comunicar equipe', badge: 'hot', emphasis: 'highlight' },
          { label: 'Puérpera', value: 'Deambulação segura, dor prescrita, proteção da ferida', badge: 'hot' },
          { label: 'RN', value: 'Aleitamento exclusivo e orientação vacinal', badge: 'info' },
          { label: 'Não é', value: 'Suspender AM, ajustar magnésio ou delegar tudo', badge: 'warn' },
        ],
        footer_rule: 'Articulação com enfermeiro → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Três situações no mesmo plantão — atribuição legal do TE.',
          'Eliminar A — suspender aleitamento e negligenciar magnésio.',
          'Eliminar B — ajustar sulfato sem comunicar equipe.',
          'Eliminar C — delegar todos os cuidados às acompanhantes.',
          'Testar D — vigilância, comunicação, apoio à puérpera e família.',
          'Marcar letra D.',
        ],
        footer_rule: 'Vigilância + comunicação → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TE MATERNIDADE',
        items: [
          { label: 'Letra A — suspender AM', detail: 'Aleitamento não deve ser interrompido por dor.', correct: 'Vigilância do magnésio e apoio ao AM — D.' },
          { label: 'Letra B — ajustar magnésio', detail: 'TE não altera velocidade de infusão autônoma.', correct: 'Comunicar enfermeira e médico — gabarito D.' },
          { label: 'Letra C — delegar tudo', detail: 'TE não se limita a medicamentos.', correct: 'Sinais vitais e orientação estruturada — D.' },
          { label: 'Pegadinha fórmula rotina', detail: 'RN com boa vitalidade — aleitamento exclusivo.', correct: 'Registrar e articular com enfermeiro — letra D.' },
          { label: 'Pegadinha puerpério curto', detail: 'Cuidado puerperal segue protocolo além do puerpério imediato.', correct: 'Acompanhamento até 42 dias — gabarito D.' },
        ],
        footer_rule: 'TE não prescreve nem abandona vigilância',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'atame-enfermagem-saude-da-mulher-1777104347186-7': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'Caderno AB 32 (MS 2012) — diabetes mellitus gestacional: dieta e atividade — TE orienta',
    sources: [AB32_SOURCE],
    roi_error: 'prenatal_ttgo_1_tri',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'DMG — papel do TE',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Ação do técnico de enfermagem no acompanhamento da gestante com DMG.', icon: 'Target' },
          { label: 'Orientar dieta (C)', detail: 'Alimentação e exercícios conforme plano da equipe.', icon: 'Utensils' },
          { label: 'Pegadinha prescrever insulina', detail: 'Prescrição é médica — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha TTGO no TE', detail: 'Curva glicêmica — exame médico/lab — B.', icon: 'XCircle' },
        ],
        footer_rule: 'TE orienta — não prescreve',
      },
      {
        type: 'golden_rule',
        slide_title: 'DMG — AB 32',
        meta: slideMeta,
        content: 'DIABETES GESTACIONAL',
        rows: [
          { label: 'TE pode', value: 'Orientar dieta e exercícios físicos', badge: 'hot', emphasis: 'highlight' },
          { label: 'Médico', value: 'Prescrever insulina e solicitar TTGO', badge: 'warn' },
          { label: 'Monitorar', value: 'Glicemia conforme protocolo', badge: 'info' },
          { label: 'Não é', value: 'Realizar parto cesáreo', badge: 'warn' },
        ],
        footer_rule: 'Orientação nutricional → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'DMG — definir atribuição do TE.',
          'Eliminar A — prescrever insulina.',
          'Eliminar B — realizar curva glicêmica.',
          'Testar C — orientar dieta e exercícios.',
          'Eliminar D — realizar cesárea.',
          'Marcar letra C.',
        ],
        footer_rule: 'Dieta e exercício → C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DMG TE',
        items: [
          { label: 'Letra A — insulina', detail: 'Prescrição extrapola TE.', correct: 'Orientação dietética e exercícios — letra C.' },
          { label: 'Letra B — curva glicêmica', detail: 'Exame não é atribuição do TE.', correct: 'Educação em saúde — gabarito C.' },
          { label: 'Letra D — cesárea', detail: 'Procedimento cirúrgico médico.', correct: 'Orientar dieta e atividade — marcar C.' },
          { label: 'Pegadinha prescrever insulina', detail: 'Confunde assistência com prescrição.', correct: 'TE educa — letra C.' },
        ],
        footer_rule: 'TE educa — médico prescreve',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'atame-enfermagem-saude-da-mulher-1777104382533-0': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'OMS/PNH/MS — parto humanizado: tricotomia e lavagem intestinal não são rotineiras',
    roi_error: 'parto_supina_expulsivo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pré-parto — EXCETO',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Identificar conduta NÃO indicada no trabalho de parto.', icon: 'Target' },
          { label: 'Monitorar SV (A)', detail: 'Frequência cardíaca, pressão arterial e temperatura — conduta correta.', icon: 'Activity' },
          { label: 'Apoio emocional (C)', detail: 'Esclarecer dúvidas e reduzir ansiedade — correto.', icon: 'Heart' },
          { label: 'Pegadinha tricotomia e enema', detail: 'Procedimentos de rotina abolidos no parto humanizado — B é o EXCETO.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Humanizado: sem tricotomia/enema rotineiros',
      },
      {
        type: 'golden_rule',
        slide_title: 'OMS — procedimentos',
        meta: slideMeta,
        content: 'PRÉ-PARTO HUMANIZADO',
        rows: [
          { label: 'Indicado', value: 'Monitorar sinais vitais mãe-feto', badge: 'hot', emphasis: 'highlight' },
          { label: 'Indicado', value: 'Apoio emocional e deambulação', badge: 'info' },
          { label: 'Não rotina', value: 'Tricotomia pubiana e lavagem intestinal', badge: 'warn' },
          { label: 'Base', value: 'Reduzir intervenções desnecessárias', badge: 'hot' },
        ],
        footer_rule: 'Enema/depilação → exceção B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando EXCETO — o que NÃO é indicado.',
          'Testar A — monitorar SV: conduta correta → eliminar.',
          'Testar B — tricotomia e lavagem intestinal: não rotineiras → candidata.',
          'Testar C — apoio emocional: correto → eliminar.',
          'Testar D — deambulação: favorece parto → eliminar.',
          'Marcar letra B — exceção.',
        ],
        footer_rule: 'Tricotomia/enema = EXCETO → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO PRÉ-PARTO',
        items: [
          { label: 'Letra A — monitorar SV', detail: 'Vigilância materno-fetal é padrão.', correct: 'Afirmativa correta — não é o EXCETO.' },
          { label: 'Letra C — apoio emocional', detail: 'Humanização inclui acolhimento.', correct: 'Conduta correta — eliminar.' },
          { label: 'Letra D — deambulação', detail: 'Mobilidade favorece dilatação.', correct: 'Afirmativa correta — não marcar.' },
          { label: 'Pegadinha tricotomia e enema', detail: 'OMS não recomenda rotina.', correct: 'Exceção: tricotomia e lavagem intestinal — gabarito B.' },
        ],
        footer_rule: 'Procedimentos abolidos → B',
      },
    ],
    cleanInstruction: cleanAtameParto,
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
    console.log(`[handcraft:sm-g11] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g11] total=${ok}`);
}

main();
