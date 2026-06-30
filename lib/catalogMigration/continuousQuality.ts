/**
 * Loop contínuo pós-venda — health audit, block/recover.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  aggregateReportsByPriority,
  evaluateContinuousHealth,
  fetchOpenReportsDetailed,
  fetchSessions30dBySubtopico,
  findStaleP0Reports,
  type ContinuousContentHealth,
} from '@/lib/catalogMigration/contentHealth';
import {
  defaultContinuousQuality,
  defaultQuality,
  type HandcraftRegistry,
  type RegistryPacote,
} from '@/lib/catalogMigration/handcraftRegistry';
import { normalizeProductionStatus } from '@/lib/catalogMigration/shipGate';
import { invalidateVitrineQualityGateCache } from '@/lib/catalogMigration/vitrineQualityGate';

export type ContinuousAuditReport = {
  generated_at: string;
  subtopico: string;
  pacote_prefix: string;
  production_status: string;
  content_health: ContinuousContentHealth;
  pass: boolean;
  blocked: boolean;
  recovered: boolean;
};

export async function runContinuousAudit(
  subtopico: string,
  pacote: RegistryPacote,
  supabase: SupabaseClient,
): Promise<ContinuousAuditReport> {
  const slo = pacote.quality?.slo;
  const p0BlockHours = slo?.p0_block_after_hours ?? 24;

  const [sessions30d, detailed] = await Promise.all([
    fetchSessions30dBySubtopico(supabase, subtopico),
    fetchOpenReportsDetailed(supabase, subtopico),
  ]);

  const open = aggregateReportsByPriority(detailed);
  const staleP0 = findStaleP0Reports(detailed, p0BlockHours);
  const content_health = evaluateContinuousHealth(
    subtopico,
    sessions30d,
    open,
    slo,
    staleP0.length,
  );

  const pass = content_health.pass && !content_health.should_block;
  const status = normalizeProductionStatus(pacote.production_status);

  return {
    generated_at: new Date().toISOString(),
    subtopico,
    pacote_prefix: pacote.pacote_prefix,
    production_status: status,
    content_health,
    pass,
    blocked: content_health.should_block,
    recovered: false,
  };
}

export type ApplyContinuousOptions = {
  recover?: boolean;
};

export function applyContinuousAuditToRegistry(
  registry: HandcraftRegistry,
  key: string,
  report: ContinuousAuditReport,
  options: ApplyContinuousOptions = {},
): void {
  const pacote = registry.pacotes[key];
  if (!pacote) throw new Error(`Pacote não encontrado: ${key}`);

  const quality = pacote.quality ?? defaultQuality();
  const continuous = quality.continuous ?? defaultContinuousQuality();
  const nowIso = new Date().toISOString();
  const today = nowIso.slice(0, 10);
  const status = normalizeProductionStatus(pacote.production_status);
  const vendavelOuBlocked = status === 'production_ready' || status === 'blocked';

  continuous.enabled = true;
  continuous.last_audit_at = nowIso;
  continuous.last_audit_pass = report.pass;

  if (report.pass) {
    continuous.health_streak_days = (continuous.health_streak_days ?? 0) + 1;
  } else {
    continuous.health_streak_days = 0;
  }

  if (report.blocked && vendavelOuBlocked) {
    pacote.production_status = 'blocked';
    continuous.last_blocked_at = today;
    continuous.last_blocked_reason =
      report.content_health.stale_p0_count > 0
        ? `P0 stale > ${quality.slo.p0_block_after_hours ?? 24}h (${report.content_health.stale_p0_count})`
        : report.content_health.blockers.join('; ') || 'health audit FAIL';
  } else if (options.recover && report.pass && status === 'blocked') {
    pacote.production_status = 'production_ready';
    continuous.last_blocked_at = null;
    continuous.last_blocked_reason = null;
    report.recovered = true;
  }

  quality.continuous = continuous;
  quality.layers.L5 = report.content_health.pass;
  pacote.quality = quality;
  registry.pacotes[key] = pacote;

  if (report.blocked || options.recover) {
    invalidateVitrineQualityGateCache();
  }
}
