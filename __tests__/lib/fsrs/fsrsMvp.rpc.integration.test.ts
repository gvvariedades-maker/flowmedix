/**
 * Testes RPC / concorrência FSRS R2 contra banco local (Supabase CLI).
 *
 * Spec §12.B / §12.C / §12.D — docs/R2_PERSISTENCIA_FSRS_MVP_CONVERSA.md
 *
 * Pré-requisitos:
 *   npx supabase start && npx supabase db reset --local
 *   FSRS_RPC_INTEGRATION=1
 *   NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (+ ANON para §12.D)
 *
 * @jest-environment node
 */

import { createHash, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import {
  computeSemanticFingerprint,
  createFsrsScheduler,
  serializeFsrsMvpCard,
  type FsrsMvpSerializedCard,
} from '@/lib/fsrs';

const hasLocal =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) &&
  process.env.FSRS_RPC_INTEGRATION === '1';

const describeRpc = hasLocal ? describe : describe.skip;

const MIGRATION = join(
  process.cwd(),
  'supabase/migrations/20260728040000_spaced_review_fsrs_mvp.sql',
);
const RLS_SQL = join(process.cwd(), 'scripts/fsrs-mvp-rls-matrix.sql');

type RpcOutcome = {
  outcome: string;
  resulting_revision?: number;
  current_revision?: number | null;
  attempt_id?: string;
};

type PersistArgs = {
  userId: string;
  attemptId: string;
  reviewUnitId: string;
  reviewUnitKind: 'cluster' | 'subtopico';
  questionId: string;
  attemptContext: 'cold_practice' | 'scheduled_review';
  isCorrect: boolean;
  rating: 'again' | 'good';
  reviewedAt: Date;
  expectedRevision: number | null;
  fsrsStateBefore: FsrsMvpSerializedCard | null;
  fsrsStateAfter: FsrsMvpSerializedCard;
  sameStemFallback?: boolean;
  semanticFingerprint?: string;
};

function adminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

function anonClient(): SupabaseClient {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!anon) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY obrigatória para §12.D');
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(), anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function unitId(suffix: string): string {
  return `fsrs:v1:discipline=enfermagem:subtopico=rpc-it-${suffix}`;
}

function fingerprintFor(args: PersistArgs): string {
  return computeSemanticFingerprint({
    userId: args.userId,
    reviewUnitId: args.reviewUnitId,
    questionId: args.questionId,
    attemptContext: args.attemptContext,
    isCorrect: args.isCorrect,
    rating: args.rating,
    reviewedAt: args.reviewedAt,
    expectedRevision: args.expectedRevision,
    serializedBefore: args.fsrsStateBefore,
    serializedAfter: args.fsrsStateAfter,
  });
}

async function persistReview(
  client: SupabaseClient,
  args: PersistArgs,
): Promise<RpcOutcome> {
  const fp = args.semanticFingerprint ?? fingerprintFor(args);
  const { data, error } = await client.rpc('fsrs_persist_review', {
    p_user_id: args.userId,
    p_attempt_id: args.attemptId,
    p_review_unit_id: args.reviewUnitId,
    p_review_unit_kind: args.reviewUnitKind,
    p_question_id: args.questionId,
    p_attempt_context: args.attemptContext,
    p_is_correct: args.isCorrect,
    p_rating: args.rating,
    p_reviewed_at: args.reviewedAt.toISOString(),
    p_expected_revision: args.expectedRevision,
    p_fsrs_state_before: args.fsrsStateBefore,
    p_fsrs_state_after: args.fsrsStateAfter,
    p_same_stem_fallback: args.sameStemFallback ?? false,
    p_semantic_fingerprint: fp,
  });
  if (error) {
    throw new Error(`fsrs_persist_review failed: ${error.code} ${error.message}`);
  }
  return data as RpcOutcome;
}

