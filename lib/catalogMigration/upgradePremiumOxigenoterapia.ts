import type { QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import type { GoldenRuleRow } from '@/components/slides/variants/GoldenRule';
import {
  buildPackageSlidesForFamily,
  canBuildPackagePremiumSlides,
  type BuildPackageSlidesInput,
  type SubtopicoTopicProfile,
  type VfPackageConfig,
  type ChoicePackageConfig,
} from '@/lib/catalogMigration/upgradePremiumVfCore';

export const OXIGENO_GOLDEN_FILE = 'questao-premium-admtec-oxigenoterapia-dispositivos.json';

type SlideRecord = Record<string, unknown>;

const DEFAULT_TOPIC = 'Oxigenoterapia';

const TOPIC_PROFILES: Record<string, SubtopicoTopicProfile> = {
  [DEFAULT_TOPIC]: {
    conceptFooter: 'Dispositivo certo = fluxo + FiO₂ literais — não marque por “parecer” clínico.',
    goldenContent: 'CNA · Venturi · FiO₂',
    goldenFooter: 'Banca inverte Venturi e máscara simples; CNA é baixo fluxo.',
    logicFooter: 'Identificar dispositivo × fluxo × FiO₂ antes de marcar.',
    logicFix: 'CNA = baixo fluxo · Venturi = FiO₂ fixa com diluidores.',
    dangerContent: 'PEGADINHAS — DISPOSITIVOS DE O₂',
    dangerFooter: (id) => `Fluxo e FiO₂ corretos fecham letra ${id}.`,
    chipLabel: 'O₂',
  },
  'Cateter nasal (CNA)': {
    conceptFooter: 'CNA = baixo fluxo (≈1–6 L/min), inserido na narina com mensuração.',
    goldenContent: 'CATETER NASAL — BAIXO FLUXO',
    goldenFooter: 'Não confundir CNA com alto fluxo ou Venturi.',
    logicFooter: 'Mensurar comprimento do CNA para evitar desconforto.',
    logicFix: 'CNA não é dispositivo de alto fluxo.',
    dangerContent: 'PEGADINHAS — CATETER NASAL',
    dangerFooter: (id) => `CNA = baixo fluxo fecha letra ${id}.`,
    chipLabel: 'CNA',
  },
  'Máscara de Venturi': {
    conceptFooter: 'Venturi = alto fluxo com FiO₂ controlada por diluidores.',
    goldenContent: 'VENTURI — FiO₂ CONTROLADA',
    goldenFooter: 'Diluidores definem FiO₂ (24%, 28%, 31%…) — não é máscara simples.',
    logicFooter: 'Venturi para FiO₂ precisa sem reinalação excessiva.',
    logicFix: 'Venturi tem diluidores — máscara simples não.',
    dangerContent: 'PEGADINHAS — MÁSCARA VENTURI',
    dangerFooter: (id) => `FiO₂ controlada fecha letra ${id}.`,
    chipLabel: 'VENTURI',
  },
  'Máscara facial e reservatório': {
    conceptFooter: 'Máscara simples vs não-reinalante — FiO₂ variável conforme fluxo.',
    goldenContent: 'MÁSCARAS — FLUXO E FiO₂',
    goldenFooter: 'Máscara com reservatório entrega FiO₂ maior que máscara simples.',
    logicFooter: 'Fluxo inadequado reduz FiO₂ real entregue.',
    logicFix: 'máscara não-reinalante exige fluxo mínimo adequado.',
    dangerContent: 'PEGADINHAS — MÁSCARAS DE O₂',
    dangerFooter: (id) => `Dispositivo e fluxo corretos fecham letra ${id}.`,
    chipLabel: 'MÁSCARA',
  },
};

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function isOxigenoterapiaSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'oxigenoterapia e cuidados respiratórios' ||
    n === 'oxigenoterapia' ||
    n === 'cuidados respiratórios'
  );
}

export function inferOxigenoTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
  if (/cateter nasal|cna|nasal/.test(blob)) return 'Cateter nasal (CNA)';
  if (/venturi|diluidor/.test(blob)) return 'Máscara de Venturi';
  if (/máscara|mascara|reservatório|reservatorio|não-reinalante|nao-reinalante/.test(blob)) {
    return 'Máscara facial e reservatório';
  }
  return DEFAULT_TOPIC;
}

