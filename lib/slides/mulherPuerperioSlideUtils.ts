/** Utilitários compartilhados pelos moldes premium Saúde da Mulher — ramo mulher_puerperio. */

export const PUERPERIO_TIMELINE_SLOTS = ['D0', 'D1-7', 'D42', '6m', 'trap30'] as const;

export type PuerperioTimelineSlot = (typeof PUERPERIO_TIMELINE_SLOTS)[number];

export type PuerperioStepKind =
  | 'judgement'
  | 'eliminate'
  | 'locate'
  | 'fixation'
  | 'anchor_timeline'
  | 'step';

export interface ParsedPuerperioStep {
  kind: PuerperioStepKind;
  text: string;
  title: string;
  roman?: string;
  letter?: string;
  slots: PuerperioTimelineSlot[];
  judgement?: 'true' | 'false';
}

export function puerperioSlotLabel(slot: PuerperioTimelineSlot): string {
  switch (slot) {
    case 'D0':
      return 'Parto';
    case 'D1-7':
      return '1ª sem';
    case 'D42':
      return '42 dias';
    case '6m':
      return 'AM 6m';
    case 'trap30':
      return '30?';
    default:
      return slot;
  }
}

function extractPuerperioSlots(text: string): PuerperioTimelineSlot[] {
  const lower = text.toLowerCase();
  const found = new Set<PuerperioTimelineSlot>();

  if (/puerp[eé]rio imediato|primeiras 24|ap[oó]s o parto|dia 0/i.test(lower)) {
    found.add('D0');
  }
  if (/primeira semana|visita domiciliar|ap[oó]s alta|1ª semana|1a semana/i.test(lower)) {
    found.add('D1-7');
  }
  if (/42\s*º?\s*dia|42 dias|consulta de puerp[eé]rio|at[eé] o 42/i.test(lower)) {
    found.add('D42');
  }
  if (/6 meses|am exclusivo|aleitamento.*6/i.test(lower)) {
    found.add('6m');
  }
  if (/30 dias|primeiro m[eê]s.*encerra|encerra.*30/i.test(lower)) {
    found.add('trap30');
  }
  if (/direitos|previd[eê]ncia|hol[ií]stic/i.test(lower)) {
    found.add('D42');
  }

  return PUERPERIO_TIMELINE_SLOTS.filter((s) => found.has(s));
}

export function inferPuerperioMarker(title: string, description: string): { label: string; focus: boolean } {
  const text = `${title} ${description}`.toLowerCase();
  if (/marco da questão|marco da prova|foco/i.test(text)) {
    const slots = extractPuerperioSlots(text);
    if (slots.length > 0) return { label: puerperioSlotLabel(slots[0]), focus: true };
    return { label: '★', focus: true };
  }
  const slots = extractPuerperioSlots(text);
  if (slots.length > 0) return { label: puerperioSlotLabel(slots[0]), focus: false };
  if (/lacta|amamenta|colostro/i.test(text)) return { label: 'AM 6m', focus: false };
  return { label: '•', focus: false };
}

export function inferPuerperioRowSlots(label: string, value: string): PuerperioTimelineSlot[] {
  return extractPuerperioSlots(`${label} ${value}`);
}

export function isPuerperioHotRow(
  label: string,
  value: string,
  emphasis?: string,
  badge?: string,
): boolean {
  if (badge === 'hot' || emphasis === 'highlight') return true;
  const text = `${label} ${value}`.toLowerCase();
  return /42\s*dia|consulta|visita|am exclusivo|6 meses/i.test(text);
}

export function isPuerperioWarnRow(
  label: string,
  value: string,
  emphasis?: string,
  badge?: string,
): boolean {
  if (badge === 'warn' || emphasis === 'alert') return true;
  const text = `${label} ${value}`.toLowerCase();
  return /30 dias|pegadinha|3\s*meses/i.test(text);
}

export function isPuerperioConclusionRow(label: string, value: string): boolean {
  const text = `${label} ${value}`.toLowerCase();
  return /gabarito|letra [a-e]|combinação|conclus/i.test(text);
}

