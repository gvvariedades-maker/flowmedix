import {
  getIsoWeekInfo,
  getWeeklyFocoPrincipal,
  getWeeklyIsoWeek,
  isAdaptiveSimuladoKind,
  resolveSimuladoSessionKind,
} from '@/lib/simulado/sessionKind';

describe('resolveSimuladoSessionKind', () => {
  it('identifica sessão semanal por origem weekly', () => {
    expect(
      resolveSimuladoSessionKind({
        origem: 'weekly',
        iso_year: 2026,
        iso_week: 25,
        foco_principal: 'Farmacologia',
      }),
    ).toBe('weekly');
  });

  it('identifica sessão de diagnóstico por tipo', () => {
    expect(resolveSimuladoSessionKind({ tipo: 'diagnostico_inicial', modo: 'prova' })).toBe(
      'diagnostico',
    );
  });

  it('retorna livre para filtros genéricos', () => {
    expect(resolveSimuladoSessionKind({ modo: 'prova', bancas: ['IBFC'] })).toBe('livre');
    expect(resolveSimuladoSessionKind(null)).toBe('livre');
    expect(resolveSimuladoSessionKind(undefined)).toBe('livre');
  });
});

describe('isAdaptiveSimuladoKind', () => {
  it('considera weekly e diagnostico adaptativos', () => {
    expect(isAdaptiveSimuladoKind('weekly')).toBe(true);
    expect(isAdaptiveSimuladoKind('diagnostico')).toBe(true);
    expect(isAdaptiveSimuladoKind('livre')).toBe(false);
  });
});

describe('getWeeklyFocoPrincipal', () => {
  it('extrai foco principal quando presente', () => {
    expect(getWeeklyFocoPrincipal({ foco_principal: '  Urgências  ' })).toBe('Urgências');
  });

  it('retorna null para valor ausente ou vazio', () => {
    expect(getWeeklyFocoPrincipal({ foco_principal: '   ' })).toBeNull();
    expect(getWeeklyFocoPrincipal({})).toBeNull();
    expect(getWeeklyFocoPrincipal(null)).toBeNull();
  });
});

describe('getWeeklyIsoWeek', () => {
  it('extrai iso_week de sessão semanal', () => {
    expect(getWeeklyIsoWeek({ origem: 'weekly', iso_week: 12 })).toBe(12);
  });

  it('retorna null fora de sessão semanal ou com valor inválido', () => {
    expect(getWeeklyIsoWeek({ modo: 'prova' })).toBeNull();
    expect(getWeeklyIsoWeek({ origem: 'weekly', iso_week: 'x' })).toBeNull();
  });
});

describe('getIsoWeekInfo re-export', () => {
  it('expõe helper de semana ISO', () => {
    const info = getIsoWeekInfo(new Date('2026-06-18T12:00:00'));
    expect(info.isoYear).toBe(2026);
    expect(info.isoWeek).toBeGreaterThanOrEqual(1);
    expect(info.weekEndsAt.getTime()).toBeGreaterThan(info.weekStart.getTime());
  });
});
