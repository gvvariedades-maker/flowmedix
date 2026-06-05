import { ESTUDAR_L0_GEN_STORAGE_KEY } from '@/lib/estudar/l0Invalidation';
import {
  fetchAndSyncEstudarL0Meta,
  invalidateQuestaoL0Client,
  syncEstudarL0Generation,
} from '@/lib/estudar/questaoL0Client';
import { clearAllQuestaoIdb, deleteQuestaoFromIdbBySlug } from '@/lib/estudar/questaoIdbCache';

jest.mock('@/lib/api/fetch-with-auth', () => ({
  fetchWithAuth: jest.fn(),
}));

jest.mock('@/lib/estudar/questaoIdbCache', () => ({
  clearAllQuestaoIdb: jest.fn(),
  deleteQuestaoFromIdbBySlug: jest.fn(),
  getQuestaoFromIdb: jest.fn(),
  setQuestaoInIdb: jest.fn(),
}));

import { fetchWithAuth } from '@/lib/api/fetch-with-auth';

const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>;
const mockClearAll = clearAllQuestaoIdb as jest.MockedFunction<typeof clearAllQuestaoIdb>;
const mockDeleteBySlug = deleteQuestaoFromIdbBySlug as jest.MockedFunction<
  typeof deleteQuestaoFromIdbBySlug
>;

describe('questaoL0Client', () => {
  const postMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        controller: { postMessage },
        ready: Promise.resolve({ active: { postMessage } }),
      },
    });
  });

  it('syncEstudarL0Generation purga L0 quando generation mudou', async () => {
    localStorage.setItem(ESTUDAR_L0_GEN_STORAGE_KEY, 'old-gen');
    mockClearAll.mockResolvedValue();

    const cleared = await syncEstudarL0Generation('new-gen');

    expect(cleared).toBe(true);
    expect(mockClearAll).toHaveBeenCalled();
    expect(localStorage.getItem(ESTUDAR_L0_GEN_STORAGE_KEY)).toBe('new-gen');
    expect(postMessage).toHaveBeenCalledWith({
      type: 'AVANT_CLEAR_ESTUDAR_L0',
      slugs: null,
    });
  });

  it('syncEstudarL0Generation não purga quando generation igual', async () => {
    localStorage.setItem(ESTUDAR_L0_GEN_STORAGE_KEY, 'same-gen');

    const cleared = await syncEstudarL0Generation('same-gen');

    expect(cleared).toBe(false);
    expect(mockClearAll).not.toHaveBeenCalled();
  });

  it('invalidateQuestaoL0Client remove por slug', async () => {
    mockDeleteBySlug.mockResolvedValue();

    await invalidateQuestaoL0Client({ slugs: ['questao-a', 'questao-b'] });

    expect(mockDeleteBySlug).toHaveBeenCalledWith('questao-a');
    expect(mockDeleteBySlug).toHaveBeenCalledWith('questao-b');
    expect(postMessage).toHaveBeenCalledWith({
      type: 'AVANT_CLEAR_ESTUDAR_L0',
      slugs: ['questao-a', 'questao-b'],
    });
  });

  it('fetchAndSyncEstudarL0Meta sincroniza com resposta da API', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => ({ generation: 'idb2-10-2026-01-01' }),
    } as Response);
    mockClearAll.mockResolvedValue();

    const cleared = await fetchAndSyncEstudarL0Meta();

    expect(mockFetchWithAuth).toHaveBeenCalledWith('/api/estudar/l0-meta');
    expect(cleared).toBe(true);
  });
});
