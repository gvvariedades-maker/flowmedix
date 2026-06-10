/**
 * @jest-environment node
 */
import { DataServiceUnavailableError } from '@/lib/dataServiceError';
import {
  EMPTY_NOTEBOOK_ACTIVATION,
  getNotebookActivationStatus,
} from '@/lib/cadernos/activation';

jest.mock('@/lib/supabaseReadRetry', () => ({
  withPostgrestReadRetry: jest.fn(
    async (
      _label: string,
      execute: () => PromiseLike<{ data: unknown; error: null }>,
    ) => {
      const { data, error } = await execute();
      if (error) throw error;
      return data;
    },
  ),
}));

const mockFrom = jest.fn();
const mockCreateServerSupabase = jest.fn(async () => ({ from: mockFrom }));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(() => mockCreateServerSupabase()),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

function mockNotebooksQuery(data: { id: string }[]) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data, error: null }),
    }),
  };
}

function mockItemsProbeQuery(data: { notebook_id: string }[]) {
  return {
    select: jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue({ data, error: null }),
      }),
    }),
  };
}

function mockItemsFullQuery(data: { notebook_id: string }[]) {
  return {
    select: jest.fn().mockReturnValue({
      in: jest.fn().mockResolvedValue({ data, error: null }),
    }),
  };
}

describe('getNotebookActivationStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna EMPTY quando usuário não tem cadernos', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'study_notebooks') return mockNotebooksQuery([]);
      throw new Error(`unexpected table ${table}`);
    });

    await expect(getNotebookActivationStatus(USER_ID)).resolves.toEqual(EMPTY_NOTEBOOK_ACTIVATION);
  });

  it('conta cadernos vazios quando não há itens', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'study_notebooks') {
        return mockNotebooksQuery([{ id: 'nb-1' }, { id: 'nb-2' }]);
      }
      if (table === 'study_notebook_items') return mockItemsProbeQuery([]);
      throw new Error(`unexpected table ${table}`);
    });

    await expect(getNotebookActivationStatus(USER_ID)).resolves.toEqual({
      notebookCount: 2,
      hasNotebookWithItems: false,
      emptyNotebookCount: 2,
    });
  });

  it('detecta ativação parcial (um caderno com itens, outro vazio)', async () => {
    let itemsCalls = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'study_notebooks') {
        return mockNotebooksQuery([{ id: 'nb-1' }, { id: 'nb-2' }]);
      }
      if (table === 'study_notebook_items') {
        itemsCalls += 1;
        if (itemsCalls === 1) {
          return mockItemsProbeQuery([{ notebook_id: 'nb-1' }]);
        }
        return mockItemsFullQuery([
          { notebook_id: 'nb-1' },
          { notebook_id: 'nb-1' },
        ]);
      }
      throw new Error(`unexpected table ${table}`);
    });

    await expect(getNotebookActivationStatus(USER_ID)).resolves.toEqual({
      notebookCount: 2,
      hasNotebookWithItems: true,
      emptyNotebookCount: 1,
    });
  });

  it('marca todos ativos quando cada caderno tem item', async () => {
    let itemsCalls = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'study_notebooks') {
        return mockNotebooksQuery([{ id: 'nb-1' }, { id: 'nb-2' }]);
      }
      if (table === 'study_notebook_items') {
        itemsCalls += 1;
        if (itemsCalls === 1) {
          return mockItemsProbeQuery([{ notebook_id: 'nb-1' }]);
        }
        return mockItemsFullQuery([
          { notebook_id: 'nb-1' },
          { notebook_id: 'nb-2' },
        ]);
      }
      throw new Error(`unexpected table ${table}`);
    });

    await expect(getNotebookActivationStatus(USER_ID)).resolves.toEqual({
      notebookCount: 2,
      hasNotebookWithItems: true,
      emptyNotebookCount: 0,
    });
  });

  it('lança DataServiceUnavailableError em contagem inconsistente', async () => {
    let itemsCalls = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'study_notebooks') {
        return mockNotebooksQuery([{ id: 'nb-1' }]);
      }
      if (table === 'study_notebook_items') {
        itemsCalls += 1;
        if (itemsCalls === 1) {
          return mockItemsProbeQuery([{ notebook_id: 'nb-1' }]);
        }
        return mockItemsFullQuery([
          { notebook_id: 'nb-1' },
          { notebook_id: 'nb-orphan' },
        ]);
      }
      throw new Error(`unexpected table ${table}`);
    });

    await expect(getNotebookActivationStatus(USER_ID)).rejects.toBeInstanceOf(
      DataServiceUnavailableError,
    );
  });
});
