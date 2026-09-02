/**
 * Proteção centralizada de alvo para testes E2E (Playwright).
 *
 * REGRAS DE SEGURANÇA (fail-closed):
 * 1. Playwright genérico só pode rodar em loopback (localhost, 127.0.0.1, [::1]).
 * 2. Domínios de Production (avant.enf.br, avantmed.app e subdomínios) são SEMPRE bloqueados.
 * 3. Staging/remote requer sinal explícito de autorização (opts.allowStaging = true).
 * 4. Nenhuma configuração pode autorizar Production, mesmo com opt-in de staging.
 */

export type E2eTargetClassification =
  | 'loopback'
  | 'staging'
  | 'production'
  | 'remote_disallowed'
  | 'invalid';

export type TargetSafetyOptions = {
  /** Permite host remoto se for explicitamente um runner/ambiente de staging. */
  allowStaging?: boolean;
};

/** Domínios canônicos de produção do AVANT. */
const PRODUCTION_DOMAINS = [
  'avant.enf.br',
  'avantmed.app',
] as const;

/**
 * Normaliza o hostname removendo colchetes de IPv6 se presentes.
 */
function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/^\[|\]$/g, '');
}

/**
 * Verifica se o host é um loopback seguro.
 */
export function isLoopbackHost(hostname: string): boolean {
  const norm = normalizeHostname(hostname);
  return norm === 'localhost' || norm === '127.0.0.1' || norm === '::1';
}

/**
 * Identifica se o hostname pertence à infraestrutura de produção canônica.
 * Cobre domínios exatos e subdomínios (ex.: www.avant.enf.br, app.avantmed.app).
 */
export function isProductionHost(hostname: string): boolean {
  const norm = normalizeHostname(hostname);
  for (const domain of PRODUCTION_DOMAINS) {
    if (norm === domain || norm.endsWith(`.${domain}`)) {
      return true;
    }
  }
  return false;
}

/**
 * Classifica a URL alvo conforme as regras de segurança E2E.
 */
export function classifyTarget(
  rawUrl: string,
  opts: TargetSafetyOptions = {},
): E2eTargetClassification {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return 'invalid';
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return 'invalid';
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return 'invalid';
  }

  const hostname = parsed.hostname;

  // Regra 1 (máxima precedência): Produção é SEMPRE bloqueada (fail-closed)
  if (isProductionHost(hostname)) {
    return 'production';
  }

  // Regra 2: Loopback local sempre permitido
  if (isLoopbackHost(hostname)) {
    return 'loopback';
  }

  // Regra 3: Staging remoto permitido SOMENTE com autorização explícita
  if (opts.allowStaging) {
    return 'staging';
  }

  // Regra 4: Qualquer outro host remoto sem autorização explícita é bloqueado
  return 'remote_disallowed';
}

export type AssertTargetSafeResult = {
  baseUrl: string;
  classification: 'loopback' | 'staging';
};

/**
 * Valida o alvo E2E fail-closed. Lança erro descritivo se a URL não for permitida.
 */
export function assertE2eTargetSafe(
  rawUrl: string,
  opts: TargetSafetyOptions = {},
): AssertTargetSafeResult {
  const classification = classifyTarget(rawUrl, opts);

  switch (classification) {
    case 'loopback':
      return { baseUrl: new URL(rawUrl.trim()).origin, classification: 'loopback' };

    case 'staging':
      return { baseUrl: new URL(rawUrl.trim()).origin, classification: 'staging' };

    case 'production':
      throw new Error(
        `[E2E_TARGET_SAFETY] EXECUÇÃO BLOQUEADA (fail-closed): O alvo "${rawUrl}" foi classificado como PRODUCTION. ` +
          'Testes automatizados do Playwright NUNCA podem ser executados contra a infraestrutura de produção.',
      );

    case 'remote_disallowed':
      throw new Error(
        `[E2E_TARGET_SAFETY] EXECUÇÃO BLOQUEADA: O alvo remoto "${rawUrl}" não foi autorizado. ` +
          'O Playwright genérico por padrão só pode rodar em loopback (localhost, 127.0.0.1, [::1]). ' +
          'Para executar contra staging, utilize um runner explicitamente configurado com opt-in de staging.',
      );

    case 'invalid':
    default:
      throw new Error(
        `[E2E_TARGET_SAFETY] EXECUÇÃO BLOQUEADA: URL do alvo E2E é inválida ou possui protocolo não suportado: "${rawUrl}".`,
      );
  }
}