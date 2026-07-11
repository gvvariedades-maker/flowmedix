/** Utilitários compartilhados pelos moldes premium Saúde da Mulher — ramo mulher_planejamento. */

export const PLANEJAMENTO_METHOD_ZONES = [
  'behavioral',
  'hormonal',
  'barrier',
  'larc',
  'trap_oral',
] as const;

export type PlanejamentoMethodZone = (typeof PLANEJAMENTO_METHOD_ZONES)[number];

export type PlanejamentoStepKind =
  | 'judgement'
  | 'eliminate'
  | 'locate'
  | 'fixation'
  | 'anchor_category'
  | 'step';

export interface ParsedPlanejamentoStep {
  kind: PlanejamentoStepKind;
  text: string;
  title: string;
  roman?: string;
  letter?: string;
  zones: PlanejamentoMethodZone[];
  judgement?: 'true' | 'false';
}

export function planejamentoZoneLabel(zone: PlanejamentoMethodZone): string {
  switch (zone) {
    case 'behavioral':
      return 'Comportamental';
    case 'hormonal':
      return 'Hormonal';
    case 'barrier':
      return 'Barreira';
    case 'larc':
      return 'LARC';
    case 'trap_oral':
      return 'Oral ≠ comp.';
    default:
      return zone;
  }
}

export function planejamentoZoneShort(zone: PlanejamentoMethodZone): string {
  switch (zone) {
    case 'behavioral':
      return 'Comp.';
    case 'hormonal':
      return 'Horm.';
    case 'barrier':
      return 'Barr.';
    case 'larc':
      return 'LARC';
    case 'trap_oral':
      return 'Oral?';
    default:
      return zone;
  }
}

function extractPlanejamentoZones(text: string): PlanejamentoMethodZone[] {
  const lower = text.toLowerCase();
  const found = new Set<PlanejamentoMethodZone>();

  if (
    /comportamental|tabelinha|temperatura basal|billings|muco cervical|coito interrompido|observa[cç][aã]o do ciclo/i.test(
      lower,
    )
  ) {
    found.add('behavioral');
  }
  if (/anticoncepcional oral|p[ií]lula|combinado|progestag[eê]nio|hormonal/i.test(lower)) {
    if (/comportamental|n[aã]o [eé] comportamental|≠|não entra/i.test(lower)) {
      found.add('trap_oral');
    } else {
      found.add('hormonal');
    }
  }
  if (/preservativo|diafragma|barreira|camisinha/i.test(lower)) {
    found.add('barrier');
  }
  if (/diu|implante|larc|dispositivo intrauterino/i.test(lower)) {
    found.add('larc');
  }
  if (/oral.*comportamental|comportamental.*oral|p[ií]lula.*tabelinha/i.test(lower)) {
    found.add('trap_oral');
  }

  return PLANEJAMENTO_METHOD_ZONES.filter((z) => found.has(z));
}

export function inferPlanejamentoZoneMarker(
  title: string,
  description: string,
): { label: string; focus: boolean; zone: PlanejamentoMethodZone | null } {
  const text = `${title} ${description}`.toLowerCase();
  if (/marco|comando|pegadinha|foco/i.test(text)) {
    const zones = extractPlanejamentoZones(text);
    const zone = zones.includes('trap_oral') ? 'trap_oral' : zones[0] ?? 'behavioral';
    return { label: planejamentoZoneShort(zone), focus: true, zone };
  }
  const zones = extractPlanejamentoZones(text);
  if (zones.length > 0) {
    return { label: planejamentoZoneShort(zones[0]), focus: false, zone: zones[0] };
  }
  return { label: 'PF', focus: false, zone: null };
}

export function inferPlanejamentoRowZones(label: string, value: string): PlanejamentoMethodZone[] {
  return extractPlanejamentoZones(`${label} ${value}`);
}

export function isPlanejamentoHotRow(
  label: string,
  value: string,
  emphasis?: string,
  badge?: string,
): boolean {
  if (badge === 'hot' || emphasis === 'highlight') return true;
  const text = `${label} ${value}`.toLowerCase();
  return /comportamental|larc|diu|implante/i.test(text);
}

export function isPlanejamentoWarnRow(
  label: string,
  value: string,
  emphasis?: string,
  badge?: string,
): boolean {
  if (badge === 'warn' || emphasis === 'alert') return true;
  const text = `${label} ${value}`.toLowerCase();
  return /oral|pegadinha|hormonal/i.test(text);
}

export function isPlanejamentoConclusionRow(label: string, value: string): boolean {
  const text = `${label} ${value}`.toLowerCase();
  return /gabarito|letra [a-e]|combinação|conclus/i.test(text);
}

export function inferPlanejamentoIconName(text: string): string {
  const lower = text.toLowerCase();
  if (/tabelinha|temperatura|muco|coito/i.test(lower)) return 'ListChecks';
  if (/oral|p[ií]lula|hormonal/i.test(lower)) return 'Microscope';
  if (/diu|implante|larc/i.test(lower)) return 'Shield';
  if (/preservativo|barreira/i.test(lower)) return 'ShieldCheck';
  return 'Heart';
}

export function inferPlanejamentoTrapZones(
  label: string,
  detail: string,
  correct: string,
): {
  trapZones: PlanejamentoMethodZone[];
  correctZones: PlanejamentoMethodZone[];
  hasRail: boolean;
} {
  const trapText = `${label} ${detail}`.toLowerCase();
  let trapZones = extractPlanejamentoZones(`${label} ${detail}`);
  let correctZones = extractPlanejamentoZones(correct);

  if (/oral|p[ií]lula|anticoncepcional oral/i.test(trapText) && /comportamental|i,/i.test(trapText)) {
    trapZones = ['trap_oral'];
    correctZones = correctZones.length > 0 ? correctZones : ['behavioral'];
  }
  if (/s[oó] coito|iv e v/i.test(trapText)) {
    trapZones = trapZones.length > 0 ? trapZones : ['behavioral'];
    correctZones = correctZones.length > 0 ? correctZones : ['behavioral'];
  }

  return {
    trapZones,
    correctZones,
    hasRail: trapZones.length > 0 || correctZones.length > 0,
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

export function parseMulherPlanejamentoStep(step: string, index: number): ParsedPlanejamentoStep {
  const lower = step.toLowerCase();
  const zones = extractPlanejamentoZones(step);
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
  if (roman && /verdadeira|verdadeiro|correta|falsa|falso|julgar/i.test(lower)) {
    const judgement = /falsa|falso|incorret/i.test(lower) ? 'false' : 'true';
    return { kind: 'judgement', text: step, title: `Assertiva ${roman}`, roman, judgement, zones };
  }
  if (/identificar formato|julgar cada/i.test(lower)) {
    return { kind: 'anchor_category', text: step, title: 'Categorias', zones };
  }
  return { kind: 'step', text: step, title: `Passo ${index + 1}`, roman, letter, zones };
}
