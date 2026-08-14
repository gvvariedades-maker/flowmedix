/**
 * Contratos RLS alinhados a `npm run smoke:rls` (scripts/rls-performance-smoke.ts).
 * Usados pelo smoke ops e por `__tests__/security/` — mesma regra de PASS/FAIL.
 *
 * Tabelas protegidas: anon (sem JWT) não deve ver linhas; erro de acesso também é PASS.
 */

export type RlsAnonCountCheck = {
  name: string;
  ok: boolean;
  detail: string;
};

/**
 * Avalia contagem anon em tabela protegida por RLS (histórico, módulos, matrículas).
 * - Erro de acesso → PASS (bloqueio esperado)
 * - 0 linhas → PASS
 * - N > 0 → FAIL (vazamento)
 */
export function evaluateAnonProtectedTableCount(params: {
  name: string;
  count: number | null | undefined;
  errorMessage?: string | null;
  emptyDetail?: string;
}): RlsAnonCountCheck {
  const { name, count, errorMessage, emptyDetail = '0 linhas sem login — OK' } = params;

  if (errorMessage) {
    return {
      name,
      ok: true,
      detail: `acesso bloqueado (${errorMessage}) — esperado sem sessão/matrícula`,
    };
  }

  const n = count ?? 0;
  if (n === 0) {
    return { name, ok: true, detail: emptyDetail };
  }

  return {
    name,
    ok: false,
    detail: `${n} linha(s) expostas a anon — falha de RLS`,
  };
}

/**
 * Anon não deve conseguir executar RPC interna (erro de permissão/404 = PASS).
 * Sucesso sem erro = FAIL (EXECUTE vazou para anon).
 */
export function evaluateAnonDeniedRpc(params: {
  name: string;
  errorMessage?: string | null;
}): RlsAnonCountCheck {
  const { name, errorMessage } = params;
  if (errorMessage) {
    return { name, ok: true, detail: `RPC negada (${errorMessage})` };
  }
  return {
    name,
    ok: false,
    detail: 'RPC executou — EXECUTE não deveria estar em anon',
  };
}

/** Nomes canônicos dos checks de tabela protegida no smoke:rls. */
export const RLS_ANON_PROTECTED_CHECK_NAMES = [
  'anon_modulos_estudo_vazio',
  'anon_historico_vazio',
  'anon_matriculas_vazio',
  'anon_stripe_webhook_events_vazio',
] as const;

export const RLS_ANON_DENIED_RPC_CHECK_NAMES = ['anon_cannot_rpc_cache_webhook'] as const;

export type RlsAnonProtectedCheckName = (typeof RLS_ANON_PROTECTED_CHECK_NAMES)[number];
