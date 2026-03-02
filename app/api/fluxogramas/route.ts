import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { FluxogramaSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { apiRateLimit } from '@/lib/rate-limit';
import { getAdminEmail } from '@/lib/constants';

export async function POST(req: Request) {
  // Rate limiting
  if (!apiRateLimit(req, 10, 10000)) {
    logger.warn('Rate limit exceeded', { endpoint: '/api/fluxogramas' });
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em alguns segundos.' },
      { status: 429 }
    );
  }

  // Verificar autenticação e permissão de admin
  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Next.js já cuida dos cookies em Server Components
          }
        },
      },
    }
  );

  const { data: { session } } = await supabaseAuth.auth.getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }
  if (session.user.email.toLowerCase() !== getAdminEmail()) {
    return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem criar fluxogramas.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    logger.info('API request received', { endpoint: '/api/fluxogramas' });

    // Validação com Zod
    const validationResult = FluxogramaSchema.safeParse({
      title: body.title || body.flow_title,
      modulo_id: body.modulo_id,
      content: body.conteudo_json || body.content,
      conteudo_json: body.conteudo_json,
      flow_title: body.flow_title,
    });

    if (!validationResult.success) {
      logger.warn('Validation failed', { errors: validationResult.error.issues });
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { title, modulo_id, content } = validationResult.data;
    const finalTitle = title || validationResult.data.flow_title || '';
    const finalContent = content || validationResult.data.conteudo_json || {};

    if (!finalTitle || !modulo_id || !finalContent || Object.keys(finalContent).length === 0) {
      return NextResponse.json(
        { error: 'Título, Módulo ou Conteúdo ausentes' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const slug = title
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');

    const { data, error: dbError } = await supabase
      .from('flowcharts')
      .insert([
        {
          title,
          content,
          modulo_id,
          slug,
        },
      ])
      .select();

    if (dbError) {
      logger.error('Database error', dbError, { modulo_id, title: finalTitle });
      return NextResponse.json(
        {
          error: 'Erro ao salvar fluxograma',
          // Não expor detalhes internos em produção
          ...(process.env.NODE_ENV === 'development' && {
            details: dbError.details,
            hint: dbError.hint,
          }),
        },
        { status: 400 }
      );
    }

    logger.info('Flowchart saved successfully', { flowchartId: data?.[0]?.id });
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    logger.error('Critical API error', err);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

