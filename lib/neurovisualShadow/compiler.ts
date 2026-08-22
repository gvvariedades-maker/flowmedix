import { compositionId, hasComposition, SHADOW_CATALOG } from './catalog';
import { sha256Jcs } from './jcs';
import {
  ANALYZER_VERSION,
  CANONICAL_SLIDE_TYPES,
  CATALOG_VERSION,
  COHORT_ID,
  COMPILER_VERSION,
  CONTENT_PROJECTION_VERSION,
  EDITORIAL_PRIMITIVES,
  EDITORIAL_SYNTHESIS_SCHEMA_VERSION,
  GESTURES,
  PLANNER_VERSION,
  PROFILE_PROJECTION_VERSION,
  PROFILE_SCHEMA_VERSION,
  RENDERER_CONTRACT_VERSION,
  RUNTIME_PLAN_SCHEMA_VERSION,
  SIDECAR_SCHEMA_VERSION,
  TRANSFORMS,
  type CohortMember,
  type EffectiveField,
  type EditorialAtom,
  type EditorialSynthesisAuthoring,
  type Gesture,
  type JsonValue,
  type NeuroSemanticProfile,
  type NormalizedQuestion,
  type ProfileFields,
  type RuntimePlan,
  type RuntimeEditorialSynthesis,
  type RuntimePlanSlide,
  type SlideType,
  type SlotBinding,
  type ValidationResult,
} from './model';
import { buildProfileProjection } from './projection';
import { resolvePointer } from './bindings';

const PROFILE_KEYS: Array<keyof ProfileFields> = [
  'family',
  'subtopic',
  'pedagogical_branch',
  'learning_intent',
  'spatial_error',
  'dominant_gesture',
  'spoiler_timing',
  'critical_numbers',
  'four_slide_strategy',
  'relations',
  'axes',
  'poles',
  'ordering',
  'interaction_need',
];

const SLIDE_ROOTS: Record<SlideType, string> = {
  concept_map: '/reverse_study_slides/0',
  logic_flow: '/reverse_study_slides/1',
  golden_rule: '/reverse_study_slides/2',
  danger_zone: '/reverse_study_slides/3',
};

