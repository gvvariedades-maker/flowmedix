/** Utilitários compartilhados pelos moldes premium Saúde da Mulher — ramo mulher_parto. */

export const LABOR_PHASE_SLOTS = ['latencia', 'dilatacao', 'expulsivo', 'dequitacao'] as const;

export type LaborPhaseSlot = (typeof LABOR_PHASE_SLOTS)[number];

export type PartoStepKind =
  | 'judgement'
  | 'eliminate'
  | 'locate'
  | 'fixation'
  | 'anchor_phase'
  | 'step';

export interface ParsedPartoStep {
  kind: PartoStepKind;
  text: string;
  title: string;
  roman?: string;
  letter?: string;
  phases: LaborPhaseSlot[];
  judgement?: 'true' | 'false';
}

export function laborPhaseLabel(slot: LaborPhaseSlot): string {
  switch (slot) {
    case 'latencia':
      return 'Latência';
    case 'dilatacao':
      return 'Dilatação';
    case 'expulsivo':
      return 'Expulsivo';
    case 'dequitacao':
      return 'Dequitação';
    default:
      return slot;
  }
}

export function laborPhaseShort(slot: LaborPhaseSlot): string {
  switch (slot) {
    case 'latencia':
      return 'LAT';
    case 'dilatacao':
      return 'DIL';
    case 'expulsivo':
      return 'EXP';
    case 'dequitacao':
      return 'DEQ';
    default:
      return slot;
  }
}

function extractLaborPhases(text: string): LaborPhaseSlot[] {
  const lower = text.toLowerCase();
  const found = new Set<LaborPhaseSlot>();

  if (/lat[eê]ncia|fase latente|pr[eé]-parto latente/i.test(lower)) {
    found.add('latencia');
  }
  if (/dilata[cç][aã]o|fase ativa(?!.*expuls)|per[ií]odo de dilata/i.test(lower)) {
    found.add('dilatacao');
  }
  if (/expulsiv|fase expulsiva|trabalho de parto|parto humanizado|posi[cç][aã]o.*parto/i.test(lower)) {
    found.add('expulsivo');
  }
  if (/dequita[cç][aã]o|terceiro per[ií]odo|placenta|clampeamento|pós-parto imediato|pos-parto imediato/i.test(lower)) {
    found.add('dequitacao');
  }

  return LABOR_PHASE_SLOTS.filter((s) => found.has(s));
}

export function inferLaborPhaseMarker(
  title: string,
  description: string,
): { label: string; focus: boolean; phase: LaborPhaseSlot | null } {
  const text = `${title} ${description}`.toLowerCase();
  if (/marco da questão|marco da prova|foco|gabarito/i.test(text)) {
    const phases = extractLaborPhases(text);
    const phase = phases[0] ?? 'expulsivo';
    return { label: laborPhaseShort(phase), focus: true, phase };
  }
  const phases = extractLaborPhases(text);
  if (phases.length > 0) {
    return { label: laborPhaseShort(phases[0]), focus: false, phase: phases[0] };
  }
  if (/n[aã]o farmacol[oó]gic|m[eé]todo.*dor|água morna|agua morna/i.test(text)) {
    return { label: 'DIL', focus: false, phase: 'dilatacao' };
  }
  if (/acompanhante|humaniz/i.test(text)) {
    return { label: 'EXP', focus: false, phase: 'expulsivo' };
  }
  if (/clampeamento|cord[aã]o/i.test(text)) {
    return { label: 'DEQ', focus: false, phase: 'dequitacao' };
  }
  return { label: '•', focus: false, phase: null };
}

export function inferPartoRowPhases(label: string, value: string): LaborPhaseSlot[] {
  return extractLaborPhases(`${label} ${value}`);
}

export function isPartoHotRow(label: string, value: string, emphasis?: string, badge?: string): boolean {
  if (badge === 'hot' || emphasis === 'highlight') return true;
  const text = `${label} ${value}`.toLowerCase();
  return /n[aã]o farmacol[oó]gic|água morna|agua morna|clampeamento tardio|1\s*[-–]\s*3\s*min|movimenta/i.test(text);
}

