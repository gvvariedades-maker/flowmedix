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

  it('monta vitrine com dois slugs', () => {
    const page = getE2eEstudarVitrinePage();
    expect(page.groups).toHaveLength(1);
    expect(page.groups[0]?.firstSlug).toBe(E2E_ESTUDAR_SLUG_1);
    expect(page.groups[0]?.questoes).toHaveLength(2);
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