const FORBIDDEN_RUNTIME_KEYS = new Set([
  'status',
  'approved',
  'decision_trace',
  'trace',
  'score',
  'scores',
  'candidates',
  'rationale',
  'reason',
  'author_id',
  'reviewer_id',
  'decided_at',
  'created_at',
  'updated_at',
  'evidence',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deterministicField<T extends JsonValue>(value: T, reason: string): EffectiveField<T> {
  return {
    suggested_value: value,
    effective_value: value,
    decision_source: 'deterministic',
    precedence: 'deterministic',
    reason,
    author_id: null,
    reviewer_id: null,
    revision: 1,
    decided_at: null,
  };
}

function validOverride(value: unknown): value is EffectiveField {
  return (
    isRecord(value) &&
    value.decision_source === 'human_override' &&
    value.precedence === 'human_override' &&
    value.effective_value !== undefined &&
    typeof value.reason === 'string' &&
    typeof value.author_id === 'string' &&
    Number.isInteger(value.revision)
  );
}

export function buildDecisions(
  member: CohortMember,
  normalized: NormalizedQuestion,
  priorOverrides: Partial<Record<keyof ProfileFields, unknown>> = {},
): Record<keyof ProfileFields, EffectiveField> {
  const suggested: ProfileFields = {
    family: String(normalized.meta.family),
    subtopic: String(normalized.meta.subtopico),
    pedagogical_branch: member.pedagogical_branch,
    ...member.semantic_seed,
  };
  const decisions = {} as Record<keyof ProfileFields, EffectiveField>;

  for (const key of PROFILE_KEYS) {
    const baseline = deterministicField(
      suggested[key] as JsonValue,
      `Explicit cohort seed ${member.question_slug}:${String(key)}`,
    );
    const candidate = priorOverrides[key];
    decisions[key] = validOverride(candidate)
      ? ({ ...candidate, suggested_value: baseline.suggested_value } as EffectiveField)
      : baseline;
  }
  return decisions;
}

export function buildProfile(
  member: CohortMember,
  normalized: NormalizedQuestion,
  contentHash: string,
  decisions: Record<keyof ProfileFields, EffectiveField>,
): NeuroSemanticProfile {
  const effective = {} as ProfileFields;
  const decisionSource = {} as NeuroSemanticProfile['decision_source'];
  for (const key of PROFILE_KEYS) {
    Object.assign(effective, { [key]: decisions[key].effective_value });
    decisionSource[key] = decisions[key].decision_source;
  }
  const profileHash = sha256Jcs(buildProfileProjection(contentHash, effective, decisionSource));
  return {
    schema_version: PROFILE_SCHEMA_VERSION,
    projection_version: PROFILE_PROJECTION_VERSION,
    question_slug: member.question_slug,
    cohort_id: COHORT_ID,
    content_hash: contentHash,
    profile_hash: profileHash,
    analyzer_version: ANALYZER_VERSION,
    source_mode: Object.values(decisionSource).includes('human_override') ? 'hybrid' : 'deterministic',
    effective,
    decision_source: decisionSource,
  };
}

function binding(
  slotId: string,
  sourcePointer: string,
  transform: SlotBinding['transform'],
  role: SlotBinding['role'],
  fields?: string[],
): SlotBinding {
  return {
    slot_id: slotId,
    source_pointer: sourcePointer,
    transform,
    role,
    ...(fields ? { fields } : {}),
  };
}

function bindingsForSlide(slideType: SlideType): SlotBinding[] {
  const root = SLIDE_ROOTS[slideType];
  if (slideType === 'concept_map') {
    return [
      binding('title', `${root}/slide_title`, 'identity@1', 'title'),
      binding('items', `${root}/items`, 'object_fields@1', 'items', ['label', 'detail', 'icon']),
      binding('footer', `${root}/footer_rule`, 'identity@1', 'footer'),
    ];
  }
  if (slideType === 'logic_flow') {
    return [
      binding('steps', `${root}/steps`, 'array_items@1', 'steps'),
      binding('footer', `${root}/footer_rule`, 'identity@1', 'footer'),
    ];
  }
  if (slideType === 'golden_rule') {
    return [
      binding('title', `${root}/slide_title`, 'identity@1', 'title'),
      binding('body', `${root}/content`, 'identity@1', 'body'),
      binding(
        'rows',
        `${root}/rows`,
        'object_fields@1',
        'rows',
        ['label', 'value', 'emphasis', 'badge', 'sv_kind', 'exam_hint', 'fixation'],
      ),
      binding('footer', `${root}/footer_rule`, 'identity@1', 'footer'),
    ];
  }
  return [
    binding('body', `${root}/content`, 'identity@1', 'body'),
    binding('corrections', `${root}/items`, 'object_fields@1', 'correction', [
      'label',
      'detail',
      'correct',
    ]),
    binding('footer', `${root}/footer_rule`, 'identity@1', 'footer'),
  ];
}

function buildSlide(slideType: SlideType, gesture: Gesture): RuntimePlanSlide {
  return {
    slide_type: slideType,
    composition_id: compositionId(slideType, gesture),
    slot_bindings: bindingsForSlide(slideType),
    semantic_color_roles: ['success', 'danger', 'warning', 'info', 'neutral'],
    spoiler_policy: 'fully_revealed',
    interaction_policy: 'static_complete',
    internal_action_count: 0,
    initial_state: 'fully_revealed',
    hidden_content: false,
    player_navigation_only: true,
    responsive_policy: 'stack_preserve_order',
    accessibility_policy: 'semantic_groups',
    motion_policy: 'content_complete_without_motion',
  };
}

const PILOT_SLIDE_GESTURES: Partial<
  Record<string, Record<SlideType, Gesture>>
> = {
  gestational_editorial_foundation_v1: {
    concept_map: 'rail',
    logic_flow: 'funnel',
    golden_rule: 'critical_number',
    danger_zone: 'compare',
  },
  gestational_editorial_sequence_v1: {
    concept_map: 'rail',
    logic_flow: 'funnel',
    golden_rule: 'critical_number',
    danger_zone: 'compare',
  },
  humanized_care_compass_v1: {
    concept_map: 'focus',
    logic_flow: 'funnel',
    golden_rule: 'deck',
    danger_zone: 'compare',
  },
};

function plannedGestureForSlide(
  profile: NeuroSemanticProfile,
  slideType: SlideType,
): Gesture {
  const strategy = PILOT_SLIDE_GESTURES[profile.effective.four_slide_strategy.metaphor];
  return strategy?.[slideType] ?? profile.effective.dominant_gesture;
}

const FORBIDDEN_INTERACTION_VALUES = new Set([
  'reveal',
  'expand',
  'next_step',
  'tap_reveal',
  'step_reveal',
  'after_reasoning',
]);

const FORBIDDEN_INTERACTION_KEYS = new Set([
  'reveal',
  'expand',
  'next_step',
  'on_click',
  'click_action',
]);

function findInteractionViolation(value: unknown, path = ''): string | null {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findInteractionViolation(value[index], `${path}/${index}`);
      if (found) return found;
    }
  } else if (isRecord(value)) {
    for (const [key, entry] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();
      if (FORBIDDEN_INTERACTION_KEYS.has(normalizedKey)) return `${path}/${key}`;
      if (
        (normalizedKey.includes('clickable') ||
          normalizedKey === 'interactive' ||
          normalizedKey.includes('requires_interaction') ||
          normalizedKey.includes('conditional_correction')) &&
        entry === true
      ) {
        return `${path}/${key}`;
      }
      if (normalizedKey === 'hidden_content' && entry !== false) return `${path}/${key}`;
      if (normalizedKey.includes('hidden') && entry === true) return `${path}/${key}`;
      const found = findInteractionViolation(entry, `${path}/${key}`);
      if (found) return found;
    }
  } else if (
    typeof value === 'string' &&
    FORBIDDEN_INTERACTION_VALUES.has(value.toLowerCase())
  ) {
    return path;
  }
  return null;
}

