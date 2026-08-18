/**
 * Schema versionado para hash semântico de deduplicação NeuroCanvas.
 * Incrementar `DEDUPE_SCHEMA_VERSION` quando o payload canônico mudar.
 */
export const DEDUPE_SCHEMA_VERSION = 1;

export type DedupeSchemaSpec = {
  dedupe_schema_version: number;
  algorithm: string;
  fields_included: string[];
  fields_removed: string[];
  normalization_applied: string[];
};

export const DEDUPE_SCHEMA: DedupeSchemaSpec = {
  dedupe_schema_version: DEDUPE_SCHEMA_VERSION,
  algorithm:
    'sha256_hex(utf8_bytes(canonical_json(normalizeQuestionForComparison(raw))))',
  fields_included: [
    'meta.banca',
    'meta.topico',
    'meta.subtopico',
    'meta.family',
    'meta.pedagogical_branch',
    'meta.content_standard',
    'question_data.instruction',
    'question_data.text_fragment',
    'question_data.options[].id',
    'question_data.options[].text',
    'question_data.options[].is_correct',
    'reverse_study_slides (ou study_slides → normalizado)',
  ],
  fields_removed: [
    'id',
    'meta.header_line',
    'meta.ano',
    'meta.orgao',
    'meta.prova',
    'meta.content_review',
    'meta.sources',
    'question_data.figures',
    'slide.template',
    'slide.layout_variant',
    'slide.theme_id',
    'slide.chip_label',
    'slide.slide_title',
    'slide.footer_rule',
    'slide.subject',
    'demais chaves meta/UI não listadas em fields_included',
  ],
  normalization_applied: [
    'JSON.parse do arquivo bruto',
    'reverse_study_slides ?? study_slides',
    'normalizeReverseStudySlide por slide',
    'sortReverseStudySlides (ordem canônica concept_map → logic_flow → golden_rule → danger_zone)',
    'options ordenadas por id lexicográfico',
    'canonicalJson (chaves lexicográficas recursivas + strings NFC)',
    'SHA-256 hex minúsculo',
  ],
};
