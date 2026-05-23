import { invalidateUserModulosCache } from '@/lib/cache';
import { getConcursoBySlug, GERAL_CONCURSO_SLUG, isActiveMatriculaRow } from '@/lib/concursos/entitlements';
import { getGeralMatriculaForUser } from '@/lib/freemium';
import { logger } from '@/lib/logger';
import { createServerSupabase } from '@/lib/supabase/server';
import type { InviteLink } from '@/types/database';

export type RedeemInviteErrorCode =
  | 'LINK_NOT_FOUND'
  | 'LINK_REVOKED'
  | 'LINK_EXPIRED'
  | 'LINK_EXHAUSTED'
  | 'ALREADY_REDEEMED'
  | 'INVITE_PRO_ACTIVE'
  | 'GERAL_CONCURSO_MISSING';

export type RedeemInviteResult =
  | { ok: true; alreadyPro?: boolean; proExpiresAt?: string }
  | { ok: false; code: RedeemInviteErrorCode; message: string };

type InviteLinkRow = Pick<
  InviteLink,
  'id' | 'pro_days' | 'link_expires_at' | 'max_uses' | 'use_count' | 'revoked_at'
>;

function addDays(from: Date, days: number): Date {
  const out = new Date(from);
  out.setUTCDate(out.getUTCDate() + days);
  return out;
}

function validateInviteLink(link: InviteLinkRow | null): RedeemInviteResult | null {
  if (!link) {
    return {
      ok: false,
      code: 'LINK_NOT_FOUND',
      message: 'Link de convite não encontrado.',
    };
  }

  if (link.revoked_at) {
    return {
      ok: false,
      code: 'LINK_REVOKED',
      message: 'Este link de convite foi revogado.',
    };
  }

  if (new Date(link.link_expires_at).getTime() <= Date.now()) {
    return {
      ok: false,
      code: 'LINK_EXPIRED',
      message: 'Este link de convite expirou.',
    };
  }

  if (link.use_count >= link.max_uses) {
    return {
      ok: false,
      code: 'LINK_EXHAUSTED',
      message: 'Este link de convite atingiu o limite de usos.',
    };
  }

  return null;
}

async function incrementInviteLinkUseCount(link: InviteLinkRow): Promise<boolean> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('invite_links')
    .update({ use_count: link.use_count + 1 })
    .eq('id', link.id)
    .eq('use_count', link.use_count)
    .select('id')
    .maybeSingle();

  if (error) {
    logger.error('Falha ao incrementar use_count do convite', error, { inviteLinkId: link.id });
    throw error;
  }

  return Boolean(data);
}

/**
 * Resgata convite: concede Pro temporário em `geral` (origem `invite`).
 * Regras: um resgate por link/usuário; bloqueio com invite ativo; stripe_pro = no-op.
 */
export async function redeemInvite(userId: string, token: string): Promise<RedeemInviteResult> {
  const trimmed = token.trim();
  if (!trimmed) {
    return {
      ok: false,
      code: 'LINK_NOT_FOUND',
      message: 'Link de convite não encontrado.',
    };
  }

  const supabase = await createServerSupabase();

  const { data: link, error: linkError } = await supabase
    .from('invite_links')
    .select('id, pro_days, link_expires_at, max_uses, use_count, revoked_at')
    .eq('token', trimmed)
    .maybeSingle();

  if (linkError) {
    logger.error('Falha ao buscar link de convite', linkError, { tokenPrefix: trimmed.slice(0, 4) });
    throw linkError;
  }

  const linkRow = (link as InviteLinkRow | null) ?? null;
  const linkValidation = validateInviteLink(linkRow);
  if (linkValidation) return linkValidation;

  const inviteLink = linkRow!;

  const { data: existingRedemption, error: redemptionLookupError } = await supabase
    .from('invite_redemptions')
    .select('id')
    .eq('invite_link_id', inviteLink.id)
    .eq('user_id', userId)
    .maybeSingle();

  if (redemptionLookupError) {
    logger.error('Falha ao verificar resgate de convite', redemptionLookupError, { userId });
    throw redemptionLookupError;
  }

  if (existingRedemption) {
    return {
      ok: false,
      code: 'ALREADY_REDEEMED',
      message: 'Link já utilizado por esta conta.',
    };
  }

  const geralMatricula = await getGeralMatriculaForUser(userId);

  if (geralMatricula?.origem === 'stripe_pro' && isActiveMatriculaRow(geralMatricula)) {
    return { ok: true, alreadyPro: true };
  }

  if (geralMatricula?.origem === 'invite' && isActiveMatriculaRow(geralMatricula)) {
    return {
      ok: false,
      code: 'INVITE_PRO_ACTIVE',
      message: 'Você já está no período Pro deste convite.',
    };
  }

  const geral = await getConcursoBySlug(GERAL_CONCURSO_SLUG);
  if (!geral) {
    logger.error('Concurso geral não encontrado para resgate de convite', { userId });
    return {
      ok: false,
      code: 'GERAL_CONCURSO_MISSING',
      message: 'Catálogo geral indisponível. Tente novamente mais tarde.',
    };
  }

  const proExpiresAt = addDays(new Date(), inviteLink.pro_days);

  const { error: upsertError } = await supabase.from('concurso_matriculas').upsert(
    {
      user_id: userId,
      concurso_id: geral.id,
      origem: 'invite',
      status: 'ativo',
      expires_at: proExpiresAt.toISOString(),
    },
    { onConflict: 'user_id,concurso_id' },
  );

  if (upsertError) {
    logger.error('Falha ao upsert matrícula invite', upsertError, { userId });
    throw upsertError;
  }

  const { error: redemptionInsertError } = await supabase.from('invite_redemptions').insert({
    invite_link_id: inviteLink.id,
    user_id: userId,
    pro_expires_at: proExpiresAt.toISOString(),
  });

  if (redemptionInsertError) {
    logger.error('Falha ao registrar resgate de convite', redemptionInsertError, {
      userId,
      inviteLinkId: inviteLink.id,
    });
    throw redemptionInsertError;
  }

  const incremented = await incrementInviteLinkUseCount(inviteLink);
  if (!incremented) {
    logger.warn('use_count do convite não incrementado (corrida ou esgotado após resgate)', {
      inviteLinkId: inviteLink.id,
      userId,
    });
  }

  await invalidateUserModulosCache(userId);

  return { ok: true, proExpiresAt: proExpiresAt.toISOString() };
}
