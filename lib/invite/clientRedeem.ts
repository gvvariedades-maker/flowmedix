import { supabase } from '@/lib/supabase/client';

export type ClientRedeemInviteResult =
  | { ok: true; alreadyPro?: boolean; proExpiresAt?: string; message?: string }
  | { ok: false; message: string; code?: string };

/**
 * Resgata convite após login/cadastro (Bearer do access_token da sessão).
 */
export async function redeemInviteFromClient(token: string): Promise<ClientRedeemInviteResult> {
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, message: 'Token de convite inválido.' };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { ok: false, message: 'Sessão não encontrada. Faça login novamente.' };
  }

  const res = await fetch('/api/convite/resgatar', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ token: trimmed }),
  });

  const payload = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    alreadyPro?: boolean;
    proExpiresAt?: string;
    error?: string;
    code?: string;
  };

  if (res.ok && payload.ok) {
    if (payload.alreadyPro) {
      return {
        ok: true,
        alreadyPro: true,
        message: 'Você já tem AVANT Pro — nada foi alterado.',
      };
    }
    return {
      ok: true,
      proExpiresAt: payload.proExpiresAt,
      message: 'Convite resgatado! Aproveite o AVANT Pro.',
    };
  }

  return {
    ok: false,
    message: payload.error ?? 'Não foi possível resgatar o convite.',
    code: payload.code,
  };
}
