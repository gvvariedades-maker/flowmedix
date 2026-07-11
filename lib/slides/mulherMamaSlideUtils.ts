/** Utilitários compartilhados pelos moldes premium Saúde da Mulher — ramo mulher_mama. */

export const MAMA_SPECTRUM_ZONES = [
  'autoexame_awareness',
  'pre_screening',
  'active_screening',
  'trap_40',
  'trap_annual',
  'autoexame_substitute',
] as const;

export type MamaSpectrumZone = (typeof MAMA_SPECTRUM_ZONES)[number];

export type MamaStepKind =
  | 'judgement'
  | 'eliminate'
  | 'locate'
  | 'fixation'
  | 'anchor_age'
  | 'step';

export interface ParsedMamaStep {
  kind: MamaStepKind;
  text: string;
  title: string;
  roman?: string;
  letter?: string;
  zones: MamaSpectrumZone[];
  judgement?: 'true' | 'false';
}

export const MAMA_AGE_MARKERS = [40, 50, 69] as const;

export function mamaZoneLabel(zone: MamaSpectrumZone): string {
  switch (zone) {
    case 'autoexame_awareness':
      return 'Autoexame conscientização';
    case 'pre_screening':
      return 'Antes de 50';
    case 'active_screening':
      return '50–69 / bienal';
    case 'trap_40':
      return 'Pegadinha 40';
    case 'trap_annual':
      return 'Pegadinha anual';
    case 'autoexame_substitute':
      return 'Autoexame ≠ mamografia';
    default:
      return zone;
  }
}

export function mamaZoneShort(zone: MamaSpectrumZone): string {
  switch (zone) {
    case 'autoexame_awareness':
      return 'Auto';
    case 'pre_screening':
      return '<50';
    case 'active_screening':
      return '50–69';
    case 'trap_40':
      return '40?';
    case 'trap_annual':
      return '1a?';
    case 'autoexame_substitute':
      return 'AE≠Mam';
    default:
      return zone;
  }
}

