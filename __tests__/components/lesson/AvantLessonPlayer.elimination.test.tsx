import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import type { AvantLessonPlayerProps } from '@/types/lesson';

const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/estudar/questao-a',
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

const baseDados: AvantLessonPlayerProps['dados'] = {
  meta: {
    banca: 'IBFC',
    ano: '2024',
    orgao: 'Hospital Teste',
    topico: 'Urgências',
    subtopico: 'RCP',
  },
  question_data: {
    instruction: 'Enunciado de teste',
    options: [
      { id: 'A', text: 'Alternativa A', is_correct: true },
      { id: 'B', text: 'Alternativa B', is_correct: false },
      { id: 'C', text: 'Alternativa C', is_correct: false },
    ],
  },
};

describe('AvantLessonPlayer elimination', () => {
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
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    window.sessionStorage.clear();
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Awaited<ReturnType<typeof fetchWithAuth>>);
  });

  it('exibe chips de banca e ano no cabeçalho', () => {
    render(
      <AvantLessonPlayer dados={baseDados} mode="live" moduloSlug="questao-a" />,
    );

    expect(screen.getByText('IBFC')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText(/Hospital Teste/)).toBeInTheDocument();
  });

  it('elimina alternativa e impede seleção', async () => {
    render(
      <AvantLessonPlayer dados={baseDados} mode="live" moduloSlug="questao-a" />,
    );

    const eliminarB = screen.getByRole('button', { name: 'Eliminar alternativa B' });
    await act(async () => {
      eliminarB.click();
    });

    const opcaoB = screen.getByRole('radio', { name: /Alternativa B/i });
    expect(opcaoB).toHaveAttribute('aria-disabled', 'true');
    expect(opcaoB).toBeDisabled();

    await act(async () => {
      opcaoB.click();
    });
    expect(screen.queryByRole('button', { name: 'Confirmar Resposta' })).not.toBeInTheDocument();
  });

  it(
    'restaura eliminações da sessão ao remontar a mesma questão',
    async () => {
      const { unmount } = render(
        <AvantLessonPlayer dados={baseDados} mode="live" moduloSlug="questao-a" />,
      );

      await act(async () => {
        screen.getByRole('button', { name: 'Eliminar alternativa B' }).click();
      });
      unmount();

      render(<AvantLessonPlayer dados={baseDados} mode="live" moduloSlug="questao-a" />);

      await waitFor(
        () => {
          expect(screen.getByRole('radio', { name: /Alternativa B.*eliminada/i })).toBeDisabled();
        },
        { timeout: 10_000 },
      );
    },
    15_000,
  );

  it('seleciona alternativa pela tecla da letra', async () => {
    render(<AvantLessonPlayer dados={baseDados} mode="live" moduloSlug="questao-a" />);

    const radiogroup = screen.getByRole('radiogroup', { name: 'Alternativas da questão' });
    await act(async () => {
      fireEvent.keyDown(radiogroup, { key: 'c' });
    });

    expect(screen.getByRole('radio', { name: /Alternativa C.*selecionada/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('elimina alternativa focada com a tecla E', async () => {
    render(<AvantLessonPlayer dados={baseDados} mode="live" moduloSlug="questao-a" />);

    const opcaoC = screen.getByRole('radio', { name: /Alternativa C/i });
    opcaoC.focus();
    await act(async () => {
      fireEvent.keyDown(opcaoC, { key: 'e' });
    });

    expect(screen.getByRole('radio', { name: /Alternativa C.*eliminada/i })).toBeDisabled();
  });
});
