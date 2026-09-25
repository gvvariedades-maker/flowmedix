/**
 * Avaliadores puros para `smoke:rls-auth` (AC-RLS-3).
 * Espelhados em __tests__/security/rlsAuthSmokeChecks.test.ts
 */

export type RlsAuthCheck = { name: string; ok: boolean; detail: string };

export function evaluateOwnRowsVisible(params: {
  name: string;
  rows: unknown[] | null | undefined;
  ownerId: string;
  getOwnerId: (row: Record<string, unknown>) => string | null | undefined;
  mustIncludeId?: string;
}): RlsAuthCheck {
  const { name, rows, ownerId, getOwnerId, mustIncludeId } = params;
  const list = rows ?? [];
  if (list.length === 0) {
    return { name, ok: false, detail: '0 linhas — esperava pelo menos 1 linha própria' };
  }
  const allOwn = list.every((r) => getOwnerId(r as Record<string, unknown>) === ownerId);
  if (!allOwn) {
    return { name, ok: false, detail: 'linhas de outro usuário visíveis (vazamento)' };
  }
  if (mustIncludeId && !list.some((r) => (r as { id?: string }).id === mustIncludeId)) {
    return { name, ok: false, detail: 'linha de fixture não encontrada na listagem própria' };
  }
  return { name, ok: true, detail: `${list.length} linha(s) — só own-user` };
}

export function evaluateCrossUserBlocked(params: {
  name: string;
  rows: unknown[] | null | undefined;
  errorMessage?: string | null;
}): RlsAuthCheck {
  const { name, rows, errorMessage } = params;
  const n = rows?.length ?? 0;
  if (errorMessage) {
    return { name, ok: true, detail: `bloqueado (${errorMessage})` };
  }
  if (n === 0) {
    return { name, ok: true, detail: '0 linhas — IDOR bloqueado' };
  }
  return { name, ok: false, detail: `${n} linha(s) — falha IDOR` };
}

export function evaluateEnrolledModulesVisible(params: {
  name: string;
  count: number | null | undefined;
  errorMessage?: string | null;
  minExpected: number;
}): RlsAuthCheck {
  const { name, count, errorMessage, minExpected } = params;
  if (errorMessage) {
    return { name, ok: false, detail: `erro inesperado: ${errorMessage}` };
  }
  const n = count ?? 0;
  if (n >= minExpected) {
    return { name, ok: true, detail: `${n} módulo(s) visível(is) com matrícula` };
  }
  return {
    name,
    ok: false,
    detail: `${n} módulo(s) — esperava ≥ ${minExpected} para matriculado`,
  };
}

export function evaluateUnenrolledModulesEmpty(params: {
  name: string;
  count: number | null | undefined;
  errorMessage?: string | null;
}): RlsAuthCheck {
  const { name, count, errorMessage } = params;
  if (errorMessage) {
    return {
      name,
      ok: true,
      detail: `acesso bloqueado (${errorMessage}) — OK sem matrícula`,
    };
  }
  const n = count ?? 0;
  if (n === 0) {
    return { name, ok: true, detail: '0 módulos — OK sem matrícula' };
  }
  return { name, ok: false, detail: `${n} módulo(s) visíveis sem matrícula` };
}

export function evaluateAuthenticatedDeniedRpc(params: {
  name: string;
  errorMessage?: string | null;
}): RlsAuthCheck {
  const { name, errorMessage } = params;
  if (errorMessage) {
    return { name, ok: true, detail: `RPC negada (${errorMessage})` };
  }
  return { name, ok: false, detail: 'RPC executou como authenticated — não deveria' };
}
