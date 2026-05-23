import type { SupabaseClient } from '@supabase/supabase-js';
import { SCALE_HEALTH_RPC, SCALE_LIMITS } from '@/lib/scale/constants';

export type ScaleAlertLevel = 'ok' | 'warn' | 'critical';

export type ScaleAlert = {
  level: ScaleAlertLevel;
  code: string;
  message: string;
  value?: number;
  limit?: number;
};

export type ScaleJsonBytesMetrics = {
  avg: number;
  max: number;
  p95: number;
  total: number;
};

export type ScaleReverseSlidesMetrics = {
  avg: number;
  not_four_slides: number;
};

export type ScaleHealthDbMetrics = {
  generated_at: string;
  modulos_estudo_count: number;
  historico_questoes_count: number;
  json_bytes: ScaleJsonBytesMetrics;
  questions_over_100kb: number;
  assuntos_over_200_count: number;
  users_historico_over_5000: number;
  reverse_slides: ScaleReverseSlidesMetrics;
};

export type ScaleHealthReport = {
  metrics: ScaleHealthDbMetrics | null;
  alerts: ScaleAlert[];
  rpcAvailable: boolean;
  rpcError?: string;
  probe?: {
    url: string;
    status: number;
    durationMs: number;
  };
};

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function parseJsonBytes(raw: unknown): ScaleJsonBytesMetrics {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    avg: asNumber(o.avg),
    max: asNumber(o.max),
    p95: asNumber(o.p95),
    total: asNumber(o.total),
  };
}

function parseReverseSlides(raw: unknown): ScaleReverseSlidesMetrics {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    avg: asNumber(o.avg),
    not_four_slides: asNumber(o.not_four_slides),
  };
}

export function parseScaleHealthRpcPayload(data: unknown): ScaleHealthDbMetrics | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;

  return {
    generated_at: typeof o.generated_at === 'string' ? o.generated_at : new Date().toISOString(),
    modulos_estudo_count: asNumber(o.modulos_estudo_count),
    historico_questoes_count: asNumber(o.historico_questoes_count),
    json_bytes: parseJsonBytes(o.json_bytes),
    questions_over_100kb: asNumber(o.questions_over_100kb),
    assuntos_over_200_count: asNumber(o.assuntos_over_200_count),
    users_historico_over_5000: asNumber(o.users_historico_over_5000),
    reverse_slides: parseReverseSlides(o.reverse_slides),
  };
}

/**
 * Avalia métricas do banco contra tetos do produto (sem I/O).
 */
