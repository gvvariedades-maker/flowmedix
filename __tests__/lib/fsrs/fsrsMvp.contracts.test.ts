import {
  FSRS_ATTEMPT_CONTEXTS,
  FSRS_MVP_ALGORITHM,
  FSRS_MVP_ALGORITHM_VERSION_LABEL,
  FSRS_MVP_CARD_SCHEMA_VERSION,
  FSRS_MVP_DEFAULT_REQUEST_RETENTION,
  FSRS_MVP_ENABLE_FUZZ,
  FSRS_MVP_PACKAGE_VERSION,
  createFsrsScheduler,
  deserializeFsrsMvpCard,
  isFsrsAttemptContext,
  isFsrsEligibleAttempt,
  isFsrsMvpRating,
  mapCorrectToRating,
  planFsrsRating,
  resolveReviewUnitId,
  serializeFsrsMvpCard,
  type FsrsAttemptContext,
  type FsrsMvpCardState,
  type FsrsMvpSerializedCard,
} from '@/lib/fsrs';

const T0 = new Date('2026-07-01T15:00:00.000Z');
const T1 = new Date('2026-07-02T15:00:00.000Z');
const T2 = new Date('2026-07-03T15:00:00.000Z');

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const v of Object.values(value as object)) {
      deepFreeze(v);
    }
  }
  return value;
}

describe('mapCorrectToRating', () => {
  it('elegível: incorreta → again; correta → good', () => {
    expect(mapCorrectToRating(false)).toBe('again');
    expect(mapCorrectToRating(true)).toBe('good');
  });

  it('nunca emite hard/easy', () => {
    expect(isFsrsMvpRating('hard')).toBe(false);
    expect(isFsrsMvpRating('easy')).toBe(false);
    expect(isFsrsMvpRating('again')).toBe(true);
    expect(isFsrsMvpRating('good')).toBe(true);
  });
});

