import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const bottomNavPath = join(process.cwd(), 'components', 'layout', 'BottomNav.tsx');
const shellPath = join(process.cwd(), 'app', '(dashboard)', 'DashboardShell.tsx');
const heightSyncPath = join(process.cwd(), 'lib', 'layout', 'useBottomNavHeightSync.ts');

describe('BottomNav', () => {
  it('renderiza indicador ativo abaixo do label (após span)', () => {
    const source = readFileSync(bottomNavPath, 'utf8');
    expect(source).toContain('layoutId="bottom-nav-indicator"');
    expect(source).toMatch(
      /<span[\s\S]*?\{label\}[\s\S]*?<\/span>[\s\S]*?isActive \? \([\s\S]*?layoutId="bottom-nav-indicator"/,
    );
    expect(source).toContain('mt-0.5 h-[2px]');
  });

  it('usa helper compartilhado para estado ativo dos links', () => {
    const source = readFileSync(bottomNavPath, 'utf8');
    expect(source).toContain("from '@/lib/layout/bottomNavActive'");
    expect(source).toContain('isBottomNavItemActive(currentPath, href)');
    expect(source).not.toMatch(/currentPath\.startsWith\(href\)/);
  });

  it('labels inativos com contraste text-slate-400', () => {
    const source = readFileSync(bottomNavPath, 'utf8');
    expect(source).toContain("'text-slate-400'");
    expect(source).not.toContain("'text-slate-500'");
  });

  it('aria-label distinto do drawer (Navegação rápida)', () => {
    const nav = readFileSync(bottomNavPath, 'utf8');
    const shell = readFileSync(shellPath, 'utf8');
    expect(nav).toContain('aria-label="Navegação rápida"');
    expect(shell).toContain('aria-label="Navegação principal"');
  });

  it('aceita drawerOpen e welcomeOpen para nav inerte com exceção do Mais', () => {
    const source = readFileSync(bottomNavPath, 'utf8');
    expect(source).toContain('drawerOpen?: boolean');
    expect(source).toContain('welcomeOpen?: boolean');
    expect(source).toMatch(/mobileOverlayBlocksNav[\s\S]*pointer-events-none/);
    expect(source).toContain('maisInteractive && \'pointer-events-auto\'');
    expect(source).toMatch(/navAriaHidden = questaoModalOpen \|\| welcomeOpen/);
    expect(source).toMatch(/aria-hidden=\{mobileOverlayBlocksNav \? true : undefined\}/);
    expect(source).toMatch(/linkTabIndex = mobileOverlayBlocksNav \? -1 : undefined/);
    expect(source).toMatch(/maisTabIndex = maisInteractive \? 0/);
  });

  it('DashboardShell repassa drawerOpen e welcomeOpen', () => {
    const shell = readFileSync(shellPath, 'utf8');
    expect(shell).toContain('drawerOpen={mobileMenuOpen}');
    expect(shell).toContain('welcomeOpen={estudoReversoWelcome.isOpen}');
  });

  it('sincroniza altura via useBottomNavHeightSync no nav inline do flex shell', () => {
    const source = readFileSync(bottomNavPath, 'utf8');
    const hook = readFileSync(heightSyncPath, 'utf8');
    expect(source).toContain('useBottomNavHeightSync(navRef');
    expect(source).toMatch(/ref=\{navRef\}/);
    expect(source).not.toContain('createPortal');
    expect(hook).toContain('--bottom-nav-height');
    expect(hook).toContain('ResizeObserver');
    expect(hook).toContain('useLayoutEffect');
  });

  it('desabilita useBottomNavHeightSync no mobile immersive (questão inline)', () => {
    const source = readFileSync(bottomNavPath, 'utf8');
    const hook = readFileSync(heightSyncPath, 'utf8');
    expect(source).toContain('useEstudarQuestaoImmersive');
    expect(source).toMatch(
      /useBottomNavHeightSync\(navRef,\s*!isDesktop\s*&&\s*!estudarQuestaoImmersive\)/,
    );
    expect(hook).toMatch(/if \(!enabled\)[\s\S]*removeProperty\(BOTTOM_NAV_HEIGHT_VAR\)/);
  });

  it('botão Mais usa isBottomNavMaisActive para estado ativo', () => {
    const source = readFileSync(bottomNavPath, 'utf8');
    expect(source).toContain('isBottomNavMaisActive');
  });
});
