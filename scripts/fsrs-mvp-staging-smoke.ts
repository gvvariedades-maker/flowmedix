#!/usr/bin/env tsx
/**
 * FSRS MVP — seed + smoke staging (operacional).
 *
 * Cria card due via RPC `fsrs_persist_review` (nunca INSERT direto),
 * opcionalmente aplica 2ª revisão (journey API-side), valida card/log/revision/due_at.
 *
 * Uso:
 *   npm run fsrs:staging-smoke -- --dry-run
 *   npm run fsrs:staging-smoke -- --seed-only
 *   npm run fsrs:staging-smoke -- --email=fsrs-mvp-smoke@avant.test
 *
 * Requer: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * Marcador sintético: review attempt / artifact com `synthetic: true`.
 * Não liga default-on nem altera Production.
 */

import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnvConfig } from '@next/env';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { createFsrsScheduler } from '@/lib/fsrs/adapter';
import { serializeFsrsMvpCard } from '@/lib/fsrs/cardState';
import { computeSemanticFingerprint } from '@/lib/fsrs/fingerprint';
import { resolveReviewUnitId } from '@/lib/fsrs/reviewUnit';
import type { FsrsMvpSerializedCard } from '@/lib/fsrs/types';

loadEnvConfig(process.cwd());

const SMOKE_EMAIL_DEFAULT = 'fsrs-mvp-smoke@avant.test';
const SMOKE_SUBTOPICO_DEFAULT = 'Imunização';
const SMOKE_DISCIPLINE = 'Enfermagem';
const ARTIFACT_NAME = 'fsrs-mvp-staging-smoke-report.md';

type Args = {
  dryRun: boolean;
  seedOnly: boolean;
  cleanup: boolean;
  email: string;
  userId: string | null;
  subtopico: string;
  slug: string | null;
};

function parseArgs(argv: string[]): Args {
  let dryRun = false;
  let seedOnly = false;
  let cleanup = false;
  let email = SMOKE_EMAIL_DEFAULT;
  let userId: string | null = null;
  let subtopico = SMOKE_SUBTOPICO_DEFAULT;
  let slug: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === '--dry-run') dryRun = true;
    else if (arg === '--seed-only') seedOnly = true;
    else if (arg === '--cleanup') cleanup = true;
    else if (arg.startsWith('--email=')) email = arg.slice('--email='.length);
    else if (arg === '--email' && argv[i + 1]) email = argv[++i]!;
    else if (arg.startsWith('--user-id=')) userId = arg.slice('--user-id='.length);
    else if (arg === '--user-id' && argv[i + 1]) userId = argv[++i]!;
    else if (arg.startsWith('--subtopico='))
      subtopico = arg.slice('--subtopico='.length);
    else if (arg === '--subtopico' && argv[i + 1]) subtopico = argv[++i]!;
    else if (arg.startsWith('--slug=')) slug = arg.slice('--slug='.length);
    else if (arg === '--slug' && argv[i + 1]) slug = argv[++i]!;
  }
  return { dryRun, seedOnly, cleanup, email, userId, subtopico, slug };
}

function requireEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY obrigatórias (ou --dry-run).',
    );
  }
  return { url, key };
}

function buildDueSerialized(now: Date): {
  before: null;
  after: FsrsMvpSerializedCard;
} {
  const scheduler = createFsrsScheduler();
  const initial = scheduler.createInitialCard(now);
  const out = scheduler.review({
    card: initial,
    rating: 'good',
    reviewedAt: now,
  });
  const after = serializeFsrsMvpCard(out.card);
  // Força due no passado para aparecer na fila beta imediatamente.
  after.due = new Date(now.getTime() - 60_000).toISOString();
  return { before: null, after };
}

async function ensureSmokeUser(
  admin: SupabaseClient,
  email: string,
  knownUserId: string | null,
): Promise<{ userId: string; created: boolean; password: string | null }> {
  if (knownUserId) {
    const { data, error } = await admin.auth.admin.getUserById(knownUserId);
    if (!error && data.user?.id) {
      return { userId: data.user.id, created: false, password: null };
    }
  }

  const password = `FsrsSmoke-${randomUUID().slice(0, 8)}!aA1`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { fsrs_mvp_synthetic_smoke: true },
  });
  if (!error && data.user?.id) {
    return { userId: data.user.id, created: true, password };
  }

  // Já existe: tente credentials sidecar ou falhe com orientação.
  const msg = error?.message ?? 'no user';
  if (/already|registered|exists/i.test(msg)) {
    throw new Error(
      `User ${email} already exists — pass --user-id=<uuid> (see smoke credentials sidecar)`,
    );
  }
  throw new Error(`createUser failed: ${msg}`);
}

