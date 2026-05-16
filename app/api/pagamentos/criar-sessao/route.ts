import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getServerSession } from '@/lib/supabase/server-auth';
import { CriarSessaoPagamentoSchema } from '@/lib/validations';
import {
  CAMPINA_GRANDE_2026_SLUG,
  CAMPINA_GRANDE_LANDING_HREF,
  GERAL_CONCURSO_SLUG,
  getConcursoBySlug,
  isActiveMatriculaRow,
} from '@/lib/concursos/entitlements';
import { isUserPro } from '@/lib/freemium';
import { AVANT_PRO_PRODUTO_ID } from '@/lib/pro/constants';
import { requireStripePriceIdPro } from '@/lib/pro/env';
import { getStripeClient } from '@/lib/stripe/client';
import { STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES } from '@/lib/stripe/checkoutOptions';
import { getAbsoluteUrl } from '@/lib/siteUrl';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
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

  if (concursoSlug === GERAL_CONCURSO_SLUG) {
    try {
      if (await isUserPro(session.user.id)) {
        return NextResponse.json(
          {
            error: 'Você já tem acesso AVANT Pro.',
            redirectUrl: '/estudar',
          },
          { status: 409 },
        );
      }
    } catch (error) {
      logger.error('Falha ao verificar assinatura Pro no checkout', error, {
        userId: session.user.id,
      });
      return NextResponse.json({ error: 'Erro ao verificar assinatura.' }, { status: 500 });
    }

    let priceId: string;
    try {
      priceId = requireStripePriceIdPro();
    } catch (error) {
      logger.error('Checkout AVANT Pro sem STRIPE_PRICE_ID_PRO', error, { userId: session.user.id });
      return NextResponse.json(
        { error: 'Assinatura Pro indisponível no momento. Tente novamente mais tarde.' },
        { status: 503 },
      );
    }

    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: [...STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES],
        metadata: {
          produto: AVANT_PRO_PRODUTO_ID,
          user_id: session.user.id,
        },
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: getAbsoluteUrl('/sucesso?session_id={CHECKOUT_SESSION_ID}'),
        cancel_url: getAbsoluteUrl('/planos'),
      });

      if (!checkoutSession.url) {
        return NextResponse.json({ error: 'Checkout indisponível no momento.' }, { status: 502 });
      }

      return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
      logger.error('Falha ao criar sessão Stripe AVANT Pro', error, { userId: session.user.id });
      return NextResponse.json({ error: 'Não foi possível iniciar o pagamento.' }, { status: 502 });
    }
  }

  if (concursoSlug === CAMPINA_GRANDE_2026_SLUG) {
    return NextResponse.json(
      {
        error: 'Este edital é adquirido na página do pacote Campina Grande.',
        redirectUrl: CAMPINA_GRANDE_LANDING_HREF,
      },
      { status: 400 },
    );
  }

  let concurso;
  try {
    concurso = await getConcursoBySlug(concursoSlug);
  } catch (error) {
    logger.error('Falha ao buscar concurso vendável', error, {
      concursoSlug,
      userId: session.user.id,
    });
    return NextResponse.json({ error: 'Erro ao carregar concurso.' }, { status: 500 });
  }

  if (!concurso || concurso.status !== 'ativo') {
    return NextResponse.json({ error: 'Concurso não encontrado ou indisponível para compra.' }, { status: 404 });
  }

  if (!concurso.price_cents || concurso.price_cents <= 0) {
    return NextResponse.json(
      { error: 'Este concurso não possui preço configurado para compra.' },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: matricula, error: matriculaError } = await supabase
    .from('concurso_matriculas')
    .select('status, expires_at')
    .eq('user_id', session.user.id)
    .eq('concurso_id', concurso.id)
    .maybeSingle();

  if (matriculaError) {
    logger.error('Falha ao verificar matrícula ativa', matriculaError, {
      concursoSlug,
      userId: session.user.id,
    });
    return NextResponse.json({ error: 'Erro ao verificar acesso existente.' }, { status: 500 });
  }

  if (matricula && isActiveMatriculaRow(matricula)) {
    return NextResponse.json(
      {
        error: 'Você já tem acesso a este concurso.',
        redirectUrl: '/estudar',
      },
      { status: 409 },
    );
  }

  const { data: purchase, error: purchaseError } = await supabase
    .from('concurso_purchases')
    .insert({
      user_id: session.user.id,
      concurso_id: concurso.id,
      amount: concurso.price_cents,
      status: 'pending',
      gateway: 'stripe',
      currency: 'brl',
    })
    .select('id')
    .single();

  if (purchaseError || !purchase?.id) {
    logger.error('Falha ao registrar compra pendente', purchaseError, {
      concursoSlug,
      userId: session.user.id,
    });
    return NextResponse.json({ error: 'Não foi possível iniciar o pagamento.' }, { status: 500 });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: [...STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES],
      client_reference_id: purchase.id,
      metadata: {
        purchase_id: purchase.id,
        user_id: session.user.id,
        concurso_id: concurso.id,
        concurso_slug: concurso.slug,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'brl',
            unit_amount: concurso.price_cents,
            product_data: {
              name: concurso.nome,
              description: `Acesso ao edital ${concurso.slug}`,
            },
          },
        },
      ],
      success_url: getAbsoluteUrl('/estudar?compra=sucesso'),
      cancel_url: getAbsoluteUrl(`/concursos/${concurso.slug}/comprar?cancelado=1`),
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: 'Checkout indisponível no momento.' }, { status: 502 });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    logger.error('Falha ao criar sessão Stripe', error, {
      purchaseId: purchase.id,
      userId: session.user.id,
    });
    return NextResponse.json({ error: 'Não foi possível iniciar o pagamento.' }, { status: 502 });
  }
}
