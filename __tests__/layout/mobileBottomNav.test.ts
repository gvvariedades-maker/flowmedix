import {
  MOBILE_PAGE_PWA_BANNER_PADDING,
  MOBILE_PAGE_BOTTOM_PADDING,
  MOBILE_ACTION_BAR_STACK_SPACER,
  MOBILE_ACTION_BAR_STACK_SPACER_WITH_PWA,
  MOBILE_ACTION_BAR_Z,
  MOBILE_BOTTOM_NAV_Z,
  MOBILE_BOTTOM_NAV_HEIGHT,
  MOBILE_DRAWER_OVERLAY_Z,
  MOBILE_DRAWER_PANEL_Z,
  MOBILE_PWA_INSTALL_BANNER_CLEARANCE,
  MOBILE_VITRINE_PAGINATION_FIXED_BOTTOM,
  ESTUDO_REVERSO_FULLSCREEN_Z,
  ESTUDO_REVERSO_DESKTOP_INSET,
  ESTUDO_REVERSO_MOBILE_FIXED_BOTTOM,
  MOBILE_DRAWER_ABOVE_OVERLAYS_PANEL_Z,
  DASHBOARD_SIDEBAR_WIDTH,
  getDashboardPageBottomPadding,
} from '@/lib/layout/mobileBottomNav';

describe('mobileBottomNav tokens', () => {
  it('BottomNav no flex shell não exige padding de nav no main', () => {
    expect(MOBILE_PAGE_BOTTOM_PADDING).toBe('pb-0');
    expect(MOBILE_BOTTOM_NAV_HEIGHT).toBe('5rem');
  });

  it('drawer mobile fica acima da faixa de ação e do BottomNav', () => {
    expect(MOBILE_BOTTOM_NAV_Z).toBe('z-40');
    expect(MOBILE_ACTION_BAR_Z).toBe('z-50');
    expect(MOBILE_DRAWER_OVERLAY_Z).toBe('z-[65]');
    expect(MOBILE_DRAWER_PANEL_Z).toBe('z-[70]');
  });

  it('estudo reverso fullscreen fica acima do modal de questão', () => {
    expect(ESTUDO_REVERSO_FULLSCREEN_Z).toBe('z-[110]');
  });

  it('estudo reverso no desktop respeita largura da sidebar', () => {
    expect(DASHBOARD_SIDEBAR_WIDTH).toBe('18rem');
    expect(ESTUDO_REVERSO_DESKTOP_INSET).toContain('18rem');
  });

  it('estudo reverso no celular reserva altura do BottomNav', () => {
    expect(ESTUDO_REVERSO_MOBILE_FIXED_BOTTOM).toContain('max-md:bottom');
    expect(ESTUDO_REVERSO_MOBILE_FIXED_BOTTOM).toContain('5rem');
  });

  it('drawer mobile fica acima do modal de questão quando aberto', () => {
    expect(MOBILE_DRAWER_ABOVE_OVERLAYS_PANEL_Z).toBe('z-[120]');
    expect(ESTUDO_REVERSO_FULLSCREEN_Z).toBe('z-[110]');
  });

  it('getDashboardPageBottomPadding só reserva espaço para banner PWA', () => {
    expect(getDashboardPageBottomPadding('default', false)).toBeUndefined();
    expect(getDashboardPageBottomPadding('actionBar', false)).toBeUndefined();
    expect(getDashboardPageBottomPadding('default', true)).toBe(MOBILE_PAGE_PWA_BANNER_PADDING);
    expect(getDashboardPageBottomPadding('actionBar', true)).toBe(MOBILE_PAGE_PWA_BANNER_PADDING);
  });

  it('exporta spacers legados (faixa fixa antiga)', () => {
    expect(MOBILE_ACTION_BAR_STACK_SPACER).toContain('5rem+1.25rem+5.25rem');
    expect(MOBILE_ACTION_BAR_STACK_SPACER_WITH_PWA).toContain('5.25rem+6rem');
  });

  it('banner PWA usa clearance documentada', () => {
    expect(MOBILE_PWA_INSTALL_BANNER_CLEARANCE).toBe('6rem');
    expect(MOBILE_PAGE_PWA_BANNER_PADDING).toContain('6rem');
  });

  it('paginação vitrine legada usa BottomNav no offset fixo', () => {
    expect(MOBILE_VITRINE_PAGINATION_FIXED_BOTTOM).toContain('5rem+0.75rem');
  });
});
