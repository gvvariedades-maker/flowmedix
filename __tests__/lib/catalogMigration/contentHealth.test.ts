import {
  aggregateReportsByPriority,
  evaluateContentHealth,
  evaluateContinuousHealth,
  findStaleP0Reports,
  reportMatchesSubtopico,
  type ErrorReportRow,
} from '@/lib/catalogMigration/contentHealth';

describe('reportMatchesSubtopico', () => {
  it('exclui report sem meta_subtopico (evita poluir todos os pacotes)', () => {
    expect(reportMatchesSubtopico(null, 'Segurança do Paciente')).toBe(false);
    expect(reportMatchesSubtopico(undefined, 'Segurança do Paciente')).toBe(false);
    expect(reportMatchesSubtopico('', 'Segurança do Paciente')).toBe(false);
  });

  it('casa subtópico canônico', () => {
    expect(reportMatchesSubtopico('Segurança do Paciente', 'Segurança do Paciente')).toBe(true);
    expect(reportMatchesSubtopico('Imunização', 'Segurança do Paciente')).toBe(false);
  });
});

describe('evaluateContentHealth', () => {
  const emptyOpen = aggregateReportsByPriority([]);

  it('PASS sem reportes abertos', () => {
    const health = evaluateContentHealth('CME', 50, emptyOpen);
    expect(health.pass).toBe(true);
    expect(health.blockers).toHaveLength(0);
  });

  it('FAIL com P0 aberto (ship gate)', () => {
    const open = aggregateReportsByPriority([
      {
        id: '1',
        modulo_slug: 'slug-a',
        priority: 'p0',
        status: 'novo',
        created_at: new Date().toISOString(),
      },
    ] as ErrorReportRow[]);

    const health = evaluateContentHealth('CME', 50, open, { open_p0: 0 });
    expect(health.pass).toBe(false);
    expect(health.blockers.some((b) => b.includes('P0 abertos'))).toBe(true);
  });

  it('warming — taxa alta não bloqueia com sessions < min', () => {
    const open = aggregateReportsByPriority(
      Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        modulo_slug: `slug-${i}`,
        priority: 'p2',
        status: 'novo',
        created_at: new Date().toISOString(),
      })) as ErrorReportRow[],
    );

    const health = evaluateContentHealth('CME', 10, open, {
      min_sessions_30d: 100,
      report_rate_max_pct: 2,
    });
    expect(health.pass).toBe(true);
  });

  it('FAIL taxa de reporte quando sessions >= min', () => {
    const open = aggregateReportsByPriority(
      Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        modulo_slug: `slug-${i}`,
        priority: 'p2',
        status: 'novo',
        created_at: new Date().toISOString(),
      })) as ErrorReportRow[],
    );

    const health = evaluateContentHealth('CME', 100, open, {
      min_sessions_30d: 100,
      report_rate_max_pct: 2,
    });
    expect(health.pass).toBe(false);
    expect(health.blockers.some((b) => b.includes('Taxa de reporte'))).toBe(true);
  });
});

describe('evaluateContinuousHealth vs ship', () => {
  it('P0 recente: ship FAIL, continuous alert sem block', () => {
    const reports: ErrorReportRow[] = [
      {
        id: '1',
        modulo_slug: 'slug-a',
        priority: 'p0',
        status: 'novo',
        created_at: new Date().toISOString(),
      },
    ];
    const open = aggregateReportsByPriority(reports);

    const ship = evaluateContentHealth('CME', 50, open, { open_p0: 0 });
    const continuous = evaluateContinuousHealth('CME', 50, open, { open_p0: 0 }, 0);

    expect(ship.pass).toBe(false);
    expect(continuous.should_block).toBe(false);
    expect(continuous.alerts.some((a) => a.includes('P0 abertos'))).toBe(true);
  });

  it('P0 stale → should_block', () => {
    const reports: ErrorReportRow[] = [
      {
        id: '1',
        modulo_slug: 'slug-a',
        priority: 'p0',
        status: 'triagem',
        created_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      },
    ];
    const stale = findStaleP0Reports(reports, 24);
    const open = aggregateReportsByPriority(reports);
    const continuous = evaluateContinuousHealth('CME', 50, open, { open_p0: 0 }, stale.length);

    expect(stale).toHaveLength(1);
    expect(continuous.should_block).toBe(true);
  });
});
