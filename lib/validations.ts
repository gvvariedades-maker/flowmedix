/**
 * Schemas de Validação Zod para APIs e Inputs
 */

import { z, ZodError } from 'zod';
import * as LucideIcons from 'lucide-react';
import { EmailTemplateContentSchema } from '@/lib/email/templateContent';
import { ONBOARDING_BANCAS, ONBOARDING_TOPIC_AREAS } from '@/lib/onboarding/constants';
import { normalizeQuestaoSlideArrays } from './reverseStudySlidesNormalize';
import { GOLDEN_CONTENT_STANDARD_VERSION } from './goldenContentStandard';
import {
  getAllowedQuestaoFigureHosts,
  hasUsefulFigureTranscription,
  QUESTAO_FIGURE_KINDS,
  QUESTAO_FIGURE_POLICIES,
} from './questaoFigures';

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
  HEADER_LINE_MAX: 500,
  CARGO_HEADER_MAX: 40,
  /** Override do chip no shell premium (Sprint 1). */
  CHIP_LABEL_MAX: 80,
  /** Título de capa abaixo do chip (Sprint 1). */
  SLIDE_TITLE_MAX: 120,
  SOURCE_ID_MAX: 80,
  SOURCE_TITLE_MAX: 300,
  SOURCE_URL_MAX: 500,
  GUIDELINE_SNAPSHOT_MAX: 200,
  REVIEWER_MAX: 80,
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

// Schema para Questão JSON (Laboratório) - COM LIMITES DE TAMANHO

/** Metadados internos GOLDEN v1 — não renderizados no player. @see docs/GOLDEN_CONTENT_STANDARD.md */
export const GoldenFamilySchema = z.enum([
  'legis',
  'protocolo',
  'calc',
  'vf',
  'certo_errado',
  'conceito',
  'text_fragment',
]);

export const ContentSourceSchema = z.object({
  id: z.string().min(1).max(LIMITS.SOURCE_ID_MAX),
  tier: z.enum(['A', 'B']),
  issuer: z.string().min(1).max(LIMITS.SOURCE_TITLE_MAX),
  title: z.string().min(1).max(LIMITS.SOURCE_TITLE_MAX),
  year: z.number().int().min(1990).max(2100),
  url: z.string().max(LIMITS.SOURCE_URL_MAX).optional(),
  covers: z.array(z.string().max(120)).max(20).optional(),
});

export const ContentReviewSchema = z.object({
  reviewed_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'reviewed_at deve ser AAAA-MM-DD'),
  reviewer: z.string().max(LIMITS.REVIEWER_MAX).optional(),
  guideline_snapshot: z
    .string()
    .min(1)
    .max(LIMITS.GUIDELINE_SNAPSHOT_MAX, `guideline_snapshot máx. ${LIMITS.GUIDELINE_SNAPSHOT_MAX}`),
  exam_vs_current: z.union([z.literal('none'), z.string().max(500)]).optional(),
});

/** Auto-aprovação por risco — @see docs/DECISAO_AUTO_APROVACAO_RISCO.md */
export const EfficacyContractSchema = z.object({
  risk_tier: z.enum(['baixo', 'medio', 'alto']).optional(),
  risk_factors: z.array(z.string().max(64)).max(20).optional(),
  approval_mode: z.enum(['auto', 'auto_conditional', 'human_required']).optional(),
  a4_reviewed: z.boolean().optional(),
  a4_reviewer: z.string().max(LIMITS.REVIEWER_MAX).optional(),
  a4_checklist_passed: z.array(z.string().max(40)).max(12).optional(),
  auto_approved_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'auto_approved_at deve ser AAAA-MM-DD')
    .optional(),
  sampled: z.boolean().optional(),
  transfer_targets: z.array(z.string().max(200)).max(8).optional(),
  retrieval_first: z.boolean().optional(),
});

export const QuestaoMetaSchema = z.object({
  ano: z.string().max(40, 'Ano deve ter no máximo 40 caracteres').optional(),
  banca: z.string().min(1, 'Banca é obrigatória').max(LIMITS.BANCA_MAX, `Banca deve ter no máximo ${LIMITS.BANCA_MAX} caracteres`),
  orgao: z.string().max(LIMITS.ORGAO_MAX, `Órgão deve ter no máximo ${LIMITS.ORGAO_MAX} caracteres`).optional(),
  prova: z.string().max(LIMITS.PROVA_MAX, `Prova deve ter no máximo ${LIMITS.PROVA_MAX} caracteres`).optional(),
  header_line: z
    .string()
    .max(LIMITS.HEADER_LINE_MAX, `header_line deve ter no máximo ${LIMITS.HEADER_LINE_MAX} caracteres`)
    .optional(),
  cargo_header: z
    .string()
    .max(LIMITS.CARGO_HEADER_MAX, `cargo_header deve ter no máximo ${LIMITS.CARGO_HEADER_MAX} caracteres`)
    .optional(),
  topico: z.string().min(1, 'Tópico é obrigatório').max(LIMITS.TOPICO_MAX, `Tópico deve ter no máximo ${LIMITS.TOPICO_MAX} caracteres`),
  subtopico: z.string().max(LIMITS.TOPICO_MAX, `Subtópico deve ter no máximo ${LIMITS.TOPICO_MAX} caracteres`).optional(),
  content_standard: z.literal(GOLDEN_CONTENT_STANDARD_VERSION).optional(),
  family: GoldenFamilySchema.optional(),
  content_review: ContentReviewSchema.optional(),
  sources: z.array(ContentSourceSchema).max(12).optional(),
  /** Ramo pedagógico L2.5 — define molde L3 quando o subtópico é bucket amplo. */
  pedagogical_branch: z.string().trim().max(80).optional(),
  /** Contrato de eficácia / auto-aprovação por risco (opcional). */
  efficacy_contract: EfficacyContractSchema.optional(),
});

