import {
  assertHarnessProvisionTargetsAllowed,
  formatHarnessPoolUserId,
  formatHarnessSyntheticEmail,
  PoolProvisionForbiddenError,
} from '@/lib/scale/authenticatedHarness/poolProvisioning';

describe('scale harness pool provisioning', () => {
  it('rejeita Supabase Production', () => {
    expect(() =>
      assertHarnessProvisionTargetsAllowed({
        supabaseUrl: 'https://ozgouenqrofnvgrlgfwd.supabase.co',
        baseUrl: 'https://flowmedix-git-staging-gvvariedades-makers-projects.vercel.app',
      }),
    ).toThrow(PoolProvisionForbiddenError);
  });

  it('aceita par staging canônico', () => {
    expect(() =>
      assertHarnessProvisionTargetsAllowed({
        supabaseUrl: 'https://higsjzfigprqvldpxfwj.supabase.co',
        baseUrl: 'https://flowmedix-git-staging-gvvariedades-makers-projects.vercel.app',
      }),
    ).not.toThrow();
  });

  it('formata pool_id e e-mail sintético', () => {
    expect(formatHarnessPoolUserId(0)).toBe('harness-u001');
    expect(formatHarnessSyntheticEmail('batch1', 0, 'example.com')).toBe(
      'scale.harness.batch1.001@example.com',
    );
  });
});
