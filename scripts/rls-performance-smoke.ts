#!/usr/bin/env tsx
/**
 * Smoke pós-deploy: RLS performance (20260604191239 + 20260604191246).
 *
 * Uso:
 *   npm run smoke:rls
 *
 * Requer NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (+ service role para comparação).
 * SQL estático (policies/índices): supabase/scripts/rls_performance_smoke.sql no SQL Editor.
 */

import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabase } from '../lib/supabase/server';

loadEnvConfig(process.cwd());

type Check = { name: string; ok: boolean; detail: string };

function logChecks(checks: Check[]) {
  for (const c of checks) {
    console.log(`${c.ok ? '✓' : '✗'} ${c.name}: ${c.detail}`);
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const checks: Check[] = [];

  if (!url || !anonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias.');
    process.exit(1);
  }

  const anon = createClient(url, anonKey, { auth: { persistSession: false } });

  // Anon: concursos vendáveis (ramo público da policy consolidada)
  const { data: concursosAnon, error: concursosErr } = await anon
    .from('concursos')
    .select('id, slug, status, price_cents')
    .eq('status', 'ativo')
    .gt('price_cents', 0)
    .limit(20);

  if (concursosErr) {
    checks.push({
      name: 'anon_concursos_vendaveis',
      ok: false,
      detail: concursosErr.message,
    });
  } else {
    const n = concursosAnon?.length ?? 0;
    checks.push({
      name: 'anon_concursos_vendaveis',
      ok: n > 0,
      detail: n > 0 ? `${n} concurso(s) visível(is) para anon` : '0 linhas — conferir RLS ou catálogo',
    });
  }

  // Anon: módulos ligados a concursos vendáveis (amostra)
  const { count: modulosAnonCount, error: modulosErr } = await anon
    .from('modulos_estudo')
    .select('id', { count: 'exact', head: true });

  if (modulosErr) {
    checks.push({
      name: 'anon_modulos_estudo',
      ok: false,
      detail: modulosErr.message,
    });
  } else {
    const n = modulosAnonCount ?? 0;
    checks.push({
      name: 'anon_modulos_estudo',
      ok: n > 0,
      detail: n > 0 ? `${n} módulo(s) visível(is) para anon` : '0 linhas — conferir RLS',
    });
  }

  // Anon: historico deve ficar vazio (sem JWT de usuário)
  const { count: historicoAnonCount, error: historicoErr } = await anon
    .from('historico_questoes')
    .select('id', { count: 'exact', head: true });

  if (historicoErr) {
    checks.push({
      name: 'anon_historico_vazio',
      ok: true,
      detail: `acesso bloqueado (${historicoErr.message}) — esperado sem sessão`,
    });
  } else {
    checks.push({
      name: 'anon_historico_vazio',
      ok: (historicoAnonCount ?? 0) === 0,
      detail:
        (historicoAnonCount ?? 0) === 0
          ? '0 linhas sem login — OK'
          : `${historicoAnonCount} linhas expostas a anon — falha de RLS`,
    });
  }

  // Service role: contagem vendável ≥ anon (sanidade)
  try {
    const admin = await createServerSupabase();
    const { count: sellableCount, error: sellableErr } = await admin
      .from('concursos')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ativo')
      .gt('price_cents', 0);

    if (sellableErr) {
      checks.push({
        name: 'service_sellable_concursos',
        ok: false,
        detail: sellableErr.message,
      });
    } else {
      const svc = sellableCount ?? 0;
      const anonN = concursosAnon?.length ?? 0;
      checks.push({
        name: 'service_vs_anon_concursos',
        ok: svc >= anonN,
        detail: `service_role vendáveis=${svc}, anon amostra=${anonN} (anon ≤ service)`,
      });
    }

    const { count: matriculasAtivas, error: matErr } = await admin
      .from('concurso_matriculas')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ativo');

    checks.push({
      name: 'matriculas_para_smoke_manual',
      ok: true,
      detail: matErr
        ? matErr.message
        : `${matriculasAtivas ?? 0} matrícula(s) ativa(s) — testar login matriculado em /estudar`,
    });
  } catch (e) {
    checks.push({
      name: 'service_role',
      ok: false,
      detail: e instanceof Error ? e.message : String(e),
    });
  }

  console.log('\n--- smoke:rls (API/RLS comportamental) ---\n');
  logChecks(checks);
  console.log(
    '\n--- smoke SQL (schema/policies) ---\nExecute: supabase/scripts/rls_performance_smoke.sql no SQL Editor\n',
  );
  console.log(
    '--- smoke manual (JWT aluno) ---\n1) Login matriculado → /estudar com pacote do edital\n2) Responder questão → progresso/histórico atualiza\n',
  );

  const failed = checks.some((c) => !c.ok);
  process.exitCode = failed ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
