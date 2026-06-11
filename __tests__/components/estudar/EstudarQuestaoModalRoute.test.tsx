import { render, screen, waitFor } from '@testing-library/react';
import { EstudarQuestaoModalRoute } from '@/components/estudar/EstudarQuestaoModalRoute';

const mockDismissToVitrine = jest.fn();
const mockUseQuestaoNavigation = jest.fn();
const mockUseEstudarPayloadStale = jest.fn(() => false);
const mockUseBodyScrollLock = jest.fn();

jest.mock('@/components/lesson/questao-navigation-context', () => ({
  useQuestaoNavigation: () => mockUseQuestaoNavigation(),
}));

jest.mock('@/components/lesson/useEstudarPayloadStale', () => ({
  useEstudarPayloadStale: () => mockUseEstudarPayloadStale(),
}));

jest.mock('@/lib/layout/useBodyScrollLock', () => ({
  useBodyScrollLock: (...args: unknown[]) => mockUseBodyScrollLock(...args),
}));

jest.mock('@/lib/estudar/estudarL0Config', () => ({
  isEstudarModalRouteEnabled: jest.fn(() => true),
}));

jest.mock('@/components/lesson/AvantLessonPlayer', () => ({
  __esModule: true,
  default: () => <div data-testid="avant-lesson-player">Player</div>,
}));

describe('EstudarQuestaoModalRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEstudarPayloadStale.mockReturnValue(false);
    mockUseQuestaoNavigation.mockReturnValue({
      displayPayload: null,
      dismissToVitrine: mockDismissToVitrine,
      isDismissingToVitrine: false,
    });
  });

  it('exibe skeleton no overlay enquanto não há displayPayload', () => {
    render(
      <EstudarQuestaoModalRoute>
        <div data-testid="modal-children">Hydrator</div>
      </EstudarQuestaoModalRoute>,
    );

    expect(screen.getByRole('dialog', { name: 'Carregando questão' })).toBeInTheDocument();
    expect(screen.getByTestId('estudar-questao-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('avant-lesson-player')).not.toBeInTheDocument();
    expect(mockUseBodyScrollLock).toHaveBeenCalledWith(true);
  });

  it('exibe player quando displayPayload está disponível', async () => {
    mockUseQuestaoNavigation.mockReturnValue({
      displayPayload: {
        moduloSlug: 'questao-a',
        vitrineQuerySuffix: '?page=2',
        dados: { meta: { banca: 'FGV', topico: 'T' } },
      },
      dismissToVitrine: mockDismissToVitrine,
      isDismissingToVitrine: false,
    });

    render(
      <EstudarQuestaoModalRoute>
        <div data-testid="modal-children">Hydrator</div>
      </EstudarQuestaoModalRoute>,
    );

    expect(screen.getByRole('dialog', { name: 'Questão' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('avant-lesson-player')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('estudar-questao-skeleton')).not.toBeInTheDocument();
  });

  it('não exibe overlay durante dismiss para vitrine', () => {
    mockUseQuestaoNavigation.mockReturnValue({
      displayPayload: {
        moduloSlug: 'questao-a',
        vitrineQuerySuffix: '',
        dados: {},
      },
      dismissToVitrine: mockDismissToVitrine,
      isDismissingToVitrine: true,
    });

    render(
      <EstudarQuestaoModalRoute>
        <div data-testid="modal-children">Hydrator</div>
      </EstudarQuestaoModalRoute>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockUseBodyScrollLock).toHaveBeenCalledWith(false);
  });
});
