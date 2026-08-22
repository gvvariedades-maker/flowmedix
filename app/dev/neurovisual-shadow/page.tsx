import { notFound } from 'next/navigation';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { sha256Jcs } from '@/lib/neurovisualShadow/jcs';
import { buildContentProjection } from '@/lib/neurovisualShadow/projection';
import { validateRuntimePlan } from '@/lib/neurovisualShadow/compiler';
import { detectPreviewCapabilityGaps } from '@/lib/neurovisualShadow/previewAudit';
import { isNeuroVisualShadowPreviewEnabled } from '@/lib/neurovisualShadow/access';
import type {
  CohortManifest,
  JsonValue,
  QuestionPayload,
  RuntimePlan,
} from '@/lib/neurovisualShadow/model';
import { NeuroVisualShadowPreviewClient } from './NeuroVisualShadowPreviewClient';

const MANIFEST_RELATIVE_PATH =
  'data/neurovisual/cohorts/saude-da-mulher-anchors-v1/manifest.json';

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

type PageProps = {
  searchParams: Promise<{ anchor?: string }>;
};

/** Dev-only: comparação isolada legado × plano v1 para a coorte fechada do piloto. */
export default async function NeuroVisualShadowPage({ searchParams }: PageProps) {
  if (!isNeuroVisualShadowPreviewEnabled(process.env.NODE_ENV)) {
    notFound();
  }

  const manifest = readJson<CohortManifest>(resolve(process.cwd(), MANIFEST_RELATIVE_PATH));
  if (
    manifest.cohort_id !== 'saude-da-mulher-anchors-v1' ||
    manifest.discovery !== 'explicit_paths_only' ||
    manifest.members.length !== 6 ||
    manifest.rollout !== 'off'
  ) {
    notFound();
  }

  const { anchor: requestedAnchor } = await searchParams;
  const member =
    manifest.members.find((candidate) => candidate.question_slug === requestedAnchor) ??
    manifest.members[0];
  if (!member) notFound();

  const source = readJson<QuestionPayload>(resolve(process.cwd(), member.source_path));
  const projection = buildContentProjection(member.question_slug, source);
  const contentHash = sha256Jcs(projection as unknown as JsonValue);
  const plan = readJson<RuntimePlan>(
    resolve(
      process.cwd(),
      `data/neurovisual/runtime-plans/saude-da-mulher-anchors-v1/${member.question_slug}.runtime-plan.json`,
    ),
  );
  const validation = validateRuntimePlan(plan, projection, contentHash, plan.profile_hash);
  const codes = [...new Set([...validation.failures.map((failure) => failure.code), 'NV_ROLLOUT_OFF'])];

  return (
    <NeuroVisualShadowPreviewClient
      anchors={manifest.members.map((entry) => ({
        questionSlug: entry.question_slug,
        pedagogicalBranch: entry.pedagogical_branch,
      }))}
      selected={{
        questionSlug: member.question_slug,
        pedagogicalBranch: member.pedagogical_branch,
        source,
        projection,
        plan,
        codes,
        gaps: detectPreviewCapabilityGaps(plan),
      }}
    />
  );
}
