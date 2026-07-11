/** Utilitários compartilhados pelos moldes premium Saúde da Mulher — ramo mulher_papanicolau. */

export const SCREENING_SPECTRUM_ZONES = [
  'hpv',
  'pre_screening',
  'active_screening',
  'trap_40',
  'trap_annual',
  'symptomatic_only',
] as const;

export type ScreeningSpectrumZone = (typeof SCREENING_SPECTRUM_ZONES)[number];

export type ScreeningStepKind =
  | 'judgement'
  | 'eliminate'
  | 'locate'
  | 'fixation'
  | 'anchor_age'
  | 'step';

export interface ParsedScreeningStep {
  kind: ScreeningStepKind;
  text: string;
  title: string;
  roman?: string;
  letter?: string;
  zones: ScreeningSpectrumZone[];
  judgement?: 'true' | 'false';
}

export const SCREENING_AGE_MARKERS = [18, 25, 40, 50, 64] as const;

export function screeningZoneLabel(zone: ScreeningSpectrumZone): string {
  switch (zone) {
    case 'hpv':
      return 'HPV 9–14';
    case 'pre_screening':
      return 'Antes de 25';
    case 'active_screening':
      return '25–64 / 3 anos';
    case 'trap_40':
      return 'Pegadinha 40';
    case 'trap_annual':
      return 'Pegadinha anual';
    case 'symptomatic_only':
      return 'Só sintomática';
    default:
      return zone;
  }
}

export function screeningZoneShort(zone: ScreeningSpectrumZone): string {
  switch (zone) {
    case 'hpv':
      return 'HPV';
    case 'pre_screening':
      return '<25';
    case 'active_screening':
      return '25–64';
    case 'trap_40':
      return '40?';
    case 'trap_annual':
      return '1a?';
    case 'symptomatic_only':
      return 'Sint.';
    default:
      return zone;
  }
}

function extractScreeningZones(text: string): ScreeningSpectrumZone[] {
  const lower = text.toLowerCase();
  const found = new Set<ScreeningSpectrumZone>();

  if (/\bhpv\b|vacina.*9|9\s*a\s*14|meninas 9/i.test(lower)) {
    found.add('hpv');
  }
  if (/antes de 25|menor de 25|pr[eé]-rastreio/i.test(lower)) {
    found.add('pre_screening');
  }
  if (
    /25\s*(?:e|a)\s*64|25 anos|64 anos|trienal|3 anos|a cada 3|papanicolau|rastreio.*colo|citologia/i.test(
      lower,
    )
  ) {
    found.add('active_screening');
  }
  if (/\b40 anos\b|aos 40|in[ií]cio.*40|marco.*40/i.test(lower)) {
    found.add('trap_40');
  }
  if (/anual|todo ano|anualmente|a cada ano/i.test(lower)) {
    found.add('trap_annual');
  }
  if (/somente sintom|s[oó] com sintoma|sintom[aá]tica apenas/i.test(lower)) {
    found.add('symptomatic_only');
  }

  return SCREENING_SPECTRUM_ZONES.filter((z) => found.has(z));
}

export function inferScreeningZoneMarker(
  title: string,
  description: string,
): { label: string; focus: boolean; zone: ScreeningSpectrumZone | null } {
  const text = `${title} ${description}`.toLowerCase();
  if (/marco da questão|marco da prova|foco|gabarito/i.test(text)) {
    const zones = extractScreeningZones(text);
    const zone = zones.includes('active_screening') ? 'active_screening' : zones[0] ?? 'active_screening';
    return { label: screeningZoneShort(zone), focus: true, zone };
  }
  const zones = extractScreeningZones(text);
  if (zones.length > 0) {
    return { label: screeningZoneShort(zones[0]), focus: false, zone: zones[0] };
  }
  if (/periodicidade|trienal|3 anos/i.test(text)) {
    return { label: '3a', focus: false, zone: 'active_screening' };
  }
  if (/inco|ms|inca/i.test(text)) {
    return { label: 'INCA', focus: false, zone: 'active_screening' };
  }
  return { label: '•', focus: false, zone: null };
}

export function inferPapanicolauRowZones(label: string, value: string): ScreeningSpectrumZone[] {
  return extractScreeningZones(`${label} ${value}`);
}

export function isPapanicolauHotRow(
  label: string,
  value: string,
  emphasis?: string,
  badge?: string,
): boolean {
  if (badge === 'hot' || emphasis === 'highlight') return true;
  const text = `${label} ${value}`.toLowerCase();
  return /25 anos|3 anos|trienal|a cada 3|in[ií]cio.*rastreio/i.test(text);
}

