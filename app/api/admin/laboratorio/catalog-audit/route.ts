import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { runCatalogContentAudit } from '@/lib/admin/catalogContentAudit';
import { logger } from '@/lib/logger';

const QuerySchema = z.object({
  sampleSize: z.coerce.number().int().min(1).max(50).optional().default(20),
  issueLimit: z.coerce.number().int().min(1).max(500).optional().default(200),
  maxRows: z.coerce.number().int().min(0).max(20_000).optional().default(0),
});

/**
 * GET /api/admin/laboratorio/catalog-audit
 * Auditoria de reverse_study_slides no catálogo (admin).
 */
export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse({
    sampleSize: url.searchParams.get('sampleSize') ?? undefined,
    issueLimit: url.searchParams.get('issueLimit') ?? undefined,
    maxRows: url.searchParams.get('maxRows') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { sampleSize, issueLimit, maxRows } = parsed.data;

  try {
    const report = await runCatalogContentAudit(auth.admin, {
      sampleSize,
      issueListLimit: issueLimit,
      maxRows,
    });

    const status =
      report.summary.missing_slides > 0 ||
      report.summary.slide_count_not_four > 0 ||
      report.summary.zod_invalid > 0
        ? 'warn'
        : 'ok';

    return NextResponse.json({ status, ...report });
  } catch (error) {
    logger.error('catalog-audit failed', error);
    return NextResponse.json({ error: 'Falha na auditoria do catálogo' }, { status: 500 });
  }
}
