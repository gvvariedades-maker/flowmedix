export const COHORT_ID = 'saude-da-mulher-anchors-v1' as const;
export const CONTENT_PROJECTION_VERSION = 'neuro-content-projection-v1' as const;
export const PROFILE_PROJECTION_VERSION = 'neuro-profile-projection-v1' as const;
export const PROFILE_SCHEMA_VERSION = 'neuro-semantic-profile-v1' as const;
export const SIDECAR_SCHEMA_VERSION = 'neuro-visual-authoring-sidecar-v1' as const;
export const RUNTIME_PLAN_SCHEMA_VERSION = 'neuro-visual-runtime-plan-v1' as const;
export const CATALOG_VERSION = 'neurovisual-catalog-v1' as const;
export const RENDERER_CONTRACT_VERSION = 'neurovisual-shadow-preview-v1' as const;
export const ANALYZER_VERSION = 'neurovisual-explicit-seed-analyzer-v1' as const;
export const PLANNER_VERSION = 'neurovisual-deterministic-planner-v1' as const;
export const COMPILER_VERSION = 'neurovisual-shadow-compiler-v1' as const;
export const EDITORIAL_SYNTHESIS_SCHEMA_VERSION = 'neuro-editorial-synthesis-v1' as const;

export const CANONICAL_SLIDE_TYPES = [
  'concept_map',
  'logic_flow',
  'golden_rule',
  'danger_zone',
] as const;

export const GESTURES = [
  'isolate',
  'compare',
  'deck',
  'chip_body',
  'rail',
  'funnel',
  'critical_number',
  'focus',
] as const;

export const TRANSFORMS = [
  'identity@1',
  'array_items@1',
  'object_fields@1',
  'collect_ordered@1',
] as const;

export const EDITORIAL_PRIMITIVES = [
  'EditorialCanvas',
  'HeadlineLockup',
  'KeywordRibbon',
  'NumberHero',
  'ContrastPair',
  'WrongRightLockup',
  'ArrowPath',
  'TimelineSpine',
  'CentralConceptOrbit',
  'MnemonicStrip',
  'IconFact',
  'EditorialSticker',
  'DecisionFunnel',
  'EditorialDeck',
] as const;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type SlideType = (typeof CANONICAL_SLIDE_TYPES)[number];
export type Gesture = (typeof GESTURES)[number];
export type Transform = (typeof TRANSFORMS)[number];
export type EditorialPrimitive = (typeof EDITORIAL_PRIMITIVES)[number];

export type SemanticSeed = {
  learning_intent: { dominant: string; secondary: string[] };
  spatial_error: string;
  dominant_gesture: Gesture;
  spoiler_timing: 'initial_complete';
  critical_numbers: string[];
  four_slide_strategy: { mode: 'continuity' | 'contrast' | 'progression'; metaphor: string };
  relations: string[];
  axes: string[];
  poles: string[];
  ordering: string;
  interaction_need: 'none';
};

export type CohortMember = {
  question_slug: string;
  source_path: string;
  pedagogical_branch: string;
  semantic_seed: SemanticSeed;
};

export type CohortManifest = {
  schema_version: 'neurovisual-cohort-manifest-v1';
  cohort_id: typeof COHORT_ID;
  status: 'frozen';
  discovery: 'explicit_paths_only';
  expected_members: 6;
  members: CohortMember[];
  excluded_universes: ['historical_manifest_246', 'live_filter_268', 'intersection_244'];
  rollout: 'off';
};

