import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('📥 API RECEBEU:', body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const title = body.title || body.flow_title;
    const content = body.conteudo_json || body.content;
    const modulo_id = body.modulo_id;

    if (!title || !modulo_id || !content) {
      console.error('❌ ERRO: Campos obrigatórios faltando', { title, modulo_id, temConteudo: !!content });
      return NextResponse.json({ error: 'Título, Módulo ou Conteúdo ausentes' }, { status: 400 });
    }

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
      console.error('❌ ERRO SUPABASE:', dbError);
      return NextResponse.json(
        {
          error: dbError.message,
          details: dbError.details,
          hint: dbError.hint,
        },
        { status: 400 }
      );
    }

    console.log('✅ SUCESSO AO SALVAR!');
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('💥 ERRO CRÍTICO NA API:', err);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}