export function buildRuntimePlan(
  profile: NeuroSemanticProfile,
  editorialSynthesis: RuntimeEditorialSynthesis[] = [],
): RuntimePlan {
  const digest = profile.profile_hash.slice('sha256:'.length, 'sha256:'.length + 16);
  const editorialByType = new Map(editorialSynthesis.map((entry) => [entry.slide_type, entry]));
  return {
    schema_version: RUNTIME_PLAN_SCHEMA_VERSION,
    plan_id: `nvp1:${profile.question_slug}:${digest}`,
    question_slug: profile.question_slug,
    content_hash: profile.content_hash,
    profile_hash: profile.profile_hash,
    catalog_version: CATALOG_VERSION,
    renderer_contract_version: RENDERER_CONTRACT_VERSION,
    ...(editorialSynthesis.length > 0
      ? { editorial_contract_version: EDITORIAL_SYNTHESIS_SCHEMA_VERSION }
      : {}),
    slides: CANONICAL_SLIDE_TYPES.map((type) => ({
      ...buildSlide(type, plannedGestureForSlide(profile, type)),
      ...(editorialByType.has(type) ? { editorial_synthesis: editorialByType.get(type) } : {}),
    })),
  };
}

function normalizeEditorialText(value: string): string {
  return value.normalize('NFC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('pt-BR');
}

function validateEditorialAtom(
  atom: EditorialAtom,
  normalized: NormalizedQuestion,
  allowedRoot: string,
  detail: string,
): string | null {
  if (!atom.text.trim()) return `${detail}: empty text`;
  if (atom.text.includes('…') || atom.text.includes('...')) {
    return `${detail}: automatic truncation is forbidden`;
  }
  if (atom.source_pointers.length === 0) return `${detail}: missing provenance`;
  const resolvedSources: string[] = [];
  for (const pointer of atom.source_pointers) {
    if (!(pointer === allowedRoot || pointer.startsWith(`${allowedRoot}/`))) {
      return `${detail}: pointer outside slide root ${pointer}`;
    }
    const resolved = resolvePointer(normalized, pointer);
    if (resolved === undefined) return `${detail}: unresolved pointer ${pointer}`;
    if (typeof resolved === 'string') resolvedSources.push(resolved);
  }
  if (atom.derivation === 'verbatim' && !resolvedSources.some((source) => source === atom.text)) {
    return `${detail}: verbatim text is not an exact source value`;
  }
  if (
    atom.derivation === 'extractive' &&
    !resolvedSources.some((source) =>
      normalizeEditorialText(source).includes(normalizeEditorialText(atom.text)),
    )
  ) {
    return `${detail}: extractive text is not contained in its source`;
  }
  return null;
}

function editorialAtoms(synthesis: RuntimeEditorialSynthesis): Array<[string, EditorialAtom]> {
  const atoms: Array<[string, EditorialAtom]> = [['headline', synthesis.headline]];
  if (synthesis.dominant_fact) atoms.push(['dominant_fact', synthesis.dominant_fact]);
  synthesis.keywords.forEach((atom, index) => atoms.push([`keywords/${index}`, atom]));
  synthesis.contrast_pairs.forEach((pair, index) => {
    atoms.push([`contrast_pairs/${index}/left`, pair.left]);
    atoms.push([`contrast_pairs/${index}/right`, pair.right]);
  });
  if (synthesis.warning) atoms.push(['warning', synthesis.warning]);
  if (synthesis.mnemonic) atoms.push(['mnemonic', synthesis.mnemonic]);
  synthesis.facts.forEach((fact, index) => {
    for (const key of ['label', 'value', 'unit', 'condition', 'opposition', 'exception'] as const) {
      const atom = fact[key];
      if (atom) atoms.push([`facts/${index}/${key}`, atom]);
    }
  });
  return atoms;
}

function findForbiddenRuntimeKey(value: unknown, path = ''): string | null {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findForbiddenRuntimeKey(value[index], `${path}/${index}`);
      if (found) return found;
    }
  } else if (isRecord(value)) {
    for (const [key, entry] of Object.entries(value)) {
      if (FORBIDDEN_RUNTIME_KEYS.has(key)) return `${path}/${key}`;
      const found = findForbiddenRuntimeKey(entry, `${path}/${key}`);
      if (found) return found;
    }
  }
  return null;
}

