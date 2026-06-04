/**
 * Validação de variáveis de ambiente (Zod) e objeto `env` tipado.
 * Usado em build (`validate:env`), startup (`validateAllEnv`) e módulos server-side.
 */

import { z } from 'zod';

const nodeEnvSchema = z.enum(['development', 'production', 'test']);

const stripeSecretKeySchema = z
  .string()
  .min(1)
  .regex(/^sk_(test|live)_/, 'STRIPE_SECRET_KEY deve começar com sk_test_ ou sk_live_');

const stripeWebhookSecretSchema = z
  .string()
  .min(1)
  .regex(/^whsec_/, 'STRIPE_WEBHOOK_SECRET deve começar com whsec_');

const stripePublishableKeySchema = z
  .string()
  .min(1)
  .regex(/^pk_(test|live)_/, 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY deve começar com pk_test_ ou pk_live_');

const resendFromEmailSchema = z
  .string()
  .min(3, 'RESEND_FROM_EMAIL é obrigatório')
  .refine((value) => /@/.test(value), {
    message: 'RESEND_FROM_EMAIL deve conter um endereço de e-mail (ex.: Avant <noreply@dominio.com>)',
  });

const EnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({ error: 'NEXT_PUBLIC_SUPABASE_URL é obrigatória' })
    .url('NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string({ error: 'NEXT_PUBLIC_SUPABASE_ANON_KEY é obrigatória' })
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY é obrigatória'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_WEBHOOK_SECRET: z
    .string({ error: 'SUPABASE_WEBHOOK_SECRET é obrigatória' })
    .min(16, 'SUPABASE_WEBHOOK_SECRET deve ter pelo menos 16 caracteres'),
  NEXT_PUBLIC_APP_URL: z
    .string({ error: 'NEXT_PUBLIC_APP_URL é obrigatória' })
    .url('NEXT_PUBLIC_APP_URL deve ser uma URL válida (ex.: https://avant.enf.br)'),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().min(1).optional(),
  GOOGLE_API_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: stripeSecretKeySchema.optional(),
  STRIPE_WEBHOOK_SECRET: stripeWebhookSecretSchema.optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: stripePublishableKeySchema.optional(),
  STRIPE_PRICE_ID_PRO: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(1).optional(),
  /** Legado: fallback em /api/cache/revalidate; preferir SUPABASE_WEBHOOK_SECRET */
  WEBHOOK_SECRET: z.string().min(1).optional(),
  METRICS_SECRET: z.string().min(1).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_EMAILS: z.string().min(1).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export type StripeEnv = {
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
};

export type StripeServerConfig = {
  secretKey: string;
  webhookSecret: string;
  publishableKey?: string;
};

export type ResendServerConfig = {
  apiKey: string;
  fromEmail: string;
};

const resendApiKeySchema = z
  .string()
  .min(1)
  .regex(/^re_/, 'RESEND_API_KEY deve começar com re_');

const ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'GOOGLE_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_PRICE_ID_PRO',
  'CRON_SECRET',
  'WEBHOOK_SECRET',
  'METRICS_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_EMAILS',
] as const;

function readTrimmedEnv(key: string): string | undefined {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    return undefined;
  }
  return value.trim();
}

function collectRawEnv(): Record<string, string | undefined> {
  const raw: Record<string, string | undefined> = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
  };

  for (const key of ENV_KEYS) {
    raw[key] = readTrimmedEnv(key);
  }

  return raw;
}

function formatZodIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'env';
      return `${path}: ${issue.message}`;
    })
    .join('\n');
}

let cachedEnv: Env | undefined;

function parseEnv(): Env {
  const parsed = EnvSchema.safeParse(collectRawEnv());
  if (!parsed.success) {
    throw new Error(
      `❌ Variáveis de ambiente inválidas ou ausentes:\n${formatZodIssues(parsed.error)}\n` +
        'Verifique .env.local (ou variáveis na Vercel) e compare com .env.example.',
    );
  }
  return parsed.data;
}

/** Objeto de ambiente validado (lazy, parse único por processo). */
export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = parseEnv();
  }
  return cachedEnv;
}

export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string | symbol) {
    if (typeof prop !== 'string') {
      return undefined;
    }
    return getEnv()[prop as keyof Env];
  },
}) as Env;

/**
 * @deprecated Preferir `getEnv()` / `env`. Mantido para compatibilidade com scripts legados.
 */
export function validateEnv(): void {
  getEnv();
}

export function validateSupabaseUrl(): void {
  getEnv();
}

const stripeProPriceIdSchema = z
  .string()
  .min(1)
  .regex(/^price_/, 'STRIPE_PRICE_ID_PRO deve começar com price_');