export const QuestaoOptionSchema = z.object({
  id: z.string().min(1).max(10, 'ID da alternativa deve ter no máximo 10 caracteres'),
  text: z.string().min(1).max(1000, 'Texto da alternativa deve ter no máximo 1000 caracteres'),
  is_correct: z.boolean(),
});

const allowedFigureHosts = () => getAllowedQuestaoFigureHosts();

export const QuestaoFigureSchema = z.object({
  id: z.string().min(1).max(32),
  url: z
    .string()
    .url('URL da figura deve ser válida')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
          if (parsed.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(parsed.hostname)) {
            return false;
          }
          return allowedFigureHosts().includes(parsed.hostname);
        } catch {
          return false;
        }
      },
      {
        message: `URL da figura deve ser HTTPS no Supabase Storage (${allowedFigureHosts().join(', ') || 'configure NEXT_PUBLIC_SUPABASE_URL'})`,
      },
    ),
  alt: z.string().min(8).max(300),
  caption: z.string().max(200).optional(),
  kind: z.enum(QUESTAO_FIGURE_KINDS).default('crop'),
  source_page: z.number().int().positive().optional(),
});

export const QuestaoDataSchema = z
  .object({
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
    figures: z.array(QuestaoFigureSchema).max(3).optional(),
    figure_policy: z.enum(QUESTAO_FIGURE_POLICIES).optional(),
    options: z.array(QuestaoOptionSchema).min(1, 'Deve ter pelo menos uma alternativa').max(10, 'Máximo de 10 alternativas'),
  })
  .superRefine((data, ctx) => {
    const idToIndices = new Map<string, number[]>();
    data.options.forEach((opt, index) => {
      const list = idToIndices.get(opt.id) ?? [];
      list.push(index);
      idToIndices.set(opt.id, list);
    });
    const duplicateIds = [...idToIndices.entries()]
      .filter(([, indices]) => indices.length > 1)
      .map(([id]) => id);
    if (duplicateIds.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `IDs de alternativa duplicados: ${duplicateIds.join(', ')}. Cada item em "options" deve ter um "id" único (ex.: A, B, C...).`,
        path: ['options'],
      });
    }

    if (data.figure_policy === 'required' && (!data.figures || data.figures.length < 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'figure_policy "required" exige ao menos uma entrada em figures[]',
        path: ['figures'],
      });
    }

    if (data.figure_policy === 'transcribed' && !hasUsefulFigureTranscription(data.text_fragment)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'figure_policy "transcribed" exige text_fragment com transcrição útil (≥20 caracteres)',
        path: ['text_fragment'],
      });
    }
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
  /** Texto da coluna “correto” no layout `compare` (danger_zone). */
  correct: z.string().max(LIMITS.DETAIL_MAX, `Correct deve ter no máximo ${LIMITS.DETAIL_MAX} caracteres`).optional(),
});

// Schema para Meta de Slide - COM LIMITES
export const SlideMetaSchema = z.object({
  topico: z.string().max(LIMITS.TOPICO_MAX, `Tópico deve ter no máximo ${LIMITS.TOPICO_MAX} caracteres`).optional(),
  subtopico: z.string().max(LIMITS.TOPICO_MAX, `Subtópico deve ter no máximo ${LIMITS.TOPICO_MAX} caracteres`).optional(),
}).passthrough(); // Permite campos extras

/** Campos opcionais do shell premium (chip/título) — comuns a todos os tipos de slide. */
export const ReverseStudySlideShellFieldsSchema = z.object({
  chip_label: z
    .string()
    .min(1, 'chip_label não pode ser vazio')
    .max(LIMITS.CHIP_LABEL_MAX, `chip_label deve ter no máximo ${LIMITS.CHIP_LABEL_MAX} caracteres`)
    .optional(),
  slide_title: z
    .string()
    .min(1, 'slide_title não pode ser vazio')
    .max(LIMITS.SLIDE_TITLE_MAX, `slide_title deve ter no máximo ${LIMITS.SLIDE_TITLE_MAX} caracteres`)
    .optional(),
});

// Schema para Concept Map Slide - COM VALIDAÇÕES AVANÇADAS
export const ConceptMapSlideSchema = ReverseStudySlideShellFieldsSchema.merge(z.object({
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
}));

// Schema para Logic Flow Slide - COM VALIDAÇÕES AVANÇADAS
export const LogicFlowSlideSchema = ReverseStudySlideShellFieldsSchema.merge(z.object({
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
  /** Default `auto` no player preserva slides legados; conteúdo novo premium deve usar `"tap"`. */
  reveal_mode: z.enum(['auto', 'tap']).optional(),
  // Campos de compatibilidade (DEPRECATED)
  layout_type: z.literal('logic_flow').optional(),
  layout_variant: z.string().optional(),
  structure: z.any().optional(),
  design_system: z.any().optional(),
}));

export const GoldenRuleRowEmphasisSchema = z.enum(['default', 'highlight', 'alert', 'success']);
export const GoldenRuleRowBadgeSchema = z.enum(['hot', 'warn', 'ok', 'info']);

export const GoldenRuleRowSvKindSchema = z.enum(['pa', 'temp', 'fc', 'fr', 'spo2', 'meta']);

