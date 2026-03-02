import { NextResponse } from 'next/server';
import { QuestaoCompletaSchema, validateSlides } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { apiRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/validate-question
 * Valida uma questão completa usando Zod
 */
export async function POST(req: Request) {
  // Rate limiting (20 requisições por 10 segundos)
  if (!apiRateLimit(req, 20, 10000)) {
    logger.warn('Rate limit exceeded', { endpoint: '/api/validate-question' });
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em alguns segundos.' },
      { status: 429 }
    );
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { valid: false, error: 'JSON inválido' },
        { status: 400 }
      );
    }
    
    // Validação completa da questão
    const validationResult = QuestaoCompletaSchema.safeParse(body);
    
    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      logger.warn('Question validation failed', { errors: issues });

      return NextResponse.json(
        {
          valid: false,
          errors: issues.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        },
        { status: 400 }
      );
    }
    
    // Validação adicional dos slides (se existirem)
    let slidesValidation = null;
    if (validationResult.data.reverse_study_slides && validationResult.data.reverse_study_slides.length > 0) {
      slidesValidation = validateSlides(validationResult.data.reverse_study_slides);
      
      if (!slidesValidation.valid) {
        return NextResponse.json(
          {
            valid: false,
            errors: slidesValidation.errors.flatMap(({ index, errors }) =>
              errors.map((err) => ({
                path: `reverse_study_slides[${index}].${err.path.join('.')}`,
                message: err.message,
                code: err.code,
              }))
            ),
          },
          { status: 400 }
        );
      }
    }
    
    logger.info('Question validated successfully', {
      hasSlides: !!validationResult.data.reverse_study_slides,
      slidesCount: validationResult.data.reverse_study_slides?.length || 0,
    });
    
    return NextResponse.json({
      valid: true,
      data: validationResult.data,
      warnings: [], // Pode adicionar avisos não-críticos aqui
    });
  } catch (err: any) {
    logger.error('Validation API error', err);
    return NextResponse.json(
      {
        valid: false,
        error: 'Erro ao processar validação',
        message: err.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/validate-question
 * Retorna informações sobre os limites e regras de validação
 */
export async function GET() {
  return NextResponse.json({
    limits: {
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
    },
    slideTypes: [
      'concept_map',
      'logic_flow',
      'golden_rule',
      'danger_zone',
      'syllable_scanner',
      'versus_arena',
    ],
    allowedHtmlTags: ['p', 'strong', 'em', 'u', 'br', 'span', 'div', 'ul', 'ol', 'li'],
    allowedTags: ['p', 'strong', 'em', 'u', 'br', 'span', 'div', 'ul', 'ol', 'li'],
  });
}
