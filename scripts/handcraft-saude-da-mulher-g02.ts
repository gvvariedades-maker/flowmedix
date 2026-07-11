#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g02 (8 slugs pré-natal P0).
 *
 *   npx tsx scripts/handcraft-saude-da-mulher-g02.ts
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g02 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g02';
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
    'nutrição gestacional',
    'sal iodado',
    'absorção de ferro',
    'sinais de gestação',
    'morte materna tardia',
    'abortamento incompleto',
    'pródromos trabalho de parto',
  ],
};

const PF_SOURCE = {
  id: 'ms-planejamento-familiar',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica — Planejamento familiar',
  year: 2013,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_26_planejamento_familiar.pdf',
  covers: ['preservativo barreira', 'IST + gravidez', 'métodos hormonais'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Branch = 'mulher_prenatal' | 'mulher_planejamento';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  sources?: typeof AB32_SOURCE[];
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
    sources: pack.sources ?? [AB32_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\n?\d{4}\)\s*/g, '\n')
    .replace(/\s+/g, ' ')
    .replace(/náuseasmatinais/g, 'náuseas matinais')
    .replace(/daconsistência/g, 'da consistência')
    .replace(/doresassumem/g, 'dores assumem')
    .replace(/sãocaracterizados/g, 'são caracterizados')
    .replace(/ocaracterizados/g, 'o caracterizados')
    .replace(/écapaz/g, 'é capaz')
    .replace(/doençassexualmente/g, 'doenças sexualmente')
    .replace(/contaminaçãopor/g, 'contaminação por')
    .trim();
}

const SEMIOLOGIA_ASSERTAO_SLIDES = [
  {
    type: 'concept_map',
    slide_title: 'Sinais gestacionais — caso clínico',
    meta: slideMeta,
    items: [
      { label: 'Caso clínico', detail: 'Amenorreia, náuseas, sensibilidade mamária, fadiga — presunção.', icon: 'User' },
      { label: 'Exame físico', detail: 'Aumento uterino e abdominal — sinais de probabilidade.', icon: 'Stethoscope' },
      { label: 'Sinais de certeza (II)', detail: 'BCF, movimentos fetais, USG com concepto — justificam I.', icon: 'Baby' },
      { label: 'Pegadinha certeza no caso', detail: 'Paciente ainda sem BCF/movimento ativo no relato — I verdadeira.', icon: 'AlertTriangle' },
    ],
    footer_rule: 'Presunção/probabilidade ≠ certeza (BCF/USG)',
  },
  {
    type: 'golden_rule',
    slide_title: 'Tríade — sinais de gestação',
    meta: slideMeta,
    content: 'SEMIOLOGIA OBSTÉTRICA',
    rows: [
      { label: 'Presunção', value: 'Subjetivos: náuseas, amenorreia, fadiga', badge: 'info' },
      { label: 'Probabilidade', value: 'Objetivos: aumento uterino, Hegar/Piskacek', badge: 'hot' },
      { label: 'Certeza', value: 'BCF, movimentos fetais, USG com concepto', badge: 'hot', emphasis: 'highlight' },
      { label: 'Asserção I–II', value: 'II justifica por que I não é certeza', badge: 'info' },
    ],
    footer_rule: 'Certeza exige concepto/BCF — não só sintomas',
  },
  {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta,
    steps: [
      'Formato asserção I PORQUE II — julgar verdade e relação causal.',
      'Julgar I: sinais do caso são presunção/probabilidade, não certeza → VERDADEIRA.',
      'Julgar II: certeza = concepto, BCF, movimentos, USG com concepto → VERDADEIRA.',
      'Relação: II explica por que I não inclui certeza → justificativa correta.',
      'Eliminar B (II não justifica), C (II falsa), D (I falsa), E (ambas falsas).',
      'Marcar letra A.',
      'Fixação: náuseas/amenorreia = presunção; BCF = certeza.',
    ],
    footer_rule: 'I e II verdadeiras + II justifica I → A',
  },
  {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta,
    content: 'PEGADINHAS — ASSERÇÃO I/II',
    items: [
      { label: 'Letra B — II não justifica I', detail: 'Nega relação causal entre tríades.', correct: 'II define certeza — fundamenta por que os sinais do caso ainda não são certeza.' },
      { label: 'Letra C — II falsa', detail: 'Rejeita definição clássica de certeza.', correct: 'BCF/movimentos/USG são sinais de certeza — II é verdadeira.' },
      { label: 'Letra D — I falsa', detail: 'Trata presunção/probabilidade como certeza.', correct: 'I é verdadeira — náuseas e aumento uterino não são sinais de certeza.' },
      { label: 'Letra E — ambas falsas', detail: 'Nega semiologia básica da gestação.', correct: 'Ambas verdadeiras com II justificando I.' },
    ],
    footer_rule: 'Presunção ≠ certeza — relação PORQUE importa',
  },
];

