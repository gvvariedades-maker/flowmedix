/**
 * Rótulo "questão" / "questões" para contadores em UI.
 *
 * Use {@link phraseCountQuestoes} para "N questão(s)" e
 * {@link phraseQuestoesAgendadas} quando houver adjetivo concordante.
 *
 * Anti-padrão: não concatene sufixos ao radical (`questão` + `ões` → "questãoões").
 */
export function labelQuestoes(count: number): string {
  return Math.abs(count) === 1 ? 'questão' : 'questões';
}

/**
 * Frase completa com concordância do adjetivo: "N questão agendada" / "N questões agendadas".
 * Preferir em headers e resumos do Plano Diário.
 */
export function phraseQuestoesAgendadas(count: number): string {
  const noun = labelQuestoes(count);
  const adj = Math.abs(count) === 1 ? 'agendada' : 'agendadas';
  return `${count} ${noun} ${adj}`;
}

/**
 * Contador simples: "N questão" / "N questões".
 * Preferir em cards e totais sem adjetivo (ex.: admin).
 */
export function phraseCountQuestoes(count: number): string {
  return `${count} ${labelQuestoes(count)}`;
}