export const GoldenRuleRowSchema = z.object({
  label: z
    .string()
    .min(1, 'Cada row deve ter label')
    .max(LIMITS.LABEL_MAX, `Label deve ter no máximo ${LIMITS.LABEL_MAX} caracteres`),
  value: z
    .string()
    .min(1, 'Cada row deve ter value')
    .max(LIMITS.DETAIL_MAX, `Value deve ter no máximo ${LIMITS.DETAIL_MAX} caracteres`),
  /** Destaque visual da linha no layout `reference_table`. */
  emphasis: GoldenRuleRowEmphasisSchema.optional(),
  /** Badge opcional (coluna direita em desktop). */
  badge: GoldenRuleRowBadgeSchema.optional(),
  /** Molde vitals-reference-board: evita inferência errada (ex. Tempo → temperatura). */
  sv_kind: GoldenRuleRowSvKindSchema.optional(),
  /** Painel soft-lens: dica explícita (substitui inferência por perfil). */
  exam_hint: z
    .string()
    .max(LIMITS.DETAIL_MAX, `exam_hint deve ter no máximo ${LIMITS.DETAIL_MAX} caracteres`)
    .optional(),
  fixation: z
    .string()
    .max(LIMITS.DETAIL_MAX, `fixation deve ter no máximo ${LIMITS.DETAIL_MAX} caracteres`)
    .optional(),
});

// Schema para Golden Rule Slide - COM VALIDAÇÕES AVANÇADAS
// `content` OU `rows` (superRefine); slides legados só com content permanecem válidos.
export const GoldenRuleSlideSchema = ReverseStudySlideShellFieldsSchema.merge(z
  .object({
    type: z.literal('golden_rule'),
    subject: z.string().max(LIMITS.SUBJECT_MAX, `Subject deve ter no máximo ${LIMITS.SUBJECT_MAX} caracteres`).optional(),
    template: z.string().max(20, 'Template ID (ex: t01-t15)').optional(),
    theme_id: z.string().max(20, 'Alias de template').optional(),
    meta: SlideMetaSchema.optional(),
    content: z
      .string()
      .max(LIMITS.CONTENT_MAX, `Content deve ter no máximo ${LIMITS.CONTENT_MAX} caracteres`)
      .optional(),
    rows: z
      .array(GoldenRuleRowSchema)
      .min(1, 'rows deve ter pelo menos 1 par label/value')
      .max(12, 'golden_rule deve ter no máximo 12 rows')
      .optional(),
    footer_rule: z.string().max(LIMITS.FOOTER_RULE_MAX, `Footer rule deve ter no máximo ${LIMITS.FOOTER_RULE_MAX} caracteres`).optional(),
    // Campos de compatibilidade (DEPRECATED)
    layout_type: z.literal('golden_rule').optional(),
    layout_variant: z.string().optional(),
    structure: z.any().optional(),
    design_system: z.any().optional(),
  }))
  .superRefine((data, ctx) => {
    const hasContent = typeof data.content === 'string' && data.content.trim().length > 0;
    const hasRows = Array.isArray(data.rows) && data.rows.length > 0;
    if (!hasContent && !hasRows) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'golden_rule deve ter content ou rows (pelo menos um com conteúdo)',
        path: ['content'],
      });
    }
  });

// Schema para Danger Zone Slide - COM VALIDAÇÕES AVANÇADAS
export const DangerZoneSlideSchema = ReverseStudySlideShellFieldsSchema.merge(z.object({
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
  /** Bullets na lista: `numbered` (padrão) ou `x_icon` (ícone X vermelho). */
  bullet_style: z.enum(['numbered', 'x_icon']).optional(),
  /** Compare com `correct`: default `tap` revela coluna certa por item; `auto` mostra tudo (legado). */
  reveal_mode: z.enum(['auto', 'tap']).optional(),
  // Campos de compatibilidade (DEPRECATED)
  layout_type: z.literal('danger_zone').optional(),
  layout_variant: z.string().optional(),
  structure: z.any().optional(),
  design_system: z.any().optional(),
}));

// Schema para Syllable Scanner Slide - COM VALIDAÇÕES AVANÇADAS
export const SyllableScannerSlideSchema = ReverseStudySlideShellFieldsSchema.merge(z.object({
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
}));

const VersusArenaSideSchema = z.object({
  title: z
    .string()
    .min(1, 'title é obrigatório no versus_arena')
    .max(LIMITS.LABEL_MAX, `Title deve ter no máximo ${LIMITS.LABEL_MAX} caracteres`),
  points: z
    .array(z.string().max(LIMITS.DETAIL_MAX, `Ponto deve ter no máximo ${LIMITS.DETAIL_MAX} caracteres`))
    .max(12, 'Máximo de 12 pontos por lado no versus_arena')
    .optional()
    .default([]),
  icon: z.string().max(80).optional(),
});

// Schema para Versus Arena Slide - COM VALIDAÇÕES AVANÇADAS
export const VersusArenaSlideSchema = ReverseStudySlideShellFieldsSchema.merge(z.object({
  type: z.literal('versus_arena'),
  subject: z.string().max(LIMITS.SUBJECT_MAX, `Subject deve ter no máximo ${LIMITS.SUBJECT_MAX} caracteres`).optional(),
  template: z.string().max(20, 'Template ID (ex: t01-t15)').optional(),
  theme_id: z.string().max(20, 'Alias de template').optional(),
  meta: SlideMetaSchema.optional(),
  concept_a: z.union([
    VersusArenaSideSchema,
    z
      .string()
      .min(1, 'concept_a é obrigatório para versus_arena')
      .max(LIMITS.LABEL_MAX, `Concept A deve ter no máximo ${LIMITS.LABEL_MAX} caracteres`),
  ]),
  concept_b: z.union([
    VersusArenaSideSchema,
    z
      .string()
      .min(1, 'concept_b é obrigatório para versus_arena')
      .max(LIMITS.LABEL_MAX, `Concept B deve ter no máximo ${LIMITS.LABEL_MAX} caracteres`),
  ]),
  footer_rule: z.string().max(LIMITS.FOOTER_RULE_MAX, `Footer rule deve ter no máximo ${LIMITS.FOOTER_RULE_MAX} caracteres`).optional(),
  // Campos de compatibilidade (DEPRECATED)
  layout_type: z.literal('versus_arena').optional(),
  layout_variant: z.string().optional(),
  structure: z.any().optional(),
  design_system: z.any().optional(),
}));

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

