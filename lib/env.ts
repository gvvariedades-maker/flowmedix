/**
 * Validação de Variáveis de Ambiente
 *
 * Valida que todas as variáveis de ambiente necessárias estão presentes.
 * Deve ser chamado no início da aplicação (app/layout.tsx ou middleware.ts).
 */

import { z } from 'zod';

interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  GOOGLE_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  CRON_SECRET?: string;
  NODE_ENV: string;
}

const StripeSecretKeySchema = z
  .string()
  .min(1)
  .regex(/^sk_(test|live)_/, 'STRIPE_SECRET_KEY deve começar com sk_test_ ou sk_live_');

const StripeWebhookSecretSchema = z
  .string()
  .min(1)
  .regex(/^whsec_/, 'STRIPE_WEBHOOK_SECRET deve começar com whsec_');

const StripePublishableKeySchema = z
  .string()
  .min(1)
  .regex(/^pk_(test|live)_/, 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY deve começar com pk_test_ ou pk_live_');

const StripeEnvSchema = z.object({
  STRIPE_SECRET_KEY: StripeSecretKeySchema.optional(),
  STRIPE_WEBHOOK_SECRET: StripeWebhookSecretSchema.optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: StripePublishableKeySchema.optional(),
});

export type StripeEnv = z.infer<typeof StripeEnvSchema>;

export type StripeServerConfig = {
  secretKey: string;
  webhookSecret: string;
  publishableKey?: string;
};

function readTrimmedEnv(key: keyof EnvConfig): string | undefined {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    return undefined;
  }

  return value.trim();
}

function formatZodIssues(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
}

/**
 * Valida variáveis de ambiente obrigatórias
 * @throws Error se alguma variável obrigatória estiver faltando
 */
export function validateEnv(): void {
  const required: (keyof EnvConfig)[] = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const optional: (keyof EnvConfig)[] = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'CRON_SECRET',
  ];

  const missing: string[] = [];
  const warnings: string[] = [];

  required.forEach((key) => {
    if (!readTrimmedEnv(key)) {
      missing.push(key);
    }
  });

  optional.forEach((key) => {
    if (!readTrimmedEnv(key)) {
      warnings.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(
      `⚠️  Optional environment variables not set: ${warnings.join(', ')}\n` +
      'Some features may not work correctly.'
    );
  }
}

/**
 * Valida formato de URL do Supabase
 */
export function validateSupabaseUrl(): void {
  const url = readTrimmedEnv('NEXT_PUBLIC_SUPABASE_URL');
  if (!url) return;

  try {
    new URL(url);
  } catch {
    throw new Error(
      `❌ Invalid NEXT_PUBLIC_SUPABASE_URL format: ${url}\n` +
      'Expected a valid URL (e.g., https://your-project.supabase.co)'
    );
  }
}

/**
 * Valida variáveis Stripe quando informadas.
 * NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY permanece opcional (Checkout redirect no servidor).
 */
export function validateStripeEnv(): void {
  const stripeEnv = {
    STRIPE_SECRET_KEY: readTrimmedEnv('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: readTrimmedEnv('STRIPE_WEBHOOK_SECRET'),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: readTrimmedEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  };

  const parsed = StripeEnvSchema.safeParse(stripeEnv);
  if (!parsed.success) {
    throw new Error(`❌ Invalid Stripe environment variables: ${formatZodIssues(parsed.error)}`);
  }

  const hasSecretKey = Boolean(stripeEnv.STRIPE_SECRET_KEY);
  const hasWebhookSecret = Boolean(stripeEnv.STRIPE_WEBHOOK_SECRET);
  const hasPublishableKey = Boolean(stripeEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const stripeCompleto = hasSecretKey && hasWebhookSecret;

  if (!stripeCompleto) {
    if (!hasSecretKey && !hasWebhookSecret) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '⚠️  Stripe checkout/webhook desativados: defina STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET para habilitar.',
        );
      }
    } else {
      console.warn(
        '⚠️  Stripe incompleto: na Vercel configure STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET juntos. ' +
          'Enquanto faltar um deles, o build segue e o servidor trata pagamentos como desligados (getStripeServerConfig = null).',
      );
    }
  }

  if (!hasPublishableKey && stripeCompleto && process.env.NODE_ENV === 'development') {
    console.warn(
      '⚠️  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not set. Checkout redirect can work without it; Stripe Elements needs this key.',
    );
  }
}

/**
 * Valida CRON_SECRET quando checkout Stripe está habilitado.
 */
export function validateCronEnv(): void {
  const cronSecret = readTrimmedEnv('CRON_SECRET');
  const stripeConfig = getStripeServerConfig();

  if (!stripeConfig) {
    return;
  }

  if (cronSecret) {
    return;
  }

  const message =
    'CRON_SECRET not set. Configure it on Vercel for the enrollment expiration cron when Stripe checkout is enabled.';

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`❌ ${message}`);
  }

  console.warn(`⚠️  ${message}`);
}

/**
 * Configuração Stripe para rotas server-side (checkout e webhook).
 */
export function getStripeServerConfig(): StripeServerConfig | null {
  const secretKey = readTrimmedEnv('STRIPE_SECRET_KEY');
  const webhookSecret = readTrimmedEnv('STRIPE_WEBHOOK_SECRET');
  const publishableKey = readTrimmedEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');

  if (!secretKey || !webhookSecret) {
    return null;
  }

  return {
    secretKey,
    webhookSecret,
    publishableKey,
  };
}

/**
 * Valida todas as variáveis de ambiente
 */
export function validateAllEnv(): void {
  validateEnv();
  validateSupabaseUrl();
  validateStripeEnv();
  validateCronEnv();
}
