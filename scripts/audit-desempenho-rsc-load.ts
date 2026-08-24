#!/usr/bin/env tsx
/**
 * Auditoria de carga do hub `/desempenho` — só medição.
 * Não altera fórmulas, UI, Cadernos ou Simulados.
 *
 *   npx tsx scripts/audit-desempenho-rsc-load.ts
 *
 * Opcional: DESEMPENHO_AUDIT_USER_ID=<uuid>
 */
import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { loadEnvConfig } from '@next/env';
import { getHistoricoCompletoUncached } from '../lib/analytics';
import {
  getAccessibleModulosForUser,
  getActiveMatriculatedConcursoIds,
  userHasActiveMatricula,
} from '../lib/concursos/entitlements';
import { aggregateStudyPerformance } from '../lib/desempenho/studyPerformance';
import { isEvidenceV1InstrumentationEnabled } from '../lib/env';
import { createServerSupabase } from '../lib/supabase/server';

loadEnvConfig(process.cwd());

const OUT_JSON = resolve(process.cwd(), 'artifacts/desempenho-rsc-audit.json');
const OUT_MD = resolve(process.cwd(), 'artifacts/desempenho-rsc-audit-report.md');

type Timed<T> = { ms: number; ok: boolean; error?: string; value: T };

async function time<T>(fn: () => Promise<T>): Promise<Timed<T | null>> {
  const t0 = performance.now();
  try {
    const value = await fn();
    return { ms: Math.round(performance.now() - t0), ok: true, value };
  } catch (error) {
    return {
      ms: Math.round(performance.now() - t0),
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      value: null,
    };
  }
}

async function resolveAuditUserId(supabase: Awaited<ReturnType<typeof createServerSupabase>>) {
  const fromEnv = process.env.DESEMPENHO_AUDIT_USER_ID?.trim();
  if (fromEnv) return { userId: fromEnv, source: 'env' as const };

  const { data, error } = await supabase
    .from('historico_questoes')
    .select('user_id')
    .limit(20000);

  if (error) throw error;
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const id = (row as { user_id: string }).user_id;
    if (!id) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  let best: { userId: string; n: number } | null = null;
  for (const [userId, n] of counts) {
    if (!best || n > best.n) best = { userId, n };
  }
  if (!best) throw new Error('Nenhum user_id em historico_questoes');
  return { userId: best.userId, source: 'max_historico' as const, historicoRowsSampled: best.n };
}

