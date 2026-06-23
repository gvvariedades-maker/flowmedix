/** Título exibido ao aluno para simulados semanais (sem assunto nem semana ISO). */

export function formatWeeklyOrdinalSuffix(ordinal: number): string {
  if (!Number.isFinite(ordinal) || ordinal < 1) return '1º';
  return `${ordinal}º`;
}

export function formatWeeklySimuladoAlunoTitulo(ordinal: number): string {
  return `${formatWeeklyOrdinalSuffix(ordinal)} simulado semanal`;
}

/** Fallback quando a missão ainda não foi gerada (sem sessão no banco). */
export const WEEKLY_SIMULADO_ALUNO_TITULO_PENDENTE = 'Avaliação semanal';

export function weeklySimuladoAlunoTitulo(ordinal: number | null | undefined): string {
  if (ordinal != null && ordinal >= 1) {
    return formatWeeklySimuladoAlunoTitulo(ordinal);
  }
  return WEEKLY_SIMULADO_ALUNO_TITULO_PENDENTE;
}
