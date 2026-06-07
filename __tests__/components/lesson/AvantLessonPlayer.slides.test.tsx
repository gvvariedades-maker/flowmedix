import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import {
  SLIDES_LAYER_FALLBACK_BANNER,
  SLIDES_LAYER_LOAD_ERROR_MESSAGE,
  stripSlidesForCoreLayer,
} from '@/lib/estudar/questaoLayers';
import type { AvantLessonPlayerProps } from '@/types/lesson';

const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/estudar/questao-teste',
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
  useReadableTextZoomContext: () => ({
    contentKey: 'test',
    narrowViewport: false,
    textStep: 0,
  }),
}));

jest.mock('@/components/lesson/EstudoReversoSlideZoom', () => ({
  EstudoReversoSlideZoomProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  EstudoReversoSlideZoomToolbar: () => null,
  EstudoReversoSlideZoom: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/slides/NeuroSlide', () => ({
  __esModule: true,
  default: () => <div data-testid="neuro-slide" />,
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

const fullDados: AvantLessonPlayerProps['dados'] = {
  meta: { banca: 'IBFC', topico: 'Urgências', subtopico: 'RCP' },
  question_data: {
    instruction: 'Enunciado de teste',
    options: [
      { id: 'a', text: 'Alternativa A', is_correct: true },
      { id: 'b', text: 'Alternativa B', is_correct: false },
    ],
  },
  reverse_study_slides: [
    { type: 'golden_rule', content: 'Regra de ouro' },
    { type: 'concept_map', items: [{ label: 'A', detail: 'B' }] },
    { type: 'logic_flow', steps: ['Passo 1'] },
    { type: 'danger_zone', content: 'Cuidado', items: [] },
  ],
};

const coreDados = stripSlidesForCoreLayer(fullDados);

function renderPlayer(dados: AvantLessonPlayerProps['dados'] = coreDados) {
  return render(
    <AvantLessonPlayer
      dados={dados}
      mode="live"
      moduloSlug="questao-a"
      proximaSlug="questao-b"
      questoesDoAssunto={[{ slug: 'questao-a', indice: 1, estudada: false }]}
      listaContexto={{ atual: 1, total: 1 }}
    />,
  );
}

async function openEstudoReverso() {
  await act(async () => {
    fireEvent.click(screen.getByRole('radio', { name: /alternativa a:/i }));
  });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /confirmar resposta/i }));
  });
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /ativar estudo reverso/i })).toBeInTheDocument(),
  );
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /ativar estudo reverso/i }));
  });
}

describe('AvantLessonPlayer slides layer', () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as typeof ResizeObserver;
    HTMLElement.prototype.scrollIntoView = jest.fn();
    HTMLElement.prototype.scrollTo = jest.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: query.includes('max-width'),
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchWithAuth.mockImplementation(async (url: string, init?: RequestInit) => {
      if (typeof url === 'string' && url.includes('/api/freemium/status')) {
        return { ok: true, json: async () => ({}) } as Awaited<ReturnType<typeof fetchWithAuth>>;
      }
      if (url === '/api/registrar-tentativa' && init?.method === 'POST') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ acertou: true, opcao_correta_id: 'a' }),
        } as Awaited<ReturnType<typeof fetchWithAuth>>;
      }
      if (typeof url === 'string' && url.includes('layers=full')) {
        return { ok: false, status: 500 } as Awaited<ReturnType<typeof fetchWithAuth>>;
      }
      return { ok: false, status: 500 } as Awaited<ReturnType<typeof fetchWithAuth>>;
    });
  });

  it('exibe alerta e Tentar de novo quando layers=full falha', async () => {
    renderPlayer();
    await openEstudoReverso();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(SLIDES_LAYER_LOAD_ERROR_MESSAGE);
    });
    expect(screen.getByRole('button', { name: /tentar de novo/i })).toBeInTheDocument();
  });

  it('após retry com sucesso carrega NeuroSlides', async () => {
    renderPlayer();
    await openEstudoReverso();

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

    mockFetchWithAuth.mockImplementation(async (url: string, init?: RequestInit) => {
      if (typeof url === 'string' && url.includes('/api/freemium/status')) {
        return { ok: true, json: async () => ({}) } as Awaited<ReturnType<typeof fetchWithAuth>>;
      }
      if (url === '/api/registrar-tentativa' && init?.method === 'POST') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ acertou: true, opcao_correta_id: 'a' }),
        } as Awaited<ReturnType<typeof fetchWithAuth>>;
      }
      if (typeof url === 'string' && url.includes('layers=full')) {
        return {
          ok: true,
          json: async () => ({ dados: fullDados }),
        } as Awaited<ReturnType<typeof fetchWithAuth>>;
      }
      return { ok: false, status: 500 } as Awaited<ReturnType<typeof fetchWithAuth>>;
    });

    await act(async () => {
      screen.getByRole('button', { name: /tentar de novo/i }).click();
    });

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByTestId('neuro-slide')).toBeInTheDocument();
    });
  });

  it('após segunda falha exibe banner de fallback', async () => {
    renderPlayer();
    await openEstudoReverso();

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

    await act(async () => {
      screen.getByRole('button', { name: /tentar de novo/i }).click();
    });

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByText(SLIDES_LAYER_FALLBACK_BANNER)).toBeInTheDocument();
      expect(screen.getByTestId('neuro-slide')).toBeInTheDocument();
    });
  });
});