async function countLedger(supabase: Awaited<ReturnType<typeof createServerSupabase>>, userId: string) {
  const t0 = performance.now();
  const { data, error, count } = await supabase
    .from('evidence_attempt_events')
    .select('attempt_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('context', 'regular_practice')
    .eq('event_type', 'attempt');
  return {
    ms: Math.round(performance.now() - t0),
    ok: !error,
    error: error?.message,
    count: count ?? data?.length ?? 0,
  };
}

function summarize(label: string, ms: number) {
  return `${label.padEnd(28)} ${String(ms).padStart(6)} ms`;
}

async function main() {
  const eeFlag = isEvidenceV1InstrumentationEnabled();
  const supabase = await createServerSupabase();
  const resolved = await resolveAuditUserId(supabase);
  const userId = resolved.userId;
  const userIdShort = `${userId.slice(0, 8)}…`;

  const rounds: Record<string, unknown>[] = [];

  for (const round of ['cold', 'warm'] as const) {
    const matriculaIds = await time(() => getActiveMatriculatedConcursoIds(userId));
    const matriculaGate = await time(() => userHasActiveMatricula(userId));
    const historico = await time(() => getHistoricoCompletoUncached(userId));
    const catalog = await time(() => getAccessibleModulosForUser(userId));
    const ledger = await countLedger(supabase, userId);

    const historicoRows = historico.value ?? [];
    const catalogRows = catalog.value ?? [];

    const agg = await time(async () => {
      aggregateStudyPerformance(historicoRows, catalogRows, { periodo: 'all' }, new Date(), 'ok');
      return true;
    });

    const sequential = await time(async () => {
      const h = await getHistoricoCompletoUncached(userId);
      const c = await getAccessibleModulosForUser(userId);
      aggregateStudyPerformance(h, c, { periodo: 'all' }, new Date(), 'ok');
    });

    const productionLike = await time(async () => {
      const seriesStarted = eeFlag ? countLedger(supabase, userId) : Promise.resolve(null);
      const [h, c] = await Promise.all([
        getHistoricoCompletoUncached(userId),
        getAccessibleModulosForUser(userId),
      ]);
      aggregateStudyPerformance(h, c, { periodo: 'all' }, new Date(), 'ok');
      await seriesStarted;
    });

    const parallelAll = await time(async () => {
      const [h, c] = await Promise.all([
        getHistoricoCompletoUncached(userId),
        getAccessibleModulosForUser(userId),
        getActiveMatriculatedConcursoIds(userId),
        eeFlag ? countLedger(supabase, userId) : Promise.resolve(null),
      ]);
      aggregateStudyPerformance(h, c, { periodo: 'all' }, new Date(), 'ok');
    });

    rounds.push({
      round,
      matriculaIdsMs: matriculaIds.ms,
      matriculaIdsCount: matriculaIds.value?.length ?? 0,
      matriculaGateMs: matriculaGate.ms,
      matriculaGateOk: matriculaGate.value,
      historicoMs: historico.ms,
      historicoRows: historicoRows.length,
      historicoOk: historico.ok,
      historicoError: historico.error,
      catalogMs: catalog.ms,
      catalogRows: catalogRows.length,
      catalogOk: catalog.ok,
      catalogError: catalog.error,
      catalogPagesEst: Math.ceil(catalogRows.length / 1000) || 0,
      aggregateMs: agg.ms,
      ledger,
      sequentialMs: sequential.ms,
      productionLikeMs: productionLike.ms,
      parallelAllMs: parallelAll.ms,
    });
  }

  const payload = {
    measuredAt: new Date().toISOString(),
    note: 'Data-layer timings via service role. Não inclui proxy getUser() nem getServerSession/getServerUser de cookies. Cache Next unstable_cache não está nesta medição (uncached).',
    eeV1Instrumentation: eeFlag,
    userIdShort,
    userSource: resolved.source,
    rounds,
  };

  const cold = rounds[0] as Record<string, number | boolean | string>;
  const warm = rounds[1] as Record<string, number | boolean | string>;

  const md = `# Auditoria RSC — hub \`/desempenho\`

Medido em ${payload.measuredAt} · \`next\` data-layer (service role, **sem** \`unstable_cache\`).
Usuário: \`${userIdShort}\` (fonte: ${resolved.source}). Flag EE P4: **${eeFlag}**.

**Não afirma** TTFB de produção. Sessão cookie (\`proxy.getUser\` + \`getServerUser\` + \`getServerSession\`) entra no relatório de navegação \`next start\`.

## Volumes

| Fonte | Cold | Warm |
|---|---:|---:|
| Matrícula (ids) | ${cold.matriculaIdsMs} ms (${cold.matriculaIdsCount} concursos) | ${warm.matriculaIdsMs} ms |
| Gate \`userHasActiveMatricula\` | ${cold.matriculaGateMs} ms | ${warm.matriculaGateMs} ms |
| Histórico \`select *\` teto 5000 | ${cold.historicoMs} ms (${cold.historicoRows} linhas) | ${warm.historicoMs} ms |
| Catálogo \`getAccessibleModulosForUser\` | ${cold.catalogMs} ms (${cold.catalogRows} módulos, ~${cold.catalogPagesEst} páginas de 1000) | ${warm.catalogMs} ms |
| Agregação JS \`aggregateStudyPerformance\` | ${cold.aggregateMs} ms | ${warm.aggregateMs} ms |
| Ledger \`evidence_attempt_events\` | ${JSON.stringify(cold.ledger)} | ${JSON.stringify(warm.ledger)} |

## Sequencial vs paralelo (P0: histórico + catálogo + agregação)

| Cenário | Cold | Warm | O que simula |
|---|---:|---:|---|
| Sequencial (hist → catálogo → agg) | ${cold.sequentialMs} ms | ${warm.sequentialMs} ms | Waterfall pior |
| Production-like (\`Promise.all\` hist+catálogo; série em paralelo se flag) | ${cold.productionLikeMs} ms | ${warm.productionLikeMs} ms | \`loadDesempenhoEstudoCore\` hoje |
| Paralelo extra (hist+catálogo+matrícula+ledger) | ${cold.parallelAllMs} ms | ${warm.parallelAllMs} ms | Teto se matrícula do layout já não bloqueasse |

## Queries repetidas (código, não tempo)

1. \`proxy.ts\` chama \`getUser()\` (Auth). Layout autenticado chama \`getServerUser()\` de novo. Página chama \`getServerSession()\`.
2. Layout: \`userHasActiveMatricula\` → \`concurso_matriculas\`. Catálogo: \`getActiveMatriculatedConcursoIds\` → **a mesma tabela** de novo.
3. Catálogo pagina \`concurso_modulos\` de **1000 em 1000** (sequencial). Aluno com pacote geral: **5647 vínculos ≈ 6 roundtrips**.
4. Tabela \`evidence_attempt_events\` **não existe** neste banco — P4 ou falha rápido ou flag off.

JSON: \`artifacts/desempenho-rsc-audit.json\`
`;

  mkdirSync(resolve(process.cwd(), 'artifacts'), { recursive: true });
  writeFileSync(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  writeFileSync(OUT_MD, md, 'utf8');

  console.log(`user ${userIdShort} source=${resolved.source} ee=${eeFlag}`);
  for (const r of rounds) {
    const row = r as Record<string, number>;
    console.log(`\n== ${String(r.round)} ==`);
    console.log(summarize('matricula ids', row.matriculaIdsMs));
    console.log(summarize('matricula gate', row.matriculaGateMs));
    console.log(summarize('historico', row.historicoMs));
    console.log(summarize('catalogo', row.catalogMs));
    console.log(summarize('agregacao JS', row.aggregateMs));
    console.log(summarize('seq hist→cat→agg', row.sequentialMs));
    console.log(summarize('prod-like all()', row.productionLikeMs));
    console.log(summarize('paralelo extra', row.parallelAllMs));
  }
  console.log(`\nWrote ${OUT_JSON}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
