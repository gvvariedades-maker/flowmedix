#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g09 (8 slugs pré-natal P0).
 *
 *   npm run handcraft:saude-da-mulher-g09
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g09 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g09';
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
    'queixas fisiológicas gestação',
    'ultrassonografia pré-natal',
    'gravidez ectópica',
    'métodos contraceptivos',
    'educação sexual APS',
    'seis consultas pré-natal',
    'ácido fólico',
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

const CONSULTAS_6_GOLDEN = {
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
  footer_rule: 'Seis consultas — 1+2+3',
};

const CONSULTAS_6_SELECON_SLIDES = [
  {
    type: 'concept_map',
    slide_title: 'Consultas pré-natal — MS',
    meta: slideMeta,
    items: [
      { label: 'Comando', detail: 'Calendário mínimo de consultas pré-natais de risco habitual no SUS.', icon: 'Target' },
      { label: 'Seis consultas (C)', detail: 'Uma no 1º tri, duas no 2º, três no 3º trimestre.', icon: 'Calendar' },
      { label: 'Mortalidade', detail: 'Pré-natal reduz mortalidade materna, baixo peso e mortalidade perinatal.', icon: 'Heart' },
      { label: 'Pegadinha cinco consultas', detail: 'Cinco consultas — número abaixo do mínimo MS — distrator A.', icon: 'AlertTriangle' },
    ],
    footer_rule: 'Mínimo 6 consultas — 1+2+3',
  },
  CONSULTAS_6_GOLDEN,
  {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta,
    steps: [
      'MS define mínimo e distribuição por trimestre.',
      'Eliminar A — cinco consultas.',
      'Eliminar B — nove consultas simétricas.',
      'Testar C — seis consultas: 1+2+3.',
      'Eliminar D — oito consultas.',
      'Marcar letra C.',
    ],
    footer_rule: 'Seis consultas → C',
  },
  {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta,
    content: 'PEGADINHAS — CALENDÁRIO',
    items: [
      { label: 'Pegadinha cinco consultas', detail: 'Abaixo do mínimo vigente no AB 32.', correct: 'Seis consultas distribuídas — letra C.' },
      { label: 'Letra A — cinco', detail: 'Insuficiente para risco habitual.', correct: 'Padrão MS: 1+2+3 — C.' },
      { label: 'Letra B — nove', detail: 'Exagera número e simetria trimestral.', correct: 'Mínimo seis consultas — C.' },
      { label: 'Letra D — oito', detail: 'Não é a distribuição MS clássica.', correct: 'Uma + duas + três — letra C.' },
    ],
    footer_rule: '6 consultas → C',
  },
];

const CONSULTAS_6_QUADRIX_SLIDES = [
  {
    type: 'concept_map',
    slide_title: 'Pré-natal na APS',
    meta: slideMeta,
    items: [
      { label: 'Comando', detail: 'Diretrizes MS para cuidado à gestante no pré-natal na atenção primária.', icon: 'Target' },
      { label: 'Seis consultas (D)', detail: 'Mínimo com início no 1º trimestre e equipe multiprofissional.', icon: 'Calendar' },
      { label: 'Pegadinha três consultas', detail: 'Três consultas se assintomática — abaixo do mínimo — A.', icon: 'AlertTriangle' },
      { label: 'Pegadinha alto risco universal', detail: 'Encaminhar todas sem critério — E falso.', icon: 'XCircle' },
    ],
    footer_rule: 'APS: 6 consultas desde 1º tri',
  },
  CONSULTAS_6_GOLDEN,
  {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta,
    steps: [
      'Identificar diretriz MS na atenção primária.',
      'Eliminar A — apenas três consultas se assintomática.',
      'Eliminar B — suspender vacinação na gestação.',
      'Eliminar C — iniciar só no 2º trimestre.',
      'Testar D — mínimo seis consultas, 1º tri e multiprofissional.',
      'Eliminar E — encaminhar todas ao alto risco.',
      'Marcar letra D.',
    ],
    footer_rule: '6 consultas APS → D',
  },
  {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta,
    content: 'PEGADINHAS — PRÉ-NATAL APS',
    items: [
      { label: 'Letra A — três consultas', detail: 'Mínimo MS é seis, não três.', correct: 'Seis consultas desde 1º tri — D.' },
      { label: 'Letra B — suspender vacinas', detail: 'Gestante deve manter calendário vacinal indicado.', correct: 'Mínimo seis consultas multiprofissionais — D.' },
      { label: 'Letra C — só 2º tri', detail: 'Captação precoce exige início no 1º trimestre.', correct: 'Seis consultas na APS — letra D.' },
      { label: 'Letra E — alto risco universal', detail: 'Baixo risco pode ser conduzido na APS.', correct: 'Garantir seis consultas multiprofissionais — D.' },
      { label: 'Pegadinha alto risco universal', detail: 'Encaminhar todas sem critério clínico.', correct: 'Mínimo seis consultas na APS — letra D.' },
    ],
    footer_rule: 'APS + 6 consultas → D',
  },
];