function sampleAfter(at: Date = new Date('2026-07-01T15:00:00.000Z')): {
  card: ReturnType<ReturnType<typeof createFsrsScheduler>['createInitialCard']>;
  serialized: FsrsMvpSerializedCard;
} {
  const scheduler = createFsrsScheduler();
  const initial = scheduler.createInitialCard(at);
  const out = scheduler.review({
    card: initial,
    rating: 'good',
    reviewedAt: at,
  });
  return { card: out.card, serialized: serializeFsrsMvpCard(out.card) };
}

function nextAfter(
  card: ReturnType<ReturnType<typeof createFsrsScheduler>['createInitialCard']>,
  at: Date,
): FsrsMvpSerializedCard {
  const scheduler = createFsrsScheduler();
  const out = scheduler.review({ card, rating: 'good', reviewedAt: at });
  return serializeFsrsMvpCard(out.card);
}

async function createTestUser(
  admin: SupabaseClient,
  label: string,
): Promise<{ id: string; email: string; password: string }> {
  const email = `fsrs-rpc-${label}-${randomUUID()}@example.com`;
  const password = `Test-${randomUUID()}!aA1`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user?.id) {
    throw new Error(`createUser failed: ${error?.message ?? 'no user'}`);
  }
  return { id: data.user.id, email, password };
}

