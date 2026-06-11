import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const brandPath = join(process.cwd(), 'components', 'brand', 'AvantBrandMark.tsx');

describe('AvantBrandMark', () => {
  it('usa ícone Lucide Zap em vez de emoji', () => {
    const source = readFileSync(brandPath, 'utf8');
    expect(source).toContain("from 'lucide-react'");
    expect(source).toContain('<Zap');
    expect(source).toContain('fill="currentColor"');
    expect(source).not.toContain('⚡');
  });
});