/** Domínio / URL sem espaço (ex.: tecconcursos.com.br). */
const TECONCURSOS_SUBSTRING_RE = /tecconcursos/i;
/** Marca com espaço — comum em cópia de rodapé do site ("Tec Concursos - Questões para..."). */
const TECONCURSOS_BRAND_SPACE_RE = /\btec\s+concursos\b/i;
/** Rodapé típico copiado junto com alternativas no navegador. */
const TECONCURSOS_FOOTER_TAGLINE_RE =
  /questões\s+para\s+concursos\s*,\s*provas\s*,\s*editais\s*,\s*simulados/i;

export const TECONCURSOS_PAYLOAD_BLOCKED_MESSAGE =
  'Conteúdo não permitido: remova referências ao TecConcursos (domínio tecconcursos, nome "Tec Concursos" ou rodapé de página copiado) antes de publicar no AVANT.';

function stringContainsBlockedTecconcursosContent(s: string): boolean {
  if (TECONCURSOS_SUBSTRING_RE.test(s)) return true;
  if (TECONCURSOS_BRAND_SPACE_RE.test(s)) return true;
  if (TECONCURSOS_FOOTER_TAGLINE_RE.test(s)) return true;
  return false;
}

/**
 * Percorre recursivamente JSON (objeto/array) e detecta menções ao TecConcursos / rodapé típico em qualquer string ou nome de chave.
 * Deve ser aplicado ao objeto bruto após JSON.parse — campos extras que o Zod descartaria não seriam checados só no schema.
 */
export function payloadContainsTecconcursosReference(value: unknown): boolean {
  if (typeof value === 'string') {
    return stringContainsBlockedTecconcursosContent(value);
  }
  if (value && typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.some(payloadContainsTecconcursosReference);
    }
    const obj = value as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      if (TECONCURSOS_SUBSTRING_RE.test(key)) return true;
      if (payloadContainsTecconcursosReference(obj[key])) return true;
    }
  }
  return false;
}

/** Erro Zod único para respostas de API / painel alinhadas ao bloqueio TecConcursos. */
export function questaoPayloadTecconcursosZodError(): ZodError {
  return new ZodError([
    { code: 'custom', message: TECONCURSOS_PAYLOAD_BLOCKED_MESSAGE, path: [] },
  ]);
}

/** Objeto após parse (sem preprocess). Slides só no formato semântico estrito. */
export const QuestaoCompletaObjectSchema = z
  .object({
    id: z.string().optional(),
    meta: QuestaoMetaSchema,
    question_data: QuestaoDataSchema,
    reverse_study_slides: z.array(ReverseStudySlideSchema).optional(),
    study_slides: z.array(ReverseStudySlideSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (payloadContainsTecconcursosReference(data)) {
      ctx.addIssue(TECONCURSOS_PAYLOAD_BLOCKED_MESSAGE);
    }
  });

/**
 * Aceita payload bruto, achata slides aninhados (`concept_map.items`, etc.) e valida contra o schema estrito.
 * Laboratório, POST /api/admin/questions e /api/validate-question usam este schema.
 */
export const QuestaoCompletaSchema = z
  .unknown()
  .transform((val) => normalizeQuestaoSlideArrays(val))
  .pipe(QuestaoCompletaObjectSchema);

// Schema para Resolve User API
export const ResolveUserSchema = z.object({
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
});

const ConcursoSlugSchema = z
  .string()
  .trim()
  .min(2, 'Slug do concurso é obrigatório')
  .max(120, 'Slug do concurso muito longo')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug do concurso inválido');

export const ConcursoMatriculaSchema = z.object({
  concursoSlug: ConcursoSlugSchema.optional(),
});

export const CriarSessaoPagamentoSchema = z.object({
  concurso_slug: ConcursoSlugSchema,
});

export const ConcursoCreateSchema = z.object({
  slug: ConcursoSlugSchema,
  nome: z.string().trim().min(2).max(200),
  cidade: z.string().trim().max(120).optional(),
  orgao: z.string().trim().max(120).optional(),
  banca: z.string().trim().max(80).optional(),
  ano: z.number().int().min(1990).max(2100).optional(),
  cargo: z.string().trim().max(120).optional(),
  tipo: z.enum(['geral', 'edital']).default('edital'),
  status: z.enum(['rascunho', 'ativo', 'arquivado']).default('rascunho'),
});

/** Payload admin (criação/edição no builder); `status` no create deve ser sobrescrito para `rascunho` no servidor. */
export const ConcursoAdminUpsertSchema = ConcursoCreateSchema.extend({
  descricao: z.preprocess(
    (v) => (v === '' ? null : v),
    z.string().trim().max(20_000).nullable().optional(),
  ),
  destaque: z.preprocess(
    (v) => (v === '' ? null : v),
    z.string().trim().max(500).nullable().optional(),
  ),
  price_cents: z.number().int().min(0).nullable().optional(),
  data_prova: z.preprocess(
    (v) => (v === '' ? null : v),
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data da prova inválida (use YYYY-MM-DD)')
      .nullable()
      .optional(),
  ),
});

export const ConcursoAdminMatriculaSchema = z.object({
  userId: z.string().uuid('ID do usuário inválido'),
  concursoId: z.string().uuid('ID do concurso inválido'),
});

/** Admin: criar conta no Auth (se não existir) e matricular no concurso. */
export const AdminCriarUsuarioMatriculaSchema = z.object({
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
  nome: z.string().trim().max(200).optional(),
});

/** Revogação ou exclusão de matrícula no admin. */
export const ConcursoAdminMatriculaRevogarSchema = z.object({
  userId: z.string().uuid('ID do usuário inválido'),
  /** Se true, remove também a conta no Auth (permite recadastro com o mesmo e-mail). */
  deleteAccount: z.boolean().optional().default(false),
});

// ============================================================================
// Links de convite (Pro temporário)
// ============================================================================

export const InviteLinkCreateSchema = z.object({
  pro_days: z.number().int().min(1).max(365),
  link_valid_days: z.number().int().min(1).max(90),
  max_uses: z.number().int().min(1).max(1000).default(1),
  label: z
    .string()
    .trim()
    .max(200)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v ?? null)),
});

