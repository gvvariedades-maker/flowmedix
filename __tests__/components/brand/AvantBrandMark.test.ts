import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const brandPath = join(process.cwd(), 'components', 'brand', 'AvantBrandMark.tsx');
const logoPath = join(process.cwd(), 'components', 'brand', 'AvantLogo.tsx');

describe('AvantBrandMark', () => {
  it('delega a AvantLogo com escala sm→nav e md→md', () => {
    const source = readFileSync(brandPath, 'utf8');
    expect(source).toContain("from '@/components/brand/AvantLogo'");
    expect(source).toContain("sm: 'nav'");
    expect(source).toContain("md: 'md'");
    expect(source).toContain("tone={variant === 'editorial' ? 'brand' : 'default'}");
  });

  it('AvantLogo mantém letra A no chip (não raio legado)', () => {
    const logo = readFileSync(logoPath, 'utf8');
    expect(logo).toContain('AVANT_LOGO_GRADIENTS.icon');
    expect(logo).toMatch(/>\s*A\s*<\/span>/);
    expect(logo).not.toContain('<Zap');
    expect(logo).not.toContain('⚡');
  });
});
