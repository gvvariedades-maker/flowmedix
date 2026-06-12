import {
  filterVitrineGroupsByStatus,
  isNewVitrineGroup,
  isPendingVitrineGroup,
} from '@/lib/vitrine/filterGroups';
import type { VitrineGrupoSubtopico } from '@/lib/vitrine/types';

function buildGroup(overrides: Partial<VitrineGrupoSubtopico> = {}): VitrineGrupoSubtopico {
  return {
    titulo_aula: 'Assunto A',
    modulo_nome: 'Módulo',
    banca: 'FGV',
    questoes: [],
    acertos: 0,
    erros: 0,
    totalResolvidas: 0,
    totalQuestoes: 2,
    totalNeuroSlides: 8,
    trabalhadas: 0,
    percentual: 0,
    firstSlug: 'slug-a',
    ...overrides,
  };
}

describe('filterVitrineGroupsByStatus', () => {
  const groups = [
    buildGroup({ titulo_aula: 'Novo', totalResolvidas: 0, trabalhadas: 0 }),
    buildGroup({
      titulo_aula: 'Pendente',
      totalResolvidas: 1,
      trabalhadas: 1,
      totalQuestoes: 3,
    }),
    buildGroup({
      titulo_aula: 'Completo',
      totalResolvidas: 2,
      trabalhadas: 2,
      totalQuestoes: 2,
    }),
  ];

  it('retorna todos os grupos com status all', () => {
    expect(filterVitrineGroupsByStatus(groups, 'all')).toHaveLength(3);
  });

  it('filtra pendentes (trabalhadas < totalQuestoes)', () => {
    const pending = filterVitrineGroupsByStatus(groups, 'pending');
    expect(pending.map((g) => g.titulo_aula)).toEqual(['Novo', 'Pendente']);
  });

  it('filtra novos (totalResolvidas === 0)', () => {
    const fresh = filterVitrineGroupsByStatus(groups, 'new');
    expect(fresh.map((g) => g.titulo_aula)).toEqual(['Novo']);
  });

  it('helpers refletem as mesmas regras', () => {
    expect(isPendingVitrineGroup(groups[0])).toBe(true);
    expect(isNewVitrineGroup(groups[0])).toBe(true);
    expect(isPendingVitrineGroup(groups[2])).toBe(false);
    expect(isNewVitrineGroup(groups[2])).toBe(false);
  });
});