export const InviteRedeemSchema = z.object({
  token: z.string().trim().min(8).max(128).optional(),
});

export const ConcursoModuloLinkSchema = z.object({
  moduloId: z.string().uuid('ID do módulo inválido'),
  origem: z.enum(['publicacao', 'manual', 'regra']).default('manual'),
});

export const ConcursoRegraModulosSchema = z.object({
  banca: z.string().trim().min(1).max(80),
  orgao: z.string().trim().max(120).optional(),
  ano: z.number().int().min(1990).max(2100).optional(),
});

// ============================================================================
// LP PAGES (CMS — funil AVANT enf Pro)
// ============================================================================

export const LpPathSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Path inválido');

export const LpConcursoBlockSchema = z.object({
  cidade: z.string().trim().min(1).max(120),
  cargo: z.string().trim().min(1).max(120),
  banca: z.string().trim().min(1).max(80),
  nomeBanca: z.string().trim().min(1).max(80),
  vagas: z.string().trim().min(1).max(40),
  vagasPCD: z.string().trim().max(40).optional(),
  cadastroReserva: z.string().trim().max(80).optional(),
  dataProva: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data da prova inválida (YYYY-MM-DD)'),
  dataProvaFormatada: z.string().trim().min(1).max(40),
  statusInscricoes: z.string().trim().min(1).max(120),
  remuneracao: z.string().trim().min(1).max(80),
  taxaInscricao: z.string().trim().min(1).max(40),
  orgao: z.string().trim().min(1).max(160),
});

export const LpCopySchema = z.object({
  headlinePrincipal: z.string().trim().min(1).max(300),
  subtitulo: z.string().trim().min(1).max(500),
  dores: z.tuple([z.string().trim().min(1).max(300), z.string().trim().min(1).max(300), z.string().trim().min(1).max(300)]),
  perigosBanca: z.tuple([z.string().trim().min(1).max(300), z.string().trim().min(1).max(300), z.string().trim().min(1).max(300)]),
  listaBeneficios: z.array(z.string().trim().min(1).max(300)).min(1).max(20),
  disclaimer: z.string().trim().min(1).max(500),
  disclaimerLegal: z.string().trim().min(1).max(800),
});

export const LpPageConfigSchema = z.object({
  concurso: LpConcursoBlockSchema,
  copy: LpCopySchema,
  walkthrough: z.object({
    imagens: z.array(z.string().trim().min(1).max(500)).min(1).max(16),
  }),
  oferta: z.object({ preco: z.string().trim().min(1).max(20) }).optional(),
});

export const LpPageSeoSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(320),
  canonical: z.string().trim().max(200).optional(),
  ogTitle: z.string().trim().max(120).optional(),
  ogDescription: z.string().trim().max(320).optional(),
});

export const LpPageAdminCreateSchema = z.object({
  template_id: z.string().uuid('Template inválido'),
  path: LpPathSchema,
  internal_name: z.string().trim().min(2).max(200),
  config: LpPageConfigSchema,
  seo: LpPageSeoSchema,
  utm_campaign: z.string().trim().max(80).nullable().optional(),
});

export const LpPageAdminUpdateSchema = LpPageAdminCreateSchema.partial().extend({
  status: z.enum(['rascunho', 'ativo', 'arquivado']).optional(),
});

// ============================================================================
// E-mail templates (admin CMS)
// ============================================================================

export { EmailTemplateContentSchema };

export const EmailTemplateUpdateSchema = z.object({
  subject: z.string().trim().min(1).max(200).optional(),
  preview_text: z.string().trim().max(200).optional(),
  content: EmailTemplateContentSchema.optional(),
});

export const MarketingEmailSendSchema = z
  .object({
    template_slug: z.string().trim().min(1).max(64).default('marketing'),
    subject: z.string().trim().min(1).max(200).optional(),
    preview_text: z.string().trim().max(200).optional(),
    content: EmailTemplateContentSchema.partial().optional(),
    audience: z.enum(['test_me', 'emails', 'concurso_matriculas']),
    emails: z.array(z.string().trim().email()).max(50).optional(),
    concurso_id: z.string().uuid().optional(),
    confirm: z.literal(true, {
      message: 'Confirme o envio com confirm: true',
    }),
  })
  .superRefine((data, ctx) => {
    if (data.audience === 'emails' && (!data.emails || data.emails.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe ao menos um e-mail',
        path: ['emails'],
      });
    }
    if (data.audience === 'concurso_matriculas' && !data.concurso_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe o concurso_id',
        path: ['concurso_id'],
      });
    }
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

const QUERY_STRING_ARRAY_MAX_ITEMS = 20;

