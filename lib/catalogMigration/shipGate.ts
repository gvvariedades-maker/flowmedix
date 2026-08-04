/**
 * Ship gate — promote inicial = venda (L1–L6, sem bootstrap calendário).
 */
import type { PacoteQuality, QualityLayers, RegistryPacote } from '@/lib/catalogMigration/handcraftRegistry';

export type ProductionStatus =
  | 'none'
  | 'monitoring'
  | 'production_ready'
  | 'blocked';

export type LayerResult = { pass: boolean; detail: string };

export type ShipAuditReport = {
  technical_ready: boolean;
  layers: {
    L1: LayerResult;
    L2: LayerResult;
    L2b: LayerResult;
    /** F4 — nota pedagógica (detector unificado + leitor cego). */
    L2c: LayerResult;
    L3: LayerResult;
    L4: LayerResult;
    L5: LayerResult;
    L6: LayerResult;
  };
  content_health: { pass: boolean; blockers: string[] };
  blockers: string[];
};

export function normalizeProductionStatus(status?: string): ProductionStatus {
  if (status === 'bootstrap_monitoring') return 'monitoring';
  if (
    status === 'monitoring' ||
    status === 'production_ready' ||
    status === 'blocked'
  ) {
    return status;
  }
  return 'none';
}

export function canSell(pacote: RegistryPacote): boolean {
  return normalizeProductionStatus(pacote.production_status) === 'production_ready';
}

export function canPromoteToSell(report: ShipAuditReport): { ok: boolean; blockers: string[] } {
  const blockers = [...report.blockers];

  if (!report.technical_ready) {
    if (!blockers.some((b) => b.startsWith('L1:') || b.startsWith('L2:') || b.startsWith('L2b:'))) {
      blockers.push('technical_ready: L1+L2+L2b obrigatórios');
    }
  }
  if (!report.layers.L2c.pass && !blockers.some((b) => b.startsWith('L2c:'))) {
    blockers.push(`L2c: ${report.layers.L2c.detail}`);
  }
  if (!report.layers.L6.pass && !blockers.some((b) => b.startsWith('L6:'))) {
    blockers.push(`L6: ${report.layers.L6.detail}`);
  }
  if (!report.layers.L5.pass && !blockers.some((b) => b.startsWith('L5:'))) {
    blockers.push(`L5: ${report.layers.L5.detail}`);
  }
  if (!report.layers.L3.pass && !blockers.some((b) => b.startsWith('L3:'))) {
    blockers.push(`L3: ${report.layers.L3.detail}`);
  }

  return { ok: blockers.length === 0, blockers };
}

export function layersFromReport(report: ShipAuditReport): QualityLayers {
  return {
    L1: report.layers.L1.pass,
    L2: report.layers.L2.pass,
    L2b: report.layers.L2b.pass,
    L2c: report.layers.L2c.pass,
    L3: report.layers.L3.pass,
    L4: report.layers.L4.pass,
    L5: report.layers.L5.pass,
    L6: report.layers.L6.pass,
  };
}

export function buildShipBlockers(
  layers: ShipAuditReport['layers'],
  contentHealthPass: boolean,
  contentHealthBlockers: string[],
): string[] {
  const blockers: string[] = [];
  if (!layers.L1.pass) blockers.push(`L1: ${layers.L1.detail}`);
  if (!layers.L2.pass) blockers.push(`L2: ${layers.L2.detail}`);
  if (!layers.L2b.pass) blockers.push(`L2b: ${layers.L2b.detail}`);
  if (!layers.L2c.pass) blockers.push(`L2c: ${layers.L2c.detail}`);
  if (!layers.L6.pass) blockers.push(`L6: ${layers.L6.detail}`);
  if (!layers.L5.pass) {
    blockers.push(
      contentHealthBlockers.length > 0
        ? `L5: ${contentHealthBlockers.join('; ')}`
        : `L5: ${layers.L5.detail}`,
    );
  }
  if (!layers.L3.pass) blockers.push(`L3: ${layers.L3.detail}`);
  return blockers;
}

export function isTechnicalReady(layers: Pick<ShipAuditReport['layers'], 'L1' | 'L2' | 'L2b'>): boolean {
  return layers.L1.pass && layers.L2.pass && layers.L2b.pass;
}

export type VisualMoldSummary = {
  pass?: boolean;
  pacote_prefix?: string;
  detail?: string;
};

export function checkL3VisualMold(
  pacotePrefix: string,
  summary: VisualMoldSummary | null,
  options?: { skipL3?: boolean },
): LayerResult {
  if (options?.skipL3) {
    return { pass: true, detail: 'L3 skipped (--skip-l3)' };
  }
  if (!summary) {
    return {
      pass: false,
      detail: 'rodar visual-mold-regression (artifacts/visual-mold-regression/summary.json ausente)',
    };
  }
  if (summary.pacote_prefix && summary.pacote_prefix !== pacotePrefix) {
    return {
      pass: false,
      detail: `summary.json pacote_prefix=${summary.pacote_prefix} ≠ ${pacotePrefix}`,
    };
  }
  if (summary.pass === true) {
    return { pass: true, detail: summary.detail ?? 'visual mold regression PASS' };
  }
  return {
    pass: false,
    detail: summary.detail ?? 'visual mold regression FAIL',
  };
}
