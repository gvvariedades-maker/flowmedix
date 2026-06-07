/**
 * Script para validar variáveis de ambiente.
 * Carrega .env.local antes de validar (tsx não carrega automaticamente).
 */
import { loadEnvConfig } from '@next/env';
import { getStripeServerConfig, validateAllEnv } from '../lib/env';

// Carregar .env.local, .env.development.local, etc.
loadEnvConfig(process.cwd());

validateAllEnv();

const stripeConfig = getStripeServerConfig();
if (stripeConfig) {
  console.log('✅ Stripe configurado para checkout/webhook');
  const proPrice = process.env.STRIPE_PRICE_ID_PRO?.trim();
  if (!proPrice) {
    console.warn(
      '⚠️  STRIPE_PRICE_ID_PRO ausente: o checkout AVANT Pro (/planos, paywall) não conseguirá abrir até configurar o Price ID.',
    );
  } else if (!proPrice.startsWith('price_')) {
    console.warn('⚠️  STRIPE_PRICE_ID_PRO deve começar com price_ (Price ID do Stripe).');
  }
  if (process.env.CRON_SECRET?.trim()) {
    console.log('✅ CRON_SECRET configurado para expiração de matrículas');
  } else if (process.env.NODE_ENV !== 'production') {
    console.log('ℹ️  CRON_SECRET ausente (opcional em dev; necessário na Vercel com Stripe ativo)');
  }
} else if (process.env.NODE_ENV !== 'production') {
  console.log('ℹ️  Stripe não configurado (checkout desabilitado neste ambiente)');
}

const hasUpstash =
  Boolean(process.env.UPSTASH_REDIS_REST_URL?.trim() || process.env.KV_REST_API_URL?.trim()) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || process.env.KV_REST_API_TOKEN?.trim());
if (hasUpstash) {
  console.log('✅ Upstash Redis configurado (rate limit distribuído)');
} else if (process.env.NODE_ENV === 'production') {
  console.warn(
    '⚠️  Upstash ausente em produção — rate limit usará fallback in-memory (não distribuído em serverless).',
  );
} else {
  console.log('ℹ️  Upstash ausente (opcional em dev; rate limit in-memory)');
}

console.log('✅ Variáveis de ambiente OK');
