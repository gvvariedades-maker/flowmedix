import { renderHook } from '@testing-library/react';
import { useEstudarQuestaoImmersive } from '@/lib/layout/useEstudarQuestaoImmersive';

const mockUsePathname = jest.fn(() => '/estudar/questao-teste');

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock('@/lib/layout/useDashboardDesktop', () => ({
  useDashboardDesktop: jest.fn(() => false),
}));

import { useDashboardDesktop } from '@/lib/layout/useDashboardDesktop';

const mockUseDashboardDesktop = useDashboardDesktop as jest.MockedFunction<
  typeof useDashboardDesktop
>;

describe('useEstudarQuestaoImmersive', () => {
  beforeEach(() => {
    mockUseDashboardDesktop.mockReturnValue(false);
    mockUsePathname.mockReturnValue('/estudar/questao-teste');
  });

  it('retorna true em /estudar/[slug] no mobile', () => {
    const { result } = renderHook(() => useEstudarQuestaoImmersive());
    expect(result.current).toBe(true);
  });

  it('retorna false na vitrine /estudar no mobile', () => {
    mockUsePathname.mockReturnValue('/estudar');
    const { result } = renderHook(() => useEstudarQuestaoImmersive());
    expect(result.current).toBe(false);
  });

  it('retorna false em /estudar/ no mobile (sem slug)', () => {
    mockUsePathname.mockReturnValue('/estudar/');
    const { result } = renderHook(() => useEstudarQuestaoImmersive());
    expect(result.current).toBe(false);
  });

  it('retorna false em questão no desktop (≥ md)', () => {
    mockUseDashboardDesktop.mockReturnValue(true);
    const { result } = renderHook(() => useEstudarQuestaoImmersive());
    expect(result.current).toBe(false);
  });

  it('retorna false em outras rotas do dashboard no mobile', () => {
    mockUsePathname.mockReturnValue('/analytics');
    const { result } = renderHook(() => useEstudarQuestaoImmersive());
    expect(result.current).toBe(false);
  });
});