const SPECS: Record<string, Pack> = {
  'cpcon-uepb-enfermagem-instalacao-e-manejo-de-sondas-1777102813845-8': {
    family: 'vf',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 — nutrição gestacional (líquidos/pirose, sal iodado, ferro + vitamina C)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Nutrição no pré-natal',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Três afirmativas (I–III) sobre alimentação na gestação — julgar antes das letras.', icon: 'Target' },
          { label: 'Líquidos e pirose (I)', detail: 'Evitar líquidos nas refeições e frutas após — conduta para reduzir refluxo.', icon: 'Droplets' },
          { label: 'Sal iodado (II)', detail: 'Iodo na gestação — prevenção de cretinismo; excesso de sódio agrava PA/edema.', icon: 'Wheat' },
          { label: 'Ferro e vitamina C (III)', detail: 'Ferro heme (animal) > vegetal; vitamina C na refeição melhora absorção não-heme.', icon: 'Pill' },
          { label: 'Pegadinha combinação parcial', detail: 'Banca testa se você exclui I verdadeira — só II e III não basta.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'I, II e III verdadeiras — não aceitar combinação parcial',
      },
      {
        type: 'golden_rule',
        slide_title: 'AB 32 — nutrição gestacional',
        meta: slideMeta,
        content: 'NUTRIÇÃO PRÉ-NATAL',
        rows: [
          { label: 'Sal', value: 'Preferir sal iodado — evitar excesso de sódio', badge: 'hot' },
          { label: 'Ferro animal', value: 'Maior biodisponibilidade que vegetal', badge: 'info' },
          { label: 'Vitamina C', value: 'Após refeição — potencializa ferro vegetal', badge: 'hot' },
          { label: 'Pirose', value: 'Fracionar líquidos — frutas após refeição', badge: 'info' },
          { label: 'Edema', value: 'Excesso de sódio pode agravar retenção', badge: 'warn' },
        ],
        footer_rule: 'Nutrição orientada em toda consulta de pré-natal',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: julgar I, II e III antes de combinar letras.',
          'Julgar I: evitar líquidos nas refeições + frutas após para pirose → VERDADEIRA.',
          'Julgar II: sal iodado + riscos do excesso de sódio na gestação → VERDADEIRA.',
          'Julgar III: ferro animal > vegetal; vitamina C melhora absorção → VERDADEIRA.',
          'Conjunto: I, II e III verdadeiras.',
          'Eliminar A (só II e III), B (só I e II), C (só II), E (I e III sem II).',
          'Marcar letra D — I, II e III.',
          'Fixação: três assertivas verdadeiras — pegadinha é combinação incompleta.',
        ],
        footer_rule: 'I+II+III → letra D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COMBINAÇÃO V/F',
        items: [
          { label: 'Letra A — II e III apenas', detail: 'Omite I verdadeira sobre líquidos e pirose.', correct: 'I também é verdadeira — orientação dietética para refluxo na gestação.' },
          { label: 'Letra B — I e II apenas', detail: 'Descarta III sobre ferro e vitamina C.', correct: 'III é verdadeira — absorção de ferro vegetal melhora com vitamina C.' },
          { label: 'Letra C — II apenas', detail: 'Isola só sal iodado.', correct: 'I e III também são verdadeiras — três assertivas corretas.' },
          { label: 'Letra E — I e III apenas', detail: 'Exclui II sobre iodo e sódio.', correct: 'II é verdadeira — sal iodado e controle de sódio na gestação.' },
        ],
        footer_rule: 'Todas verdadeiras → D — não parar em subconjunto',
      },
    ],
  },

  'cpcon-uepb-enfermagem-saude-da-mulher-1777104329543-4': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'OMS/MS — mortalidade materna obstétrica e mortalidade materna tardia (vigilância SINAN)',
    roi_error: 'puerperio_30_dias',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vigilância — óbito materno',
        meta: slideMeta,
        items: [
          { label: 'Marco da questão', detail: 'Óbito por causa obstétrica após o 42º dia e antes de um ano do fim da gestação.', icon: 'Calendar' },
          { label: 'Morte materna (até 42d)', detail: 'Durante gestação ou até 42 dias pós-parto — não é o caso do enunciado.', icon: 'Heart' },
          { label: 'Morte materna tardia', detail: 'Após o puerpério (42º dia) até um ano — classificação do enunciado.', icon: 'AlertCircle' },
          { label: 'Pegadinha 42 dias', detail: 'Confundir limite do puerpério (42d) com mortalidade tardia (>42d).', icon: 'AlertTriangle' },
        ],
        footer_rule: '>42 dias e <1 ano = tardia — não “morte materna” genérica',
      },
      {
        type: 'golden_rule',
        slide_title: 'Classificação — óbito materno',
        meta: slideMeta,
        content: 'VIGILÂNCIA MATERNAL',
        rows: [
          { label: 'Morte materna', value: 'Gestação até 42 dias pós-parto', badge: 'info' },
          { label: 'Morte materna tardia', value: 'Após o 42º dia até um ano pós-gestação', badge: 'hot', emphasis: 'highlight' },
          { label: 'Puerpério clínico', value: 'Até 42 dias — consulta de puerpério', badge: 'warn' },
          { label: 'Causa obstétrica', value: 'Relacionada à gestação/parto/puerpério', badge: 'info' },
        ],
        footer_rule: 'Pegadinha: “morte materna” sem qualificador ≠ tardia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar janela temporal: maior que 42 dias e menor que 1 ano pós-gestação.',
          'Eliminar A — “morte materna” sem qualificador (período até 42 dias).',
          'Eliminar B — “declarada” não define a janela tardia.',
          'Testar C — morte materna tardia: corresponde à definição do enunciado.',
          'Eliminar D — não obstétrica contradiz “causas obstétricas”.',
          'Eliminar E — presumível/mascarada é outra categoria epidemiológica.',
          'Marcar letra C.',
          'Fixação: tardia = após 42 dias até 1 ano.',
        ],
        footer_rule: 'pós-42º dia até um ano → morte materna tardia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CLASSIFICAÇÃO TEMPORAL',
        items: [
          { label: 'Letra A — morte materna', detail: 'Termo genérico para período até 42 dias.', correct: 'Enunciado pede óbito após 42 dias — classificação tardia.' },
          { label: 'Letra B — morte materna declarada', detail: 'Refere-se ao registro, não à janela temporal.', correct: 'A definição cobrada é temporal: após o 42º dia até um ano.' },
          { label: 'Letra D — não obstétrica', detail: 'Contradiz “causas obstétricas” do enunciado.', correct: 'Óbito por causa obstétrica na janela tardia — letra C.' },
          { label: 'Letra E — presumível/mascarada', detail: 'Categoria de subnotificação, não definição temporal.', correct: 'Prazo >42d e <1 ano = morte materna tardia.' },
        ],
        footer_rule: 'Não confundir puerpério (42d) com tardia',
      },
    ],
  },

  'cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563500147-3': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 — sinais de presunção, probabilidade e certeza da gestação',
    slides: SEMIOLOGIA_ASSERTAO_SLIDES,
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563500147-5': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 — sinais de presunção, probabilidade e certeza da gestação',
    slides: SEMIOLOGIA_ASSERTAO_SLIDES,
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563521756-2': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 / obstetrícia — formas clínicas de abortamento',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Abortamento — quadro clínico',
        meta: slideMeta,
        items: [
          { label: 'Pista do enunciado', detail: 'Concepto expulso + placenta/restos retidos + colo dilatado.', icon: 'AlertCircle' },
          { label: 'Abortamento incompleto', detail: 'Eliminação parcial — útero menor que IG, cólicas, sangramento.', icon: 'Heart' },
          { label: 'vs. Retido', detail: 'Colo fechado, concepto morto sem expulsão — não é o caso.', icon: 'XCircle' },
          { label: 'Pegadinha inevitável', detail: 'Inevitável: colo aberto sem expulsão ainda — aqui já houve expulsão parcial.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Restos + colo aberto = incompleto',
      },
      {
        type: 'golden_rule',
        slide_title: 'Formas clínicas — abortamento',
        meta: slideMeta,
        content: 'ABORTAMENTO',
        rows: [
          { label: 'Incompleto', value: 'Expulsão parcial + restos + colo dilatado', badge: 'hot', emphasis: 'highlight' },
          { label: 'Retido', value: 'Colo fechado, sem expulsão', badge: 'warn' },
          { label: 'Inevitável', value: 'Colo aberto, sem expulsão completa ainda', badge: 'info' },
          { label: 'Completo', value: 'Expulsão total, colo fechando', badge: 'info' },
        ],
        footer_rule: '“Restos placentários” após expulsão = incompleto',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Destacar: concepto expulso + placenta/restos permanecem + colo dilatado.',
          'Eliminar A — espontâneo é termo amplo, não forma clínica específica.',
          'Eliminar B — inevitável: ainda sem expulsão do concepto.',
          'Testar C — incompleto: expulsão parcial com retenção de restos.',
          'Eliminar D — retido: colo fechado, sem expulsão.',
          'Eliminar E — idade gestacional não é classificação por retenção de restos.',
          'Marcar letra C.',
          'Fixação: incompleto = parcial + restos + colo aberto.',
        ],
        footer_rule: 'Expulsão parcial + restos → incompleto',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TIPOS DE ABORTAMENTO',
        items: [
          { label: 'Letra A — espontâneo', detail: 'Termo genérico, não descreve retenção de restos.', correct: 'Forma clínica específica: eliminação parcial com placenta retida.' },
          { label: 'Letra B — inevitável', detail: 'Colo aberto mas concepto ainda não expulso.', correct: 'Enunciado: concepto já expulso com restos — incompleto.' },
          { label: 'Letra D — retido', detail: 'Colo fechado e concepto retido sem expulsão.', correct: 'Colo dilatado e expulsão parcial — incompleto.' },
          { label: 'Letra E — idade gestacional', detail: 'Refere-se à IG, não à forma clínica.', correct: 'Quadro descrito é abortamento incompleto.' },
        ],
        footer_rule: 'Retido × incompleto — colo e restos decidem',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fau-unicentro-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1776056709494-1': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'MS/COFEN — SpO2 em porcentagem; gestante com insuficiência respiratória',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gestante — SpO2',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: 'Gestante com insuficiência respiratória aguda + cianose + queda de saturação.', icon: 'User' },
          { label: 'SpO2 (oximetria)', detail: 'Medida por oxímetro de pulso — unidade: porcentagem (%).', icon: 'Activity' },
          { label: 'Unidade correta', detail: 'Saturação expressa em % de hemoglobina saturada.', icon: 'Percent' },
          { label: 'Pegadinha mmHg', detail: 'mmHg na gasometria arterial — não confundir com oximetria de pulso (%).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'SpO2 em % — gasometria arterial em mmHg',
      },
      {
        type: 'golden_rule',
        slide_title: 'Unidades — oximetria',
        meta: slideMeta,
        content: 'SPO2 × GASOMETRIA',
        rows: [
          { label: 'SpO2', value: 'Porcentagem (%) — oximetria de pulso', badge: 'hot', emphasis: 'highlight' },
          { label: 'Gasometria arterial', value: 'mmHg (pressão parcial) — não SpO2', badge: 'warn' },
          { label: 'Fluxo de oxigênio', value: 'Litros por minuto — cateter/máscara', badge: 'info' },
          { label: 'Temperatura', value: '°C — termômetro', badge: 'info' },
        ],
        footer_rule: 'Saturação em % — pressão parcial em mmHg (gasometria)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: gestante com insuficiência respiratória — monitorar saturação de oxigênio.',
          'Eliminar A — mmHg: unidade de pressão parcial na gasometria arterial, não SpO2.',
          'Eliminar B — horas/minuto: não expressa saturação.',
          'Eliminar C — litros: fluxo de oxigênio, não saturação.',
          'Eliminar D — °C: temperatura corporal.',
          'Testar E — porcentagem (%) é unidade da oximetria.',
          'Marcar letra E.',
          'Fixação: SpO2 sempre em %.',
        ],
        footer_rule: 'Saturação → %',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — UNIDADES',
        items: [
          { label: 'Letra A — mmHg', detail: 'Confunde oximetria de pulso com gasometria arterial.', correct: 'SpO2 é percentual de Hb saturada — mmHg é pressão parcial na gasometria.' },
          { label: 'Letra B — horas/minuto', detail: 'Unidade de frequência, não saturação.', correct: 'Oxímetro de pulso expressa SpO2 em %.' },
          { label: 'Letra C — litros', detail: 'Fluxo de oxigênio suplementar.', correct: 'Saturação medida em %, não em litros por minuto.' },
          { label: 'Letra D — °C', detail: 'Temperatura — outro sinal vital.', correct: 'Saturação de oxigênio = %.' },
        ],
        footer_rule: '% ≠ mmHg — oximetria × gasometria',
      },
    ],
  },

  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002217274-8': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 — pródromos e fases do trabalho de parto',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Termos da gestação/parto',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Assinalar termo relacionado à gestação/parto.', icon: 'Target' },
          { label: 'Pródromos', detail: 'Sinais prévios ao trabalho de parto ativo (ex.: perda do muco, contrações irregulares).', icon: 'Clock' },
          { label: 'Telarca', detail: 'Desenvolvimento mamário na puberdade — não é gestação.', icon: 'XCircle' },
          { label: 'Pegadinha telarca', detail: 'Termo de adolescência confundido com obstetrícia.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Pródromos = pré-parto · telarca = puberdade',
      },
      {
        type: 'golden_rule',
        slide_title: 'Fases — trabalho de parto',
        meta: slideMeta,
        content: 'OBSTETRÍCIA — TERMOS',
        rows: [
          { label: 'Pródromos', value: 'Pré-trabalho de parto — sinais iniciais', badge: 'hot', emphasis: 'highlight' },
          { label: 'Telarca', value: 'Puberdade — desenvolvimento mamário', badge: 'warn' },
          { label: 'Prostatectomia', value: 'Cirurgia urológica masculina', badge: 'info' },
          { label: 'Anasarca', value: 'Edema generalizado — não específico de gestação', badge: 'info' },
        ],
        footer_rule: 'Pródromos ligam-se ao parto, não à puberdade',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar termos obstétricos vs. de outras áreas.',
          'Testar A — pródromos: fase prévia ao parto → relacionado à gestação.',
          'Eliminar B — prostatectomia: cirurgia masculina.',
          'Eliminar C — telarca: puberdade feminina.',
          'Eliminar D — anasarca: edema generalizado.',
          'Eliminar E — miíase: parasitose cutânea.',
          'Marcar letra A.',
          'Fixação: pródromos = pré-parto.',
        ],
        footer_rule: 'Pródromos → gestação/parto',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VOCABULÁRIO',
        items: [
          { label: 'Letra B — prostatectomia', detail: 'Procedimento urológico masculino.', correct: 'Sem relação com gestação — pródromos antecedem o parto.' },
          { label: 'Letra C — telarca', detail: 'Marco da puberdade, não do trabalho de parto.', correct: 'Pródromos são sinais prévios ao parto na gestação.' },
          { label: 'Letra D — anasarca', detail: 'Edema generalizado em diversas condições.', correct: 'Termo obstétrico pedido: pródromos.' },
          { label: 'Letra E — miíase', detail: 'Infestação por larvas de moscas.', correct: 'Pródromos relacionam-se ao trabalho de parto.' },
        ],
        footer_rule: 'Telarca ≠ pródromos',
      },
    ],
  },

  'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-9': {
    family: 'conceito',
    branch: 'mulher_planejamento',
    guideline: 'MS — planejamento familiar: preservativo de barreira (IST + gravidez)',
    sources: [PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Planejamento familiar — barreira',
        meta: slideMeta,
        items: [
          { label: 'Figura (preservativo)', detail: 'Método de barreira — masculino e feminino.', icon: 'Shield' },
          { label: 'Dupla proteção', detail: 'Único método comum que previne IST e gravidez quando usado corretamente.', icon: 'CheckCircle' },
          { label: 'Hormonais', detail: 'Previnem gravidez — não protegem sozinhos contra IST.', icon: 'XCircle' },
          { label: 'Pegadinha “único IST”', detail: 'Alternativas erradas atribuem IST+gravidez a hormonais ou laqueadura.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Barreira = IST + gravidez (uso correto)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Métodos — comparativo',
        meta: slideMeta,
        content: 'PLANEJAMENTO FAMILIAR',
        rows: [
          { label: 'Preservativo', value: 'Barreira — IST + gravidez', badge: 'hot', emphasis: 'highlight' },
          { label: 'Hormonal oral/injetável', value: 'Previne gravidez — não IST isoladamente', badge: 'warn' },
          { label: 'Laqueadura/vasectomia', value: 'Estérilização — não é preservativo', badge: 'warn' },
          { label: 'Espermicida', value: 'Barreira química — eficácia limitada vs IST', badge: 'info' },
        ],
        footer_rule: 'Só barreira mecânica cobre IST + gravidez',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar método de barreira na figura (preservativo).',
          'Eliminar A — laqueadura/vasectomia não são preservativos.',
          'Eliminar B — pílula hormonal não previne IST sozinha.',
          'Eliminar C — injetável hormonal — mesma limitação para IST.',
          'Eliminar D — espermicida isolado não é “único” para IST+gravidez como preservativo.',
          'Testar E — barreira com preservativo masculino/feminino.',
          'Marcar letra E.',
          'Fixação: preservativo = barreira dupla proteção.',
        ],
        footer_rule: 'Preservativo → E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MÉTODO × PROTEÇÃO',
        items: [
          { label: 'Letra A — laqueadura como preservativo', detail: 'Confunde esterilização com barreira.', correct: 'Preservativo é método de barreira — não laqueadura.' },
          { label: 'Letra B — pílula previne IST', detail: 'Hormonal previne gravidez, não IST.', correct: 'Barreira mecânica reduz risco de IST e gravidez.' },
          { label: 'Letra C — injetável previne IST', detail: 'Mesmo erro da pílula em outra via.', correct: 'IST exige barreira — preservativo masculino/feminino.' },
          { label: 'Letra D — espermicida único', detail: 'Eficácia limitada; não substitui preservativo.', correct: 'Gabarito E descreve barreira com dupla proteção.' },
        ],
        footer_rule: 'Hormonal ≠ proteção IST',
      },
    ],
    cleanInstruction: (s) =>
      cleanPdfNoise(s).replace(
        /A figura abaixo representa qual método contraceptivo utilizado no planejamento familiar\?/i,
        'Sobre métodos contraceptivos no planejamento familiar (figura: preservativo de barreira), assinale a alternativa correta:',
      ),
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
    console.log(`[handcraft:sm-g02] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g02] total=${ok}`);
}

main();
