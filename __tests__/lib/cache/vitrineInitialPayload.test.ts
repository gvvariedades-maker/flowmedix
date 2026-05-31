jest.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
  revalidateTag: jest.fn(),
}));

const mockGetVitrinePage = jest.fn();

jest.mock('@/lib/vitrine/service', () => ({
  getVitrinePage: (...args: unknown[]) => mockGetVitrinePage(...args),
}));

import { getVitrineInitialPayloadCached } from '@/lib/cache';

describe('getVitrineInitialPayloadCached', () => {
  beforeEach(() => {
    mockGetVitrinePage.mockReset();
  });

  it('retorna página com facets já embutidos (RPC Fase 2)', async () => {
    mockGetVitrinePage.mockResolvedValue({
      groups: [],
      facets: { bancas: ['FGV', 'CESPE'], assuntos: ['Anatomia', 'Farmacologia'] },
      pagination: { page: 1, perPage: 12, totalGroups: 0, totalPages: 1 },
      totalModulosFiltrados: 0,
    });

    const payload = await getVitrineInitialPayloadCached('user-1', 1, {}, {});

    expect(mockGetVitrinePage).toHaveBeenCalledTimes(1);
    expect(mockGetVitrinePage).toHaveBeenCalledWith({
      userId: 'user-1',
      page: 1,
      filters: {},
      isAdmin: false,
    });
    expect(payload.page.facets).toEqual({
      bancas: ['FGV', 'CESPE'],
      assuntos: ['Anatomia', 'Farmacologia'],
    });
  });
});
