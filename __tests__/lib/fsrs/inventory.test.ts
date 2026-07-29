/**
 * @jest-environment node
 */
import { resolveSubtopicoInventoryFromReviewUnit } from '@/lib/fsrs/inventory';

const mockLimit = jest.fn();
const mockEq = jest.fn(() => ({ limit: mockLimit }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
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
    mockSelect.mockReturnValue({ eq: mockEq });
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

  it('consulta modulo_slug e retorna inventário encontrado', async () => {
    mockLimit.mockResolvedValue({
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
    expect(slugs).toEqual(['slug-a', 'slug-b']);
  });

  it('retorna [] quando inventário está vazio', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    const slugs = await resolveSubtopicoInventoryFromReviewUnit(
      'fsrs:v1:discipline=enfermagem:subtopico=imunizacao',
    );
    expect(slugs).toEqual([]);
  });

  it('retorna [] e loga quando Supabase falha', async () => {
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
      expect.objectContaining({ message: 'column slug does not exist' }),
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
