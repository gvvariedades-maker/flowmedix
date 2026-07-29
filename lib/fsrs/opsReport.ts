/**
 * FSRS MVP R5 — métricas ops + critérios go/no-go (provisórios).
 * Pure: sem I/O nem Supabase. Spec: DECISAO_REVISAO_FSRS_MVP.md §15 · PLANO §6.
 */

export type FsrsOpsReportMode = 'live' | 'dry-run';

export type FsrsOpsMetrics = {
  cards: number;
  logs: number;
  good: number;
  again: number;
  sameStemFallback: number;
  /** Telemetria de fila (logger); null se ainda não agregável via SQL. */
  inventoryMissing: number | null;
  /** Reviews com scheduled_days ≥ 7 e rating=good / total nesse filtro. */
  goodRateIntervalGe7d: number | null;
  /** n do filtro scheduled_days ≥ 7. */
  intervalGe7dSample: number;
  /** Acerto D+7 — null até query por unidade (evolução). */
  accuracyD7: number | null;
  accuracyD7Sample: number;
  /** Acerto D+14 — null até query por unidade (evolução). */
  accuracyD14: number | null;
  accuracyD14Sample: number;
  /** Lapses (rating=again) / usuários distintos / dias da janela. */
  lapsesPerUserDay: number | null;
  /** Cards due agora / limite diário (FSRS_DAILY_REVIEW_LIMIT agregado). */
  dueLoadRatio: number | null;
  dueNow: number;
  sameStemRate: number | null;
  inventoryMissingRate: number | null;
};

export type GoNoGoStatus = 'pass' | 'fail' | 'unknown';

export type GoNoGoCriterion = {
  id: string;
  criterion: string;
  provisional: string;
  status: GoNoGoStatus;
};

/** Contadores zerados para `--dry-run` (sem credenciais). */
export function zeroFsrsOpsMetrics(): FsrsOpsMetrics {
  return {
    cards: 0,
    logs: 0,
    good: 0,
    again: 0,
    sameStemFallback: 0,
    inventoryMissing: 0,
    goodRateIntervalGe7d: null,
    intervalGe7dSample: 0,
    accuracyD7: null,
    accuracyD7Sample: 0,
    accuracyD14: null,
    accuracyD14Sample: 0,
    lapsesPerUserDay: null,
    dueLoadRatio: null,
    dueNow: 0,
    sameStemRate: null,
    inventoryMissingRate: null,
  };
}

function rateStatus(
  rate: number | null,
  sample: number,
  minSample: number,
  pass: (r: number) => boolean,
): GoNoGoStatus {
  if (rate == null || sample === 0) return 'unknown';
  if (sample < minSample) return 'fail';
  return pass(rate) ? 'pass' : 'fail';
}

/**
 * Critérios numéricos provisórios (default-on exige decisão humana além destes).
 * Barra alinhada a PLANO §6.3 + ADR §15.
 */
export function evaluateFsrsGoNoGo(metrics: FsrsOpsMetrics): GoNoGoCriterion[] {
  const sameStemRate =
    metrics.sameStemRate ??
    (metrics.logs > 0 ? metrics.sameStemFallback / metrics.logs : null);
  const inventoryRate =
    metrics.inventoryMissingRate ??
    (metrics.inventoryMissing != null && metrics.logs > 0
      ? metrics.inventoryMissing / metrics.logs
      : null);

  return [
    {
      id: 'volume',
      criterion: 'Volume mínimo de logs (≥ 50 reviews elegíveis)',
      provisional: '≥ 50 spaced_review_logs',
      status:
        metrics.logs >= 50 ? 'pass' : metrics.logs > 0 ? 'fail' : 'unknown',
    },
    {
      id: 'retention_good_ge7d',
      criterion: 'Retenção Good (intervalo ≥ 7d)',
      provisional: 'Good rate ∈ [0.70, 0.95] com n≥50 (scheduled_days ≥ 7)',
      status: rateStatus(
        metrics.goodRateIntervalGe7d,
        metrics.intervalGe7dSample,
        50,
        (r) => r >= 0.7 && r <= 0.95,
      ),
    },
    {
      id: 'accuracy_d7',
      criterion: 'Acerto D+7 (1ª tentativa elegível pós-due ≥ 7d)',
      provisional: '≥ 0.65 com n≥30',
      status: rateStatus(
        metrics.accuracyD7,
        metrics.accuracyD7Sample,
        30,
        (r) => r >= 0.65,
      ),
    },
    {
      id: 'accuracy_d14',
      criterion: 'Acerto D+14 (1ª tentativa elegível pós-due ≥ 14d)',
      provisional: '≥ 0.55 com n≥20',
      status: rateStatus(
        metrics.accuracyD14,
        metrics.accuracyD14Sample,
        20,
        (r) => r >= 0.55,
      ),
    },
    {
      id: 'lapses_per_user_day',
      criterion: 'Lapses / usuário / dia',
      provisional: '< 3.0 (rating=again na janela)',
      status:
        metrics.lapsesPerUserDay == null
          ? 'unknown'
          : metrics.lapsesPerUserDay < 3
            ? 'pass'
            : 'fail',
    },
    {
      id: 'due_load',
      criterion: 'Carga due (due agora / limite diário agregado)',
      provisional: 'ratio ≤ 1.5 (monitorar fila beta)',
      status:
        metrics.dueLoadRatio == null
          ? 'unknown'
          : metrics.dueLoadRatio <= 1.5
            ? 'pass'
            : 'fail',
    },
    {
      id: 'same_stem_fallback',
      criterion: 'Taxa same_stem_fallback',
      provisional: '< 40% com n≥50',
      status: rateStatus(sameStemRate, metrics.logs, 50, (r) => r < 0.4),
    },
    {
      id: 'inventory_missing',
      criterion: 'Taxa inventory_missing (telemetria de fila)',
      provisional: '< 10% com n≥50 (agregar logger até view SQL)',
      status: rateStatus(inventoryRate, metrics.logs, 50, (r) => r < 0.1),
    },
    {
      id: 'default_on',
      criterion: 'Default-on global',
      provisional: 'Exige decisão humana após critérios acima — fora deste script',
      status: 'unknown',
    },
  ];
}

