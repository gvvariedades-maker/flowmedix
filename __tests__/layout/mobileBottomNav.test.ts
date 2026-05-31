import {
  MOBILE_PAGE_BOTTOM_PADDING,
  MOBILE_PAGE_BOTTOM_PADDING_WITH_PWA,
  MOBILE_PAGE_ACTION_BAR_STACK_PADDING,
  MOBILE_PAGE_ACTION_BAR_STACK_PADDING_WITH_PWA,
  MOBILE_ACTION_BAR_STACK_SPACER,
  MOBILE_ACTION_BAR_STACK_SPACER_WITH_PWA,
  MOBILE_ACTION_BAR_Z,
  MOBILE_BOTTOM_NAV_Z,
  MOBILE_DRAWER_OVERLAY_Z,
  MOBILE_DRAWER_PANEL_Z,
  MOBILE_PWA_INSTALL_BANNER_CLEARANCE,
  MOBILE_PAGE_VITRINE_PAGINATION_STACK_PADDING,
  MOBILE_VITRINE_PAGINATION_FIXED_BOTTOM,
  getDashboardPageBottomPadding,
} from '@/lib/layout/mobileBottomNav';

describe('mobileBottomNav tokens', () => {
  it('exporta padding base com BottomNav 5rem e safe area', () => {
    expect(MOBILE_PAGE_BOTTOM_PADDING).toContain('5rem');
    expect(MOBILE_PAGE_BOTTOM_PADDING).toContain('safe-area-inset-bottom');
  });

  it('drawer mobile fica acima da faixa de ação e do BottomNav', () => {
    expect(MOBILE_BOTTOM_NAV_Z).toBe('z-40');
    expect(MOBILE_ACTION_BAR_Z).toBe('z-50');
    expect(MOBILE_DRAWER_OVERLAY_Z).toBe('z-[65]');
    expect(MOBILE_DRAWER_PANEL_Z).toBe('z-[70]');
  });

  it('exporta spacer da faixa de ação alinhado ao stack padding', () => {
    expect(MOBILE_ACTION_BAR_STACK_SPACER).toContain('5rem+1.25rem+5.25rem');
    expect(MOBILE_ACTION_BAR_STACK_SPACER_WITH_PWA).toContain('5.25rem+6rem');
  });

  it('exporta padding com banner PWA (+6rem)', () => {
    expect(MOBILE_PWA_INSTALL_BANNER_CLEARANCE).toBe('6rem');
    expect(MOBILE_PAGE_BOTTOM_PADDING_WITH_PWA).toContain('5rem+6rem');
    expect(MOBILE_PAGE_ACTION_BAR_STACK_PADDING_WITH_PWA).toContain('5.25rem+6rem');
  });

  it('getDashboardPageBottomPadding alterna conforme PWA visível', () => {
    expect(getDashboardPageBottomPadding('default', false)).toBe(MOBILE_PAGE_BOTTOM_PADDING);
    expect(getDashboardPageBottomPadding('default', true)).toBe(
      MOBILE_PAGE_BOTTOM_PADDING_WITH_PWA,
    );
    expect(getDashboardPageBottomPadding('actionBar', false)).toBe(
      MOBILE_PAGE_ACTION_BAR_STACK_PADDING,
    );
    expect(getDashboardPageBottomPadding('actionBar', true)).toBe(
      MOBILE_PAGE_ACTION_BAR_STACK_PADDING_WITH_PWA,
    );
    expect(getDashboardPageBottomPadding('vitrinePagination', false)).toBe(
      MOBILE_PAGE_VITRINE_PAGINATION_STACK_PADDING,
    );
  });

  it('paginação vitrine usa BottomNav 5rem no offset fixo', () => {
    expect(MOBILE_VITRINE_PAGINATION_FIXED_BOTTOM).toContain('5rem+0.75rem');
    expect(MOBILE_VITRINE_PAGINATION_FIXED_BOTTOM).not.toContain('4.5rem');
  });
});
