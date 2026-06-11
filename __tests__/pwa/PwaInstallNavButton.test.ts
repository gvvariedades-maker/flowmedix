import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const pwaNavPath = join(process.cwd(), 'components', 'pwa', 'PwaInstallNavButton.tsx');

describe('PwaInstallNavButton', () => {
  it('alinha ao layout de nav item sem estilo CTA legado', () => {
    const source = readFileSync(pwaNavPath, 'utf8');
    expect(source).toContain('MenuNavIconChip');
    expect(source).toContain('Instalar app');
    expect(source).not.toContain('hover:bg-slate-100');
    expect(source).not.toContain('py-3');
    expect(source).not.toContain('Instalar no celular');
  });
});
