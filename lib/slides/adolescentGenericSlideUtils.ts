/**
 * Inferência para moldes L3 — adolescente_generico (EXCETO/MS/promoção/cauda).
 */

export const ADOLESCENT_GENERIC_POSITIVE: RegExp[] = [
  /adolescente|adolesc[eê]ncia/i,
  /escuta\s+qualificada|autonomia\s+progressiva|privacidade/i,
  /gravidez\s+na\s+adolesc|pr[eé]-?natal|contracep/i,
  /sigilo|diretrizes?\s+ms|exceto|promo[cç][aã]o|sa[uú]de\s+bucal/i,
];

export type AdolescentGenericStepKind =
  | 'judge'
  | 'mark'
  | 'fix'
  | 'step';

export function parseAdolescentGenericStep(
  step: string,
  index: number,
): { kind: AdolescentGenericStepKind; letter?: string; raw: string; index: number } {
  const raw = step.trim();
  if (/^fixa[cç][aã]o\s*:|^em\s+similares\s*:/i.test(raw)) return { kind: 'fix', raw, index };
  if (/^letra\s+[a-e]\b|^marcar\b|^gabarito\b/i.test(raw)) {
    const letter = raw.match(/\b([A-E])\b/)?.[1]?.toUpperCase();
    return { kind: 'mark', letter, raw, index };
  }
  if (/^[IVX]+\s*:/i.test(raw) || /^julgar\b/i.test(raw)) return { kind: 'judge', raw, index };
  return { kind: 'step', raw, index };
}

export function cleanGenericStepBody(raw: string): string {
  return raw
    .replace(/^fixa[cç][aã]o:\s*/i, '')
    .replace(/^em similares:\s*/i, '')
    .replace(/^letra\s+([a-e])\b\.?\s*/i, '')
    .replace(/^marcar\s+(letra\s+)?/i, '')
    .replace(/^([IVX]+)\s*:\s*/i, '')
    .replace(/\s*→\s*/g, ' · ')
    .trim();
}

export function capitalizeFirst(text: string): string {
  const t = text.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}