/** Normaliza `string | string[]` de query/body em array trimado (máx. itens/tamanho). */
export function zQueryStringArray(maxItemLength: number, maxItems = QUERY_STRING_ARRAY_MAX_ITEMS) {
  return z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === '') return [];
      const raw = Array.isArray(val) ? val : [val];
      const normalized: string[] = [];
      for (const item of raw) {
        if (typeof item !== 'string') continue;
        const trimmed = item.trim();
        if (!trimmed) continue;
        normalized.push(trimmed.slice(0, maxItemLength));
        if (normalized.length >= maxItems) break;
      }
      return normalized;
    },
    z.array(z.string().max(maxItemLength)).max(maxItems),
  );
}

function mergeBancaAssuntoFields<
  T extends {
    bancas?: string[];
    assuntos?: string[];
    banca?: string[];
    assunto?: string[];
  },
>(data: T): { bancas?: string[]; assuntos?: string[] } & Omit<T, 'banca' | 'assunto' | 'bancas' | 'assuntos'> {
  const bancas = [...(data.bancas ?? [])];
  const assuntos = [...(data.assuntos ?? [])];
  for (const b of data.banca ?? []) {
    if (b && !bancas.includes(b)) bancas.push(b);
  }
  for (const a of data.assunto ?? []) {
    if (a && !assuntos.includes(a)) assuntos.push(a);
  }
  const { banca: _b, assunto: _a, bancas: _bs, assuntos: _as, ...rest } = data;
  return {
    ...rest,
    ...(bancas.length ? { bancas } : {}),
    ...(assuntos.length ? { assuntos } : {}),
  };
}

const vitrineBancaAssuntoQueryBase = {
  bancas: zQueryStringArray(LIMITS.BANCA_MAX).optional(),
  assuntos: zQueryStringArray(LIMITS.TOPICO_MAX).optional(),
  banca: zQueryStringArray(LIMITS.BANCA_MAX).optional(),
  assunto: zQueryStringArray(LIMITS.TOPICO_MAX).optional(),
};

/** Query params de `GET /api/vitrine` (vitrine paginada). */
export const VitrineQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(500).default(1),
    ...vitrineBancaAssuntoQueryBase,
    q: z.string().trim().max(200).optional(),
    disciplina: z.enum(['enfermagem', 'portugues']).optional(),
  })
  .transform(mergeBancaAssuntoFields);

/** Query params de `GET /api/estudar/questao` (prefetch do player logado). */
export const EstudarQuestaoQuerySchema = z
  .object({
    slug: z.string().trim().min(1).max(200),
    layers: z.enum(['core', 'full']).default('full'),
    from: z.enum(['plano', 'caderno']).optional(),
    caderno_id: z.string().uuid().optional(),
    context: z.enum(['simulado']).optional(),
    page: z.coerce.number().int().min(1).max(500).optional(),
    ...vitrineBancaAssuntoQueryBase,
    q: z.string().trim().max(200).optional(),
    /** Hub TE/PT — obrigatório no suffix (evita toast payload_cache_key_mismatch). */
    disciplina: z.enum(['enfermagem', 'portugues']).optional(),
  })
  .transform(mergeBancaAssuntoFields);

/** Query params de `GET /api/vitrine/questao` (atalho por número/código no card). */
export const VitrineResolveQuestaoQuerySchema = z
  .object({
    assunto: z.string().trim().min(1).max(LIMITS.TOPICO_MAX),
    alvo: z.string().trim().min(1).max(20),
    bancas: zQueryStringArray(LIMITS.BANCA_MAX).optional(),
    banca: zQueryStringArray(LIMITS.BANCA_MAX).optional(),
  })
  .transform((data) => {
    const bancas = [...(data.bancas ?? [])];
    for (const b of data.banca ?? []) {
      if (b && !bancas.includes(b)) bancas.push(b);
    }
    const { banca: _b, bancas: _bs, ...rest } = data;
    return {
      ...rest,
      ...(bancas.length ? { bancas } : {}),
    };
  });

/** Query params de `GET /api/vitrine/facets`. */
export const VitrineFacetsQuerySchema = z
  .object({
    bancas: zQueryStringArray(LIMITS.BANCA_MAX).optional(),
    banca: zQueryStringArray(LIMITS.BANCA_MAX).optional(),
  })
  .transform((data) => {
    const bancas = [...(data.bancas ?? [])];
    for (const b of data.banca ?? []) {
      if (b && !bancas.includes(b)) bancas.push(b);
    }
    const { banca: _b, bancas: _bs, ...rest } = data;
    return { ...rest, ...(bancas.length ? { bancas } : {}) };
  });

/** Payload de criação de template salvo do Modo Simulado. */
export const SimuladoTemplateCreateSchema = z
  .object({
    titulo: z.string().trim().min(1, 'Título é obrigatório').max(120),
    modo: z.enum(['treino', 'prova']),
    quantidade: z.coerce.number().int().min(1).max(100),
    ritmo_meta: z.enum(['2min', '3min', 'none']).default('3min'),
    ...vitrineBancaAssuntoQueryBase,
    q: z.string().trim().max(200).optional(),
  })
  .transform(mergeBancaAssuntoFields);

/** Payload opcional para gerar o Simulado Diagnóstico Inicial. */
export const SimuladoDiagnosticoCreateSchema = z.object({
  quantidade: z.coerce
    .number()
    .int()
    .min(8)
    .max(12)
    .default(10),
});

/** Payload de criação de sessão do Modo Simulado. */
export const SimuladoCreateSessionSchema = z
  .object({
    quantidade: z.coerce.number().int().min(1).max(100).default(20),
    modo: z.enum(['treino', 'prova']).default('treino'),
    titulo: z.string().trim().max(120).optional(),
    ritmo_meta: z.enum(['2min', '3min', 'none']).default('3min'),
    template_id: z.string().uuid().optional(),
    ...vitrineBancaAssuntoQueryBase,
    q: z.string().trim().max(200).optional(),
    forcar_novo: z.boolean().optional().default(false),
    from_session_id: z.string().uuid().optional(),
    only_errors: z.boolean().optional().default(false),
  })
  .transform(mergeBancaAssuntoFields);

