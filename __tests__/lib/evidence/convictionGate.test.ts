import { shouldShowConvictionUi } from '@/lib/evidence/convictionGate';

describe('shouldShowConvictionUi', () => {
  it('false quando instrumentação está desligada, mesmo na allowlist', () => {
    expect(
      shouldShowConvictionUi({
        email: 'interno@avant.enf.br',
        instrumentationEnabled: false,
        internalEmails: ['interno@avant.enf.br'],
      }),
    ).toBe(false);
  });

  it('false para usuário fora da allowlist', () => {
    expect(
      shouldShowConvictionUi({
        email: 'aluno@exemplo.com',
        instrumentationEnabled: true,
        internalEmails: ['interno@avant.enf.br'],
      }),
    ).toBe(false);
  });

  it('true para e-mail na allowlist com instrumentação ligada', () => {
    expect(
      shouldShowConvictionUi({
        email: 'Interno@Avant.Enf.br',
        instrumentationEnabled: true,
        internalEmails: ['interno@avant.enf.br'],
      }),
    ).toBe(true);
  });

  it('false quando e-mail ausente', () => {
    expect(
      shouldShowConvictionUi({
        email: null,
        instrumentationEnabled: true,
        internalEmails: ['interno@avant.enf.br'],
      }),
    ).toBe(false);
  });

  it('false quando allowlist vazia', () => {
    expect(
      shouldShowConvictionUi({
        email: 'interno@avant.enf.br',
        instrumentationEnabled: true,
        internalEmails: [],
      }),
    ).toBe(false);
  });
});
