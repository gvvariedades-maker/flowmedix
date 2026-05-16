'use server';

import { redirect, unstable_rethrow } from 'next/navigation';
import { z } from 'zod';
import { getStripeClient } from '@/lib/stripe/client';
import { STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES } from '@/lib/stripe/checkoutOptions';
import { requireStripePriceIdGoianinha } from '@/lib/goianinha/env';
import { getAbsoluteUrl } from '@/lib/siteUrl';
import { GOIANINHA_PRODUTO_ID } from '@/lib/goianinha/constants';
import { logger } from '@/lib/logger';

const GoianinhaCheckoutFormSchema = z.object({
  intent: z.literal('goianinha-checkout'),
});

function redirectCheckoutError(code: 'invalido' | 'pagamentos' | 'config' | 'checkout'): never {
  redirect(`/goianinha?erro=${code}`);
}

export async function iniciarCheckoutGoianinha(formData: FormData) {
  const parsed = GoianinhaCheckoutFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    redirectCheckoutError('invalido');
  }

  const stripe = getStripeClient();
  if (!stripe) {
    redirectCheckoutError('pagamentos');
  }

  let priceId: string;
  try {
    priceId = requireStripePriceIdGoianinha();
  } catch (error) {
    logger.error('Checkout Goianinha sem STRIPE_PRICE_ID_GOIANINHA', error);
    redirectCheckoutError('config');
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: [...STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        produto: GOIANINHA_PRODUTO_ID,
      },
      success_url: getAbsoluteUrl('/sucesso?session_id={CHECKOUT_SESSION_ID}'),
      cancel_url: getAbsoluteUrl('/goianinha'),
    });

    if (!checkoutSession.url) {
      redirectCheckoutError('checkout');
    }

    redirect(checkoutSession.url);
  } catch (error) {
    unstable_rethrow(error);
    logger.error('Falha ao criar sessão Stripe Goianinha', error);
    redirectCheckoutError('checkout');
  }
}
