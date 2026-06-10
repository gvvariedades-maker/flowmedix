import { getCadernoBannerCopy } from '@/components/onboarding/CadernoOnboardingBanner';
import {
  CADERNO_BANNER_SNOOZE_MS,
  isCadernoBannerSnoozed,
  resolveCadernoBannerCta,
  resolveCadernoBannerVisible,
} from '@/components/onboarding/useCadernoOnboarding';
import { EMPTY_NOTEBOOK_ACTIVATION } from '@/lib/cadernos/activation';

describe('useCadernoOnboarding helpers', () => {
  const baseVisibleInput = {
    enabled: true,
    hydrated: true,
    isSnoozed: false,
    activation: EMPTY_NOTEBOOK_ACTIVATION,
    isAdmin: false,
    isPro: false,
    proSource: null as const,
    welcomeOpen: false,
    questaoModalOpen: false,
    estudarQuestaoImmersive: false,
  };

  it('isCadernoBannerSnoozed respeita janela de 24h', () => {
    const now = 1_700_000_000_000;
    expect(isCadernoBannerSnoozed(now, String(now + CADERNO_BANNER_SNOOZE_MS - 1))).toBe(true);
    expect(isCadernoBannerSnoozed(now, String(now - 1))).toBe(false);
    expect(isCadernoBannerSnoozed(now, 'invalid')).toBe(false);
  });

  it('resolveCadernoBannerVisible oculta assinante stripe, admin e caderno ativo', () => {
    expect(resolveCadernoBannerVisible(baseVisibleInput)).toBe(true);
    expect(
      resolveCadernoBannerVisible({
        ...baseVisibleInput,
        isPro: true,
        proSource: 'stripe',
      }),
    ).toBe(false);
    expect(resolveCadernoBannerVisible({ ...baseVisibleInput, isAdmin: true })).toBe(false);
    expect(
      resolveCadernoBannerVisible({
        ...baseVisibleInput,
        activation: { notebookCount: 1, hasNotebookWithItems: true, emptyNotebookCount: 0 },
      }),
    ).toBe(false);
    expect(resolveCadernoBannerVisible({ ...baseVisibleInput, welcomeOpen: true })).toBe(false);
    expect(resolveCadernoBannerVisible({ ...baseVisibleInput, isSnoozed: true })).toBe(false);
    expect(resolveCadernoBannerVisible({ ...baseVisibleInput, hydrated: false })).toBe(false);
  });

  it('resolveCadernoBannerCta aponta wizard ou lista conforme contagem', () => {
    expect(resolveCadernoBannerCta(EMPTY_NOTEBOOK_ACTIVATION)).toEqual({
      href: '/cadernos/novo?wizard=1',
      label: 'Criar caderno',
    });
    expect(
      resolveCadernoBannerCta({
        notebookCount: 2,
        hasNotebookWithItems: false,
        emptyNotebookCount: 2,
      }),
    ).toEqual({
      href: '/cadernos',
      label: 'Adicionar questões',
    });
  });

  it('getCadernoBannerCopy varia por tier e edital', () => {
    expect(
      getCadernoBannerCopy({ isPro: true, proSource: 'invite', editalBanca: null }).title,
    ).toContain('acesso completo');
    expect(
      getCadernoBannerCopy({ isPro: false, proSource: null, editalBanca: 'CESPE' }).subtitle,
    ).toBe('Sua banca: CESPE');
  });
});
