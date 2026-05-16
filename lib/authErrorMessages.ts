/** Mensagens amigáveis para erros comuns do Supabase Auth (PT-BR). */
export function mapRegisterAuthError(message: string | undefined): string {
  const raw = (message ?? '').toLowerCase();

  if (raw.includes('already registered') || raw.includes('user already exists')) {
    return 'Este e-mail já está cadastrado. Use Entrar agora ou Esqueci minha senha se não lembrar a senha.';
  }

  if (raw.includes('password') && raw.includes('weak')) {
    return 'Senha fraca demais. Use pelo menos 6 caracteres com mais variedade.';
  }

  if (raw.includes('invalid email')) {
    return 'E-mail inválido. Verifique o endereço digitado.';
  }

  if (raw.includes('rate limit') || raw.includes('too many requests')) {
    return 'Muitas tentativas em sequência. Aguarde alguns minutos e tente de novo.';
  }

  return message || 'Erro ao criar conta. Tente novamente.';
}