async function pickInventorySlug(
  admin: SupabaseClient,
  subtopico: string,
  preferred: string | null,
): Promise<{ slug: string; source: 'arg' | 'meta' }> {
  if (preferred) {
    const { data, error } = await admin
      .from('modulos_estudo')
      .select('modulo_slug')
      .eq('modulo_slug', preferred)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data?.modulo_slug) {
      throw new Error(`Slug não encontrado no inventário: ${preferred}`);
    }
    return { slug: data.modulo_slug, source: 'arg' };
  }
  const { data, error } = await admin
    .from('modulos_estudo')
    .select('modulo_slug')
    .filter('conteudo_json->meta->>subtopico', 'eq', subtopico)
    .limit(1);
  if (error) throw new Error(error.message);
  const slug = data?.[0]?.modulo_slug;
  if (typeof slug !== 'string' || !slug.trim()) {
    throw new Error(
      `Nenhuma questão com meta.subtopico=${subtopico} no inventário`,
    );
  }
  return { slug: slug.trim(), source: 'meta' };
}

async function persistReview(
  admin: SupabaseClient,
  args: {
    userId: string;
    attemptId: string;
    reviewUnitId: string;
    reviewUnitKind: string;
    questionId: string;
    attemptContext: 'cold_practice' | 'scheduled_review';
    isCorrect: boolean;
    rating: 'again' | 'good';
    reviewedAt: Date;
    expectedRevision: number | null;
    before: FsrsMvpSerializedCard | null;
    after: FsrsMvpSerializedCard;
  },
): Promise<{ outcome: string; resulting_revision?: number }> {
  const fp = computeSemanticFingerprint({
    userId: args.userId,
    reviewUnitId: args.reviewUnitId,
    questionId: args.questionId,
    attemptContext: args.attemptContext,
    isCorrect: args.isCorrect,
    rating: args.rating,
    reviewedAt: args.reviewedAt,
    expectedRevision: args.expectedRevision,
    serializedBefore: args.before,
    serializedAfter: args.after,
  });
  const { data, error } = await admin.rpc('fsrs_persist_review', {
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
    p_fsrs_state_before: args.before,
    p_fsrs_state_after: args.after,
    p_same_stem_fallback: false,
    p_semantic_fingerprint: fp,
  });
  if (error) {
    throw new Error(`fsrs_persist_review failed: ${error.code} ${error.message}`);
  }
  return data as { outcome: string; resulting_revision?: number };
}