function extractMamaZones(text: string): MamaSpectrumZone[] {
  const lower = text.toLowerCase();
  const found = new Set<MamaSpectrumZone>();

  if (/autoexame|conscientiza[cç][aã]o|palpa[cç][aã]o/i.test(lower)) {
    if (/substitui|dispensa|n[aã]o substitui|complementar/i.test(lower)) {
      found.add('autoexame_substitute');
    } else {
      found.add('autoexame_awareness');
    }
  }
  if (/antes de 50|menor de 50|pr[eé]-rastreio/i.test(lower)) {
    found.add('pre_screening');
  }
  if (
    /50\s*(?:e|a)\s*69|50 anos|69 anos|bienal|2 anos|a cada 2|mamografia|rastreio.*mama/i.test(
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
  if (/autoexame.*substitui|dispensa.*mamografia|s[oó] autoexame/i.test(lower)) {
    found.add('autoexame_substitute');
  }

  return MAMA_SPECTRUM_ZONES.filter((z) => found.has(z));
}

export function inferMamaZoneMarker(
  title: string,
  description: string,
): { label: string; focus: boolean; zone: MamaSpectrumZone | null } {
  const text = `${title} ${description}`.toLowerCase();
  if (/marco da questão|marco da prova|foco|gabarito/i.test(text)) {
    const zones = extractMamaZones(text);
    const zone = zones.includes('active_screening') ? 'active_screening' : zones[0] ?? 'active_screening';
    return { label: mamaZoneShort(zone), focus: true, zone };
  }
  const zones = extractMamaZones(text);
  if (zones.length > 0) {
    return { label: mamaZoneShort(zones[0]), focus: false, zone: zones[0] };
  }
  if (/periodicidade|bienal|2 anos/i.test(text)) {
    return { label: '2a', focus: false, zone: 'active_screening' };
  }
  if (/inco|ms|inca/i.test(text)) {
    return { label: 'INCA', focus: false, zone: 'active_screening' };
  }
  return { label: '•', focus: false, zone: null };
}

export function inferMamaRowZones(label: string, value: string): MamaSpectrumZone[] {
  return extractMamaZones(`${label} ${value}`);
}

export function isMamaHotRow(
  label: string,
  value: string,
  emphasis?: string,
  badge?: string,
): boolean {
  if (badge === 'hot' || emphasis === 'highlight') return true;
  const text = `${label} ${value}`.toLowerCase();
  return /50 anos|bienal|2 anos|a cada 2|in[ií]cio.*rastreio|mamografia.*padr[aã]o/i.test(text);
}

export function isMamaWarnRow(
  label: string,
  value: string,
  emphasis?: string,
  badge?: string,
): boolean {
  if (badge === 'warn' || emphasis === 'alert') return true;
  const text = `${label} ${value}`.toLowerCase();
  return /40 anos|anual|pegadinha|autoexame.*substitui/i.test(text);
}

export function isMamaInfoRow(badge?: string): boolean {
  return badge === 'info' || badge === 'ok';
}

export function isMamaConclusionRow(label: string, value: string): boolean {
  const text = `${label} ${value}`.toLowerCase();
  return /gabarito|letra [a-e]|combinação|conclus/i.test(text);
}

export function inferMamaIconName(text: string): string {
  const lower = text.toLowerCase();
  if (/autoexame|palpa[cç][aã]o/i.test(lower)) return 'Hand';
  if (/mamografia|mama|rastreio/i.test(lower)) return 'Scan';
  if (/50|69|idade|anos/i.test(lower)) return 'Calendar';
  if (/inca|ms|diretriz/i.test(lower)) return 'FileText';
  return 'Ribbon';
}

/** Posição aproximada na régua 40–69 para highlight visual. */
export function mamaAgePosition(text: string): number | null {
  const lower = text.toLowerCase();
  if (/\b40\b/.test(lower)) return 40;
  if (/\b50\b|in[ií]cio/i.test(lower)) return 50;
  if (/\b69\b|t[eé]rmino/i.test(lower)) return 69;
  if (/50\s*(?:e|a)\s*69|50–69|50-69/.test(lower)) return 59;
  return null;
}

export function inferMamaTrapZones(
  label: string,
  detail: string,
  correct: string,
): {
  trapZones: MamaSpectrumZone[];
  correctZones: MamaSpectrumZone[];
  trapAge: number | null;
  correctAge: number | null;
  hasRail: boolean;
} {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();

  let trapZones = extractMamaZones(`${label} ${detail}`);
  let correctZones = extractMamaZones(correct);
  let trapAge = mamaAgePosition(`${label} ${detail}`);
  let correctAge = mamaAgePosition(correct);

  if (/\b40 anos\b|aos 40|in[ií]cio.*40/i.test(trapText)) {
    trapZones = ['trap_40'];
    trapAge = 40;
    correctZones = correctZones.length > 0 ? correctZones : ['active_screening'];
    correctAge = correctAge ?? 50;
  }
  if (/anual|todo ano/i.test(trapText)) {
    trapZones = trapZones.length > 0 ? trapZones : ['trap_annual'];
    correctZones = correctZones.length > 0 ? correctZones : ['active_screening'];
    correctAge = correctAge ?? 59;
  }
  if (/autoexame.*substitui|dispensa.*mamografia|s[oó] autoexame/i.test(trapText)) {
    trapZones = ['autoexame_substitute'];
    correctZones = correctZones.length > 0 ? correctZones : ['active_screening'];
    correctAge = correctAge ?? 50;
  }
  if (/antes de 50|menor de 50/i.test(trapText) && !/crit[eé]rio/i.test(correctText)) {
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

export function parseMulherMamaStep(step: string, index: number): ParsedMamaStep {
  const lower = step.toLowerCase();
  const zones = extractMamaZones(step);
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
