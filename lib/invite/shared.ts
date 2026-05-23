export type InviteLinkPublicStatus = 'active' | 'revoked' | 'expired' | 'exhausted';

export function computeInviteLinkStatus(link: {
  revoked_at: string | null;
  link_expires_at: string;
  use_count: number;
  max_uses: number;
}): InviteLinkPublicStatus {
  if (link.revoked_at) return 'revoked';
  if (new Date(link.link_expires_at).getTime() <= Date.now()) return 'expired';
  if (link.use_count >= link.max_uses) return 'exhausted';
  return 'active';
}

export function invitePublicPath(token: string): string {
  return `/convite/${encodeURIComponent(token)}`;
}