describe('resolveReviewUnitId', () => {
  it('mesma disciplina + mesmo subtópico normalizado → mesmo ID', () => {
    const a = resolveReviewUnitId({
      discipline: 'Enfermagem',
      subtopico: '  Imunização  ',
    });
    const b = resolveReviewUnitId({
      discipline: 'enfermagem',
      subtopico: 'imunização',
    });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.reviewUnitId).toBe(b.reviewUnitId);
      expect(a.reviewUnitId).toBe(
        'fsrs:v1:discipline=enfermagem:subtopico=imuniza%C3%A7%C3%A3o',
      );
    }
  });

  it('disciplinas diferentes → IDs diferentes', () => {
    const enf = resolveReviewUnitId({
      discipline: 'Enfermagem',
      subtopico: 'Crase',
    });
    const pt = resolveReviewUnitId({
      discipline: 'Língua Portuguesa',
      subtopico: 'Crase',
    });
    expect(enf.ok && pt.ok).toBe(true);
    if (enf.ok && pt.ok) {
      expect(enf.reviewUnitId).not.toBe(pt.reviewUnitId);
    }
  });

  it('NFC composto/decomposto → mesmo ID', () => {
    const composed = 'café'; // U+00E9
    const decomposed = 'cafe\u0301'; // e + combining acute
    const a = resolveReviewUnitId({
      discipline: 'Enfermagem',
      subtopico: composed,
    });
    const b = resolveReviewUnitId({
      discipline: 'Enfermagem',
      subtopico: decomposed,
    });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.reviewUnitId).toBe(b.reviewUnitId);
    }
  });

  it('espaços e caixa → mesmo ID', () => {
    const a = resolveReviewUnitId({
      discipline: '  ENFERMAGEM  ',
      subtopico: 'Vias   de   Administração',
    });
    const b = resolveReviewUnitId({
      discipline: 'enfermagem',
      subtopico: 'vias de administração',
    });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) expect(a.reviewUnitId).toBe(b.reviewUnitId);
  });

  it('caracteres reservados não colidem', () => {
    const colon = resolveReviewUnitId({
      discipline: 'Enfermagem',
      subtopico: 'a:b',
    });
    const eq = resolveReviewUnitId({
      discipline: 'Enfermagem',
      subtopico: 'a=b',
    });
    expect(colon.ok && eq.ok).toBe(true);
    if (colon.ok && eq.ok) {
      expect(colon.reviewUnitId).not.toBe(eq.reviewUnitId);
      expect(colon.reviewUnitId).toContain('subtopico=a%3Ab');
      expect(eq.reviewUnitId).toContain('subtopico=a%3Db');
    }
  });

  it('cluster "a:b" e cluster "a%3Ab" produzem IDs diferentes', () => {
    const literalColon = resolveReviewUnitId({
      discipline: 'Enfermagem',
      knowledgeClusterId: 'a:b',
      clusterInventoryConfirmed: true,
    });
    const alreadyEscaped = resolveReviewUnitId({
      discipline: 'Enfermagem',
      knowledgeClusterId: 'a%3Ab',
      clusterInventoryConfirmed: true,
    });
    expect(literalColon.ok && alreadyEscaped.ok).toBe(true);
    if (literalColon.ok && alreadyEscaped.ok) {
      expect(literalColon.reviewUnitId).not.toBe(alreadyEscaped.reviewUnitId);
      // "a:b" → NFC/lower → encode → a%3Ab
      expect(literalColon.reviewUnitId).toContain('cluster=a%3Ab');
      // "a%3Ab" → lower → "a%3ab" → encode → a%253ab (não colide com o anterior)
      expect(alreadyEscaped.reviewUnitId).toContain('cluster=a%253ab');
    }
  });

  it('"Língua Portuguesa" e "língua   portuguesa" → mesmo ID', () => {
    const a = resolveReviewUnitId({
      discipline: 'Língua Portuguesa',
      subtopico: 'Crase',
    });
    const b = resolveReviewUnitId({
      discipline: 'língua   portuguesa',
      subtopico: 'crase',
    });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.reviewUnitId).toBe(b.reviewUnitId);
    }
  });

  it('cluster só quando clusterInventoryConfirmed === true', () => {
    const ok = resolveReviewUnitId({
      discipline: 'Enfermagem',
      knowledgeClusterId: 'crase-regencia',
      clusterInventoryConfirmed: true,
      subtopico: 'Crase',
    });
    expect(ok).toEqual({
      ok: true,
      reviewUnitKind: 'cluster',
      reviewUnitId: 'fsrs:v1:discipline=enfermagem:cluster=crase-regencia',
    });
  });

  it('cluster sem confirmação → fallback subtópico', () => {
    const result = resolveReviewUnitId({
      discipline: 'Enfermagem',
      knowledgeClusterId: 'crase-regencia',
      clusterInventoryConfirmed: false,
      subtopico: 'Crase',
    });
    expect(result).toEqual({
      ok: true,
      reviewUnitKind: 'subtopico',
      reviewUnitId: 'fsrs:v1:discipline=enfermagem:subtopico=crase',
    });

    const absent = resolveReviewUnitId({
      discipline: 'Enfermagem',
      knowledgeClusterId: 'crase-regencia',
      subtopico: 'Crase',
    });
    expect(absent.ok && absent.reviewUnitKind).toBe('subtopico');
  });

  it('disciplina vazia → erro', () => {
    expect(resolveReviewUnitId({ discipline: '', subtopico: 'Crase' })).toEqual({
      ok: false,
      reason: 'invalid_discipline',
    });
    expect(
      resolveReviewUnitId({
        discipline: '   ',
        subtopico: 'Crase',
      }),
    ).toEqual({ ok: false, reason: 'invalid_discipline' });
  });

  it('cluster e subtópico não colidem', () => {
    const cluster = resolveReviewUnitId({
      discipline: 'Enfermagem',
      knowledgeClusterId: 'imunização',
      clusterInventoryConfirmed: true,
    });
    const sub = resolveReviewUnitId({
      discipline: 'Enfermagem',
      subtopico: 'imunização',
    });
    expect(cluster.ok && sub.ok).toBe(true);
    if (cluster.ok && sub.ok) {
      expect(cluster.reviewUnitId).not.toBe(sub.reviewUnitId);
      expect(cluster.reviewUnitId).toContain(':cluster=');
      expect(sub.reviewUnitId).toContain(':subtopico=');
    }
  });

  it('pedagogical_branch extra não interfere', () => {
    const sneaky = {
      discipline: 'Enfermagem',
      subtopico: 'Vias de Administração',
      pedagogical_branch: 'via_vf_absorcao',
      family: 'vf',
      neuroCanvasCluster: 'blocker-x',
    } as { discipline: string; subtopico: string };
    const result = resolveReviewUnitId(sneaky);
    expect(result).toEqual({
      ok: true,
      reviewUnitKind: 'subtopico',
      reviewUnitId:
        'fsrs:v1:discipline=enfermagem:subtopico=vias%20de%20administra%C3%A7%C3%A3o',
    });
  });

  it('rejeita Geral / subtópico ausente', () => {
    expect(
      resolveReviewUnitId({ discipline: 'Enfermagem', subtopico: 'Geral' }).ok,
    ).toBe(false);
    expect(
      resolveReviewUnitId({ discipline: 'Enfermagem', subtopico: null }).ok,
    ).toBe(false);
  });
});

