import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  AVANT_LOGO_COLORS,
  AVANT_LOGO_SHELL_SHADOW,
} from '@/lib/brand/avantLogoConstants';
import { AVANT_BRAND_V21 } from '@/lib/brand/avantBrandV21Assets';
import { EDITORIAL_BRAND } from '@/lib/brand/avantBrandPalette';

const brandPath = join(process.cwd(), 'components', 'brand', 'AvantBrandMark.tsx');
const logoPath = join(process.cwd(), 'components', 'brand', 'AvantLogo.tsx');
const constantsPath = join(process.cwd(), 'lib', 'brand', 'avantLogoConstants.ts');
const v21SymbolPath = join(process.cwd(), 'public', 'brand', 'v2.1', 'symbol', 'avant-symbol-master.svg');
const v21HorizontalPath = join(
  process.cwd(),
  'public',
  'brand',
  'v2.1',
  'logo',
  'avant-enf-horizontal.svg',
);
const emailLogoPath = join(process.cwd(), 'emails', 'AvantLogoEmail.tsx');
const globalsCssPath = join(process.cwd(), 'app', 'globals.css');
const appIconPath = join(process.cwd(), 'public', 'brand', 'v2.1', 'app-icon', 'app-icon-master.svg');

describe('AvantBrandMark', () => {
  it('delega a AvantLogo com escala sm→md e md→lg', () => {
    const source = readFileSync(brandPath, 'utf8');
    expect(source).toContain("from '@/components/brand/AvantLogo'");
    expect(source).toContain("sm: 'md'");
    expect(source).toContain("md: 'lg'");
    expect(source).toContain("tone={variant === 'editorial' ? 'brand' : 'default'}");
  });

  it('AvantLogo usa assets SVG Golden Master V2.1 (sem PNG legado no lockup)', () => {
    const logo = readFileSync(logoPath, 'utf8');
    expect(logo).toContain('AVANT_BRAND_V21');
    expect(logo).toContain('AVANT_BRAND_V21.horizontal');
    expect(logo).toContain('AVANT_BRAND_V21.symbol');
    expect(logo).toContain('AVANT enf - inicio');
    expect(logo).not.toContain('avant-logo-shield.png');
    expect(logo).not.toContain('avant-logo-wordmark-raster.png');
    expect(logo).not.toContain('AVANT_LOGO_PNG.aMark');
    expect(logo).not.toContain('AvantLogoWordmarkStack');
    expect(logo).not.toContain('<Zap');
    expect(logo).not.toContain('⚡');

    expect(AVANT_BRAND_V21.horizontal).toBe('/brand/v2.1/logo/avant-enf-horizontal.svg');
    expect(AVANT_BRAND_V21.symbol).toBe('/brand/v2.1/symbol/avant-symbol-master.svg');
  });

  it('SVGs V2.1 usam Brand Orange #F45A1F (sem roxo/verde legado)', () => {
    const symbol = readFileSync(v21SymbolPath, 'utf8');
    expect(symbol).toContain('#F45A1F');
    expect(symbol).not.toContain('#3018c8');
    expect(symbol).not.toContain('#0cc93a');

    const horizontal = readFileSync(v21HorizontalPath, 'utf8');
    expect(horizontal).toContain('#F45A1F');
    expect(horizontal).not.toContain('avant-logo-wordmark-raster.png');
    expect(horizontal).not.toContain('>ENF</text>');
  });

  it('AvantLogo usa lockup artwork proprietário (não reconstrói wordmark por fonte)', () => {
    const logo = readFileSync(logoPath, 'utf8');
    expect(logo).toContain('AvantLogoLockupArtwork');
    expect(logo).not.toContain('Montserrat');
    expect(logo).not.toContain('font-family');
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

  it('rings/glows do logo usam Brand Orange V2.1 (não lima legado)', () => {
    expect(EDITORIAL_BRAND.hex).toBe('#F45A1F');
    expect(AVANT_LOGO_COLORS.iconCyberRing).toBe(EDITORIAL_BRAND.hex);
    expect(AVANT_LOGO_COLORS.iconCardBrand).toBe(EDITORIAL_BRAND.hex);
    expect(AVANT_LOGO_COLORS.wordmarkEnf).toBe(EDITORIAL_BRAND.hex);
    expect(AVANT_LOGO_COLORS.hairlineCyber).toContain('244, 90, 31');
    expect(AVANT_LOGO_COLORS.wordmarkGlow).toContain('244, 90, 31');
    expect(AVANT_LOGO_SHELL_SHADOW.rest).toContain('244, 90, 31');
    expect(AVANT_LOGO_SHELL_SHADOW.peak).toContain('244, 90, 31');

    const constantsSrc = readFileSync(constantsPath, 'utf8');
    expect(constantsSrc).not.toMatch(/iconCyberRing:\s*'#8fe020'/);
    expect(constantsSrc).toContain('EDITORIAL_BRAND');

    const globals = readFileSync(globalsCssPath, 'utf8');
    expect(globals).toContain('rgba(244, 90, 31, 0.20)');
    expect(globals).toContain('color-tokens.css');
    const colorTokens = readFileSync(
      join(process.cwd(), 'lib', 'brand', 'tokens', 'color-tokens.css'),
      'utf8',
    );
    expect(colorTokens).toContain('--avant-brand-orange: #F45A1F');
    expect(globals).not.toMatch(/avantLogoPulse[\s\S]*rgba\(143, 224, 32/);

    const appIcon = readFileSync(appIconPath, 'utf8');
    expect(appIcon).toContain('#F45A1F');
    expect(appIcon).not.toContain('fill="#0cc93a"');
    expect(appIcon).not.toContain('#0a0a0a');
  });
});