export function evaluateScaleAlerts(metrics: ScaleHealthDbMetrics): ScaleAlert[] {
  const alerts: ScaleAlert[] = [];
  const { VITRINE_MODULOS, VITRINE_WARN_RATIO, VITRINE_CRITICAL_RATIO } = SCALE_LIMITS;
  const count = metrics.modulos_estudo_count;

  const warnAt = Math.floor(VITRINE_MODULOS * VITRINE_WARN_RATIO);
  const criticalAt = Math.floor(VITRINE_MODULOS * VITRINE_CRITICAL_RATIO);

  if (count >= VITRINE_MODULOS) {
    alerts.push({
      level: 'critical',
      code: 'CATALOG_AT_VITRINE_CAP',
      message: `Catálogo no teto da vitrine (${VITRINE_MODULOS} módulos). Conteúdo novo pode ficar fora da lista cacheada.`,
      value: count,
      limit: VITRINE_MODULOS,
    });
  } else if (count >= criticalAt) {
    alerts.push({
      level: 'critical',
      code: 'CATALOG_NEAR_VITRINE_CAP',
      message: `Catálogo acima de ${Math.round(VITRINE_CRITICAL_RATIO * 100)}% do teto da vitrine.`,
      value: count,
      limit: VITRINE_MODULOS,
    });
  } else if (count >= warnAt) {
    alerts.push({
      level: 'warn',
      code: 'CATALOG_GROWING',
      message: `Catálogo acima de ${Math.round(VITRINE_WARN_RATIO * 100)}% do teto da vitrine (${VITRINE_MODULOS}).`,
      value: count,
      limit: VITRINE_MODULOS,
    });
  }

  if (metrics.assuntos_over_200_count > 0) {
    alerts.push({
      level: 'warn',
      code: 'ASSUNTOS_OVER_NAV_LIMIT',
      message: `${metrics.assuntos_over_200_count} assunto(s) com mais de ${SCALE_LIMITS.QUESTOES_POR_ASSUNTO} questões — navegação no player corta em 200.`,
      value: metrics.assuntos_over_200_count,
      limit: SCALE_LIMITS.QUESTOES_POR_ASSUNTO,
    });
  }

  const { p95, max: jsonMax } = metrics.json_bytes;
  if (jsonMax >= SCALE_LIMITS.JSON_MAX_CRITICAL_BYTES) {
    alerts.push({
      level: 'critical',
      code: 'JSON_PAYLOAD_VERY_HEAVY',
      message: `Maior conteudo_json ≈ ${formatKb(jsonMax)} — troca de questão e RSC ficam lentas.`,
      value: jsonMax,
      limit: SCALE_LIMITS.JSON_MAX_CRITICAL_BYTES,
    });
  } else if (jsonMax >= SCALE_LIMITS.JSON_MAX_WARN_BYTES) {
    alerts.push({
      level: 'warn',
      code: 'JSON_PAYLOAD_HEAVY',
      message: `Maior conteudo_json ≈ ${formatKb(jsonMax)}.`,
      value: jsonMax,
      limit: SCALE_LIMITS.JSON_MAX_WARN_BYTES,
    });
  }

  if (p95 >= SCALE_LIMITS.JSON_P95_WARN_BYTES) {
    alerts.push({
      level: 'warn',
      code: 'JSON_P95_HIGH',
      message: `P95 do tamanho de conteudo_json ≈ ${formatKb(p95)}.`,
      value: p95,
      limit: SCALE_LIMITS.JSON_P95_WARN_BYTES,
    });
  }

  if (metrics.questions_over_100kb > 0) {
    alerts.push({
      level: 'warn',
      code: 'QUESTIONS_OVER_100KB',
      message: `${metrics.questions_over_100kb} questão(ões) com JSON > 100 KB.`,
      value: metrics.questions_over_100kb,
    });
  }

  if (metrics.users_historico_over_5000 > 0) {
    alerts.push({
      level: 'warn',
      code: 'USERS_OVER_HISTORICO_CAP',
      message: `${metrics.users_historico_over_5000} usuário(s) com histórico > ${SCALE_LIMITS.HISTORICO_ANALYTICS_READ} — analytics/SRS podem truncar leituras.`,
      value: metrics.users_historico_over_5000,
      limit: SCALE_LIMITS.HISTORICO_ANALYTICS_READ,
    });
  }

  if (metrics.reverse_slides.not_four_slides > 0) {
    alerts.push({
      level: 'warn',
      code: 'SLIDES_NOT_FOUR',
      message: `${metrics.reverse_slides.not_four_slides} questão(ões) sem exatamente 4 slides de estudo reverso.`,
      value: metrics.reverse_slides.not_four_slides,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      level: 'ok',
      code: 'SCALE_OK',
      message: 'Nenhum teto crítico próximo nos agregados atuais.',
    });
  }

  return alerts;
}

function formatKb(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export async function fetchScaleHealthMetrics(
  supabase: SupabaseClient,
): Promise<{ metrics: ScaleHealthDbMetrics | null; rpcAvailable: boolean; rpcError?: string }> {
  const { data, error } = await supabase.rpc(SCALE_HEALTH_RPC);

  if (error) {
    const missing =
      error.message?.includes('Could not find the function') ||
      error.code === 'PGRST202' ||
      error.message?.includes('avant_scale_health_metrics');
    return {
      metrics: null,
      rpcAvailable: !missing,
      rpcError: missing
        ? 'RPC avant_scale_health_metrics ausente — rode supabase db push / migration 20260524100000.'
        : error.message,
    };
  }

  const metrics = parseScaleHealthRpcPayload(data);
  if (!metrics) {
    return { metrics: null, rpcAvailable: true, rpcError: 'Resposta RPC inválida' };
  }

  return { metrics, rpcAvailable: true };
}

export async function fetchFallbackModulosCount(
  supabase: SupabaseClient,
): Promise<number | null> {
  const { count, error } = await supabase
    .from('modulos_estudo')
    .select('id', { count: 'exact', head: true });

  if (error) return null;
  return count ?? 0;
}

export async function probeEstudarRoute(
  baseUrl: string,
  slug: string,
): Promise<ScaleHealthReport['probe']> {
  const url = `${baseUrl.replace(/\/$/, '')}/estudar/${encodeURIComponent(slug)}`;
  const start = Date.now();
  const res = await fetch(url, {
    method: 'GET',
    redirect: 'manual',
    headers: { Accept: 'text/html' },
  });
  return {
    url,
    status: res.status,
    durationMs: Date.now() - start,
  };
}

export async function fetchSampleModuloSlug(supabase: SupabaseClient): Promise<string | null> {
  const { data, error } = await supabase
    .from('modulos_estudo')
    .select('modulo_slug')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.modulo_slug) return null;
  return data.modulo_slug as string;
}

