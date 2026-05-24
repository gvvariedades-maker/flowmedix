/** Nome usado na saudação quando não há primeiro nome no cadastro. */
export const WELCOME_SALUTATION_FALLBACK = 'técnico de enfermagem';

/** Saudação do e-mail/modal de boas-vindas (primeiro nome ou cargo padrão). */
export function resolveWelcomeSalutation(firstName?: string | null): string {
  const trimmed = firstName?.trim();
  if (!trimmed) return WELCOME_SALUTATION_FALLBACK;
  if (trimmed.toLowerCase() === 'estudante') return WELCOME_SALUTATION_FALLBACK;
  return trimmed;
}
