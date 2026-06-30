import {
  applyShipPromote,
  applyTechnicalReadyOnly,
  defaultQuality,
  type HandcraftRegistry,
  type RegistryPacote,
} from '@/lib/catalogMigration/handcraftRegistry';
import { buildShipBlockers, type ShipAuditReport } from '@/lib/catalogMigration/shipGate';

function passLayer(detail = 'OK') {
  return { pass: true, detail };
}

function allPassReport(): ShipAuditReport {
  const layers = {
    L1: passLayer(),
    L2: passLayer(),
    L3: passLayer('visual mold PASS'),
    L4: passLayer(),
    L5: passLayer('content health OK'),
    L6: passLayer(),
    L2b: passLayer(),
  };
  return {
    technical_ready: true,
    layers,
    content_health: { pass: true, blockers: [] },
    blockers: buildShipBlockers(layers, true, []),
  };
}

function partialReport(): ShipAuditReport {
  const layers = {
    L1: passLayer(),
    L2: passLayer(),
    L2b: passLayer(),
    L3: { pass: false, detail: 'visual mold FAIL' },
    L4: passLayer(),
    L5: passLayer(),
    L6: { pass: false, detail: 'anchor pending: cme-g01' },
  };
  return {
    technical_ready: true,
    layers,
    content_health: { pass: true, blockers: [] },
    blockers: buildShipBlockers(layers, true, []),
  };
}

function mockRegistry(pacote: Partial<RegistryPacote>): HandcraftRegistry {
  return {
    version: 2,
    updated_at: '2026-06-29',
    pacotes: {
      'Enfermagem em Central de Material e Esterilização (CME)': {
        pacote_prefix: 'cme',
        manifest: 'data/catalog-migration/cme-completo/manifest.json',
        status: 'applied',
        total_slugs: 35,
        handcraft_applied: 35,
        production_status: 'none',
        quality: defaultQuality(),
        ...pacote,
      } as RegistryPacote,
    },
  };
}

describe('applyShipPromote', () => {
  it('grava production_ready, layers e continuous.enabled', () => {
    const registry = mockRegistry({});
    const key = 'Enfermagem em Central de Material e Esterilização (CME)';
    const report = allPassReport();

    applyShipPromote(registry, key, report);

    const pacote = registry.pacotes[key]!;
    expect(pacote.production_status).toBe('production_ready');
    expect(pacote.quality?.production_ready_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(pacote.quality?.technical_ready_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(pacote.quality?.layers).toEqual({
      L1: true,
      L2: true,
      L2b: true,
      L3: true,
      L4: true,
      L5: true,
      L6: true,
    });
    expect(pacote.quality?.continuous?.enabled).toBe(true);
    expect(pacote.quality?.continuous?.last_audit_pass).toBe(true);
    expect(pacote.quality?.continuous?.last_audit_at).toBeTruthy();
  });

  it('preserva technical_ready_at existente', () => {
    const registry = mockRegistry({
      quality: {
        ...defaultQuality(),
        technical_ready_at: '2026-01-01',
      },
    });
    const key = 'Enfermagem em Central de Material e Esterilização (CME)';

    applyShipPromote(registry, key, allPassReport());

    expect(registry.pacotes[key]!.quality?.technical_ready_at).toBe('2026-01-01');
  });
});

describe('applyTechnicalReadyOnly', () => {
  it('grava technical_ready_at sem promover', () => {
    const registry = mockRegistry({});
    const key = 'Enfermagem em Central de Material e Esterilização (CME)';

    applyTechnicalReadyOnly(registry, key, partialReport());

    const pacote = registry.pacotes[key]!;
    expect(pacote.production_status).toBe('none');
    expect(pacote.quality?.technical_ready_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(pacote.quality?.production_ready_at).toBeNull();
    expect(pacote.quality?.layers.L3).toBe(false);
    expect(pacote.quality?.continuous?.enabled).toBe(false);
  });

  it('não altera production_ready existente', () => {
    const registry = mockRegistry({ production_status: 'production_ready' });
    const key = 'Enfermagem em Central de Material e Esterilização (CME)';

    applyTechnicalReadyOnly(registry, key, partialReport());

    expect(registry.pacotes[key]!.production_status).toBe('production_ready');
  });
});
