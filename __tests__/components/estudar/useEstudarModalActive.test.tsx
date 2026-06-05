import { renderHook } from '@testing-library/react';
import { useEstudarModalActive } from '@/components/estudar/useEstudarModalActive';
import {
  resetEstudarModalOverlayOpenForTests,
  setEstudarModalOverlayOpen,
} from '@/lib/estudar/estudarModalOpenBridge';

const mockUsePathname = jest.fn(() => '/estudar/questao-e2e-estudar-1');

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useSelectedLayoutSegment: jest.fn(() => 'questao-e2e-estudar-1'),
}));

jest.mock('@/lib/layout/useDashboardDesktop', () => ({
  useDashboardDesktop: jest.fn(() => false),
}));

import { useDashboardDesktop } from '@/lib/layout/useDashboardDesktop';

const mockUseDashboardDesktop = useDashboardDesktop as jest.MockedFunction<
  typeof useDashboardDesktop
>;

describe('useEstudarModalActive', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    resetEstudarModalOverlayOpenForTests();
    mockUseDashboardDesktop.mockReturnValue(false);
    mockUsePathname.mockReturnValue('/estudar/questao-e2e-estudar-1');
  });

  afterAll(() => {
    process.env = env;
  });

  it('retorna false quando feature flag desligada', () => {
    delete process.env.NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE;
    const { result } = renderHook(() => useEstudarModalActive());
    expect(result.current).toBe(false);
  });

  it('retorna true com flag e segmento modal ativo no mobile', () => {
    process.env.NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE = '1';
    const { result } = renderHook(() => useEstudarModalActive());
    expect(result.current).toBe(true);
  });

  it('retorna false no desktop mesmo com flag e segmento modal', () => {
    process.env.NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE = '1';
    mockUseDashboardDesktop.mockReturnValue(true);
    const { result } = renderHook(() => useEstudarModalActive());
    expect(result.current).toBe(false);
  });

  it('retorna false na vitrine (/estudar) mesmo com segmento modal preso', () => {
    process.env.NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE = '1';
    mockUsePathname.mockReturnValue('/estudar');
    const { result } = renderHook(() => useEstudarModalActive());
    expect(result.current).toBe(false);
  });

  it('retorna true via bridge quando segmento modal não alcança o shell ancestral', () => {
    const { useSelectedLayoutSegment } = jest.requireMock('next/navigation') as {
      useSelectedLayoutSegment: jest.Mock;
    };
    useSelectedLayoutSegment.mockReturnValueOnce(null);
    process.env.NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE = '1';
    setEstudarModalOverlayOpen(true);
    const { result } = renderHook(() => useEstudarModalActive());
    expect(result.current).toBe(true);
  });
});
