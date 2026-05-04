/**
 * Constantes compartilhadas do sistema
 */

/**
 * E-mail do administrador oficial do sistema
 * Usado para verificar permissões de acesso administrativo
 * Obrigatório: variável de ambiente ADMIN_EMAIL.
 */
const adminEmailFromEnv = process.env.ADMIN_EMAIL;
if (!adminEmailFromEnv) {
  throw new Error('ADMIN_EMAIL não configurado nas variáveis de ambiente');
}

export const ADMIN_EMAIL = adminEmailFromEnv;

/**
 * Retorna o e-mail do admin em lowercase para comparação
 */
export function getAdminEmail(): string {
  return ADMIN_EMAIL.toLowerCase();
}
