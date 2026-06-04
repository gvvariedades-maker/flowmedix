import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('DashboardShell mobile scroll shell', () => {
  it('main é área de scroll com padding inferior para o BottomNav fixo', () => {
    const shellPath = join(process.cwd(), 'app', '(dashboard)', 'DashboardShell.tsx');
    const source = readFileSync(shellPath, 'utf8');
    expect(source).toContain('MOBILE_MAIN_SCROLL_PADDING');
    expect(source).toMatch(/<main[\s\S]*?md:pb-0[\s\S]*?MOBILE_MAIN_SCROLL_PADDING/);
    expect(source).toContain("'overflow-y-auto no-scrollbar'");

    const tokensPath = join(process.cwd(), 'lib', 'layout', 'mobileBottomNav.ts');
    const tokens = readFileSync(tokensPath, 'utf8');
    expect(tokens).toMatch(/MOBILE_MAIN_SCROLL_PADDING\s*=\s*'pb-nav-safe'/);
    expect(source).not.toContain('MOBILE_PAGE_BOTTOM_PADDING');
  });

  it('BottomNav usa portal fixed no body (MOBILE_BOTTOM_NAV_FIXED)', () => {
    const navPath = join(process.cwd(), 'components', 'layout', 'BottomNav.tsx');
    const source = readFileSync(navPath, 'utf8');
    expect(source).toContain('MOBILE_BOTTOM_NAV_FIXED');
    expect(source).toContain('createPortal');
    expect(source).toContain('min-h-[5rem]');
    expect(source).not.toMatch(/if\s*\(\s*!mounted\s*\)\s*return\s*null/);
  });

  it('DashboardShell desativa fade de página no mobile', () => {
    const shell = readFileSync(
      join(process.cwd(), 'app', '(dashboard)', 'DashboardShell.tsx'),
      'utf8',
    );
    expect(shell).toContain('pageVariantsMobile');
    expect(shell).toContain('useDashboardDesktop');
  });

  it('DashboardMobilePage usa PWA por padrão (pwaAware true)', () => {
    const wrapper = readFileSync(
      join(process.cwd(), 'components', 'layout', 'DashboardMobilePage.tsx'),
      'utf8',
    );
    expect(wrapper).toMatch(/pwaAware\s*=\s*true/);
  });

  it('drawer mobile não usa z-above quando modal de questão está ativo', () => {
    const shell = readFileSync(
      join(process.cwd(), 'app', '(dashboard)', 'DashboardShell.tsx'),
      'utf8',
    );
    expect(shell).toContain('useEstudarModalActive');
    expect(shell).toContain('drawerAboveOverlays');
    expect(shell).toMatch(/drawerAboveOverlays[\s\S]*?MOBILE_DRAWER_ABOVE_OVERLAYS_OVERLAY_Z/);
    expect(shell).toMatch(/!modalQuestaoAtivo[\s\S]*?setMobileMenuOpen\(true\)/);
  });

  it('oculta header mobile do shell na vitrine (header único no VitrineClient)', () => {
    const shell = readFileSync(
      join(process.cwd(), 'app', '(dashboard)', 'DashboardShell.tsx'),
      'utf8',
    );
    expect(shell).toMatch(/!\s*isVitrineRoute\s*\?/);
    const vitrine = readFileSync(
      join(process.cwd(), 'components', 'vitrine', 'VitrineClient.tsx'),
      'utf8',
    );
    expect(vitrine).toContain('data-vitrine-shell-search');
    expect(vitrine).toContain('avant:open-search');
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

  it('main sem scroll externo na questão inline (card preenche altura no desktop)', () => {
    const shell = readFileSync(
      join(process.cwd(), 'app', '(dashboard)', 'DashboardShell.tsx'),
      'utf8',
    );
    expect(shell).toContain('estudarQuestaoFillViewport');
    expect(shell).toMatch(
      /estudarQuestaoFillViewport[\s\S]*\?[\s\S]*'overflow-hidden'[\s\S]*'overflow-y-auto no-scrollbar'/,
    );
  });

  it('vitrine usa acordeão CSS grid (sem height auto do Framer)', () => {
    const vitrine = readFileSync(
      join(process.cwd(), 'components', 'vitrine', 'VitrineClient.tsx'),
      'utf8',
    );
    expect(vitrine).toContain('grid-rows-[0fr]');
    expect(vitrine).toContain('grid-rows-[1fr]');
    expect(vitrine).not.toMatch(/animate=\{\{\s*opacity:\s*1,\s*height:\s*'auto'/);
  });

  it('useDashboardBottomInset separa padding PWA do nav do shell', () => {
    const insetHook = readFileSync(
      join(process.cwd(), 'lib', 'layout', 'useDashboardBottomInset.ts'),
      'utf8',
    );
    expect(insetHook).toContain('getDashboardPageBottomPadding');
    expect(insetHook).not.toContain('MOBILE_MAIN_SCROLL_PADDING');
  });
});
