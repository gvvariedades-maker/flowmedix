import { act, render, waitFor } from '@testing-library/react';
import { QuestaoNavigationProvider } from '@/components/lesson/QuestaoNavigationProvider';
import { useQuestaoNavigation } from '@/components/lesson/questao-navigation-context';
import type { EstudarQuestaoPayload } from '@/components/lesson/questao-navigation-context';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();
const mockRefresh = jest.fn();
const mockUsePathname = jest.fn(() => '/estudar');
const mockAddToast = jest.fn();
const mockFetchWithAuth = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
    refresh: mockRefresh,
  }),
  usePathname: () => mockUsePathname(),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/lib/api/fetch-with-auth', () => ({
  fetchWithAuth: (...args: unknown[]) => mockFetchWithAuth(...args),
}));

jest.mock('@/lib/estudar/prefetchChain', () => ({
  PREFETCH_FORWARD_DEPTH: 0,
  warmForwardChain: jest.fn(),
}));

jest.mock('@/lib/estudar/navigationTelemetry', () => ({
  attachEstudarNavTelemetryToWindow: jest.fn(),
  clearPrefetchInFlight: jest.fn(),
  markNavigateStart: jest.fn(),
  markPrefetchInFlight: jest.fn(),
  recordIdbHit: jest.fn(),
  recordIdbHydrate: jest.fn(),
  recordIdbMiss: jest.fn(),
  recordNavigateCacheResult: jest.fn(),
  recordPrefetchEnd: jest.fn(),
  recordPrefetchSkipped: jest.fn(),
  recordPrefetchStart: jest.fn(),
}));

jest.mock('@/lib/estudar/questaoIdbCache', () => ({
  getQuestaoFromIdb: jest.fn().mockResolvedValue(null),
  hydrateQuestaoLruFromIdb: jest.fn().mockResolvedValue(0),
  setQuestaoInIdb: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/estudar/viewTransition', () => ({
  runEstudarViewTransition: (fn: () => void) => fn(),
}));

jest.mock('@/lib/toast-context', () => ({
  useToast: () => ({ addToast: mockAddToast, toasts: [], removeToast: jest.fn() }),
}));

const samplePayloadA = {
  dados: {
    meta: { banca: 'IBFC', topico: 'Urgências' },
    question_data: {
      instruction: 'Enunciado A',
      options: [{ id: 'a', text: 'A', is_correct: true }],
    },
  },
  moduloSlug: 'questao-a',
  vitrineQuerySuffix: '',
} as EstudarQuestaoPayload;

const samplePayloadB = {
  ...samplePayloadA,
  dados: {
    ...samplePayloadA.dados,
    question_data: {
      instruction: 'Enunciado B',
      options: [{ id: 'a', text: 'A', is_correct: true }],
    },
  },
  moduloSlug: 'questao-b',
} as EstudarQuestaoPayload;

function Probe() {
  const nav = useQuestaoNavigation();
  return (
    <button type="button" onClick={() => void nav.navigateEstudar('questao-a')}>
      Ir
    </button>
  );
}

function NavigateResultProbe({
  onResult,
}: {
  onResult: (ok: boolean) => void;
}) {
  const nav = useQuestaoNavigation();
  return (
    <button
      type="button"
      onClick={async () => {
        onResult(await nav.navigateEstudar('questao-a'));
      }}
    >
      Ir com resultado
    </button>
  );
}

function DismissProbe() {
  const nav = useQuestaoNavigation();
  return (
    <button type="button" onClick={() => nav.dismissToVitrine({ vitrineQuerySuffix: '?page=2' })}>
      Fechar
    </button>
  );
}

function DisplayPayloadProbe({
  onModuloSlug,
}: {
  onModuloSlug: (slug: string | undefined) => void;
}) {
  const nav = useQuestaoNavigation();
  onModuloSlug(nav.displayPayload?.moduloSlug);
  return null;
}

