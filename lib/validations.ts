/**
 * Schemas de Validação Zod para APIs e Inputs
 */

import { z } from 'zod';
import * as LucideIcons from 'lucide-react';

// ============================================================================
// CONSTANTES E HELPERS
// ============================================================================

// Lista de ícones Lucide válidos (lucide-react exporta como function ou object)
const LUCIDE_ICONS = Object.keys(LucideIcons).filter(
  (key) => {
    const val = LucideIcons[key as keyof typeof LucideIcons];
    return (
      (typeof val === 'function' || (typeof val === 'object' && val !== null)) &&
      !['createLucideIcon', 'default', 'icons', 'Icon'].includes(key)
    );
  }
) as string[];

// Limites de tamanho
const LIMITS = {
  INSTRUCTION_MAX: 2000,
  TEXT_FRAGMENT_MAX: 5000,
  CONTENT_MAX: 1000,
  FOOTER_RULE_MAX: 500,
  LABEL_MAX: 200,
  DETAIL_MAX: 500,
  STEP_MAX: 500,
  SUBJECT_MAX: 100,
  TOPICO_MAX: 200,
  BANCA_MAX: 50,
  ORGAO_MAX: 200,
  PROVA_MAX: 200,
} as const;

// Tags HTML permitidas em text_fragment
const ALLOWED_HTML_TAGS = ['p', 'strong', 'em', 'u', 'br', 'span', 'div', 'ul', 'ol', 'li'];

// ============================================================================
// VALIDADORES CUSTOMIZADOS
// ============================================================================

/**
 * Valida se o ícone é um ícone Lucide válido
 */
const lucideIconValidator = z.string().refine(
  (icon) => !icon || LUCIDE_ICONS.includes(icon),
  { message: `Ícone deve ser um ícone Lucide válido. Ícones disponíveis: ${LUCIDE_ICONS.slice(0, 20).join(', ')}...` }
);

/**
 * Sanitiza HTML removendo tags não permitidas
 */
const sanitizeHTML = (html: string): string => {
  if (!html) return html;
  
  // Remove scripts e eventos perigosos
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
  
  // Remove tags não permitidas (mantém apenas as permitidas)
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  sanitized = sanitized.replace(tagRegex, (match, tag) => {
    if (ALLOWED_HTML_TAGS.includes(tag.toLowerCase())) {
      return match;
    }
    return '';
  });
  
  return sanitized;
};

/**
 * Valida e sanitiza HTML
 * IMPORTANTE: Aplique .max() ANTES do .transform()
 * Exemplo: z.string().max(100).transform(sanitizeHTML)
 */
const htmlValidator = z.string().transform((val) => {
  if (!val) return val;
  return sanitizeHTML(val);
});

// Schema para Fluxograma API
export const FluxogramaSchema = z.object({
  title: z.string().min(1).max(200),
  modulo_id: z.string().uuid('ID do módulo deve ser um UUID válido'),
  content: z.record(z.any()).optional(),
  conteudo_json: z.record(z.any()).optional(),
  flow_title: z.string().optional(),
});

// Schema para Questão JSON (Laboratório) - COM LIMITES DE TAMANHO
export const QuestaoMetaSchema = z.object({
  ano: z.string().max(10, 'Ano deve ter no máximo 10 caracteres').optional(),
  banca: z.string().min(1, 'Banca é obrigatória').max(LIMITS.BANCA_MAX, `Banca deve ter no máximo ${LIMITS.BANCA_MAX} caracteres`),
  orgao: z.string().max(LIMITS.ORGAO_MAX, `Órgão deve ter no máximo ${LIMITS.ORGAO_MAX} caracteres`).optional(),
  prova: z.string().max(LIMITS.PROVA_MAX, `Prova deve ter no máximo ${LIMITS.PROVA_MAX} caracteres`).optional(),
  topico: z.string().min(1, 'Tópico é obrigatório').max(LIMITS.TOPICO_MAX, `Tópico deve ter no máximo ${LIMITS.TOPICO_MAX} caracteres`),
  subtopico: z.string().max(LIMITS.TOPICO_MAX, `Subtópico deve ter no máximo ${LIMITS.TOPICO_MAX} caracteres`).optional(),
});

export const QuestaoOptionSchema = z.object({
  id: z.string().min(1).max(10, 'ID da alternativa deve ter no máximo 10 caracteres'),
  text: z.string().min(1).max(1000, 'Texto da alternativa deve ter no máximo 1000 caracteres'),
  is_correct: z.boolean(),
});

