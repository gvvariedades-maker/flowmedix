import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useMemo, useState } from 'react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { buildEstudarCacheKeyFromSlugComQuery } from '@/lib/estudar/navigation';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import {
  QuestaoNavigationContext,
  type EstudarQuestaoPayload,
  type QuestaoNavigationContextValue,
} from '@/components/lesson/questao-navigation-context';
import type { AvantLessonPlayerProps } from '@/types/lesson';

const mockRefresh = jest.fn();
const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), refresh: mockRefresh }),
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

const SLUG = 'questao-a';
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

function buildDisplayPayload(): EstudarQuestaoPayload {
  return {
    dados: fullDados,
    mode: 'live',
    moduloSlug: SLUG,
    proximaSlug: 'questao-b',
    questoesDoAssunto: [
      { slug: SLUG, indice: 1, estudada: false },
      { slug: 'questao-b', indice: 2, estudada: false },
    ],
    listaContexto: { atual: 1, total: 2 },
  };
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
  await waitFor(() => expect(screen.getByTestId('neuro-slide')).toBeInTheDocument());
}

async function advanceToLastSlide(totalSlides: number) {
  for (let i = 0; i < totalSlides - 1; i++) {
    await act(async () => {
      const proximoBtns = screen.getAllByRole('button', { name: /^próximo$/i });
      const slideNext = proximoBtns[proximoBtns.length - 1];
      fireEvent.click(slideNext);
    });
  }
}

function PlayerWithNavHarness({
  cachePayload,
}: {
  cachePayload: jest.MockedFunction<QuestaoNavigationContextValue['cachePayload']>;
}) {
  const [displayPayload, setDisplayPayload] = useState<EstudarQuestaoPayload>(buildDisplayPayload);

  const navValue = useMemo<QuestaoNavigationContextValue>(
    () => ({
      displayPayload,
      setDisplayPayload,
      cachePayload,
      getCachedPayload: jest.fn(),
      navigateEstudar: jest.fn(),
      prefetchEstudar: jest.fn(),
      prefetchPayload: jest.fn(),
      dismissToVitrine: jest.fn(),
      isDismissingToVitrine: false,
      estudarRoute: null,
    }),
    [displayPayload, cachePayload],
  );

  return (
    <QuestaoNavigationContext.Provider value={navValue}>
      <AvantLessonPlayer {...displayPayload} />
    </QuestaoNavigationContext.Provider>
  );
}

describe('AvantLessonPlayer optimistic dots', () => {
  const cachePayload = jest.fn();

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
      if (url === '/api/concluir-estudo-reverso' && init?.method === 'POST') {
        return { ok: true, status: 200, json: async () => ({}) } as Awaited<
          ReturnType<typeof fetchWithAuth>
        >;
      }
      return { ok: false, status: 500 } as Awaited<ReturnType<typeof fetchWithAuth>>;
    });

    render(<PlayerWithNavHarness cachePayload={cachePayload} />);
  });

  it('após Marcar estudado atualiza displayPayload, cache e dot verde na mesma sessão', async () => {
    await openEstudoReverso();
    await advanceToLastSlide(fullDados.reverse_study_slides!.length);

    const dotAntes = screen.getByRole('button', { name: /questão 1, atual/i });
    expect(dotAntes.getAttribute('aria-label')).not.toMatch(/estudo reverso concluído/i);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /marcar estudado/i }));
    });

    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());

    const cacheKey = buildEstudarCacheKeyFromSlugComQuery(SLUG);
    expect(cachePayload).toHaveBeenCalledWith(
      cacheKey,
      expect.objectContaining({
        questoesDoAssunto: expect.arrayContaining([
          expect.objectContaining({ slug: SLUG, estudada: true }),
        ]),
      }),
    );

    await waitFor(() => {
      const dotDepois = screen.getByRole('button', {
        name: /questão 1, atual, estudo reverso concluído/i,
      });
      expect(dotDepois).toBeInTheDocument();
    });
  });
});