export function validateRuntimePlan(
  plan: RuntimePlan,
  normalized: NormalizedQuestion,
  expectedContentHash: string,
  expectedProfileHash: string,
): ValidationResult {
  const failures: ValidationResult['failures'] = [];
  let resolvedBindings = 0;
  const fail = (code: ValidationResult['failures'][number]['code'], detail: string) =>
    failures.push({ code, detail });

  if (plan.schema_version !== RUNTIME_PLAN_SCHEMA_VERSION) fail('NV_SCHEMA_UNSUPPORTED', plan.schema_version);
  if (plan.content_hash !== expectedContentHash) fail('NV_CONTENT_HASH_MISMATCH', plan.content_hash);
  if (plan.profile_hash !== expectedProfileHash) fail('NV_PROFILE_HASH_MISMATCH', plan.profile_hash);
  if (plan.catalog_version !== CATALOG_VERSION) fail('NV_CATALOG_UNSUPPORTED', plan.catalog_version);
  if (plan.renderer_contract_version !== RENDERER_CONTRACT_VERSION) {
    fail('NV_RENDERER_UNSUPPORTED', plan.renderer_contract_version);
  }
  const forbidden = findForbiddenRuntimeKey(plan);
  if (forbidden) fail('NV_SCHEMA_UNSUPPORTED', `Forbidden runtime field ${forbidden}`);
  if (plan.slides.length !== 4) fail('NV_SCHEMA_UNSUPPORTED', 'Expected four slides');

  for (let index = 0; index < plan.slides.length; index += 1) {
    const slide = plan.slides[index];
    const expectedType = CANONICAL_SLIDE_TYPES[index];
    if (slide.slide_type !== expectedType) {
      fail('NV_SCHEMA_UNSUPPORTED', `Slide ${index} must be ${expectedType}`);
      continue;
    }
    if (!hasComposition(slide.composition_id, slide.slide_type)) {
      fail('NV_CAPABILITY_MISSING', slide.composition_id);
    }
    if (slide.editorial_synthesis) {
      const synthesis = slide.editorial_synthesis;
      if (
        plan.editorial_contract_version !== EDITORIAL_SYNTHESIS_SCHEMA_VERSION ||
        synthesis.schema_version !== EDITORIAL_SYNTHESIS_SCHEMA_VERSION ||
        synthesis.slide_type !== slide.slide_type ||
        synthesis.facts.length < 1 ||
        synthesis.facts.length > 7 ||
        synthesis.art_direction.primitive_sequence.length < 1 ||
        synthesis.art_direction.primitive_sequence.some(
          (primitive) => !(EDITORIAL_PRIMITIVES as readonly string[]).includes(primitive),
        )
      ) {
        fail('NV_EDITORIAL_SYNTHESIS_INVALID', `${slide.slide_type}: malformed synthesis`);
      }
      const root = SLIDE_ROOTS[slide.slide_type];
      for (const [atomPath, atom] of editorialAtoms(synthesis)) {
        const violation = validateEditorialAtom(
          atom,
          normalized,
          root,
          `${slide.slide_type}/${atomPath}`,
        );
        if (violation) fail('NV_EDITORIAL_SYNTHESIS_INVALID', violation);
      }
    }
    if (
      slide.interaction_policy !== 'static_complete' ||
      slide.internal_action_count !== 0 ||
      slide.initial_state !== 'fully_revealed' ||
      slide.hidden_content !== false ||
      slide.player_navigation_only !== true ||
      slide.spoiler_policy !== 'fully_revealed'
    ) {
      fail('NV_INTERACTION_POLICY_VIOLATION', `${slide.slide_type}: static-complete contract`);
    }
    const interactionViolation = findInteractionViolation(slide);
    if (interactionViolation) {
      fail('NV_INTERACTION_POLICY_VIOLATION', `${slide.slide_type}:${interactionViolation}`);
    }
    for (const slot of slide.slot_bindings) {
      if (!(TRANSFORMS as readonly string[]).includes(slot.transform)) {
        fail('NV_BINDING_INVALID', `${slot.slot_id}: transform ${slot.transform}`);
      }
      const root = SLIDE_ROOTS[slide.slide_type];
      if (!(slot.source_pointer === root || slot.source_pointer.startsWith(`${root}/`))) {
        fail('NV_BINDING_INVALID', `${slot.slot_id}: root ${slot.source_pointer}`);
      }
      const resolved = resolvePointer(normalized, slot.source_pointer);
      if (resolved === undefined) fail('NV_BINDING_INVALID', `${slot.slot_id}: unresolved pointer`);
      else resolvedBindings += 1;

      const exposesCorrect = slot.source_pointer.endsWith('/correct') || slot.fields?.includes('correct');
      const spoilerAllowed =
        slide.slide_type === 'danger_zone' &&
        slide.spoiler_policy === 'fully_revealed' &&
        slot.role === 'correction';
      if (exposesCorrect && !spoilerAllowed) {
        fail('NV_SPOILER_POLICY_VIOLATION', `${slide.slide_type}:${slot.slot_id}`);
      }
    }
  }
  return { valid: failures.length === 0, failures, resolved_bindings: resolvedBindings };
}