async function loadCard(
  admin: SupabaseClient,
  userId: string,
  reviewUnitId: string,
) {
  const { data, error } = await admin
    .from('spaced_review_cards')
    .select(
      'revision, due_at, reps, lapses, last_question_id, last_attempt_id, fsrs_state',
    )
    .eq('user_id', userId)
    .eq('review_unit_id', reviewUnitId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function countLogsByAttempt(
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

function redactEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '[redacted]';
  return `${local.slice(0, 2)}***@${domain}`;
}

function renderReport(input: {
  generatedAt: string;
  dryRun: boolean;
  emailRedacted: string;
  userIdPrefix: string;
  subtopico: string;
  reviewUnitId: string;
  slug: string;
  seedAttemptId: string;
  journeyAttemptId: string | null;
  seedRevision: number | null;
  afterRevision: number | null;
  dueAtBefore: string | null;
  dueAtAfter: string | null;
  logsSeed: number | null;
  logsJourney: number | null;
  retryLogs: number | null;
  deployUrl: string | null;
  checks: Record<string, boolean | string>;
}): string {
  const lines = [
    '# FSRS MVP — staging smoke report',
    '',
    `**generated_at:** ${input.generatedAt}`,
    `**mode:** ${input.dryRun ? 'dry-run' : 'live'}`,
    `**synthetic:** true`,
    `**beta_email:** ${input.emailRedacted}`,
    `**user_id_prefix:** ${input.userIdPrefix}`,
    `**subtopico:** ${input.subtopico}`,
    `**review_unit_id:** \`${input.reviewUnitId}\``,
    `**question_slug:** \`${input.slug}\``,
    `**seed_attempt_id:** \`${input.seedAttemptId}\``,
    `**journey_attempt_id:** ${input.journeyAttemptId ? `\`${input.journeyAttemptId}\`` : 'n/a'}`,
    `**deploy_url:** ${input.deployUrl ?? 'n/a'}`,
    '',
    '## Validação',
    '',
    `| Campo | Valor |`,
    `|---|---|`,
    `| seed revision | ${input.seedRevision ?? 'n/a'} |`,
    `| after revision | ${input.afterRevision ?? 'n/a'} |`,
    `| due_at (seed) | ${input.dueAtBefore ?? 'n/a'} |`,
    `| due_at (after journey) | ${input.dueAtAfter ?? 'n/a'} |`,
    `| logs seed attempt | ${input.logsSeed ?? 'n/a'} |`,
    `| logs journey attempt | ${input.logsJourney ?? 'n/a'} |`,
    `| retry logs (idempotência) | ${input.retryLogs ?? 'n/a'} |`,
    '',
    '## Checks',
    '',
  ];
  for (const [k, v] of Object.entries(input.checks)) {
    lines.push(`- **${k}:** ${String(v)}`);
  }
  lines.push(
    '',
    '## Rollback',
    '',
    '- Production: `FSRS_MVP_ENABLED` omitido/false',
    '- Staging preview: `FSRS_MVP_ENABLED=false` se precisar desligar beta',
    '- Dados sintéticos: filtrar por `synthetic: true` neste artefato / e-mail smoke',
    '',
  );
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const now = new Date();
  const unit = resolveReviewUnitId({
    discipline: SMOKE_DISCIPLINE,
    subtopico: args.subtopico,
  });
  if (!unit.ok) {
    throw new Error(`review_unit unresolved: ${unit.reason}`);
  }

  if (args.dryRun) {
    const md = renderReport({
      generatedAt: now.toISOString(),
      dryRun: true,
      emailRedacted: redactEmail(args.email),
      userIdPrefix: 'dry-run',
      subtopico: args.subtopico,
      reviewUnitId: unit.reviewUnitId,
      slug: args.slug ?? '(resolve live)',
      seedAttemptId: '00000000-0000-4000-8000-000000000001',
      journeyAttemptId: null,
      seedRevision: null,
      afterRevision: null,
      dueAtBefore: null,
      dueAtAfter: null,
      logsSeed: null,
      logsJourney: null,
      retryLogs: null,
      deployUrl: process.env.PERF_BASE_URL?.trim() || null,
      checks: {
        would_call_rpc: true,
        would_create_user_if_missing: true,
      },
    });
    const outDir = join(process.cwd(), 'artifacts');
    mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, ARTIFACT_NAME);
    writeFileSync(outPath, md, 'utf8');
    console.log(`Dry-run OK → ${outPath}`);
    return;
  }

  const { url, key } = requireEnv();
  const admin = createClient(url, key, { auth: { persistSession: false } });

  const user = await ensureSmokeUser(admin, args.email, args.userId);

  if (args.cleanup) {
    // Staging ops only: remove synthetic smoke rows (identified by smoke user).
    const { error: logErr } = await admin
      .from('spaced_review_logs')
      .delete()
      .eq('user_id', user.userId);
    if (logErr) throw new Error(`cleanup logs failed: ${logErr.message}`);
    const { error: cardErr } = await admin
      .from('spaced_review_cards')
      .delete()
      .eq('user_id', user.userId);
    if (cardErr) throw new Error(`cleanup cards failed: ${cardErr.message}`);
    console.log(
      `Cleanup OK for synthetic user ${redactEmail(args.email)} (cards+logs)`,
    );
  }

  const inventory = await pickInventorySlug(admin, args.subtopico, args.slug);
  const seedAttemptId = randomUUID();
  const { after: seedAfter } = buildDueSerialized(now);

  const seedRes = await persistReview(admin, {
    userId: user.userId,
    attemptId: seedAttemptId,
    reviewUnitId: unit.reviewUnitId,
    reviewUnitKind: unit.reviewUnitKind,
    questionId: inventory.slug,
    attemptContext: 'cold_practice',
    isCorrect: true,
    rating: 'good',
    reviewedAt: now,
    expectedRevision: null,
    before: null,
    after: seedAfter,
  });

  const cardAfterSeed = await loadCard(admin, user.userId, unit.reviewUnitId);
  const logsSeed = await countLogsByAttempt(admin, seedAttemptId);

  // Retry seed attempt → idempotência (1 log)
  await persistReview(admin, {
    userId: user.userId,
    attemptId: seedAttemptId,
    reviewUnitId: unit.reviewUnitId,
    reviewUnitKind: unit.reviewUnitKind,
    questionId: inventory.slug,
    attemptContext: 'cold_practice',
    isCorrect: true,
    rating: 'good',
    reviewedAt: now,
    expectedRevision: null,
    before: null,
    after: seedAfter,
  });
  const retryLogs = await countLogsByAttempt(admin, seedAttemptId);

  let journeyAttemptId: string | null = null;
  let cardAfterJourney = cardAfterSeed;
  let logsJourney: number | null = null;

  if (!args.seedOnly && cardAfterSeed) {
    journeyAttemptId = randomUUID();
    const scheduler = createFsrsScheduler();
    const reviewedAt = new Date();
    const state = cardAfterSeed.fsrs_state as FsrsMvpSerializedCard;
    // 2ª revisão scheduled_review — espelha a jornada UI → API → RPC.
    const out = scheduler.review({
      card: {
        due: state.due,
        stability: state.stability,
        difficulty: state.difficulty,
        elapsedDays: state.elapsedDays,
        scheduledDays: state.scheduledDays,
        learningSteps: state.learningSteps,
        reps: state.reps,
        lapses: state.lapses,
        state: state.state,
        lastReview: state.lastReview,
      },
      rating: 'good',
      reviewedAt,
    });
    const after = serializeFsrsMvpCard(out.card);
    await persistReview(admin, {
      userId: user.userId,
      attemptId: journeyAttemptId,
      reviewUnitId: unit.reviewUnitId,
      reviewUnitKind: unit.reviewUnitKind,
      questionId: inventory.slug,
      attemptContext: 'scheduled_review',
      isCorrect: true,
      rating: 'good',
      reviewedAt,
      expectedRevision: cardAfterSeed.revision,
      before: state,
      after,
    });
    cardAfterJourney = await loadCard(admin, user.userId, unit.reviewUnitId);
    logsJourney = await countLogsByAttempt(admin, journeyAttemptId);
  }

  const dueSeed = cardAfterSeed?.due_at ?? null;
  const dueAfter = cardAfterJourney?.due_at ?? null;
  const seedRev = cardAfterSeed?.revision ?? null;
  const afterRev = cardAfterJourney?.revision ?? null;

  const checks: Record<string, boolean | string> = {
    rpc_seed_outcome: seedRes.outcome,
    one_log_per_seed_attempt: logsSeed === 1,
    retry_idempotent: retryLogs === 1,
    card_revision_seed_ge_1: typeof seedRev === 'number' && seedRev >= 1,
    last_question_id_matches: cardAfterSeed?.last_question_id === inventory.slug,
    due_at_seed_in_past:
      typeof dueSeed === 'string' && Date.parse(dueSeed) <= Date.now(),
    user_created_or_reused: user.created ? 'created' : 'reused',
    inventory_source: inventory.source,
  };
  if (!args.seedOnly) {
    checks.journey_revision_incremented =
      typeof seedRev === 'number' &&
      typeof afterRev === 'number' &&
      afterRev === seedRev + 1;
    checks.one_log_per_journey_attempt = logsJourney === 1;
    checks.due_at_advanced_after_journey =
      typeof dueSeed === 'string' &&
      typeof dueAfter === 'string' &&
      Date.parse(dueAfter) > Date.parse(dueSeed);
  }

  const boolChecksOk = Object.entries(checks)
    .filter(([, v]) => typeof v === 'boolean')
    .every(([, v]) => v === true);
  const stringOutcomesOk =
    typeof checks.rpc_seed_outcome === 'string' &&
    (checks.rpc_seed_outcome === 'created' ||
      checks.rpc_seed_outcome === 'applied' ||
      checks.rpc_seed_outcome === 'idempotent_replay');
  const overallPass = boolChecksOk && stringOutcomesOk;

  const md = renderReport({
    generatedAt: new Date().toISOString(),
    dryRun: false,
    emailRedacted: redactEmail(args.email),
    userIdPrefix: user.userId.slice(0, 8),
    subtopico: args.subtopico,
    reviewUnitId: unit.reviewUnitId,
    slug: inventory.slug,
    seedAttemptId,
    journeyAttemptId,
    seedRevision: seedRev,
    afterRevision: afterRev,
    dueAtBefore: dueSeed,
    dueAtAfter: dueAfter,
    logsSeed,
    logsJourney,
    retryLogs,
    deployUrl: process.env.PERF_BASE_URL?.trim() || null,
    checks: {
      ...checks,
      overall: overallPass ? 'PASS' : 'FAIL',
    },
  });

  const outDir = join(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, ARTIFACT_NAME);
  writeFileSync(outPath, md, 'utf8');

  if (user.password) {
    console.log(
      `Synthetic user created (password printed once; store outside git): set locally`,
    );
    // Do not print password to avoid leaking into CI logs; write sidecar gitignored.
    writeFileSync(
      join(outDir, 'fsrs-mvp-staging-smoke-credentials.json'),
      JSON.stringify(
        {
          synthetic: true,
          email: args.email,
          password: user.password,
          user_id_prefix: user.userId.slice(0, 8),
          note: 'staging smoke only — do not commit',
        },
        null,
        2,
      ),
      'utf8',
    );
  }

  console.log(`Smoke report → ${outPath}`);
  if (!overallPass) {
    console.error('FSRS staging smoke FAILED — see report checks');
    process.exit(1);
  }
  console.log('FSRS staging smoke PASS (card/log/revision/due_at)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
