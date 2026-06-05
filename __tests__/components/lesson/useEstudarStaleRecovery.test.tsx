import { act, renderHook } from '@testing-library/react';
import {
  ESTUDAR_STALE_RECOVERY_MS,
  useEstudarStaleRecovery,
} from '@/components/lesson/useEstudarStaleRecovery';

const mockRefresh = jest.fn();
const mockRefetchRoutePayload = jest.fn();
const mockUseEstudarPayloadStale = jest.fn();
const mockUseQuestaoNavigation = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

jest.mock('@/components/lesson/useEstudarPayloadStale', () => ({
  useEstudarPayloadStale: () => mockUseEstudarPayloadStale(),
}));

jest.mock('@/components/lesson/questao-navigation-context', () => ({
  useQuestaoNavigation: () => mockUseQuestaoNavigation(),
}));

describe('useEstudarStaleRecovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseQuestaoNavigation.mockReturnValue({
      refetchRoutePayload: mockRefetchRoutePayload,
      isDismissingToVitrine: false,
    });
    window.history.replaceState({}, '', '/estudar/questao-b?page=2');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('não refaz fetch enquanto payload não está stale', () => {
    mockUseEstudarPayloadStale.mockReturnValue(false);

    renderHook(() => useEstudarStaleRecovery());

    act(() => {
      jest.advanceTimersByTime(ESTUDAR_STALE_RECOVERY_MS + 100);
    });

    expect(mockRefetchRoutePayload).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('após 3s stale refaz fetch com skipCache pela URL do browser', async () => {
    mockUseEstudarPayloadStale.mockReturnValue(true);
    mockRefetchRoutePayload.mockResolvedValue('ok');

    renderHook(() => useEstudarStaleRecovery());

    act(() => {
      jest.advanceTimersByTime(ESTUDAR_STALE_RECOVERY_MS - 1);
    });
    expect(mockRefetchRoutePayload).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(mockRefetchRoutePayload).toHaveBeenCalledWith('questao-b?page=2', {
      skipCache: true,
    });
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('chama router.refresh quando refetch falha', async () => {
    mockUseEstudarPayloadStale.mockReturnValue(true);
    mockRefetchRoutePayload.mockResolvedValue('error');

    renderHook(() => useEstudarStaleRecovery());

    await act(async () => {
      jest.advanceTimersByTime(ESTUDAR_STALE_RECOVERY_MS);
      await Promise.resolve();
    });

    expect(mockRefetchRoutePayload).toHaveBeenCalledTimes(1);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('chama router.refresh quando ainda stale após refetch ok', async () => {
    mockUseEstudarPayloadStale.mockReturnValue(true);
    mockRefetchRoutePayload.mockResolvedValue('ok');

    const { rerender } = renderHook(() => useEstudarStaleRecovery());

    await act(async () => {
      jest.advanceTimersByTime(ESTUDAR_STALE_RECOVERY_MS);
      await Promise.resolve();
    });

    expect(mockRefetchRoutePayload).toHaveBeenCalledTimes(1);
    expect(mockRefresh).not.toHaveBeenCalled();

    rerender();

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('ignora recovery enquanto dismiss à vitrine está ativo', () => {
    mockUseEstudarPayloadStale.mockReturnValue(true);
    mockUseQuestaoNavigation.mockReturnValue({
      refetchRoutePayload: mockRefetchRoutePayload,
      isDismissingToVitrine: true,
    });

    renderHook(() => useEstudarStaleRecovery());

    act(() => {
      jest.advanceTimersByTime(ESTUDAR_STALE_RECOVERY_MS + 500);
    });

    expect(mockRefetchRoutePayload).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
