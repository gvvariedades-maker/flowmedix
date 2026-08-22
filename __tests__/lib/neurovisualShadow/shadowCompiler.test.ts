import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertManifestScope,
  buildDecisions,
  buildProfile,
  buildRuntimePlan,
  simulateAtomicSelection,
  validateRuntimePlan,
} from '@/lib/neurovisualShadow/compiler';
import { canonicalizeJcs, sha256Jcs } from '@/lib/neurovisualShadow/jcs';
import {
  CANONICAL_SLIDE_TYPES,
  type CohortManifest,
  type EditorialSynthesisAuthoring,
  type JsonValue,
  type QuestionPayload,
  type RuntimePlan,
} from '@/lib/neurovisualShadow/model';
import { buildContentProjection } from '@/lib/neurovisualShadow/projection';
import { resolveSlideSlots } from '@/lib/neurovisualShadow/bindings';
import { detectPreviewCapabilityGaps } from '@/lib/neurovisualShadow/previewAudit';
import { isNeuroVisualShadowPreviewEnabled } from '@/lib/neurovisualShadow/access';

const manifestPath = resolve(
  process.cwd(),
  'data/neurovisual/cohorts/saude-da-mulher-anchors-v1/manifest.json',
);
const prenatalEditorialPath = resolve(
  process.cwd(),
  'data/neurovisual/editorial-synthesis/saude-da-mulher-anchors-v1/cpcon-saude-mulher-pre-natal-vf.editorial-synthesis.json',
);
const partoEditorialPath = resolve(
  process.cwd(),
  'data/neurovisual/editorial-synthesis/saude-da-mulher-anchors-v1/admtec-saude-mulher-parto-humanizado-vf.editorial-synthesis.json',
);

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function stringLeaves(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(stringLeaves);
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap(stringLeaves);
  }
  return [];
}

function visualSourceForSlide(slide: Record<string, unknown>): unknown {
  switch (slide.type) {
    case 'concept_map':
      return { slide_title: slide.slide_title, items: slide.items, footer_rule: slide.footer_rule };
    case 'logic_flow':
      return { steps: slide.steps, footer_rule: slide.footer_rule };
    case 'golden_rule':
      return {
        slide_title: slide.slide_title,
        content: slide.content,
        rows: slide.rows,
        footer_rule: slide.footer_rule,
      };
    case 'danger_zone':
      return { content: slide.content, items: slide.items, footer_rule: slide.footer_rule };
    default:
      throw new Error(`Unexpected slide type ${String(slide.type)}`);
  }
}

describe('RFC 8785/JCS hashing', () => {
  it('sorts object keys while preserving array order and ECMAScript number serialization', () => {
    expect(
      canonicalizeJcs({
        z: [3, 2, 1],
        numbers: [333333333.33333329, 1e30, 4.5, 2e-3, 1e-27],
        a: true,
      }),
    ).toBe('{"a":true,"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27],"z":[3,2,1]}');
  });

  it('does not normalize Unicode and rejects unpaired surrogates', () => {
    expect(sha256Jcs('é')).not.toBe(sha256Jcs('e\u0301'));
    expect(() => canonicalizeJcs('\ud800')).toThrow('Unpaired high surrogate');
  });
});