export function isPapanicolauWarnRow(
  label: string,
  value: string,
  emphasis?: string,
  badge?: string,
): boolean {
  if (badge === 'warn' || emphasis === 'alert') return true;
  const text = `${label} ${value}`.toLowerCase();
  return /40 anos|anual|pegadinha/i.test(text);
}

export function isPapanicolauInfoRow(badge?: string): boolean {
  return badge === 'info' || badge === 'ok';
}

export function isPapanicolauConclusionRow(label: string, value: string): boolean {
  const text = `${label} ${value}`.toLowerCase();
  return /gabarito|letra [a-e]|combinação|conclus/i.test(text);
}

export function inferPapanicolauIconName(text: string): string {
  const lower = text.toLowerCase();
  if (/\bhpv\b|vacina/i.test(lower)) return 'Syringe';
  if (/papanicolau|citologia|colo uterino/i.test(lower)) return 'Microscope';
  if (/25|64|idade|anos/i.test(lower)) return 'Calendar';
  if (/sintom/i.test(lower)) return 'Stethoscope';
  if (/inca|ms|diretriz/i.test(lower)) return 'FileText';
  return 'Heart';
}

/** Posição aproximada na régua 18–64 para highlight visual. */
export function screeningAgePosition(text: string): number | null {
  const lower = text.toLowerCase();
  if (/\b18\b/.test(lower)) return 18;
  if (/\b25\b|in[ií]cio/i.test(lower)) return 25;
  if (/\b40\b/.test(lower)) return 40;
  if (/\b50\b/.test(lower)) return 50;
  if (/\b64\b|t[eé]rmino/i.test(lower)) return 64;
  if (/25\s*(?:e|a)\s*64|25–64|25-64/.test(lower)) return 44;
  return null;
}

export function inferScreeningTrapZones(
  label: string,
  detail: string,
  correct: string,
): { trapZones: ScreeningSpectrumZone[]; correctZones: ScreeningSpectrumZone[]; trapAge: number | null; correctAge: number | null; hasRail: boolean } {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();

  let trapZones = extractScreeningZones(`${label} ${detail}`);
  let correctZones = extractScreeningZones(correct);
  let trapAge = screeningAgePosition(`${label} ${detail}`);
  let correctAge = screeningAgePosition(correct);

  if (/\b40 anos\b|aos 40|in[ií]cio.*40/i.test(trapText)) {
    trapZones = ['trap_40'];
    trapAge = 40;
    correctZones = correctZones.length > 0 ? correctZones : ['active_screening'];
    correctAge = correctAge ?? 25;
  }
  if (/anual|todo ano/i.test(trapText)) {
    trapZones = trapZones.length > 0 ? trapZones : ['trap_annual'];
    correctZones = correctZones.length > 0 ? correctZones : ['active_screening'];
    correctAge = correctAge ?? 44;
  }
  if (/somente sintom|s[oó] com sintoma/i.test(trapText)) {
    trapZones = ['symptomatic_only'];
    correctZones = correctZones.length > 0 ? correctZones : ['active_screening'];
    correctAge = correctAge ?? 25;
  }
  if (/antes de 25|menor de 25/i.test(trapText) && !/crit[eé]rio/i.test(correctText)) {
    trapZones = ['pre_screening'];
    correctZones = correctZones.length > 0 ? correctZones : ['active_screening'];
  }

  return {
    trapZones,
    correctZones,
    trapAge,
    correctAge,
    hasRail: trapZones.length > 0 || correctZones.length > 0 || trapAge !== null || correctAge !== null,
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

export function parseMulherScreeningStep(step: string, index: number): ParsedScreeningStep {
  const lower = step.toLowerCase();
  const zones = extractScreeningZones(step);
  const roman = extractRoman(step);
  const letter = extractLetter(step);

  if (/fixa[cç][aã]o|decore|lembre/i.test(lower)) {
    return { kind: 'fixation', text: step, title: 'Fixação', zones };
  }
  if (letter && /letra|gabarito|marcar/i.test(lower)) {
    return { kind: 'locate', text: step, title: 'Gabarito', letter, zones };
  }
  if (/eliminar|testar letra|falsa|incorreta/i.test(lower)) {
    return { kind: 'eliminate', text: step, title: 'Eliminar', letter, roman, zones };
  }
  if (roman && /verdadeira|verdadeiro|correta|falsa|falso/i.test(lower)) {
    const judgement = /falsa|falso|incorret/i.test(lower) ? 'false' : 'true';
    return { kind: 'judgement', text: step, title: `Assertiva ${roman}`, roman, judgement, zones };
  }
  if (zones.length > 0 && index === 0) {
    return { kind: 'anchor_age', text: step, title: 'Faixa etária', zones };
  }
  return { kind: 'step', text: step, title: `Passo ${index + 1}`, roman, letter, zones };
}