function inferOxigenoOptionTrap(text: string): string {
  const lower = text.toLowerCase();
  if (/cateter nasal|cna/.test(lower) && /alto fluxo|0,5 a 5|0\.5 a 5/.test(lower)) {
    return 'Cateter nasal é baixo fluxo (≈1–6 L/min), não alto fluxo.';
  }
  if (/venturi/.test(lower) && (/simples|furos nas laterais|sem bolsa/.test(lower))) {
    return 'Venturi tem diluidores FiO₂ — não é máscara simples com furos.';
  }
  if (/máscara facial simples|mascara facial simples/.test(lower) && /diluidor|24%|50%/.test(lower)) {
    return 'Diluidores FiO₂ são da Venturi, não da máscara facial simples.';
  }
  if (/dpoc/.test(lower) && /50%|alto/.test(lower)) {
    return 'DPOC: cuidado com FiO₂ elevada — banca pode usar como distrator.';
  }
  return truncate(text, 500);
}

function inferOxigenoOptionTheme(
  text: string,
  isCorrect: boolean,
): { label: string; icon: string; detail: string } {
  const lower = text.toLowerCase();
  if (/cateter nasal|cna/.test(lower)) {
    return {
      label: 'Cateter nasal (CNA)',
      detail: isCorrect
        ? 'Baixo fluxo, inserido na narina — mensurar comprimento.'
        : inferOxigenoOptionTrap(text),
      icon: 'Wind',
    };
  }
  if (/venturi/.test(lower)) {
    return {
      label: 'Máscara Venturi',
      detail: isCorrect
        ? 'Alto fluxo com FiO₂ controlada por diluidores.'
        : inferOxigenoOptionTrap(text),
      icon: 'Droplets',
    };
  }
  if (/máscara|mascara/.test(lower)) {
    return {
      label: 'Máscara facial',
      detail: truncate(text, 500),
      icon: 'Activity',
    };
  }
  return {
    label: truncate(text.split(/[,.;]/)[0] ?? text, 40),
    icon: isCorrect ? 'CheckCircle' : 'XCircle',
    detail: truncate(text, 500),
  };
}

function buildOxigenoGoldenRows(
  topic: string,
  _options: QuestionOption[],
  correct: QuestionOption,
): GoldenRuleRow[] {
  if (topic === DEFAULT_TOPIC || topic === 'Cateter nasal (CNA)') {
    return [
      {
        label: 'REGRA 1 DE 3',
        value: 'Cateter nasal é dispositivo de BAIXO fluxo (≈1–6 L/min).',
        emphasis: 'highlight',
      },
      {
        label: 'REGRA 2 DE 3',
        value: 'Máscara de Venturi = alto fluxo com FiO₂ CONTROLADA (diluidores).',
        emphasis: 'success',
      },
      {
        label: 'REGRA 3 DE 3',
        value: 'Não inverter Venturi com máscara simples nem diluidores FiO₂.',
        emphasis: 'alert',
      },
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

function buildOxigenoConceptItems(
  input: BuildPackageSlidesInput,
  correct: QuestionOption,
  topic: string,
): { label: string; detail: string; icon: string }[] {
  return [
    {
      label: 'Parâmetro-chave',
      detail: truncate(input.instruction.replace(/\s+/g, ' '), 500),
      icon: 'Gauge',
    },
    {
      label: topic === 'Cateter nasal (CNA)' ? 'CNA' : 'Dispositivo',
      detail: truncate(correct.text, 500),
      icon: 'Wind',
    },
    {
      label: 'Gabarito',
      detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
      icon: 'Target',
    },
    {
      label: 'Protocolo cobrado',
      detail: 'Identificar dispositivo × fluxo × FiO₂ antes de marcar.',
      icon: 'Activity',
    },
  ].slice(0, 20);
}

const VF_CONFIG: VfPackageConfig = {
  inferTopic: inferOxigenoTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
};

const CHOICE_CONFIG: ChoicePackageConfig = {
  inferTopic: inferOxigenoTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
  inferOptionTrap: inferOxigenoOptionTrap,
  inferOptionTheme: inferOxigenoOptionTheme,
  buildGoldenRows: buildOxigenoGoldenRows,
  buildConceptItems: buildOxigenoConceptItems,
};

export function canBuildOxigenoterapiaPremiumSlides(instruction: string, family: string): boolean {
  return canBuildPackagePremiumSlides(instruction, family);
}

export function buildOxigenoterapiaPremiumSlidesForFamily(
  input: BuildPackageSlidesInput,
  family: string,
): SlideRecord[] {
  return buildPackageSlidesForFamily(input, family, VF_CONFIG, CHOICE_CONFIG);
}
