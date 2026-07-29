/**
 * FSRS MVP R5 — métricas ops + critérios go/no-go (provisórios).
 * Pure: sem I/O nem Supabase. Spec: DECISAO_REVISAO_FSRS_MVP.md §15 · PLANO §6.
 */

export type FsrsOpsReportMode = 'live' | 'dry-run';

export type FsrsOpsMetrics = {
  /**
   * Contagens de negócio (sintéticos excluídos quando identificados).
   * Usar estas para go/no-go de default-on.
   */
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
  /** Cards/logs brutos (inclui sintéticos). */
  grossCards: number;
  grossLogs: number;
  /** Identificados como smoke/sintético e excluídos das métricas de negócio. */
  syntheticCards: number;
  syntheticLogs: number;
  /** true quando pelo menos um user_id sintético foi filtrado. */
  syntheticExcluded: boolean;
};

/**
 * `insufficient_window` = sem janela madura (não é sucesso; bloqueia default-on,
 * mas não invalida funcionalidade técnica do beta staging).
 */
export type GoNoGoStatus =
  | 'pass'
  | 'fail'
  | 'unknown'
  | 'insufficient_window';

export type GoNoGoCriterion = {
  id: string;
  criterion: string;
  provisional: string;
  status: GoNoGoStatus;
};

export type FsrsRolloutVerdict = {
  stagingBeta: 'GO' | 'NO-GO';
  defaultOn: 'GO' | 'NO-GO';
  rationale: string[];
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
    grossCards: 0,
    grossLogs: 0,
    syntheticCards: 0,
    syntheticLogs: 0,
    syntheticExcluded: false,
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

/** D+7 / D+14: sem janela madura → insufficient_window (nunca “pass” precoce). */
function retentionWindowStatus(
  rate: number | null,
  sample: number,
  minSample: number,
  pass: (r: number) => boolean,
): GoNoGoStatus {
  if (rate == null || sample === 0 || sample < minSample) {
    return 'insufficient_window';
  }
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
      status: retentionWindowStatus(
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
      status: retentionWindowStatus(
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

/**
 * Veredito de rollout: staging beta pode ser GO com volume baixo;
 * default-on exige critérios maduros (D+7/D+14 não podem ser insufficient_window).
 */
export function evaluateFsrsRolloutVerdict(input: {
  criteria: GoNoGoCriterion[];
  smokeOverallPass: boolean;
  productionFlagsOff: boolean;
}): FsrsRolloutVerdict {
  const byId = Object.fromEntries(input.criteria.map((c) => [c.id, c.status]));
  const d7 = byId.accuracy_d7;
  const d14 = byId.accuracy_d14;
  const rationale: string[] = [];

  const windowsBlockDefault =
    d7 === 'insufficient_window' ||
    d14 === 'insufficient_window' ||
    d7 === 'fail' ||
    d14 === 'fail' ||
    d7 === 'unknown' ||
    d14 === 'unknown';
  const volumeOk = byId.volume === 'pass';
  const hardFails = input.criteria.filter(
    (c) =>
      c.id !== 'default_on' &&
      c.id !== 'accuracy_d7' &&
      c.id !== 'accuracy_d14' &&
      c.status === 'fail',
  );

  if (!input.smokeOverallPass) {
    rationale.push('Smoke staging não PASS — bloqueia GO beta.');
  }
  if (!input.productionFlagsOff) {
    rationale.push('Production flags não confirmadas off — bloqueia GO beta.');
  }
  if (windowsBlockDefault) {
    rationale.push(
      'D+7/D+14 sem janela madura (insufficient_window) ou sem amostra — bloqueia default-on.',
    );
  }
  if (!volumeOk) {
    rationale.push('Volume de negócio < 50 reviews elegíveis — bloqueia default-on.');
  }
  for (const f of hardFails) {
    rationale.push(`Critério ${f.id}=fail — bloqueia default-on.`);
  }

  const stagingBeta: 'GO' | 'NO-GO' =
    input.smokeOverallPass && input.productionFlagsOff ? 'GO' : 'NO-GO';

  const defaultOn: 'GO' | 'NO-GO' =
    !windowsBlockDefault &&
    volumeOk &&
    hardFails.length === 0 &&
    byId.default_on !== 'fail'
      ? 'GO'
      : 'NO-GO';

  if (stagingBeta === 'GO') {
    rationale.unshift(
      'FSRS MVP 100% funcional no staging beta (não globalmente em produção).',
    );
  }
  if (defaultOn === 'NO-GO') {
    rationale.push('Rollback Production: manter FSRS_MVP_ENABLED=false.');
  }

  return { stagingBeta, defaultOn, rationale };
}

export function renderFsrsOpsReportMarkdown(input: {
  generatedAt: Date;
  metrics: FsrsOpsMetrics;
  mode: FsrsOpsReportMode;
  criteria?: GoNoGoCriterion[];
  verdict?: FsrsRolloutVerdict;
}): string {
  const { generatedAt, metrics, mode } = input;
  const criteria = input.criteria ?? evaluateFsrsGoNoGo(metrics);
  const verdict =
    input.verdict ??
    evaluateFsrsRolloutVerdict({
      criteria,
      smokeOverallPass: false,
      productionFlagsOff: true,
    });
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

## Contagens (negócio)

Sintéticos/smoke excluídos quando identificados (\`syntheticExcluded=${metrics.syntheticExcluded}\`).

| Métrica | Valor |
|---------|-------|
| Cards (negócio) | ${metrics.cards} |
| Logs (negócio) | ${metrics.logs} |
| Cards brutos | ${metrics.grossCards} |
| Logs brutos | ${metrics.grossLogs} |
| Cards sintéticos | ${metrics.syntheticCards} |
| Logs sintéticos | ${metrics.syntheticLogs} |
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
- Dados sintéticos (smoke) são identificáveis e **excluídos** das métricas de negócio.
- Acerto D+7/D+14 sem janela madura → \`insufficient_window\` (não é sucesso; bloqueia default-on).
- Contadores apply/skip/persist_fail/idempotent: instrumentar via logger (R3+) e agregar aqui.

## Decisão

| Escopo | Veredito |
|--------|----------|
| **Staging beta** | **${verdict.stagingBeta}** |
| **Default-on global** | **${verdict.defaultOn}** |

${verdict.rationale.map((r) => `- ${r}`).join('\n')}

**Rollback:** \`FSRS_MVP_ENABLED=false\` (Preview staging e/ou Production).
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
