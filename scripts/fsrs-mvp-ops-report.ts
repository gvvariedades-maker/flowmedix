#!/usr/bin/env tsx
/**
 * FSRS MVP R5 — métricas ops (read-only).
 * Gera artifacts/fsrs-mvp-ops-<YYYYMMDD>.md
 *
 * Uso:
 *   npx tsx scripts/fsrs-mvp-ops-report.ts
 *
 * Requer SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL.
 * Não altera rating policy nem liga default-on.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';

loadEnvConfig(process.cwd());

type GoNoGo = {
  criterion: string;
  provisional: string;
  status: 'pass' | 'fail' | 'unknown';
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY obrigatórias.');
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const now = new Date();
  const day = now.toISOString().slice(0, 10).replace(/-/g, '');

  const { count: logCount, error: logErr } = await supabase
    .from('spaced_review_logs')
    .select('id', { count: 'exact', head: true });

  const { count: cardCount, error: cardErr } = await supabase
    .from('spaced_review_cards')
    .select('id', { count: 'exact', head: true });

  const { count: againCount } = await supabase
    .from('spaced_review_logs')
    .select('id', { count: 'exact', head: true })
    .eq('rating', 'again');

  const { count: goodCount } = await supabase
    .from('spaced_review_logs')
    .select('id', { count: 'exact', head: true })
    .eq('rating', 'good');

  const { count: sameStemCount } = await supabase
    .from('spaced_review_logs')
    .select('id', { count: 'exact', head: true })
    .eq('same_stem_fallback', true);

  const totalLogs = logCount ?? 0;
  const goods = goodCount ?? 0;
  const agains = againCount ?? 0;
  const sameStem = sameStemCount ?? 0;
  const goodRate = totalLogs > 0 ? goods / totalLogs : null;
  const sameStemRate = totalLogs > 0 ? sameStem / totalLogs : null;

  const criteria: GoNoGo[] = [
    {
      criterion: 'Volume mínimo de logs (≥ 50 reviews elegíveis)',
      provisional: '≥ 50 spaced_review_logs',
      status: totalLogs >= 50 ? 'pass' : totalLogs > 0 ? 'fail' : 'unknown',
    },
    {
      criterion: 'Good rate observacional (intervalo ≥ 7d — proxy global neste script)',
      provisional: 'Good rate ∈ [0.70, 0.95] com n≥50',
      status:
        goodRate == null
          ? 'unknown'
          : totalLogs >= 50 && goodRate >= 0.7 && goodRate <= 0.95
            ? 'pass'
            : 'fail',
    },
    {
      criterion: 'Taxa same_stem_fallback',
      provisional: '< 40% com n≥50',
      status:
        sameStemRate == null
          ? 'unknown'
          : totalLogs >= 50 && sameStemRate < 0.4
            ? 'pass'
            : totalLogs === 0
              ? 'unknown'
              : 'fail',
    },
    {
      criterion: 'Default-on global',
      provisional: 'Exige decisão humana após critérios acima — fora deste script',
      status: 'unknown',
    },
  ];

  const md = `# FSRS MVP ops — ${now.toISOString()}

## Contagens

| Métrica | Valor |
|---------|-------|
| Cards | ${cardErr ? `erro: ${cardErr.message}` : cardCount ?? 0} |
| Logs | ${logErr ? `erro: ${logErr.message}` : totalLogs} |
| rating=good | ${goods} |
| rating=again | ${agains} |
| same_stem_fallback | ${sameStem} |
| Good rate (global) | ${goodRate == null ? 'n/a' : goodRate.toFixed(3)} |
| same_stem rate | ${sameStemRate == null ? 'n/a' : sameStemRate.toFixed(3)} |

## Critérios go/no-go (provisórios)

| Critério | Barra | Status |
|----------|-------|--------|
${criteria.map((c) => `| ${c.criterion} | ${c.provisional} | ${c.status} |`).join('\n')}

## Notas

- Script **read-only**; não altera parâmetros FSRS nem liga \`FSRS_MVP_ENABLED\`.
- Retenção D+7/D+14 por unidade exige query mais rica — evoluir em lote futuro.
- Contadores apply/skip/persist_fail/idempotent/persistence_unknown: instrumentar via logger/métricas de app (R3+) e agregar aqui.

## Decisão

**Default-on global:** não recomendado até critérios passarem + revisão humana.
`;

  const outDir = join(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `fsrs-mvp-ops-${day}.md`);
  writeFileSync(outPath, md, 'utf8');
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
