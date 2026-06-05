import { act, render, screen, waitFor } from '@testing-library/react';
import { ESTUDAR_STALE_RECOVERY_MS } from '@/components/lesson/useEstudarStaleRecovery';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import {
  QuestaoNavigationContext,
  type QuestaoNavigationContextValue,
} from '@/components/lesson/questao-navigation-context';
import type { AvantLessonPlayerProps } from '@/types/lesson';

const mockPush = jest.fn();
const navigateEstudar = jest.fn();
const refetchRoutePayload = jest.fn();
const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn() }),
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

const baseDados: AvantLessonPlayerProps['dados'] = {
  meta: { banca: 'IBFC', topico: 'Urgências' },
  question_data: {
    instruction: 'Enunciado de teste',
    options: [
      { id: 'a', text: 'Alternativa A', is_correct: true },
      { id: 'b', text: 'Alternativa B', is_correct: false },
    ],
  },
};

function renderPlayerWithNav(overrides: Partial<AvantLessonPlayerProps> = {}) {
  const navValue: QuestaoNavigationContextValue = {
    displayPayload: null,
    setDisplayPayload: jest.fn(),
    cachePayload: jest.fn(),
    getCachedPayload: jest.fn(),
    navigateEstudar,
    prefetchEstudar: jest.fn(),
    prefetchPayload: jest.fn(),
    refetchRoutePayload,
    dismissToVitrine: jest.fn(),
    isDismissingToVitrine: false,
    estudarRoute: null,
  };

  return render(
    <QuestaoNavigationContext.Provider value={navValue}>
      <AvantLessonPlayer
        dados={baseDados}
        mode="live"
        moduloSlug="questao-a"
        proximaSlug="questao-b"
        questoesDoAssunto={[
          { slug: 'questao-a', indice: 1, estudada: false },
          { slug: 'questao-b', indice: 2, estudada: false },
        ]}
        listaContexto={{ atual: 1, total: 2 }}
        {...overrides}
      />
    </QuestaoNavigationContext.Provider>,
  );
}

describe('AvantLessonPlayer navigation', () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as typeof ResizeObserver;
    HTMLElement.prototype.scrollIntoView = jest.fn();
    HTMLElement.prototype.scrollTo = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    navigateEstudar.mockReset();
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Awaited<ReturnType<typeof fetchWithAuth>>);
  });

  it('segundo clique em Próxima após falha ainda chama navigateEstudar', async () => {
    navigateEstudar
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    renderPlayerWithNav();

    const proximaBtn = screen.getByRole('button', { name: /próxima/i });

    await act(async () => {
      proximaBtn.click();
    });
    await waitFor(() => expect(navigateEstudar).toHaveBeenCalledTimes(1));
    expect(navigateEstudar).toHaveBeenCalledWith('questao-b');
    expect(proximaBtn).not.toBeDisabled();

    await act(async () => {
      proximaBtn.click();
    });
    await waitFor(() => expect(navigateEstudar).toHaveBeenCalledTimes(2));
  });

  it('não navega com payloadStale (dots e Próxima desabilitados, label Sincronizando)', async () => {
    renderPlayerWithNav({ payloadStale: true });

    const sincronizandoBtns = screen.getAllByRole('button', { name: /sincronizando/i });
    expect(sincronizandoBtns.length).toBeGreaterThanOrEqual(1);
    const proximaBtn = sincronizandoBtns[sincronizandoBtns.length - 1]!;
    expect(proximaBtn).toBeDisabled();

    await act(async () => {
      proximaBtn.click();
    });

    expect(navigateEstudar).not.toHaveBeenCalled();

    const dotButtons = screen.getAllByRole('button', { name: /questão/i });
    const outroDot = dotButtons.find((btn) => btn.getAttribute('aria-current') !== 'step');
    expect(outroDot).toBeDefined();
    expect(outroDot).toBeDisabled();

    await act(async () => {
      outroDot!.click();
    });
    expect(navigateEstudar).not.toHaveBeenCalled();
  });

  it('mostra Carregando... enquanto navigateEstudar está em andamento', async () => {
    let resolveNavigate: (value: boolean) => void = () => {};
    navigateEstudar.mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          resolveNavigate = resolve;
        }),
    );

    renderPlayerWithNav();

    const proximaBtn = screen.getByRole('button', { name: /próxima/i });

    await act(async () => {
      proximaBtn.click();
    });

    expect(screen.getAllByRole('button', { name: /carregando/i }).length).toBeGreaterThanOrEqual(1);

    await act(async () => {
      resolveNavigate(true);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /próxima/i })).toBeInTheDocument();
    });
  });

  it('exibe Tentar novamente após stale prolongado e chama refetchRoutePayload', async () => {
    jest.useFakeTimers();
    refetchRoutePayload.mockResolvedValue('ok');
    window.history.pushState({}, '', '/estudar/questao-a');

    renderPlayerWithNav({ payloadStale: true });

    expect(screen.queryByRole('button', { name: /tentar novamente/i })).not.toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(ESTUDAR_STALE_RECOVERY_MS);
    });

    const retryBtn = screen.getByRole('button', { name: /tentar novamente/i });
    await act(async () => {
      retryBtn.click();
    });

    expect(refetchRoutePayload).toHaveBeenCalledWith('questao-a', { skipCache: true });

    jest.useRealTimers();
  });
});
