import type { QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import type { GoldenRuleRow } from '@/components/slides/variants/GoldenRule';
import type { CurativosAssertive } from '@/lib/catalogMigration/upgradePremiumCurativos';
import {
  buildPackageSlidesForFamily,
  canBuildVfSlides,
  type BuildPackageSlidesInput,
  type SubtopicoTopicProfile,
  type VfPackageConfig,
  type ChoicePackageConfig,
} from '@/lib/catalogMigration/upgradePremiumVfCore';

export const CALCULO_GOLDEN_FILE = 'questao-premium-idecan-calculo-equivalencias-gotas.json';
export const CALCULO_CE_GOLDEN_FILE = 'questao-premium-idecan-calculo-ml-gotas-microgotas.json';

type SlideRecord = Record<string, unknown>;

const DEFAULT_TOPIC = 'Equivalências e doses';

const TOPIC_PROFILES: Record<string, SubtopicoTopicProfile> = {
  [DEFAULT_TOPIC]: {
    conceptFooter: 'DECORE: 1 mL = 20 gotas = 60 microgotas | 1 gota = 3 microgotas.',
    goldenContent: 'EQUIVALÊNCIAS — REFERÊNCIA DE PROVA',
    goldenFooter: 'Banca troca 20 por 30 e 60 por 90 — memorize as constantes padrão.',
    logicFooter: 'Constante → conversão → gabarito → eliminar distratoras.',
    logicFix: '1 mL = 20 gotas = 60 microgotas no padrão brasileiro.',
    dangerContent: 'PEGADINHAS — CÁLCULO DE MEDICAMENTOS',
    dangerFooter: (id) => `Constante correta fecha letra ${id}.`,
    chipLabel: 'CÁLCULO',
  },
  'Equivalências gts/mL': {
    conceptFooter: '1 mL = 20 gotas = 60 microgotas | 1 gota = 3 microgotas.',
    goldenContent: '1 ML = 20 GOTAS = 60 MICROGOTAS',
    goldenFooter: 'Se a questão trocar 20 por 30, o enunciado está errado.',
    logicFooter: 'Aplicar constante padrão antes de marcar Certo/Errado ou alternativa.',
    logicFix: 'trocar 20 por 30 ou 60 por 90 é erro clássico de prova.',
    dangerContent: 'PEGADINHAS NA EQUIVALÊNCIA DE GOTAS',
    dangerFooter: (id) => `Equivalência correta fecha letra ${id}.`,
    chipLabel: 'GOTAS',
  },
  'Dose e regra de três': {
    conceptFooter: 'Dose prescrita × disponível ÷ prescrito — conferir unidade (mg, mL, UI).',
    goldenContent: 'REGRA DE TRÊS — DOSE E VOLUME',
    goldenFooter: 'A banca troca unidade ou concentração no meio do cálculo.',
    logicFooter: 'Organize: o que tenho → o que preciso → proporção.',
    logicFix: 'sempre alinhar mg com mg e mL com mL antes de calcular.',
    dangerContent: 'PEGADINHAS — REGRA DE TRÊS',
    dangerFooter: (id) => `Unidade e proporção corretas fecham letra ${id}.`,
    chipLabel: 'DOSE',
  },
  'Infusão e gts/min': {
    conceptFooter: 'gts/min = (volume × fator) ÷ tempo em minutos.',
    goldenContent: 'INFUSÃO — VOLUME × FATOR ÷ TEMPO',
    goldenFooter: 'Microgotas: fator 60 | Macrogotas: fator 20.',
    logicFooter: 'Identifique equipo (20 ou 60) antes de converter.',
    logicFix: 'fator errado destrói o cálculo de gts/min.',
    dangerContent: 'PEGADINHAS — INFUSÃO',
    dangerFooter: (id) => `Fator e tempo corretos fecham letra ${id}.`,
    chipLabel: 'INFUSÃO',
  },
};

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function isCalculoSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'cálculo de administração de medicamentos e infusões' ||
    n === 'cálculo de administração de medicamentos' ||
    n === 'cálculos de enfermagem' ||
    n === 'dosagens e cálculos'
  );
}

