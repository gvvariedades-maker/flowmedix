/** Utilitários compartilhados pelos moldes premium Saúde da Mulher — ramo mulher_prenatal. */

export const PRENATAL_TRIMESTER_SLOTS = ['1T', '2T', '3T', '36+', '41+'] as const;

export type PrenatalTrimesterSlot = (typeof PRENATAL_TRIMESTER_SLOTS)[number];

export type PrenatalStepKind =
  | 'judgement'
  | 'eliminate'
  | 'locate'
  | 'fixation'
  | 'anchor_trimester'
  | 'step';

export interface ParsedPrenatalStep {
  kind: PrenatalStepKind;
  text: string;
  title: string;
  roman?: string;
  letter?: string;
  trimesters: PrenatalTrimesterSlot[];
  judgement?: 'true' | 'false';
}

export function prenatalTrimesterLabel(slot: PrenatalTrimesterSlot): string {
  switch (slot) {
    case '1T':
      return '1º tri';
    case '2T':
      return '2º tri';
    case '3T':
      return '3º tri';
    default:
      return slot;
  }
}

function extractTrimesters(text: string): PrenatalTrimesterSlot[] {
  const lower = text.toLowerCase();
  const found = new Set<PrenatalTrimesterSlot>();

  if (/1\s*º?\s*trimestre|primeiro trimestre|1ª consulta|pré-concep|pré concep|início da gest/i.test(lower)) {
    found.add('1T');
  }
  if (
    /2\s*º?\s*trimestre|segundo trimestre|24\s*(?:e|a)\s*28|ttgo|morfolog|20\s*[-–]\s*24/i.test(lower)
  ) {
    found.add('2T');
  }
  if (/3\s*º?\s*trimestre|terceiro trimestre|repetir vdrl|hemograma.*3/i.test(lower)) {
    found.add('3T');
  }
  if (/36\s*\+|36\s*semanas|semanal|após 36|apos 36/i.test(lower)) {
    found.add('36+');
  }
  if (/41\s*\+|41\s*semanas|pós-data|pos-data|indução|inducao/i.test(lower)) {
    found.add('41+');
  }

  return PRENATAL_TRIMESTER_SLOTS.filter((s) => found.has(s));
}

export function inferGestationMarker(title: string, description: string): { label: string; focus: boolean } {
  const text = `${title} ${description}`.toLowerCase();
  if (/marco da questão|marco da prova|foco|gabarito/i.test(text)) {
    const slots = extractTrimesters(text);
    if (slots.length > 0) return { label: prenatalTrimesterLabel(slots[0]), focus: true };
    return { label: '★', focus: true };
  }
  const slots = extractTrimesters(text);
  if (slots.length > 0) return { label: prenatalTrimesterLabel(slots[0]), focus: false };
  if (/ácido fólico|acido folico|folato/i.test(text)) return { label: '1º tri', focus: false };
  if (/consulta|periodicidade/i.test(text)) return { label: '36+', focus: false };
  return { label: '•', focus: false };
}

export function inferPrenatalRowTrimesters(label: string, value: string): PrenatalTrimesterSlot[] {
  return extractTrimesters(`${label} ${value}`);
}

export function isPrenatalHotRow(
  label: string,
  value: string,
  emphasis?: string,
  badge?: string,
): boolean {
  if (badge === 'hot' || emphasis === 'highlight') return true;
  const text = `${label} ${value}`.toLowerCase();
  return /ttgo|6 consultas|mínimo|24.*28|36\+|semanal|quinzenal/i.test(text);
}

export function isPrenatalConclusionRow(label: string, value: string): boolean {
  const text = `${label} ${value}`.toLowerCase();
  return /gabarito|letra [a-e]|combinação|conclus/i.test(text);
}

export function inferPrenatalIconName(text: string): string {
  const lower = text.toLowerCase();
  if (/ttgo|glicemia|exame|vdrl|hemograma|urina/i.test(lower)) return 'FlaskConical';
  if (/consulta|periodicidade|semanal|mensal/i.test(lower)) return 'Calendar';
  if (/ácido fólico|acido folico|folato|tabag/i.test(lower)) return 'Pill';
  if (/sinal|alerta|movimento|sangramento/i.test(lower)) return 'AlertTriangle';
  if (/puerpério|puerperio|42 dias/i.test(lower)) return 'Baby';
  return 'Heart';
}

export function inferPrenatalTrapSlots(
  label: string,
  detail: string,
  correct: string,
): { trapTrimesters: PrenatalTrimesterSlot[]; correctTrimesters: PrenatalTrimesterSlot[]; hasRail: boolean } {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();

  let trapTrimesters = extractTrimesters(`${label} ${detail}`);
  let correctTrimesters = extractTrimesters(correct);

  if (/ttgo.*1\s*º|1\s*º.*ttgo|primeiro trimestre.*ttgo/i.test(trapText)) {
    trapTrimesters = ['1T'];
    correctTrimesters = correctTrimesters.length > 0 ? correctTrimesters : ['2T'];
  }
  if (/4 consultas|quatro consultas/i.test(trapText)) {
    trapTrimesters = ['1T'];
    correctTrimesters = correctTrimesters.length > 0 ? correctTrimesters : ['36+'];
  }
  if (/tabagismo.*irrelevant|irrelevant.*tabag/i.test(trapText)) {
    trapTrimesters = ['2T'];
    correctTrimesters = correctTrimesters.length > 0 ? correctTrimesters : ['1T'];
  }
  if (/30 dias|puerpério.*30/i.test(trapText)) {
    trapTrimesters = ['3T'];
    correctTrimesters = correctTrimesters.length > 0 ? correctTrimesters : ['41+'];
  }

  return {
    trapTrimesters,
    correctTrimesters,
    hasRail: trapTrimesters.length > 0 || correctTrimesters.length > 0,
  };
}

function extractRoman(text: string): string | undefined {
  const match = text.match(/\b(I{1,3}|IV|V)\b/i);
  return match?.[1]?.toUpperCase();
}

function extractLetter(text: string): string | undefined {
  const match = text.match(/(?:letra|marcar|gabarito)\s*([A-E])\b/i) ?? text.match(/^([A-E])\b/);
  return match?.[1]?.toUpperCase();
}

export function parseMulherPrenatalStep(step: string, index: number): ParsedPrenatalStep {
  const lower = step.toLowerCase();
  const trimesters = extractTrimesters(step);
  const roman = extractRoman(step);
  const letter = extractLetter(step);

  if (/fixa[cç][aã]o|decore|lembre/i.test(lower)) {
    return { kind: 'fixation', text: step, title: 'Fixação', trimesters };
  }
  if (letter && /letra|gabarito|marcar/i.test(lower)) {
    return { kind: 'locate', text: step, title: 'Gabarito', letter, trimesters };
  }
  if (/eliminar|testar letra|falsa|incorreta/i.test(lower)) {
    return { kind: 'eliminate', text: step, title: 'Eliminar', letter, roman, trimesters };
  }
  if (roman && /verdadeira|verdadeiro|correta|falsa|falso/i.test(lower)) {
    const judgement = /falsa|falso|incorret/i.test(lower) ? 'false' : 'true';
    return { kind: 'judgement', text: step, title: `Assertiva ${roman}`, roman, judgement, trimesters };
  }
  if (trimesters.length > 0 && index === 0) {
    return { kind: 'anchor_trimester', text: step, title: 'Marco gestacional', trimesters };
  }
  return { kind: 'step', text: step, title: `Passo ${index + 1}`, roman, letter, trimesters };
}
