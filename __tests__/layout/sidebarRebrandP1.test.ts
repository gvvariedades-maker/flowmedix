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
      expect(source).toContain('border-t border-slate-100');
      expect(source).toMatch(/>\s*Suporte\s*</);
      expect(source).toContain('title="Tirar dúvidas pelo WhatsApp"');
      expect(source).toMatch(/>\s*WhatsApp\s*</);
      expect(source).toContain('<PwaInstallNavButton');
    });
  });

  describe('P1-2 — assinatura com chip slate', () => {
    it('UserAccountFooter usa MenuNavIconChip + card unificado', () => {
      const source = shell();
      expect(source).toMatch(
        /MenuNavIconChip icon=\{CreditCard\} accent="slate" active=\{isAssinaturaActive\}/,
      );
      expect(source).toContain('border-t border-slate-100');
      expect(source).toMatch(/aria-current=\{isAssinaturaActive \? 'page' : undefined\}/);
    });
  });

  describe('P1-3 — sticky topo + footer fixo', () => {
    it('PlanStatusCard sticky; nav scroll; conta fixa no rodapé', () => {
      const source = shell();
      expect(source).toContain('sticky top-0 z-10 shrink-0 border-b border-slate-100 bg-white pb-2');
      expect(source).toMatch(/flex-1 overflow-y-auto[\s\S]*<DashboardNav/);
      expect(source).toContain('shrink-0 border-t border-slate-200 bg-white pt-2');
      expect(planCard()).toContain('brandHref?: string');
    });
  });

  describe('P1-4 — AvantBrandMark unificado com AvantLogo', () => {
    it('delega lockup editorial ao AvantLogo (monograma Ae + wordmark raster)', () => {
      const source = brand();
      expect(source).toContain('AvantLogo');
      expect(source).toContain("'brand'");
      const logo = readFileSync(join(root, 'components', 'brand', 'AvantLogo.tsx'), 'utf8');
      expect(logo).toContain('/brand/avant-logo-shield.png');
      expect(logo).toContain('/brand/avant-logo-wordmark-raster.png');
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

    it('sidebar 16rem desktop e drawer mobile', () => {
      expect(shell()).toContain('w-[16rem]');
      expect(readFileSync(drawerPath, 'utf8')).toContain('w-[16rem]');
      expect(readFileSync(mobileNavPath, 'utf8')).toContain("DASHBOARD_SIDEBAR_WIDTH = '16rem'");
    });
  });
});
