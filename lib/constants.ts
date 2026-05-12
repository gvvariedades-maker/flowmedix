/**
 * Constantes compartilhadas do sistema
 */

/**
 * E-mail do administrador oficial do sistema.
 * Usado para verificar permissões de acesso administrativo.
 *
 * IMPORTANTE: `ADMIN_EMAIL` é uma variável de ambiente SOMENTE de servidor
 * (sem prefixo NEXT_PUBLIC_). Em bundles de client nunca estará disponível.
 * Por isso NÃO lançamos erro no nível de módulo — isso quebraria toda página
 * do dashboard. A validação deve ocorrer nos Route Handlers que precisam dela.
 */
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? '';

/**
 * Retorna o e-mail do admin em lowercase para comparação segura.
 * No client retorna '' (acesso admin nunca liberado no browser).
 */
export function getAdminEmail(): string {
  return ADMIN_EMAIL.toLowerCase();
}

/**
 * Valida no servidor que ADMIN_EMAIL está configurado.
 * Use exclusivamente em Route Handlers / Server Actions — nunca em Client Components.
 */
export function requireAdminEmail(): string {
  if (!ADMIN_EMAIL) {
    throw new Error('ADMIN_EMAIL não configurado nas variáveis de ambiente');
  }
  return ADMIN_EMAIL.toLowerCase();
}
