import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const shellPath = join(root, 'app', '(dashboard)', 'DashboardShell.tsx');
const brandPath = join(root, 'components', 'brand', 'AvantBrandMark.tsx');
const planCardPath = join(root, 'components', 'plan', 'PlanStatusCard.tsx');
const pwaNavPath = join(root, 'components', 'pwa', 'PwaInstallNavButton.tsx');
const drawerPath = join(root, 'components', 'layout', 'MobileDashboardDrawer.tsx');
const mobileNavPath = join(root, 'lib', 'layout', 'mobileBottomNav.ts');

describe('Sidebar rebrand P1', () => {
  const shell = () => readFileSync(shellPath, 'utf8');
  const brand = () => readFileSync(brandPath, 'utf8');
  const planCard = () => readFileSync(planCardPath, 'utf8');
  const pwaNav = () => readFileSync(pwaNavPath, 'utf8');

  describe('P1-1 — seção Suporte', () => {
    it('border-t, heading Suporte, WhatsApp label curto e PWA nav', () => {
      const source = shell();
      expect(source).toContain('border-t border-[var(--color-border-default)]');
      expect(source).toMatch(/>\s*Suporte\s*</);
      expect(source).toContain('title="Tirar dúvidas pelo WhatsApp"');
      expect(source).toMatch(/>\s*WhatsApp\s*</);
      expect(source).toContain('<PwaInstallNavButton');
      expect(source).toContain('helpItems={helpItems}');
      expect(source).toContain('buildHelpNavItems');
    });
  });

  describe('P1-2 — assinatura com chip slate', () => {
    it('UserAccountFooter usa MenuNavIconChip + card unificado', () => {
      const source = shell();
      expect(source).toMatch(
        /MenuNavIconChip icon=\{CreditCard\} accent="slate" active=\{isAssinaturaActive\}/,
      );
      expect(source).toContain('border-[var(--color-border-default)]');
      expect(source).toMatch(/aria-current=\{isAssinaturaActive \? 'page' : undefined\}/);
    });
  });

  describe('P1-3 — sticky topo + footer fixo', () => {
    it('PlanStatusCard sticky; nav scroll; conta fixa no rodapé', () => {
      const source = shell();
      expect(source).toContain(
        'sticky top-0 z-10 shrink-0 border-b border-[var(--color-border-default)] bg-[var(--color-surface-0)] pb-2',
      );
      expect(source).toMatch(/flex-1 overflow-y-auto[\s\S]*<DashboardNav/);
      expect(source).toContain(
        'shrink-0 border-t border-[var(--color-border-default)] bg-[var(--color-surface-0)] pt-2',
      );
      expect(planCard()).toContain('brandHref?: string');
    });
  });

  describe('P1-4 — AvantBrandMark unificado com AvantLogo', () => {
    it('delega lockup editorial ao AvantLogo (PNGs oficiais A + AVANT + enf)', () => {
      const source = brand();
      expect(source).toContain('AvantLogo');
      expect(source).toContain("'brand'");
      const logo = readFileSync(join(root, 'components', 'brand', 'AvantLogo.tsx'), 'utf8');
      expect(logo).toContain('AVANT_LOGO_PNG');
      expect(logo).toContain('AvantLogoWordmarkStack');
      expect(logo).not.toContain('avant-logo-shield.png');
      expect(logo).not.toContain('<Zap');
    });
  });

  describe('P1 polish transversal', () => {
    it('PwaInstallNavButton alinhado ao padrão nav (sem CTA legado)', () => {
      const source = pwaNav();
      expect(source).toContain('MenuNavIconChip');
      expect(source).toContain('MENU_NAV_ROW_IDLE');
      expect(source).toContain('Instalar app');
      expect(source).not.toContain('Instalar no celular');
      expect(source).not.toContain('py-3');
    });

    it('sidebar 15.5rem desktop e drawer mobile', () => {
      expect(shell()).toContain('w-[15.5rem]');
      expect(readFileSync(drawerPath, 'utf8')).toContain('w-[15.5rem]');
      expect(readFileSync(mobileNavPath, 'utf8')).toContain("DASHBOARD_SIDEBAR_WIDTH = '15.5rem'");
    });

    it('heading de seção só com 2+ itens; PRO strip compacto; ícone idle AA', () => {
      expect(shell()).toContain('section.items.length > 1');
      expect(shell()).toContain('sr-only');
      expect(planCard()).toContain('Plano PRO · Ativo');
      expect(planCard()).not.toContain('animate-ping');
      expect(planCard()).not.toContain('ml-auto rounded-full');
      expect(planCard()).not.toContain('Acesso completo');
      expect(planCard()).not.toContain('style={{');
      expect(planCard()).not.toContain('EDITORIAL_BRAND');
      const chip = readFileSync(
        join(root, 'components', 'layout', 'MenuNavIconChip.tsx'),
        'utf8',
      );
      expect(chip).toContain("MENU_ICON_IDLE = 'text-slate-600'");
      expect(chip).toContain('showChip = isBottom && active');
      expect(chip).toContain("text-[var(--color-brand)]");
      expect(chip).toContain("fill={active ? 'currentColor' : 'none'}");
      expect(chip).toContain('MENU_ICON_STROKE_ACTIVE');
      const nav = readFileSync(join(root, 'lib', 'layout', 'dashboardNav.ts'), 'utf8');
      expect(nav).toContain('icon: Library');
      expect(nav).toContain('icon: Target');
      expect(nav).toContain('icon: RefreshCw');
      expect(nav).not.toContain('LayoutDashboard');
      expect(nav).not.toContain('Sparkles');
      expect(nav).not.toContain('BrainCircuit');
    });
  });
});
