import { BRAND_NAME, BRAND_PRO_NAME, brandCopyright, brandPageTitle } from '@/lib/brand/brandName';

describe('brandName', () => {
  it('expõe nomes públicos da plataforma', () => {
    expect(BRAND_NAME).toBe('AVANT enf');
    expect(BRAND_PRO_NAME).toBe('AVANT enf Pro');
    expect(brandPageTitle('Entrar')).toBe('Entrar | AVANT enf');
    expect(brandCopyright(2026)).toContain('AVANT enf');
  });
});
