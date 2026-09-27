import {
  assertHarnessMatriculaEmailAllowed,
  buildHarnessMatriculaExpiresAt,
} from '@/lib/scale/authenticatedHarness/poolMatriculaFixture';

describe('poolMatriculaFixture', () => {
  it('aceita e-mail scale.harness do batch', () => {
    expect(() =>
      assertHarnessMatriculaEmailAllowed('scale.harness.20260927.001@example.com', '20260927'),
    ).not.toThrow();
  });

  it('rejeita e-mail fora do batch', () => {
    expect(() =>
      assertHarnessMatriculaEmailAllowed('user@example.com', '20260927'),
    ).toThrow(/allowlist/);
  });

  it('expires_at é futuro', () => {
    const iso = buildHarnessMatriculaExpiresAt(30);
    expect(new Date(iso).getTime()).toBeGreaterThan(Date.now());
  });
});
