/**
 * Constantes compartilhadas do sistema
 */

/**
 * E-mail do administrador oficial do sistema
 * Usado para verificar permissões de acesso administrativo
 * Configurável via variável de ambiente ADMIN_EMAIL
 */
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'gvvariedades@gmail.com';

/**
 * Retorna o e-mail do admin em lowercase para comparação
 */
export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || ADMIN_EMAIL).toLowerCase();
}

