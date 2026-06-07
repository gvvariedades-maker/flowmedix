import {
  E2E_ESTUDAR_BANCA,
  E2E_ESTUDAR_SLUG_1,
  E2E_ESTUDAR_SLUG_2,
} from '@/lib/e2e/constants';
import {
  buildE2eEstudarQuestaoPayload,
  getE2eEstudarVitrinePage,
  markE2eEstudarConcluido,
  resetE2eEstudarStore,
  resolveE2eEstudarAttempt,
} from '@/lib/e2e/estudarSeed';

describe('estudarSeed E2E', () => {
  beforeEach(() => {
    resetE2eEstudarStore();
  });

  it('monta vitrine paginada com 13 assuntos e reflete page na paginação', () => {
    const page1 = getE2eEstudarVitrinePage({ page: 1, bancas: [], assuntos: [] });
    expect(page1.groups).toHaveLength(12);
    expect(page1.groups[0]?.firstSlug).toBe(E2E_ESTUDAR_SLUG_1);
    expect(page1.groups[0]?.questoes).toHaveLength(2);
    expect(page1.pagination.page).toBe(1);
    expect(page1.pagination.totalGroups).toBe(13);
    expect(page1.pagination.totalPages).toBe(2);

    const page2 = getE2eEstudarVitrinePage({ page: 2, bancas: [], assuntos: [] });
    expect(page2.groups).toHaveLength(1);
    expect(page2.pagination.page).toBe(2);
    expect(page2.pagination.totalPages).toBe(2);
  });

  it('preserva page=2 na navegação', () => {
    const q1 = buildE2eEstudarQuestaoPayload(E2E_ESTUDAR_SLUG_1, {
      banca: [E2E_ESTUDAR_BANCA],
      page: '2',
    });
    expect(q1.status).toBe('ok');
    if (q1.status !== 'ok') return;
    expect(q1.payload.proximaSlug).toBe(
      `${E2E_ESTUDAR_SLUG_2}?banca=${encodeURIComponent(E2E_ESTUDAR_BANCA)}&page=2`,
    );
    expect(q1.payload.vitrineQuerySuffix).toBe(
      `?banca=${encodeURIComponent(E2E_ESTUDAR_BANCA)}&page=2`,
    );
  });

  it('preserva query da vitrine na navegação', () => {
    const q1 = buildE2eEstudarQuestaoPayload(E2E_ESTUDAR_SLUG_1, {
      banca: [E2E_ESTUDAR_BANCA],
    });
    expect(q1.status).toBe('ok');
    if (q1.status !== 'ok') return;
    expect(q1.payload.proximaSlug).toBe(`${E2E_ESTUDAR_SLUG_2}?banca=${encodeURIComponent(E2E_ESTUDAR_BANCA)}`);
    expect(q1.payload.vitrineQuerySuffix).toBe(`?banca=${encodeURIComponent(E2E_ESTUDAR_BANCA)}`);

    const q2 = buildE2eEstudarQuestaoPayload(E2E_ESTUDAR_SLUG_2, {
      banca: [E2E_ESTUDAR_BANCA],
    });
    expect(q2.status).toBe('ok');
    if (q2.status !== 'ok') return;
    expect(q2.payload.anteriorSlug).toBe(`${E2E_ESTUDAR_SLUG_1}?banca=${encodeURIComponent(E2E_ESTUDAR_BANCA)}`);
    expect(q2.payload.proximaSlug).toBeNull();
  });

  it('inclui 4 NeuroSlides no slug 1 (layers=full)', () => {
    const q1 = buildE2eEstudarQuestaoPayload(E2E_ESTUDAR_SLUG_1, {}, 'full');
    expect(q1.status).toBe('ok');
    if (q1.status !== 'ok') return;
    expect(q1.payload.dados.reverse_study_slides).toHaveLength(4);
  });

  it('resolve tentativa e marca estudada após conclusão', () => {
    expect(resolveE2eEstudarAttempt(E2E_ESTUDAR_SLUG_1, 'A')).toEqual({
      acertou: true,
      opcaoCorretaId: 'A',
    });
    markE2eEstudarConcluido(E2E_ESTUDAR_SLUG_1);
    const q1 = buildE2eEstudarQuestaoPayload(E2E_ESTUDAR_SLUG_1, {}, 'full');
    expect(q1.status).toBe('ok');
    if (q1.status !== 'ok') return;
    expect(q1.payload.questoesDoAssunto.find((q) => q.slug === E2E_ESTUDAR_SLUG_1)?.estudada).toBe(
      true,
    );
  });
});
