import type Stripe from 'stripe';

/** Busca customer Stripe pelo e-mail (checkout Pro usa customer_email). */
export async function findStripeCustomerIdByEmail(
  stripe: Stripe,
  email: string,
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const { data } = await stripe.customers.list({ email: normalized, limit: 1 });
  const customer = data[0];
  if (!customer || ('deleted' in customer && customer.deleted)) return null;
  return customer.id;
}
