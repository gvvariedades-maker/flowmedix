/**
 * @jest-environment node
 */
import { resolveSubtopicoInventoryFromReviewUnit } from '@/lib/fsrs/inventory';

const mockLimit = jest.fn();
const mockEq = jest.fn(() => ({ limit: mockLimit }));
const mockFilter = jest.fn(() => ({ limit: mockLimit }));
const mockSelect = jest.fn(() => ({ eq: mockEq, filter: mockFilter }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));
const mockCreateServerSupabase = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: () => mockCreateServerSupabase(),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('resolveSubtopicoInventoryFromReviewUnit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEq.mockReturnValue({ limit: mockLimit });
    mockFilter.mockReturnValue({ limit: mockLimit });
    mockSelect.mockReturnValue({ eq: mockEq, filter: mockFilter });
    mockFrom.mockReturnValue({ select: mockSelect });
    mockCreateServerSupabase.mockResolvedValue({ from: mockFrom });
  });

  it('retorna [] quando review_unit_id não tem subtópico', async () => {
    const slugs = await resolveSubtopicoInventoryFromReviewUnit(
      'fsrs:v1:discipline=enfermagem:cluster=abc',
    );
    expect(slugs).toEqual([]);
    expect(mockCreateServerSupabase).not.toHaveBeenCalled();
  });

  it('consulta modulo_slug na coluna e retorna inventário encontrado', async () => {
    mockLimit.mockResolvedValueOnce({
      data: [
        { modulo_slug: 'slug-a' },
        { modulo_slug: 'slug-b' },
        { modulo_slug: '  ' },
      ],
      error: null,
    });

    const unitId =
      'fsrs:v1:discipline=enfermagem:subtopico=' +
      encodeURIComponent('Imunização');
    const slugs = await resolveSubtopicoInventoryFromReviewUnit(unitId);

    expect(mockFrom).toHaveBeenCalledWith('modulos_estudo');
    expect(mockSelect).toHaveBeenCalledWith('modulo_slug');
    expect(mockEq).toHaveBeenCalledWith('subtopico', 'Imunização');
    expect(mockFilter).not.toHaveBeenCalled();
    expect(slugs).toEqual(['slug-a', 'slug-b']);
  });

  it('faz fallback para meta.subtopico quando a coluna está vazia', async () => {
    mockLimit
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({
        data: [{ modulo_slug: 'meta-slug-1' }],
        error: null,
      });

    const unitId =
      'fsrs:v1:discipline=enfermagem:subtopico=' +
      encodeURIComponent('Imunização');
    const slugs = await resolveSubtopicoInventoryFromReviewUnit(unitId);

    expect(mockFilter).toHaveBeenCalledWith(
      'conteudo_json->meta->>subtopico',
      'eq',
      'Imunização',
    );
    expect(slugs).toEqual(['meta-slug-1']);
  });

  it('retorna [] quando coluna e meta estão vazios', async () => {
    mockLimit
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: [], error: null });

    const slugs = await resolveSubtopicoInventoryFromReviewUnit(
      'fsrs:v1:discipline=enfermagem:subtopico=imunizacao',
    );
    expect(slugs).toEqual([]);
  });

  it('retorna [] e loga quando Supabase falha na coluna', async () => {
    const { logger } = await import('@/lib/logger');
    mockLimit.mockResolvedValue({
      data: null,
      error: { message: 'column slug does not exist' },
    });

    const slugs = await resolveSubtopicoInventoryFromReviewUnit(
      'fsrs:v1:discipline=enfermagem:subtopico=imunizacao',
    );
    expect(slugs).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      'resolveSubtopicoInventory failed',
      expect.objectContaining({
        message: 'column slug does not exist',
        source: 'column',
      }),
    );
  });

  it('retorna [] quando createServerSupabase lança', async () => {
    mockCreateServerSupabase.mockRejectedValueOnce(new Error('no service role'));

    const slugs = await resolveSubtopicoInventoryFromReviewUnit(
      'fsrs:v1:discipline=enfermagem:subtopico=imunizacao',
    );
    expect(slugs).toEqual([]);
  });
});