describe('NeuroVisual shadow cohort', () => {
  const manifest = readJson<CohortManifest>(manifestPath);

  it('is an explicit, default-off cohort of exactly six paths', () => {
    expect(() => assertManifestScope(manifest)).not.toThrow();
    expect(manifest.members).toHaveLength(6);
    expect(manifest.excluded_universes).toEqual([
      'historical_manifest_246',
      'live_filter_268',
      'intersection_244',
    ]);
    expect(manifest.members.every((member) => member.source_path.startsWith('examples/'))).toBe(true);
  });

  it.each(manifest.members)('compiles and validates $question_slug without recursive hash fields', (member) => {
    const payload = readJson<QuestionPayload>(resolve(process.cwd(), member.source_path));
    payload.neuro_visual_plan = { must_not_hash: true };
    payload.meta = { ...payload.meta, reviewer_id: 'must-not-hash' };
    const projection = buildContentProjection(member.question_slug, payload);

    expect(projection.reverse_study_slides.map((slide) => slide.type)).toEqual(
      CANONICAL_SLIDE_TYPES,
    );
    expect(JSON.stringify(projection)).not.toContain('neuro_visual_plan');
    expect(JSON.stringify(projection)).not.toContain('reviewer_id');

    const contentHash = sha256Jcs(projection as unknown as JsonValue);
    const decisions = buildDecisions(member, projection);
    const profile = buildProfile(member, projection, contentHash, decisions);
    const plan = buildRuntimePlan(profile);
    const validation = validateRuntimePlan(plan, projection, contentHash, profile.profile_hash);

    expect(validation).toMatchObject({ valid: true, failures: [] });
    expect(plan.slides).toHaveLength(4);
    expect(JSON.stringify(plan)).not.toMatch(
      /decision_trace|reviewer_id|author_id|candidates|rationale|"score"|"status"|"approved"/,
    );
    expect(simulateAtomicSelection(validation)).toEqual({
      renderer: 'legacy',
      result: 'legacy_rollout_off',
      attempted_v1: false,
    });

    for (let index = 0; index < plan.slides.length; index += 1) {
      const bound = resolveSlideSlots(projection, plan.slides[index]);
      expect(stringLeaves(bound).sort()).toEqual(
        stringLeaves(visualSourceForSlide(projection.reverse_study_slides[index])).sort(),
      );
    }
  });

  it('fails the whole question when one required binding violates the spoiler policy', () => {
    const member = manifest.members[0];
    const payload = readJson<QuestionPayload>(resolve(process.cwd(), member.source_path));
    const projection = buildContentProjection(member.question_slug, payload);
    const contentHash = sha256Jcs(projection as unknown as JsonValue);
    const decisions = buildDecisions(member, projection);
    const profile = buildProfile(member, projection, contentHash, decisions);
    const plan = buildRuntimePlan(profile);
    plan.slides[0].slot_bindings.push({
      slot_id: 'forbidden-answer',
      source_pointer: '/reverse_study_slides/0/items',
      transform: 'object_fields@1',
      role: 'items',
      fields: ['label', 'correct'],
    });

    const validation = validateRuntimePlan(plan, projection, contentHash, profile.profile_hash);
    expect(validation.valid).toBe(false);
    expect(validation.failures).toContainEqual({
      code: 'NV_SPOILER_POLICY_VIOLATION',
      detail: 'concept_map:forbidden-answer',
    });
    expect(simulateAtomicSelection(validation).result).toBe('legacy_plan_invalid');
  });

  it('rejects authoring-only fields in the runtime payload', () => {
    const member = manifest.members[0];
    const payload = readJson<QuestionPayload>(resolve(process.cwd(), member.source_path));
    const projection = buildContentProjection(member.question_slug, payload);
    const contentHash = sha256Jcs(projection as unknown as JsonValue);
    const profile = buildProfile(member, projection, contentHash, buildDecisions(member, projection));
    const plan = buildRuntimePlan(profile) as RuntimePlan & { decision_trace?: unknown[] };
    plan.decision_trace = [];

    expect(validateRuntimePlan(plan, projection, contentHash, profile.profile_hash).failures).toContainEqual({
      code: 'NV_SCHEMA_UNSUPPORTED',
      detail: 'Forbidden runtime field /decision_trace',
    });
  });

  it('requires every slide to be static, complete and player-navigation-only', () => {
    const member = manifest.members[0];
    const payload = readJson<QuestionPayload>(resolve(process.cwd(), member.source_path));
    const projection = buildContentProjection(member.question_slug, payload);
    const contentHash = sha256Jcs(projection as unknown as JsonValue);
    const profile = buildProfile(member, projection, contentHash, buildDecisions(member, projection));
    const plan = buildRuntimePlan(profile);

    for (const slide of plan.slides) {
      expect(slide).toMatchObject({
        interaction_policy: 'static_complete',
        internal_action_count: 0,
        initial_state: 'fully_revealed',
        hidden_content: false,
        player_navigation_only: true,
        spoiler_policy: 'fully_revealed',
      });
    }

    const invalid = JSON.parse(JSON.stringify(plan)) as RuntimePlan & {
      slides: Array<RuntimePlan['slides'][number] & { next_step?: string }>;
    };
    invalid.slides[1].next_step = 'reveal';
    expect(validateRuntimePlan(invalid, projection, contentHash, profile.profile_hash).failures).toContainEqual({
      code: 'NV_INTERACTION_POLICY_VIOLATION',
      detail: 'logic_flow:/next_step',
    });
  });

  it('keeps the preview development-only', () => {
    expect(isNeuroVisualShadowPreviewEnabled('development')).toBe(true);
    expect(isNeuroVisualShadowPreviewEnabled('production')).toBe(false);
    expect(isNeuroVisualShadowPreviewEnabled('test')).toBe(false);
    expect(isNeuroVisualShadowPreviewEnabled(undefined)).toBe(false);
  });

  it('reports semantic binding gaps instead of inferring missing roles', () => {
    const gaps = manifest.members.flatMap((member) => {
      const payload = readJson<QuestionPayload>(resolve(process.cwd(), member.source_path));
      const projection = buildContentProjection(member.question_slug, payload);
      const contentHash = sha256Jcs(projection as unknown as JsonValue);
      const profile = buildProfile(member, projection, contentHash, buildDecisions(member, projection));
      return detectPreviewCapabilityGaps(buildRuntimePlan(profile));
    });
    expect(gaps).toHaveLength(12);
    expect(new Set(gaps.map((gap) => gap.gap_id))).toEqual(
      new Set([
        'critical-number-atomic-bindings',
        'logic-flow-gesture-specific-composition',
        'danger-zone-gesture-specific-composition',
      ]),
    );
  });

  it('compiles the prenatal editorial synthesis into a minimal, source-backed runtime projection', () => {
    const member = manifest.members.find(
      (candidate) => candidate.question_slug === 'cpcon-saude-mulher-pre-natal-vf',
    );
    if (!member) throw new Error('Missing prenatal anchor');
    const editorial = readJson<EditorialSynthesisAuthoring>(prenatalEditorialPath);
    const payload = readJson<QuestionPayload>(resolve(process.cwd(), member.source_path));
    const projection = buildContentProjection(member.question_slug, payload);
    const contentHash = sha256Jcs(projection as unknown as JsonValue);
    const profile = buildProfile(member, projection, contentHash, buildDecisions(member, projection));
    const plan = buildRuntimePlan(profile, editorial.runtime_projection);
    const validation = validateRuntimePlan(plan, projection, contentHash, profile.profile_hash);

    expect(validation).toMatchObject({ valid: true, failures: [] });
    expect(plan.editorial_contract_version).toBe('neuro-editorial-synthesis-v1');
    expect(plan.slides.every((slide) => Boolean(slide.editorial_synthesis))).toBe(true);
    expect(plan.slides[2].editorial_synthesis?.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fact_id: 'minimum-six',
          label: expect.any(Object),
          value: expect.any(Object),
          unit: expect.any(Object),
          opposition: expect.any(Object),
        }),
      ]),
    );
    expect(JSON.stringify(plan)).not.toMatch(
      /reviewer_id|decision_trace|candidates|rationale|"score"|"state":"review_pending"/,
    );
    expect(detectPreviewCapabilityGaps(plan)).toEqual([]);
  });

  it('generalizes the editorial contract to parto without exposing authoring data', () => {
    const member = manifest.members.find(
      (candidate) => candidate.question_slug === 'admtec-saude-mulher-parto-humanizado-vf',
    );
    if (!member) throw new Error('Missing parto anchor');
    const editorial = readJson<EditorialSynthesisAuthoring>(partoEditorialPath);
    const payload = readJson<QuestionPayload>(resolve(process.cwd(), member.source_path));
    const projection = buildContentProjection(member.question_slug, payload);
    const contentHash = sha256Jcs(projection as unknown as JsonValue);
    const profile = buildProfile(member, projection, contentHash, buildDecisions(member, projection));
    const plan = buildRuntimePlan(profile, editorial.runtime_projection);
    const validation = validateRuntimePlan(plan, projection, contentHash, profile.profile_hash);

    expect(validation).toMatchObject({ valid: true, failures: [] });
    expect(plan.slides.map((slide) => slide.editorial_synthesis?.art_direction.direction)).toEqual([
      'radial',
      'filtering',
      'equivalent_units',
      'paired_rows_compact',
    ]);
    expect(plan.slides[1].editorial_synthesis?.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fact_id: 'answer', value: expect.objectContaining({ text: 'B' }) }),
      ]),
    );
    expect(JSON.stringify(plan)).not.toMatch(
      /reviewer_id|decision_trace|candidates|rationale|"score"|"state":"review_pending"/,
    );
    expect(detectPreviewCapabilityGaps(plan)).toEqual([]);
  });

  it('rejects an editorial atom outside the slide root and any truncated display text', () => {
    const member = manifest.members[0];
    const editorial = readJson<EditorialSynthesisAuthoring>(prenatalEditorialPath);
    const payload = readJson<QuestionPayload>(resolve(process.cwd(), member.source_path));
    const projection = buildContentProjection(member.question_slug, payload);
    const contentHash = sha256Jcs(projection as unknown as JsonValue);
    const profile = buildProfile(member, projection, contentHash, buildDecisions(member, projection));
    const plan = buildRuntimePlan(
      profile,
      JSON.parse(JSON.stringify(editorial.runtime_projection)) as EditorialSynthesisAuthoring['runtime_projection'],
    );
    const headline = plan.slides[0].editorial_synthesis?.headline;
    if (!headline) throw new Error('Missing editorial headline');
    headline.text = 'PRÉ-NATAL…';
    headline.source_pointers = ['/reverse_study_slides/2/slide_title'];

    const failures = validateRuntimePlan(plan, projection, contentHash, profile.profile_hash).failures;
    expect(failures).toContainEqual({
      code: 'NV_EDITORIAL_SYNTHESIS_INVALID',
      detail: 'concept_map/headline: automatic truncation is forbidden',
    });
  });

  it('limits the per-slide editorial grammar to prenatal and parto', () => {
    const expectedSample = new Map([
      [
        'cpcon-saude-mulher-pre-natal-vf',
        ['rail', 'funnel', 'critical_number', 'compare'],
      ],
      [
        'admtec-saude-mulher-parto-humanizado-vf',
        ['focus', 'funnel', 'deck', 'compare'],
      ],
    ]);

    for (const member of manifest.members) {
      const payload = readJson<QuestionPayload>(resolve(process.cwd(), member.source_path));
      const projection = buildContentProjection(member.question_slug, payload);
      const contentHash = sha256Jcs(projection as unknown as JsonValue);
      const profile = buildProfile(member, projection, contentHash, buildDecisions(member, projection));
      const gestures = buildRuntimePlan(profile).slides.map((slide) =>
        slide.composition_id.split('.').at(-1),
      );
      const sampleGestures = expectedSample.get(member.question_slug);
      expect(gestures).toEqual(
        sampleGestures ?? CANONICAL_SLIDE_TYPES.map(() => member.semantic_seed.dominant_gesture),
      );
    }
  });
});
