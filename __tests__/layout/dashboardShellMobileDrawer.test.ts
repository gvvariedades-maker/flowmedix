import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const shellPath = join(process.cwd(), 'app', '(dashboard)', 'DashboardShell.tsx');
const drawerPath = join(process.cwd(), 'components', 'layout', 'MobileDashboardDrawer.tsx');
const bottomNavPath = join(process.cwd(), 'components', 'layout', 'BottomNav.tsx');
const focusablePath = join(process.cwd(), 'lib', 'a11y', 'focusable.ts');
const planCardPath = join(process.cwd(), 'components', 'plan', 'PlanStatusCard.tsx');

describe('DashboardShell mobile drawer', () => {
  it('aplica body scroll lock quando drawer aberto no mobile', () => {
    const source = readFileSync(shellPath, 'utf8');
    expect(source).toContain('useBodyScrollLock(mobileMenuOpen && !isDashboardDesktop)');
  });

  it('toggle abre/fecha menu via onMenuToggle no BottomNav', () => {
    const shell = readFileSync(shellPath, 'utf8');
    const nav = readFileSync(bottomNavPath, 'utf8');
    expect(shell).toContain('onMenuToggle');
    expect(shell).toMatch(/setMobileMenuOpen\(\(open\) => !open\)/);
    expect(nav).toContain('onMenuToggle');
    expect(nav).toContain('forwardRef');
  });

  it('bloqueia toggle e fecha drawer quando welcome modal aberto', () => {
    const shell = readFileSync(shellPath, 'utf8');
    expect(shell).toMatch(/estudoReversoWelcome\.isOpen[\s\S]*?return/);
    expect(shell).toMatch(/estudoReversoWelcome\.isOpen[\s\S]*?setMobileMenuOpen\(false\)/);
  });

  it('restaura foco ao botão Mais via menuButtonRef', () => {
    const shell = readFileSync(shellPath, 'utf8');
    const nav = readFileSync(bottomNavPath, 'utf8');
    expect(shell).toContain('menuButtonRef');
    expect(shell).toContain('ref={menuButtonRef}');
    expect(shell).toContain('menuButtonRef.current?.focus()');
    expect(nav).toContain('forwardRef<HTMLButtonElement');
  });

  it('oculta main do leitor de tela com drawer aberto (aria-hidden)', () => {
    const shell = readFileSync(shellPath, 'utf8');
    expect(shell).toContain('hideMainFromAssistiveTech');
    expect(shell).toMatch(/aria-hidden=\{hideMainFromAssistiveTech/);
  });

  it('drawer usa portal no body (paridade BottomNav)', () => {
    const drawer = readFileSync(drawerPath, 'utf8');
    expect(drawer).toContain('createPortal');
    expect(drawer).toContain('document.body');
    expect(drawer).toContain('dashboard-mobile-drawer');
    expect(drawer).toContain('pt-safe');
    expect(drawer).toContain('absolute right-2');
    expect(drawer).toContain('MOBILE_BOTTOM_NAV_FIXED_BOTTOM');
  });

  it('main bloqueia scroll interno com drawer aberto no mobile', () => {
    const shell = readFileSync(shellPath, 'utf8');
    expect(shell).toMatch(/hideMainFromAssistiveTech[\s\S]*\?[\s\S]*'overflow-hidden'/);
  });

  it('DashboardShell delega foco ao utilitário compartilhado', () => {
    const shell = readFileSync(shellPath, 'utf8');
    const focusable = readFileSync(focusablePath, 'utf8');
    expect(shell).toContain("from '@/lib/a11y/focusable'");
    expect(shell).toContain('getFocusableIn');
    expect(shell).not.toContain('FOCUSABLE_SELECTOR');
    expect(focusable).toContain('export function getFocusableIn');
    expect(focusable).toContain('export const FOCUSABLE_SELECTOR');
  });

  it('e-mail truncado no drawer tem title para tooltip', () => {
    const shell = readFileSync(shellPath, 'utf8');
    expect(shell).toMatch(/title=\{userEmail \?\? undefined\}/);
  });

  it('PlanStatusCard — label Assinatura legível (tracking e contraste)', () => {
    const card = readFileSync(planCardPath, 'utf8');
    expect(card).toContain('tracking-[0.12em]');
    expect(card).toContain('text-white/50');
    expect(card).not.toContain('tracking-[0.2em]');
    expect(card).not.toContain('text-white/30');
  });
});
