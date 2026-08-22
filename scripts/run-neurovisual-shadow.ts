#!/usr/bin/env tsx
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { resolveSlidePresentation } from '../components/slides/core/slidePresentation';
import {
  assertManifestScope,
  buildAuthoringSidecar,
  buildDecisions,
  buildProfile,
  buildRuntimePlan,
  simulateAtomicSelection,
  validateRuntimePlan,
} from '../lib/neurovisualShadow/compiler';
import { sha256Jcs } from '../lib/neurovisualShadow/jcs';
import {
  CANONICAL_SLIDE_TYPES,
  COHORT_ID,
  type CohortManifest,
  type EditorialSynthesisAuthoring,
  type JsonValue,
  type ProfileFields,
  type QuestionPayload,
  type SlideType,
} from '../lib/neurovisualShadow/model';
import { buildContentProjection } from '../lib/neurovisualShadow/projection';

const REPO_ROOT = process.cwd();
const MANIFEST_PATH = resolve(
  REPO_ROOT,
  'data/neurovisual/cohorts/saude-da-mulher-anchors-v1/manifest.json',
);
const AUTHORING_ROOT = resolve(REPO_ROOT, 'data/neurovisual/authoring/saude-da-mulher-anchors-v1');
const RUNTIME_ROOT = resolve(REPO_ROOT, 'data/neurovisual/runtime-plans/saude-da-mulher-anchors-v1');
const EDITORIAL_ROOT = resolve(REPO_ROOT, 'data/neurovisual/editorial-synthesis/saude-da-mulher-anchors-v1');
const ARTIFACT_ROOT = resolve(REPO_ROOT, 'artifacts/neurovisual/saude-da-mulher-anchors-v1');

