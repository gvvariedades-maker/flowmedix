import { randomBytes } from 'node:crypto';

import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import {
  computeInviteLinkStatus,
  type InviteLinkPublicStatus,
} from '@/lib/invite/shared';
import type { InviteLink } from '@/types/database';

export type { InviteLinkPublicStatus } from '@/lib/invite/shared';
export { computeInviteLinkStatus, invitePublicPath } from '@/lib/invite/shared';

const INVITE_LINK_ADMIN_SELECT =
  'id, token, label, pro_days, link_expires_at, max_uses, use_count, revoked_at, created_by, created_at';

export function generateInviteToken(): string {
  return randomBytes(18).toString('base64url');
}

export type InviteLinkPreview = {
  proDays: number;
  status: InviteLinkPublicStatus;
  linkExpiresAt: string;
  usesRemaining: number;
  maxUses: number;
};

export async function getInviteLinkPreview(token: string): Promise<InviteLinkPreview | null> {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('invite_links')
    .select('pro_days, link_expires_at, max_uses, use_count, revoked_at')
    .eq('token', trimmed)
    .maybeSingle();

  if (error) {
    logger.error('Falha ao buscar preview de convite', error, {
      tokenPrefix: trimmed.slice(0, 4),
    });
    throw error;
  }

  if (!data) return null;

  const row = data as Pick<
    InviteLink,
    'pro_days' | 'link_expires_at' | 'max_uses' | 'use_count' | 'revoked_at'
  >;

  const status = computeInviteLinkStatus(row);
  const usesRemaining = Math.max(0, row.max_uses - row.use_count);

  return {
    proDays: row.pro_days,
    status,
    linkExpiresAt: row.link_expires_at,
    usesRemaining,
    maxUses: row.max_uses,
  };
}

export type InviteLinkAdminRow = Pick<
  InviteLink,
  | 'id'
  | 'token'
  | 'label'
  | 'pro_days'
  | 'link_expires_at'
  | 'max_uses'
  | 'use_count'
  | 'revoked_at'
  | 'created_by'
  | 'created_at'
> & { status: InviteLinkPublicStatus };

export async function listInviteLinksForAdmin(): Promise<InviteLinkAdminRow[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('invite_links')
    .select(INVITE_LINK_ADMIN_SELECT)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Falha ao listar links de convite', error);
    throw error;
  }

  return (data ?? []).map((row) => ({
    ...(row as InviteLink),
    status: computeInviteLinkStatus(row as InviteLink),
  }));
}

export async function createInviteLink(input: {
  pro_days: number;
  link_valid_days: number;
  max_uses: number;
  label?: string | null;
  created_by: string;
}): Promise<InviteLinkAdminRow> {
  const token = generateInviteToken();
  const linkExpiresAt = new Date();
  linkExpiresAt.setUTCDate(linkExpiresAt.getUTCDate() + input.link_valid_days);

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('invite_links')
    .insert({
      token,
      label: input.label?.trim() || null,
      pro_days: input.pro_days,
      link_expires_at: linkExpiresAt.toISOString(),
      max_uses: input.max_uses,
      created_by: input.created_by,
    })
    .select(INVITE_LINK_ADMIN_SELECT)
    .single();

  if (error) {
    logger.error('Falha ao criar link de convite', error);
    throw error;
  }

  const row = data as InviteLink;
  return { ...row, status: computeInviteLinkStatus(row) };
}

export async function revokeInviteLink(id: string): Promise<boolean> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('invite_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)
    .is('revoked_at', null)
    .select('id')
    .maybeSingle();

  if (error) {
    logger.error('Falha ao revogar link de convite', error, { id });
    throw error;
  }

  return Boolean(data);
}