export function inferCalculoTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
  if (/gts\/min|gotas por min|microgotas|macrogota|equivalên|equivalen|1 ml.*gotas|20 gotas|60 micro/.test(blob)) {
    return 'Equivalências gts/mL';
  }
  if (/infusão|infusao|ml\/h|hora|gotejamento/.test(blob)) {
    return 'Infusão e gts/min';
  }
  if (/regra de três|regra de tres|dose|mg\b|comprimido|ampola/.test(blob)) {
    return 'Dose e regra de três';
  }
  return DEFAULT_TOPIC;
}

function buildCalculoFalseDanger(a: CurativosAssertive): { label: string; detail: string; correct: string } {
  const lower = a.text.toLowerCase();
  if (/30 gotas|90 micro/.test(lower)) {
    return {
      label: 'Trocar 20 por 30 gotas ou 60 por 90 microgotas',
      detail: 'A banca aumenta o valor para induzir erro de cálculo.',
      correct: 'O padrão é 1 mL = 20 gotas = 60 microgotas.',
    };
  }
  return {
    label: truncate(`Aceitar ${a.roman} como verdadeira`, 200),
    detail: truncate(a.text, 500),
    correct: truncate(`Afirmativa ${a.roman} é falsa nesta questão.`, 500),
  };
}

function inferCalculoOptionTrap(text: string): string {
  const lower = text.toLowerCase();
  if (/10 unidades|10 ui/.test(lower) && /insulina|u-100/.test(lower)) {
    return 'Insulina U-100 = 100 UI em 1 mL — não 10 UI.';
  }
  if (/35 microgotas|10 microgotas/.test(lower)) {
    return '1 gota = 3 microgotas — não 10 nem 35.';
  }
  if (/30 gotas/.test(lower) && !/60 micro/.test(lower)) {
    return 'Padrão brasileiro: 1 mL = 20 gotas, não 30.';
  }
  if (/90 micro/.test(lower)) {
    return 'Padrão: 1 mL = 60 microgotas, não 90.';
  }
  if (/\d+\s*mg/.test(lower) && /\d+\s*ml/.test(lower) === false) {
    return 'Conferir se a unidade do cálculo está alinhada (mg × mL).';
  }
  return truncate(text, 500);
}

function buildCalculoGoldenRows(
  topic: string,
  _options: QuestionOption[],
  correct: QuestionOption,
): GoldenRuleRow[] {
  if (topic === 'Equivalências gts/mL' || topic === DEFAULT_TOPIC) {
    return [
      { label: '1 mL', value: '20 gotas (macrogotas)' },
      { label: '1 mL', value: '60 microgotas' },
      { label: '1 gota', value: '3 microgotas' },
      { label: 'Insulina U-100', value: '100 UI em 1 mL' },
      {
        label: 'Gabarito',
        value: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
        emphasis: 'highlight',
        badge: 'hot',
      },
    ];
  }
  return [];
}

function buildCalculoConceptItems(
  input: BuildPackageSlidesInput,
  correct: QuestionOption,
  topic: string,
): { label: string; detail: string; icon: string }[] {
  if (topic === 'Equivalências gts/mL' || topic === DEFAULT_TOPIC) {
    return [
      { label: '1 mL = 20 gotas', detail: 'Constante padrão macrogotas no Brasil.', icon: 'Droplets' },
      { label: '1 mL = 60 microgotas', detail: 'Equipo de microgotas — 3 microgotas por gota.', icon: 'FlaskConical' },
      { label: '1 gota = 3 microgotas', detail: 'Relação fixa de conversão.', icon: 'ArrowLeftRight' },
      { label: 'Gabarito', detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500), icon: 'Target' },
      { label: 'Armadilha clássica', detail: 'Trocar 20→30 ou 60→90 invalida o enunciado.', icon: 'AlertTriangle' },
    ];
  }
  return [
    { label: 'Contexto', detail: truncate(input.instruction.replace(/\s+/g, ' '), 500), icon: 'Calculator' },
    { label: 'Gabarito', detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500), icon: 'Target' },
  ];
}

