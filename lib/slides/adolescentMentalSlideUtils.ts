/**
 * Inferência para moldes L3 — adolescente_saude_mental.
 */

export type AdolescentMentalStepKind =
  | 'context'
  | 'judge'
  | 'relation'
  | 'eliminate'
  | 'mark'
  | 'transfer'
  | 'step';

export const ADOLESCENT_MENTAL_POSITIVE: RegExp[] = [
  /anorexia|bulimia|transtorno\s+alimentar/i,
  /imagem\s+corporal|distor[cç][aã]o\s+corporal|medo\s+de\s+ganhar\s+peso/i,
  /purga[cç][aã]o|v[oô]mito\s+autoinduzido|hiperfagia|compuls[aã]o\s+alimentar/i,
  /asser[cç][aã]o\s+[IIVX]+|proposi[cç][aã]o\s+(verdadeira|falsa)/i,
  /risco\s+suicida|autoles[aã]o|depress[aã]o|ansiedade/i,
];

export function parseAdolescentMentalStep(
  step: string,
  index: number,
): { kind: AdolescentMentalStepKind; letter?: string; raw: string; index: number } {
  const raw = step.trim();
  if (/^comando\s*:/i.test(raw)) return { kind: 'context', raw, index };
  if (/^em\s+similares\s*:|^fix[aê]ncia|^fixa[cç][aã]o\s*:/i.test(raw)) {
    return { kind: 'transfer', raw, index };
  }
  if (/^marcar\b|^gabarito\b/i.test(raw)) {
    const letter = raw.match(/\b([A-E])\b/)?.[1]?.toUpperCase();
    return { kind: 'mark', letter, raw, index };
  }
  if (/^eliminar\b|→\s*elimina|\belimina\b/i.test(raw)) {
    return { kind: 'eliminate', raw, index };
  }
  if (/^rela[cç][aã]o\b|justifica/i.test(raw)) {
    return { kind: 'relation', raw, index };
  }
  if (/^julgar\b|asser[cç][aã]o\s+[IIVX]+/i.test(raw)) {
    const letter = raw.match(/\b([IIVX]+)\b/i)?.[1]?.toUpperCase();
    return { kind: 'judge', letter, raw, index };
  }
  return { kind: 'step', raw, index };
}

export function cleanMentalStepBody(raw: string): string {
  const mark = raw.match(/^marcar\s+(letra\s+)?([a-e])\b(?:\s*[—–\-:.]?\s*(.*))?$/i);
  if (mark) {
    const letter = mark[2]!.toUpperCase();
    const rest = (mark[3] ?? '').trim();
    return rest
      ? `Letra ${letter} — ${rest}`
      : `Letra ${letter} — ambas verdadeiras, sem justificativa correta`;
  }

  return raw
    .replace(/^comando:\s*/i, '')
    .replace(/^em similares:\s*/i, '')
    .replace(/^fixa[cç][aã]o:\s*/i, '')
    .replace(/^julgar\s+[IIVX]+\s*:\s*/i, '')
    .replace(/^rela[cç][aã]o:\s*/i, '')
    .replace(/^eliminar\s*/i, '')
    .replace(/\s*→\s*/g, ' · ')
    .trim();
}

/** Letras estilo XABCDE para trilho de passos. */
export const MENTAL_PROTOCOL_LETTERS = ['X', 'A', 'B', 'C', 'D', 'E'] as const;