async function countLogs(
  admin: SupabaseClient,
  attemptId: string,
): Promise<number> {
  const { count, error } = await admin
    .from('spaced_review_logs')
    .select('id', { count: 'exact', head: true })
    .eq('attempt_id', attemptId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function loadCard(
  admin: SupabaseClient,
  userId: string,
  reviewUnitId: string,
) {
  const { data, error } = await admin
    .from('spaced_review_cards')
    .select('*')
    .eq('user_id', userId)
    .eq('review_unit_id', reviewUnitId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function loadLog(admin: SupabaseClient, attemptId: string) {
  const { data, error } = await admin
    .from('spaced_review_logs')
    .select('*')
    .eq('attempt_id', attemptId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

describe('FSRS RPC harness presence', () => {
  it('migration R2 existe no repo', () => {
    expect(existsSync(MIGRATION)).toBe(true);
  });

  it('script RLS §12.D existe no repo', () => {
    expect(existsSync(RLS_SQL)).toBe(true);
  });
});

describeRpc('FSRS RPC §12.B (local)', () => {
  let admin: SupabaseClient;
  let userId: string;

  beforeAll(async () => {
    admin = adminClient();
    const user = await createTestUser(admin, 'b');
    userId = user.id;
  }, 60_000);

  it('created grava card + log; denormalizados derivados de state_after', async () => {
    const at = new Date('2026-07-02T10:00:00.000Z');
    const { serialized } = sampleAfter(at);
    const attemptId = randomUUID();
    const reviewUnitId = unitId(`created-${attemptId.slice(0, 8)}`);

    const res = await persistReview(admin, {
      userId,
      attemptId,
      reviewUnitId,
      reviewUnitKind: 'subtopico',
      questionId: 'slug-created',
      attemptContext: 'cold_practice',
      isCorrect: true,
      rating: 'good',
      reviewedAt: at,
      expectedRevision: null,
      fsrsStateBefore: null,
      fsrsStateAfter: serialized,
    });

    expect(res.outcome).toBe('created');
    expect(res.resulting_revision).toBe(1);

    const card = await loadCard(admin, userId, reviewUnitId);
    const log = await loadLog(admin, attemptId);
    expect(card).toBeTruthy();
    expect(log).toBeTruthy();
    expect(card!.revision).toBe(1);
    expect(Number(card!.stability)).toBe(serialized.stability);
    expect(card!.reps).toBe(serialized.reps);
    expect(card!.lapses).toBe(serialized.lapses);
    expect(new Date(card!.due_at).toISOString()).toBe(serialized.due);
    expect(new Date(log!.due_at_after).toISOString()).toBe(serialized.due);
    expect(log!.scheduled_days).toBe(serialized.scheduledDays);
    expect(log!.due_at_before).toBeNull();
    expect(log!.resulting_revision).toBe(1);
    expect(await countLogs(admin, attemptId)).toBe(1);
  });

  it('applied incrementa revision; CAS com expected_revision velho → revision_conflict', async () => {
    const t1 = new Date('2026-07-03T10:00:00.000Z');
    const t2 = new Date('2026-07-04T10:00:00.000Z');
    const first = sampleAfter(t1);
    const reviewUnitId = unitId(`applied-${randomUUID().slice(0, 8)}`);
    const attempt1 = randomUUID();

    const created = await persistReview(admin, {
      userId,
      attemptId: attempt1,
      reviewUnitId,
      reviewUnitKind: 'subtopico',
      questionId: 'slug-applied-1',
      attemptContext: 'cold_practice',
      isCorrect: true,
      rating: 'good',
      reviewedAt: t1,
      expectedRevision: null,
      fsrsStateBefore: null,
      fsrsStateAfter: first.serialized,
    });
    expect(created.outcome).toBe('created');
    expect(created.resulting_revision).toBe(1);

    const secondSerialized = nextAfter(first.card, t2);
    const attempt2 = randomUUID();
    const applied = await persistReview(admin, {
      userId,
      attemptId: attempt2,
      reviewUnitId,
      reviewUnitKind: 'subtopico',
      questionId: 'slug-applied-2',
      attemptContext: 'scheduled_review',
      isCorrect: true,
      rating: 'good',
      reviewedAt: t2,
      expectedRevision: 1,
      fsrsStateBefore: first.serialized,
      fsrsStateAfter: secondSerialized,
    });
    expect(applied.outcome).toBe('created');
    expect(applied.resulting_revision).toBe(2);

    const card = await loadCard(admin, userId, reviewUnitId);
    expect(card!.revision).toBe(2);
    expect(new Date(card!.due_at).toISOString()).toBe(secondSerialized.due);

    const staleAttempt = randomUUID();
    const conflict = await persistReview(admin, {
      userId,
      attemptId: staleAttempt,
      reviewUnitId,
      reviewUnitKind: 'subtopico',
      questionId: 'slug-stale',
      attemptContext: 'scheduled_review',
      isCorrect: true,
      rating: 'good',
      reviewedAt: new Date('2026-07-05T10:00:00.000Z'),
      expectedRevision: 1,
      fsrsStateBefore: first.serialized,
      fsrsStateAfter: secondSerialized,
    });
    expect(conflict.outcome).toBe('revision_conflict');
    expect(conflict.current_revision).toBe(2);
    expect(await countLogs(admin, staleAttempt)).toBe(0);
    expect((await loadCard(admin, userId, reviewUnitId))!.revision).toBe(2);
  });

  it('mesmo attempt_id + payload idêntico → duplicate_equivalent (um log)', async () => {
    const at = new Date('2026-07-06T10:00:00.000Z');
    const { serialized } = sampleAfter(at);
    const attemptId = randomUUID();
    const reviewUnitId = unitId(`dup-${attemptId.slice(0, 8)}`);
    const args: PersistArgs = {
      userId,
      attemptId,
      reviewUnitId,
      reviewUnitKind: 'subtopico',
      questionId: 'slug-dup',
      attemptContext: 'cold_practice',
      isCorrect: true,
      rating: 'good',
      reviewedAt: at,
      expectedRevision: null,
      fsrsStateBefore: null,
      fsrsStateAfter: serialized,
    };

    const first = await persistReview(admin, args);
    expect(first.outcome).toBe('created');

    const replay = await persistReview(admin, args);
    expect(replay.outcome).toBe('duplicate_equivalent');
    expect(replay.resulting_revision).toBe(1);
    expect(await countLogs(admin, attemptId)).toBe(1);
  });

  it('mesmo attempt_id + semantic_fingerprint diferente → conflict sem segundo log', async () => {
    const at = new Date('2026-07-07T10:00:00.000Z');
    const { serialized } = sampleAfter(at);
    const attemptId = randomUUID();
    const reviewUnitId = unitId(`conflict-${attemptId.slice(0, 8)}`);

    await persistReview(admin, {
      userId,
      attemptId,
      reviewUnitId,
      reviewUnitKind: 'subtopico',
      questionId: 'slug-conflict-a',
      attemptContext: 'cold_practice',
      isCorrect: true,
      rating: 'good',
      reviewedAt: at,
      expectedRevision: null,
      fsrsStateBefore: null,
      fsrsStateAfter: serialized,
    });

    const diverged = await persistReview(admin, {
      userId,
      attemptId,
      reviewUnitId,
      reviewUnitKind: 'subtopico',
      questionId: 'slug-conflict-b',
      attemptContext: 'cold_practice',
      isCorrect: true,
      rating: 'good',
      reviewedAt: at,
      expectedRevision: null,
      fsrsStateBefore: null,
      fsrsStateAfter: serialized,
      semanticFingerprint: createHash('sha256')
        .update('divergente-payload')
        .digest('hex'),
    });

    expect(diverged.outcome).toBe('conflict');
    expect(await countLogs(admin, attemptId)).toBe(1);
    const log = await loadLog(admin, attemptId);
    expect(log!.question_id).toBe('slug-conflict-a');
  });

  it('state_after inválido → invalid_state, nada gravado', async () => {
    const attemptId = randomUUID();
    const reviewUnitId = unitId(`invalid-${attemptId.slice(0, 8)}`);
    const badState = {
      schemaVersion: 1,
      algorithm: 'ts-fsrs',
      algorithmVersion: '5.4.1',
      due: 'not-a-date',
      stability: 1,
      difficulty: 5,
      elapsedDays: 0,
      scheduledDays: 1,
      learningSteps: 0,
      reps: 1,
      lapses: 0,
      state: 'Review',
      lastReview: null,
    };

    const res = await persistReview(admin, {
      userId,
      attemptId,
      reviewUnitId,
      reviewUnitKind: 'subtopico',
      questionId: 'slug-invalid',
      attemptContext: 'cold_practice',
      isCorrect: true,
      rating: 'good',
      reviewedAt: new Date('2026-07-08T10:00:00.000Z'),
      expectedRevision: null,
      fsrsStateBefore: null,
      fsrsStateAfter: badState as unknown as FsrsMvpSerializedCard,
      semanticFingerprint: createHash('sha256')
        .update('invalid-state-fp')
        .digest('hex'),
    });

    expect(res.outcome).toBe('invalid_state');
    expect(await countLogs(admin, attemptId)).toBe(0);
    expect(await loadCard(admin, userId, reviewUnitId)).toBeNull();
  });

  it('state_before divergente com revision correta → revision_conflict', async () => {
    const t1 = new Date('2026-07-09T10:00:00.000Z');
    const t2 = new Date('2026-07-10T10:00:00.000Z');
    const first = sampleAfter(t1);
    const reviewUnitId = unitId(`before-div-${randomUUID().slice(0, 8)}`);
    const attempt1 = randomUUID();

    await persistReview(admin, {
      userId,
      attemptId: attempt1,
      reviewUnitId,
      reviewUnitKind: 'subtopico',
      questionId: 'slug-before-1',
      attemptContext: 'cold_practice',
      isCorrect: true,
      rating: 'good',
      reviewedAt: t1,
      expectedRevision: null,
      fsrsStateBefore: null,
      fsrsStateAfter: first.serialized,
    });

    const forgedBefore = {
      ...first.serialized,
      stability: first.serialized.stability + 0.001,
    };
    const attempt2 = randomUUID();
    const secondSerialized = nextAfter(first.card, t2);
    const res = await persistReview(admin, {
      userId,
      attemptId: attempt2,
      reviewUnitId,
      reviewUnitKind: 'subtopico',
      questionId: 'slug-before-2',
      attemptContext: 'scheduled_review',
      isCorrect: true,
      rating: 'good',
      reviewedAt: t2,
      expectedRevision: 1,
      fsrsStateBefore: forgedBefore,
      fsrsStateAfter: secondSerialized,
    });

    expect(res.outcome).toBe('revision_conflict');
    expect(await countLogs(admin, attempt2)).toBe(0);
    expect((await loadCard(admin, userId, reviewUnitId))!.revision).toBe(1);
  });

  it('duplicate_equivalent devolve resulting_revision do log original após card avançar', async () => {
    const t1 = new Date('2026-07-11T10:00:00.000Z');
    const t2 = new Date('2026-07-12T10:00:00.000Z');
    const first = sampleAfter(t1);
    const reviewUnitId = unitId(`orig-rev-${randomUUID().slice(0, 8)}`);
    const attempt1 = randomUUID();
    const args1: PersistArgs = {
      userId,
      attemptId: attempt1,
      reviewUnitId,
      reviewUnitKind: 'subtopico',
      questionId: 'slug-orig-1',
      attemptContext: 'cold_practice',
      isCorrect: true,
      rating: 'good',
      reviewedAt: t1,
      expectedRevision: null,
      fsrsStateBefore: null,
      fsrsStateAfter: first.serialized,
    };
    await persistReview(admin, args1);

    const secondSerialized = nextAfter(first.card, t2);
    await persistReview(admin, {
      userId,
      attemptId: randomUUID(),
      reviewUnitId,
      reviewUnitKind: 'subtopico',
      questionId: 'slug-orig-2',
      attemptContext: 'scheduled_review',
      isCorrect: true,
      rating: 'good',
      reviewedAt: t2,
      expectedRevision: 1,
      fsrsStateBefore: first.serialized,
      fsrsStateAfter: secondSerialized,
    });

    const replay = await persistReview(admin, args1);
    expect(replay.outcome).toBe('duplicate_equivalent');
    expect(replay.resulting_revision).toBe(1);
    expect((await loadCard(admin, userId, reviewUnitId))!.revision).toBe(2);
  });
});

describeRpc('FSRS RPC §12.C concorrência (local)', () => {
  let admin: SupabaseClient;
  let userId: string;

  beforeAll(async () => {
    admin = adminClient();
    const user = await createTestUser(admin, 'c');
    userId = user.id;
  }, 60_000);

  it('Promise.all mesmo attempt_id → uma created e outra duplicate_equivalent; um log', async () => {
    const at = new Date('2026-07-13T10:00:00.000Z');
    const { serialized } = sampleAfter(at);
    const attemptId = randomUUID();
    const reviewUnitId = unitId(`race-dup-${attemptId.slice(0, 8)}`);
    const args: PersistArgs = {
      userId,
      attemptId,
      reviewUnitId,
      reviewUnitKind: 'subtopico',
      questionId: 'slug-race-dup',
      attemptContext: 'cold_practice',
      isCorrect: true,
      rating: 'good',
      reviewedAt: at,
      expectedRevision: null,
      fsrsStateBefore: null,
      fsrsStateAfter: serialized,
    };

    const [a, b] = await Promise.all([
      persistReview(admin, args),
      persistReview(admin, args),
    ]);
    const outcomes = [a.outcome, b.outcome].sort();
    expect(outcomes).toEqual(['created', 'duplicate_equivalent']);
    expect(await countLogs(admin, attemptId)).toBe(1);
    expect((await loadCard(admin, userId, reviewUnitId))!.revision).toBe(1);
  });

  it('duas tentativas distintas com mesma expected_revision → uma created, outra revision_conflict', async () => {
    const t1 = new Date('2026-07-14T10:00:00.000Z');
    const t2 = new Date('2026-07-15T10:00:00.000Z');
    const first = sampleAfter(t1);
    const reviewUnitId = unitId(`race-cas-${randomUUID().slice(0, 8)}`);

    await persistReview(admin, {
      userId,
      attemptId: randomUUID(),
      reviewUnitId,
      reviewUnitKind: 'subtopico',
      questionId: 'slug-race-cas-0',
      attemptContext: 'cold_practice',
      isCorrect: true,
      rating: 'good',
      reviewedAt: t1,
      expectedRevision: null,
      fsrsStateBefore: null,
      fsrsStateAfter: first.serialized,
    });

    const afterA = nextAfter(first.card, t2);
    const afterB = nextAfter(first.card, new Date(t2.getTime() + 1000));
    const attemptA = randomUUID();
    const attemptB = randomUUID();

    const [r1, r2] = await Promise.all([
      persistReview(admin, {
        userId,
        attemptId: attemptA,
        reviewUnitId,
        reviewUnitKind: 'subtopico',
        questionId: 'slug-race-cas-a',
        attemptContext: 'scheduled_review',
        isCorrect: true,
        rating: 'good',
        reviewedAt: t2,
        expectedRevision: 1,
        fsrsStateBefore: first.serialized,
        fsrsStateAfter: afterA,
      }),
      persistReview(admin, {
        userId,
        attemptId: attemptB,
        reviewUnitId,
        reviewUnitKind: 'subtopico',
        questionId: 'slug-race-cas-b',
        attemptContext: 'scheduled_review',
        isCorrect: true,
        rating: 'good',
        reviewedAt: new Date(t2.getTime() + 1000),
        expectedRevision: 1,
        fsrsStateBefore: first.serialized,
        fsrsStateAfter: afterB,
      }),
    ]);

    const outcomes = [r1.outcome, r2.outcome].sort();
    expect(outcomes).toEqual(['created', 'revision_conflict']);
    expect((await loadCard(admin, userId, reviewUnitId))!.revision).toBe(2);
    const logs =
      (await countLogs(admin, attemptA)) + (await countLogs(admin, attemptB));
    expect(logs).toBe(1);
  });

  it('corrida de criação do primeiro card → exatamente um card revision=1', async () => {
    const at = new Date('2026-07-16T10:00:00.000Z');
    const { serialized: s1 } = sampleAfter(at);
    const { serialized: s2 } = sampleAfter(new Date(at.getTime() + 2000));
    const reviewUnitId = unitId(`race-create-${randomUUID().slice(0, 8)}`);
    const attemptA = randomUUID();
    const attemptB = randomUUID();

    const [r1, r2] = await Promise.all([
      persistReview(admin, {
        userId,
        attemptId: attemptA,
        reviewUnitId,
        reviewUnitKind: 'subtopico',
        questionId: 'slug-race-create-a',
        attemptContext: 'cold_practice',
        isCorrect: true,
        rating: 'good',
        reviewedAt: at,
        expectedRevision: null,
        fsrsStateBefore: null,
        fsrsStateAfter: s1,
      }),
      persistReview(admin, {
        userId,
        attemptId: attemptB,
        reviewUnitId,
        reviewUnitKind: 'subtopico',
        questionId: 'slug-race-create-b',
        attemptContext: 'cold_practice',
        isCorrect: true,
        rating: 'good',
        reviewedAt: new Date(at.getTime() + 2000),
        expectedRevision: null,
        fsrsStateBefore: null,
        fsrsStateAfter: s2,
      }),
    ]);

    const outcomes = [r1.outcome, r2.outcome].sort();
    expect(outcomes).toEqual(['created', 'revision_conflict']);
    const card = await loadCard(admin, userId, reviewUnitId);
    expect(card!.revision).toBe(1);
    const { count, error } = await admin
      .from('spaced_review_cards')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('review_unit_id', reviewUnitId);
    if (error) throw new Error(error.message);
    expect(count).toBe(1);
  });

  it('Promise.all conflitante (mesmo attempt_id, fingerprints diferentes) → created + conflict', async () => {
    const at = new Date('2026-07-17T10:00:00.000Z');
    const { serialized } = sampleAfter(at);
    const attemptId = randomUUID();
    const reviewUnitId = unitId(`race-fp-${attemptId.slice(0, 8)}`);
    const base: PersistArgs = {
      userId,
      attemptId,
      reviewUnitId,
      reviewUnitKind: 'subtopico',
      questionId: 'slug-race-fp',
      attemptContext: 'cold_practice',
      isCorrect: true,
      rating: 'good',
      reviewedAt: at,
      expectedRevision: null,
      fsrsStateBefore: null,
      fsrsStateAfter: serialized,
    };
    const fpGood = fingerprintFor(base);
    const fpBad = createHash('sha256').update('other').digest('hex');

    // Serializa a corrida: uma chamada com fp correto e outra com fp divergente
    // no mesmo attempt_id — a ordem de chegada decide created vs conflict.
    const [a, b] = await Promise.all([
      persistReview(admin, { ...base, semanticFingerprint: fpGood }),
      persistReview(admin, {
        ...base,
        questionId: 'slug-race-fp-alt',
        semanticFingerprint: fpBad,
      }),
    ]);

    expect([a.outcome, b.outcome].sort()).toEqual(['conflict', 'created']);
    expect(await countLogs(admin, attemptId)).toBe(1);
  });
});

describeRpc('FSRS RLS §12.D (local)', () => {
  let admin: SupabaseClient;
  let owner: { id: string; email: string; password: string };
  let other: { id: string; email: string; password: string };

  beforeAll(async () => {
    admin = adminClient();
    owner = await createTestUser(admin, 'rls-owner');
    other = await createTestUser(admin, 'rls-other');
  }, 60_000);

  it('anon não executa RPC; authenticated não executa RPC; SELECT cruzado = 0', async () => {
    const at = new Date('2026-07-18T10:00:00.000Z');
    const { serialized } = sampleAfter(at);
    const attemptId = randomUUID();
    const reviewUnitId = unitId(`rls-${attemptId.slice(0, 8)}`);

    await persistReview(admin, {
      userId: owner.id,
      attemptId,
      reviewUnitId,
      reviewUnitKind: 'subtopico',
      questionId: 'slug-rls-owner',
      attemptContext: 'cold_practice',
      isCorrect: true,
      rating: 'good',
      reviewedAt: at,
      expectedRevision: null,
      fsrsStateBefore: null,
      fsrsStateAfter: serialized,
    });

    const anon = anonClient();
    const anonRpc = await anon.rpc('fsrs_persist_review', {
      p_user_id: owner.id,
      p_attempt_id: randomUUID(),
      p_review_unit_id: reviewUnitId,
      p_review_unit_kind: 'subtopico',
      p_question_id: 'slug-anon',
      p_attempt_context: 'cold_practice',
      p_is_correct: true,
      p_rating: 'good',
      p_reviewed_at: at.toISOString(),
      p_expected_revision: null,
      p_fsrs_state_before: null,
      p_fsrs_state_after: serialized,
      p_same_stem_fallback: false,
      p_semantic_fingerprint: createHash('sha256').update('anon').digest('hex'),
    });
    expect(anonRpc.error).toBeTruthy();

    const { data: anonRows, error: anonSelErr } = await anon
      .from('spaced_review_cards')
      .select('id');
    expect(anonSelErr || (anonRows ?? []).length === 0).toBeTruthy();

    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error: signErr } = await userClient.auth.signInWithPassword({
      email: other.email,
      password: other.password,
    });
    expect(signErr).toBeNull();

    const otherRpc = await userClient.rpc('fsrs_persist_review', {
      p_user_id: owner.id,
      p_attempt_id: randomUUID(),
      p_review_unit_id: reviewUnitId,
      p_review_unit_kind: 'subtopico',
      p_question_id: 'slug-auth',
      p_attempt_context: 'cold_practice',
      p_is_correct: true,
      p_rating: 'good',
      p_reviewed_at: at.toISOString(),
      p_expected_revision: null,
      p_fsrs_state_before: null,
      p_fsrs_state_after: serialized,
      p_same_stem_fallback: false,
      p_semantic_fingerprint: createHash('sha256').update('auth').digest('hex'),
    });
    expect(otherRpc.error).toBeTruthy();

    const { data: crossRows, error: crossErr } = await userClient
      .from('spaced_review_cards')
      .select('id')
      .eq('user_id', owner.id);
    expect(crossErr).toBeNull();
    expect(crossRows ?? []).toEqual([]);
  });
});
