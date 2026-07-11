#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g12 (8 slugs parto P0).
 *
 *   npm run handcraft:saude-da-mulher-g12
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g12 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g12';
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
    'consultas pré-natal',
    'puerpério',
    'sinais de alerta gestação',
    'distócia de ombro',
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
    'pós-parto imediato',
    'jejum no trabalho de parto',
    'pele a pele',
    'posições verticalizadas',
    'distócia de ombro',
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

const SPECS: Record<string, Pack> = {
  'cebraspe-cespe-enfermagem-saude-da-mulher-1777104376057-3': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'MS/AB — puerpério: hemorragia puerperal é causa evitável de mortalidade materna',
    roi_error: 'puerperio_30_dias',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Puerpério — MS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Puerpério e complicações conforme Ministério da Saúde.', icon: 'Target' },
          { label: 'HPP (B)', detail: 'Hemorragia puerperal — alta relevância na mortalidade materna.', icon: 'AlertTriangle' },
          { label: 'Pegadinha fases reduzidas', detail: 'Puerpério tem fases imediato, tardio e remoto — A.', icon: 'Clock' },
          { label: 'Pegadinha puerpério curto', detail: 'Acompanhamento vai além do primeiro mês — até 42 dias.', icon: 'Heart' },
        ],
        footer_rule: 'HPP — prioridade na mortalidade',
      },
      {
        type: 'golden_rule',
        slide_title: 'Puerpério — complicações',
        meta: slideMeta,
        content: 'PUERPÉRIO MS',
        rows: [
          { label: 'HPP', value: 'Principal causa evitável de morte materna', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fases', value: 'Imediato, tardio e remoto — não só duas', badge: 'info' },
          { label: 'Infecção', value: 'Cesárea tem maior risco que vaginal', badge: 'warn' },
          { label: 'Lóquios', value: 'Deambular auxilia eliminação de coágulos', badge: 'info' },
        ],
        footer_rule: 'Vigilância hemorrágica → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Puerpério e mortalidade materna — MS.',
          'Eliminar A — apenas duas fases.',
          'Testar B — hemorragia puerperal e mortalidade.',
          'Eliminar C — parto não aumenta resistência à infecção.',
          'Eliminar D — cesárea tem mais infecção que vaginal.',
          'Eliminar E — repouso absoluto prejudica lóquios.',
          'Marcar letra B.',
        ],
        footer_rule: 'Hemorragia puerperal → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PUERPÉRIO',
        items: [
          { label: 'Letra A — duas fases', detail: 'Omite fase tardia e remota.', correct: 'Hemorragia puerperal mortal — letra B.' },
          { label: 'Letra C — resistência infecção', detail: 'Parto aumenta vulnerabilidade.', correct: 'HPP é complicação crítica — gabarito B.' },
          { label: 'Letra D — vaginal pior', detail: 'Cesárea eleva risco infeccioso.', correct: 'Mortalidade por hemorragia — marcar B.' },
          { label: 'Letra E — repouso absoluto', detail: 'Deambulação é orientada.', correct: 'Hemorragia puerperal — letra B.' },
          { label: 'Pegadinha puerpério curto', detail: 'Assistência até consulta de puerpério.', correct: 'HPP na mortalidade materna — B.' },
        ],
        footer_rule: 'HPP = prioridade',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cev-urca-enfermagem-processo-de-enfermagem-1780006494066-5': {
    family: 'certo_errado',
    branch: 'mulher_parto',
    guideline: 'PNI/MS — dTpa na gestação: difteria, tétano e coqueluche — não tríplice viral/hepatite',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TE — ciclo materno',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Assinale a proposição INCORRETA sobre assistência do TE.', icon: 'Target' },
          { label: 'Pré-natal e puerpério (A,B,D,E)', detail: 'Proposições corretas — identificar riscos, vacinas orientadas, AM.', icon: 'CheckCircle' },
          { label: 'Pegadinha dTpa errada (C)', detail: 'Confunde dTpa com tríplice viral e hepatite na 20ª semana — INCORRETA.', icon: 'AlertTriangle' },
          { label: 'Vacinação', detail: 'TE orienta e administra conforme protocolo — não inventa esquema.', icon: 'Syringe' },
        ],
        footer_rule: 'dTpa ≠ tríplice viral',
      },
      {
        type: 'golden_rule',
        slide_title: 'Vacinas — gestação',
        meta: slideMeta,
        content: 'dTpa GESTACIONAL',
        rows: [
          { label: 'dTpa', value: 'Difteria, tétano e coqueluche', badge: 'hot', emphasis: 'highlight' },
          { label: 'Não é', value: 'Tríplice viral nem hepatite no lugar da dTpa', badge: 'warn' },
          { label: 'TE', value: 'Acolhimento, orientação e vacinas conforme PNI', badge: 'info' },
          { label: 'Puerpério', value: 'Vigilância clínica e aleitamento', badge: 'info' },
        ],
        footer_rule: 'Esquema vacinal correto',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando INCORRETA — achar a falsa.',
          'Testar A — pré-natal identifica riscos → correta → eliminar.',
          'Testar B — puerpério com vigilância → correta → eliminar.',
          'Testar C — dTpa como tríplice viral/hepatite → FALSA.',
          'Testar D — acolhimento e vacinas → correta → eliminar.',
          'Testar E — puerpério e AM → correta → eliminar.',
          'Marcar letra C — incorreta.',
        ],
        footer_rule: 'C confunde vacinas → INCORRETA',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INCORRETA',
        items: [
          { label: 'Letra A — pré-natal', detail: 'Proposição verdadeira.', correct: 'Afirmativa correta — não é a INCORRETA.' },
          { label: 'Letra B — puerpério', detail: 'Vigilância clínica adequada.', correct: 'Conduta correta — eliminar.' },
          { label: 'Letra D — acolhimento', detail: 'Atribuição do TE na APS.', correct: 'Afirmativa correta — não marcar.' },
          { label: 'Letra E — AM puerpério', detail: 'Apoio à amamentação.', correct: 'Proposição verdadeira — eliminar.' },
          { label: 'Pegadinha dTpa errada', detail: 'Mistura imunizantes e indicações.', correct: 'Exceção: letra C é a INCORRETA.' },
        ],
        footer_rule: 'dTpa = difteria, tétano, coqueluche',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cev-urca-enfermagem-saude-da-mulher-1777104329543-3': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS/COFEN — pós-parto vaginal imediato: vigilância de sinais vitais e sangramento',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pós-parto imediato',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Principal cuidado de enfermagem no pós-parto vaginal imediato.', icon: 'Target' },
          { label: 'SV + sangramento (A)', detail: 'Prioridade — detectar hemorragia pós-parto precoce.', icon: 'Activity' },
          { label: 'Pegadinha banho imediato', detail: 'Banho e analgesia são importantes, mas após estabilização — B e C.', icon: 'Droplets' },
          { label: 'Apoio complementar', detail: 'AM e ambiente acolhedor seguem após vigilância — D e E.', icon: 'Heart' },
        ],
        footer_rule: 'HPP — SV e sangramento primeiro',
      },
      {
        type: 'golden_rule',
        slide_title: 'Golden hour puerperal',
        meta: slideMeta,
        content: 'PÓS-PARTO IMEDIATO',
        rows: [
          { label: 'Prioridade', value: 'Sinais vitais e sangramento vaginal', badge: 'hot', emphasis: 'highlight' },
          { label: 'Risco', value: 'Hemorragia pós-parto nas primeiras horas', badge: 'warn' },
          { label: 'Depois', value: 'Analgesia, AM e ambiente acolhedor', badge: 'info' },
          { label: 'Registro', value: 'Lóquios e PA seriados', badge: 'info' },
        ],
        footer_rule: 'Vigilância hemorrágica → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Pós-parto vaginal imediato — prioridade de segurança.',
          'Testar A — monitorar SV e sangramento → principal.',
          'Eliminar B — banho: não é o primeiro cuidado.',
          'Eliminar C — analgésico: após avaliação.',
          'Eliminar D — AM: essencial, mas secundário à vigilância.',
          'Eliminar E — ambiente acolhedor: complementar.',
          'Marcar letra A.',
        ],
        footer_rule: 'SV + sangramento → A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRIORIDADE',
        items: [
          { label: 'Letra B — banho', detail: 'Cuidado de conforto após estabilização.', correct: 'Vigilância hemorrágica primeiro — letra A.' },
          { label: 'Letra C — analgésico', detail: 'Prescrição após avaliação médica.', correct: 'SV e sangramento — gabarito A.' },
          { label: 'Letra D — amamentação', detail: 'Importante, mas após segurança materna.', correct: 'Monitorar sangramento — marcar A.' },
          { label: 'Letra E — acolhimento', detail: 'Humanização complementa vigilância.', correct: 'Principal cuidado imediato — letra A.' },
        ],
        footer_rule: 'Segurança materna antes de conforto',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cev-urca-enfermagem-saude-da-mulher-1777104347186-3': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'PNH/OMS — parto humanizado: pele a pele, acompanhante, mobilidade; jejum e repouso não são rotina',
    roi_error: 'parto_supina_expulsivo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Boas práticas — EXCETO',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Prática que NÃO deve ser estimulada no parto humanizado.', icon: 'Target' },
          { label: 'Pele a pele (A)', detail: 'Hora de ouro — contato mãe-bebê — correto.', icon: 'Baby' },
          { label: 'Acompanhante (B)', detail: 'Presença de acompanhante — direito PNH.', icon: 'Users' },
          { label: 'Pegadinha supina expulsivo', detail: 'Posições verticalizadas no parto — não fixar dorsal no expulsivo.', icon: 'Move' },
          { label: 'Pegadinha jejum e repouso', detail: 'Jejum e repouso no leito durante TP — exceção — C.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Mobilidade e alimentação leve — não jejum',
      },
      {
        type: 'golden_rule',
        slide_title: 'PNH — estimular',
        meta: slideMeta,
        content: 'PARTO HUMANIZADO',
        rows: [
          { label: 'Estimular', value: 'Pele a pele, acompanhante, AM na sala', badge: 'hot', emphasis: 'highlight' },
          { label: 'Posições', value: 'Verticalizadas e liberdade de movimento', badge: 'hot' },
          { label: 'Não rotina', value: 'Jejum prolongado e repouso no leito', badge: 'warn' },
          { label: 'Equipe', value: 'Multiprofissional incluindo TE', badge: 'info' },
        ],
        footer_rule: 'Jejum/repouso = EXCETO → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'EXCETO — o que não estimular.',
          'Eliminar A — pele a pele: boa prática.',
          'Eliminar B — acompanhante: boa prática.',
          'Testar C — repouso e jejum no TP: não recomendado.',
          'Eliminar D — AM na sala de parto.',
          'Eliminar E — posições verticalizadas.',
          'Marcar letra C.',
        ],
        footer_rule: 'Repouso + jejum = exceção',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO PARTO',
        items: [
          { label: 'Letra A — pele a pele', detail: 'Hora de ouro recomendada.', correct: 'Afirmativa correta — não é o EXCETO.' },
          { label: 'Letra B — acompanhante', detail: 'Direito da gestante.', correct: 'Conduta correta — eliminar.' },
          { label: 'Letra D — AM sala parto', detail: 'Início precoce do aleitamento.', correct: 'Afirmativa correta — aleitamento na sala de parto não é o EXCETO.' },
          { label: 'Letra E — verticalização', detail: 'Mobilidade no trabalho de parto.', correct: 'Afirmativa correta — eliminar.' },
          { label: 'Pegadinha jejum e repouso', detail: 'Restringe alimentação e movimento.', correct: 'Exceção: jejum e repouso no leito — gabarito C.' },
        ],
        footer_rule: 'Humanizar = mobilidade',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003261833-6': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS/AB — sinais de alerta na gestação: perda de líquido/sangue, edema, febre',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sinais de alerta — ACS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'ACS encaminha gestante com sinais de alerta à unidade básica de Saúde da Família.', icon: 'Target' },
          { label: 'Gravidade (D)', detail: 'Perda de líquidos ou sangue pela vagina, edema, febre — complicações à saúde da mãe e criança.', icon: 'AlertTriangle' },
          { label: 'Pegadinha queixas leves', detail: 'Constipação ou náuseas isoladas — A.', icon: 'XCircle' },
          { label: 'Pegadinha azia/cãibra', detail: 'Desconfortos comuns sem sinal de alarme — C.', icon: 'Ban' },
        ],
        footer_rule: 'Encaminhar sinais de alarme',
      },
      {
        type: 'golden_rule',
        slide_title: 'Alerta — gestação',
        meta: slideMeta,
        content: 'ENCAMINHAMENTO ACS',
        rows: [
          { label: 'Risco', value: 'Gravidez sem complicações na maioria — vigilar sinais', badge: 'info' },
          { label: 'ACS', value: 'Encaminhar gestante rapidamente à unidade básica', badge: 'hot' },
          { label: 'Urgente', value: 'Edema face/mãos, febre alta', badge: 'hot' },
          { label: 'Observar', value: 'Azia, cãibra, gases leves', badge: 'info' },
          { label: 'Movimentos', value: 'Ausência fetal no 3º tri — encaminhar', badge: 'warn' },
        ],
        footer_rule: 'Perda líquido/sangue → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Agentes Comunitários de Saúde identificam sinais de alerta na gravidez.',
          'Eliminar A — prisão de ventre ou enjoos leves.',
          'Eliminar B — cefaleia sem contexto ou vômitos isolados ambíguos.',
          'Eliminar C — azia, cãibra ou contrações prematuras isoladas.',
          'Testar D — líquido, sangue, edema, febre.',
          'Eliminar E — gases ou IG sem critério claro.',
          'Marcar letra D.',
        ],
        footer_rule: 'Sinais de alarme → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ENCAMINHAMENTO',
        items: [
          { label: 'Letra A — constipação', detail: 'Queixa frequente sem alarme.', correct: 'Sangue ou líquido vaginal — letra D.' },
          { label: 'Letra B — cefaleia isolada', detail: 'Avaliar contexto — não lista típica ACS.', correct: 'Edema e febre — gabarito D.' },
          { label: 'Letra C — azia/cãibra', detail: 'Desconfortos fisiológicos.', correct: 'Encaminhar sinais graves — D.' },
          { label: 'Letra E — gases', detail: 'Não configura urgência isolada.', correct: 'Perda de líquido ou sangue — letra D.' },
        ],
        footer_rule: 'Alarme ≠ desconforto leve',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-saude-da-mulher-1777104329543-6': {
    family: 'vf',
    branch: 'mulher_parto',
    guideline: 'MS — orientações puerperais: infecção e puericultura; não confundir com sinais de trabalho de parto',
    roi_error: 'puerperio_30_dias',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Orientações — puérpera',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Quatro assertivas sobre cuidados puerperais — julgar I–IV.', icon: 'Target' },
          { label: 'Infecção (I)', detail: 'Retornar se febre, dor ou sangramento — verdadeira.', icon: 'Thermometer' },
          { label: 'Puericultura (II)', detail: 'Levar RN à UBS — verdadeira.', icon: 'Baby' },
          { label: 'Pegadinha puerpério curto', detail: 'Período puerperal estende-se — orientações não confundem com trabalho de parto.', icon: 'Clock' },
          { label: 'Pegadinha bolsa rota', detail: 'Líquido vaginal pós-parto ≠ rompimento de bolsa — III falsa.', icon: 'AlertTriangle' },
          { label: 'Pegadinha contrações', detail: 'Contrações ritmadas são trabalho de parto — IV falsa.', icon: 'XCircle' },
        ],
        footer_rule: 'I e II verdadeiras — III e IV falsas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Puerpério — ACS',
        meta: slideMeta,
        content: 'CUIDADOS PUÉRPERA',
        rows: [
          { label: 'Alerta', value: 'Febre, dor ou sangramento — retornar', badge: 'hot', emphasis: 'highlight' },
          { label: 'RN', value: 'Puericultura na UBS', badge: 'info' },
          { label: 'Não confundir', value: 'Líquido vaginal puerperal com bolsa rota', badge: 'warn' },
          { label: 'Não confundir', value: 'Contrações com trabalho de parto', badge: 'warn' },
        ],
        footer_rule: 'I + II → letra D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Julgar I — sinais de infecção → VERDADEIRA.',
          'Julgar II — puericultura UBS → VERDADEIRA.',
          'Julgar III — líquido = bolsa rota → FALSA no puerpério.',
          'Julgar IV — contrações ritmadas → FALSA (é TP).',
          'Corretas: I e II apenas.',
          'Eliminar A, B, C e E.',
          'Marcar letra D.',
        ],
        footer_rule: 'I e II verdadeiras → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PUERPÉRIO ACS',
        items: [
          { label: 'Letra A — I e IV', detail: 'IV é falsa — contrações de TP.', correct: 'Só I e II — letra D.' },
          { label: 'Letra B — todas', detail: 'III e IV são falsas.', correct: 'Infecção e puericultura — gabarito D.' },
          { label: 'Letra C — II, III, IV', detail: 'Inclui pegadinhas III e IV.', correct: 'I e II apenas — marcar D.' },
          { label: 'Letra E — III e IV', detail: 'Confunde puerpério com TP.', correct: 'Retorno se infecção — letra D.' },
          { label: 'Pegadinha contrações', detail: 'Ritmo uterino é parto, não puerpério.', correct: 'I e II corretas — D.' },
        ],
        footer_rule: 'Puerpério ≠ trabalho de parto',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-saude-da-mulher-1777104340484-7': {
    family: 'vf',
    branch: 'mulher_parto',
    guideline: 'Caderno AB 32 (MS 2012) — seis consultas, domicílio, pós-data e puerpério até 42 dias',
    roi_error: 'prenatal_consultas_4',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Calendário pré-natal',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Quatro assertivas sobre consultas e ciclo gravídico-puerperal.', icon: 'Target' },
          { label: 'Seis consultas (I)', detail: 'Mínimo seis — médico e enfermeiro — verdadeira.', icon: 'Calendar' },
          { label: 'Domicílio (II)', detail: 'Consultas na UBS ou visita domiciliar — verdadeira.', icon: 'Home' },
          { label: 'Pós-data (III)', detail: 'Após período pós-termo — avaliar bem-estar fetal — verdadeira.', icon: 'Activity' },
          { label: 'Puerpério 42 dias (IV)', detail: 'Consulta de puerpério até 42º dia — verdadeira.', icon: 'Heart' },
        ],
        footer_rule: 'I, II, III e IV verdadeiras',
      },
      {
        type: 'golden_rule',
        slide_title: 'AB 32 — cronograma',
        meta: slideMeta,
        content: 'PRÉ-NATAL MS',
        rows: [
          { label: 'Consultas', value: 'Mínimo seis — equipe multiprofissional', badge: 'hot', emphasis: 'highlight' },
          { label: 'Local', value: 'UBS ou visita domiciliar', badge: 'info' },
          { label: 'Pós-data', value: 'Avaliar bem-estar fetal e líquido amniótico', badge: 'warn' },
          { label: 'Puerpério', value: 'Acompanhamento até consulta no 42º dia', badge: 'hot' },
        ],
        footer_rule: 'Todas verdadeiras → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Julgar I — mínimo seis consultas → VERDADEIRA.',
          'Julgar II — UBS ou domicílio → VERDADEIRA.',
          'Julgar III — pós-data e bem-estar fetal → VERDADEIRA.',
          'Julgar IV — ciclo até 42º dia puerpério → VERDADEIRA.',
          'Todas corretas — I, II, III e IV.',
          'Eliminar A, C, D e E.',
          'Marcar letra B.',
        ],
        footer_rule: 'Quatro assertivas → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COMBINAÇÃO',
        items: [
          { label: 'Letra A — omite II', detail: 'Exclui visita domiciliar e consultas na unidade.', correct: 'II verdadeira — consultas na UBS ou domicílio — gabarito B.' },
          { label: 'Letra C — omite IV', detail: 'Descarta acompanhamento até consulta de puerpério.', correct: 'IV verdadeira — ciclo até 42º dia — letra B.' },
          { label: 'Letra D — omite I', detail: 'Nega mínimo de seis consultas multiprofissionais.', correct: 'I verdadeira — seis consultas MS — marcar B.' },
          { label: 'Letra E — só I e IV', detail: 'Combinação parcial — faltam II e III.', correct: 'Quatro assertivas corretas — todas em B.' },
          { label: 'Pegadinha cinco consultas', detail: 'Programa exige mínimo seis consultas.', correct: 'I, II, III e IV verdadeiras — letra B.' },
        ],
        footer_rule: '6 consultas + 42 dias puerpério',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-saude-da-mulher-1777104376057-4': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'FEGO/MS — distócia de ombro: sinal da tartaruga; II falsa — pressão no fundo uterino é contraindicada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Distócia de ombro',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: 'Expulsivo — cabeça exterioriza e retraí como tartaruga — distócia de ombro.', icon: 'AlertTriangle' },
          { label: 'Asserção I (V)', detail: 'Emergência obstétrica — manobras imediatas necessárias.', icon: 'Zap' },
          { label: 'Pegadinha fundo uterino', detail: 'Pressão no fundo uterino é contraindicada — II falsa.', icon: 'Ban' },
          { label: 'Manobras', detail: 'McRoberts, pressão suprapúbica — não fundo uterino.', icon: 'Activity' },
        ],
        footer_rule: 'Tartaruga = ombro — II falsa',
      },
      {
        type: 'golden_rule',
        slide_title: 'Distócia — conduta',
        meta: slideMeta,
        content: 'OMBRO DISTÓCIDO',
        rows: [
          { label: 'Sinal', value: 'Cabeça fetal retraí — tartaruga', badge: 'hot', emphasis: 'highlight' },
          { label: 'I', value: 'Emergência — desimpactar ombro', badge: 'hot' },
          { label: 'II falsa', value: 'Pressão no fundo uterino — risco de ruptura', badge: 'warn' },
          { label: 'Correto', value: 'McRoberts e pressão suprapúbica', badge: 'info' },
        ],
        footer_rule: 'I verdadeira, II falsa → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Signo da tartaruga no período expulsivo avançado.',
          'Julgar I — distócia de ombro emergência → verdadeiro.',
          'Julgar II — pressão no fundo uterino → falso.',
          'Eliminar A — I falsa.',
          'Eliminar B — II justifica I incorretamente.',
          'Eliminar C — ambas verdadeiras.',
          'Eliminar E — ambas falsas.',
          'Marcar letra D — I verdadeira e II falsa.',
        ],
        footer_rule: 'I V + II F → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ASSERTÕES',
        items: [
          { label: 'Letra A — I falsa', detail: 'Nega emergência obstétrica.', correct: 'I verdadeira — distócia de ombro — D.' },
          { label: 'Letra B — II justifica I', detail: 'Fundal pressure é errada.', correct: 'II falsa — gabarito D.' },
          { label: 'Letra C — ambas verdadeiras', detail: 'II é falsa.', correct: 'I V, II F — letra D.' },
          { label: 'Letra E — ambas falsas', detail: 'I é verdadeira.', correct: 'Emergência de ombro — marcar D.' },
          { label: 'Pegadinha fundo uterino', detail: 'Manobra proscrita.', correct: 'II falsa — relação D.' },
        ],
        footer_rule: 'Nunca pressionar fundo uterino',
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
    console.log(`[handcraft:sm-g12] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g12] total=${ok}`);
}

main();
