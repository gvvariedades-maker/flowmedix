import {
  eachDesempenhoDayKey,
  getDesempenhoPeriodRange,
  isWithinDesempenhoPeriod,
  shiftDesempenhoYmdMonths,
  toDesempenhoDayKey,
} from '@/lib/desempenho/periodo';

/** 2026-08-11 12:00 em Brasília (UTC−3). */
const NOW = new Date('2026-08-11T15:00:00.000Z');

describe('getDesempenhoPeriodRange', () => {
  it('7 dias cobre 7 datas civis (hoje + 6), não 8', () => {
    const range = getDesempenhoPeriodRange('7d', NOW);
    expect(range.startYmd).toBe('2026-08-05');
    expect(range.endYmdInclusive).toBe('2026-08-11');
    expect(range.civilDays).toBe(7);
    expect(eachDesempenhoDayKey(range)).toHaveLength(7);
  });

  it('usa intervalo semiaberto terminando no dia seguinte a hoje', () => {
    const range = getDesempenhoPeriodRange('7d', NOW);
    // 00:00 de 12/08 em Brasília = 03:00Z
    expect(range.endExclusive.toISOString()).toBe('2026-08-12T03:00:00.000Z');
    // 00:00 de 05/08 em Brasília = 03:00Z
    expect(range.start?.toISOString()).toBe('2026-08-05T03:00:00.000Z');
  });

  it('30d e 90d cobrem 30 e 90 datas civis', () => {
    expect(getDesempenhoPeriodRange('30d', NOW).civilDays).toBe(30);
    expect(getDesempenhoPeriodRange('30d', NOW).startYmd).toBe('2026-07-13');
    expect(getDesempenhoPeriodRange('90d', NOW).civilDays).toBe(90);
  });

  it('12m volta ao mesmo dia civil 12 meses atrás', () => {
    const range = getDesempenhoPeriodRange('12m', NOW);
    expect(range.startYmd).toBe('2025-08-11');
    expect(range.endYmdInclusive).toBe('2026-08-11');
  });

  it('all não tem limite inferior, mas exclui o futuro', () => {
    const range = getDesempenhoPeriodRange('all', NOW);
    expect(range.start).toBeNull();
    expect(range.startYmd).toBeNull();
    expect(range.civilDays).toBeNull();
    expect(isWithinDesempenhoPeriod('2019-01-01T00:00:00.000Z', range)).toBe(true);
    expect(isWithinDesempenhoPeriod('2026-08-13T00:00:00.000Z', range)).toBe(false);
  });
});

describe('isWithinDesempenhoPeriod — fronteira da meia-noite de Brasília', () => {
  const range = getDesempenhoPeriodRange('7d', NOW);

  it('inclui evento às 00:00 do primeiro dia civil (03:00Z)', () => {
    expect(isWithinDesempenhoPeriod('2026-08-05T03:00:00.000Z', range)).toBe(true);
  });

  it('exclui evento 1 minuto antes da meia-noite de Brasília do primeiro dia', () => {
    expect(isWithinDesempenhoPeriod('2026-08-05T02:59:00.000Z', range)).toBe(false);
  });

  it('inclui evento 23:59 do último dia (02:59Z do dia seguinte)', () => {
    expect(isWithinDesempenhoPeriod('2026-08-12T02:59:00.000Z', range)).toBe(true);
  });

  it('exclui evento já na madrugada seguinte em Brasília', () => {
    expect(isWithinDesempenhoPeriod('2026-08-12T03:00:00.000Z', range)).toBe(false);
  });

  it('ISO inválido fica fora', () => {
    expect(isWithinDesempenhoPeriod('não-é-data', range)).toBe(false);
  });
});

describe('toDesempenhoDayKey', () => {
  it('usa data civil de Brasília, não UTC', () => {
    // 01:00Z de 12/08 ainda é 11/08 22:00 em Brasília
    expect(toDesempenhoDayKey('2026-08-12T01:00:00.000Z')).toBe('2026-08-11');
    expect(toDesempenhoDayKey('2026-08-12T03:00:00.000Z')).toBe('2026-08-12');
  });

  it('cai no fallback quando o ISO é inválido', () => {
    expect(toDesempenhoDayKey('quebrado', NOW)).toBe('2026-08-11');
  });
});

describe('shiftDesempenhoYmdMonths', () => {
  it('faz clamp de fim de mês', () => {
    expect(shiftDesempenhoYmdMonths('2026-03-31', -1)).toBe('2026-02-28');
    expect(shiftDesempenhoYmdMonths('2026-01-31', 1)).toBe('2026-02-28');
  });

  it('atravessa o ano', () => {
    expect(shiftDesempenhoYmdMonths('2026-08-11', -12)).toBe('2025-08-11');
  });
});
