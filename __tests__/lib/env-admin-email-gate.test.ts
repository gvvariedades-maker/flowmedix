import { requiresAdminEmailInEnv } from '@/lib/env';

describe('requiresAdminEmailInEnv', () => {
  it('exige em Vercel Production', () => {
    expect(requiresAdminEmailInEnv('production', 'production')).toBe(true);
  });

  it('não exige em Vercel Preview (mesmo com NODE_ENV=production)', () => {
    expect(requiresAdminEmailInEnv('production', 'preview')).toBe(false);
  });

  it('não exige em Vercel Development', () => {
    expect(requiresAdminEmailInEnv('production', 'development')).toBe(false);
  });

  it('exige em next build local/CI sem VERCEL_ENV', () => {
    expect(requiresAdminEmailInEnv('production', undefined)).toBe(true);
  });

  it('não exige em development local', () => {
    expect(requiresAdminEmailInEnv('development', undefined)).toBe(false);
  });
});