export async function runScaleHealthCheck(
  supabase: SupabaseClient,
  options?: { probeBaseUrl?: string },
): Promise<ScaleHealthReport> {
  const { metrics, rpcAvailable, rpcError } = await fetchScaleHealthMetrics(supabase);

  let effectiveMetrics = metrics;
  if (!effectiveMetrics && rpcError?.includes('ausente')) {
    const count = await fetchFallbackModulosCount(supabase);
    if (count !== null) {
      effectiveMetrics = {
        generated_at: new Date().toISOString(),
        modulos_estudo_count: count,
        historico_questoes_count: 0,
        json_bytes: { avg: 0, max: 0, p95: 0, total: 0 },
        questions_over_100kb: 0,
        assuntos_over_200_count: 0,
        users_historico_over_5000: 0,
        reverse_slides: { avg: 0, not_four_slides: 0 },
      };
    }
  }

  const alerts = effectiveMetrics ? evaluateScaleAlerts(effectiveMetrics) : [];

  if (!metrics && rpcError) {
    alerts.unshift({
      level: 'warn',
      code: 'RPC_UNAVAILABLE',
      message: rpcError,
    });
  }

  const report: ScaleHealthReport = {
    metrics: effectiveMetrics,
    alerts,
    rpcAvailable,
    rpcError,
  };

  if (options?.probeBaseUrl?.trim()) {
    const slug = await fetchSampleModuloSlug(supabase);
    if (slug) {
      try {
        report.probe = await probeEstudarRoute(options.probeBaseUrl.trim(), slug);
      } catch (e) {
        report.probe = {
          url: `${options.probeBaseUrl}/estudar/${slug}`,
          status: 0,
          durationMs: 0,
        };
        alerts.push({
          level: 'warn',
          code: 'PROBE_FAILED',
          message: e instanceof Error ? e.message : 'Falha no probe HTTP',
        });
      }
    }
  }

  return report;
}

export function formatScaleHealthReportTable(report: ScaleHealthReport): string {
  const lines: string[] = [];
  lines.push('');
  lines.push('📊 AVANT — Scale health check');
  lines.push('═'.repeat(56));

  if (report.metrics) {
    const m = report.metrics;
    lines.push('');
    lines.push('Banco de dados');
    lines.push('─'.repeat(56));
    lines.push(`  Gerado em (UTC):     ${m.generated_at}`);
    lines.push(`  modulos_estudo:      ${m.modulos_estudo_count} / ${SCALE_LIMITS.VITRINE_MODULOS} (vitrine)`);
    lines.push(`  historico_questoes:  ${m.historico_questoes_count.toLocaleString('pt-BR')}`);
    lines.push(`  JSON conteudo_json:`);
    lines.push(`    média ${formatKb(m.json_bytes.avg)} | P95 ${formatKb(m.json_bytes.p95)} | máx ${formatKb(m.json_bytes.max)}`);
    lines.push(`    soma  ${formatBytes(m.json_bytes.total)}`);
    lines.push(`  Questões > 100 KB:   ${m.questions_over_100kb}`);
    lines.push(`  Assuntos > 200 q:    ${m.assuntos_over_200_count}`);
    lines.push(`  Usuários hist. >5k:  ${m.users_historico_over_5000}`);
    lines.push(
      `  Slides (média / ≠4):   ${m.reverse_slides.avg} / ${m.reverse_slides.not_four_slides} questões`,
    );
  } else {
    lines.push('');
    lines.push('  Métricas completas indisponíveis (RPC).');
    if (report.rpcError) lines.push(`  ${report.rpcError}`);
  }

  if (report.probe) {
    lines.push('');
    lines.push('Probe HTTP (amostra — não é P95 de produção)');
    lines.push('─'.repeat(56));
    lines.push(`  ${report.probe.url}`);
    lines.push(`  status ${report.probe.status} | ${report.probe.durationMs} ms`);
  }

  lines.push('');
  lines.push('Alertas');
  lines.push('─'.repeat(56));
  for (const a of report.alerts) {
    const icon = a.level === 'critical' ? '🔴' : a.level === 'warn' ? '🟡' : '🟢';
    lines.push(`  ${icon} [${a.code}] ${a.message}`);
  }

  lines.push('');
  lines.push('Tetos de referência (código)');
  lines.push('─'.repeat(56));
  lines.push(`  Vitrine / acessível:  ${SCALE_LIMITS.VITRINE_MODULOS} módulos`);
  lines.push(`  Navegação por assunto: ${SCALE_LIMITS.QUESTOES_POR_ASSUNTO} slugs`);
  lines.push(`  Leitura analytics/SRS:  ${SCALE_LIMITS.HISTORICO_ANALYTICS_READ} linhas/usuário`);
  lines.push('');

  return lines.join('\n');
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024 * 1024) return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}
