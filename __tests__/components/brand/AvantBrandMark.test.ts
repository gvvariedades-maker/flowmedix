import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const brandPath = join(process.cwd(), 'components', 'brand', 'AvantBrandMark.tsx');
const logoPath = join(process.cwd(), 'components', 'brand', 'AvantLogo.tsx');
const constantsPath = join(process.cwd(), 'lib', 'brand', 'avantLogoConstants.ts');
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

  it('AvantLogo usa brasao + wordmark raster "AVANT enf" (mesmo modelo do emblema)', () => {
    const logo = readFileSync(logoPath, 'utf8');
    expect(logo).toContain('/brand/avant-logo-shield.png');
    expect(logo).toContain('/brand/avant-logo-wordmark-raster.png');
    expect(logo).toContain('AVANT Enf - inicio');
    expect(logo).not.toContain('<Zap');
    expect(logo).not.toContain('⚡');
  });

  it('SVGs de marca usam brasao dourado/esmeralda e wordmark "AVANT enf"', () => {
    const svgs = readdirSync(brandAssetsDir).filter((f) => f.endsWith('.svg'));
    expect(svgs.length).toBeGreaterThan(0);

    for (const file of svgs) {
      const svg = readFileSync(join(brandAssetsDir, file), 'utf8');
      expect(svg).not.toContain('#3018c8');
      expect(svg).not.toContain('polygon points="22,0');
      expect(svg).not.toContain('>ENF</text>');
    }

    const symbol = readFileSync(join(brandAssetsDir, 'avant-logo-symbol.svg'), 'utf8');
    expect(symbol).toContain('avant-logo-shield.png');
    expect(symbol).toContain('AVANT Enf');

    const wordmarkLight = readFileSync(
      join(brandAssetsDir, 'avant-logo-wordmark-light.svg'),
      'utf8',
    );
    expect(wordmarkLight).toContain('avant-logo-wordmark-raster.png');
    expect(wordmarkLight).toContain('AVANT Enf');
  });

  it('AvantLogo usa AvantLogoWordmarkStack como wordmark', () => {
    const logo = readFileSync(logoPath, 'utf8');
    expect(logo).toContain('AvantLogoWordmarkStack');
    expect(logo).toContain('function AvantLogoWordmarkStack');
  });

  it('AvantLogoEmail usa AE no selo forest + wordmark "AVANT enf"', () => {
    const email = readFileSync(emailLogoPath, 'utf8');
    expect(email).not.toContain('AVANT_LOGO_BOLT');
    expect(email).toMatch(/>\s*AE\s*<\/Text>/);
    expect(email).toContain('borderRadius: \'50%\'');
    expect(email).toContain('subtitleLabel');
    expect(email).toContain('wordmarkBrandBlueSolid');
    expect(email).toContain('wordmarkEnfGreen');
  });
});
