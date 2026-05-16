import { getFreemiumDayBounds } from '@/lib/freemium';

/** Offset UTC−3 em ms (deve coincidir com lib/freemium.ts). */
const TZ_OFFSET_MS = 3 * 60 * 60 * 1000;

describe('getFreemiumDayBounds', () => {
  it('define meia-noite Brasília como início do dia civil', () => {
    // 2026-05-16 12:00 UTC = 09:00 em UTC−3 (mesmo dia civil)
    const now = new Date('2026-05-16T12:00:00.000Z');
    const { start, end, resetEm } = getFreemiumDayBounds(now);

    expect(start.toISOString()).toBe('2026-05-16T03:00:00.000Z');
    expect(end.toISOString()).toBe('2026-05-17T03:00:00.000Z');
    expect(resetEm.toISOString()).toBe(end.toISOString());
  });

  it('ainda conta como dia anterior pouco antes da meia-noite Brasília', () => {
    // 2026-05-16 02:59:59 UTC = 2026-05-15 23:59:59 UTC−3
    const now = new Date('2026-05-16T02:59:59.000Z');
    const { start, resetEm } = getFreemiumDayBounds(now);

    expect(start.toISOString()).toBe('2026-05-15T03:00:00.000Z');
    expect(resetEm.toISOString()).toBe('2026-05-16T03:00:00.000Z');
  });

  it('vira o dia civil exatamente na meia-noite Brasília', () => {
    const now = new Date('2026-05-16T03:00:00.000Z');
    const { start, resetEm } = getFreemiumDayBounds(now);

    expect(start.toISOString()).toBe('2026-05-16T03:00:00.000Z');
    expect(resetEm.toISOString()).toBe('2026-05-17T03:00:00.000Z');
  });

  it('end é exclusivo e coincide com resetEm', () => {
    const now = new Date('2026-01-01T15:00:00.000Z');
    const bounds = getFreemiumDayBounds(now);

    expect(bounds.end.getTime()).toBe(bounds.resetEm.getTime());
    expect(bounds.end.getTime() - bounds.start.getTime()).toBe(24 * 60 * 60 * 1000);
  });

  it('usa offset fixo UTC−3 sem depender do fuso do host', () => {
    const now = new Date('2026-07-04T06:30:00.000Z');
    const localMs = now.getTime() - TZ_OFFSET_MS;
    const local = new Date(localMs);
    const y = local.getUTCFullYear();
    const m = local.getUTCMonth();
    const d = local.getUTCDate();
    const expectedStart = new Date(Date.UTC(y, m, d) + TZ_OFFSET_MS);

    expect(getFreemiumDayBounds(now).start.toISOString()).toBe(expectedStart.toISOString());
  });
});
