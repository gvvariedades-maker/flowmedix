/**
 * Helpers para handcraft-registry.json — status de qualidade vendável.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { invalidateVitrineQualityGateCache } from '@/lib/catalogMigration/vitrineQualityGate';
import type { ShipAuditReport } from '@/lib/catalogMigration/shipGate';
import { layersFromReport, normalizeProductionStatus } from '@/lib/catalogMigration/shipGate';

export type QualityLayers = {
  L1: boolean;
  L2: boolean;
  L2b: boolean;
  /** F4 — nota pedagógica. Opcional: pacotes promovidos antes do gate não têm o campo. */
  L2c?: boolean;
  L3: boolean;
  L4: boolean;
  L5: boolean;
  L6: boolean;
};

export type ContinuousQuality = {
  enabled: boolean;
  last_audit_at: string | null;
  last_audit_pass: boolean | null;
  health_streak_days: number;
  last_blocked_at: string | null;
  last_blocked_reason: string | null;
};

export type PacoteQuality = {
  technical_ready_at: string | null;
  production_ready_at: string | null;
  /** @deprecated Legado — não gate de venda pós híbrido quality */
  monitoring_until: string | null;
  layers: QualityLayers;
  continuous?: ContinuousQuality;
  slo: {
    open_p0: number;
    open_p1_max: number;
    report_rate_max_pct: number;
    min_sessions_30d: number;
    p0_block_after_hours?: number;
  };
};

export type ProductionStatus =
  | 'none'
  | 'monitoring'
  | 'bootstrap_monitoring'
  | 'production_ready'
  | 'blocked';

/** Política de auto-aprovação por risco — @see docs/DECISAO_AUTO_APROVACAO_RISCO.md */
export type AutoApprovalConfig = {
  enabled: boolean;
  /** Maior tier que o agente pode auto-aprovar. */
  default_max_tier_auto?: 'baixo' | 'medio' | 'alto';
  sample_rate?: { baixo: number; medio: number };
  /** report_rate acima disso → rebaixa confiança / kill-switch. */
  downgrade_on_report_rate_pct?: number;
  last_calibrated_at?: string | null;
};

export type TaxonomyStatus = 'open' | 'closed' | 'catch_all_provisional';
export type CatchAllMode = 'A' | 'B';

/** Gate de taxonomia antes do 1º lote — @see docs/TAXONOMIA_MODEL.md §6 */
export type PacoteTaxonomy = {
  status: TaxonomyStatus;
  catch_all_mode?: CatchAllMode | null;
  closed_at?: string | null;
  audit_artifact?: string | null;
  closed_artifact?: string | null;
  mismatch_count_at_close?: number | null;
  notes?: string | null;
};

export type RegistryPacote = {
  pacote_prefix: string;
  manifest: string;
  status: string;
  total_slugs: number;
  handcraft_applied: number;
  production_status?: ProductionStatus;
  quality?: PacoteQuality;
  taxonomy?: PacoteTaxonomy;
  /** Kill-switch: default false até histórico limpo. */
  auto_approval?: AutoApprovalConfig;
};

export type HandcraftRegistry = {
  version: number;
  updated_at: string;
  pacotes: Record<string, RegistryPacote>;
};

const REGISTRY_PATH = resolve(process.cwd(), 'data/catalog-migration/handcraft-registry.json');

export function loadHandcraftRegistry(): HandcraftRegistry {
  if (!existsSync(REGISTRY_PATH)) {
    throw new Error(`Registry não encontrado: ${REGISTRY_PATH}`);
  }
  return JSON.parse(readFileSync(REGISTRY_PATH, 'utf8')) as HandcraftRegistry;
}

export function saveHandcraftRegistry(registry: HandcraftRegistry): void {
  registry.updated_at = new Date().toISOString().slice(0, 10);
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n', 'utf8');
}

export function findPacoteBySubtopico(
  registry: HandcraftRegistry,
  subtopico: string,
): { key: string; pacote: RegistryPacote } | null {
  const key = Object.keys(registry.pacotes).find(
    (k) => k.toLowerCase() === subtopico.toLowerCase(),
  );
  if (!key) return null;
  return { key, pacote: registry.pacotes[key]! };
}

export function listLotesForPacote(pacotePrefix: string): string[] {
  const root = resolve(process.cwd(), 'data/catalog-migration');
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter((name) => name.startsWith(`${pacotePrefix}-g`) && !name.includes('completo'))
    .sort();
}

export function defaultContinuousQuality(): ContinuousQuality {
  return {
    enabled: false,
    last_audit_at: null,
    last_audit_pass: null,
    health_streak_days: 0,
    last_blocked_at: null,
    last_blocked_reason: null,
  };
}

export function defaultQuality(): PacoteQuality {
  return {
    technical_ready_at: null,
    production_ready_at: null,
    monitoring_until: null,
    layers: { L1: false, L2: false, L2b: false, L2c: false, L3: false, L4: false, L5: false, L6: false },
    continuous: defaultContinuousQuality(),
    slo: {
      open_p0: 0,
      open_p1_max: 2,
      report_rate_max_pct: 2,
      min_sessions_30d: 100,
      p0_block_after_hours: 24,
    },
  };
}

/** @deprecated Legado pré-venda bootstrap — não usado no ship gate híbrido */
export function monitoringComplete(monitoringUntil: string | null): boolean {
  if (!monitoringUntil) return false;
  return new Date(monitoringUntil).getTime() <= Date.now();
}

/** @deprecated Legado pré-venda bootstrap */
export function addMonitoringDays(days = 14): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function listProductionReadyPacotes(
  registry: HandcraftRegistry,
): Array<{ key: string; pacote: RegistryPacote }> {
  return Object.entries(registry.pacotes)
    .filter(([, p]) => {
      const status = normalizeProductionStatus(p.production_status);
      return status === 'production_ready' || status === 'blocked';
    })
    .map(([key, pacote]) => ({ key, pacote }));
}

export function applyShipPromote(
  registry: HandcraftRegistry,
  key: string,
  report: ShipAuditReport,
): void {
  const pacote = registry.pacotes[key];
  if (!pacote) throw new Error(`Pacote não encontrado: ${key}`);

  const today = new Date().toISOString().slice(0, 10);
  const quality = pacote.quality ?? defaultQuality();
  quality.layers = layersFromReport(report);
  quality.technical_ready_at = quality.technical_ready_at ?? today;
  quality.production_ready_at = today;
  quality.continuous = {
    ...(quality.continuous ?? defaultContinuousQuality()),
    enabled: true,
    last_audit_pass: true,
    last_audit_at: new Date().toISOString(),
  };

  pacote.quality = quality;
  pacote.production_status = 'production_ready';
  registry.pacotes[key] = pacote;
  invalidateVitrineQualityGateCache();
}

export function applyTechnicalReadyOnly(
  registry: HandcraftRegistry,
  key: string,
  report: ShipAuditReport,
): void {
  const pacote = registry.pacotes[key];
  if (!pacote) throw new Error(`Pacote não encontrado: ${key}`);

  const today = new Date().toISOString().slice(0, 10);
  const quality = pacote.quality ?? defaultQuality();
  quality.layers = layersFromReport(report);
  if (report.technical_ready && !quality.technical_ready_at) {
    quality.technical_ready_at = today;
  }

  pacote.quality = quality;
  if (normalizeProductionStatus(pacote.production_status) === 'none') {
    pacote.production_status = 'none';
  }
  registry.pacotes[key] = pacote;
}

export { normalizeProductionStatus };
