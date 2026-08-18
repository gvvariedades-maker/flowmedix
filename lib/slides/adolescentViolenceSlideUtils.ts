/**
 * Inferência para moldes L3 — adolescente_violencia_protecao.
 */

export type AdolescentViolenceStepKind =
  | 'context'
  | 'eliminate'
  | 'keep'
  | 'mark'
  | 'transfer'
  | 'step';

export const ADOLESCENT_VIOLENCE_POSITIVE: RegExp[] = [
  /viol[eê]ncia\s+sexual|viol[eê]ncia\s+contra/i,
  /notifica[cç][aã]o\s+compuls[oó]ria|agravo\s+compuls/i,
  /rede\s+de\s+prote[cç][aã]o|conselho\s+tutelar|creas|\bsinan\b/i,
  /revitimiza|indicadores.*viol/i,
];

export function parseAdolescentViolenceStep(
  step: string,
  index: number,
): { kind: AdolescentViolenceStepKind; letter?: string; raw: string; index: number } {
  const raw = step.trim();
  const lower = raw.toLowerCase();

  if (/^comando\s*:/i.test(raw) || /^leia\s*:/i.test(raw)) {
    return { kind: 'context', raw, index };
  }
  if (/^em\s+similares\s*:/i.test(raw) || /^transfer/i.test(raw)) {
    return { kind: 'transfer', raw, index };
  }
  if (/^marcar\s+[a-e]\b/i.test(raw) || /^gabarito\s*:/i.test(raw)) {
    const markLetter = raw.match(/marcar\s+([a-e])\b/i)?.[1]?.toUpperCase();
    return { kind: 'mark', letter: markLetter, raw, index };
  }

  const letterMatch = raw.match(/^([A-E])\s*[:.)]\s*/i);
  const letter = letterMatch?.[1]?.toUpperCase();

  if (/→\s*mant[eé]m|mant[eé]m\s*\(|\bmant[eé]m\b/i.test(lower) && letter) {
    return { kind: 'keep', letter, raw, index };
  }
  if (/→\s*elimina|\belimina\b/i.test(lower) && letter) {
    return { kind: 'eliminate', letter, raw, index };
  }
  if (letter && /correta|principal\s+espa[cç]o|resid[eê]ncia/.test(lower)) {
    return { kind: 'keep', letter, raw, index };
  }
  if (letter) {
    return { kind: 'eliminate', letter, raw, index };
  }

  return { kind: 'step', raw, index };
}

export function cleanViolenceStepBody(raw: string): string {
  return raw
    .replace(/^comando:\s*/i, '')
    .replace(/^em similares:\s*/i, '')
    .replace(/^([A-E])\s*[:.)]\s*/i, '')
    .replace(/\s*[→\-–—]\s*(mantém|mantem|elimina)\.?\s*$/i, '')
    .replace(/\s*→\s*/g, ' · ')
    .replace(/^marcar\s+[a-e]\.?\s*/i, 'Gabarito · ')
    .trim();
}