const SPECS: Record<string, Pack> = {
  'legalle-enfermagem-processo-de-enfermagem-1780011887822-3': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — queixas fisiológicas: náuseas, pirose, hemorroidas; hematúria não é queixa comum',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Queixas na gestação — EXCETO',
        meta: slideMeta,
        items: [
          { label: 'Comando EXCETO', detail: 'Manifestações fisiológicas comuns — achar a que NÃO é queixa habitual.', icon: 'Target' },
          { label: 'Náuseas/tonturas (A)', detail: 'Queixas digestivas frequentes no 1º trimestre.', icon: 'Utensils' },
          { label: 'Pirose/sialorreia (B)', detail: 'Alterações gastroesofágicas comuns na gestação.', icon: 'Droplets' },
          { label: 'Pegadinha hematúria', detail: 'Hematúria não é queixa fisiológica — exige investigação — gabarito.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Hematúria ≠ queixa comum',
      },
      {
        type: 'golden_rule',
        slide_title: 'Gestação — queixas',
        meta: slideMeta,
        content: 'ALTERAÇÕES FISIOLÓGICAS',
        rows: [
          { label: 'Digestivo', value: 'Náuseas, vômitos, pirose, sialorreia', badge: 'info' },
          { label: 'Abdominal', value: 'Desconforto e hemorroidas', badge: 'info' },
          { label: 'Anemia', value: 'Pode ocorrer — monitorar no pré-natal', badge: 'warn' },
          { label: 'EXCETO', value: 'Hematúria — sinal de alerta, não fisiológico', badge: 'hot', emphasis: 'highlight' },
        ],
        footer_rule: 'D é a exceção',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato EXCETO: três queixas comuns + uma exceção.',
          'Testar A — náuseas/vômitos: comum → eliminar.',
          'Testar B — pirose/sialorreia: comum → eliminar.',
          'Testar C — dor abdominal/hemorroidas: comum → eliminar.',
          'Testar D — anemia e hematúria: hematúria não é fisiológica → gabarito.',
          'Marcar letra D.',
        ],
        footer_rule: 'EXCETO → hematúria → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'EXCETO — QUEIXAS GESTACIONAIS',
        items: [
          { label: 'Letra A — náuseas', detail: 'Manifestação fisiológica frequente.', correct: 'Afirmativa correta como queixa comum — não é o EXCETO.' },
          { label: 'Letra B — pirose', detail: 'Refluxo gestacional é esperado.', correct: 'Conduta correta como queixa habitual — eliminar.' },
          { label: 'Letra C — hemorroidas', detail: 'Comum por compressão venosa na gestação.', correct: 'Afirmativa correta — dor abdominal e hemorroidas são queixas comuns.' },
          { label: 'Pegadinha hematúria', detail: 'Sangue na urina exige investigação.', correct: 'Exceção: hematúria não é queixa fisiológica — gabarito D.' },
        ],
        footer_rule: 'Só D não é comum',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'lj-assessoria-enfermagem-saude-da-mulher-1777104389226-0': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — acompanhamento pré-natal: ultrassonografia obstétrica e exames de rotina',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Exames no pré-natal',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Principal exame de enfermagem no acompanhamento pré-natal obstétrico.', icon: 'Target' },
          { label: 'USG obstétrica (D)', detail: 'Avalia idade gestacional, vitalidade e malformações.', icon: 'Scan' },
          { label: 'Pegadinha glicemia', detail: 'Glicemia de jejum é exame laboratorial — não define o principal da enfermagem aqui.', icon: 'AlertTriangle' },
          { label: 'Pegadinha colonoscopia', detail: 'Exame digestivo — fora do escopo pré-natal de rotina.', icon: 'XCircle' },
        ],
        footer_rule: 'USG = exame central no pré-natal',
      },
      {
        type: 'golden_rule',
        slide_title: 'Pré-natal — propedêutica',
        meta: slideMeta,
        content: 'EXAMES DE ROTINA',
        rows: [
          { label: 'USG obstétrica', value: 'Datación, anatomia fetal, vitalidade', badge: 'hot', emphasis: 'highlight' },
          { label: 'Laboratorial', value: 'Glicemia, sorologias, hemograma', badge: 'info' },
          { label: 'Enfermagem', value: 'SV, altura uterina, orientação', badge: 'info' },
          { label: 'Não é', value: 'Colonoscopia ou colposcopia de rotina', badge: 'warn' },
        ],
        footer_rule: 'Ultrassonografia → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar exame central no acompanhamento obstétrico.',
          'Eliminar A — teste de alergia: não é pré-natal de rotina.',
          'Eliminar B — colonoscopia: fora do escopo.',
          'Eliminar C — glicemia: importante, mas questão pede exame de enfermagem/obstétrico principal.',
          'Testar D — ultrassonografia obstétrica.',
          'Eliminar E — colposcopia: rastreio ginecológico distinto.',
          'Marcar letra D.',
        ],
        footer_rule: 'USG obstétrica → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXAMES',
        items: [
          { label: 'Letra A — alergia', detail: 'Teste de alergia não integra pré-natal de rotina.', correct: 'Ultrassonografia obstétrica — exame central — letra D.' },
          { label: 'Letra C — glicemia', detail: 'Exame laboratorial importante, mas não o foco da questão.', correct: 'USG obstétrica no acompanhamento — letra D.' },
          { label: 'Letra B — colonoscopia', detail: 'Procedimento digestivo — não pré-natal.', correct: 'USG obstétrica no acompanhamento — D.' },
          { label: 'Letra E — colposcopia', detail: 'Rastreio de colo — outro contexto.', correct: 'Exame obstétrico principal — D.' },
          { label: 'Pegadinha glicemia', detail: 'Confundir laboratorial com propedêutica obstétrica.', correct: 'Ultrassonografia — D.' },
        ],
        footer_rule: 'Obstétrico → USG',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'maranatha-assessoria-enfermagem-saude-da-mulher-1777104306781-5': {
    family: 'vf',
    branch: 'mulher_prenatal',
    guideline: 'MS/AB 32 — gravidez ectópica: dor + sangramento; beta-hCG não exclui; tratamento medicamentoso ou cirúrgico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gravidez ectópica — I–IV',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Quatro sentenças sobre gravidez ectópica — julgar I a IV.', icon: 'Target' },
          { label: 'Clínica (I)', detail: 'Dor pélvica e sangramento vaginal escasso — quadro inicial típico.', icon: 'AlertCircle' },
          { label: 'Pegadinha beta-hCG (II)', detail: 'Nível elevado de hCG não descarta ectópica — FALSA.', icon: 'AlertTriangle' },
          { label: 'Pegadinha 2º trimestre (III)', detail: 'Ectópica não evolui com segurança até 2º tri — FALSA.', icon: 'XCircle' },
          { label: 'Tratamento (IV)', detail: 'Metotrexato ou cirurgia se ruptura — VERDADEIRA.', icon: 'Syringe' },
        ],
        footer_rule: 'I e IV verdadeiras',
      },
      {
        type: 'golden_rule',
        slide_title: 'Ectópica — MS',
        meta: slideMeta,
        content: 'GRAVIDEZ ECTÓPICA',
        rows: [
          { label: 'Implantação', value: 'Fora da cavidade uterina', badge: 'hot' },
          { label: 'Clínica', value: 'Dor pélvica + sangramento escasso', badge: 'hot', emphasis: 'highlight' },
          { label: 'hCG', value: 'Não exclui ectópica por valor isolado', badge: 'warn' },
          { label: 'Tratamento', value: 'Metotrexato ou cirurgia se ruptura', badge: 'info' },
        ],
        footer_rule: 'I + IV → letra D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Julgar I: dor e sangramento → VERDADEIRA.',
          'Julgar II: hCG alto descarta ectópica → FALSA.',
          'Julgar III: evolução segura até 2º tri → FALSA.',
          'Julgar IV: metotrexato ou cirurgia se ruptura → VERDADEIRA.',
          'Conjunto: I e IV.',
          'Eliminar A, B e C.',
          'Marcar letra D.',
        ],
        footer_rule: 'I e IV verdadeiras → letra D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ECTÓPICA',
        items: [
          { label: 'Letra A — I e II', detail: 'II é falsa — hCG não descarta.', correct: 'Só I e IV corretas — D.' },
          { label: 'Letra B — III e IV', detail: 'III é falsa — não evolui com segurança.', correct: 'I e IV — letra D.' },
          { label: 'Letra C — II e III', detail: 'Ambas falsas.', correct: 'Clínica inicial + tratamento — D.' },
          { label: 'Pegadinha beta-hCG', detail: 'Valor isolado não exclui ectópica.', correct: 'I e IV verdadeiras — D.' },
        ],
        footer_rule: 'Não confundir hCG × ectópica',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'nc-ufpr-funpar-enfermagem-saude-da-mulher-1777104222222-7': {
    family: 'conceito',
    branch: 'mulher_planejamento',
    guideline: 'MS planejamento familiar — métodos comportamentais em ciclo regular; AE não é método habitual',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Contracepção — SUS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Métodos contraceptivos validados no SUS e educação sexual na APS.', icon: 'Target' },
          { label: 'Comportamentais (D)', detail: 'Tabelinha, muco e temperatura — ciclo menstrual regular.', icon: 'Calendar' },
          { label: 'Pegadinha AE rotina', detail: 'Anticoncepção de emergência não é método habitual em adolescentes — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha DIU nulípara', detail: 'DIU pode ser opção conforme critério — B falso.', icon: 'XCircle' },
        ],
        footer_rule: 'Ciclo regular → métodos comportamentais',
      },
      {
        type: 'golden_rule',
        slide_title: 'PF — métodos',
        meta: slideMeta,
        content: 'CONTRACEPÇÃO NO SUS',
        rows: [
          { label: 'Comportamentais', value: 'CO/TBC/muco — ciclo regular', badge: 'hot', emphasis: 'highlight' },
          { label: 'Barreira', value: 'Preservativo — IST + gravidez', badge: 'info' },
          { label: 'LARC', value: 'DIU e implante — inclui nulíparas elegíveis', badge: 'info' },
          { label: 'Não é', value: 'AE como método usual ou dupla camisinha', badge: 'warn' },
        ],
        footer_rule: 'Métodos naturais → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar afirmativa correta sobre contracepção.',
          'Eliminar A — AE como método principal em adolescentes.',
          'Eliminar B — DIU proibido em nulíparas.',
          'Eliminar C — diafragma sem risco: subestima limitações.',
          'Testar D — métodos comportamentais em ciclo regular.',
          'Eliminar E — duas camisinhas masculinas.',
          'Marcar letra D.',
        ],
        footer_rule: 'Ciclo regular → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONTRACEPÇÃO',
        items: [
          { label: 'Pegadinha AE rotina', detail: 'Emergência não substitui método contraceptivo regular.', correct: 'Métodos comportamentais em ciclo regular — letra D.' },
          { label: 'Letra A — AE adolescente', detail: 'Emergência não substitui método regular.', correct: 'Tabelinha, muco e temperatura — afirmativa correta em D.' },
          { label: 'Letra B — DIU nulípara', detail: 'DIU é opção no SUS com critérios.', correct: 'Tabelinha/muco/temperatura — letra D.' },
          { label: 'Letra C — diafragma', detail: 'Eficácia e adesão variáveis.', correct: 'Métodos comportamentais adequados — D.' },
          { label: 'Letra E — dupla camisinha', detail: 'Atrito aumenta risco de ruptura.', correct: 'Ciclo regular → métodos naturais — D.' },
        ],
        footer_rule: 'AE ≠ método habitual',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'quadrix-enfermagem-saude-da-mulher-1777104376057-6': {
    family: 'protocolo',
    branch: 'mulher_planejamento',
    guideline: 'Caderno AB 26/MS — APS: educação em saúde sexual e reprodutiva; rastreio não só em sintomáticas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cuidado integral — mulher',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Prática recomendada de cuidado integral à saúde da mulher na APS.', icon: 'Target' },
          { label: 'Educação SSR (C)', detail: 'Saúde sexual e reprodutiva nas consultas e visitas domiciliares.', icon: 'Users' },
          { label: 'Pegadinha rastreio sintomática', detail: 'Papanicolau só com sintomas — contraria rastreio — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha só gestante', detail: 'Excluir outras fases do ciclo — E falso.', icon: 'XCircle' },
        ],
        footer_rule: 'Educar em SSR na APS',
      },
      {
        type: 'golden_rule',
        slide_title: 'APS — saúde da mulher',
        meta: slideMeta,
        content: 'CUIDADO INTEGRAL',
        rows: [
          { label: 'SSR', value: 'Educação sexual e reprodutiva contínua', badge: 'hot', emphasis: 'highlight' },
          { label: 'Rastreio', value: 'Citologia em mulheres elegíveis — não só sintomáticas', badge: 'info' },
          { label: 'PF', value: 'Métodos contraceptivos na equipe multiprofissional', badge: 'info' },
          { label: 'Não é', value: 'Só gestantes ou só com ginecologista', badge: 'warn' },
        ],
        footer_rule: 'Educação SSR → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar prática integral na atenção primária.',
          'Eliminar A — citologia só com sintomas.',
          'Eliminar B — contracepção só após ginecologista.',
          'Testar C — educação SSR em consultas e domicílio.',
          'Eliminar D — menopausa sempre especializada.',
          'Eliminar E — priorizar só gestantes.',
          'Marcar letra C.',
        ],
        footer_rule: 'SSR na APS → C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — APS MULHER',
        items: [
          { label: 'Letra D — menopausa', detail: 'Muitas queixas podem ser manejadas na APS.', correct: 'Menopausa não exclui cuidado na APS; educação SSR é a prática integral — letra C.' },
          { label: 'Pegadinha rastreio sintomática', detail: 'Rastreio é em assintomáticas elegíveis.', correct: 'Citologia em elegíveis assintomáticas; educação SSR nas visitas — gabarito C.' },
          { label: 'Letra A — só sintomática', detail: 'Contraria política de rastreamento.', correct: 'Rastreamento não se restringe a sintomáticas; eliminar A e marcar C.' },
          { label: 'Letra B — só ginecologista', detail: 'PF é atribuição da equipe APS.', correct: 'Planejamento familiar na equipe multiprofissional — conduta correta é C.' },
          { label: 'Letra E — só gestante', detail: 'Cuidado integral em todo ciclo de vida.', correct: 'Integralidade abrange pré, gestação e pós; educação SSR — letra C.' },
        ],
        footer_rule: 'Integralidade na APS',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'quadrix-enfermagem-saude-da-mulher-1777104376057-7': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS 2012) — mínimo 6 consultas pré-natal com início no 1º trimestre na APS',
    roi_error: 'prenatal_consultas_4',
    slides: CONSULTAS_6_QUADRIX_SLIDES,
    cleanInstruction: cleanPdfNoise,
  },

  'selecon-enfermagem-saude-da-mulher-1777104347186-2': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS 2012) — mínimo 6 consultas pré-natal: 1+2+3 por trimestre',
    roi_error: 'prenatal_consultas_4',
    slides: CONSULTAS_6_SELECON_SLIDES,
    cleanInstruction: cleanPdfNoise,
  },

  'unesc-enfermagem-nutricao-aplicada-a-enfermagem-1777102926437-1': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'MS/AB 32 — ácido fólico pré-concepcional e gestacional: prevenção de defeitos do tubo neural',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ácido fólico — gestação',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Importância da suplementação de ácido fólico na gestação.', icon: 'Target' },
          { label: 'DTN (A)', detail: 'Reduz risco de defeitos do tubo neural no feto.', icon: 'Baby' },
          { label: 'Pegadinha ganho peso', detail: 'Fólico não visa ganho ponderal materno — B.', icon: 'AlertTriangle' },
          { label: 'Pegadinha só anemia', detail: 'Ferro trata anemia — fólico previne DTN — C.', icon: 'XCircle' },
        ],
        footer_rule: 'Fólico → tubo neural',
      },
      {
        type: 'golden_rule',
        slide_title: 'Suplementação — MS',
        meta: slideMeta,
        content: 'ÁCIDO FÓLICO',
        rows: [
          { label: 'Indicação', value: 'Prevenção de defeito do tubo neural', badge: 'hot', emphasis: 'highlight' },
          { label: 'Quando', value: 'Pré-concepcional e início precoce da gestação', badge: 'hot' },
          { label: 'Não é', value: 'Ganho de peso, sono ou fortalecimento muscular', badge: 'warn' },
          { label: 'Ferro', value: 'Suplemento distinto — anemia ferropriva', badge: 'info' },
        ],
        footer_rule: 'DTN → letra A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ácido fólico na gestação — função específica.',
          'Testar A — reduzir defeitos do tubo neural.',
          'Eliminar B — aumentar ganho de peso.',
          'Eliminar C — prevenir apenas anemia.',
          'Eliminar D — fortalecer músculos.',
          'Eliminar E — melhorar sono.',
          'Marcar letra A.',
        ],
        footer_rule: 'Tubo neural → A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ÁCIDO FÓLICO',
        items: [
          { label: 'Letra B — ganho de peso', detail: 'Nutrição materna ≠ objetivo do fólico.', correct: 'Prevenção de DTN — letra A.' },
          { label: 'Letra C — só anemia', detail: 'Ferro trata anemia — fólico tem outra função.', correct: 'Fólico previne DTN — não é só para anemia; gabarito A.' },
          { label: 'Pegadinha só anemia', detail: 'Confunde ferro com fólico.', correct: 'Defeito do tubo neural — letra A.' },
          { label: 'Letra D — músculos', detail: 'Sem relação com suplementação vitamínica gestacional.', correct: 'Ácido fólico e DTN — A.' },
          { label: 'Letra E — sono', detail: 'Benefício não documentado para fólico.', correct: 'Reduzir DTN fetal — letra A.' },
        ],
        footer_rule: 'Fólico ≠ ferro',
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
    console.log(`[handcraft:sm-g09] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g09] total=${ok}`);
}

main();