describe('FsrsAttemptContext elegibilidade', () => {
  const cases: Array<[FsrsAttemptContext, boolean]> = [
    ['cold_practice', true],
    ['scheduled_review', true],
    ['post_explanation', false],
    ['immediate_transfer', false],
    ['answer_revealed', false],
    ['technical_retry', false],
    ['invalid_question', false],
    ['unknown', false],
  ];

  it.each(cases)('%s → eligible=%s', (context, eligible) => {
    const result = isFsrsEligibleAttempt({ context });
    expect(result.eligible).toBe(eligible);
  });

  it('valor inválido em runtime → fail-closed', () => {
    const result = isFsrsEligibleAttempt({ context: 'replay_like' });
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reasons).toContain('context_invalid');
      expect(result.context).toBeNull();
    }
  });

  it('contrato não inclui isReplay', () => {
    expect(FSRS_ATTEMPT_CONTEXTS.includes('isReplay' as never)).toBe(false);
    expect(isFsrsAttemptContext('isReplay')).toBe(false);
    const keys = Object.keys(isFsrsEligibleAttempt({ context: 'cold_practice' }));
    expect(keys.join(',')).not.toMatch(/isReplay/i);
  });
});

describe('planFsrsRating política binária', () => {
  it('incorreta elegível → Again', () => {
    expect(
      planFsrsRating({ context: 'cold_practice', isCorrect: false }),
    ).toEqual({
      eligible: true,
      context: 'cold_practice',
      rating: 'again',
    });
  });

  it('correta elegível → Good', () => {
    expect(
      planFsrsRating({ context: 'scheduled_review', isCorrect: true }),
    ).toEqual({
      eligible: true,
      context: 'scheduled_review',
      rating: 'good',
    });
  });

  it('inelegível → sem rating', () => {
    const result = planFsrsRating({
      context: 'post_explanation',
      isCorrect: true,
    });
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.rating).toBeNull();
    }
  });

  it('nenhuma saída Hard/Easy', () => {
    for (const ctx of ['cold_practice', 'scheduled_review'] as const) {
      for (const correct of [true, false]) {
        const plan = planFsrsRating({ context: ctx, isCorrect: correct });
        expect(plan.eligible).toBe(true);
        if (plan.eligible) {
          expect(isFsrsMvpRating(plan.rating)).toBe(true);
          expect(plan.rating === 'again' || plan.rating === 'good').toBe(true);
          expect(['hard', 'easy']).not.toContain(plan.rating);
        }
      }
    }
  });
});

