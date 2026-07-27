import { resolveIsInternalForAttempt } from '@/lib/evidence/isInternalCohort';

describe('resolveIsInternalForAttempt', () => {
  it('default false para usuário comum', () => {
    expect(
      resolveIsInternalForAttempt({
        user_email: 'aluno@exemplo.com',
        internal_emails_override: ['interno@avant.enf.br'],
      }),
    ).toBe(false);
  });

  it('allowlist válida marca interno', () => {
    expect(
      resolveIsInternalForAttempt({
        user_email: 'Interno@Avant.Enf.br',
        internal_emails_override: ['interno@avant.enf.br'],
      }),
    ).toBe(true);
  });

  it('E2E autorizado apenas via flag server-side', () => {
    expect(
      resolveIsInternalForAttempt({
        user_email: 'aluno@exemplo.com',
        e2e_instrumentation: true,
      }),
    ).toBe(true);
  });

  it('ausência de e-mail não marca interno', () => {
    expect(
      resolveIsInternalForAttempt({
        internal_emails_override: ['interno@avant.enf.br'],
      }),
    ).toBe(false);
  });
});
