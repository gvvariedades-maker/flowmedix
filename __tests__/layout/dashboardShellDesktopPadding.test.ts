import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('DashboardShell mobile scroll shell', () => {
  it('main é única área de scroll sem padding de nav (BottomNav no flex)', () => {
    const shellPath = join(process.cwd(), 'app', '(dashboard)', 'DashboardShell.tsx');
    const source = readFileSync(shellPath, 'utf8');
    expect(source).not.toContain('MOBILE_MAIN_SCROLL_PADDING');
    expect(source).toMatch(/<main[\s\S]*?'overflow-y-auto no-scrollbar'/);
    expect(source).not.toContain('MOBILE_PAGE_BOTTOM_PADDING');

    const tokensPath = join(process.cwd(), 'lib', 'layout', 'mobileBottomNav.ts');
    const tokens = readFileSync(tokensPath, 'utf8');
    expect(tokens).toContain('MOBILE_BOTTOM_NAV_SHELL');
  });

  it('BottomNav inline no flex shell (shrink-0, sem portal fixed)', () => {
    const navPath = join(process.cwd(), 'components', 'layout', 'BottomNav.tsx');
    const source = readFileSync(navPath, 'utf8');
    expect(source).toContain('MOBILE_BOTTOM_NAV_SHELL');
    expect(source).not.toContain('createPortal');
    expect(source).not.toContain('MOBILE_BOTTOM_NAV_FIXED');
    expect(source).toContain('min-h-[5rem]');
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
    const drawer = readFileSync(
      join(process.cwd(), 'components', 'layout', 'MobileDashboardDrawer.tsx'),
      'utf8',
    );
    expect(shell).toContain('useEstudarModalActive');
    expect(shell).toContain('drawerAboveOverlays');
    expect(shell).toContain('drawerAboveOverlays={drawerAboveOverlays}');
    expect(drawer).toMatch(/drawerAboveOverlays[\s\S]*?MOBILE_DRAWER_ABOVE_OVERLAYS_OVERLAY_Z/);
    expect(shell).toMatch(/modalQuestaoAtivo[\s\S]*?setMobileMenuOpen\(\(open\) => !open\)/);
  });

  it('exibe header mobile global na vitrine (paridade com Cadernos)', () => {
    const shell = readFileSync(
      join(process.cwd(), 'app', '(dashboard)', 'DashboardShell.tsx'),
      'utf8',
    );
    expect(shell).not.toContain('isVitrineRoute');
    expect(shell).toContain('AVANT');
    expect(shell).toContain("new CustomEvent('avant:open-search')");
    const vitrine = readFileSync(
      join(process.cwd(), 'components', 'vitrine', 'VitrineClient.tsx'),
      'utf8',
    );
    expect(vitrine).toContain('data-vitrine-shell-search');
    expect(vitrine).toContain('avant:open-search');
    expect(vitrine).not.toMatch(
      /md:hidden[\s\S]*min-w-0 flex-1 truncate text-base font-black[\s\S]*Abrir busca/,
    );
  });

  it('vitrine não duplica padding inferior (nav no flex shell)', () => {
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
    expect(vitrine).not.toContain('pb-nav-safe');
  });

  it('simulados não duplica padding de nav (5rem)', () => {
    const simulados = readFileSync(
      join(process.cwd(), 'components', 'simulados', 'SimuladosListClient.tsx'),
      'utf8',
    );
    expect(simulados).toContain('useDashboardBottomInset');
    expect(simulados).not.toMatch(/calc\(5rem/);
    const ajuda = readFileSync(join(process.cwd(), 'app', '(dashboard)', 'ajuda', 'page.tsx'), 'utf8');
    expect(ajuda).not.toContain('pb-20');
  });

  it('paginação da vitrine fica inline no fim da lista (mobile e desktop)', () => {
    const vitrine = readFileSync(
      join(process.cwd(), 'components', 'vitrine', 'VitrineClient.tsx'),
      'utf8',
    );
    const paginationBar = readFileSync(
      join(process.cwd(), 'components', 'vitrine', 'VitrinePaginationBar.tsx'),
      'utf8',
    );
    expect(vitrine).not.toContain('variant="sticky"');
    expect(vitrine.match(/<VitrinePaginationBar/g)?.length).toBe(1);
    expect(paginationBar).not.toContain('fixed');
    expect(paginationBar).not.toContain('className="mt-6 hidden');
    expect(paginationBar).toContain('border-t border-white/10');
    expect(paginationBar).not.toContain('pb-12');
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

  it('páginas do dashboard não usam min-h-screen no mobile', () => {
    const dashboardRoots = [
      join(process.cwd(), 'app', '(dashboard)'),
      join(process.cwd(), 'components', 'dashboard'),
      join(process.cwd(), 'components', 'simulados'),
    ];
    for (const root of dashboardRoots) {
      const walk = (dir: string) => {
        const { readdirSync, statSync } = require('node:fs') as typeof import('node:fs');
        for (const entry of readdirSync(dir)) {
          const full = join(dir, entry);
          if (statSync(full).isDirectory()) {
            if (entry === 'node_modules') continue;
            walk(full);
          } else if (/\.(tsx|ts)$/.test(entry)) {
            const src = readFileSync(full, 'utf8');
            expect(src).not.toContain('min-h-screen');
          }
        }
      };
      walk(root);
    }
  });
});
