import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import FluxogramaViewClient from './fluxograma-view-client';

export const dynamic = 'force-dynamic';

export default async function FluxogramaPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
      },
    }
  );

  const { data: assunto } = await supabase
    .from('assuntos')
    .select('*, modulos(nome)')
    .eq('id', params.id)
    .single();

  if (!assunto) return notFound();

  return <FluxogramaViewClient assunto={assunto} />;
}