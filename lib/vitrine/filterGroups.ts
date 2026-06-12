import type { VitrineGrupoSubtopico } from '@/lib/vitrine/types';

/** Filtro rápido client-side (`?status=`). Não altera a paginação do servidor. */
export type VitrineStatusFilter = 'all' | 'pending' | 'new';

export function isPendingVitrineGroup(group: VitrineGrupoSubtopico): boolean {
  return group.totalQuestoes > 0 && group.trabalhadas < group.totalQuestoes;
}

export function isNewVitrineGroup(group: VitrineGrupoSubtopico): boolean {
  return group.totalQuestoes > 0 && group.totalResolvidas === 0;
}

/** Filtra grupos da página atual (pós-SWR). */
export function filterVitrineGroupsByStatus(
  groups: VitrineGrupoSubtopico[],
  status: VitrineStatusFilter,
): VitrineGrupoSubtopico[] {
  if (status === 'all') return groups;
  if (status === 'pending') return groups.filter(isPendingVitrineGroup);
  return groups.filter(isNewVitrineGroup);
}

export function vitrineStatusFilterLabel(status: VitrineStatusFilter): string {
  switch (status) {
    case 'pending':
      return 'Pendentes';
    case 'new':
      return 'Novos';
    default:
      return 'Todos';
  }
}