export function isPartoWarnRow(label: string, value: string, emphasis?: string, badge?: string): boolean {
  if (badge === 'warn' || emphasis === 'alert') return true;
  const text = `${label} ${value}`.toLowerCase();
  return /supina|cont[ií]nuo universal|ctg.*todas|monitoriza[cç][aã]o.*cont[ií]nua.*todas/i.test(text);
}

export function isPartoOkRow(badge?: string): boolean {
  return badge === 'ok';
}

export function isPartoConclusionRow(label: string, value: string): boolean {
  const text = `${label} ${value}`.toLowerCase();
  return /gabarito|letra [a-e]|combinação|conclus/i.test(text);
}

export function inferPartoIconName(text: string): string {
  const lower = text.toLowerCase();
  if (/acompanhante|humaniz|direito/i.test(lower)) return 'Users';
  if (/água morna|agua morna|banho|imers/i.test(lower)) return 'Droplets';
  if (/posi[cç][aã]o|vertical|supina|lateral/i.test(lower)) return 'Move';
  if (/clampeamento|cord[aã]o|neonatal/i.test(lower)) return 'Baby';
  if (/monitoriza|fcf|card[ií]ac|ctg/i.test(lower)) return 'Activity';
  if (/fase|expulsiv|dilata/i.test(lower)) return 'HeartPulse';
  return 'Heart';
}

export function inferPartoTrapPhases(
  label: string,
  detail: string,
  correct: string,
): { trapPhases: LaborPhaseSlot[]; correctPhases: LaborPhaseSlot[]; hasRail: boolean } {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();

  let trapPhases = extractLaborPhases(`${label} ${detail}`);
  let correctPhases = extractLaborPhases(correct);

  if (/supina.*expulsiv|expulsiv.*supina|posi[cç][aã]o supina/i.test(trapText)) {
    trapPhases = ['expulsivo'];
    correctPhases = correctPhases.length > 0 ? correctPhases : ['expulsivo'];
  }
  if (/ctg.*cont[ií]nuo|monitoriza[cç][aã]o.*cont[ií]nua.*todas|fcf.*cont[ií]nua.*universal/i.test(trapText)) {
    trapPhases = trapPhases.length > 0 ? trapPhases : ['dilatacao'];
    correctPhases = correctPhases.length > 0 ? correctPhases : ['expulsivo'];
  }
  if (/clampeamento imediato|clampar imediatamente/i.test(trapText)) {
    trapPhases = ['dequitacao'];
    correctPhases = correctPhases.length > 0 ? correctPhases : ['dequitacao'];
  }
  if (/proibir.*água|proibir.*agua|banho.*proib/i.test(trapText)) {
    trapPhases = ['dilatacao'];
    correctPhases = correctPhases.length > 0 ? correctPhases : ['dilatacao'];
  }
  if (/vertical|lateral/i.test(correctText) && trapPhases.length === 0) {
    trapPhases = ['expulsivo'];
  }

  return {
    trapPhases,
    correctPhases,
    hasRail: trapPhases.length > 0 || correctPhases.length > 0,
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

export function parseMulherPartoStep(step: string, index: number): ParsedPartoStep {
  const lower = step.toLowerCase();
  const phases = extractLaborPhases(step);
  const roman = extractRoman(step);
  const letter = extractLetter(step);

  if (/fixa[cç][aã]o|decore|lembre/i.test(lower)) {
    return { kind: 'fixation', text: step, title: 'Fixação', phases };
  }
  if (letter && /letra|gabarito|marcar/i.test(lower)) {
    return { kind: 'locate', text: step, title: 'Gabarito', letter, phases };
  }
  if (/eliminar|testar letra|falsa|incorreta/i.test(lower)) {
    return { kind: 'eliminate', text: step, title: 'Eliminar', letter, roman, phases };
  }
  if (roman && /verdadeira|verdadeiro|correta|falsa|falso/i.test(lower)) {
    const judgement = /falsa|falso|incorret/i.test(lower) ? 'false' : 'true';
    return { kind: 'judgement', text: step, title: `Assertiva ${roman}`, roman, judgement, phases };
  }
  if (phases.length > 0 && index === 0) {
    return { kind: 'anchor_phase', text: step, title: 'Fase do parto', phases };
  }
  return { kind: 'step', text: step, title: `Passo ${index + 1}`, roman, letter, phases };
}
