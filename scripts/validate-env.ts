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
  const campinaPrice = process.env.STRIPE_PRICE_ID_CAMPINA?.trim();
  if (!campinaPrice) {
    console.warn(
      '⚠️  STRIPE_PRICE_ID_CAMPINA ausente: a landing /campina-grande não conseguirá abrir o Checkout até configurar o Price ID.',
    );
  } else if (!campinaPrice.startsWith('price_')) {
    console.warn('⚠️  STRIPE_PRICE_ID_CAMPINA deve começar com price_ (Price ID do Stripe).');
  }
  const goianinhaPrice = process.env.STRIPE_PRICE_ID_GOIANINHA?.trim();
  if (!goianinhaPrice) {
    console.warn(
      '⚠️  STRIPE_PRICE_ID_GOIANINHA ausente: a landing /goianinha não conseguirá abrir o Checkout até configurar o Price ID.',
    );
  } else if (!goianinhaPrice.startsWith('price_')) {
    console.warn('⚠️  STRIPE_PRICE_ID_GOIANINHA deve começar com price_ (Price ID do Stripe).');
  }
  if (process.env.CRON_SECRET?.trim()) {
    console.log('✅ CRON_SECRET configurado para expiração de matrículas');
  } else if (process.env.NODE_ENV !== 'production') {
    console.log('ℹ️  CRON_SECRET ausente (opcional em dev; necessário na Vercel com Stripe ativo)');
  }
} else if (process.env.NODE_ENV !== 'production') {
  console.log('ℹ️  Stripe não configurado (checkout desabilitado neste ambiente)');
}

console.log('✅ Variáveis de ambiente OK');
