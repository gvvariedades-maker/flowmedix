import { BRAND_NAME, BRAND_PRO_NAME, brandCopyright, brandPageTitle } from '@/lib/brand/brandName';

describe('brandName', () => {
  it('expõe nomes públicos da plataforma', () => {
    expect(BRAND_NAME).toBe('AVANT Enf');
    expect(BRAND_PRO_NAME).toBe('AVANT Enf Pro');
    expect(brandPageTitle('Entrar')).toBe('Entrar | AVANT Enf');
    expect(brandCopyright(2026)).toContain('AVANT Enf');
  });
});
