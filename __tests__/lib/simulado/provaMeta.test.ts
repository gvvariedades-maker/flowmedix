import {
  buildDefaultTitulo,
  buildRetryTitulo,
  computeTempoMetaSegundos,
  evaluateProvaTempoVsMeta,
  formatElapsedHms,
  formatTempoMetaTotal,
  ritmoToSecondsPerQuestion,
  secondsPerQuestionToRitmo,
  sessionDisplayTitulo,
} from '@/lib/simulado/provaMeta';

describe('lib/simulado/provaMeta', () => {
  it('ritmoToSecondsPerQuestion mapeia opções de ritmo', () => {
    expect(ritmoToSecondsPerQuestion('2min')).toBe(120);
    expect(ritmoToSecondsPerQuestion('3min')).toBe(180);
    expect(ritmoToSecondsPerQuestion('none')).toBeNull();
  });

  it('buildDefaultTitulo monta título com banca e quantidade', () => {
    const titulo = buildDefaultTitulo({
      bancas: ['IBFC'],
      quantidade: 40,
      modo: 'prova',
    });
    expect(titulo).toMatch(/^Prova · IBFC · 40 questões · /);
  });

  it('computeTempoMetaSegundos multiplica quantidade pelo ritmo', () => {
    expect(computeTempoMetaSegundos(20, 180)).toBe(3600);
    expect(computeTempoMetaSegundos(20, null)).toBeNull();
  });

  it('sessionDisplayTitulo usa fallback por modo', () => {
    expect(sessionDisplayTitulo('  Minha prova  ', 'prova')).toBe('Minha prova');
    expect(sessionDisplayTitulo('', 'prova')).toBe('Prova');
    expect(sessionDisplayTitulo('', 'treino')).toBe('Simulado · Treino');
  });

  it('sessionDisplayTitulo prioriza ordinal semanal para aluno', () => {
    expect(
      sessionDisplayTitulo('Simulado da Semana #24 - Farmacologia', 'prova', {
        weeklyOrdinal: 4,
      }),
    ).toBe('4º simulado semanal');
  });

  it('formatElapsedHms formata HH:MM:SS', () => {
    expect(formatElapsedHms(90_000)).toBe('00:01:30');
    expect(formatElapsedHms(3_661_000)).toBe('01:01:01');
    expect(formatElapsedHms(-1000)).toBe('00:00:00');
  });

  it('formatTempoMetaTotal calcula meta total da prova', () => {
    expect(formatTempoMetaTotal(20, 180)).toBe('01:00:00');
    expect(formatTempoMetaTotal(10, null)).toBeNull();
  });

  it('buildRetryTitulo incrementa tentativa', () => {
    expect(buildRetryTitulo('Prova IBFC')).toBe('Prova IBFC — tentativa 2');
    expect(buildRetryTitulo('Prova IBFC — tentativa 2')).toBe('Prova IBFC — tentativa 3');
  });

  it('secondsPerQuestionToRitmo mapeia segundos para enum', () => {
    expect(secondsPerQuestionToRitmo(120)).toBe('2min');
    expect(secondsPerQuestionToRitmo(180)).toBe('3min');
    expect(secondsPerQuestionToRitmo(null)).toBe('none');
  });

  it('evaluateProvaTempoVsMeta compara tempo total com meta', () => {
    const dentro = evaluateProvaTempoVsMeta(30 * 60_000, 10, 180);
    expect(dentro.status).toBe('within');
    expect(dentro.comparacaoLabel).toBe('Dentro da meta');

    const acima = evaluateProvaTempoVsMeta(90 * 60_000, 10, 180);
    expect(acima.status).toBe('above');
    expect(acima.comparacaoLabel).toMatch(/Acima da meta/);

    const semMeta = evaluateProvaTempoVsMeta(10 * 60_000, 10, null);
    expect(semMeta.status).toBe('no_meta');
  });
});
