export type QuestaoAlvoParsed =
  | { kind: 'numero'; value: number }
  | { kind: 'codigo'; value: number };

/**
 * Interpreta entrada do aluno no card: `847` (posição no assunto) ou `Q-1234` / `q1234`.
 */
export function parseQuestaoAlvo(raw: string): QuestaoAlvoParsed | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const codigoMatch = trimmed.match(/^q-?(\d+)$/i);
  if (codigoMatch) {
    const value = Number(codigoMatch[1]);
    return Number.isInteger(value) && value > 0 ? { kind: 'codigo', value } : null;
  }

  if (/^\d+$/.test(trimmed)) {
    const value = Number(trimmed);
    return Number.isInteger(value) && value > 0 ? { kind: 'numero', value } : null;
  }

  return null;
}
