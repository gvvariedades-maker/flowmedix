import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('DashboardShell mobile scroll shell', () => {
  it('main é área de scroll sem padding compensatório de BottomNav', () => {
    const shellPath = join(process.cwd(), 'app', '(dashboard)', 'DashboardShell.tsx');
    const source = readFileSync(shellPath, 'utf8');
    expect(source).toMatch(/<main[\s\S]*?overflow-y-auto[\s\S]*?md:pb-0/);
    expect(source).not.toContain('MOBILE_PAGE_BOTTOM_PADDING');
  });

  it('BottomNav não usa position fixed', () => {
    const navPath = join(process.cwd(), 'components', 'layout', 'BottomNav.tsx');
    const source = readFileSync(navPath, 'utf8');
    expect(source).toContain('shrink-0');
    expect(source).not.toMatch(/\bfixed\b/);
  });

  it('DashboardMobilePage usa PWA por padrão (pwaAware true)', () => {
    const wrapper = readFileSync(
      join(process.cwd(), 'components', 'layout', 'DashboardMobilePage.tsx'),
      'utf8',
    );
    expect(wrapper).toMatch(/pwaAware\s*=\s*true/);
  });

  it('páginas longas usam hook ou DashboardMobilePage', () => {
    const vitrine = readFileSync(
      join(process.cwd(), 'components', 'vitrine', 'VitrineClient.tsx'),
      'utf8',
    );
    const material = readFileSync(
      join(process.cwd(), 'app', '(dashboard)', '(authenticated)', 'material', 'MaterialApoioClient.tsx'),
      'utf8',
    );
    const cadernos = readFileSync(
      join(process.cwd(), 'app', '(dashboard)', '(authenticated)', 'cadernos', 'CadernosListClient.tsx'),
      'utf8',
    );
    expect(vitrine).toContain('useDashboardBottomInset');
    expect(material).toContain('useDashboardBottomInset');
    expect(cadernos).toContain('useDashboardBottomInset');
  });
});
