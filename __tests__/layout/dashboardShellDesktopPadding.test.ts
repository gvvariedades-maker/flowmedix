import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('DashboardShell desktop padding', () => {
  it('main do shell zera padding inferior em md+ (md:pb-0)', () => {
    const shellPath = join(process.cwd(), 'app', '(dashboard)', 'DashboardShell.tsx');
    const source = readFileSync(shellPath, 'utf8');
    expect(source).toMatch(/<main[\s\S]*?md:pb-0/);
    expect(source).toContain('MOBILE_PAGE_BOTTOM_PADDING');
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
