import { act, render, waitFor } from '@testing-library/react';
import { QuestaoNavigationProvider } from '@/components/lesson/QuestaoNavigationProvider';
import { useQuestaoNavigation } from '@/components/lesson/questao-navigation-context';
import type { EstudarQuestaoPayload } from '@/components/lesson/questao-navigation-context';

const mockPush = jest.fn();
const mockPrefetch = jest.fn();
const mockAddToast = jest.fn();
const mockFetchWithAuth = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, prefetch: mockPrefetch }),
  usePathname: () => '/estudar',
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

const samplePayload = {
  dados: {
    meta: { banca: 'IBFC', topico: 'Urgências' },
    question_data: {
      instruction: 'Enunciado',
      options: [{ id: 'a', text: 'A', is_correct: true }],
    },
  },
  moduloSlug: 'questao-a',
  vitrineQuerySuffix: '',
} as EstudarQuestaoPayload;

function Probe() {
  const nav = useQuestaoNavigation();
  return (
    <button type="button" onClick={() => nav.navigateEstudar('questao-a')}>
      Ir
    </button>
  );
}

describe('QuestaoNavigationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => samplePayload,
    });
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
});
