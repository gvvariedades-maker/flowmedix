import {
  formatWeeklySimuladoAlunoTitulo,
  weeklySimuladoAlunoTitulo,
  WEEKLY_SIMULADO_ALUNO_TITULO_PENDENTE,
} from '@/lib/simulado/weeklyDisplayTitle';

describe('weeklyDisplayTitle', () => {
  it('formata ordinal em português', () => {
    expect(formatWeeklySimuladoAlunoTitulo(1)).toBe('1º simulado semanal');
    expect(formatWeeklySimuladoAlunoTitulo(2)).toBe('2º simulado semanal');
    expect(formatWeeklySimuladoAlunoTitulo(12)).toBe('12º simulado semanal');
  });

  it('weeklySimuladoAlunoTitulo usa fallback sem ordinal', () => {
    expect(weeklySimuladoAlunoTitulo(null)).toBe(WEEKLY_SIMULADO_ALUNO_TITULO_PENDENTE);
    expect(weeklySimuladoAlunoTitulo(undefined)).toBe(WEEKLY_SIMULADO_ALUNO_TITULO_PENDENTE);
    expect(weeklySimuladoAlunoTitulo(3)).toBe('3º simulado semanal');
  });
});
