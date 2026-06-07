/**
 * @jest-environment node
 */
import {
  resolveQuestaoInAssunto,
  ResolveQuestaoNotFoundError,
} from '@/lib/vitrine/resolveQuestao';

jest.mock('@/lib/concursos/entitlements', () => ({
  fetchAccessibleModulosForNav: jest.fn(),
}));

import { fetchAccessibleModulosForNav } from '@/lib/concursos/entitlements';

const fetchNav = fetchAccessibleModulosForNav as jest.MockedFunction<
  typeof fetchAccessibleModulosForNav
>;

const ASSUNTO = 'Processo de Enfermagem';

function modulo(
  slug: string,
  avant_codigo: number,
  created_at: string,
): {
  id: string;
  modulo_slug: string;
  modulo_nome: string | null;
  titulo_aula: string | null;
  banca: string;
  avant_codigo: number;
  created_at: string;
} {
  return {
    id: slug,
    modulo_slug: slug,
    modulo_nome: 'Fundamentos',
    titulo_aula: ASSUNTO,
    banca: 'IDECAN',
    avant_codigo,
    created_at,
  };
}

describe('resolveQuestaoInAssunto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchNav.mockResolvedValue([
      modulo('slug-a', 100, '2024-01-01T00:00:00Z'),
      modulo('slug-b', 200, '2024-01-02T00:00:00Z'),
      modulo('slug-c', 300, '2024-01-03T00:00:00Z'),
    ]);
  });

  it('resolve por número no assunto (ordem canônica)', async () => {
    const result = await resolveQuestaoInAssunto({
      userId: 'user-1',
      assunto: ASSUNTO,
      alvo: '2',
    });
    expect(result).toEqual({
      slug: 'slug-b',
      numero: 2,
      totalQuestoes: 3,
      avant_codigo: 200,
    });
  });

  it('resolve por código Q-', async () => {
    const result = await resolveQuestaoInAssunto({
      userId: 'user-1',
      assunto: ASSUNTO,
      alvo: 'Q-300',
    });
    expect(result.slug).toBe('slug-c');
    expect(result.numero).toBe(3);
  });

  it('lança quando número está fora do intervalo', async () => {
    await expect(
      resolveQuestaoInAssunto({
        userId: 'user-1',
        assunto: ASSUNTO,
        alvo: '99',
      }),
    ).rejects.toBeInstanceOf(ResolveQuestaoNotFoundError);
  });
});