function fmtRate(value: number | null): string {
  return value == null ? 'n/a' : value.toFixed(3);
}

function fmtCount(value: number | null): string {
  return value == null ? 'n/a' : String(value);
}

export function renderFsrsOpsReportMarkdown(input: {
  generatedAt: Date;
  metrics: FsrsOpsMetrics;
  mode: FsrsOpsReportMode;
  criteria?: GoNoGoCriterion[];
}): string {
  const { generatedAt, metrics, mode } = input;
  const criteria = input.criteria ?? evaluateFsrsGoNoGo(metrics);
  const sameStemRate =
    metrics.sameStemRate ??
    (metrics.logs > 0 ? metrics.sameStemFallback / metrics.logs : null);
  const inventoryRate =
    metrics.inventoryMissingRate ??
    (metrics.inventoryMissing != null && metrics.logs > 0
      ? metrics.inventoryMissing / metrics.logs
      : null);

  return `# FSRS MVP ops — ${generatedAt.toISOString()}

**Modo:** \`${mode}\`${mode === 'dry-run' ? ' (contadores zerados; sem consulta ao banco)' : ''}

## Contagens

| Métrica | Valor |
|---------|-------|
| Cards | ${metrics.cards} |
| Logs | ${metrics.logs} |
| rating=good | ${metrics.good} |
| rating=again | ${metrics.again} |
| same_stem_fallback | ${metrics.sameStemFallback} |
| inventory_missing | ${fmtCount(metrics.inventoryMissing)} |
| Good rate (intervalo ≥ 7d) | ${fmtRate(metrics.goodRateIntervalGe7d)} (n=${metrics.intervalGe7dSample}) |
| Acerto D+7 | ${fmtRate(metrics.accuracyD7)} (n=${metrics.accuracyD7Sample}) |
| Acerto D+14 | ${fmtRate(metrics.accuracyD14)} (n=${metrics.accuracyD14Sample}) |
| Lapses / usuário / dia | ${fmtRate(metrics.lapsesPerUserDay)} |
| Due agora | ${metrics.dueNow} |
| Carga due (ratio) | ${fmtRate(metrics.dueLoadRatio)} |
| same_stem rate | ${fmtRate(sameStemRate)} |
| inventory_missing rate | ${fmtRate(inventoryRate)} |

## Critérios go/no-go (provisórios)

| Critério | Barra | Status |
|----------|-------|--------|
${criteria.map((c) => `| ${c.criterion} | ${c.provisional} | ${c.status} |`).join('\n')}

## Notas

- Script **read-only**; não altera parâmetros FSRS nem liga \`FSRS_MVP_ENABLED\`.
- Artefato sem PII (sem e-mail, nome, CPF; sem user_id listado).
- Acerto D+7/D+14 por unidade e \`inventory_missing\` agregável exigem query/logger mais ricos — dry-run e live parcial usam n/a até evolução.
- Contadores apply/skip/persist_fail/idempotent: instrumentar via logger (R3+) e agregar aqui.

## Decisão

**Default-on global:** não recomendado até critérios passarem + revisão humana.
`;
}

/** Heurística: artefato ops não deve vazar e-mail/CPF/telefone. */
export function findFsrsOpsReportPiiLeaks(markdown: string): string[] {
  const leaks: string[] = [];
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(markdown)) {
    leaks.push('email');
  }
  if (/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/.test(markdown)) {
    leaks.push('cpf-like');
  }
  if (/\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b/.test(markdown)) {
    leaks.push('phone-like');
  }
  if (/\buser_id\s*[:=]\s*['"]?[0-9a-f-]{36}/i.test(markdown)) {
    leaks.push('user_id');
  }
  return leaks;
}

export function opsReportArtifactFileName(
  day: string,
  mode: FsrsOpsReportMode,
): string {
  return mode === 'dry-run'
    ? `fsrs-mvp-ops-${day}-dry-run.md`
    : `fsrs-mvp-ops-${day}.md`;
}
