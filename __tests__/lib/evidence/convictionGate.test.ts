import { shouldShowConvictionUi } from '@/lib/evidence/convictionGate';

describe('shouldShowConvictionUi', () => {
  it('sempre false — UI de convicção desligada no produto', () => {
    expect(
      shouldShowConvictionUi({
        email: 'interno@avant.enf.br',
        instrumentationEnabled: true,
        internalEmails: ['interno@avant.enf.br'],
      }),
    ).toBe(false);
    expect(
      shouldShowConvictionUi({
        email: 'aluno@exemplo.com',
        instrumentationEnabled: false,
        internalEmails: [],
      }),
    ).toBe(false);
  });
});
