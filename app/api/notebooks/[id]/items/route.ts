import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { invalidateNotebookActivationCache } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';

const MAX_BATCH = 1_000;

const itemInSchema = z.object({
  modulo_slug: z.string().min(1),
  titulo_aula: z.string().nullable().optional(),
  topico: z.string().nullable().optional(),
});

const batchBodySchema = z.object({
  items: z.array(itemInSchema).min(1).max(MAX_BATCH),
});

// POST /api/notebooks/[id]/items — um item, ou vários em `items` (lote)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notebookId } = await params;
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const { user, supabase } = auth;

    const body = await request.json();

    const { data: notebook, error: notebookError } = await supabase
      .from('study_notebooks')
      .select('id')
      .eq('id', notebookId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (notebookError) throw notebookError;
    if (!notebook) return NextResponse.json({ error: 'Caderno não encontrado' }, { status: 404 });

    const { data: lastItem, error: lastItemError } = await supabase
      .from('study_notebook_items')
      .select('position')
      .eq('notebook_id', notebookId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastItemError) throw lastItemError;

    let nextPosition = lastItem ? lastItem.position + 1 : 0;

    if (Array.isArray(body?.items) && body.items.length > 0) {
      const parsed = batchBodySchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Lista inválida: máximo 1000 itens, todos com modulo_slug' },
          { status: 400 }
        );
      }

      const seen = new Set<string>();
      const rows: {
        notebook_id: string;
        modulo_slug: string;
        titulo_aula: string | null;
        topico: string | null;
        position: number;
      }[] = [];

      for (const it of parsed.data.items) {
        if (seen.has(it.modulo_slug)) continue;
        seen.add(it.modulo_slug);
        rows.push({
          notebook_id: notebookId,
          modulo_slug: it.modulo_slug,
          titulo_aula: it.titulo_aula ?? null,
          topico: it.topico ?? null,
          position: nextPosition,
        });
        nextPosition += 1;
      }

      if (rows.length === 0) {
        return NextResponse.json({ error: 'Nenhum item após deduplicação' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('study_notebook_items')
        .insert(rows)
        .select('id, modulo_slug, titulo_aula, topico, position, added_at');

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json(
            { error: 'Uma ou mais questões já estavam no caderno' },
            { status: 409 }
          );
        }
        throw error;
      }

      void invalidateNotebookActivationCache(user.id);

      return NextResponse.json({ items: data ?? [] }, { status: 201 });
    }

    const { modulo_slug, titulo_aula, topico } = body;

    if (!modulo_slug) {
      return NextResponse.json({ error: 'modulo_slug obrigatório' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('study_notebook_items')
      .insert({
        notebook_id: notebookId,
        modulo_slug,
        titulo_aula: titulo_aula || null,
        topico: topico || null,
        position: nextPosition,
      })
      .select('id, modulo_slug, titulo_aula, topico, position, added_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Questão já está no caderno' }, { status: 409 });
      }
      throw error;
    }

    void invalidateNotebookActivationCache(user.id);

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/notebooks/[id]/items failed', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