function buildCertoErradoCalculoSlides(input: BuildPackageSlidesInput): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  if (!correct) throw new Error('Cálculo C/E: gabarito ausente');
  const topic = inferCalculoTopic(input.instruction, input.options);
  const prof = TOPIC_PROFILES[topic] ?? TOPIC_PROFILES[DEFAULT_TOPIC];
  const statement = input.instruction.replace(/\s+/g, ' ').trim();
  const isErrado = /errado/i.test(correct.text);
  const isStatementTrue = !isErrado;

  return [
    {
      type: 'concept_map',
      slide_title: truncate(`${topic} — mapa C/E`, 120),
      chip_label: prof.chipLabel,
      meta: { topico: input.topico, subtopico: input.subtopico },
      items: buildCalculoConceptItems(input, correct, topic),
      footer_rule: truncate(prof.conceptFooter, 500),
    },
    {
      type: 'golden_rule',
      slide_title: 'Referência — equivalências',
      meta: { topico: input.topico, subtopico: input.subtopico },
      content: truncate(prof.goldenContent, 1000),
      rows: [
        { label: '1 mL', value: '20 gotas' },
        { label: '1 mL', value: '60 microgotas' },
        { label: '1 gota', value: '3 microgotas' },
        {
          label: 'Enunciado da prova',
          value: truncate(statement, 500),
          emphasis: isStatementTrue ? 'success' : 'alert',
        },
        {
          label: 'Gabarito',
          value: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
          emphasis: 'highlight',
          badge: 'hot',
        },
      ],
      footer_rule: truncate(prof.goldenFooter, 500),
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: { topico: input.topico, subtopico: input.subtopico },
      steps: [
        'Lembrar da constante padrão de gotejamento.',
        'Aplicar 1 mL = 20 gotas e 1 mL = 60 microgotas.',
        `Confrontar com o enunciado: ${truncate(statement, 120)}.`,
        `Decidir: afirmativa é ${isStatementTrue ? 'certa' : 'errada'}.`,
        `Marcar letra ${correct.id}.`,
        `Fixação: ${prof.logicFix}.`,
      ],
      footer_rule: truncate(prof.logicFooter, 500),
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: { topico: input.topico, subtopico: input.subtopico },
      content: truncate(prof.dangerContent, 1000),
      items: [
        {
          label: 'Trocar 20 por 30 gotas',
          detail: 'A banca aumenta o valor para induzir erro.',
          correct: 'O padrão é 1 mL = 20 gotas.',
        },
        {
          label: 'Trocar 60 por 90 microgotas',
          detail: 'Número maior parece coerente, mas rompe a constante.',
          correct: 'O padrão é 1 mL = 60 microgotas.',
        },
        {
          label: 'Achar que 1 gota = 1 microgota',
          detail: 'Isso destrói a relação entre os sistemas.',
          correct: '1 gota corresponde a 3 microgotas.',
        },
      ],
      footer_rule: truncate(prof.dangerFooter(correct.id), 500),
    },
  ];
}

const VF_CONFIG: VfPackageConfig = {
  inferTopic: inferCalculoTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
  buildFalseDangerItem: buildCalculoFalseDanger,
};

const CHOICE_CONFIG: ChoicePackageConfig = {
  inferTopic: inferCalculoTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
  inferOptionTrap: inferCalculoOptionTrap,
  buildGoldenRows: buildCalculoGoldenRows,
  buildConceptItems: buildCalculoConceptItems,
};

export function canBuildCalculoPremiumSlides(instruction: string, family: string): boolean {
  const lower = instruction.toLowerCase();
  const calcBlob =
    /calcul|dose|gts|gotas|equiv|ml\b|infus|microgotas|regra de três|regra de tres|comprimido|mg\b|ui\b|insulina|gotejamento/.test(
      lower,
    );
  if (!calcBlob && family !== 'calc') return false;
  if (canBuildVfSlides(instruction)) return true;
  if (family === 'certo_errado' && calcBlob) return true;
  return ['calc', 'conceito', 'protocolo', 'vf'].includes(family);
}

export function calculoGoldenReferenceForFamily(family: string): string {
  return family === 'certo_errado' ? CALCULO_CE_GOLDEN_FILE : CALCULO_GOLDEN_FILE;
}

export function buildCalculoPremiumSlidesForFamily(
  input: BuildPackageSlidesInput,
  family: string,
): SlideRecord[] {
  if (family === 'certo_errado' && input.options.length === 2) {
    const ceOptions = input.options.every((o) => /certo|errado/i.test(o.text));
    if (ceOptions) return buildCertoErradoCalculoSlides(input);
  }
  return buildPackageSlidesForFamily(input, family, VF_CONFIG, CHOICE_CONFIG);
}
