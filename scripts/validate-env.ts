/**
 * Script para validar variáveis de ambiente.
 * Carrega .env.local antes de validar (tsx não carrega automaticamente).
 */
import { loadEnvConfig } from '@next/env';
import {
  getEvidenceV1InternalEmails,
  getStripeServerConfig,
  isEvidenceV1InstrumentationEnabled,
  validateAllEnv,
} from '../lib/env';

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

const hasSentryDsn = Boolean(
  process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim(),
);
if (hasSentryDsn) {
  console.log('✅ Sentry configurado (crash reporting ativo)');
  const hasUploadCreds = Boolean(
    process.env.SENTRY_AUTH_TOKEN?.trim() &&
      process.env.SENTRY_ORG?.trim() &&
      process.env.SENTRY_PROJECT?.trim(),
  );
  if (!hasUploadCreds) {
    console.log(
      'ℹ️  Source maps do Sentry desligados (defina SENTRY_AUTH_TOKEN, SENTRY_ORG e SENTRY_PROJECT no CI para desminificar stack traces).',
    );
  }
} else {
  console.log('ℹ️  Sentry desativado (defina SENTRY_DSN ou NEXT_PUBLIC_SENTRY_DSN para habilitar; app usa /api/client-error).');
}

const cursorKey = process.env.CURSOR_API_KEY?.trim();
if (cursorKey) {
  console.log('✅ CURSOR_API_KEY configurada (pipeline:orchestrate --sdk)');
} else {
  console.log('ℹ️  CURSOR_API_KEY ausente (opcional; necessária para npm run pipeline:orchestrate -- --sdk) — docs/PIPELINE_SDK_SETUP.md');
}

if (isEvidenceV1InstrumentationEnabled()) {
  const cohortSize = getEvidenceV1InternalEmails().length;
  console.warn(
    `⚠️  EE_V1_INSTRUMENTATION=true neste ambiente (coorte allowlist: ${cohortSize} e-mail(s)). ` +
      'Ingestão em registrar-tentativa + série P4 em /desempenho ativas — docs/SPEC_EVIDENCE_ENGINE_FASE_1_EVENT_STREAM.md §1.13',
  );
} else {
  console.log(
    'ℹ️  EE_V1_INSTRUMENTATION off (default) — Evidence Engine sem instrumentação; /desempenho usa só histórico P0',
  );
}

console.log('✅ Variáveis de ambiente OK');
