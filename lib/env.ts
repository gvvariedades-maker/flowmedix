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

/**
 * Gate de ADMIN_EMAIL no build/runtime.
 * - Vercel Production → obrigatório
 * - Vercel Preview/Development → opcional (NODE_ENV=production no build, mas não é prod)
 * - Fora da Vercel com NODE_ENV=production → obrigatório (build local/CI)
 */
export function requiresAdminEmailInEnv(
  nodeEnv: string | undefined = process.env.NODE_ENV,
  vercelEnv: string | undefined = process.env.VERCEL_ENV,
): boolean {
  const vercel = vercelEnv?.trim();
  if (vercel === 'preview' || vercel === 'development') return false;
  if (vercel === 'production') return true;
  return nodeEnv === 'production';
}

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
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  /** Injetadas pela integração Vercel Marketplace (Upstash for Redis) */
  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z
    .string()
    .regex(/^\d{10,15}$/, 'NEXT_PUBLIC_WHATSAPP_NUMBER deve conter só dígitos (DDI + DDD + número)')
    .optional(),
  /**
   * Sentry (observabilidade) — todas opcionais. Sem DSN, o Sentry fica
   * desativado (no-op) e a app continua usando o seam /api/client-error.
   */
  SENTRY_DSN: z.string().min(1).optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().min(1).optional(),
  /**
   * Ordem dos NeuroSlides: omitido ou `v2` (padrão) = concept_map → logic_flow → golden_rule → danger_zone;
   * `legacy` = concept_map → golden_rule → logic_flow → danger_zone (catálogo antigo).
   */
  NEXT_PUBLIC_REVERSE_STUDY_SLIDE_ORDER: z.enum(['legacy', 'v2']).optional(),
  /** Token usado só em CI para upload de source maps (withSentryConfig). */
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
  SENTRY_ORG: z.string().min(1).optional(),
  SENTRY_PROJECT: z.string().min(1).optional(),
}).superRefine((data, ctx) => {
  /**
   * Na Vercel, Preview/Development também rodam `next build` com NODE_ENV=production.
   * Exigir ADMIN_EMAIL só no deploy de produção real (VERCEL_ENV=production) ou em
   * `next build` local/CI sem Vercel — evita falha de Preview por env branch-scoped.
   */
  if (requiresAdminEmailInEnv(data.NODE_ENV)) {
    if (!data.ADMIN_EMAIL?.trim() && !data.ADMIN_EMAILS?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'ADMIN_EMAIL ou ADMIN_EMAILS é obrigatório em produção',
        path: ['ADMIN_EMAIL'],
      });
    }
  }
  if (data.NODE_ENV === 'production' && !data.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    ctx.addIssue({
      code: 'custom',
      message: 'SUPABASE_SERVICE_ROLE_KEY é obrigatória em produção',
      path: ['SUPABASE_SERVICE_ROLE_KEY'],
    });
  }
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
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
  'NEXT_PUBLIC_WHATSAPP_NUMBER',
  'SENTRY_DSN',
  'NEXT_PUBLIC_SENTRY_DSN',
  'NEXT_PUBLIC_REVERSE_STUDY_SLIDE_ORDER',
  'SENTRY_AUTH_TOKEN',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
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
      'STRIPE_PRICE_ID_PRO não configurado. Defina o Price ID recorrente do AVANT enf Pro (Stripe → Produtos).';

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

  const isProductionDeploy =
    current.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'preview';

  if (isProductionDeploy) {
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

export function validateUpstashEnv(): void {
  const current = getEnv();
  if (current.NODE_ENV !== 'production') return;

  const hasUpstashUrl = Boolean(current.UPSTASH_REDIS_REST_URL?.trim() || current.KV_REST_API_URL?.trim());
  const hasUpstashToken = Boolean(
    current.UPSTASH_REDIS_REST_TOKEN?.trim() || current.KV_REST_API_TOKEN?.trim(),
  );

  if (hasUpstashUrl && hasUpstashToken) return;

  if (hasUpstashUrl !== hasUpstashToken) {
    console.warn(
      '⚠️  Upstash incompleto: configure URL e TOKEN (UPSTASH_* ou KV_REST_API_* da Vercel). Rate limit cai para in-memory.',
    );
    return;
  }

  console.warn(
    '⚠️  Upstash Redis não configurado em produção — rate limit in-memory (não distribuído em serverless).',
  );
}

/**
 * DSN efetivo do Sentry no servidor: prefere SENTRY_DSN; cai para o público
 * (NEXT_PUBLIC_SENTRY_DSN) quando só esse estiver configurado. `null` = Sentry
 * desativado no servidor (no-op).
 */
export function getSentryServerDsn(): string | null {
  const current = getEnv();
  return current.SENTRY_DSN?.trim() || current.NEXT_PUBLIC_SENTRY_DSN?.trim() || null;
}

/** Indica se o Sentry está habilitado no servidor (há DSN). */
export function isSentryServerEnabled(): boolean {
  return getSentryServerDsn() !== null;
}

export function validateSentryEnv(): void {
  const current = getEnv();
  const dsn = getSentryServerDsn();

  if (!dsn) {
    if (current.NODE_ENV !== 'production') {
      console.log('ℹ️  Sentry desativado (defina SENTRY_DSN ou NEXT_PUBLIC_SENTRY_DSN para habilitar).');
    }
    return;
  }

  // Source maps só sobem em CI quando há token + org + project. Sem eles o
  // build continua e os erros chegam ao Sentry (apenas sem desminificação).
  const hasUploadCreds =
    Boolean(current.SENTRY_AUTH_TOKEN?.trim()) &&
    Boolean(current.SENTRY_ORG?.trim()) &&
    Boolean(current.SENTRY_PROJECT?.trim());

  if (!hasUploadCreds && process.env.CI) {
    console.warn(
      '⚠️  Sentry ativo, mas upload de source maps desligado: defina SENTRY_AUTH_TOKEN, SENTRY_ORG e SENTRY_PROJECT no CI.',
    );
  }
}

export function validateAllEnv(): void {
  getEnv();
  validateSupabaseUrl();
  validateStripeEnv();
  validateResendEnv();
  validateProPriceEnv();
  validateCronEnv();
  validateUpstashEnv();
  validateSentryEnv();
}