export function rankCandidates(dominant: Gesture): Array<{
  gesture_id: Gesture;
  score: number;
  rationale: string;
}> {
  const fallbackOrder: Gesture[] = ['focus', 'rail', 'compare', 'deck', 'critical_number', 'isolate', 'funnel', 'chip_body'];
  return [dominant, ...fallbackOrder.filter((gesture) => gesture !== dominant)]
    .slice(0, 3)
    .map((gesture, index) => ({
      gesture_id: gesture,
      score: 100 - index * 15,
      rationale: index === 0 ? 'Matches the effective dominant gesture.' : 'Allowlisted fallback candidate for shadow comparison.',
    }));
}

export function buildAuthoringSidecar(input: {
  member: CohortMember;
  contentHash: string;
  profile: NeuroSemanticProfile;
  decisions: Record<keyof ProfileFields, EffectiveField>;
  runtimePlan: RuntimePlan;
  validation: ValidationResult;
  legacyBaseline: Array<{ slide_type: SlideType; layout_variant: string }>;
  editorialSynthesis?: EditorialSynthesisAuthoring;
}): Record<string, unknown> {
  const candidates = rankCandidates(input.profile.effective.dominant_gesture);
  return {
    schema_version: SIDECAR_SCHEMA_VERSION,
    revision: 1,
    state: input.validation.valid ? 'shadow_valid' : 'analyzed',
    question_slug: input.member.question_slug,
    cohort_id: COHORT_ID,
    source_path: input.member.source_path,
    projection_version: CONTENT_PROJECTION_VERSION,
    content_hash: input.contentHash,
    profile_hash: input.profile.profile_hash,
    semantic_profile: input.profile,
    ...(input.editorialSynthesis
      ? { editorial_synthesis_authoring: input.editorialSynthesis }
      : {}),
    decisions: input.decisions,
    versions: {
      analyzer: ANALYZER_VERSION,
      planner: PLANNER_VERSION,
      compiler: COMPILER_VERSION,
      catalog: CATALOG_VERSION,
      renderer_contract: RENDERER_CONTRACT_VERSION,
    },
    candidates,
    decision_trace: [
      { step: 'cohort_membership', result: 'explicit_path_match', source_path: input.member.source_path },
      { step: 'content_projection', result: 'normalized_v2', content_hash: input.contentHash },
      { step: 'semantic_analysis', result: 'explicit_seed_plus_preserved_overrides' },
      { step: 'candidate_ranking', result: candidates.map((candidate) => candidate.gesture_id) },
      {
        step: 'four_slide_composition',
        result: input.runtimePlan.slides.map((slide) => ({
          slide_type: slide.slide_type,
          composition_id: slide.composition_id,
        })),
      },
      { step: 'plan_compilation', result: input.runtimePlan.plan_id },
      { step: 'technical_validation', result: input.validation.valid ? 'pass' : 'fail' },
      { step: 'rollout', result: 'off_not_created' },
    ],
    constraints: {
      atomic_question: true,
      runtime_integration: false,
      rollout: 'off',
      cohort_expansion: false,
      external_assets: false,
      new_gestures: false,
    },
    catalog_capabilities: SHADOW_CATALOG.compositions,
    runtime_plan_candidate: input.runtimePlan,
    validation: input.validation,
    legacy_baseline: input.legacyBaseline,
    reviews: {
      pedagogical: { decision: 'pending', reviewer_id: null },
      visual: { decision: 'pending', reviewer_id: null },
      technical: { decision: input.validation.valid ? 'pass' : 'fail', reviewer_id: null },
    },
    evidence_refs: [],
  };
}

