import { renderHook } from '@testing-library/react';
import { useEstudarModalActive } from '@/components/estudar/useEstudarModalActive';

jest.mock('next/navigation', () => ({
  useSelectedLayoutSegment: jest.fn(() => 'questao-e2e-estudar-1'),
}));

describe('useEstudarModalActive', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
  });

  afterAll(() => {
    process.env = env;
  });

  it('retorna false quando feature flag desligada', () => {
    delete process.env.NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE;
    const { result } = renderHook(() => useEstudarModalActive());
    expect(result.current).toBe(false);
  });

  it('retorna true com flag e segmento modal ativo', () => {
    process.env.NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE = '1';
    const { result } = renderHook(() => useEstudarModalActive());
    expect(result.current).toBe(true);
  });
});
