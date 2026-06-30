import {
  aggregateReportsByPriority,
  evaluateContinuousHealth,
  findStaleP0Reports,
  type ErrorReportRow,
} from '@/lib/catalogMigration/contentHealth';
import {
  applyContinuousAuditToRegistry,
  type ContinuousAuditReport,
} from '@/lib/catalogMigration/continuousQuality';
import {
  defaultQuality,
  type HandcraftRegistry,
} from '@/lib/catalogMigration/handcraftRegistry';

function openAgg(p0: number, p1 = 0) {
  return aggregateReportsByPriority([
    ...Array.from({ length: p0 }, (_, i) => ({
      id: `p0-${i}`,
      modulo_slug: 'slug-a',
      priority: 'p0',
      status: 'novo',
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    })),
    ...Array.from({ length: p1 }, (_, i) => ({
      id: `p1-${i}`,
      modulo_slug: 'slug-b',
      priority: 'p1',
      status: 'triagem',
      created_at: new Date().toISOString(),
    })),
  ] as ErrorReportRow[]);
}

describe('findStaleP0Reports', () => {
  it('P0 recente não entra em stale', () => {
    const reports: ErrorReportRow[] = [
      {
        id: '1',
        modulo_slug: 'x',
        priority: 'p0',
        status: 'novo',
        created_at: new Date().toISOString(),
      },
    ];
    expect(findStaleP0Reports(reports, 24)).toHaveLength(0);
  });

  it('P0 > 24h entra em stale', () => {
    const reports: ErrorReportRow[] = [
      {
        id: '1',
        modulo_slug: 'x',
        priority: 'p0',
        status: 'novo',
        created_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      },
    ];
    expect(findStaleP0Reports(reports, 24)).toHaveLength(1);
  });
});

describe('evaluateContinuousHealth', () => {
  it('P0 recente → alert, não block', () => {
    const open = aggregateReportsByPriority([
      {
        id: '1',
        modulo_slug: 'x',
        priority: 'p0',
        status: 'novo',
        created_at: new Date().toISOString(),
      },
    ] as ErrorReportRow[]);

    const health = evaluateContinuousHealth('CME', 50, open, {}, 0);
    expect(health.should_block).toBe(false);
    expect(health.alerts.some((a) => a.includes('P0 abertos'))).toBe(true);
  });

  it('P0 stale → should_block', () => {
    const open = openAgg(1);
    const health = evaluateContinuousHealth('CME', 50, open, {}, 1);
    expect(health.should_block).toBe(true);
    expect(health.stale_p0_count).toBe(1);
  });
});

describe('applyContinuousAuditToRegistry', () => {
  function baseRegistry(): HandcraftRegistry {
    return {
      version: 2,
      updated_at: '2026-06-29',
      pacotes: {
        CME: {
          pacote_prefix: 'cme',
          manifest: '',
          status: 'applied',
          total_slugs: 1,
          handcraft_applied: 1,
          production_status: 'production_ready',
          quality: defaultQuality(),
        },
      },
    };
  }

  function auditReport(overrides: Partial<ContinuousAuditReport>): ContinuousAuditReport {
    return {
      generated_at: new Date().toISOString(),
      subtopico: 'CME',
      pacote_prefix: 'cme',
      production_status: 'production_ready',
      pass: true,
      blocked: false,
      recovered: false,
      content_health: {
        subtopico: 'CME',
        sessions_30d: 10,
        open_reports: { p0: 0, p1: 0, p2: 0, p3: 0, total: 0 },
        report_rate_pct: 0,
        top_reported_slugs: [],
        slo: {
          open_p0: 0,
          open_p1: 0,
          open_p1_max: 2,
          report_rate_max_pct: 2,
          min_sessions_30d: 100,
          sessions_30d: 10,
          report_rate_pct: 0,
        },
        pass: true,
        blockers: [],
        should_block: false,
        alerts: [],
        repair_queue: [],
        stale_p0_count: 0,
      },
      ...overrides,
    };
  }

  it('streak incrementa em PASS', () => {
    const registry = baseRegistry();
    applyContinuousAuditToRegistry(registry, 'CME', auditReport({ pass: true }));
    expect(registry.pacotes.CME!.quality!.continuous!.health_streak_days).toBe(1);
  });

  it('streak reseta em FAIL', () => {
    const registry = baseRegistry();
    registry.pacotes.CME!.quality!.continuous!.health_streak_days = 5;
    applyContinuousAuditToRegistry(
      registry,
      'CME',
      auditReport({
        pass: false,
        content_health: {
          ...auditReport({}).content_health,
          pass: false,
          blockers: ['P1 alto'],
        },
      }),
    );
    expect(registry.pacotes.CME!.quality!.continuous!.health_streak_days).toBe(0);
  });

  it('blocked quando stale P0', () => {
    const registry = baseRegistry();
    applyContinuousAuditToRegistry(
      registry,
      'CME',
      auditReport({
        pass: false,
        blocked: true,
        content_health: {
          ...auditReport({}).content_health,
          pass: false,
          should_block: true,
          stale_p0_count: 2,
        },
      }),
    );
    expect(registry.pacotes.CME!.production_status).toBe('blocked');
    expect(registry.pacotes.CME!.quality!.continuous!.last_blocked_reason).toContain('P0 stale');
  });

  it('recover após health PASS quando blocked', () => {
    const registry = baseRegistry();
    registry.pacotes.CME!.production_status = 'blocked';
    applyContinuousAuditToRegistry(registry, 'CME', auditReport({ pass: true }), { recover: true });
    expect(registry.pacotes.CME!.production_status).toBe('production_ready');
    expect(registry.pacotes.CME!.quality!.continuous!.last_blocked_at).toBeNull();
  });

  it('recover ignorado quando não blocked', () => {
    const registry = baseRegistry();
    registry.pacotes.CME!.production_status = 'production_ready';
    applyContinuousAuditToRegistry(registry, 'CME', auditReport({ pass: true }), { recover: true });
    expect(registry.pacotes.CME!.production_status).toBe('production_ready');
  });

  it('não bloqueia pacote ainda não vendável', () => {
    const registry = baseRegistry();
    registry.pacotes.CME!.production_status = 'none';
    applyContinuousAuditToRegistry(
      registry,
      'CME',
      auditReport({
        pass: false,
        blocked: true,
        content_health: {
          ...auditReport({}).content_health,
          pass: false,
          should_block: true,
          stale_p0_count: 1,
        },
      }),
    );
    expect(registry.pacotes.CME!.production_status).toBe('none');
    expect(registry.pacotes.CME!.quality!.continuous!.last_blocked_at).toBeNull();
  });
});