export const QuestaoDataSchema = z.object({
  instruction: z.string()
    .min(1, 'Instrução é obrigatória')
    .max(LIMITS.INSTRUCTION_MAX, `Instrução deve ter no máximo ${LIMITS.INSTRUCTION_MAX} caracteres`),
  text_fragment: z.string()
    .max(LIMITS.TEXT_FRAGMENT_MAX, `Fragmento de texto deve ter no máximo ${LIMITS.TEXT_FRAGMENT_MAX} caracteres`)
    .transform((val) => {
      if (!val) return val;
      return sanitizeHTML(val);
    })
    .nullable()
    .optional(),
  options: z.array(QuestaoOptionSchema).min(1, 'Deve ter pelo menos uma alternativa').max(10, 'Máximo de 10 alternativas'),
});

// ============================================================================
// SCHEMAS PARA REVERSE STUDY SLIDES (Formato Semântico)
// ============================================================================

// Schema para SlideItem (usado em concept_map e danger_zone) - COM VALIDAÇÕES AVANÇADAS
export const SlideItemSchema = z.object({
  id: z.string().max(50, 'ID deve ter no máximo 50 caracteres').optional(),
  label: z.string()
    .min(1, 'Label é obrigatório')
    .max(LIMITS.LABEL_MAX, `Label deve ter no máximo ${LIMITS.LABEL_MAX} caracteres`),
  title: z.string().max(LIMITS.LABEL_MAX, `Title deve ter no máximo ${LIMITS.LABEL_MAX} caracteres`).optional(),
  detail: z.string().max(LIMITS.DETAIL_MAX, `Detail deve ter no máximo ${LIMITS.DETAIL_MAX} caracteres`).optional(),
  description: z.string().max(LIMITS.DETAIL_MAX, `Description deve ter no máximo ${LIMITS.DETAIL_MAX} caracteres`).optional(),
  icon: lucideIconValidator.optional(),
  color: z.string().max(50, 'Color deve ter no máximo 50 caracteres').optional(),
});

// Schema para Meta de Slide - COM LIMITES
export const SlideMetaSchema = z.object({
  topico: z.string().max(LIMITS.TOPICO_MAX, `Tópico deve ter no máximo ${LIMITS.TOPICO_MAX} caracteres`).optional(),
  subtopico: z.string().max(LIMITS.TOPICO_MAX, `Subtópico deve ter no máximo ${LIMITS.TOPICO_MAX} caracteres`).optional(),
}).passthrough(); // Permite campos extras

// Schema para Concept Map Slide - COM VALIDAÇÕES AVANÇADAS
export const ConceptMapSlideSchema = z.object({
  type: z.literal('concept_map'),
  subject: z.string().max(LIMITS.SUBJECT_MAX, `Subject deve ter no máximo ${LIMITS.SUBJECT_MAX} caracteres`).optional(),
  template: z.string().max(20, 'Template ID (ex: t01-t15)').optional(),
  theme_id: z.string().max(20, 'Alias de template').optional(),
  meta: SlideMetaSchema.optional(),
  items: z.array(SlideItemSchema)
    .min(1, 'Concept map deve ter pelo menos 1 item')
    .max(20, 'Concept map deve ter no máximo 20 items'),
  concepts: z.array(z.object({
    icon: lucideIconValidator,
    title: z.string().max(LIMITS.LABEL_MAX, `Title deve ter no máximo ${LIMITS.LABEL_MAX} caracteres`),
    description: z.string().max(LIMITS.DETAIL_MAX, `Description deve ter no máximo ${LIMITS.DETAIL_MAX} caracteres`),
  })).max(20, 'Concepts deve ter no máximo 20 itens').optional(),
  footer_rule: z.string().max(LIMITS.FOOTER_RULE_MAX, `Footer rule deve ter no máximo ${LIMITS.FOOTER_RULE_MAX} caracteres`).optional(),
  // Campos de compatibilidade (DEPRECATED)
  layout_type: z.literal('concept_map').optional(),
  layout_variant: z.string().optional(),
  structure: z.any().optional(),
  design_system: z.any().optional(),
});

// Schema para Logic Flow Slide - COM VALIDAÇÕES AVANÇADAS
export const LogicFlowSlideSchema = z.object({
  type: z.literal('logic_flow'),
  subject: z.string().max(LIMITS.SUBJECT_MAX, `Subject deve ter no máximo ${LIMITS.SUBJECT_MAX} caracteres`).optional(),
  template: z.string().max(20, 'Template ID (ex: t01-t15)').optional(),
  theme_id: z.string().max(20, 'Alias de template').optional(),
  meta: SlideMetaSchema.optional(),
  steps: z.array(
    z.string()
      .min(1, 'Step não pode ser vazio')
      .max(LIMITS.STEP_MAX, `Step deve ter no máximo ${LIMITS.STEP_MAX} caracteres`)
  )
    .min(1, 'Logic flow deve ter pelo menos 1 passo')
    .max(15, 'Logic flow deve ter no máximo 15 passos'),
  footer_rule: z.string().max(LIMITS.FOOTER_RULE_MAX, `Footer rule deve ter no máximo ${LIMITS.FOOTER_RULE_MAX} caracteres`).optional(),
  // Campos de compatibilidade (DEPRECATED)
  layout_type: z.literal('logic_flow').optional(),
  layout_variant: z.string().optional(),
  structure: z.any().optional(),
  design_system: z.any().optional(),
});

