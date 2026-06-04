import { renderHook } from '@testing-library/react';
import { useEstudarQuestaoShellState } from '@/components/lesson/useEstudarQuestaoShellState';

const mockUsePathname = jest.fn();
const mockUseSearchParams = jest.fn();
const mockUseQuestaoNavigation = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

jest.mock('@/components/lesson/questao-navigation-context', () => ({
  useQuestaoNavigation: () => mockUseQuestaoNavigation(),
}));

describe('useEstudarQuestaoShellState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  it('na vitrine não exibe player nem skeleton', () => {
    mockUsePathname.mockReturnValue('/estudar');
    mockUseQuestaoNavigation.mockReturnValue({
      displayPayload: null,
      isDismissingToVitrine: false,
    });

    const { result } = renderHook(() => useEstudarQuestaoShellState());

    expect(result.current.isQuestaoRoute).toBe(false);
    expect(result.current.showPlayer).toBe(false);
    expect(result.current.showSkeleton).toBe(false);
  });

  it('na rota da questão sem payload exibe skeleton', () => {
    mockUsePathname.mockReturnValue('/estudar/questao-a');
    mockUseQuestaoNavigation.mockReturnValue({
      displayPayload: null,
      isDismissingToVitrine: false,
    });

    const { result } = renderHook(() => useEstudarQuestaoShellState());

    expect(result.current.showSkeleton).toBe(true);
    expect(result.current.showPlayer).toBe(false);
    expect(result.current.displayPayload).toBeNull();
  });

  it('mantém player montado com isPayloadStale quando slug do payload não casa com a rota', () => {
    const stalePayload = {
      moduloSlug: 'questao-a',
      vitrineQuerySuffix: '?banca=FGV',
      dados: {},
    };
    mockUsePathname.mockReturnValue('/estudar/questao-b');
    mockUseSearchParams.mockReturnValue(new URLSearchParams('banca=FGV'));
    mockUseQuestaoNavigation.mockReturnValue({
      displayPayload: stalePayload,
      isDismissingToVitrine: false,
    });

    const { result } = renderHook(() => useEstudarQuestaoShellState());

    expect(result.current.showSkeleton).toBe(false);
    expect(result.current.showPlayer).toBe(true);
    expect(result.current.isPayloadStale).toBe(true);
    expect(result.current.displayPayload).toBe(stalePayload);
  });

  it('com modal ativo não exibe skeleton no shell sem payload', () => {
    mockUsePathname.mockReturnValue('/estudar/questao-a');
    mockUseQuestaoNavigation.mockReturnValue({
      displayPayload: null,
      isDismissingToVitrine: false,
    });

    const { result } = renderHook(() =>
      useEstudarQuestaoShellState({ modalActive: true }),
    );

    expect(result.current.showSkeleton).toBe(false);
    expect(result.current.showPlayer).toBe(false);
  });

  it('exibe player quando chave de cache coincide', () => {
    const payload = {
      moduloSlug: 'questao-a',
      vitrineQuerySuffix: '?banca=FGV&page=2',
      dados: { meta: { banca: 'FGV' } },
    };
    mockUsePathname.mockReturnValue('/estudar/questao-a');
    mockUseSearchParams.mockReturnValue(new URLSearchParams('banca=FGV&page=2'));
    mockUseQuestaoNavigation.mockReturnValue({
      displayPayload: payload,
      isDismissingToVitrine: false,
    });

    const { result } = renderHook(() => useEstudarQuestaoShellState());

    expect(result.current.showPlayer).toBe(true);
    expect(result.current.showSkeleton).toBe(false);
    expect(result.current.isPayloadStale).toBe(false);
    expect(result.current.displayPayload).toBe(payload);
  });

  it('não marca payload stale em rota de caderno quando vitrineQuerySuffix casa', () => {
    const cadernoId = '550e8400-e29b-41d4-a716-446655440000';
    const payload = {
      moduloSlug: 'questao-a',
      vitrineQuerySuffix: `?from=caderno&caderno_id=${cadernoId}`,
      dados: {},
    };
    mockUsePathname.mockReturnValue('/estudar/questao-a');
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(`from=caderno&caderno_id=${cadernoId}`),
    );
    mockUseQuestaoNavigation.mockReturnValue({
      displayPayload: payload,
      isDismissingToVitrine: false,
    });

    const { result } = renderHook(() => useEstudarQuestaoShellState());

    expect(result.current.showPlayer).toBe(true);
    expect(result.current.isPayloadStale).toBe(false);
  });
});
