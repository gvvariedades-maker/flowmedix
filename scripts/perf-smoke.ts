#!/usr/bin/env tsx
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { attachHistoricoStats, filterModulosLikeVitrine } from '@/lib/vitrineFilters';
import { buildVitrineGroups } from '@/lib/vitrine/buildGroups';
import { generateSyntheticScaleDataset } from '@/lib/scale/syntheticDataset';
import { runAllEstudarPayloadScenarios } from '@/lib/estudar/perfSmokeScenarios';
import { runAllSimuladoPayloadScenarios } from '@/lib/simulado/perfSmokeScenarios';
import { E2E_SIMULADO_SESSION_ID, E2E_SIMULADO_SLUG } from '@/lib/e2e/constants';
import { mergeWithVercelProtectionHeaders } from '@/lib/perf/vercelProtection';
import {
  API_HEALTH_BUDGET_MS,
  assertApiHealthNotSilentlySkipped,
  isPerfSkipApiHealthEnabled,
  selectHttpScenarios,
} from '@/lib/perf/skipApiHealth';

type HttpScenario = {
  name: string;
  url: string;
  method?: 'GET' | 'POST';
  body?: string;
  expectedStatuses: number[];
  budgetMs: number;
  headers?: Record<string, string>;
};

type HttpScenarioResult = {
  name: string;
  p95Ms: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  totalRequests: number;
  failureCount: number;
};

type PayloadScenarioResult = {
  name: string;
  bytes: number;
  budgetBytes: number;
  failureCount: number;
};

type PerfBudgetBaseline = {
  scenarios?: Record<string, { p95Ms?: number; maxBytes?: number }>;
  synthetic_10k_pipeline?: { p95Ms: number };
};

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.max(0, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
}

function summarize(name: string, samples: number[], failureCount: number): HttpScenarioResult {
  const sorted = [...samples].sort((a, b) => a - b);
  const total = sorted.length;
  const sum = sorted.reduce((acc, n) => acc + n, 0);
  return {
    name,
    p95Ms: percentile(sorted, 95),
    avgMs: total ? sum / total : 0,
    minMs: total ? sorted[0] : 0,
    maxMs: total ? sorted[sorted.length - 1] : 0,
    totalRequests: total,
    failureCount,
  };
}

function readBudgetBaseline(pathFromEnv?: string): PerfBudgetBaseline | null {
  if (!pathFromEnv?.trim()) return null;
  const absolutePath = resolve(process.cwd(), pathFromEnv.trim());
  if (!existsSync(absolutePath)) {
    throw new Error(
      `PERF_BUDGET_BASELINE_FILE aponta para arquivo inexistente: ${pathFromEnv} (${absolutePath})`,
    );
  }
  const raw = readFileSync(absolutePath, 'utf8');
  try {
    return JSON.parse(raw) as PerfBudgetBaseline;
  } catch (error) {
    throw new Error(
      `Baseline de performance inválido (JSON): ${pathFromEnv}. ${
        error instanceof Error ? error.message : 'erro desconhecido'
      }`,
    );
  }
}

