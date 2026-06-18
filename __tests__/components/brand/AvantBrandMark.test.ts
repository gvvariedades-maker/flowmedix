import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const brandPath = join(process.cwd(), 'components', 'brand', 'AvantBrandMark.tsx');
const logoPath = join(process.cwd(), 'components', 'brand', 'AvantLogo.tsx');
const brandAssetsDir = join(process.cwd(), 'public', 'brand');
const emailLogoPath = join(process.cwd(), 'emails', 'AvantLogoEmail.tsx');

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

  it('SVGs de marca não usam raio/roxo legado', () => {
    const svgs = readdirSync(brandAssetsDir).filter((f) => f.endsWith('.svg'));
    expect(svgs.length).toBeGreaterThan(0);

    for (const file of svgs) {
      const svg = readFileSync(join(brandAssetsDir, file), 'utf8');
      expect(svg).not.toContain('#3018c8');
      expect(svg).not.toContain('polygon points="22,0');
    }

    const symbol = readFileSync(join(brandAssetsDir, 'avant-logo-symbol.svg'), 'utf8');
    expect(symbol).toContain('#22c55e');
    expect(symbol).toMatch(/>\s*A\s*<\/text>/i);

    const wordmarkLight = readFileSync(
      join(brandAssetsDir, 'avant-logo-wordmark-light.svg'),
      'utf8',
    );
    expect(wordmarkLight).toContain('#166534');
  });

  it('AvantLogo usa tokens premium (gradiente 3-stop, sheen fino)', () => {
    const logo = readFileSync(logoPath, 'utf8');
    const constants = readFileSync(
      join(process.cwd(), 'lib', 'brand', 'avantLogoConstants.ts'),
      'utf8',
    );
    expect(constants).toContain('iconSheenHeightRatio: 0.18');
    expect(constants).toContain('linear-gradient(160deg');
    expect(logo).toContain('iconSheenHeightRatio');
    expect(logo).toContain('iconLetterShadow');
  });

  it('AvantLogoEmail usa letra A no chip (não raio legado)', () => {
    const email = readFileSync(emailLogoPath, 'utf8');
    expect(email).not.toContain('AVANT_LOGO_BOLT');
    expect(email).toMatch(/>\s*A\s*<\/Text>/);
  });
});