// Schema para Golden Rule Slide - COM VALIDAÇÕES AVANÇADAS
export const GoldenRuleSlideSchema = z.object({
  type: z.literal('golden_rule'),
  subject: z.string().max(LIMITS.SUBJECT_MAX, `Subject deve ter no máximo ${LIMITS.SUBJECT_MAX} caracteres`).optional(),
  template: z.string().max(20, 'Template ID (ex: t01-t15)').optional(),
  theme_id: z.string().max(20, 'Alias de template').optional(),
  meta: SlideMetaSchema.optional(),
  content: z.string()
    .min(1, 'Content é obrigatório para golden_rule')
    .max(LIMITS.CONTENT_MAX, `Content deve ter no máximo ${LIMITS.CONTENT_MAX} caracteres`),
  footer_rule: z.string().max(LIMITS.FOOTER_RULE_MAX, `Footer rule deve ter no máximo ${LIMITS.FOOTER_RULE_MAX} caracteres`).optional(),
  // Campos de compatibilidade (DEPRECATED)
  layout_type: z.literal('golden_rule').optional(),
  layout_variant: z.string().optional(),
  structure: z.any().optional(),
  design_system: z.any().optional(),
});

// Schema para Danger Zone Slide - COM VALIDAÇÕES AVANÇADAS
export const DangerZoneSlideSchema = z.object({
  type: z.literal('danger_zone'),
  subject: z.string().max(LIMITS.SUBJECT_MAX, `Subject deve ter no máximo ${LIMITS.SUBJECT_MAX} caracteres`).optional(),
  template: z.string().max(20, 'Template ID (ex: t01-t15)').optional(),
  theme_id: z.string().max(20, 'Alias de template').optional(),
  meta: SlideMetaSchema.optional(),
  content: z.string()
    .min(1, 'Content é obrigatório para danger_zone')
    .max(LIMITS.CONTENT_MAX, `Content deve ter no máximo ${LIMITS.CONTENT_MAX} caracteres`),
  items: z.array(SlideItemSchema).max(10, 'Danger zone deve ter no máximo 10 items').optional(),
  footer_rule: z.string().max(LIMITS.FOOTER_RULE_MAX, `Footer rule deve ter no máximo ${LIMITS.FOOTER_RULE_MAX} caracteres`).optional(),
  // Campos de compatibilidade (DEPRECATED)
  layout_type: z.literal('danger_zone').optional(),
  layout_variant: z.string().optional(),
  structure: z.any().optional(),
  design_system: z.any().optional(),
});

// Schema para Syllable Scanner Slide - COM VALIDAÇÕES AVANÇADAS
export const SyllableScannerSlideSchema = z.object({
  type: z.literal('syllable_scanner'),
  subject: z.string().max(LIMITS.SUBJECT_MAX, `Subject deve ter no máximo ${LIMITS.SUBJECT_MAX} caracteres`).optional(),
  template: z.string().max(20, 'Template ID (ex: t01-t15)').optional(),
  theme_id: z.string().max(20, 'Alias de template').optional(),
  meta: SlideMetaSchema.optional(),
  word: z.string()
    .min(1, 'Word é obrigatório para syllable_scanner')
    .max(100, 'Word deve ter no máximo 100 caracteres'),
  tonicIndex: z.number().int().min(0).max(100).optional(),
  rule: z.string().max(LIMITS.FOOTER_RULE_MAX, `Rule deve ter no máximo ${LIMITS.FOOTER_RULE_MAX} caracteres`).optional(),
  footer_rule: z.string().max(LIMITS.FOOTER_RULE_MAX, `Footer rule deve ter no máximo ${LIMITS.FOOTER_RULE_MAX} caracteres`).optional(),
  // Campos de compatibilidade (DEPRECATED)
  layout_type: z.literal('syllable_scanner').optional(),
  layout_variant: z.string().optional(),
  structure: z.any().optional(),
  design_system: z.any().optional(),
});

