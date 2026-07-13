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

  it('AvantLogo usa monograma AE interlocked + ENF (selo circular)', () => {
    const logo = readFileSync(logoPath, 'utf8');
    const constants = readFileSync(constantsPath, 'utf8');
    expect(constants).toContain('AVANT_AE_MONOGRAM_PATHS');
    expect(constants).toContain('iconForestGradient');
    expect(constants).toContain("label: 'ENF'");
    expect(constants).toContain('M15.4 28.4H43.2v2H15.4z');
    expect(logo).toContain('rounded-full');
    expect(logo).toContain('hairline');
    expect(logo).toContain('AVANT Enf — início');
    expect(logo).not.toContain('<Zap');
    expect(logo).not.toContain('⚡');
  });

  it('SVGs de marca usam selo circular AE e não usam raio/roxo legado', () => {
    const svgs = readdirSync(brandAssetsDir).filter((f) => f.endsWith('.svg'));
    expect(svgs.length).toBeGreaterThan(0);

    for (const file of svgs) {
      const svg = readFileSync(join(brandAssetsDir, file), 'utf8');
      expect(svg).not.toContain('#3018c8');
      expect(svg).not.toContain('polygon points="22,0');
    }

    const symbol = readFileSync(join(brandAssetsDir, 'avant-logo-symbol.svg'), 'utf8');
    expect(symbol).toContain('#166534');
    expect(symbol).toContain('<circle');
    expect(symbol).toContain('M15.4 28.4H43.2v2H15.4z');
    expect(symbol).toContain('AVANT Enf');

    const wordmarkLight = readFileSync(
      join(brandAssetsDir, 'avant-logo-wordmark-light.svg'),
      'utf8',
    );
    expect(wordmarkLight).toContain('#0f172a');
    expect(wordmarkLight).toContain('ENF');
    expect(wordmarkLight).toContain('#64748b');
  });

  it('AvantLogo usa tokens ultra-premium (selo, tracking aéreo, peso 600)', () => {
    const logo = readFileSync(logoPath, 'utf8');
    const constants = readFileSync(constantsPath, 'utf8');
    expect(constants).toContain('iconForestGradient');
    expect(constants).toContain('fontWeight: 600');
    expect(constants).toContain('hairlineWidth');
    expect(logo).toContain('AvantLogoWordmarkStack');
    expect(logo).toContain('iconForestGradient');
  });

  it('AvantLogoEmail usa AE no selo forest + ENF', () => {
    const email = readFileSync(emailLogoPath, 'utf8');
    expect(email).not.toContain('AVANT_LOGO_BOLT');
    expect(email).toMatch(/>\s*AE\s*<\/Text>/);
    expect(email).toContain('borderRadius: \'50%\'');
    expect(email).toContain('subtitleLabel');
  });
});