describe('QuestaoNavigationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/estudar');
    mockFetchWithAuth.mockImplementation(async (url: string) => {
      const isB = String(url).includes('slug=questao-b');
      return {
        ok: true,
        status: 200,
        json: async () => (isB ? samplePayloadB : samplePayloadA),
      };
    });
  });

  it('retorna false em 403 sem aplicar payload', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Sem acesso a este módulo' }),
    });

    const onResult = jest.fn();
    const { getByRole } = render(
      <QuestaoNavigationProvider>
        <NavigateResultProbe onResult={onResult} />
      </QuestaoNavigationProvider>,
    );

    await act(async () => {
      getByRole('button', { name: 'Ir com resultado' }).click();
    });

    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith(false);
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('não navega e exibe toast em 403', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Sem acesso a este módulo' }),
    });

    const { getByRole } = render(
      <QuestaoNavigationProvider>
        <Probe />
      </QuestaoNavigationProvider>,
    );

    await act(async () => {
      getByRole('button', { name: 'Ir' }).click();
    });

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('Sem acesso', 'danger');
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('não navega de novo se a chave já foi marcada como forbidden', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Sem acesso a este módulo' }),
    });

    const { getByRole } = render(
      <QuestaoNavigationProvider>
        <Probe />
      </QuestaoNavigationProvider>,
    );

    const btn = getByRole('button', { name: 'Ir' });
    await act(async () => {
      btn.click();
    });
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledTimes(1));

    mockAddToast.mockClear();
    await act(async () => {
      btn.click();
    });

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('Sem acesso', 'danger');
    });
    expect(mockFetchWithAuth).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navega com payload e usa view transition wrapper no push', async () => {
    const { getByRole } = render(
      <QuestaoNavigationProvider>
        <Probe />
      </QuestaoNavigationProvider>,
    );

    await act(async () => {
      getByRole('button', { name: 'Ir' }).click();
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/estudar/questao-a');
      expect(mockFetchWithAuth).toHaveBeenCalledTimes(1);
    });
  });

  it('troca de slug in-player via history (sem router.replace, evita RSC)', async () => {
    const replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    mockUsePathname.mockReturnValue('/estudar/questao-a');

    const { getByRole } = render(
      <QuestaoNavigationProvider>
        <Probe />
      </QuestaoNavigationProvider>,
    );

    await act(async () => {
      getByRole('button', { name: 'Ir' }).click();
    });

    await waitFor(() => {
      expect(replaceStateSpy).toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    replaceStateSpy.mockRestore();
  });

  it('dismissToVitrine usa replace e não re-hidrata payload na URL antiga', async () => {
    mockUsePathname.mockReturnValue('/estudar/questao-a');

    const { getByRole } = render(
      <QuestaoNavigationProvider>
        <DismissProbe />
      </QuestaoNavigationProvider>,
    );

    await act(async () => {
      getByRole('button', { name: 'Fechar' }).click();
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/estudar?page=2');
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('permite segunda navegação após falha de API (navegandoRef liberado no finally)', async () => {
    mockFetchWithAuth
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'server error' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => samplePayloadA,
      });

    const { getByRole } = render(
      <QuestaoNavigationProvider>
        <Probe />
      </QuestaoNavigationProvider>,
    );

    const btn = getByRole('button', { name: 'Ir' });

    await act(async () => {
      btn.click();
    });
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('Não foi possível carregar esta questão. Tente novamente.', 'danger');
      expect(mockPush).not.toHaveBeenCalled();
    });

    mockAddToast.mockClear();

    await act(async () => {
      btn.click();
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/estudar/questao-a');
    });
    expect(mockFetchWithAuth).toHaveBeenCalledTimes(2);
  });

  it('route-sync em erro de API chama router.refresh após toast', async () => {
    mockUsePathname.mockReturnValue('/estudar/q-b');
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'server error' }),
    });

    render(
      <QuestaoNavigationProvider>
        <span>shell</span>
      </QuestaoNavigationProvider>,
    );

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        'Não foi possível carregar esta questão. Tente novamente.',
        'danger',
      );
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('route-sync em 403 redireciona à vitrine após toast', async () => {
    mockUsePathname.mockReturnValue('/estudar/q-b');
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Sem acesso a este módulo' }),
    });

    render(
      <QuestaoNavigationProvider>
        <span>shell</span>
      </QuestaoNavigationProvider>,
    );

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('Sem acesso', 'danger');
      expect(mockReplace).toHaveBeenCalledWith('/estudar');
    });
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('popstate reconcilia displayPayload com a URL do browser (cache hit)', async () => {
    jest.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    mockUsePathname.mockReturnValue('/estudar/questao-a');

    const onModuloSlug = jest.fn();

    function NavigateBProbe() {
      const n = useQuestaoNavigation();
      return (
        <button type="button" onClick={() => void n.navigateEstudar('questao-b')}>
          Ir B
        </button>
      );
    }

    const { getByRole } = render(
      <QuestaoNavigationProvider>
        <DisplayPayloadProbe onModuloSlug={onModuloSlug} />
        <NavigateBProbe />
      </QuestaoNavigationProvider>,
    );

    await waitFor(() => {
      expect(onModuloSlug).toHaveBeenCalledWith('questao-a');
    });

    await act(async () => {
      getByRole('button', { name: 'Ir B' }).click();
    });

    await waitFor(() => {
      expect(onModuloSlug).toHaveBeenCalledWith('questao-b');
    });

    onModuloSlug.mockClear();

    await act(async () => {
      window.history.replaceState(window.history.state, '', '/estudar/questao-a');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    await waitFor(() => {
      expect(onModuloSlug).toHaveBeenCalledWith('questao-a');
    });
  });

  it('permite segunda navegação na vitrine após a primeira concluir (navegandoRef liberado)', async () => {
    const { getByRole } = render(
      <QuestaoNavigationProvider>
        <Probe />
      </QuestaoNavigationProvider>,
    );

    const btn = getByRole('button', { name: 'Ir' });

    await act(async () => {
      btn.click();
    });
    await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(1));

    await act(async () => {
      btn.click();
    });
    await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(2));
  });
});
