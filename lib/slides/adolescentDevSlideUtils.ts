/**
 * Inferência para moldes L3 — adolescente_desenvolvimento (puberdade / Tanner).
 */

export const ADOLESCENT_DEV_POSITIVE: RegExp[] = [
  /puberdade|tanner|menarca|espermarquia/i,
  /desenvolvimento\s+(das\s+)?mamas|broto\s+mam[aá]rio/i,
  /hipertrofia\s+(dos\s+)?test[ií]culos|volume\s+testicular/i,
  /atraso\s+(na\s+)?puberdade|puberdade\s+tardia|puberdade\s+precoce/i,
  /metamorfose\s+f[ií]sica|adolesc[eê]ncia/i,
];

export type AdolescentDevStepKind =
  | 'context'
  | 'girls'
  | 'boys'
  | 'mark'
  | 'fix'
  | 'step';

export function parseAdolescentDevStep(
  step: string,
  index: number,
): { kind: AdolescentDevStepKind; letter?: string; raw: string; index: number } {
  const raw = step.trim();
  if (/^comando\s*:/i.test(raw)) return { kind: 'context', raw, index };
  if (/^fixa[cç][aã]o\s*:|^em\s+similares\s*:/i.test(raw)) return { kind: 'fix', raw, index };
  if (/^marcar\b|^gabarito\b/i.test(raw)) {
    const letter = raw.match(/\b([A-E])\b/)?.[1]?.toUpperCase();
    return { kind: 'mark', letter, raw, index };
  }
  if (/^meninas\b/i.test(raw)) return { kind: 'girls', raw, index };
  if (/^meninos\b/i.test(raw)) return { kind: 'boys', raw, index };
  return { kind: 'step', raw, index };
}

export function cleanDevStepBody(raw: string): string {
  return raw
    .replace(/^comando:\s*/i, '')
    .replace(/^fixa[cç][aã]o:\s*/i, '')
    .replace(/^em similares:\s*/i, '')
    .replace(/^meninas:\s*/i, '')
    .replace(/^meninos:\s*/i, '')
    .replace(/^marcar\s+(letra\s+)?/i, '')
    .replace(/\s*→\s*/g, ' · ')
    .trim();
}

export function capitalizeFirst(text: string): string {
  const t = text.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}
