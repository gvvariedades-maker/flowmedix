import { NextRequest, NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/admin/requireAdmin';
import {
  createInviteLink,
  invitePublicPath,
  listInviteLinksForAdmin,
} from '@/lib/invite/links';
import { logger } from '@/lib/logger';
import { InviteLinkCreateSchema } from '@/lib/validations';

function serializeInviteLink(
  link: Awaited<ReturnType<typeof listInviteLinksForAdmin>>[number],
  origin: string | null,
) {
  const path = invitePublicPath(link.token);
  return {
    ...link,
    invitePath: path,
    inviteUrl: origin ? `${origin}${path}` : path,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  try {
    const links = await listInviteLinksForAdmin();
    const origin = request.nextUrl.origin || null;
    return NextResponse.json({
      links: links.map((link) => serializeInviteLink(link, origin)),
    });
  } catch (error) {
    logger.error('GET /api/admin/invite-links', error);
    return NextResponse.json({ error: 'Erro ao listar convites' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const parsed = InviteLinkCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.issues },
      { status: 422 },
    );
  }

  try {
    const link = await createInviteLink({
      pro_days: parsed.data.pro_days,
      link_valid_days: parsed.data.link_valid_days,
      max_uses: parsed.data.max_uses,
      label: parsed.data.label,
      created_by: auth.email,
    });

    const origin = request.nextUrl.origin || null;
    return NextResponse.json({ link: serializeInviteLink(link, origin) }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/admin/invite-links', error);
    return NextResponse.json({ error: 'Erro ao criar convite' }, { status: 500 });
  }
}