describe('createFsrsScheduler adapter', () => {
  it('config: retention 0.90, fuzz false, pin auditável', () => {
    const scheduler = createFsrsScheduler();
    expect(scheduler.config.requestRetention).toBe(
      FSRS_MVP_DEFAULT_REQUEST_RETENTION,
    );
    expect(scheduler.config.requestRetention).toBe(0.9);
    expect(FSRS_MVP_ENABLE_FUZZ).toBe(false);
    expect(scheduler.config.packageVersion).toBe(FSRS_MVP_PACKAGE_VERSION);
    expect(scheduler.config.algorithmVersion).toBe(
      FSRS_MVP_ALGORITHM_VERSION_LABEL,
    );
  });

  it('createInitialCard exige Date e não usa relógio oculto', () => {
    const scheduler = createFsrsScheduler();
    expect(() =>
      // @ts-expect-error — now obrigatório
      scheduler.createInitialCard(),
    ).toThrow();
    const card = scheduler.createInitialCard(T0);
    expect(card.due).toBe('2026-07-01T15:00:00.000Z');
    expect(card.state).toBe('New');
    expect(card.reps).toBe(0);
  });

  it('mesmo input + mesma data → mesmo resultado', () => {
    const scheduler = createFsrsScheduler();
    const card = scheduler.createInitialCard(T0);
    const a = scheduler.review({ card, rating: 'again', reviewedAt: T1 });
    const b = scheduler.review({ card, rating: 'again', reviewedAt: T1 });
    expect(a.card).toEqual(b.card);
    expect(a.due.toISOString()).toBe(b.due.toISOString());
  });

  it('input imutável (card + Date congelados)', () => {
    const scheduler = createFsrsScheduler();
    const card = deepFreeze(scheduler.createInitialCard(T0));
    const snapshot = JSON.parse(JSON.stringify(card)) as FsrsMvpCardState;
    const reviewedAt = deepFreeze(new Date(T1.getTime()));
    const reviewedAtMs = reviewedAt.getTime();

    scheduler.review({ card, rating: 'good', reviewedAt });

    expect(card).toEqual(snapshot);
    expect(reviewedAt.getTime()).toBe(reviewedAtMs);
  });

  it('Again e Good produzem transições coerentes', () => {
    const scheduler = createFsrsScheduler();
    const initial = scheduler.createInitialCard(T0);
    const afterAgain = scheduler.review({
      card: initial,
      rating: 'again',
      reviewedAt: T1,
    });
    expect(afterAgain.rating).toBe('again');
    expect(afterAgain.card.reps).toBeGreaterThan(initial.reps);
    expect(afterAgain.card.state).not.toBe('New');

    const afterGood = scheduler.review({
      card: afterAgain.card,
      rating: 'good',
      reviewedAt: T2,
    });
    expect(afterGood.rating).toBe('good');
    expect(afterGood.card.reps).toBeGreaterThan(afterAgain.card.reps);
    expect(afterGood.serialized.schemaVersion).toBe(
      FSRS_MVP_CARD_SCHEMA_VERSION,
    );
  });

  it('review() é API de baixo nível (não decide elegibilidade)', () => {
    // Mesmo com contexto inelegível no plano, o adapter ainda aplica rating se chamado.
    // Produção deve usar planFsrsRating antes — garantia = R3.
    const plan = planFsrsRating({
      context: 'post_explanation',
      isCorrect: true,
    });
    expect(plan.eligible).toBe(false);
    const scheduler = createFsrsScheduler();
    const out = scheduler.review({
      card: scheduler.createInitialCard(T0),
      rating: 'good',
      reviewedAt: T1,
    });
    expect(out.rating).toBe('good');
    expect(out.card.reps).toBeGreaterThan(0);
  });
});

describe('serialização versionada', () => {
  it('round-trip integral preserva elapsedDays / due / lastReview', () => {
    const scheduler = createFsrsScheduler();
    const after = scheduler.review({
      card: scheduler.createInitialCard(T0),
      rating: 'again',
      reviewedAt: T1,
    });
    const after2 = scheduler.review({
      card: after.card,
      rating: 'good',
      reviewedAt: T2,
    });
    expect(after2.card.elapsedDays).toBe(1);

    const payload = serializeFsrsMvpCard(after2.card);
    expect(payload.schemaVersion).toBe(1);
    expect(payload.algorithm).toBe(FSRS_MVP_ALGORITHM);
    expect(payload.algorithmVersion).toBe('5.4.1');
    expect(payload.elapsedDays).toBe(1);

    const restored = deserializeFsrsMvpCard(payload);
    expect(restored).toEqual(after2.card);
    expect(restored.due).toBe(after2.card.due);
    expect(restored.lastReview).toBe(after2.card.lastReview);
  });

  it('schemaVersion / algorithmVersion incorretos rejeitados', () => {
    const base = serializeFsrsMvpCard(createFsrsScheduler().createInitialCard(T0));
    expect(() =>
      deserializeFsrsMvpCard({ ...base, schemaVersion: 99 }),
    ).toThrow(/schemaVersion/);
    expect(() =>
      deserializeFsrsMvpCard({ ...base, algorithmVersion: '9.9.9' }),
    ).toThrow(/algorithmVersion/);
    expect(() =>
      deserializeFsrsMvpCard({ ...base, algorithm: 'sm2' }),
    ).toThrow(/algorithm/);
  });

  it('NaN / Infinity rejeitados', () => {
    const base = serializeFsrsMvpCard(createFsrsScheduler().createInitialCard(T0));
    expect(() =>
      deserializeFsrsMvpCard({ ...base, stability: Number.NaN }),
    ).toThrow(/finito/);
    expect(() =>
      deserializeFsrsMvpCard({ ...base, difficulty: Number.POSITIVE_INFINITY }),
    ).toThrow(/finito/);
    expect(() =>
      deserializeFsrsMvpCard({ ...base, reps: -1 }),
    ).toThrow(/>= 0/);
  });

  it('contadores devem ser inteiros não negativos', () => {
    const base = serializeFsrsMvpCard(createFsrsScheduler().createInitialCard(T0));
    expect(() =>
      deserializeFsrsMvpCard({ ...base, reps: 1.5 }),
    ).toThrow(/inteiro/);
    expect(() =>
      deserializeFsrsMvpCard({ ...base, lapses: 0.1 }),
    ).toThrow(/inteiro/);
    expect(() =>
      deserializeFsrsMvpCard({ ...base, elapsedDays: 2.2 }),
    ).toThrow(/inteiro/);
    expect(() =>
      deserializeFsrsMvpCard({ ...base, scheduledDays: -1 }),
    ).toThrow(/>= 0/);
    expect(() =>
      deserializeFsrsMvpCard({ ...base, learningSteps: Number.NaN }),
    ).toThrow(/finito/);
    expect(() =>
      deserializeFsrsMvpCard({ ...base, learningSteps: Number.POSITIVE_INFINITY }),
    ).toThrow(/finito/);
  });

  it('propriedades extras desconhecidas são rejeitadas (schema v1)', () => {
    const base = serializeFsrsMvpCard(createFsrsScheduler().createInitialCard(T0));
    expect(() =>
      deserializeFsrsMvpCard({ ...base, unexpectedField: true }),
    ).toThrow(/desconhecida/);
  });

  it('datas inválidas / state inválido / payload parcial rejeitados', () => {
    const base = serializeFsrsMvpCard(createFsrsScheduler().createInitialCard(T0));
    expect(() =>
      deserializeFsrsMvpCard({ ...base, due: 'not-a-date' }),
    ).toThrow();
    expect(() =>
      deserializeFsrsMvpCard({ ...base, due: '2026-07-01' }),
    ).toThrow(/timezone/);
    expect(() =>
      deserializeFsrsMvpCard({ ...base, state: 'Done' }),
    ).toThrow(/state/);
    expect(() => deserializeFsrsMvpCard(null)).toThrow(/ausente/);
    const { stability: _s, ...partial } = base;
    expect(() => deserializeFsrsMvpCard(partial)).toThrow(/parcial/);
  });

  it('resultado independente da timezone da máquina (instantes ISO)', () => {
    const scheduler = createFsrsScheduler();
    const card = scheduler.createInitialCard(T0);
    const payload = serializeFsrsMvpCard(card);
    const restored = deserializeFsrsMvpCard(payload);
    expect(restored.due).toBe('2026-07-01T15:00:00.000Z');
    expect(new Date(restored.due).getTime()).toBe(T0.getTime());
    // Re-serializar não depende de offset local.
    expect(serializeFsrsMvpCard(restored).due).toBe(payload.due);
  });
});

