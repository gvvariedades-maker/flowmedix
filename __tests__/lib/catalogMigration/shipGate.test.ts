import {
  buildShipBlockers,
  canPromoteToSell,
  canSell,
  checkL3VisualMold,
  isTechnicalReady,
  normalizeProductionStatus,
  type ShipAuditReport,
} from '@/lib/catalogMigration/shipGate';
import type { RegistryPacote } from '@/lib/catalogMigration/handcraftRegistry';

function passLayer(detail = 'OK'): ShipAuditReport['layers']['L1'] {
  return { pass: true, detail };
}

function failLayer(detail: string): ShipAuditReport['layers']['L1'] {
  return { pass: false, detail };
}

function allPassReport(): ShipAuditReport {
  const layers = {
    L1: passLayer(),
    L2: passLayer(),
    L2b: passLayer(),
    L3: passLayer('visual mold PASS'),
    L4: passLayer(),
    L5: passLayer('content health OK'),
    L6: passLayer(),
  };
  return {
    technical_ready: true,
    layers,
    content_health: { pass: true, blockers: [] },
    blockers: buildShipBlockers(layers, true, []),
  };
}

describe('normalizeProductionStatus', () => {
  it('normaliza bootstrap_monitoring para monitoring', () => {
    expect(normalizeProductionStatus('bootstrap_monitoring')).toBe('monitoring');
  });

  it('retorna none para status desconhecido', () => {
    expect(normalizeProductionStatus(undefined)).toBe('none');
    expect(normalizeProductionStatus('foo')).toBe('none');
  });
});

describe('canSell', () => {
  it('true apenas para production_ready', () => {
    expect(canSell({ production_status: 'production_ready' } as RegistryPacote)).toBe(true);
    expect(canSell({ production_status: 'none' } as RegistryPacote)).toBe(false);
    expect(canSell({ production_status: 'blocked' } as RegistryPacote)).toBe(false);
    expect(canSell({ production_status: 'monitoring' } as RegistryPacote)).toBe(false);
  });
});

describe('canPromoteToSell', () => {
  it('PASS quando L1–L6 + L5 OK', () => {
    const report = allPassReport();
    const result = canPromoteToSell(report);
    expect(result.ok).toBe(true);
    expect(result.blockers).toHaveLength(0);
  });

  it('FAIL se L6 pending', () => {
    const report = allPassReport();
    report.layers.L6 = failLayer('anchor pending: cme-g01');
    report.blockers = buildShipBlockers(report.layers, true, []);
    const result = canPromoteToSell(report);
    expect(result.ok).toBe(false);
    expect(result.blockers.some((b) => b.startsWith('L6:'))).toBe(true);
  });

  it('FAIL se alignment fail (L2)', () => {
    const report = allPassReport();
    report.technical_ready = false;
    report.layers.L2 = failLayer('3 slug(s) com alignment fail');
    report.blockers = buildShipBlockers(report.layers, true, []);
    const result = canPromoteToSell(report);
    expect(result.ok).toBe(false);
  });

  it('FAIL se P0 aberto (L5)', () => {
    const report = allPassReport();
    report.layers.L5 = failLayer('P0 abertos: 1 (máx 0)');
    report.content_health = { pass: false, blockers: ['P0 abertos: 1 (máx 0)'] };
    report.blockers = buildShipBlockers(report.layers, false, report.content_health.blockers);
    const result = canPromoteToSell(report);
    expect(result.ok).toBe(false);
    expect(result.blockers.some((b) => b.startsWith('L5:'))).toBe(true);
  });

  it('FAIL se L3 sem artifact', () => {
    const report = allPassReport();
    report.layers.L3 = failLayer('rodar visual-mold-regression');
    report.blockers = buildShipBlockers(report.layers, true, []);
    const result = canPromoteToSell(report);
    expect(result.ok).toBe(false);
  });
});

describe('checkL3VisualMold', () => {
  it('pass com summary.json válido', () => {
    const result = checkL3VisualMold('cme', { pass: true, pacote_prefix: 'cme' });
    expect(result.pass).toBe(true);
  });

  it('fail sem summary', () => {
    const result = checkL3VisualMold('cme', null);
    expect(result.pass).toBe(false);
  });
});

describe('isTechnicalReady', () => {
  it('exige L1+L2+L2b', () => {
    expect(
      isTechnicalReady({
        L1: passLayer(),
        L2: passLayer(),
        L2b: failLayer('numeric fail'),
      }),
    ).toBe(false);
    expect(
      isTechnicalReady({
        L1: passLayer(),
        L2: passLayer(),
        L2b: passLayer(),
      }),
    ).toBe(true);
  });
});
