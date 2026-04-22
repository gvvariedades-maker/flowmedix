import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';

// GET /api/notebooks — lista todos os cadernos do usuário
export async function GET(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const { user, supabase } = auth;

    const { data, error } = await supabase
      .from('study_notebooks')
      .select('id, title, description, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const ids = (data || []).map(n => n.id);
    let countMap: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: counts } = await supabase
        .from('study_notebook_items')
        .select('notebook_id')
        .in('notebook_id', ids);
      (counts || []).forEach(c => {
        countMap[c.notebook_id] = (countMap[c.notebook_id] || 0) + 1;
      });
    }

    const notebooks = (data || []).map(n => ({
      ...n,
      itemCount: countMap[n.id] || 0,
    }));

    return NextResponse.json({ notebooks });
  } catch (error) {
    logger.error('GET /api/notebooks failed', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST /api/notebooks — cria novo caderno
export async function POST(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const { user, supabase } = auth;

    const body = await request.json();
    const { title, description } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('study_notebooks')
      .insert({ user_id: user.id, title: title.trim(), description: description?.trim() || null })
      .select('id, title, description, created_at, updated_at')
      .single();

    if (error) throw error;

    return NextResponse.json({ notebook: data }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/notebooks failed', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