describe('golden determinístico ts-fsrs@5.4.1', () => {
  it('Again → Good em datas fixas (campos essenciais)', () => {
    const scheduler = createFsrsScheduler();
    const initial = scheduler.createInitialCard(T0);
    expect(initial).toMatchObject({
      due: '2026-07-01T15:00:00.000Z',
      stability: 0,
      difficulty: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      state: 'New',
      lastReview: null,
    });

    const afterAgain = scheduler.review({
      card: initial,
      rating: 'again',
      reviewedAt: T1,
    });
    expect(afterAgain.card).toMatchObject({
      due: '2026-07-02T15:01:00.000Z',
      stability: 0.212,
      difficulty: 6.4133,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 1,
      lapses: 0,
      state: 'Learning',
      lastReview: '2026-07-02T15:00:00.000Z',
    });

    const afterGood = scheduler.review({
      card: afterAgain.card,
      rating: 'good',
      reviewedAt: T2,
    });
    expect(afterGood.card).toMatchObject({
      due: '2026-07-03T15:10:00.000Z',
      stability: 1.88678762,
      difficulty: 6.40211507,
      elapsedDays: 1,
      scheduledDays: 0,
      reps: 2,
      lapses: 0,
      state: 'Learning',
      lastReview: '2026-07-03T15:00:00.000Z',
    });
    expect(afterGood.serialized).toMatchObject({
      schemaVersion: 1,
      algorithm: 'ts-fsrs',
      algorithmVersion: '5.4.1',
      due: '2026-07-03T15:10:00.000Z',
      elapsedDays: 1,
    } satisfies Partial<FsrsMvpSerializedCard>);
  });
});

describe('sem contratos concorrentes legados', () => {
  it('tipos de elegibilidade não expõem booleans isReplay/serverComputedCorrect', () => {
    const sample: FsrsMvpCardState = createFsrsScheduler().createInitialCard(T0);
    expect('isReplay' in sample).toBe(false);
    expect(typeof planFsrsRating).toBe('function');
    // Assinatura: só context + isCorrect
    const plan = planFsrsRating({
      context: 'cold_practice',
      isCorrect: true,
    });
    expect(plan).not.toHaveProperty('isReplay');
    expect(plan).not.toHaveProperty('serverComputedCorrect');
  });
});
