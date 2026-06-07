import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { getActiveProInfoForUser } from '@/lib/freemium';
import { findStripeCustomerIdByEmail } from '@/lib/pro/stripeCustomer';
import { getStripeClient } from '@/lib/stripe/client';
import { getAbsoluteUrl } from '@/lib/siteUrl';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { getServerUser } from '@/lib/supabase/server-auth';

async function resolveAuthedUser(request: NextRequest): Promise<User | null> {
  const bearer = await getUserAndClientFromBearer(request);
  if (bearer) return bearer.user;
  return (await getServerUser()) ?? null;
}

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: 'Pagamentos indisponíveis no momento.' }, { status: 503 });
  }

  const user = await resolveAuthedUser(request);
  if (!user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const email = user.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'E-mail da conta não encontrado.' }, { status: 400 });
  }

  const proInfo = await getActiveProInfoForUser(user.id);
  if (proInfo.proSource !== 'stripe') {
    return NextResponse.json(
      {
        error:
          'Sua assinatura não é gerenciada pelo Stripe. Veja os detalhes em Minha assinatura.',
      },
      { status: 403 },
    );
  }

  try {
    const customerId = await findStripeCustomerIdByEmail(stripe, email);
    if (!customerId) {
      return NextResponse.json(
        {
          error:
            'Não encontramos sua assinatura no Stripe. Se você acabou de assinar, aguarde alguns minutos ou fale conosco.',
        },
        { status: 404 },
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: getAbsoluteUrl('/conta/assinatura'),
    });

    if (!portalSession.url) {
      return NextResponse.json({ error: 'Portal indisponível no momento.' }, { status: 502 });
    }

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    logger.error('Falha ao criar sessão do Billing Portal Pro', error, { userId: user.id });
    return NextResponse.json(
      { error: 'Não foi possível abrir o portal de assinatura.' },
      { status: 500 },
    );
  }
}