export function validateStripeEnv(): void {
  const current = getEnv();
  const stripeEnv = {
    STRIPE_SECRET_KEY: current.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: current.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: current.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };

  const parsed = z
    .object({
      STRIPE_SECRET_KEY: stripeSecretKeySchema.optional(),
      STRIPE_WEBHOOK_SECRET: stripeWebhookSecretSchema.optional(),
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: stripePublishableKeySchema.optional(),
    })
    .safeParse(stripeEnv);

  if (!parsed.success) {
    throw new Error(`❌ Invalid Stripe environment variables: ${formatZodIssues(parsed.error)}`);
  }

  const hasSecretKey = Boolean(current.STRIPE_SECRET_KEY);
  const hasWebhookSecret = Boolean(current.STRIPE_WEBHOOK_SECRET);
  const hasPublishableKey = Boolean(current.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const stripeCompleto = hasSecretKey && hasWebhookSecret;

  if (!stripeCompleto) {
    if (!hasSecretKey && !hasWebhookSecret) {
      if (current.NODE_ENV === 'development') {
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

  if (!hasPublishableKey && stripeCompleto && current.NODE_ENV === 'development') {
    console.warn(
      '⚠️  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not set. Checkout redirect can work without it; Stripe Elements needs this key.',
    );
  }
}

export function validateProPriceEnv(): void {
  const current = getEnv();
  const stripeConfig = getStripeServerConfig();
  if (!stripeConfig) {
    return;
  }

  const raw = current.STRIPE_PRICE_ID_PRO;
  if (!raw) {
    const message =
      'STRIPE_PRICE_ID_PRO não configurado. Defina o Price ID recorrente do AVANT Pro (Stripe → Produtos).';

    if (current.NODE_ENV === 'production') {
      throw new Error(`❌ ${message}`);
    }

    console.warn(`⚠️  ${message}`);
    return;
  }

  const parsed = stripeProPriceIdSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`❌ STRIPE_PRICE_ID_PRO inválido: ${formatZodIssues(parsed.error)}`);
  }
}

export function getResendServerConfig(): ResendServerConfig | null {
  const current = getEnv();
  const apiKey = current.RESEND_API_KEY;
  const fromEmail = current.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return null;
  }

  const parsedKey = resendApiKeySchema.safeParse(apiKey);
  const parsedFrom = resendFromEmailSchema.safeParse(fromEmail);
  if (!parsedKey.success || !parsedFrom.success) {
    return null;
  }

  return {
    apiKey: parsedKey.data,
    fromEmail: parsedFrom.data,
  };
}

export function validateResendEnv(): void {
  const current = getEnv();
  const apiKey = current.RESEND_API_KEY;
  const fromEmail = current.RESEND_FROM_EMAIL;

  if (!apiKey && !fromEmail) {
    if (current.NODE_ENV === 'production') {
      console.warn(
        '⚠️  Resend desativado: defina RESEND_API_KEY (re_…) e RESEND_FROM_EMAIL para e-mails de boas-vindas.',
      );
    }
    return;
  }

  if (apiKey) {
    const parsedKey = resendApiKeySchema.safeParse(apiKey);
    if (!parsedKey.success) {
      const message = `RESEND_API_KEY inválido: ${formatZodIssues(parsedKey.error)}`;
      if (current.NODE_ENV === 'production') {
        console.warn(`⚠️  ${message} E-mails transacionais ficam desativados até corrigir na Vercel.`);
        return;
      }
      throw new Error(`❌ ${message}`);
    }
  }

  if (fromEmail) {
    const parsedFrom = resendFromEmailSchema.safeParse(fromEmail);
    if (!parsedFrom.success) {
      const message = `RESEND_FROM_EMAIL inválido: ${formatZodIssues(parsedFrom.error)}`;
      if (current.NODE_ENV === 'production') {
        console.warn(`⚠️  ${message} E-mails transacionais ficam desativados até corrigir na Vercel.`);
        return;
      }
      throw new Error(`❌ ${message}`);
    }
  }

  if ((apiKey && !fromEmail) || (!apiKey && fromEmail)) {
    console.warn(
      '⚠️  Resend incompleto: configure RESEND_API_KEY e RESEND_FROM_EMAIL juntos. E-mails transacionais desativados.',
    );
  }
}

export function validateCronEnv(): void {
  const current = getEnv();
  const stripeConfig = getStripeServerConfig();

  if (!stripeConfig || current.CRON_SECRET) {
    return;
  }

  const message =
    'CRON_SECRET not set. Configure it on Vercel for the enrollment expiration cron when Stripe checkout is enabled.';

  if (current.NODE_ENV === 'production') {
    throw new Error(`❌ ${message}`);
  }

  console.warn(`⚠️  ${message}`);
}

export function getStripeServerConfig(): StripeServerConfig | null {
  const current = getEnv();
  const secretKey = current.STRIPE_SECRET_KEY;
  const webhookSecret = current.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return null;
  }

  return {
    secretKey,
    webhookSecret,
    publishableKey: current.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };
}

export function validateAllEnv(): void {
  getEnv();
  validateSupabaseUrl();
  validateStripeEnv();
  validateResendEnv();
  validateProPriceEnv();
  validateCronEnv();
}
