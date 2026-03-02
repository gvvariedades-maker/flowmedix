/**
 * Validação de Variáveis de Ambiente
 * 
 * Valida que todas as variáveis de ambiente necessárias estão presentes.
 * Deve ser chamado no início da aplicação (app/layout.tsx ou middleware.ts).
 */

interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  GOOGLE_API_KEY?: string;
  NODE_ENV: string;
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
  ];

  const missing: string[] = [];
  const warnings: string[] = [];

  // Verificar obrigatórias
  required.forEach((key) => {
    if (!process.env[key] || process.env[key]!.trim() === '') {
      missing.push(key);
    }
  });

  // Verificar opcionais (apenas avisar)
  optional.forEach((key) => {
    if (!process.env[key] || process.env[key]!.trim() === '') {
      warnings.push(key);
    }
  });

  // Lançar erro se faltar variáveis obrigatórias
  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env.local file and ensure all required variables are set.`
    );
  }

  // Avisar sobre variáveis opcionais faltantes (apenas em desenvolvimento)
  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(
      `⚠️  Optional environment variables not set: ${warnings.join(', ')}\n` +
      `Some features may not work correctly.`
    );
  }
}

/**
 * Valida formato de URL do Supabase
 */
export function validateSupabaseUrl(): void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return;

  try {
    new URL(url);
  } catch {
    throw new Error(
      `❌ Invalid NEXT_PUBLIC_SUPABASE_URL format: ${url}\n` +
      `Expected a valid URL (e.g., https://your-project.supabase.co)`
    );
  }
}

/**
 * Valida todas as variáveis de ambiente
 * Chama validateEnv() e validateSupabaseUrl()
 */
export function validateAllEnv(): void {
  validateEnv();
  validateSupabaseUrl();
}