function assertInside(root: string, path: string): void {
  const child = relative(root, path);
  if (child.startsWith('..') || child.includes(':') || child === '') {
    throw new Error(`Refusing path outside controlled root: ${path}`);
  }
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

async function readOptionalDecisions(
  path: string,
): Promise<Partial<Record<keyof ProfileFields, unknown>>> {
  try {
    const sidecar = await readJson<{ decisions?: Partial<Record<keyof ProfileFields, unknown>> }>(path);
    return sidecar.decisions ?? {};
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
  }
}

async function readOptionalEditorialSynthesis(
  questionSlug: string,
): Promise<EditorialSynthesisAuthoring | undefined> {
  const path = resolve(EDITORIAL_ROOT, `${questionSlug}.editorial-synthesis.json`);
  try {
    const synthesis = await readJson<EditorialSynthesisAuthoring>(path);
    if (synthesis.question_slug !== questionSlug) {
      throw new Error(`Editorial synthesis slug mismatch for ${questionSlug}`);
    }
    return synthesis;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

async function writeJsonAtomic(root: string, path: string, value: unknown): Promise<void> {
  assertInside(root, path);
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temporary, path);
}

function legacyBaseline(
  questionSlug: string,
  payload: QuestionPayload,
  pedagogicalBranch: string,
): Array<{ slide_type: SlideType; layout_variant: string }> {
  const sourceSlides = payload.reverse_study_slides ?? [];
  const byType = new Map(sourceSlides.map((slide) => [String(slide.type), slide]));
  return CANONICAL_SLIDE_TYPES.map((slideType, index) => {
    const slide = byType.get(slideType);
    if (!slide) throw new Error(`Missing legacy baseline slide ${slideType}`);
    const resolved = resolveSlidePresentation(slide, {
      questionSlug,
      slideIndex: index,
      pedagogicalBranch: pedagogicalBranch as never,
      instruction: String(payload.question_data?.instruction ?? ''),
      options: Array.isArray(payload.question_data?.options)
        ? (payload.question_data.options as never)
        : undefined,
    });
    return { slide_type: slideType, layout_variant: resolved.layoutVariant };
  });
}

async function main(): Promise<void> {
  const write = process.argv.includes('--write');
  const editorialFoundationOnly = process.argv.includes('--editorial-foundation');
  const manifest = await readJson<CohortManifest>(MANIFEST_PATH);
  assertManifestScope(manifest);

  const compiled = [];
  for (const member of manifest.members) {
    const sourcePath = resolve(REPO_ROOT, member.source_path);
    assertInside(REPO_ROOT, sourcePath);
    const payload = await readJson<QuestionPayload>(sourcePath);
    if (payload.meta?.pedagogical_branch !== member.pedagogical_branch) {
      throw new Error(`Branch mismatch for ${member.question_slug}`);
    }

    const projection = buildContentProjection(member.question_slug, payload);
    const contentHash = sha256Jcs(projection as unknown as JsonValue);
    const authoringPath = resolve(AUTHORING_ROOT, `${member.question_slug}.authoring.json`);
    const priorDecisions = await readOptionalDecisions(authoringPath);
    const decisions = buildDecisions(member, projection, priorDecisions);
    const profile = buildProfile(member, projection, contentHash, decisions);
    const editorialSynthesis = await readOptionalEditorialSynthesis(member.question_slug);
    const runtimePlan = buildRuntimePlan(profile, editorialSynthesis?.runtime_projection);
    const validation = validateRuntimePlan(runtimePlan, projection, contentHash, profile.profile_hash);
    const baseline = legacyBaseline(member.question_slug, payload, member.pedagogical_branch);
    const sidecar = buildAuthoringSidecar({
      member,
      contentHash,
      profile,
      decisions,
      runtimePlan,
      validation,
      legacyBaseline: baseline,
      editorialSynthesis,
    });
    const outcome = simulateAtomicSelection(validation);
    compiled.push({
      member,
      projection,
      contentHash,
      profile,
      runtimePlan,
      validation,
      sidecar,
      baseline,
      outcome,
      editorialSynthesis,
    });
  }

  const runDigest = sha256Jcs(
    compiled.map((entry) => ({
      question_slug: entry.member.question_slug,
      content_hash: entry.contentHash,
      profile_hash: entry.profile.profile_hash,
      plan_id: entry.runtimePlan.plan_id,
    })) as unknown as JsonValue,
  ).slice('sha256:'.length, 'sha256:'.length + 12);
  const runId = `${editorialFoundationOnly ? 'shadow-v1b' : 'shadow-v1'}-${runDigest}`;
  const reportRoot = resolve(ARTIFACT_ROOT, runId, 'reports');

  const summary = {
    schema_version: 'neurovisual-shadow-report-v1',
    cohort_id: COHORT_ID,
    run_id: runId,
    mode: write ? 'write' : 'verify',
    rollout: 'off',
    production_integration: false,
    questions_expected: 6,
    questions_compiled: compiled.length,
    questions_written: editorialFoundationOnly
      ? compiled.filter((entry) => Boolean(entry.editorialSynthesis)).length
      : compiled.length,
    plans_valid: compiled.filter((entry) => entry.validation.valid).length,
    atomic_results: compiled.map((entry) => ({
      question_slug: entry.member.question_slug,
      plan_id: entry.runtimePlan.plan_id,
      content_hash: entry.contentHash,
      profile_hash: entry.profile.profile_hash,
      validation: entry.validation.valid ? 'pass' : 'fail',
      observed_result: entry.outcome.result,
      legacy_baseline: entry.baseline,
    })),
    completed_gates: [
      'explicit_cohort_6_of_6',
      'jcs_sha256_hashes',
      'runtime_payload_separation',
      'binding_and_spoiler_validation',
      'legacy_baseline_resolved',
      'atomic_rollout_off_simulation',
    ],
    pending_human_or_visual_gates: [
      'isolated_desktop_mobile_preview',
      'overflow_and_reduced_motion_capture',
      'pedagogical_review',
      'visual_review',
      'approve_revise_reject_decision',
    ],
  };

  if (compiled.length !== 6 || compiled.some((entry) => !entry.validation.valid)) {
    throw new Error(`Shadow compilation failed: ${JSON.stringify(summary)}`);
  }

  if (write) {
    const writableEntries = editorialFoundationOnly
      ? compiled.filter((entry) => Boolean(entry.editorialSynthesis))
      : compiled;
    for (const entry of writableEntries) {
      const evidenceRef = `artifacts/neurovisual/${COHORT_ID}/${runId}/reports/summary.json`;
      (entry.sidecar as { evidence_refs: string[] }).evidence_refs = [evidenceRef];
      await writeJsonAtomic(
        AUTHORING_ROOT,
        resolve(AUTHORING_ROOT, `${entry.member.question_slug}.authoring.json`),
        entry.sidecar,
      );
      await writeJsonAtomic(
        RUNTIME_ROOT,
        resolve(RUNTIME_ROOT, `${entry.member.question_slug}.runtime-plan.json`),
        entry.runtimePlan,
      );
      await writeJsonAtomic(
        reportRoot,
        resolve(reportRoot, 'content-projections', `${entry.member.question_slug}.projection.json`),
        entry.projection,
      );
    }
    await writeJsonAtomic(reportRoot, resolve(reportRoot, 'summary.json'), summary);
  }

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
