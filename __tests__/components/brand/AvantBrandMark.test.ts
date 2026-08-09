import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  AVANT_LOGO_COLORS,
  AVANT_LOGO_SHELL_SHADOW,
} from '@/lib/brand/avantLogoConstants';
import { EDITORIAL_BRAND } from '@/lib/brand/avantBrandPalette';

const brandPath = join(process.cwd(), 'components', 'brand', 'AvantBrandMark.tsx');
const logoPath = join(process.cwd(), 'components', 'brand', 'AvantLogo.tsx');
const constantsPath = join(process.cwd(), 'lib', 'brand', 'avantLogoConstants.ts');
const brandAssetsDir = join(process.cwd(), 'public', 'brand');
const emailLogoPath = join(process.cwd(), 'emails', 'AvantLogoEmail.tsx');
const globalsCssPath = join(process.cwd(), 'app', 'globals.css');

describe('AvantBrandMark', () => {
  it('delega a AvantLogo com escala sm→md e md→lg', () => {
    const source = readFileSync(brandPath, 'utf8');
    expect(source).toContain("from '@/components/brand/AvantLogo'");
    expect(source).toContain("sm: 'md'");
    expect(source).toContain("md: 'lg'");
    expect(source).toContain("tone={variant === 'editorial' ? 'brand' : 'default'}");
  });

  it('AvantLogo usa brasao + wordmark tipográfico "AVANT enf" (preto/claro + laranja)', () => {
    const logo = readFileSync(logoPath, 'utf8');
    expect(logo).toContain('/brand/avant-logo-shield.png');
    expect(logo).toContain('AvantLogoWordmarkStack');
    expect(logo).toContain('wordmarkEditorial');
    expect(logo).toContain('wordmarkEnf');
    expect(logo).toContain('AVANT enf - inicio');
    expect(logo).not.toContain('avant-logo-wordmark-raster.png');
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
    expect(symbol).toContain('AVANT enf');

    const wordmarkLight = readFileSync(
      join(brandAssetsDir, 'avant-logo-wordmark-light.svg'),
      'utf8',
    );
    expect(wordmarkLight).toContain('avant-logo-wordmark-raster.png');
    expect(wordmarkLight).toContain('AVANT enf');
  });

  it('AvantLogo usa AvantLogoWordmarkStack como wordmark', () => {
    const logo = readFileSync(logoPath, 'utf8');
    expect(logo).toContain('AvantLogoWordmarkStack');
    expect(logo).toContain('function AvantLogoWordmarkStack');
  });

  it('AvantLogoEmail usa AE no selo + wordmark "AVANT enf" (claro + print)', () => {
    const email = readFileSync(emailLogoPath, 'utf8');
    expect(email).not.toContain('AVANT_LOGO_BOLT');
    expect(email).toMatch(/>\s*AE\s*<\/Text>/);
    expect(email).toContain('borderRadius: \'50%\'');
    expect(email).toContain('subtitleLabel');
    expect(email).toContain('wordmarkBrandBlueSolid');
    expect(email).toContain('wordmarkEnf');
  });

  it('rings/glows do logo usam print editorial #F26522 (não lima legado)', () => {
    expect(AVANT_LOGO_COLORS.iconCyberRing).toBe(EDITORIAL_BRAND.hex);
    expect(AVANT_LOGO_COLORS.iconCardBrand).toBe(EDITORIAL_BRAND.hex);
    expect(AVANT_LOGO_COLORS.iconCardGreen).toBe(EDITORIAL_BRAND.hex);
    expect(AVANT_LOGO_COLORS.wordmarkEnf).toBe(EDITORIAL_BRAND.hex);
    expect(AVANT_LOGO_COLORS.wordmarkEnfGreen).toBe(EDITORIAL_BRAND.hex);
    expect(AVANT_LOGO_COLORS.wordmarkEditorial).toBe('#0f172a');
    expect(AVANT_LOGO_COLORS.hairlineCyber).toContain('242, 101, 34');
    expect(AVANT_LOGO_COLORS.wordmarkGlow).toContain('242, 101, 34');
    expect(AVANT_LOGO_SHELL_SHADOW.rest).toContain('242, 101, 34');
    expect(AVANT_LOGO_SHELL_SHADOW.peak).toContain('242, 101, 34');
    // Metal cobre ≠ CTA print (monograma)
    expect(AVANT_LOGO_COLORS.brandBlue).toBe('#e08f2f');
    expect(AVANT_LOGO_COLORS.brandBlue).not.toBe(EDITORIAL_BRAND.hex);

    const constantsSrc = readFileSync(constantsPath, 'utf8');
    expect(constantsSrc).not.toMatch(/iconCyberRing:\s*'#8fe020'/);
    expect(constantsSrc).toContain('EDITORIAL_BRAND');

    const globals = readFileSync(globalsCssPath, 'utf8');
    expect(globals).toContain('rgba(242, 101, 34, 0.20)');
    expect(globals).not.toMatch(/avantLogoPulse[\s\S]*rgba\(143, 224, 32/);

    const appIcon = readFileSync(join(brandAssetsDir, 'avant-app-icon.svg'), 'utf8');
    expect(appIcon).toContain('fill="#F26522"');
    expect(appIcon).not.toContain('fill="#0cc93a"');
  });
});