// Schema para Versus Arena Slide - COM VALIDAÇÕES AVANÇADAS
export const VersusArenaSlideSchema = z.object({
  type: z.literal('versus_arena'),
  subject: z.string().max(LIMITS.SUBJECT_MAX, `Subject deve ter no máximo ${LIMITS.SUBJECT_MAX} caracteres`).optional(),
  template: z.string().max(20, 'Template ID (ex: t01-t15)').optional(),
  theme_id: z.string().max(20, 'Alias de template').optional(),
  meta: SlideMetaSchema.optional(),
  concept_a: z.string()
    .min(1, 'concept_a é obrigatório para versus_arena')
    .max(LIMITS.LABEL_MAX, `Concept A deve ter no máximo ${LIMITS.LABEL_MAX} caracteres`),
  concept_b: z.string()
    .min(1, 'concept_b é obrigatório para versus_arena')
    .max(LIMITS.LABEL_MAX, `Concept B deve ter no máximo ${LIMITS.LABEL_MAX} caracteres`),
  footer_rule: z.string().max(LIMITS.FOOTER_RULE_MAX, `Footer rule deve ter no máximo ${LIMITS.FOOTER_RULE_MAX} caracteres`).optional(),
  // Campos de compatibilidade (DEPRECATED)
  layout_type: z.literal('versus_arena').optional(),
  layout_variant: z.string().optional(),
  structure: z.any().optional(),
  design_system: z.any().optional(),
});

// Discriminated Union para ReverseStudySlide (Formato Semântico)
export const ReverseStudySlideSchema = z.discriminatedUnion('type', [
  ConceptMapSlideSchema,
  LogicFlowSlideSchema,
  GoldenRuleSlideSchema,
  DangerZoneSlideSchema,
  SyllableScannerSlideSchema,
  VersusArenaSlideSchema,
]);

// Schema para formato antigo (compatibilidade)
export const LegacyReverseStudySlideSchema = z.object({
  layout_type: z.enum(['concept_map', 'danger_zone', 'logic_flow', 'golden_rule', 'syllable_scanner', 'versus_arena']).optional(),
  structure: z.object({
    header: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
    }),
    items: z.array(z.any()).optional(),
    steps: z.array(z.string()).optional(),
    main_text: z.string().optional(),
    footer_rule: z.string().optional(),
  }).optional(),
  design_system: z.object({
    glow_color: z.enum(['cyan', 'orange', 'fuchsia', 'lime', 'red']).optional(),
    background_gradient: z.string().optional(),
    accent_color: z.string().optional(),
  }).optional(),
  subject: z.string().optional(),
  meta: SlideMetaSchema.optional(),
}).passthrough();

// Schema combinado (aceita formato novo e antigo)
export const FlexibleReverseStudySlideSchema = z.union([
  ReverseStudySlideSchema,
  LegacyReverseStudySlideSchema,
]);

export const QuestaoCompletaSchema = z.object({
  id: z.string().optional(),
  meta: QuestaoMetaSchema,
  question_data: QuestaoDataSchema,
  reverse_study_slides: z.array(FlexibleReverseStudySlideSchema).optional(),
  study_slides: z.array(FlexibleReverseStudySlideSchema).optional(),
});

// Schema para Enrollments API
export const EnrollmentDeleteSchema = z.object({
  enrollmentId: z.string().uuid('ID da matrícula deve ser um UUID válido'),
});

// Schema para Resolve User API
export const ResolveUserSchema = z.object({
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
});

// ============================================================================
// EXPORTS DE CONSTANTES E HELPERS
// ============================================================================

export { LIMITS, LUCIDE_ICONS, ALLOWED_HTML_TAGS, sanitizeHTML };

// ============================================================================
// HELPER FUNCTIONS PARA VALIDAÇÃO
// ============================================================================

/**
 * Valida um slide individual e retorna resultado formatado
 */
export const validateSlide = (slide: unknown) => {
  return FlexibleReverseStudySlideSchema.safeParse(slide);
};

/**
 * Valida todos os slides de uma questão
 */
export const validateSlides = (slides: unknown[]) => {
  const results = slides.map((slide, index) => ({
    index,
    slide,
    result: FlexibleReverseStudySlideSchema.safeParse(slide),
  }));
  
  const errors = results
    .filter((r) => !r.result.success)
    .map((r) => ({
      index: r.index,
      errors: r.result.error?.issues || [],
    }));
  
  return {
    valid: errors.length === 0,
    errors,
    results,
  };
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type FluxogramaInput = z.infer<typeof FluxogramaSchema>;
export type QuestaoCompletaInput = z.infer<typeof QuestaoCompletaSchema>;
export type EnrollmentDeleteInput = z.infer<typeof EnrollmentDeleteSchema>;
export type ResolveUserInput = z.infer<typeof ResolveUserSchema>;
export type ReverseStudySlideInput = z.infer<typeof ReverseStudySlideSchema>;
export type SlideItemInput = z.infer<typeof SlideItemSchema>;
export type SlideMetaInput = z.infer<typeof SlideMetaSchema>;