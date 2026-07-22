import { fireEvent, render, screen } from '@testing-library/react';
import {
  VitrineQuestaoLink,
  buildVitrineSlugComQuery,
} from '@/components/vitrine/VitrineQuestaoLink';

const prefetchEstudar = jest.fn();
const navigateEstudar = jest.fn();

jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock('@/components/lesson/questao-navigation-context', () => ({
  useQuestaoNavigationOptional: jest.fn(),
}));

jest.mock('@/lib/estudar/prefetchPolicy', () => ({
  shouldSkipEstudarPrefetch: jest.fn(() => false),
}));

jest.mock('@/lib/estudar/navigation', () => {
  const actual = jest.requireActual<typeof import('@/lib/estudar/navigation')>(
    '@/lib/estudar/navigation',
  );
  return {
    ...actual,
    markEstudarVitrineReturnEligible: jest.fn(),
  };
});

import { useQuestaoNavigationOptional } from '@/components/lesson/questao-navigation-context';
import { markEstudarVitrineReturnEligible } from '@/lib/estudar/navigation';
import { shouldSkipEstudarPrefetch } from '@/lib/estudar/prefetchPolicy';

const mockMarkVitrineReturnEligible = markEstudarVitrineReturnEligible as jest.MockedFunction<
  typeof markEstudarVitrineReturnEligible
>;

const mockUseNav = useQuestaoNavigationOptional as jest.MockedFunction<
  typeof useQuestaoNavigationOptional
>;
const mockShouldSkip = shouldSkipEstudarPrefetch as jest.MockedFunction<
  typeof shouldSkipEstudarPrefetch
>;

describe('VitrineQuestaoLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShouldSkip.mockReturnValue(false);
    mockUseNav.mockReturnValue({
      displayPayload: null,
      setDisplayPayload: jest.fn(),
      cachePayload: jest.fn(),
      getCachedPayload: jest.fn(),
      navigateEstudar,
      prefetchEstudar,
      prefetchPayload: jest.fn(),
      refetchRoutePayload: jest.fn().mockResolvedValue('ok'),
      dismissToVitrine: jest.fn(),
      isDismissingToVitrine: false,
      estudarRoute: null,
    });
  });

  it('monta href com slug e query da vitrine', () => {
    render(
      <VitrineQuestaoLink slug="questao-a" estudarQuery="?banca=IBFC&page=2">
        Abrir
      </VitrineQuestaoLink>,
    );
    const link = screen.getByRole('link', { name: 'Abrir' });
    expect(link).toHaveAttribute('href', '/estudar/questao-a?banca=IBFC&page=2');
  });

  it('prefetch no hover e focus quando há provider', () => {
    render(<VitrineQuestaoLink slug="questao-b">Questão</VitrineQuestaoLink>);
    const link = screen.getByRole('link', { name: 'Questão' });

    fireEvent.pointerEnter(link);
    expect(prefetchEstudar).toHaveBeenCalledWith('questao-b');

    prefetchEstudar.mockClear();
    fireEvent.focus(link);
    expect(prefetchEstudar).toHaveBeenCalledWith('questao-b');
  });

  it('clique simples não chama navigateEstudar (navegação nativa do Link)', () => {
    render(
      <VitrineQuestaoLink slug="questao-c" estudarQuery="?q=rcp">
        Iniciar
      </VitrineQuestaoLink>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Iniciar' }));
    expect(navigateEstudar).not.toHaveBeenCalled();
    expect(mockMarkVitrineReturnEligible).toHaveBeenCalledTimes(1);
  });

  it('não altera clique com modificador (nova aba)', () => {
    render(<VitrineQuestaoLink slug="questao-d">Abrir</VitrineQuestaoLink>);
    const link = screen.getByRole('link', { name: 'Abrir' });
    fireEvent.click(link, { ctrlKey: true });
    expect(navigateEstudar).not.toHaveBeenCalled();
    expect(mockMarkVitrineReturnEligible).not.toHaveBeenCalled();
  });

  it('sem provider usa Link nativo (sem prefetch nem navigate)', () => {
    mockUseNav.mockReturnValue(null);
    render(<VitrineQuestaoLink slug="questao-e">Fallback</VitrineQuestaoLink>);
    const link = screen.getByRole('link', { name: 'Fallback' });
    fireEvent.pointerEnter(link);
    fireEvent.click(link);
    expect(prefetchEstudar).not.toHaveBeenCalled();
    expect(navigateEstudar).not.toHaveBeenCalled();
  });

  it('omite prefetch quando shouldSkipEstudarPrefetch', () => {
    mockShouldSkip.mockReturnValue(true);
    render(<VitrineQuestaoLink slug="questao-f">Questão</VitrineQuestaoLink>);
    fireEvent.pointerEnter(screen.getByRole('link', { name: 'Questão' }));
    expect(prefetchEstudar).not.toHaveBeenCalled();
  });

  it('buildVitrineSlugComQuery concatena slug e query', () => {
    expect(buildVitrineSlugComQuery('slug-x', '?page=3')).toBe('slug-x?page=3');
    expect(buildVitrineSlugComQuery('slug-y')).toBe('slug-y');
  });
});
