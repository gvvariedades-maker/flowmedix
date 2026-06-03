import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('DashboardShell mobile scroll shell', () => {
  it('main é área de scroll com padding inferior para o BottomNav fixo', () => {
    const shellPath = join(process.cwd(), 'app', '(dashboard)', 'DashboardShell.tsx');
    const source = readFileSync(shellPath, 'utf8');
    expect(source).toMatch(/<main[\s\S]*?overflow-y-auto[\s\S]*?pb-\[calc\(4rem\+env\(safe-area-inset-bottom,0px\)\)\][\s\S]*?md:pb-0/);
    expect(source).not.toContain('MOBILE_PAGE_BOTTOM_PADDING');
  });

  it('BottomNav usa portal fixed no body (MOBILE_BOTTOM_NAV_FIXED)', () => {
    const navPath = join(process.cwd(), 'components', 'layout', 'BottomNav.tsx');
    const source = readFileSync(navPath, 'utf8');
    expect(source).toContain('MOBILE_BOTTOM_NAV_FIXED');
    expect(source).toContain('createPortal');
  });

  it('DashboardMobilePage usa PWA por padrão (pwaAware true)', () => {
    const wrapper = readFileSync(
      join(process.cwd(), 'components', 'layout', 'DashboardMobilePage.tsx'),
      'utf8',
    );
    expect(wrapper).toMatch(/pwaAware\s*=\s*true/);
  });

  it('vitrine não duplica padding inferior (reservado no main do shell)', () => {
    const vitrine = readFileSync(
      join(process.cwd(), 'components', 'vitrine', 'VitrineClient.tsx'),
      'utf8',
    );
    const cadernos = readFileSync(
      join(process.cwd(), 'app', '(dashboard)', '(authenticated)', 'cadernos', 'CadernosListClient.tsx'),
      'utf8',
    );
    expect(vitrine).not.toContain('useDashboardBottomInset');
    expect(cadernos).toContain('useDashboardBottomInset');
  });

  it('rotas /material redirecionam para a vitrine', () => {
    const materialPage = readFileSync(
      join(process.cwd(), 'app', '(dashboard)', '(authenticated)', 'material', 'page.tsx'),
      'utf8',
    );
    const neuroslidesPage = readFileSync(
      join(
        process.cwd(),
        'app',
        '(dashboard)',
        '(authenticated)',
        'material',
        'neuroslides',
        'page.tsx',
      ),
      'utf8',
    );
    expect(materialPage).toContain("redirect('/estudar')");
    expect(neuroslidesPage).toContain("redirect('/estudar')");
  });
});