export type QuestionPayload = {
  meta?: Record<string, unknown>;
  question_data?: Record<string, unknown>;
  reverse_study_slides?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type NormalizedQuestion = {
  question_slug: string;
  meta: {
    family: JsonValue;
    subtopico: JsonValue;
    pedagogical_branch: JsonValue;
    content_standard: JsonValue;
  };
  question_data: Record<string, JsonValue>;
  reverse_study_slides: Array<Record<string, JsonValue>>;
};

export type EffectiveField<T extends JsonValue = JsonValue> = {
  suggested_value: T;
  effective_value: T;
  decision_source: 'deterministic' | 'human_override';
  precedence: 'deterministic' | 'human_override';
  reason: string;
  author_id: string | null;
  reviewer_id: string | null;
  revision: number;
  decided_at: string | null;
};

export type ProfileFields = {
  family: string;
  subtopic: string;
  pedagogical_branch: string;
  learning_intent: SemanticSeed['learning_intent'];
  spatial_error: string;
  dominant_gesture: Gesture;
  spoiler_timing: 'initial_complete';
  critical_numbers: string[];
  four_slide_strategy: SemanticSeed['four_slide_strategy'];
  relations: string[];
  axes: string[];
  poles: string[];
  ordering: string;
  interaction_need: 'none';
};

export type NeuroSemanticProfile = {
  schema_version: typeof PROFILE_SCHEMA_VERSION;
  projection_version: typeof PROFILE_PROJECTION_VERSION;
  question_slug: string;
  cohort_id: typeof COHORT_ID;
  content_hash: string;
  profile_hash: string;
  analyzer_version: typeof ANALYZER_VERSION;
  source_mode: 'deterministic' | 'hybrid';
  effective: ProfileFields;
  decision_source: Record<keyof ProfileFields, 'deterministic' | 'human_override'>;
};

export type SlotBinding = {
  slot_id: string;
  source_pointer: string;
  transform: Transform;
  role: 'title' | 'body' | 'items' | 'steps' | 'rows' | 'footer' | 'correction';
  fields?: string[];
};

export type EditorialDerivation = 'verbatim' | 'extractive' | 'manual_source_backed';

export type EditorialAtom = {
  text: string;
  source_pointers: string[];
  derivation: EditorialDerivation;
};

export type EditorialAtomicFact = {
  fact_id: string;
  label: EditorialAtom;
  value?: EditorialAtom;
  unit?: EditorialAtom;
  condition?: EditorialAtom;
  opposition?: EditorialAtom;
  exception?: EditorialAtom;
  tone: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  icon_id?:
    | 'prenatal'
    | 'calendar'
    | 'folic_pill'
    | 'consultation'
    | 'no_smoking'
    | 'check_cross'
    | 'water_relief'
    | 'companion'
    | 'mobility'
    | 'cord_clamp'
    | 'fetal_monitor';
};

export type EditorialContrastPair = {
  pair_id: string;
  left: EditorialAtom;
  right: EditorialAtom;
  relation: 'preferred_over' | 'corrects' | 'excludes' | 'contrasts';
};

export type RuntimeEditorialSynthesis = {
  schema_version: typeof EDITORIAL_SYNTHESIS_SCHEMA_VERSION;
  slide_type: SlideType;
  headline: EditorialAtom;
  dominant_fact?: EditorialAtom;
  keywords: EditorialAtom[];
  contrast_pairs: EditorialContrastPair[];
  warning?: EditorialAtom;
  mnemonic?: EditorialAtom;
  facts: EditorialAtomicFact[];
  art_direction: {
    hero_role: 'headline' | 'dominant_fact' | 'contrast';
    direction:
      | 'horizontal'
      | 'vertical'
      | 'radial'
      | 'convergent'
      | 'filtering'
      | 'equivalent_units'
      | 'paired_rows_compact';
    density: 'airy' | 'balanced' | 'dense';
    primitive_sequence: EditorialPrimitive[];
  };
};

export type EditorialSynthesisAuthoring = {
  schema_version: typeof EDITORIAL_SYNTHESIS_SCHEMA_VERSION;
  question_slug: string;
  state: 'review_pending';
  revision: number;
  reviewer_id: null;
  synthesis_method: 'manual_source_backed';
  runtime_projection: RuntimeEditorialSynthesis[];
};

export type RuntimePlanSlide = {
  slide_type: SlideType;
  composition_id: string;
  slot_bindings: SlotBinding[];
  semantic_color_roles: Array<'success' | 'danger' | 'warning' | 'info' | 'neutral'>;
  spoiler_policy: 'fully_revealed';
  interaction_policy: 'static_complete';
  internal_action_count: 0;
  initial_state: 'fully_revealed';
  hidden_content: false;
  player_navigation_only: true;
  responsive_policy: 'stack_preserve_order';
  accessibility_policy: 'semantic_groups';
  motion_policy: 'content_complete_without_motion';
  editorial_synthesis?: RuntimeEditorialSynthesis;
};

export type RuntimePlan = {
  schema_version: typeof RUNTIME_PLAN_SCHEMA_VERSION;
  plan_id: string;
  question_slug: string;
  content_hash: string;
  profile_hash: string;
  catalog_version: typeof CATALOG_VERSION;
  renderer_contract_version: typeof RENDERER_CONTRACT_VERSION;
  editorial_contract_version?: typeof EDITORIAL_SYNTHESIS_SCHEMA_VERSION;
  slides: RuntimePlanSlide[];
};

export type ValidationFailureCode =
  | 'NV_SCHEMA_UNSUPPORTED'
  | 'NV_CONTENT_HASH_MISMATCH'
  | 'NV_PROFILE_HASH_MISMATCH'
  | 'NV_CATALOG_UNSUPPORTED'
  | 'NV_RENDERER_UNSUPPORTED'
  | 'NV_BINDING_INVALID'
  | 'NV_SPOILER_POLICY_VIOLATION'
  | 'NV_INTERACTION_POLICY_VIOLATION'
  | 'NV_EDITORIAL_SYNTHESIS_INVALID'
  | 'NV_CAPABILITY_MISSING';

export type ValidationResult = {
  valid: boolean;
  failures: Array<{ code: ValidationFailureCode; detail: string }>;
  resolved_bindings: number;
};
