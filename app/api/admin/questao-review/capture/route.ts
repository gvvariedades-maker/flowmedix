import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { logger } from '@/lib/logger';

/**
 * POST /api/admin/questao-review/capture
 * Dispara captura L4 (dev local) ou retorna instruções.
 */
export async function POST(request: NextRequest) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  let body: { slug?: string; source?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const slug = body.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: 'slug obrigatório' }, { status: 400 });
  }

  const source = body.source ?? 'local';
  const devUrl = `/dev/questao-review?slug=${encodeURIComponent(slug)}&source=${encodeURIComponent(source)}`;
  const command = `npm run capture:questao-review -- --slug=${slug} --source=${source}`;

  if (process.env.NODE_ENV === 'development') {
    try {
      const { spawn } = await import('node:child_process');
      spawn('npx', ['tsx', 'scripts/capture-questao-review.ts', `--slug=${slug}`, `--source=${source}`], {
        detached: true,
        stdio: 'ignore',
        shell: true,
        cwd: process.cwd(),
      }).unref();
      return NextResponse.json({
        started: true,
        slug,
        dev_url: devUrl,
        command,
        out_dir: `artifacts/questao-review/${slug}`,
      });
    } catch (error) {
      logger.warn('Capture em background falhou', { slug, error });
    }
  }

  return NextResponse.json({
    started: false,
    slug,
    dev_url: devUrl,
    command,
    message: 'Rode o comando localmente para gerar PNGs.',
  });
}