/** Payload de resposta de questão dentro de uma sessão de simulado. */
export const SimuladoAnswerSchema = z.object({
  session_id: z.string().uuid('session_id inválido'),
  modulo_slug: z.string().trim().min(1).max(200),
  opcao_id: z.string().trim().min(1).max(10),
  tempo_ms: z.coerce.number().int().min(0).max(1000 * 60 * 60 * 6).optional(),
});

/** Query params para estimar o tamanho do pool do simulado. */
export const SimuladoPoolCountQuerySchema = z
  .object({
    ...vitrineBancaAssuntoQueryBase,
    q: z.string().trim().max(200).optional(),
  })
  .transform(mergeBancaAssuntoFields);

/** Query params para analytics de sessões do simulado. */
export const SimuladoAnalyticsQuerySchema = z.object({
  periodo: z.enum(['1d', '7d', '30d', '90d', '12m']).optional(),
  modo: z.enum(['todos', 'treino', 'prova']).optional(),
  banca: z.string().trim().max(LIMITS.BANCA_MAX).optional(),
  topico: z.string().trim().max(LIMITS.TOPICO_MAX).optional(),
  subtopico: z.string().trim().max(LIMITS.TOPICO_MAX).optional(),
  assunto: z.string().trim().max(LIMITS.TOPICO_MAX).optional(),
});

/** Query params para histórico paginado de simulados. */
export const SimuladoHistoryQuerySchema = z.object({
  periodo: z.enum(['1d', '7d', '30d', '90d', '12m']).optional(),
  modo: z.enum(['todos', 'treino', 'prova']).optional(),
  status: z.enum(['todos', 'aberto', 'concluido', 'cancelado']).optional(),
  banca: z.string().trim().max(LIMITS.BANCA_MAX).optional(),
  topico: z.string().trim().max(LIMITS.TOPICO_MAX).optional(),
  subtopico: z.string().trim().max(LIMITS.TOPICO_MAX).optional(),
  assunto: z.string().trim().max(LIMITS.TOPICO_MAX).optional(),
  page: z.coerce.number().int().min(1).optional(),
  page_size: z.coerce.number().int().min(1).max(100).optional(),
});

/** Query params para carregar questão no runner de simulado. */
export const SimuladoQuestaoQuerySchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

/** Payload para executar retenção híbrida de analytics de simulados (admin/manutenção). */
export const SimuladoRetentionRunSchema = z.object({
  retention_months: z.coerce.number().int().min(1).max(36).optional().default(12),
  reference_at: z.string().datetime().optional(),
});

/** Payload para geração do Simulado da Semana (cron ou usuário autenticado). */
export const SimuladoWeeklyGenerateSchema = z.object({
  user_id: z.string().uuid().optional(),
  quantidade: z.coerce.number().int().min(8).max(50).optional().default(10),
});

// ============================================================================
// ONBOARDING — preferências de entrada do aluno
// ============================================================================

export const UserPreferencesOnboardingSchema = z.object({
  topicos_afinidade: z
    .array(z.enum(ONBOARDING_TOPIC_AREAS))
    .min(1, 'Selecione ao menos uma matéria de afinidade')
    .max(ONBOARDING_TOPIC_AREAS.length),
  topicos_dificuldade: z
    .array(z.enum(ONBOARDING_TOPIC_AREAS))
    .min(1, 'Selecione ao menos uma matéria para focar')
    .max(ONBOARDING_TOPIC_AREAS.length),
  carga_horaria_semanal: z
    .number()
    .int()
    .min(1, 'Carga horária mínima: 1h')
    .max(60, 'Carga horária máxima: 60h')
    .optional()
    .nullable(),
  bancas_foco: z
    .array(z.enum(ONBOARDING_BANCAS))
    .min(1, 'Selecione ao menos uma banca')
    .max(ONBOARDING_BANCAS.length),
});

// ============================================================================
// ERROR REPORTS (Aluno + Admin)
// ============================================================================

export const ErrorReportContextTypeSchema = z.enum(['lesson', 'simulado']);
export const ErrorReportCategorySchema = z.enum([
  'enunciado',
  'alternativas',
  'gabarito',
  'slides',
  'navegacao',
  'outro',
]);
export const ErrorReportStatusSchema = z.enum(['novo', 'triagem', 'resolvido', 'descartado']);
export const ErrorReportPrioritySchema = z.enum(['p0', 'p1', 'p2', 'p3']);

