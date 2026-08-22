import {
  CANONICAL_SLIDE_TYPES,
  CONTENT_PROJECTION_VERSION,
  PROFILE_SCHEMA_VERSION,
  type JsonValue,
  type NeuroSemanticProfile,
  type NormalizedQuestion,
  type ProfileFields,
  type QuestionPayload,
  type SlideType,
} from './model';

const META_FIELDS = ['family', 'subtopico', 'pedagogical_branch', 'content_standard'] as const;
const QUESTION_FIELDS = ['instruction', 'text_fragment', 'explanation'] as const;
const OPTION_FIELDS = ['id', 'label', 'text', 'is_correct', 'explanation'] as const;
const SLIDE_FIELDS = [
  'type',
  'slide_title',
  'chip',
  'content',
  'items',
  'concepts',
  'rows',
  'steps',
  'footer_rule',
  'reveal_mode',
  'bullet_style',
] as const;
const ITEM_FIELDS = [
  'label',
  'detail',
  'icon',
  'correct',
  'value',
  'emphasis',
  'badge',
  'sv_kind',
  'exam_hint',
  'fixation',
] as const;

function asJson(value: unknown, path: string): JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return value.map((entry, index) => asJson(entry, `${path}/${index}`));
  if (typeof value === 'object' && value !== null) {
    const projected: Record<string, JsonValue> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (entry !== undefined) projected[key] = asJson(entry, `${path}/${key}`);
    }
    return projected;
  }
  throw new Error(`Non-JSON value at ${path}`);
}

function pickRecord(
  source: Record<string, unknown>,
  fields: readonly string[],
  path: string,
): Record<string, JsonValue> {
  const result: Record<string, JsonValue> = {};
  for (const field of fields) {
    if (source[field] !== undefined) result[field] = asJson(source[field], `${path}/${field}`);
  }
  return result;
}

function projectStructuredList(value: unknown, path: string): JsonValue | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error(`Expected array at ${path}`);
  return value.map((entry, index) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      return asJson(entry, `${path}/${index}`);
    }
    return pickRecord(entry as Record<string, unknown>, ITEM_FIELDS, `${path}/${index}`);
  });
}

function normalizeSlide(slide: Record<string, unknown>, expectedType: SlideType): Record<string, JsonValue> {
  if (slide.type !== expectedType) throw new Error(`Expected slide ${expectedType}`);
  const projected = pickRecord(slide, SLIDE_FIELDS, `/reverse_study_slides/${expectedType}`);
  for (const field of ['items', 'concepts', 'rows'] as const) {
    const structured = projectStructuredList(slide[field], `/reverse_study_slides/${expectedType}/${field}`);
    if (structured !== undefined) projected[field] = structured;
  }
  if (slide.steps !== undefined) projected.steps = asJson(slide.steps, `/reverse_study_slides/${expectedType}/steps`);
  return projected;
}

export function buildContentProjection(
  questionSlug: string,
  payload: QuestionPayload,
): NormalizedQuestion & { projection_version: typeof CONTENT_PROJECTION_VERSION } {
  const slides = payload.reverse_study_slides;
  if (!Array.isArray(slides) || slides.length !== 4) {
    throw new Error('Question must contain exactly four reverse_study_slides');
  }

  const byType = new Map<string, Record<string, unknown>>();
  for (const slide of slides) {
    if (!slide || typeof slide !== 'object' || Array.isArray(slide) || typeof slide.type !== 'string') {
      throw new Error('Every slide must be an object with a type');
    }
    if (byType.has(slide.type)) throw new Error(`Duplicate slide type ${slide.type}`);
    byType.set(slide.type, slide);
  }

  const metaSource = payload.meta ?? {};
  const questionSource = payload.question_data ?? {};
  const questionData = pickRecord(questionSource, QUESTION_FIELDS, '/question_data');
  if (!Array.isArray(questionSource.options)) throw new Error('question_data.options must be an array');
  questionData.options = questionSource.options.map((option, index) => {
    if (!option || typeof option !== 'object' || Array.isArray(option)) {
      throw new Error(`Invalid option at /question_data/options/${index}`);
    }
    return pickRecord(option as Record<string, unknown>, OPTION_FIELDS, `/question_data/options/${index}`);
  });

  const meta = pickRecord(metaSource, META_FIELDS, '/meta');
  for (const field of META_FIELDS) {
    if (meta[field] === undefined) throw new Error(`Missing required meta.${field}`);
  }

  return {
    projection_version: CONTENT_PROJECTION_VERSION,
    question_slug: questionSlug,
    meta: meta as NormalizedQuestion['meta'],
    question_data: questionData,
    reverse_study_slides: CANONICAL_SLIDE_TYPES.map((type) => {
      const slide = byType.get(type);
      if (!slide) throw new Error(`Missing canonical slide ${type}`);
      return normalizeSlide(slide, type);
    }),
  };
}

export function buildProfileProjection(
  contentHash: string,
  effective: ProfileFields,
  decisionSource: NeuroSemanticProfile['decision_source'],
): JsonValue {
  return {
    schema_version: PROFILE_SCHEMA_VERSION,
    content_hash: contentHash,
    effective: asJson(effective, '/effective'),
    decision_source: asJson(decisionSource, '/decision_source'),
  };
}
