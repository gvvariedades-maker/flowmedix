import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import {
  QUESTAO_WRITE_SPEC_VERSION,
  validateQuestaoForWrite,
  type QuestaoWriteIssue,
} from '@/lib/questaoSpec';
import { logger } from '@/lib/logger';
import { distributedRateLimit } from '@/lib/rate-limit';

function mapWriteIssues(issues: QuestaoWriteIssue[]) {
  return issues.map((err) => ({
    path: err.path ?? '',
    message: err.message,
    code: err.code,
    layer: err.layer,
    severity: err.severity,
  }));
}

/**
 * POST /api/validate-question
 * Valida questão com write spec golden-v2 (Zod + premium gate + lint golden-v1 se declarado).
 */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  if (!(await distributedRateLimit(req, { key: 'validate-question', limit: 20, windowMs: 10_000 }))) {
    logger.warn('Rate limit exceeded', { endpoint: '/api/validate-question' });
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em alguns segundos.' },
      { status: 429 },
    );
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ valid: false, error: 'JSON inválido' }, { status: 400 });
    }

    const result = validateQuestaoForWrite(body);

    if (!result.ok) {
      logger.warn('Question validation failed', { errors: result.errors.length });
      return NextResponse.json(
        {
          valid: false,
          specVersion: result.specVersion,
          errors: mapWriteIssues(result.errors),
          warnings: mapWriteIssues(result.warnings),
        },
        { status: 400 },
      );
    }

    logger.info('Question validated successfully', {
      specVersion: result.specVersion,
      hasSlides: !!result.data.reverse_study_slides,
      slidesCount: result.data.reverse_study_slides?.length || 0,
      warnings: result.warnings.length,
    });

    return NextResponse.json({
      valid: true,
      specVersion: result.specVersion,
      data: result.data,
      warnings: mapWriteIssues(result.warnings),
    });
  } catch (err: unknown) {
    logger.error('Validation API error', err);
    return NextResponse.json(
      {
        valid: false,
        error: 'Erro ao processar validação',
        message: err instanceof Error ? err.message : 'erro desconhecido',
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/validate-question
 * Retorna limites e versão do write spec.
 */
export async function GET() {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  return NextResponse.json({
    writeSpecVersion: QUESTAO_WRITE_SPEC_VERSION,
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
