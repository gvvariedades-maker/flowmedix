import {
  findFirstPendingSlug,
  getSimuladoPrefetchSlugs,
} from '@/lib/simulado/questionNavigation';
import type { SimuladoQuestaoItem } from '@/lib/simulado/types';

const questoes: SimuladoQuestaoItem[] = [
  {
    ordem: 1,
    modulo_slug: 'q1',
    respondida: true,
    meta: { banca: null, topico: null, subtopico: null },
    acertou: true,
    opcao_id: 'A',
    opcao_correta_id: 'A',
    respondida_em: null,
    tempo_ms: null,
  },
  {
    ordem: 2,
    modulo_slug: 'q2',
    respondida: false,
    meta: { banca: null, topico: null, subtopico: null },
  },
  {
    ordem: 3,
    modulo_slug: 'q3',
    respondida: false,
    meta: { banca: null, topico: null, subtopico: null },
  },
];

describe('lib/simulado/questionNavigation', () => {
  it('findFirstPendingSlug retorna primeira pendente', () => {
    expect(findFirstPendingSlug(questoes)).toBe('q2');
  });

  it('getSimuladoPrefetchSlugs ignora ativa e limita profundidade', () => {
    expect(getSimuladoPrefetchSlugs(questoes, 'q2', 2)).toEqual(['q3']);
    expect(getSimuladoPrefetchSlugs(questoes, 'q1', 2)).toEqual(['q2', 'q3']);
  });
});