export function simulateAtomicSelection(validation: ValidationResult): {
  renderer: 'legacy';
  result: 'legacy_rollout_off' | 'legacy_plan_invalid';
  attempted_v1: false;
} {
  return {
    renderer: 'legacy',
    result: validation.valid ? 'legacy_rollout_off' : 'legacy_plan_invalid',
    attempted_v1: false,
  };
}

export function assertManifestScope(manifest: {
  cohort_id: string;
  discovery: string;
  expected_members: number;
  members: CohortMember[];
  rollout: string;
}): void {
  if (manifest.cohort_id !== COHORT_ID) throw new Error('Unexpected cohort_id');
  if (manifest.discovery !== 'explicit_paths_only') throw new Error('Fuzzy cohort discovery is forbidden');
  if (manifest.expected_members !== 6 || manifest.members.length !== 6) throw new Error('Pilot cohort must contain exactly six anchors');
  if (manifest.rollout !== 'off') throw new Error('Shadow rollout must remain off');
  const paths = new Set(manifest.members.map((member) => member.source_path));
  if (paths.size !== 6) throw new Error('Pilot source paths must be unique');
  for (const member of manifest.members) {
    if (!(GESTURES as readonly string[]).includes(member.semantic_seed.dominant_gesture)) {
      throw new Error(`Unknown gesture for ${member.question_slug}`);
    }
  }
}