export const ErrorReportCreateSchema = z.object({
  context_type: ErrorReportContextTypeSchema,
  category: ErrorReportCategorySchema,
  description: z.string().trim().min(1, 'Descrição é obrigatória').max(4000, 'Descrição muito longa'),
  modulo_slug: z.string().trim().min(1).max(200).optional(),
  simulado_session_id: z.string().uuid('simulado_session_id inválido').optional(),
  page_url: z.string().trim().url('page_url inválida').max(2000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/** Query params para triagem/admin de reports de erro. */
export const AdminErrorReportListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(500).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
  status: ErrorReportStatusSchema.optional(),
  priority: ErrorReportPrioritySchema.optional(),
  context_type: ErrorReportContextTypeSchema.optional(),
  category: ErrorReportCategorySchema.optional(),
  q: z.string().trim().max(300).optional(),
  from: z.string().datetime('from deve estar em formato ISO-8601').optional(),
  to: z.string().datetime('to deve estar em formato ISO-8601').optional(),
  group_by_slug: z
    .enum(['true', 'false', '1', '0'])
    .optional()
    .transform((value) => value === 'true' || value === '1'),
});

export const AdminErrorReportBulkPatchSchema = z
  .object({
    report_ids: z.array(z.string().uuid('ID de report inválido')).min(1).max(200),
    status: ErrorReportStatusSchema.optional(),
    priority: ErrorReportPrioritySchema.optional(),
    admin_notes: z.string().trim().max(5000).optional(),
  })
  .refine(
    (data) => data.status !== undefined || data.priority !== undefined || data.admin_notes !== undefined,
    { message: 'Informe ao menos um campo para atualização (status, priority, admin_notes)' },
  );

export const AdminErrorReportPatchSchema = z
  .object({
    status: ErrorReportStatusSchema.optional(),
    priority: ErrorReportPrioritySchema.optional(),
    admin_notes: z.string().trim().max(5000).optional(),
  })
  .refine(
    (data) => data.status !== undefined || data.priority !== undefined || data.admin_notes !== undefined,
    { message: 'Informe ao menos um campo para atualização (status, priority, admin_notes)' },
  );

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type VitrineQueryInput = z.infer<typeof VitrineQuerySchema>;
export type EstudarQuestaoQueryInput = z.infer<typeof EstudarQuestaoQuerySchema>;
export type VitrineFacetsQueryInput = z.infer<typeof VitrineFacetsQuerySchema>;
export type VitrineResolveQuestaoQueryInput = z.infer<typeof VitrineResolveQuestaoQuerySchema>;
export type SimuladoTemplateCreateInput = z.infer<typeof SimuladoTemplateCreateSchema>;
export type SimuladoDiagnosticoCreateInput = z.input<typeof SimuladoDiagnosticoCreateSchema>;
export type SimuladoCreateSessionInput = z.input<typeof SimuladoCreateSessionSchema>;
export type SimuladoAnswerInput = z.infer<typeof SimuladoAnswerSchema>;
export type SimuladoPoolCountQueryInput = z.infer<typeof SimuladoPoolCountQuerySchema>;
export type SimuladoAnalyticsQueryInput = z.infer<typeof SimuladoAnalyticsQuerySchema>;
export type SimuladoHistoryQueryInput = z.infer<typeof SimuladoHistoryQuerySchema>;
export type SimuladoQuestaoQueryInput = z.infer<typeof SimuladoQuestaoQuerySchema>;
export type SimuladoRetentionRunInput = z.infer<typeof SimuladoRetentionRunSchema>;
export type SimuladoWeeklyGenerateInput = z.infer<typeof SimuladoWeeklyGenerateSchema>;
export type UserPreferencesOnboardingInput = z.infer<typeof UserPreferencesOnboardingSchema>;
export type ErrorReportContextTypeInput = z.infer<typeof ErrorReportContextTypeSchema>;
export type ErrorReportCategoryInput = z.infer<typeof ErrorReportCategorySchema>;
export type ErrorReportStatusInput = z.infer<typeof ErrorReportStatusSchema>;
export type ErrorReportPriorityInput = z.infer<typeof ErrorReportPrioritySchema>;
export type ErrorReportCreateInput = z.infer<typeof ErrorReportCreateSchema>;
export type AdminErrorReportListQueryInput = z.infer<typeof AdminErrorReportListQuerySchema>;
export type AdminErrorReportPatchInput = z.infer<typeof AdminErrorReportPatchSchema>;
export type AdminErrorReportBulkPatchInput = z.infer<typeof AdminErrorReportBulkPatchSchema>;
export type QuestaoCompletaInput = z.infer<typeof QuestaoCompletaSchema>;
export type ResolveUserInput = z.infer<typeof ResolveUserSchema>;
export type ConcursoMatriculaInput = z.infer<typeof ConcursoMatriculaSchema>;
export type CriarSessaoPagamentoInput = z.infer<typeof CriarSessaoPagamentoSchema>;
export type ConcursoCreateInput = z.infer<typeof ConcursoCreateSchema>;
export type ConcursoAdminUpsertInput = z.infer<typeof ConcursoAdminUpsertSchema>;
export type ConcursoAdminMatriculaInput = z.infer<typeof ConcursoAdminMatriculaSchema>;
export type AdminCriarUsuarioMatriculaInput = z.infer<typeof AdminCriarUsuarioMatriculaSchema>;
export type InviteLinkCreateInput = z.infer<typeof InviteLinkCreateSchema>;
export type InviteRedeemInput = z.infer<typeof InviteRedeemSchema>;
export type ConcursoModuloLinkInput = z.infer<typeof ConcursoModuloLinkSchema>;
export type ConcursoRegraModulosInput = z.infer<typeof ConcursoRegraModulosSchema>;
export type LpPageConfigInput = z.infer<typeof LpPageConfigSchema>;
export type LpPageSeoInput = z.infer<typeof LpPageSeoSchema>;
export type LpPageAdminCreateInput = z.infer<typeof LpPageAdminCreateSchema>;
export type LpPageAdminUpdateInput = z.infer<typeof LpPageAdminUpdateSchema>;
export type EmailTemplateContentInput = z.infer<typeof EmailTemplateContentSchema>;
export type EmailTemplateUpdateInput = z.infer<typeof EmailTemplateUpdateSchema>;
export type MarketingEmailSendInput = z.infer<typeof MarketingEmailSendSchema>;
export type ReverseStudySlideInput = z.infer<typeof ReverseStudySlideSchema>;
export type ReverseStudySlideShellFieldsInput = z.infer<typeof ReverseStudySlideShellFieldsSchema>;
export type SlideItemInput = z.infer<typeof SlideItemSchema>;
export type SlideMetaInput = z.infer<typeof SlideMetaSchema>;