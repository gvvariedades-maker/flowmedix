import type { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getPackDefinition } from '@/lib/cadernos/packs';
import { invalidateNotebookActivationCache } from '@/lib/cache';
import { isAdminSessionEmail } from '@/lib/constants';
import { resolveAccessibleModulosWhenEmpty } from '@/lib/concursos/resolveCatalogWhenEmpty';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { NotebookFromPackSchema } from '@/lib/validations';

type PackItemRow = {
  modulo_slug: string;
  titulo_aula: string | null;
  topico: string | null;
};

function dedupeAccessibleItems(
  items: { modulo_slug: string; titulo_aula?: string | null; topico?: string | null }[],
  accessibleSlugs: Set<string>,
): PackItemRow[] {
  const seen = new Set<string>();
  const out: PackItemRow[] = [];
  for (const it of items) {
    if (!accessibleSlugs.has(it.modulo_slug)) continue;
    if (seen.has(it.modulo_slug)) continue;
    seen.add(it.modulo_slug);
    out.push({
      modulo_slug: it.modulo_slug,
      titulo_aula: it.titulo_aula ?? null,
      topico: it.topico ?? null,
    });
  }
  return out;
}

async function findExistingPackNotebook(
  supabase: SupabaseClient,
  userId: string,
  packId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('study_notebooks')
    .select('id')
    .eq('user_id', userId)
    .eq('source_pack_id', packId)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

/**
 * POST /api/notebooks/from-pack
 *
 * Clona um Caderno Pronto: cria `study_notebooks` com `source_pack_id` + items em lote.
 * Auth: Bearer + RLS (anon). Idempotente por (user_id, source_pack_id).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const { user, supabase } = auth;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
    }

    const parsed = NotebookFromPackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { pack_id, items, title } = parsed.data;

    if (!getPackDefinition(pack_id)) {
      return NextResponse.json({ error: 'Pack desconhecido' }, { status: 400 });
    }

    const existingId = await findExistingPackNotebook(supabase, user.id, pack_id);
    if (existingId) {
      return NextResponse.json({ notebookId: existingId, created: false }, { status: 200 });
    }

    const isAdmin = isAdminSessionEmail(user.email ?? null);
    const accessible = await resolveAccessibleModulosWhenEmpty(user.id, isAdmin);
    const accessibleSlugs = new Set(accessible.map((m) => m.modulo_slug));
    const allowedItems = dedupeAccessibleItems(items, accessibleSlugs);

    if (allowedItems.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma questão acessível neste pack' },
        { status: 400 },
      );
    }

    const { data: notebook, error: insertNotebookError } = await supabase
      .from('study_notebooks')
      .insert({
        user_id: user.id,
        title,
        source_pack_id: pack_id,
      })
      .select('id')
      .single();

    if (insertNotebookError) {
      if (insertNotebookError.code === '23505') {
        const racedId = await findExistingPackNotebook(supabase, user.id, pack_id);
        if (racedId) {
          return NextResponse.json({ notebookId: racedId, created: false }, { status: 200 });
        }
      }
      throw insertNotebookError;
    }

    if (!notebook?.id) {
      throw new Error('Insert notebook sem id');
    }

    const rows = allowedItems.map((it, index) => ({
      notebook_id: notebook.id,
      modulo_slug: it.modulo_slug,
      titulo_aula: it.titulo_aula,
      topico: it.topico,
      position: index,
    }));

    const { error: insertItemsError } = await supabase.from('study_notebook_items').insert(rows);

    if (insertItemsError) {
      // Evita caderno órfão sem itens após falha do lote.
      await supabase.from('study_notebooks').delete().eq('id', notebook.id).eq('user_id', user.id);
      throw insertItemsError;
    }

    void invalidateNotebookActivationCache(user.id);

    return NextResponse.json(
      {
        notebookId: notebook.id,
        entrySlug: allowedItems[0]!.modulo_slug,
        created: true,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error('POST /api/notebooks/from-pack failed', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
