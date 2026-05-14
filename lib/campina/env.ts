import { z } from 'zod';

const StripePriceIdSchema = z
  .string()
  .min(1)
  .regex(/^price_/, 'STRIPE_PRICE_ID_CAMPINA deve ser um Price ID Stripe (price_…)');

/**
 * Price ID do pacote Campina Grande (Dashboard Stripe → Produtos → Preço).
 * @throws Error com mensagem explícita se ausente ou inválido
 */
export function requireStripePriceIdCampina(): string {
  const raw = process.env.STRIPE_PRICE_ID_CAMPINA;
  if (raw === undefined || raw === null || raw.trim() === '') {
    throw new Error(
      'Variável de ambiente obrigatória ausente ou vazia: STRIPE_PRICE_ID_CAMPINA. ' +
        'Configure o Price ID do produto no Stripe.',
    );
  }

  const parsed = StripePriceIdSchema.safeParse(raw.trim());
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join('; ');
    throw new Error(`STRIPE_PRICE_ID_CAMPINA inválido: ${msg}`);
  }

  return parsed.data;
}
