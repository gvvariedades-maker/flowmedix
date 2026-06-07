import { NextRequest, NextResponse } from 'next/server';
import { CriarSessaoPagamentoSchema } from '@/lib/validations';
import { GERAL_CONCURSO_SLUG } from '@/lib/concursos/entitlements';
import { isAdminSessionEmail } from '@/lib/constants';
import { userHasUnlimitedStudyAccess } from '@/lib/freemium';
import { AVANT_PRO_PRODUTO_ID } from '@/lib/pro/constants';
import { requireStripePriceIdPro } from '@/lib/pro/env';
import { getStripeClient } from '@/lib/stripe/client';
import { STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES } from '@/lib/stripe/checkoutOptions';
import { getAbsoluteUrl } from '@/lib/siteUrl';
import { logger } from '@/lib/logger';
import { distributedRateLimit } from '@/lib/rate-limit';
import { getServerUser } from '@/lib/supabase/server-auth';

export async function POST(request: NextRequest) {
  if (!(await distributedRateLimit(request, { key: 'criar-sessao', limit: 10, windowMs: 60_000 }))) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em alguns instantes.' },
      { status: 429 },
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: 'Pagamentos indisponíveis no momento.' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 });
  }

  const parsed = CriarSessaoPagamentoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const concursoSlug = parsed.data.concurso_slug;
  const user = await getServerUser();
  const userId = user?.id;

  if (concursoSlug !== GERAL_CONCURSO_SLUG) {
    return NextResponse.json(
      {
        error: 'A assinatura AVANT Pro é adquirida pela landing ou em /assinar-pro.',
        redirectUrl: '/assinar-pro',
      },
      { status: 400 },
    );
  }

  const sessionEmail = user?.email ?? null;
  try {
    if (await userHasUnlimitedStudyAccess(userId, sessionEmail)) {
      const redirectUrl = isAdminSessionEmail(sessionEmail) ? '/admin' : '/estudar';
      return NextResponse.json(
        {
          error: 'Você já tem acesso completo ao AVANT.',
          redirectUrl,
        },
        { status: 409 },
      );
    }
  } catch (error) {
    logger.error('Falha ao verificar acesso ilimitado no checkout', error, { userId });
    return NextResponse.json({ error: 'Erro ao verificar assinatura.' }, { status: 500 });
  }

  let priceId: string;
  try {
    priceId = requireStripePriceIdPro();
  } catch (error) {
    logger.error('Checkout AVANT Pro sem STRIPE_PRICE_ID_PRO', error, { userId });
    return NextResponse.json(
      { error: 'Assinatura Pro indisponível no momento. Tente novamente mais tarde.' },
      { status: 503 },
    );
  }

  const loggedInEmail = user?.email?.trim().toLowerCase();
  const proUserIdMeta = userId ?? '';

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: [...STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES],
      metadata: {
        produto: AVANT_PRO_PRODUTO_ID,
        user_id: proUserIdMeta,
      },
      subscription_data: {
        metadata: {
          user_id: proUserIdMeta,
        },
      },
      ...(loggedInEmail ? { customer_email: loggedInEmail } : {}),
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: getAbsoluteUrl('/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}'),
      cancel_url: getAbsoluteUrl('/'),
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: 'Checkout indisponível no momento.' }, { status: 502 });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    logger.error('Falha ao criar sessão Stripe AVANT Pro', error, { userId });
    return NextResponse.json({ error: 'Não foi possível iniciar o pagamento.' }, { status: 502 });
  }
}
