'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getStripeClient } from '@/lib/stripe/client';
import { requireStripePriceIdCampina } from '@/lib/campina/env';
import { getAbsoluteUrl } from '@/lib/siteUrl';
import { CAMPINA_GRANDE_PRODUTO_ID } from '@/lib/campina/constants';
import { logger } from '@/lib/logger';

const CampinaCheckoutFormSchema = z.object({
  intent: z.literal('campina-checkout'),
});

function redirectCheckoutError(code: 'invalido' | 'pagamentos' | 'config' | 'checkout'): never {
  redirect(`/campina-grande?erro=${code}`);
}

export async function iniciarCheckoutCampinaGrande(formData: FormData) {
  const parsed = CampinaCheckoutFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    redirectCheckoutError('invalido');
  }

  const stripe = getStripeClient();
  if (!stripe) {
    redirectCheckoutError('pagamentos');
  }

  let priceId: string;
  try {
    priceId = requireStripePriceIdCampina();
  } catch (error) {
    logger.error('Checkout Campina Grande sem STRIPE_PRICE_ID_CAMPINA', error);
    redirectCheckoutError('config');
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        produto: CAMPINA_GRANDE_PRODUTO_ID,
      },
      success_url: getAbsoluteUrl('/sucesso?session_id={CHECKOUT_SESSION_ID}'),
      cancel_url: getAbsoluteUrl('/campina-grande'),
    });

    if (!checkoutSession.url) {
      redirectCheckoutError('checkout');
    }

    redirect(checkoutSession.url);
  } catch (error) {
    logger.error('Falha ao criar sessão Stripe Campina Grande', error);
    redirectCheckoutError('checkout');
  }
}
