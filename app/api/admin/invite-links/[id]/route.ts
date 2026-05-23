import { NextRequest, NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { invitePublicPath, listInviteLinksForAdmin, revokeInviteLink } from '@/lib/invite/links';
import { logger } from '@/lib/logger';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: NextRequest, context: RouteContext) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const { id } = await context.params;

  try {
    const revoked = await revokeInviteLink(id);
    if (!revoked) {
      return NextResponse.json(
        { error: 'Convite não encontrado ou já revogado' },
        { status: 404 },
      );
    }

    const links = await listInviteLinksForAdmin();
    const link = links.find((row) => row.id === id);
    if (!link) {
      return NextResponse.json({ ok: true, revoked: true });
    }

    return NextResponse.json({
      link: {
        ...link,
        invitePath: invitePublicPath(link.token),
      },
    });
  } catch (error) {
    logger.error('PATCH /api/admin/invite-links/[id]', error, { id });
    return NextResponse.json({ error: 'Erro ao revogar convite' }, { status: 500 });
  }
}
