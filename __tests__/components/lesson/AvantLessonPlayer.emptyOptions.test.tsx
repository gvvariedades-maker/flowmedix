import { act, render, screen } from '@testing-library/react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import {
  QuestaoNavigationContext,
  type QuestaoNavigationContextValue,
} from '@/components/lesson/questao-navigation-context';
import type { AvantLessonPlayerProps } from '@/types/lesson';

const mockReplace = jest.fn();
const dismissToVitrine = jest.fn();
const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace, prefetch: jest.fn() }),
  usePathname: () => '/estudar/questao-teste',
  useSelectedLayoutSegment: () => null,
}));

jest.mock('@/lib/layout/useDashboardDesktop', () => ({
  useDashboardDesktop: jest.fn(() => false),
}));

jest.mock('@/lib/api/fetch-with-auth', () => ({
  fetchWithAuth: jest.fn(),
}));

jest.mock('@/lib/supabase/client', () => ({
  supabase: { auth: { getSession: jest.fn().mockResolvedValue({ data: { session: null } }) } },
}));

jest.mock('@/components/freemium/PaywallModal', () => ({
  PaywallModal: () => null,
}));

jest.mock('@/components/report/ReportErrorDialog', () => ({
  ReportErrorDialog: () => null,
}));

jest.mock('@/components/lesson/EstudoReversoFullscreenPortal', () => ({
  EstudoReversoHost: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/onboarding/MicroTip', () => ({
  MicroTip: () => null,
}));

jest.mock('@/components/accessibility/ReadableTextZoom', () => ({
  ReadableTextZoomProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ReadableTextZoomToolbar: () => null,
  ReadableTextZoomContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/slides/NeuroSlide', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  const motionOnly = new Set([
    'initial',
    'animate',
    'exit',
    'transition',
    'whileTap',
    'whileHover',
    'whileFocus',
    'layout',
    'layoutId',
    'variants',
    'custom',
  ]);
  const motionTag = (tag: string) =>
    function MotionStub({ children, ...props }: { children?: React.ReactNode }) {
      const domProps = Object.fromEntries(
        Object.entries(props).filter(([key]) => !motionOnly.has(key)),
      );
      return React.createElement(tag, domProps, children);
    };
  return {
    motion: {
      div: motionTag('div'),
      button: motionTag('button'),
      span: motionTag('span'),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useReducedMotion: () => true,
  };
});

const dadosSemAlternativas: AvantLessonPlayerProps['dados'] = {
  meta: { banca: 'IBFC', topico: 'Urgências' },
  question_data: {
    instruction: 'Enunciado sem alternativas',
    options: [],
  },
};

function renderPlayer(
  overrides: Partial<AvantLessonPlayerProps> = {},
  withNav = false,
) {
  const navValue: QuestaoNavigationContextValue = {
    displayPayload: null,
    setDisplayPayload: jest.fn(),
    cachePayload: jest.fn(),
    getCachedPayload: jest.fn(),
    navigateEstudar: jest.fn(),
    prefetchEstudar: jest.fn(),
    prefetchPayload: jest.fn(),
    refetchRoutePayload: jest.fn().mockResolvedValue('ok'),
    dismissToVitrine,
    isDismissingToVitrine: false,
    estudarRoute: null,
  };

  const player = (
    <AvantLessonPlayer
      dados={dadosSemAlternativas}
      mode="live"
      moduloSlug="questao-invalida"
      vitrineQuerySuffix="?page=2"
      {...overrides}
    />
  );

  if (withNav) {
    return render(
      <QuestaoNavigationContext.Provider value={navValue}>{player}</QuestaoNavigationContext.Provider>,
    );
  }

  return render(player);
}

describe('AvantLessonPlayer empty options', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Awaited<ReturnType<typeof fetchWithAuth>>);
  });

  it('mostra erro visível em vez de tela em branco', () => {
    renderPlayer();

    expect(screen.getByTestId('lesson-empty-question-error')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /questão indisponível/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /voltar à vitrine/i })).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup', { name: /alternativas da questão/i })).not.toBeInTheDocument();
  });

  it('volta à vitrine via router quando não há QuestaoNavigationProvider', async () => {
    renderPlayer();

    await act(async () => {
      screen.getByRole('button', { name: /voltar à vitrine/i }).click();
    });

    expect(mockReplace).toHaveBeenCalledWith('/estudar?page=2');
    expect(dismissToVitrine).not.toHaveBeenCalled();
  });

  it('volta à vitrine via dismissToVitrine quando há QuestaoNavigationProvider', async () => {
    renderPlayer({}, true);

    await act(async () => {
      screen.getByRole('button', { name: /voltar à vitrine/i }).click();
    });

    expect(dismissToVitrine).toHaveBeenCalledWith({
      fromPlano: false,
      fromCaderno: undefined,
      vitrineQuerySuffix: '?page=2',
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