export function inferPuerperioIconName(text: string): string {
  const lower = text.toLowerCase();
  if (/visita|domiciliar|home/i.test(lower)) return 'Home';
  if (/lacta|amamenta|beb[eê]|colostro/i.test(lower)) return 'Baby';
  if (/42|consulta|puerp[eé]rio/i.test(lower)) return 'Calendar';
  if (/direitos|previd/i.test(lower)) return 'Scale';
  if (/hemorragia|útero|involu/i.test(lower)) return 'Heart';
  return 'Heart';
}

export function puerperioDayPosition(text: string): number | null {
  const lower = text.toLowerCase();
  if (/30 dias|30º/i.test(lower)) return 30;
  if (/42|consulta de puerp/i.test(lower)) return 42;
  if (/primeira semana|7 dias|1ª sem/i.test(lower)) return 7;
  if (/parto|24\s*h|imediato/i.test(lower)) return 0;
  return null;
}

export function inferPuerperioTrapSlots(
  label: string,
  detail: string,
  correct: string,
): {
  trapSlots: PuerperioTimelineSlot[];
  correctSlots: PuerperioTimelineSlot[];
  trapDay: number | null;
  correctDay: number | null;
  hasRail: boolean;
} {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();

  let trapSlots = extractPuerperioSlots(`${label} ${detail}`);
  let correctSlots = extractPuerperioSlots(correct);
  let trapDay = puerperioDayPosition(`${label} ${detail}`);
  let correctDay = puerperioDayPosition(correct);

  if (/30 dias|encerra.*30|primeiro m[eê]s.*dispensa/i.test(trapText)) {
    trapSlots = ['trap30'];
    trapDay = 30;
    correctSlots = correctSlots.length > 0 ? correctSlots : ['D42'];
    correctDay = correctDay ?? 42;
  }
  if (/visita.*ap[oó]s.*42|somente ap[oó]s/i.test(trapText)) {
    trapSlots = trapSlots.length > 0 ? trapSlots : ['D42'];
    correctSlots = correctSlots.length > 0 ? correctSlots : ['D1-7'];
    trapDay = 42;
    correctDay = correctDay ?? 7;
  }
  if (/3\s*º?\s*m[eê]s|3 meses/i.test(trapText) && /am|aleitamento/i.test(trapText)) {
    trapSlots = trapSlots.length > 0 ? trapSlots : ['6m'];
    correctSlots = correctSlots.length > 0 ? correctSlots : ['6m'];
    trapDay = 90;
    correctDay = correctDay ?? 180;
  }

  return {
    trapSlots,
    correctSlots,
    trapDay,
    correctDay,
    hasRail: trapSlots.length > 0 || correctSlots.length > 0 || trapDay !== null || correctDay !== null,
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

export function parseMulherPuerperioStep(step: string, index: number): ParsedPuerperioStep {
  const lower = step.toLowerCase();
  const slots = extractPuerperioSlots(step);
  const roman = extractRoman(step);
  const letter = extractLetter(step);

  if (/fixa[cç][aã]o|decore|lembre/i.test(lower)) {
    return { kind: 'fixation', text: step, title: 'Fixação', slots };
  }
  if (letter && /letra|gabarito|marcar/i.test(lower)) {
    return { kind: 'locate', text: step, title: 'Gabarito', letter, slots };
  }
  if (/eliminar|testar letra|falsa|incorreta/i.test(lower)) {
    return { kind: 'eliminate', text: step, title: 'Eliminar', letter, roman, slots };
  }
  if (roman && /verdadeira|verdadeiro|correta|falsa|falso/i.test(lower)) {
    const judgement = /falsa|falso|incorret/i.test(lower) ? 'false' : 'true';
    return { kind: 'judgement', text: step, title: `Assertiva ${roman}`, roman, judgement, slots };
  }
  if (slots.length > 0 && index === 0) {
    return { kind: 'anchor_timeline', text: step, title: 'Linha puerpério', slots };
  }
  return { kind: 'step', text: step, title: `Passo ${index + 1}`, roman, letter, slots };
}