async function runHttpScenario(
  scenario: HttpScenario,
  durationMs: number,
  concurrency: number,
): Promise<HttpScenarioResult> {
  const latencies: number[] = [];
  let failureCount = 0;
  const deadline = Date.now() + durationMs;

  async function worker() {
    while (Date.now() < deadline) {
      const startedAt = Date.now();
      try {
        const response = await fetch(scenario.url, {
          method: scenario.method ?? 'GET',
          headers: mergeWithVercelProtectionHeaders(scenario.headers),
          body: scenario.body,
          cache: 'no-store',
        });
        latencies.push(Date.now() - startedAt);
        if (!scenario.expectedStatuses.includes(response.status)) {
          failureCount += 1;
        }
      } catch {
        latencies.push(Date.now() - startedAt);
        failureCount += 1;
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return summarize(scenario.name, latencies, failureCount);
}

function runSyntheticDatasetScenario(): HttpScenarioResult {
  const samples: number[] = [];
  for (let i = 0; i < 8; i += 1) {
    const startedAt = Date.now();
    const { modulos, historico } = generateSyntheticScaleDataset({ totalModulos: 10_000 });
    const withStats = attachHistoricoStats(modulos, historico);
    const filtered = filterModulosLikeVitrine(withStats, { q: 'q-synth-0' });
    const groups = buildVitrineGroups(filtered);
    if (groups.length === 0) {
      return summarize('synthetic_10k_pipeline', samples, 1);
    }
    samples.push(Date.now() - startedAt);
  }
  return summarize('synthetic_10k_pipeline', samples, 0);
}

async function main() {
  const baseUrl = process.env.PERF_BASE_URL || 'http://127.0.0.1:3000';
  const durationMs = Number(process.env.PERF_DURATION_MS || 30_000);
  const concurrency = Number(process.env.PERF_CONCURRENCY || 20);
  const metricsSecret = process.env.METRICS_SECRET;
  const budgetMultiplier = Number(process.env.PERF_BUDGET_MULTIPLIER || 1);
  const regressionTolerance = Number(process.env.PERF_REGRESSION_TOLERANCE || 0.2);
  const budgetBaselinePath = process.env.PERF_BUDGET_BASELINE_FILE;
  const reportOutputPath = process.env.PERF_REPORT_OUTPUT || 'artifacts/perf-smoke-report.json';
  const skipHttp = process.env.PERF_SKIP_HTTP === '1';
  const skipApiHealth = isPerfSkipApiHealthEnabled();
  const baseline = readBudgetBaseline(budgetBaselinePath);

  const simuladoSessionId = E2E_SIMULADO_SESSION_ID;

  const scenarios: HttpScenario[] = [
    {
      name: 'api_vitrine_unauth',
      url: `${baseUrl}/api/vitrine?page=1`,
      expectedStatuses: [401],
      budgetMs: 480,
    },
    {
      name: 'api_vitrine_q_unauth',
      url: `${baseUrl}/api/vitrine?page=1&q=feridas`,
      expectedStatuses: [401],
      budgetMs: 480,
    },
    {
      name: 'api_estudar_questao_unauth',
      url: `${baseUrl}/api/estudar/questao?slug=q-synth-00001`,
      expectedStatuses: [401],
      budgetMs: 480,
    },
    {
      name: 'api_health',
      url: `${baseUrl}/api/health`,
      expectedStatuses: [200, 503],
      budgetMs: API_HEALTH_BUDGET_MS,
    },
    {
      name: 'api_metrics',
      url: `${baseUrl}/api/metrics?type=performance`,
      expectedStatuses: [200],
      headers: metricsSecret ? { authorization: `Bearer ${metricsSecret}` } : undefined,
      budgetMs: 700,
    },
    {
      name: 'api_simulado_session_unauth',
      url: `${baseUrl}/api/simulado/sessions/${simuladoSessionId}`,
      expectedStatuses: [401],
      budgetMs: 480,
    },
    {
      name: 'api_simulado_questao_unauth',
      url: `${baseUrl}/api/simulado/questao?slug=${encodeURIComponent(E2E_SIMULADO_SLUG)}`,
      expectedStatuses: [401],
      budgetMs: 480,
    },
    {
      name: 'api_simulado_responder_unauth',
      url: `${baseUrl}/api/simulado/responder`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: simuladoSessionId,
        modulo_slug: E2E_SIMULADO_SLUG,
        opcao_id: 'A',
      }),
      expectedStatuses: [401],
      budgetMs: 480,
    },
  ];

  const { scenarios: httpScenarios, skippedScenarios } = selectHttpScenarios(scenarios);
  const results: HttpScenarioResult[] = [];
  if (!skipHttp) {
    for (const scenario of httpScenarios) {
      results.push(await runHttpScenario(scenario, durationMs, concurrency));
    }
  }
  results.push(runSyntheticDatasetScenario());

  const payloadResults: PayloadScenarioResult[] = [
    ...runAllSimuladoPayloadScenarios(),
    ...runAllEstudarPayloadScenarios(),
  ];

  const budgetFailures = results.filter((r) => {
    const baselineScenarioBudget = baseline?.scenarios?.[r.name]?.p95Ms;
    if (typeof baselineScenarioBudget === 'number' && Number.isFinite(baselineScenarioBudget)) {
      return r.p95Ms > baselineScenarioBudget * (1 + regressionTolerance);
    }
    if (r.name === 'synthetic_10k_pipeline') {
      const baselineSyntheticBudget = baseline?.synthetic_10k_pipeline?.p95Ms;
      if (typeof baselineSyntheticBudget === 'number' && Number.isFinite(baselineSyntheticBudget)) {
        return r.p95Ms > baselineSyntheticBudget * (1 + regressionTolerance);
      }
    }
    const scenario = scenarios.find((s) => s.name === r.name);
    if (!scenario) {
      return r.p95Ms > 1_500;
    }
    return r.p95Ms > scenario.budgetMs * budgetMultiplier;
  });
  const statusFailures = results.filter((r) => r.failureCount > 0);

  const payloadBudgetFailures = payloadResults.filter((r) => {
    const baselineMaxBytes = baseline?.scenarios?.[r.name]?.maxBytes;
    if (typeof baselineMaxBytes === 'number' && Number.isFinite(baselineMaxBytes)) {
      return r.bytes > baselineMaxBytes;
    }
    return r.failureCount > 0;
  });

  assertApiHealthNotSilentlySkipped({
    skipHttp,
    ranNames: results.map((r) => r.name),
    skippedScenarios,
  });

  const report = {
    baseUrl,
    skipHttp,
    skipApiHealth,
    skippedScenarios,
    vercelProtectionBypass: Boolean(process.env.VERCEL_PROTECTION_BYPASS?.trim()),
    durationMs,
    concurrency,
    budgetMultiplier,
    regressionTolerance,
    budgetBaselinePath: budgetBaselinePath || null,
    results,
    payloadResults,
    failedBudgets: budgetFailures.map((r) => r.name),
    failedPayloadBudgets: payloadBudgetFailures.map((r) => r.name),
    failedStatusChecks: statusFailures.map((r) => r.name),
  };

  console.log(JSON.stringify(report, null, 2));
  const absoluteReportPath = resolve(process.cwd(), reportOutputPath);
  mkdirSync(dirname(absoluteReportPath), { recursive: true });
  writeFileSync(absoluteReportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nSaved report: ${absoluteReportPath}`);

  if (
    budgetFailures.length > 0 ||
    statusFailures.length > 0 ||
    payloadBudgetFailures.length > 0
  ) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
