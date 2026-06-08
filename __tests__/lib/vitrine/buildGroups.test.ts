import { buildVitrineGroups } from '@/lib/vitrine/buildGroups';
import type { ModuloComStats } from '@/lib/vitrineFilters';

function modulo(partial: Partial<ModuloComStats> & Pick<ModuloComStats, 'modulo_slug' | 'titulo_aula'>): ModuloComStats {
  return {
    id: partial.id ?? partial.modulo_slug,
    modulo_nome: partial.modulo_nome ?? 'Tópico',
    banca: partial.banca ?? 'FGV',
    avant_codigo: partial.avant_codigo ?? null,
    created_at: partial.created_at ?? '2024-01-01T00:00:00Z',
    estudoReversoConcluido: partial.estudoReversoConcluido ?? false,
    stats: partial.stats ?? { acertos: 0, total: 0, percentual: 0, priorityScore: 50 },
    ...partial,
  };
}

describe('buildVitrineGroups', () => {
  it('agrupa por titulo_aula e ordena pendentes primeiro', () => {
    const groups = buildVitrineGroups([
      modulo({
        modulo_slug: 'a-1',
        titulo_aula: 'Assunto A',
        estudoReversoConcluido: true,
        stats: { acertos: 1, total: 1, percentual: 100, priorityScore: 10 },
      }),
      modulo({
        modulo_slug: 'b-1',
        titulo_aula: 'Assunto B',
        estudoReversoConcluido: false,
      }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].titulo_aula).toBe('Assunto B');
    expect(groups[0].totalQuestoes).toBe(1);
    expect(groups[1].titulo_aula).toBe('Assunto A');
  });

  it('soma totalNeuroSlides por assunto', () => {
    const groups = buildVitrineGroups([
      modulo({ modulo_slug: 'q1', titulo_aula: 'X', slide_count: 4 }),
      modulo({ modulo_slug: 'q2', titulo_aula: 'X', slide_count: 3 }),
      modulo({ modulo_slug: 'q3', titulo_aula: 'Y', slide_count: 4 }),
    ]);

    expect(groups.find((g) => g.titulo_aula === 'X')?.totalNeuroSlides).toBe(7);
    expect(groups.find((g) => g.titulo_aula === 'Y')?.totalNeuroSlides).toBe(4);
  });

  it('define firstSlug como primeira questão não estudada', () => {
    const groups = buildVitrineGroups([
      modulo({ modulo_slug: 'q1', titulo_aula: 'X', estudoReversoConcluido: true }),
      modulo({ modulo_slug: 'q2', titulo_aula: 'X', estudoReversoConcluido: false }),
    ]);

    expect(groups[0].firstSlug).toBe('q2');
    expect(groups[0].questoes).toHaveLength(2);
  });
});
