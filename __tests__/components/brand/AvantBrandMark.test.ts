import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const brandPath = join(process.cwd(), 'components', 'brand', 'AvantBrandMark.tsx');

describe('AvantBrandMark', () => {
  it('usa letra A verde no chip editorial em vez do raio legado', () => {
    const source = readFileSync(brandPath, 'utf8');
    expect(source).toContain('bg-[#8fe020]');
    expect(source).toMatch(/>\s*A\s*<\/span>/);
    expect(source).not.toContain('<Zap');
    expect(source).not.toContain('⚡');
  });
});
